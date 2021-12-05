import threading

class Application(threading.Thread):
    """Template class for applications"""

    def __init__(self, name, hal, server):
        threading.Thread.__init__(self)
        self.name = name
        self.hal = hal
        self.server = server

        self.requires = [] # Select what driver you want to use

        self.data = {} # data that is sent to the js script

        self.started = False

        @self.server.sio.on(f"update_{self.name}")
        def _send_data(*_) -> None:
            """Sends data to the client upon request"""
            pass

    def listener(self, source, event):
        """Gets notified when some data of a driver is updated"""
        if source not in self.requires:
            self.hal.log(f"{self.name}: subscribed to an unrequested event.")
            return
        if event not in self.requires[source]:
            self.hal.log(f"{self.name}: not subscrbed to {event} from {source}")
            return

        # Write your code here (what to do when the data is recieved)

    def stop(self):
        """Stops the application"""
        self.started = False

    def run(self):
        """Thread that runs the application"""
        self.started = True
        pass

    def __str__(self):
        return str(self.name)
