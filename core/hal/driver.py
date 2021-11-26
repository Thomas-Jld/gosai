# Base driver template

import threading


class BaseDriver(threading.Thread):
    """Base class for all drivers"""

    def __init__(self, name, parent):
        threading.Thread.__init__(self)
        self.name = name
        self.parent = parent
        self.commands = {}
        self.registered = {"all": []}

    def execute(self, command, arguments):
        """Executes a command with the given arguments"""

        self.log(f"Executing command '{command}' with arguments '{arguments}'")

    def run(self):
        """What runs when the thread is started"""

        self.log("Driver running")

    def register(self, app, event="all"):
        """Registers an application instance to a driver's event"""

        self.log(f"Registering application '{app}' to '{event}'")
        if event in self.registered:
            self.registered[event].append(app)
        else:
            self.registered[event] = [app]

    def notify(self, event):
        """Notify every registered app of an event"""

        if event in self.registered:
            for app in self.registered[event]:
                app.listener(self.name, event)
        else:
            self.log(f"Tried to notify for an unknown event '{event}'")

    def log(self, message, level=0):
        """Save logs. TODO: Temporary file"""

        print(f"{self.name}: {message}")
