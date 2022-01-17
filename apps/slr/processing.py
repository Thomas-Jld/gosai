from apps.application import BaseApplication


class Application(BaseApplication):
    """SLR"""

    def __init__(self, name, hal, server, manager):
        super().__init__(name, hal, server, manager)
        # self.requires = {"pose": ["mirrored_data"]}


    def listener(self, source, event, data):
        super().listener(source, event, data)

        # if self.started and source == "pose" and event == "mirrored_data":
        #     self.data = self.hal.drivers["pose"].mirrored_data
        #     self.server.send_data(self.name, self.data)
