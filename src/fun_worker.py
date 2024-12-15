from js import Response, fetch
import json

async def on_fetch(request, env):
    opensky = await fetch("https://opensky-network.org/api/states/all")
    return Response.new(opensky.body)