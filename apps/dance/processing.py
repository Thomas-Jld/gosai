from apps.application import BaseApplication
from tools.binary_conversions import bytes_to_dict

class Application(BaseApplication):
    """Dance"""

    def __init__(self, name, hal, server, manager):
        super().__init__(name, hal, server, manager)
        self.requires["pose_to_mirror"] = ["mirrored_data"]

    def listener(self, source, event):
        super().listener(source, event)

        if source == "pose_to_mirror" and event == "mirrored_data":
            self.data = bytes_to_dict(self.hal.get_driver_event_data("pose_to_mirror", "mirrored_data"))
            self.server.send_data(self.name, self.data["body_pose"])
