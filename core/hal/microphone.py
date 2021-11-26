# Microphone driver

import os
import sys

import speech_recognition as sr

CURR_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(CURR_DIR)

from driver import BaseDriver


class Microphone(BaseDriver):
    """Driver to listen to the microphone"""

    def __init__(self, name, parent):
        super().__init__(name, parent)

        self.recognizer = sr.Recognizer()
        self.source = sr.Microphone()

        self.commands = {
            "listen": None
        }


    def execute(self, command, arguments = ""):
        super().execute(command, arguments)

        if command == "listen":
            return self.listen()
        else:
            self.log(f"Unknown command: {command}")
            return -1


    def listen(self):
        """Listens to the microphone and returns the text"""
        with self.source as source:
            self.recognizer.adjust_for_ambient_noise(source)
            self.recognizer.pause_threshold = 1
            self.log("Speak!")
            audio_data = self.recognizer.listen(source)
        return audio_data
