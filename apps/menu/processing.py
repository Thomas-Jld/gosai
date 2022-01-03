from apps.application import BaseApplication


class Application(BaseApplication):
    """Menu"""

    def __init__(self, name, hal, server, manager):
        super().__init__(name, hal, server, manager)
        self.requires = {"pose": ["mirrored_data"]}

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

        if self.started and source == "pose" and event == "mirrored_data":
            self.data = self.hal.drivers["pose"].mirrored_data
            self.server.send_data(self.name, self.data)
