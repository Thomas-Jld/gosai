export const slr = new  p5(( sketch ) => {
    sketch.name = "slr"
    sketch.z_index = 0
    sketch.activated = false

    sketch.set = (width, height, socket) => {
        sketch.selfCanvas = sketch.createCanvas(width, height).position(0, 0).style("z-index", sketch.z_index);

        socket.on(sketch.name, (data) => {

        });

        sketch.activated = true;
    }

    sketch.resume = () => {};

    sketch.pause = () => {};

    sketch.update = () => {}

    sketch.show = () => {
        sketch.clear();
    }
});
