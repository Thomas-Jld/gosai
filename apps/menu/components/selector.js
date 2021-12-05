export const Selector = (sketch) => {

    sketch.cursor = [0, 0];

    sketch.rotation = 0;
    sketch.sliding = 0;

    let description = `This is the alpha version of an interractive mirror. Place yourself at about 1m50 for a better experience. Use your left hand to display the menu.`

    let icons = ["info.svg", "play.svg", "settings.svg"];

    sketch.set = (p1, p2, w, h) => {
        sketch.width = w;
        sketch.height = h;
        sketch.x = p1;
        sketch.y = p2;
        sketch.selfCanvas = sketch.createCanvas(sketch.width, sketch.height).position(sketch.x, sketch.y);

        sketch.angleMode(RADIANS);
        sketch.textAlign(CENTER, CENTER);
        sketch.textStyle(BOLD);

        sketch.imageMode(CENTER);

        let demo_dance = new SelectBar("Dance", 300, 75);
        let demo_slr = new SelectBar("S.L.R", 300, 75);
        let bubble_demo = new Bubble("play.svg", 150);

        bubble_demo.add(demo_dance, 1);
        bubble_demo.add(demo_slr, 2);


        let description_panel = new InfoPanel(description, 300, 300);
        let bubble_description = new Bubble("info.svg", 150);

        bubble_description.add(description_panel, 2);


        let settings_clock = new SelectBar("Show Clock", 300, 75);
        let settings_face = new SelectBar("Show Face", 300, 75);
        let settings_pose = new SelectBar("Show Pose", 300, 75);
        let settings_hands = new SelectBar("Show Hands", 300, 75);
        let bubble_panel = new Bubble("settings.svg", 150);

        bubble_panel.add(settings_clock, 1);
        bubble_panel.add(settings_face, 2);
        bubble_panel.add(settings_pose, 3);
        bubble_panel.add(settings_hands, 4);


        sketch.menu = new Menu(sketch.x, sketch.y, 150);
        sketch.menu.add(demo_bubble, 1);
        sketch.menu.add(description_bubble, 2);
        sketch.menu.add(settings_bubble, 3);


        sketch.activated = true;
    };


    sketch.show = () => {
        sketch.clear();
        sketch.push();
        sketch.menu.show();
        sketch.menu.update(sketch.mx, sketch.my);
        sketch.pop();
    };


    class Menu {
        constructor(x, y, d) {
            this.x = x;
            this.y = y;
            this.d = d;

            this.slots = [-2 * this.d, -this.d, 0, this.d, 2 * this.d];
            this.bubbles = [];
        }

        add(element, slot) {
            element.x = this.x;
            element.y = this.y;
            element.d = this.d;
            element.slide = this.slots[slot];
            element.parent = this;
            this.bubbles.push(element);
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

        update(x, y) {
            for (let i = 0; i < this.bubbles.length; i++) {
                this.bubbles[i].update(x, y);
            }
        }

        show() {
            for (let i = 0; i < this.bubbles.length; i++) {
                this.bubbles[i].show();
            }
        }
    }

    class Bubble {
        constructor(icon, d) {
            this.icon = sketch.loadImage("/core/display/components/icons/" + icon);
            this.d = d;


            this.x = 0;
            this.y = 0;
            this.yoffset = 0;
            this.parent = undefined;
            // this.angle = angle;


            this.rx = 0;
            this.ry = 0;
            this.r = this.d / 2;
            this.per = 0;
            this.mul = 0.92;
            this.c = 0;
            this.selected = false;

            this.slots = [
                - this.d * 3 / 2,
                - this.d * 3 / 4,
                0,
                this.d * 3 / 4,
                this.d * 3 / 2,
                2 * this.d
            ];

            this.bars = [];
        }

        add(element, slot) {
            element.x = this.rx;
            element.y = this.ry;
            element.yoffset = this.slots[slot];
            element.parent = this;
            this.bars.push(element);
        }

        show() {
            sketch.stroke(255);
            sketch.strokeWeight(6);
            if (this.selected) {
                sketch.fill(255, 129, 0);
            } else {
                sketch.fill(100, 0.7);
            }
            if (this.per > 0.1) {
                sketch.ellipse(this.rx, this.ry, this.r * this.per);
                sketch.image(this.icon, this.rx, this.ry, this.r * this.per * 1/2, this.r * this.per * 1/2);
            }
            if (this.selected) {
                for (let i = 0; i < this.bars.length; i++) {
                    this.bars[i].show();
                }
            }
        }

        update(x, y) {
            this.x = lerp(this.x, x, 0.6);
            this.y = lerp(this.y, y, 0.6);
            this.rx = this.x + this.per * this.d / 2;
            this.ry = this.y + this.per * this.yoffset - sketch.sliding;
            if (!sketch.display_bubbles) {
                this.per *= this.mul;
            } else {
                if (this.per < 1) {
                    this.per += 0.04;
                } else {
                    if (!this.selected && sketch.dist(this.rx,
                            this.ry, sketch.cursor[0], sketch.cursor[1]) < this.r) {

                        this.c += 1;

                        sketch.stroke(255);
                        sketch.strokeWeight(4);
                        sketch.noFill();
                        //console.log(this.c);
                        sketch.arc(this.rx, this.ry,
                            2 * this.r, 2 * this.r,
                            0, 2 * Math.PI * this.c / 40);

                        if (this.c >= 40) {
                            this.parent.unselect();
                            //sketch.sliding = this.slide;
                            this.selected = true;

                            if (typeof (this.name) !== "object") {
                                choseAction(this.name);
                            }
                        }
                    } else {
                        this.c = 0;
                    }
                }
            }
            if (this.selected) {
                for (let i = 0; i < this.bars.length; i++) {
                    this.bars[i].update(this.rx, this.ry);
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
            this.parent = undefined;


            this.hidden = true;
            this.selected = true;

            this.c = 0;

            this.per = 0;
            this.mul = 0.92;
            this.selection_time = 40;
        }


        show() {
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
                    sketch.triangle(this.rx, this.ry - this.per * this.h / 3,
                                    this.rx, this.ry + this.per * this.h / 3,
                                    this.rx - 1.7 * this.per * this.h / 3, this.ry);
                }
            }
        }


        update(x, y) {
            this.x = x;
            this.y = y;
            this.rx = this.x + 3 * this.per * this.d / 2;
            this.ry = this.y + this.per * this.yoffset - sketch.sliding;

            if ((!this.parent.selected && this.hidden) || !sketch.display_bubbles) {
                this.per *= this.mul;
            } else {
                if (this.per < 1) {
                    this.per += 0.1;
                    if(this.per > 1){
                        this.per = 1;
                    }
                } else {
                    if (sketch.cursor[0] > this.rx - this.h / 4 && sketch.cursor[0] < this.rx + this.w + this.h / 4 &&
                        sketch.cursor[1] > this.ry - 3 * this.h / 4 && sketch.cursor[1] < this.ry + 3 * this.h / 4) {

                        this.c += 1;

                        sketch.stroke(255);
                        sketch.strokeWeight(4);

                        sketch.noFill();
                        //console.log(this.c);
                        if (this.c < this.selection_time / 20) {
                            sketch.line(this.rx + this.w + this.h / 4, this.ry,
                                this.rx + this.w + this.h / 4, this.ry - 3 * this.h / 4 * this.c / (this.selection_time / 20));
                        } else if (this.c < 9 * this.selection_time / 20) {
                            sketch.line(this.rx + this.w + this.h / 4, this.ry,
                                this.rx + this.w + this.h / 4, this.ry - 3 * this.h / 4);
                            sketch.line(this.rx + this.w + this.h / 4, this.ry - 3 * this.h / 4,
                                this.rx + this.w + this.h / 4 - (this.w + this.h / 2) * (this.c - this.selection_time / 20) / (8 * this.selection_time / 20), this.ry - 3 * this.h / 4);

                        } else if (this.c < 11 * this.selection_time / 20) {
                            sketch.line(this.rx + this.w + this.h / 4, this.ry,
                                this.rx + this.w + this.h / 4, this.ry - 3 * this.h / 4);
                            sketch.line(this.rx + this.w + this.h / 4, this.ry - 3 * this.h / 4,
                                this.rx - this.h / 4, this.ry - 3 * this.h / 4);
                            sketch.line(this.rx - this.h / 4, this.ry - 3 * this.h / 4,
                                this.rx - this.h / 4, this.ry - 3 * this.h / 4 + 3 * this.h / 4 * (this.c - 9 * this.selection_time / 20) / (2 * this.selection_time / 20));

                        } else if (this.c < 19 * this.selection_time / 20) {
                            sketch.line(this.rx + this.w + this.h / 4, this.ry,
                                this.rx + this.w + this.h / 4, this.ry - 3 * this.h / 4);
                            sketch.line(this.rx + this.w + this.h / 4, this.ry - 3 * this.h / 4,
                                this.rx - this.h / 4, this.ry - 3 * this.h / 4);
                            sketch.line(this.rx - this.h / 4, this.ry - 3 * this.h / 4,
                                this.rx - this.h / 4, this.ry + 3 * this.h / 4);
                            sketch.line(this.rx - this.h / 4, this.ry + 3 * this.h / 4,
                                this.rx - this.h / 4 + (this.w + this.h / 2) * (this.c - 11 * this.selection_time / 20) / (8 * this.selection_time / 20), this.ry + 3 * this.h / 4);

                        } else if (this.c < this.selection_time) {
                            sketch.line(this.rx + this.w + this.h / 4, this.ry,
                                this.rx + this.w + this.h / 4, this.ry - 3 * this.h / 4);
                            sketch.line(this.rx + this.w + this.h / 4, this.ry - 3 * this.h / 4,
                                this.rx - this.h / 4, this.ry - 3 * this.h / 4);
                            sketch.line(this.rx - this.h / 4, this.ry - 3 * this.h / 4,
                                this.rx - this.h / 4, this.ry + 3 * this.h / 4);
                            sketch.line(this.rx - this.h / 4, this.ry + 3 * this.h / 4,
                                this.rx + this.w + this.h / 4, this.ry + 3 * this.h / 4);
                            sketch.line(this.rx + this.w + this.h / 4, this.ry + 3 * this.h / 4,
                                this.rx + this.w + this.h / 4, this.ry + 3 * this.h / 4 - 3 * this.h / 4 * (this.c - 19 * this.selection_time / 20) / (this.selection_time / 20));
                        } else if (this.c == this.selection_time) {
                            // this.parent.unselect();
                            //sketch.sliding = this.slide;
                            this.selected = !this.selected;
                            choseAction(this.choice, this.selected);
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
            this.offset = 0;
            this.parent = undefined;
            this.size = 25;

            this.per = 0; // To animate the display when showing / hidding
            this.mul = 0.92;
        }

        show() {
            if(this.parent.selected && this.per > 0.5){
                sketch.stroke(255);
                sketch.strokeWeight(4);
                sketch.noFill();
                sketch.rect(
                    this.x + this.offset,
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
                    this.x + this.offset + this.w * 0.05,
                    this.y - 0.45 * this.h,
                    this.w * 0.9,
                    this.h * 0.9
                );
            }
        }

        update(x, y) {
            this.x = x;
            this.y = y;
            // this.rx = this.x + this.per * this.offset;
            // this.ry = this.y;

            if (!this.parent.selected || !sketch.display_bubbles) {
                this.per *= this.mul;
            } else {
                this.per = 1;
            }
        }
    }
}
