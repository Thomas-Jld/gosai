import threading
import time

class Application(threading.Thread):
    """Template class for applications"""

    def __init__(self, name, hal, server):
        threading.Thread.__init__(self)
        self.name = name
        self.hal = hal
        self.server = server

        self.requires = {"pose": ["projected_data"]}

        self.data = {}

        @self.server.sio.on(f"update_{self.name}")
        def _send_data(*_) -> None:
            """Sends data to the client upon request"""
            self.server.send_data(self.name, self.data)

    def listener(self, source, event):
        """Gets notified when some data of a driver is updated"""
        if source not in self.requires:
            self.hal.log(f"{self.name}: not subscrbed to {source}")
            return
        if event not in self.requires[source]:
            self.hal.log(f"{self.name}: not subscrbed to {event} from {source}")
            return
        # Write your code here

        if source == "pose" and event == "projected_data":
            self.data = (self.hal.drivers["pose"].projected_data)

    def run(self):
        """Thread that runs the application"""

    def __str__(self):
        return str(self.name)
