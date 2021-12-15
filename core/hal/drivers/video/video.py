# Video driver

import os
import sys
import time

CURR_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(CURR_DIR)

from cameras import IntelCamera, StandardCamera
from ..driver import BaseDriver


class Driver(BaseDriver):
    """
    (Thread)
    * Reads frames using the source
    * and stores them into global variables. depth will be none if
    * the camera isn't the Intel D435
    """

    def __init__(
        self, name: str, parent, source = IntelCamera(640, 480), fps: int = 30
    ):  # TODO: Create Camera object and inherit the others from it
        super().__init__(name, parent)

        self.source = source
        self.fps = fps

        self.color = None
        self.registered["color"] = []  # No apps are subscribed to RGB frame initialy

        self.depth = None
        self.registered["depth"] = []

    def run(self):
        super().run()

        while 1:
            self.color, self.depth = self.source.next_frame()

            if self.color is not None:
                self.notify("color")
            if self.depth is not None:
                self.notify("depth")

            time.sleep(1 / self.fps)  # Runs faster to be sure to get the current frame

    def execute(self, command, arguments=""):
        super().execute(command, arguments)

        if command == "get":
            if arguments == "color":
                return self.color
            elif arguments == "depth":
                return self.depth
            else:
                self.log(f"Unknown argument: {arguments}")
                return -1
        else:
            self.log(f"Unknown command: {command}")
            return -1
