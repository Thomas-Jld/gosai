import { Face } from "./components/face.js"
import { Hand } from "./components/hand.js"
import { Body } from "./components/body.js"
// import { Selector } from "./components/selector.js"

export const menu = new p5(( sketch ) => {
    sketch.name = "menu"
    sketch.activated = false

    const face = new Face("face")
    const body = new Body("body")
    const right_hand = new Hand("right_hand")
    const left_hand = new Hand("left_hand")
    // const selector = new Selector()

    sketch.set = (width, height, socket) => {
        sketch.selfCanvas = sketch.createCanvas(width, height).position(0, 0);

        socket.on(sketch.name, (data) => {

            face.update_data(data["face_mesh"])
            body.update_data(data["body_pose"])
            right_hand.update_data(data["right_hand_pose"])
            left_hand.update_data(data["left_hand_pose"])
            // selector.update_data(hands)
        });

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
    }

    sketch.show = () => {
        sketch.clear();
        face.show(sketch);
        body.show(sketch);
        right_hand.show(sketch);
        left_hand.show(sketch);
    }
});


// let modules = [];
// let objectsSelected = false;

// let pose;
// let hands;
// let face;
// let selector;
// let clock;
// // let pikachu;
// // let pikachu_model;
// let dance;

// let socket;
// let canvas;

// let started = false;

// let xoffset = -260; // millimeters
// let yoffset = 70;

// let screenwidth = 392.85; //millimeters
// let screenheight = 698.4;

// let global_data = {};
// let recieved = false;

// let scenarios;
// let scenario = "main";

// // let available = true;

// // function preload(){
// //     pikachu_model = loadModel("components/models/pikachu.obj");
// // }

// function setup() {
//     canvas = createCanvas(windowWidth, windowHeight);

//     frameRate(40);

//     setTimeout(reshape, 1000);

//     socket = io.connect('http://0.0.0.0:5000', {
//         cors: {
//           origin: "http://0.0.0.0:5000",
//           methods: ["GET", "POST"]
//         },
//         transports: ["websocket"]
//       });

//     socket.emit("update_menu", true);
//     socket.on("ok", (data) => {
//         console.log("ok");
//     });
//     socket.on("menu", (data) => {
//         recieved = true;
//         for (let key in data) {
//             global_data[key] = data[key];
//           }
//     });

//     scenarios = {
//         "intro": {
//             "init": intro_sc_init,
//             "loop": intro_sc,
//             "end": intro_sc_end
//         },
//         "main": {
//             "init": main_sc_init,
//             "loop": main_sc,
//             "end": main_sc_end
//         }
//     };

//     scenarios[scenario].init();
// }

// function draw() {
//     scenarios[scenario].loop();
// }

// // function selection(){
// //     if (hands.left_hand.hand_pose_t[8] !== undefined &&
// //         hands.left_hand.hand_pose_t[5] !== undefined &&
// //         hands.right_hand.hand_pose_t[8] !== undefined) {
// //         if (
// //             hands.left_hand.hand_pose_t[8][0] - hands.left_hand.hand_pose_t[5][0] > 80 && (
// //             dance.dance.init === undefined || !dance.dance.init)
// //             ){
// //             selector.display_bubbles = true;
// //         }
// //         else{
// //             selector.display_bubbles = false;
// //         }
// //         selector.mx = hands.left_hand.hand_pose_t[8][0];
// //         selector.my = hands.left_hand.hand_pose_t[8][1];
// //         selector.cursor = hands.right_hand.hand_pose_t[8];

// //     }
// // }

// function selection(){
//     if (hands.left_hand.hand_pose_t[8] !== undefined &&
//         hands.right_hand.hand_pose_t[8] !== undefined &&
//         "left_hand_sign" in global_data) {
//         if (global_data["left_hand_sign"][0] == "OK" && global_data["left_hand_sign"][1] > 0.8 && !dance.dance.init)
//         {
//             selector.display_bubbles = true;
//         }
//         else{
//             selector.display_bubbles = false;
//         }
//         selector.mx = hands.left_hand.hand_pose_t[8][0];
//         selector.my = hands.left_hand.hand_pose_t[8][1];
//         selector.cursor = hands.right_hand.hand_pose_t[8];

//     }
// }


// function reshape() {
//     resizeCanvas(windowWidth, windowHeight);

//     dance = new p5(Dance); // Draw first to draw the rest over it.
//     dance.set(0, 0, width, height);
//     modules.push(dance);

//     clock = new p5(Clock);
//     clock.set(width - 200, 0, 200, 200);
//     modules.push(clock);

//     pose = new p5(Pose);
//     pose.set(0, 0, width, height);
//     modules.push(pose);

//     hands = new p5(Hands);
//     hands.set(0, 0, width, height);
//     modules.push(hands);

//     face = new p5(Faces);
//     face.set(0, 0, width, height);
//     modules.push(face);

//     selector = new p5(Selector);
//     selector.set(0, 0, width, height);
//     modules.push(selector);

//     started = true;
// }

// function choseAction(socketopt, action){
//     switch (opt){
//         case "Show Clock":
//             if(action){
//                 clock.activated = true;
//                 clock.selfCanvas.show();
//             }
//             else{
//                 clock.activated = false;
//                 clock.selfCanvas.hide();
//             }
//             break;

//         case "Show Face":
//             if(action){
//                 face.activated = true;
//                 face.selfCanvas.show();
//             }
//             else{
//                 face.activated = false;
//                 face.selfCanvas.hide();
//             }
//             break;

//         case "Show Pose":
//             if(action){
//                 // pose.activated = true;
//                 pose.show_body_lines = true;
//                 pose.selfCanvas.show();
//             }
//             else{
//                 // pose.activated = false;
//                 pose.show_body_lines = false;
//                 pose.selfCanvas.hide();
//             }
//             break;

//         case "Show Hands":
//             if (action) hands.selfCanvas.show();
//             else hands.selfCanvas.hide();
//             break;

//         case  "Dance":
//             if(action){
//                 dance.activated = false;
//                 dance.selfCanvas.clear();
//                 dance.dance.reset();
//             }
//             else{
//                 dance.activated = true;
//             }
//             break;

//         case  "S.L.R":
//             socket.emit("slr", true);
//             break;

//     }
// }

// function keyPressed() {
//     switch(key){
//         case "c":
//             modules.forEach(m => {
//                 m.clearSketch();
//             });
//             break;

//         case "p":
//             modules.forEach(m => {
//                 m.activated = false;
//                 m.selfCanvas.hide();
//             });
//             pose.activated = true;
//             pose.selfCanvas.show();
//             break;

//         case "h":
//             modules.forEach(m => {
//                 m.activated = false;
//                 m.selfCanvas.hide();
//             });
//             hands.activated = true;
//             hands.selfCanvas.show();
//             break;

//         case "f":
//             modules.forEach(m => {
//                 m.activated = false;
//                 m.selfCanvas.hide();
//             });
//             face.activated = true;
//             face.selfCanvas.show();
//             break;

//         case "b":
//             modules.forEach(m => {
//                 m.activated = false;
//                 m.selfCanvas.hide();
//             });
//             pose.activated = true;
//             pose.selfCanvas.show();
//             hands.activated = true;
//             hands.selfCanvas.show();
//             break;

//         case "s":
//             modules.forEach(m => {
//                 m.activated = false;
//                 m.selfCanvas.hide();
//             });
//             hands.activated = true;
//             selector.activated = true;
//             selector.selfCanvas.show();
//             break;

//         case "a":
//             modules.forEach(m => {
//                 m.activated = true;
//                 m.selfCanvas.show();
//             });
//             break;
//     }
// }
