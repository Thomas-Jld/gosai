from apps.application import BaseApplication
from tools.binary_conversions import bytes_to_dict


class Application(BaseApplication):
    """Menu"""

    def __init__(self, name, hal, server, manager):
        super().__init__(name, hal, server, manager)
        self.requires = {"pose_to_mirror": ["mirrored_data"]}

        @self.server.sio.on(f"started_menu")
        def _send_data(*_) -> None:
            """Sends data to the client upon request"""
            self.server.send_data(
                "list_applications",
                {
                    "started": self.manager.list_started_applications(),
                    "stopped": self.manager.list_stopped_applications(),
                },
            )

    def listener(self, source, event):
        super().listener(source, event)

        if source == "pose_to_mirror" and event == "mirrored_data":
            self.data = bytes_to_dict(self.hal.get_driver_event_data("pose_to_mirror", "mirrored_data"))
            # print(self.data)
            self.server.send_data(self.name, self.data)
