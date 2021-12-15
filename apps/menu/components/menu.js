export class Menu {
    constructor(x, y, d, sketch) {
        this.x = x;
        this.y = y;
        this.d = d;
        this.sketch = sketch;

        this.anchor = [0, 0];
        this.cursor = [0, 0];

        this.left_hand = undefined;
        this.right_hand = undefined;

        this.slots = [-2 * this.d, -this.d, 0, this.d, 2 * this.d];
        this.bubbles = [];

        this.display_bubbles = false;

        let bubble_demo = new Bubble("play.svg", 150);
        let bubble_description = new Bubble("info.svg", 150);
        let bubble_settings = new Bubble("settings.svg", 150);

        this.add(bubble_demo, 1);
        this.add(bubble_description, 2);
        this.add(bubble_settings, 3);

        let description = `This is the alpha version of an interractive mirror. Place yourself at about 1m50 for a better experience. Use your left hand to display the menu.`
        let description_panel = new InfoPanel(description, 300, 300);

        bubble_description.add(description_panel, 0);

        let settings_face = new SelectBar("Show Face", 300, 75);
        let settings_pose = new SelectBar("Show Pose", 300, 75);
        let settings_hands = new SelectBar("Show Hands", 300, 75);

        bubble_settings.add(settings_face, 1);
        bubble_settings.add(settings_pose, 0);
        bubble_settings.add(settings_hands, 2);


    }

    add(element, slot) {
        element.x = this.x;
        element.y = this.y;
        element.d = this.d;
        element.yoffset = this.slots[slot];
        element.parent = this;
        this.bubbles.push(element);
    }

    add_application(bubble_id, name, started) {
        this.bubbles[bubble_id].add_application(name, started);
    }

    unselect() {
        for (let i = 0; i < this.bubbles.length; i++) {
            if (this.bubbles[i].selected) {
                this.bubbles[i].selected = false;
                for (let j = 0; j < this.bubbles[i].bars.length; j++) {
                    this.bubbles[i].bars[j].per = 0;
                }
            }
        }
    }

    update_data(left_hand, right_hand) {
        this.left_hand = left_hand;
        this.right_hand = right_hand;
    }

    update() {
        if (
            this.left_hand !== undefined &&
            this.right_hand !== undefined &&
            this.left_hand.transposed_hand_pose[8] !== undefined &&
            this.right_hand.transposed_hand_pose[8] !== undefined) {
            if (
                this.left_hand.sign[0] == "OPEN_HAND" && this.left_hand.sign[1] > 0.8
            ) {
                this.display_bubbles = true;
            } else {
                this.display_bubbles = false;
            }
            this.anchor = this.left_hand.transposed_hand_pose[8];
            this.cursor = this.right_hand.transposed_hand_pose[8];
        }

        for (let i = 0; i < this.bubbles.length; i++) {
            this.bubbles[i].update(this.anchor, this.cursor);
        }
    }

    show(sketch) {
        sketch.push();
        for (let i = 0; i < this.bubbles.length; i++) {
            this.bubbles[i].show(sketch);
        }
        sketch.pop();
    }
}

class Bubble {
    constructor(icon, d) {
        this.icon = loadImage("/apps/menu/components/icons/" + icon);
        this.d = d;

        this.x = 0;
        this.y = 0;
        this.yoffset = 0;
        this.parent = undefined;

        this.rx = 0;
        this.ry = 0;
        this.r = this.d / 2;
        this.per = 0;
        this.mul = 0.92;
        this.c = 0;
        this.selected = false;

        this.slots = [
            0,
            -this.d * 3 / 4,
            this.d * 3 / 4,
            this.d * 3 / 2,
            -this.d * 3 / 2,
            2 * this.d
        ];

        this.bars = [];
    }

    add(element, slot) {
        element.x = this.rx;
        element.y = this.ry;
        element.yoffset = this.slots[slot]; // Children offset
        element.ypoffset = this.yoffset; // This offset
        element.parent = this;
        this.bars.push(element);
    }

    add_application(name, started) {
        let demo_app = new SelectBar(name, 300, 75);
        this.add(demo_app, this.bars.length);
        demo_app.type = "application";
        demo_app.selected = started;
    }

    show(sketch) {
        sketch.stroke(255);
        sketch.strokeWeight(6);
        if (this.selected) {
            sketch.fill(255, 129, 0);
        } else {
            sketch.fill(100, 0.7);
        }
        if (this.per > 0.1) {
            sketch.ellipse(this.rx, this.ry, this.r * this.per);
            sketch.image(this.icon, this.rx, this.ry, this.r * this.per * 1 / 2, this.r * this.per * 1 / 2);
        }
        if (this.selected) {
            for (let i = 0; i < this.bars.length; i++) {
                this.bars[i].show(sketch);
            }
        }
        if (this.parent.display_bubbles && !this.selected && dist(this.rx, this.ry, this.parent.cursor[0], this.parent.cursor[1]) < this.r) {
            sketch.stroke(255);
            sketch.strokeWeight(4);
            sketch.noFill();
            sketch.arc(this.rx, this.ry,
                2 * this.r, 2 * this.r,
                0, 2 * Math.PI * this.c / 40);
        }
    }

    update(anchor, cursor) {
        this.x = lerp(this.x, anchor[0], 0.4);
        this.y = lerp(this.y, anchor[1], 0.4);
        this.rx = this.x + this.per * this.d / 2;
        this.ry = this.y + this.per * this.yoffset;
        if (!this.parent.display_bubbles) {
            this.per *= this.mul;
        } else {
            if (this.per < 1) {
                this.per += 0.04;
            } else {
                if (!this.selected && dist(this.rx,
                        this.ry, cursor[0], cursor[1]) < this.r) {

                    this.c += 1;

                    if (this.c >= 40) {
                        this.parent.unselect();
                        this.selected = true;

                        if (typeof (this.name) !== "object") {
                            chooseAction(this.name, this.selected, "bubble", this.parent.sketch);
                        }
                    }
                } else {
                    this.c = 0;
                }
            }
        }
        if (this.selected) {
            for (let i = 0; i < this.bars.length; i++) {
                this.bars[i].update(anchor, cursor);
            }
        }
    }

    unselect() {
        for (let i = 0; i < this.bars.length; i++) {
            this.bars[i].selected = false;
        }
    }
}

class SelectBar {
    constructor(choice, w, h) {
        this.choice = choice;
        this.w = w;
        this.h = h;

        this.x = 0;
        this.y = 0;
        this.yoffset = 0;
        this.ypoffset = 0; // Parent offset
        this.parent = undefined;
        this.type = "settings";

        this.hidden = true;
        this.selected = true;

        this.c = 0;

        this.per = 0;
        this.mul = 0.92;
        this.selection_time = 40;

        this.sketch;
    }


    show(sketch) {
        this.sketch = sketch;
        if ((this.parent.selected || !this.hidden) && this.per > 0.1) {
            sketch.stroke(255);
            sketch.strokeWeight(2);
            sketch.fill(0);
            sketch.rect(this.rx, this.ry - this.h / 2 * this.per, this.w * this.per, this.h * this.per);
            if (this.selected) {
                sketch.fill(255, 129, 0);
                sketch.stroke(255, 129, 0);
            } else {
                sketch.fill(255);
                sketch.stroke(255);
            }
            sketch.noStroke();
            sketch.textSize(this.per * this.h / 2);
            sketch.text(this.choice, this.rx + this.per * this.w / 2, this.ry);
            if (this.yoffset == 0) {
                sketch.fill(255);
                sketch.stroke(255);
                sketch.triangle(
                    this.rx, this.ry - this.per * this.h / 3,
                    this.rx, this.ry + this.per * this.h / 3,
                    this.rx - 1.7 * this.per * this.h / 3, this.ry);
            }
        }
    }


    update(anchor, cursor) {
        this.x = anchor[0];
        this.y = anchor[1];
        this.rx = this.x + 3 * this.per * 75;
        this.ry = this.y + this.per * (this.yoffset + this.ypoffset);

        if (
            (!this.parent.selected && this.hidden) ||
            !this.parent.parent.display_bubbles
        ) {
            this.per *= this.mul;
        } else {
            if (this.per < 1) {
                this.per += 0.1;
                if (this.per > 1) {
                    this.per = 1;
                }
            } else {
                if (cursor[0] > this.rx - this.h / 4 && cursor[0] < this.rx + this.w + this.h / 4 &&
                    cursor[1] > this.ry - 3 * this.h / 4 && cursor[1] < this.ry + 3 * this.h / 4) {

                    this.c += 1;

                    this.sketch.stroke(255);
                    this.sketch.strokeWeight(4);

                    this.sketch.noFill();
                    //console.log(this.c);
                    if (this.c < this.selection_time / 20) {
                        this.sketch.line(this.rx + this.w + this.h / 4, this.ry,
                            this.rx + this.w + this.h / 4, this.ry - 3 * this.h / 4 * this.c / (this.selection_time / 20));
                    } else if (this.c < 9 * this.selection_time / 20) {
                        this.sketch.line(this.rx + this.w + this.h / 4, this.ry,
                            this.rx + this.w + this.h / 4, this.ry - 3 * this.h / 4);
                        this.sketch.line(this.rx + this.w + this.h / 4, this.ry - 3 * this.h / 4,
                            this.rx + this.w + this.h / 4 - (this.w + this.h / 2) * (this.c - this.selection_time / 20) / (8 * this.selection_time / 20), this.ry - 3 * this.h / 4);

                    } else if (this.c < 11 * this.selection_time / 20) {
                        this.sketch.line(this.rx + this.w + this.h / 4, this.ry,
                            this.rx + this.w + this.h / 4, this.ry - 3 * this.h / 4);
                        this.sketch.line(this.rx + this.w + this.h / 4, this.ry - 3 * this.h / 4,
                            this.rx - this.h / 4, this.ry - 3 * this.h / 4);
                        this.sketch.line(this.rx - this.h / 4, this.ry - 3 * this.h / 4,
                            this.rx - this.h / 4, this.ry - 3 * this.h / 4 + 3 * this.h / 4 * (this.c - 9 * this.selection_time / 20) / (2 * this.selection_time / 20));

                    } else if (this.c < 19 * this.selection_time / 20) {
                        this.sketch.line(this.rx + this.w + this.h / 4, this.ry,
                            this.rx + this.w + this.h / 4, this.ry - 3 * this.h / 4);
                        this.sketch.line(this.rx + this.w + this.h / 4, this.ry - 3 * this.h / 4,
                            this.rx - this.h / 4, this.ry - 3 * this.h / 4);
                        this.sketch.line(this.rx - this.h / 4, this.ry - 3 * this.h / 4,
                            this.rx - this.h / 4, this.ry + 3 * this.h / 4);
                        this.sketch.line(this.rx - this.h / 4, this.ry + 3 * this.h / 4,
                            this.rx - this.h / 4 + (this.w + this.h / 2) * (this.c - 11 * this.selection_time / 20) / (8 * this.selection_time / 20), this.ry + 3 * this.h / 4);

                    } else if (this.c < this.selection_time) {
                        this.sketch.line(this.rx + this.w + this.h / 4, this.ry,
                            this.rx + this.w + this.h / 4, this.ry - 3 * this.h / 4);
                        this.sketch.line(this.rx + this.w + this.h / 4, this.ry - 3 * this.h / 4,
                            this.rx - this.h / 4, this.ry - 3 * this.h / 4);
                        this.sketch.line(this.rx - this.h / 4, this.ry - 3 * this.h / 4,
                            this.rx - this.h / 4, this.ry + 3 * this.h / 4);
                        this.sketch.line(this.rx - this.h / 4, this.ry + 3 * this.h / 4,
                            this.rx + this.w + this.h / 4, this.ry + 3 * this.h / 4);
                        this.sketch.line(this.rx + this.w + this.h / 4, this.ry + 3 * this.h / 4,
                            this.rx + this.w + this.h / 4, this.ry + 3 * this.h / 4 - 3 * this.h / 4 * (this.c - 19 * this.selection_time / 20) / (this.selection_time / 20));
                    } else if (this.c == this.selection_time) {
                        // this.parent.unselect();
                        this.selected = !this.selected;
                        chooseAction(this.choice, this.selected, this.type, this.parent.parent.sketch);
                    }
                } else {
                    this.c = 0;
                }
            }
        }
    }
}

class InfoPanel {
    constructor(content, w, h) {
        this.content = content;
        this.w = w;
        this.h = h;

        this.x = 0;
        this.y = 0;
        this.xoffset = 225;
        this.parent = undefined;
        this.size = 25;

        this.per = 0; // To animate the display when showing / hidding
        this.mul = 0.92;
    }

    show(sketch) {
        if (this.parent.selected && this.per > 0.5) {
            sketch.stroke(255);
            sketch.strokeWeight(4);
            sketch.noFill();
            sketch.rect(
                this.x + this.xoffset,
                this.y - this.h / 2,
                this.w,
                this.h
            );

            sketch.stroke(255);
            sketch.fill(255);
            sketch.strokeWeight(2);
            sketch.textSize(this.size);
            sketch.text(
                this.content,
                this.x + this.xoffset + this.w * 0.05,
                this.y - 0.45 * this.h,
                this.w * 0.9,
                this.h * 0.9
            );
        }
    }

    update(anchor) {
        this.x = anchor[0];
        this.y = anchor[1];
        // this.rx = this.x + this.per * this.offset;
        // this.ry = this.y;

        if (!this.parent.selected || !this.parent.parent.display_bubbles) {
            this.per *= this.mul;
        } else {
            this.per = 1;
        }
    }
}

function chooseAction(opt, action, type, sketch) {
    if(type == "application") {
        if (action) {
            sketch.emit("start_application", {
                application_name: opt
            });
        } else {
            sketch.emit("stop_application", {
                application_name: opt
            });
        }
    }
    // switch (opt){
    //     case "Show Clock":
    //         if(action){
    //             clock.activated = true;
    //             clock.selfCanvas.show();
    //         }
    //         else{
    //             clock.activated = false;
    //             clock.selfCanvas.hide();
    //         }
    //         break;

    //     case "Show Face":
    //         if(action){
    //             face.activated = true;
    //             face.selfCanvas.show();
    //         }
    //         else{
    //             face.activated = false;
    //             face.selfCanvas.hide();
    //         }
    //         break;

    //     case "Show Pose":
    //         if(action){
    //             // pose.activated = true;
    //             pose.show_body_lines = true;
    //             pose.selfCanvas.show();
    //         }
    //         else{
    //             // pose.activated = false;
    //             pose.show_body_lines = false;
    //             pose.selfCanvas.hide();
    //         }
    //         break;

    //     case "Show Hands":
    //         if (action) hands.selfCanvas.show();
    //         else hands.selfCanvas.hide();
    //         break;

    //     case  "Dance":
    //         if(action){
    //             dance.activated = false;
    //             dance.selfCanvas.clear();
    //             dance.dance.reset();
    //         }
    //         else{
    //             dance.activated = true;
    //         }
    //         break;

    //     case  "S.L.R":
    //         socket.emit("slr", true);
    //         break;

    // }
}
