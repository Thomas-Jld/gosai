import threading
import time

class Console(threading.Thread):
    """ A console to interract with the OS """
    def __init__(self, hal, server, app_manager):
        threading.Thread.__init__(self)
        self.hal = hal
        self.server = server
        self.app_manager = app_manager

    def run(self):
        time.sleep(1)
        print("")
        while 1:
            print("")
            command = input(">>: ")
            execute = command.split(" ")[0]
            arguments = command.split(" ")[1:]

            if execute == "exit":
                exit()
            elif execute == "help":
                print("Available commands:")
                print("exit - exit the application")
                print("help - show this help")
                print("ls - list all available drivers")
                print("restart - restart an app")
                print("start - start an app")
                print("stop - stop an app")
                print("status - show the status of an app")
                print("ps - displays informations of the drivers")

            elif execute == "list":
                print("Available applications:")
                for app_name in self.app_manager.list_applications():
                    print(app_name)

            elif execute == "start":
                if len(arguments) == 0:
                    print("Please specify an application to start")
                else:
                    self.app_manager.start(arguments[0])

            elif execute == "stop":
                if len(arguments) == 0:
                    print("Please specify an application to stop")
                else:
                    self.app_manager.stop(arguments[0])

            elif execute == "restart":
                if len(arguments) == 0:
                    print("Please specify an application to restart")
                elif len(arguments) == 1:
                    self.app_manager.stop(arguments[0])
                    self.app_manager.start(arguments[0])

            elif execute == "exit":
                exit()

            elif execute == "ls":
                if len(arguments) == 1 and arguments[0] == "drivers":
                    print("\n".join(self.hal.get_drivers()))

                if len(arguments) == 2 and arguments[0] == "drivers" and arguments[1] == "started":
                    print("\n".join(self.hal.get_started_drivers()))

                if len(arguments) == 2 and arguments[0] == "drivers" and arguments[1] == "stopped":
                    print("\n".join(self.hal.get_stopped_drivers()))

            else:
                print("Unknown command")
