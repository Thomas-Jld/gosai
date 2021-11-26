let Template = ( sketch ) => {
    sketch.name = "template"

    sketch.setup = (width, height, socket) => {
        sketch.selfCanvas = sketch.createCanvas(width, height).position(0, 0);

        socket.on("template", (data) => {

        });
    }

    sketch.show = () => {
        sketch.clear();
    }
}
