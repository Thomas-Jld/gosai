function main_sc_init(){

}

function main_sc(){
    background(0);
    if (started) {
        modules.forEach(module => {
            if (module.activated) {
                if(module.to_update && global_data != {}){
                    module.update(global_data);
                }
                module.show();
            }
        });
        selection();
        if (recieved){
            socket.emit("update_menu", true);
            recieved = false;
        }
    }
}

function main_sc_end(){

}

function intro_sc_init(){

}

function intro_sc(){

}

function intro_sc_end(){

}
