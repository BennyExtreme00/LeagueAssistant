from ..utility import getProcessesByNames

from .ReadyCheck import ReadyCheck
from .ChampSelect import ChampSelect
from .InProgress import InProgress

from PyQt5 import QtCore



class PhaseHandler(QtCore.QObject):
    updateSignal = QtCore.pyqtSignal()

    def __init__(self, server):
        super(self.__class__, self).__init__()
        self.server = server

        self.currentPhase = "None"

        self.handlingPhases = [
            ReadyCheck,
            ChampSelect,
            InProgress,
        ]

        self.handlers = {cls.__name__:cls(self) for cls in self.handlingPhases}

        self.loopThread = None
        self.updateSignal.connect(self._update)



    def _update(self):
        with self.server.test_client() as client:
            phase = None
            try: phaseRequest = client.get("/riot/lcu/0/lol-gameflow/v1/gameflow-phase").get_json(force=True)
            except: phaseRequest = {"success": False}
            if(not phaseRequest["success"]): return
            else: phase = str(phaseRequest["response"])
            if(not isinstance(phase, str)): return
            if(phase != self.currentPhase):
                for handler in self.handlers.values(): handler.reset()
                self.currentPhase = phase
            # print(f"Handling phase: {self.currentPhase} {self.currentPhase in self.handlers}")
            if(self.currentPhase in self.handlers): self.handlers[self.currentPhase].update()

    def update(self):
        if not getProcessesByNames([
            "LeagueClientUx.exe", 
            "League of Legends.exe"
        ]): return 
        self.updateSignal.emit()