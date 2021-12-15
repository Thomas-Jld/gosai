import { Face } from "./components/face.js"
import { Hand } from "./components/hand.js"
import { Body } from "./components/body.js"
import { Menu } from "./components/menu.js"

export const menu = new p5(( sketch ) => {
    sketch.name = "menu"
    sketch.activated = false

    let face;
    let body;
    let right_hand;
    let left_hand;
    let menu;

    sketch.set = (width, height, socket) => {

        face = new Face("face")
        body = new Body("body")
        right_hand = new Hand("right_hand")
        left_hand = new Hand("left_hand")
        menu = new Menu(0, 0, 150, sketch)

        sketch.selfCanvas = sketch.createCanvas(width, height).position(0, 0);

        sketch.angleMode(RADIANS);
        sketch.textAlign(CENTER, CENTER);
        sketch.textStyle(BOLD);
        sketch.imageMode(CENTER);

        socket.on(sketch.name, (data) => {
            face.update_data(data["face_mesh"])
            body.update_data(data["body_pose"])
            right_hand.update_data(data["right_hand_pose"], data["right_hand_sign"])
            left_hand.update_data(data["left_hand_pose"], data["left_hand_sign"])
            menu.update_data(left_hand, right_hand)
        });

        socket.on("list_applications", (data) => {
            for(let i = 0; i < data["started"].length; i++) {
                menu.add_application(0, data["started"][i], true)
            }

            for(let i = 0; i < data["stopped"].length; i++) {
                menu.add_application(0, data["stopped"][i], false)
            }

        });

        sketch.emit = (name, data) => {
            socket.emit(name, data);
        }

        sketch.activated = true
    }

    sketch.windowResized = () => {
        resizeCanvas(windowWidth, windowHeight);
    }

    sketch.update = () => {
        face.update();
        body.update();
        right_hand.update();
        left_hand.update();
        menu.update();
    }

    sketch.show = () => {
        sketch.clear();
        face.show(sketch);
        body.show(sketch);
        right_hand.show(sketch);
        left_hand.show(sketch);
        menu.show(sketch);
    }
});
