# Hardware Abstraction Layer

import os
import sys
import threading
import time

CURR_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(CURR_DIR)


class HardwareAbstractionLayer:
    """Main interface to access the drivers"""
    def __init__(self):

        self.available_drivers = [
            f.path.split("/")[-1] for f in os.scandir(f"{CURR_DIR}/drivers") if f.is_dir() and f.path.split("/")[-1] != "__pycache__"
        ]

        self.drivers = {}

        for driver_name in self.available_drivers:
            driver = __import__(
                f"drivers.{driver_name}.{driver_name}", fromlist=[None]
            ).Driver(driver_name, self)
            self.drivers[driver_name] = driver

    def load_driver(self, driver_name):
        if driver_name not in self.available_drivers:
            self.log(f"{driver_name} is not a valid driver")
            return False

        self.drivers[driver_name] = self.drivers[driver_name].load()
        return True

    def get_started(self) -> str:
        """Returns a list of drivers that are started"""
        started_drivers = []
        for driver_name, driver in self.drivers.items():
            if driver.started:
                started_drivers.append(driver_name)
        return ", ".join(started_drivers)

    def get_stopped(self) -> str:
        """Returns a list of drivers that are stopped"""
        stopped_drivers = []
        for driver_name, driver in self.drivers.items():
            if not driver.started:
                stopped_drivers.append(driver_name)
        return ", ".join(stopped_drivers)

    def get_drivers(self) -> str:
        """Returns a list of available drivers"""
        return ", ".join(self.available_drivers)

    def log(self, message):
        """
        Logs every things (for now in the console)
        TODO: create a temporary log file
        """
        print(message)

        with open("hal.log", "a+") as log:
            log.write(f"{message}\n")
