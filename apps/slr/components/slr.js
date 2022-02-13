export class Slr{
    constructor() {
        this.cyan = color(50,250,255);
        this.white = color(255,255,255);
        this.light_red = (240,75,55);
        this.dark_blue = (30,70,160);
        this.guessed_sign;
        this.probability;
        this.sentence = [];
        this.threshold = 0.9;
        
    }

    reset() {}

    update_data(guessed_sign, probability) {
        
        if (guessed_sign != undefined && probability != undefined) {
            this.guessed_sign = guessed_sign;
            this.probability = probability;
            if (this.probability > this.threshold && this.guessed_sign != "nothing" && this.guessed_sign != "empty") {
                if (this.sentence.length > 0) {
                    if (this.guessed_sign != this.sentence[this.sentence.length-1]) {
                        this.sentence.push(this.guessed_sign);
                    }
                }
                else {
                    this.sentence.push(this.guessed_sign);
                }
                    
            }
            if (this.sentence.length > 5) {
                this.sentence.shift();
            }
            
        }
    }

    show(sketch) {
        //Affichage de l'action détectée
        sketch.fill(this.dark_blue);
        sketch.noStroke();

        console.log("guessed sign", this.guessed_sign)
        if(this.guessed_sign != undefined)
        {
            sketch.rect(0,60,int(this.probability*this.guessed_sign.length *1.5),90);
        }
            
        sketch.textSize(32);
        sketch.fill(this.white);
        sketch.text(this.guessed_sign, 0, 85);

        //Affichage de l'action cible
        // fill(light_red);
        // noStroke();
        // rect(0,560,100,590);

        // textSize(32);
        // fill(white);
        // text(sign, 0, 585);

        //Affichage de la séquence
        sketch.fill(this.dark_blue);
        sketch.noStroke();
        sketch.rect(0, 0, 640, 40);

        sketch.textSize(32);
        sketch.fill(this.white);
        // text(this.sentence, 3, 30);
        sketch.text(this.sentence, 3, 30);
        
    }
    
    update() {
    }
}