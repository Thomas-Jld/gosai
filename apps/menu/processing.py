import threading


class Application(threading.Thread):
    """Menu"""

    def __init__(self, name, hal, server, manager):
        threading.Thread.__init__(self)
        self.name = name
        self.hal = hal
        self.server = server
        self.manager = manager

        self.requires = {"pose": ["projected_data"]}

        self.data = {}

        self.started = False

        @self.server.sio.on(f"started_{self.name}")
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
        """Gets notified when some data of a driver is updated"""
        if source not in self.requires:
            self.hal.log(f"{self.name}: not subscrbed to {source}")
            return
        if event not in self.requires[source]:
            self.hal.log(f"{self.name}: not subscrbed to {event} from {source}")
            return
        # Write your code here

        if self.started and source == "pose" and event == "projected_data":
            self.data = self.hal.drivers["pose"].projected_data
            self.server.send_data(self.name, self.data)

    def stop(self):
        """Stops the application"""
        self.started = False

    def run(self):
        """Thread that runs the application"""
        self.started = True

    def __str__(self):
        return str(self.name)
