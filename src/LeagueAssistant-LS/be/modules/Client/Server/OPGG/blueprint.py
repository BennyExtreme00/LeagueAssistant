from flask import Blueprint, request
import requests as rq
import json
import bs4

from .utility import randomUserAgent

Opgg = Blueprint("Opgg", __name__)
@Opgg.route("/lol/<path:subUrl>")
def OpggLol(**kwargs):
    subUrl = kwargs["subUrl"]
    user = randomUserAgent()
    soup = bs4.BeautifulSoup(rq.get(
        f"https://www.op.gg/{subUrl}", 
        params=request.args.to_dict(),
        headers={"User-Agent": user}
    ).text, "html.parser")
    data = soup.find("script", {"id": "__NEXT_DATA__", "type": "application/json"})
    data = json.loads(data.decode_contents()).get("props", {}).get("pageProps", {})
    return data

@Opgg.route("/tft/<path:subUrl>")
def OpggTft(**kwargs):
    subUrl = kwargs["subUrl"]
    user = randomUserAgent()
    soup = bs4.BeautifulSoup(rq.get(
        f"https://tft.op.gg/{subUrl}", 
        params=request.args.to_dict(),
        headers={"User-Agent": user}
    ).text, "html.parser")
    data = soup.find("script", {"id": "__NEXT_DATA__", "type": "application/json"})
    data = json.loads(data.decode_contents()).get("props", {})
    pageProp = data.get("pageProps", {})
    fallback = data.get("fallback", {})
    pageProp["fallback"] = {key.split("\",\"")[1]:val for key, val in fallback.items() if("\",\"" in key)}
    return pageProp

@Opgg.route("/tft-api/<path:subUrl>")
def OpggTftApi(**kwargs):
    subUrl = kwargs["subUrl"]
    user = randomUserAgent()
    return rq.get(
        f"https://tft-api.op.gg/{subUrl}", 
        params=request.args.to_dict(),
        headers={"User-Agent": user}
    ).json()