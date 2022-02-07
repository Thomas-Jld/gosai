from apps.application import BaseApplication
from core.tools.binary_conversions import bytes_to_dict

class Application(BaseApplication):
    """SL TRAINING"""

    def __init__(self, name, hal, server, manager):
        super().__init__(name, hal, server, manager)
        self.requires["slr"] = ["new_sign"]


    def listener(self, source, event, data):
        super().listener(source, event, data)

        if self.started and source == "slr" and event == "new_sign":
            self.data = bytes_to_dict(data)
            if self.data is not None:
                self.data = {
                    "guessed_sign": self.data["guessed_sign"], 
                    "probability": self.data["probability"], 
                    "actions": self.data["actions"] 
                    #"targeted_sign": self.data["targeted_sign"]
                    #"isGessing": self.data["isGuessing"]
                }
                #print(self.data)
                self.server.send_data(self.name, self.data)
    