import { Guessing } from "./components/guessing.js"

export const slr_training = new  p5(( sketch ) => {
    sketch.name = "slr_training"
    sketch.z_index = 0
    sketch.activated = false
    

    sketch.set = (width, height, socket) => {
        sketch.selfCanvas = sketch.createCanvas(width, height).position(0, 0).style("z-index", sketch.z_index);

        sketch.slr_training = new Guessing(sketch)
        socket.on(sketch.name, (data) => {
            sketch.slr_training.update_data(
                data["guessed_sign"],
                data["probability"],
                data["actions"],
                
            )
            //console.log(data["guessed_sign"])
        });

        sketch.emit = (name, data) => {
            socket.emit(name, data);
        };
        
        sketch.activated = true;
    }
    
    sketch.resume = () => {
        sketch.slr_training.reset();
    };

    sketch.pause = () => {
        sketch.clear();
    };

    sketch.update = () => {
        sketch.slr_training.update()        
    }

    sketch.show = () => {
        if (!sketch.activated) return;
        sketch.clear();
        sketch.slr_training.show(sketch);
    }
});
