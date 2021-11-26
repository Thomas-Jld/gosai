# Hardware Abstraction Layer

import os
import sys
import threading

CURR_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(CURR_DIR)

from microphone import Microphone
from speaker import Speaker
from video import IntelCamera, Video
from pose import Pose


class HardwareAbstractionLayer:
    """Main interface to access the drivers"""
    def __init__(self):

        self.drivers = {
            "video": Video("video", self, IntelCamera(640, 480), fps=60),
            "speaker": Speaker("speaker", self, language="fr"),
            "microphone": Microphone("microphone", self),
            "pose": Pose("pose", self, max_fps=45),
        }

        for driver in self.drivers.values():
            driver.start()

    def log(self, message):
        """
        Logs every things (for now in the console)
        TODO: create a temporary log file
        """
        print(message)

    def console(self):
        def _console():
            print("\n\n")
            while 1:
                command = input(">>: ")
                print(command)

        threading.Thread(target=_console(), args=()).start()
