# Base driver template

import threading
import datetime


class BaseDriver(threading.Thread):
    """Base class for all drivers"""

    def __init__(self, name, parent):
        threading.Thread.__init__(self)
        self.name = name
        self.parent = parent
        self.commands = {}
        self.started = False
        self.registered = {"all": []}
        self.requires = []

    def execute(self, command, arguments):
        """Executes a command with the given arguments"""

        self.log(f"Executing command '{command}' with arguments '{arguments}'")

    def run(self):
        """Runs when the thread is started"""

        # Starts the required drivers
        for driver_name in self.requires:
            if driver_name not in self.parent.drivers:
                self.log(f"Driver '{driver_name}' is required but not loaded")
                return False
            else:
                self.parent.drivers[driver_name].start()
        self.log("Driver running")
        self.started = True

    def register(self, app, event="all"):
        """Registers an application instance to a driver's event"""

        self.log(f"Registering application '{app}' to '{event}'")
        if event in self.registered:
            self.registered[event].append(app)
        else:
            self.registered[event] = [app]

    def unregister(self, app, event="all"):
        """Unregisters an application instance from a driver's event"""

        if event in self.registered:
            self.log(f"Unregistering application '{app}' from '{event}'")
            self.registered[event].remove(app)

            # Checks if someone is still registered to this driver
            for event, apps in self.registered:
                if len(apps) > 0:
                    return True
            # self.stop()

        else:
            self.log(f"Tried to unregister from an unknown event '{event}'")

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

        with open(f"./core/hal/logs/{self.name}.log", "a+") as log:
            log.write(f"{datetime.datetime.now().strftime('%b-%d-%G-%I:%M:%S%p')} : {message}\n")
