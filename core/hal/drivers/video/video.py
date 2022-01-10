# Video driver

import os
import sys
import time

from core.hal.drivers.video.cameras import IntelCamera, StandardCamera
from core.hal.drivers.driver import BaseDriver


class Driver(BaseDriver):
    """
    (Thread)
    * Reads frames using the source
    * and stores them into global variables. depth will be none if
    * the camera isn't the Intel D435
    """

    def __init__(
        self, name: str, parent, fps: int = 30
    ):  # TODO: Create Camera object and inherit the others from it
        super().__init__(name, parent)

        # self.source = IntelCamera(640, 480)

        self.fps = fps

        self.create_event("color")
        self.create_event("depth")
        self.create_event("source")
        self.source = IntelCamera(640, 480)
        source_data = {
            "color_intrinsics": {
                "width": self.source.color_intrinsics.width,
                "height": self.source.color_intrinsics.height,
                "ppx": self.source.color_intrinsics.ppx,
                "ppy": self.source.color_intrinsics.ppy,
                "fx": self.source.color_intrinsics.fx,
                "fy": self.source.color_intrinsics.fy,
                "model": self.source.color_intrinsics.model,
                "coeffs": self.source.color_intrinsics.coeffs
            },
            "depth_intrinsics": {
                "width": self.source.depth_intrinsics.width,
                "height": self.source.depth_intrinsics.height,
                "ppx": self.source.depth_intrinsics.ppx,
                "ppy": self.source.depth_intrinsics.ppy,
                "fx": self.source.depth_intrinsics.fx,
                "fy": self.source.depth_intrinsics.fy,
                "model": self.source.depth_intrinsics.model,
                "coeffs": self.source.depth_intrinsics.coeffs
            },
            "width": self.source.width,
            "height": self.source.height
        }
        self.set_event_data("source", source_data)


    def pre_run(self):
        pass


    def loop(self):
        # print(self.source)
        color, depth = self.source.next_frame()

        if color is not None:
            self.set_event_data("color", color)
            # self.set_event_data("color", self.array_to_bytes(color))
        if depth is not None:
            self.set_event_data("depth", depth)
            # self.set_event_data("depth", self.array_to_bytes(depth))

        time.sleep(1 / self.fps)  # Runs faster to be sure to get the current frame


    def execute(self, command, arguments=""):
        super().execute(command, arguments)

        if command == "get":
            if arguments == "color":
                return self.color
            elif arguments == "depth":
                return self.depth
            else:
                self.log(f"Unknown argument: {arguments}", 3)
                return -1
        else:
            self.log(f"Unknown command: {command}", 3)
            return -1
