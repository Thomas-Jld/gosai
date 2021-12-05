export const template = ( sketch ) => {
    sketch.name = "template"

    sketch.setup = (width, height, socket) => {
        sketch.selfCanvas = sketch.createCanvas(width, height).position(0, 0);

        socket.on("template", (data) => {

        });
    }

    sketch.update = () => {}

    sketch.show = () => {
        sketch.clear();
    }
}
