# Base driver template

import datetime
import os
from queue import Queue
import threading
import time


class BaseDriver(threading.Thread):
    """Base class for all drivers"""

    def __init__(self, name, parent):
        threading.Thread.__init__(self)
        self.name = name
        self.parent = parent
        self.commands = {}
        self.started = False
        self.paused = False
        self.registered = {"all": []}
        self.requires = {}
        self.data = {}


    def execute(self, command, arguments):
        """Executes a command with the given arguments"""

        self.log(f"Executing command '{command}' with arguments '{arguments}'", 2)


    def run(self):
        """Runs when the thread is started"""

        # Starts the required drivers
        self.log("Driver running", 2)
        self.started = True

        while 1:
            if not self.paused:
                self.loop()
            else:
                time.sleep(0.5)

    def loop(self):
        """
        The main loop of the driver.
        Should be overwritten by the driver
        """
        time.sleep(0.5)


    def resume(self):
        """Resumes the driver"""

        self.log("Driver resumed", 2)

        for driver_name in self.requires:
            for event in self.requires[driver_name]:
                self.parent.register_to_driver(
                    driver_name, self, event
                )

        self.paused = False


    def stop(self):
        """Stops the driver"""

        self.log("Driver paused", 2)

        for driver_name in self.requires:
            for event in self.requires[driver_name]:
                self.parent.unregister_from_driver(
                    driver_name, self, event
                )

        self.paused = True


    def create_event(self, event) -> bool:
        """Adds an event to the driver"""
        if event in self.registered:
            self.log(f"Tried to add an already existing event '{event}'", 3)
            return False

        self.log(f"Creating event '{event}'", 2)
        self.registered[event] = []
        self.data[event] = Queue()
        return True


    def set_event_data(self, event, data):
        """Adds data to the driver and notifies the listeners"""

        if event not in self.data:
            self.log(f"Tried to add data for an unknown event '{event}'", 3)
            return False

        while not self.data[event].empty():
            self.data[event].get()

        self.data[event].put(data)
        self.data[event].task_done()
        self.notify(event)
        return True


    def get_event_data(self, event):
        """Returns the data of an event"""

        if event not in self.data:
            self.log(f"Tried to get data for an unknown event '{event}'", 3)
            return None

        data = self.data[event].get()
        self.data[event].put(data)
        self.data[event].task_done()
        return data


    def register_to_driver(self, driver_name, event):
        """
        Registers the driver to the event of another driver
        """
        if driver_name not in self.requires:
            self.requires[driver_name] = []
        self.requires[driver_name].append(event)
        self.parent.register_to_driver(driver_name, self, event)


    def register(self, entity, event="all"):
        """Registers an entity instance to a driver's event"""

        self.log(f"Registering entity '{entity}' to '{event}'", 2)
        if event in self.registered:
            self.registered[event].append(entity)
        else:
            self.registered[event] = [entity]


    def unregister(self, entity, event="all") -> bool:
        """Unregisters an application instance from a driver's event"""

        if event not in self.registered:
            self.log(f"{entity} tried to unregister from an unknown event '{event}'", 3)
            return False

        self.log(f"Unregistering entity '{entity}' from '{event}'", 2)
        self.registered[event].remove(entity)

        # Checks if someone is still registered to this driver
        for event in self.registered:
            if len(self.registered[event]) > 0:
                return True
        self.log(f"Pausing driver: no one is subscribed to it anymore", 2)
        self.stop()

        return True

    def notify(self, event) -> bool:
        """Notify every registered app of an event"""

        if event not in self.registered:
            self.log(f"Tried to notify for an unknown event '{event}'", 3)
            return False

        for app in self.registered[event]:
            threading.Thread(target=app.listener, args=(self.name, event)).start()

        return True


    def listener(self, source, event) -> bool:
        """
        Gets notified when some data (named "event")
        of a driver ("source") is updated
        """
        if source not in self.requires:
            self.log(f"subscribed to an unrequested event.", 3)
            return False
        if event not in self.requires[source]:
            self.log(f"not subscrbed to {event} from {source}", 3)
            return False


    def log(self, message, level=1):
        """Save logs. TODO: Temporary file"""

        if level >= int(os.environ["LOG_LEVEL"]):
            print(f"{self.name}: {message}")

        with open(f"core/hal/logs/{self.name}.log", "a+") as log:
            log.write(f"{datetime.datetime.now().strftime('%b-%d-%G-%I:%M:%S%p')} : {message}\n")


    def __str__(self):
        return str(self.name)
