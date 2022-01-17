# Pose to mirror Driver

import time

import core.hal.drivers.pose_to_mirror.utils.mirror as mi
from core.hal.drivers.driver import BaseDriver
from tools.binary_conversions import dict_to_bytes, bytes_to_dict


class Driver(BaseDriver):
    """
    Translate the pose from world coordinates to screen coordinates
    """

    def __init__(self, name: str, parent, max_fps: int = 45):
        super().__init__(name, parent)

        self.register_to_driver("pose", "projected_data")
        self.create_event("mirrored_data")

        self.mirrored_data = {}  # Keep for interpolation

        self.debug_time = False
        self.fps = max_fps

    def loop(self):
        """Main loop"""
        start_t = time.time()

        projected_data = bytes_to_dict(
            self.parent.get_driver_event_data("pose", "projected_data")
        )

        if projected_data is not None:
            self.mirrored_data = mi.mirror_data(projected_data, self.mirrored_data)
            self.set_event_data("mirrored_data", dict_to_bytes(self.mirrored_data))
        else:
            self.log("No pose data", 1)

        end_t = time.time()

        if self.debug_time:
            self.log(f"Total time: {(end_t - start_t)*1000}ms")
            self.log(f"FPS: {int(1/(end_t - start_t))}")

        dt = max((1 / self.fps) - (end_t - start_t), 0.0001)

        time.sleep(dt)
