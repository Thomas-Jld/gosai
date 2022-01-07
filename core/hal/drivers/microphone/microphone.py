# Microphone driver

import ctypes
import os
import sys

import pyaudio
import speech_recognition as sr

from core.hal.drivers.driver import BaseDriver


class Driver(BaseDriver):
    """Driver to listen to the microphone"""

    def __init__(self, name, parent):
        super().__init__(name, parent)

        # ----------Disable pyaudio warnings----------
        ERROR_HANDLER_FUNC = ctypes.CFUNCTYPE(
            None,
            ctypes.c_char_p,
            ctypes.c_int,
            ctypes.c_char_p,
            ctypes.c_int,
            ctypes.c_char_p
        )

        def py_error_handler(filename, line, function, err, fmt):
            pass

        c_error_handler = ERROR_HANDLER_FUNC(py_error_handler)
        try:
            asound = ctypes.cdll.LoadLibrary('libasound.so')
            asound.snd_lib_error_set_handler(c_error_handler)
        except:
            try:
                asound = ctypes.cdll.LoadLibrary('libasound.so.2')
                asound.snd_lib_error_set_handler(c_error_handler)
            except:
                pass
        # ----------------------------------------------


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
