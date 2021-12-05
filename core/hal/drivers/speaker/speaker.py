# Speaker driver

import os
import sys
import threading
from time import sleep

import pyglet
from gtts import gTTS

CURR_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(CURR_DIR)

from ..driver import BaseDriver


class Driver(BaseDriver):
    """
    Speaker Driver to:
    - Generate and play audio based on text
    - Play audio
    """
    def __init__(self, name: str, parent, language: str = "fr"):
        super().__init__(name, parent)
        self.language = language


    def execute(self, command, arguments = ""):
        super().execute(command, arguments)
        if command == "respond":
            return self.respond(arguments)
        elif command == "play":
            return self.play(arguments)
        else:
            self.log(f"Unknown command: {command}")
            return -1


    def respond(self, text: str):
        """Generates and play an audio file based on text"""

        def _respond(self, text: str):
            tts = gTTS(text=text, lang=self.language)
            filename = "/tmp/temp.mp3"
            tts.save(filename)
            speech = pyglet.media.load(filename, streaming=False)
            speech.play()

            self.log(f"Saying: {text}")

            sleep(speech.duration)
            os.remove(filename)

        threading.Thread(target=_respond, args=(self, text,)).start()


    def play(self, filename: str):
        """Plays an audio file"""

        def _play(self, filename: str):
            speech = pyglet.media.load(filename, streaming=False)
            speech.play()

            self.log(f"Playing: {filename}")

            sleep(speech.duration)

        threading.Thread(target=_play, args=(self, filename,)).start()
