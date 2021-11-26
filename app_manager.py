import os


class AppManager:
    """Manages the apps"""

    def __init__(self, hal, server):
        self.hal = hal
        self.server = server

        self.name = "app_manager"
        self.available_apps = [
            f.path.split("/")[-1] for f in os.scandir("apps") if f.is_dir()
        ]
        self.started_apps = {}


    def list_applications(self):
        self.hal.log(
            f"{self.name}: Available applications are {', '.join(self.available_apps)}"
        )


    def start(self, app_name: str):
        if app_name in self.available_apps:
            app = __import__(
                f"apps.{app_name}.processing", fromlist=[None]
            ).Application("menu", self.hal, self.server)

            for driver_name in app.requires:
                for event in app.requires[driver_name]:
                    self.hal.drivers[driver_name].register(app, event)

            app.start()
            self.started_apps[app_name] = app
            self.hal.log(f"{self.name}: Started application '{app_name}'")
        else:
            self.hal.log(f"{self.name}: Unknown application '{app_name}'")

    def stop(self, app_name: str):
        if app_name in self.started_apps:
            pass
        else:
            self.hal.log(f"{self.name}: Application '{app_name}' not started")
