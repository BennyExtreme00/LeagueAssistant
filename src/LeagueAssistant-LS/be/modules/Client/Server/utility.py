from ProjectUtility import LOCAL_HOST

from .DDRAGON import Ddragon
from .CDRAGON import Cdragon
from .STORAGE import Storage
from .CONFIG import Config
from .OPGG import Opgg
from .RIOT import Riot
from .APP import App
from .UI import Ui
from .AD import Ad

from flask import Flask
import socket


def getRandomPort():
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.bind((LOCAL_HOST, 0))
    port = sock.getsockname()[1]
    sock.close()
    return port


class Server(Flask):
    def __init__(self):
        super(self.__class__, self).__init__(__name__)
        self.config["SECRET_KEY"] = "ThisIsNotSnakeCaseWhichShouldBeUsedInPython"

        self.appControls = {}

        self.blueprints["ddragon"] = Ddragon
        self.register_blueprint(Ddragon, url_prefix="/ddragon")

        self.blueprints["cdragon"] = Cdragon
        self.register_blueprint(Cdragon, url_prefix="/cdragon")

        self.blueprints["storage"] = Storage
        self.register_blueprint(Storage, url_prefix="/storage")

        self.blueprints["config"] = Config
        self.register_blueprint(Config, url_prefix="/config")

        self.blueprints["opgg"] = Opgg
        self.register_blueprint(Opgg, url_prefix="/opgg")

        self.blueprints["riot"] = Riot
        self.register_blueprint(Riot, url_prefix="/riot")

        self.blueprints["app"] = App
        self.register_blueprint(App, url_prefix="/app")

        self.blueprints["ui"] = Ui
        self.register_blueprint(Ui, url_prefix="/ui")

        self.blueprints["ad"] = Ad
        self.register_blueprint(Ad, url_prefix="/ad")


    def registerAppControl(self, name, func):
        if(name in self.blueprints["app"].control_functions):
            self.blueprints["app"].control_functions[name].append(func)
        else: self.blueprints["app"].control_functions[name] = [func, ]