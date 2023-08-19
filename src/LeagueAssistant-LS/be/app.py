from PyQt5.QtWidgets import QApplication

import threading
import waitress
import time
import sys
setattr(sys, "kwargs", {k:v for k,v in [arg.split("=") for arg in sys.argv if "=" in arg]})
sys.kwargs["--mode"] = sys.kwargs.get("--mode", "RELEASE").upper()

from ProjectUtility import ensureAdmin, LOCAL_HOST
from modules import Client


def run():
    print("kwargs:", sys.kwargs)

    app = QApplication([*sys.argv, "--ignore-gpu-blacklist"])

    server = Client.Server.Server()
    host = LOCAL_HOST
    port = int(sys.kwargs.get("--port", Client.Server.getRandomPort()))

    threading.Thread(target=waitress.serve, daemon=True, kwargs={
        "app": server,
        "host": host, 
        "port": port, 
        "threads": int(sys.kwargs.get("--threads", 8)), 
    }).start()

    browserWindow = Client.Renderer.BrowserWindow()
    browserWindow.show()
    browserWindow.connect(server, host, port)

    phaseHandler = Client.PhaseHandler.PhaseHandler(server)
    def loop():
        while not time.sleep(1): 
            phaseHandler.update()
    threading.Thread(target=loop, daemon=True).start()

    sys.exit(app.exec_())


if __name__ == "__main__" and ensureAdmin(): run()