import os


class AppManager:
    """Manages the apps"""

    def __init__(self, hal, server):
        self.hal = hal
        self.server = server

        self.name = "app_manager"
        self.available_apps = [
            f.name
            for f in os.scandir("apps")
            if f.is_dir() and f.name != "__pycache__" and f.name != "template"
        ]
        self.started_apps = {}

        self.data = {}

        @self.server.sio.on("start_application")
        def _(data) -> None:
            self.start(data["application_name"])

        @self.server.sio.on("stop_application")
        def _(data) -> None:
            self.stop(data["application_name"])

    def list_applications(self) -> list:
        """Lists all available applications"""

        # self.hal.log(
        #     f"{self.name}: Available applications are {', '.join(self.available_apps)}"
        # )
        return self.available_apps

    def list_started_applications(self) -> list:
        """Lists all started applications"""

        return list(self.started_apps.keys())

    def list_stopped_applications(self) -> list:
        """Lists all stopped applications"""

        return [
            app_name
            for app_name in self.available_apps
            if app_name not in self.started_apps
        ]

    def start(self, app_name: str) -> None:
        """Starts an application"""

        if app_name in self.available_apps:
            try:
                # Import the python app
                app = __import__(
                    f"apps.{app_name}.processing", fromlist=[None]
                ).Application(app_name, self.hal, self.server, self)

                # Start the required drivers and subscribe to the required events
                for driver_name in app.requires:
                    if not self.hal.drivers[driver_name].started:
                        self.hal.drivers[driver_name].start()
                    for event in app.requires[driver_name]:
                        self.hal.drivers[driver_name].register(app, event)

                # Start the python app
                app.start()

                # Start the js app
                self.server.send_data(
                    "start_application", {"application_name": app_name}
                )

                # Store the app as a started app
                self.started_apps[app_name] = app
                self.hal.log(f"{self.name}: Started application '{app_name}'")

            except Exception as e:
                self.hal.log(
                    f"{self.name}: Failed to start application '{app_name}': {e}"
                )
        else:
            self.hal.log(f"{self.name}: Unknown application '{app_name}'")

    def stop(self, app_name: str) -> None:
        """Stops an application"""

        if app_name in self.available_apps:
            if app_name in self.started_apps:
                try:
                    # Stop the python app
                    self.started_apps[app_name].stop()

                    # Stop the js app
                    self.server.send_data(
                        "stop_application", {"application_name": app_name}
                    )

                    del self.started_apps[app_name]

                    self.hal.log(f"{self.name}: Stopped application '{app_name}'")
                except Exception as e:
                    self.hal.log(
                        f"{self.name}: Failed to stop application '{app_name}': {e}"
                    )
            else:
                self.hal.log(f"{self.name}: Application '{app_name}' not started")
        else:
            self.hal.log(f"{self.name}: Unknown application '{app_name}'")
