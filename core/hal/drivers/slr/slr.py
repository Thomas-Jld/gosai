# Pose estimation Driver

import os
import sys
import time
import numpy as np
import core.hal.drivers.slr.utils.get_sign as gs
from core.hal.drivers.driver import BaseDriver
from core.tools.binary_conversions import dict_to_bytes, bytes_to_dict

class Driver(BaseDriver):
    """Sign Language Recognition driver"""

    def __init__(self, name: str, parent):
        super().__init__(name, parent)

        self.register_to_driver("pose", "raw_data")
        self.create_event("new_sign")

        self.SLR_ACTIONS = [
            "nothing",
            "empty",
            "hello",
            "thanks",
            "iloveyou",
            "what's up",
            "hey",
            "my",
            "name",
            "nice",
            "to meet you",
        ]

        self.model = gs.init()
        self.frames = []
        self.fps = 20

    

    def loop(self):
        start_t = time.time()

        frame = bytes_to_dict(self.parent.get_driver_event_data("pose", "raw_data"))
        
        if frame is not None:

            if len(self.frames) < 30:
                self.frames.append(gs.adapt_data(frame))

            elif len(self.frames) == 30:
                print(np.array(frame).shape)
                
                self.frames.append(gs.adapt_data(frame))
                self.frames = self.frames[-30:]
                guessed_sign, probability = gs.get_sign(self.model, self.frames, self.SLR_ACTIONS)
                self.set_event_data(
                    "new_sign", dict_to_bytes({"guessed_sign": guessed_sign, "probability": probability, "actions": self.SLR_ACTIONS})
                )
                #(sign," ", probability)

        end_t = time.time()

        dt = max((1 / self.fps) - (end_t - start_t), 0.0001)

        time.sleep(dt)