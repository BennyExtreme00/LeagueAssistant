from flask import Blueprint, request
import json

from .LeagueClientAPI import LeagueClientAPI
from .LiveClientAPI import LiveClientAPI


Riot = Blueprint("Riot", __name__)


@Riot.route("/lcu", methods=["GET"])
def Riot_Lcu_Status():
    return json.dumps(LeagueClientAPI.isRiotAuthValid(maxRetries=1))

@Riot.route("/lcu/<int:authId>/<path:route>", methods=["GET", "POST", "DELETE", "PATCH"])
def Riot_Lcu(**kwargs):
    authId = kwargs["authId"]
    route = kwargs["route"]
    if(request.method == "GET"):
        args = request.args.to_dict()
        return LeagueClientAPI.get(authId, route, args)
    elif(request.method == "POST"):
        try: data = request.get_json(force=True)
        except: data = None
        if(not data): data = None
        return LeagueClientAPI.post(authId, route, data)
    elif(request.method == "DELETE"):
        try: data = request.get_json(force=True)
        except: data = None
        if(not data): data = None
        return LeagueClientAPI.delete(authId, route, data)
    elif(request.method == "PATCH"):
        try: data = request.get_json(force=True)
        except: data = None
        if(not data): data = None
        return LeagueClientAPI.patch(authId, route, data)


@Riot.route("/ingame/<path:route>")
def Riot_Ingame(**kwargs):
    route = kwargs["route"]
    args = request.args.to_dict()
    return LiveClientAPI.get(route, args)