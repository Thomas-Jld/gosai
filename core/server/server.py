import logging
import os
import sys

from http.server import HTTPServer, SimpleHTTPRequestHandler
import threading

import eventlet
import socketio


logging.getLogger("socketio").setLevel(logging.ERROR)
logging.getLogger("engineio").setLevel(logging.ERROR)
logging.getLogger("eventlet").setLevel(logging.ERROR)


class quietServer(SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass


def start_chrome():
    def _start_chrome():
        os.system(
            "chromium http://127.0.0.1:8000/core/display --start-fullscreen --incognito --disable-logging &> /dev/null"
        )

    threading.Thread(target=_start_chrome, args=()).start()


class Server:
    def __init__(self):
        self.sio = socketio.Server(
            logger=False, cors_allowed_origins="*"
        )  # Creates the socketio server

        self.app = socketio.WSGIApp(self.sio)

        self.data = []

    def start(self, socket_port=5000, server_port=8000):
        """Starts the server on the given port"""

        def _start_socket(self, port):
            eventlet.wsgi.server(
                eventlet.listen(("", port)), self.app, log_output=False
            )

        def _start_server(self, port):
            server_address = ("0.0.0.0", port)
            self.httpd = HTTPServer(server_address, quietServer)
            self.httpd.serve_forever()

        threading.Thread(target=_start_socket, args=(self, socket_port)).start()
        threading.Thread(target=_start_server, args=(self, server_port)).start()

    def send_data(self, name, data):
        """Send data to all connected clients"""
        self.sio.emit(name, data)
