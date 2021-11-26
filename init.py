
import os

from core.hal.hal import HardwareAbstractionLayer
from core.server.server import Server, start_chrome
from app_manager import AppManager

hal = HardwareAbstractionLayer()
server = Server()
server.start()

app_manager = AppManager(hal, server)
app_manager.list_applications()
app_manager.start("menu")

start_chrome()

hal.console()
