from apps.application import BaseApplication


class Application(BaseApplication):
    """SLR"""

    def __init__(self, name, hal, server, manager):
        super().__init__(name, hal, server, manager)

        # * Example
        # self.requires = {"name of the driver": ["data"]}


    def listener(self, source, event):
        super().listener(source, event)

        # * Example
        # if self.started and source == "a_driver" and event == "some_data":
        #     self.data = self.hal.drivers["a_driver"].some_data
        #     self.server.send_data(self.name, self.data)
