export class Guessing {

    constructor() {
        this.cyan = color(50, 250, 255);
        this.white = color(255, 255, 255);
        this.red = color(240, 0, 0);
        this.dark_blue = (30, 70, 160);
        this.actions;
        this.guessed_sign = "empty";
        this.targeted_sign = "hello";
        this.targeted_sign_idx = 2;
        this.probability;
        this.sentence = [];
        this.threshold = 0.9;
        this.playing = false;
        this.playable = true;
        this.start_playing = 0;
        this.running = true;
        this.count_valid = 0;
    }



    playTuto() {
        // this.gif_sign = createImg("/apps/slr_training/components/videos/" + this.targeted_sign + ".webm");
        this.playable = false;
        this.playing = true;
        this.targeted_sign = this.actions[this.targeted_sign_idx]
        this.video = createVideo(["/apps/slr_training/components/videos/" + this.targeted_sign + ".webm"]);
        this.video.autoplay();
        this.video.volume(0);
        this.video.size(550, 350);
        this.video.position(1000, 50); //1500, 50
        this.video.play();
        // this.video.play();
        // console.log(this.video);
        this.guessed_sign = "empty";
        this.start_playing = Date.now();
    }

    update_data(guessed_sign, probability, actions) {
        if (actions != undefined) {
            this.actions = actions
        }
        // console.log("Playable : ",this.playable," , playing: ", this.playing);


        if (this.video != undefined) {
            // on rejoue la vidéo toutes les 10 secondes si l'utilisateur ne trouve pas le mot
            if (Date.now() - this.start_playing > 15000) {
                this.video.hide();
                this.playTuto();
                return;
            }


            if (this.video.elt.ended) {
                this.playing = false;
                this.targeted_sign = "nothing"
            }

            //lancement de la vidéo si l'utilisateur fait le bon signe
            if (this.video.elt.ended && this.playable) {
                // console.log("Play "+ this.targeted_sign);
                this.video.hide();
                this.playTuto();
                return;
            }
        }
        else {
            this.playTuto()
            return;
        }

        if (guessed_sign != undefined && probability != undefined && !this.playing) {
            this.guessed_sign = guessed_sign;
            this.targeted_sign = this.actions[this.targeted_sign_idx];
            this.probability = probability;

            if (this.probability > this.threshold && this.guessed_sign != "nothing" && this.guessed_sign != "empty") {
                if (this.sentence.length > 0) {
                    if (this.guessed_sign != this.sentence[this.sentence.length - 1]) {
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

        if (this.guessed_sign == this.targeted_sign) {
            this.count_valid += 1;
            //console.log("validated"); 
            
        }
        else {
            this.count_valid = 0;
        }

        if (this.count_valid >=10) {

            this.targeted_sign_idx++;
            if (this.targeted_sign_idx < this.actions.length) {
                if (!this.playing) {
                    this.playable = true;
                }
            }
            this.count_valid = 0;
        }

        if (this.targeted_sign_idx >= this.actions.length) {
            this.running = false;
        }
    }

    show(sketch) {
        //Affichage de l'action détectée
        sketch.fill(this.dark_blue);
        sketch.noStroke();
        if (this.guessed_sign != undefined) {
            sketch.rect(0, 60, int(this.probability * this.guessed_sign.length * 20), 40);
        }


        sketch.textSize(32);
        sketch.fill(this.white);
        sketch.text(this.guessed_sign, 0, 85);

        //affichage du targeted_sign
        sketch.fill(this.red);
        sketch.noStroke();
        sketch.rect(0, 120, 150, 40);

        sketch.textSize(32);
        sketch.fill(this.white);
        sketch.text(this.targeted_sign, 0, 145);

        //Affichage de la séquence
        sketch.fill(this.dark_blue);
        sketch.noStroke();
        sketch.rect(0, 0, 740, 40);

        sketch.textSize(32);
        sketch.fill(this.white);
        // text(this.sentence, 3, 30);
        sketch.text(this.sentence, 3, 30);

        sketch.text(this.playable, 0, 185);

        sketch.text(this.playing, 0, 225);

        sketch.text(this.count_valid, 0, 265);

        if (!this.running) {
            console.log("STOP APPLICATION");
            this.video.hide();
            sketch.emit("stop_application", {
                application_name: "slr_training"
            });
        }
    }

    reset() {
        self.video.show();
    }

    update() {
    }
}