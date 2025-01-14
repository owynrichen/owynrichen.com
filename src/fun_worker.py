from js import Response, fetch, console
from pyodide.ffi import to_js as _to_js
import json
import time

cache_time = 1 * 60 * 60 * 1000 # 1 hour in milliseconds

async def on_fetch(request, env):
    current_time = int(time.time_ns() / 1000000) # convert nanoseconds to milliseconds
    opensky_fetch = await env.OPENSKY.get("CACHE_TICKS")
    response = None
    processed_response = None
    attempt_states_cache = False

    # console.log(f"opensky_fetch: {opensky_fetch} | {current_time}")

    if opensky_fetch:
        cache_ticks = int(opensky_fetch)
        # console.log(f"{cache_ticks} > {current_time} - {cache_time} == {cache_ticks > current_time - cache_time}")
        if cache_ticks > current_time - cache_time: # still within cached window
            processed_response = await env.OPENSKY.get("CACHE_STATES_ALL_PROCESSED")
            attempt_states_cache = True

    if processed_response:
        console.log("Using processed cached response")
    else:
        if attempt_states_cache:
           response = await env.OPENSKY.get("CACHE_STATES_ALL")

        if response:
            console.log("Using cached opensky response for processing")
        else:
            console.log("Fetching from opensky")
            # https://openskynetwork.github.io/opensky-api/rest.html
            opensky = await fetch("https://opensky-network.org/api/states/all")
            response = await opensky.text()
            cached = await env.OPENSKY.put("CACHE_STATES_ALL", response)
            ticks = await env.OPENSKY.put("CACHE_TICKS", current_time)
            console.log("caching response...")

        # response = static_data
        osky = json.loads(response)
        planes = []

        for plane_arr in osky["states"]:
            # if no lat/lon, skip
            if not (plane_arr[5] or plane_arr[6]):
                continue

            if plane_arr[8]: # on_ground == true
                continue

            plane = {
                "tail" : plane_arr[1] or "",
                "lat" : plane_arr[6],
                "lon" : plane_arr[5],
                "alt" : plane_arr[13] or plane_arr[7] or 10000,
                "vel" : plane_arr[9] or 200,
                "track" : plane_arr[10] or 0,
                "vvel" : plane_arr[11] or 0,
                # "cat" : plane_arr[17] or 0
            }

            planes.append(plane)

        return_json = {
            "planes" : planes
        }

        processed_response = json.dumps(return_json)
        processed_cached = env.OPENSKY.put("CACHE_STATES_ALL_PROCESSED", processed_response)

    cors_headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
      "Access-Control-Max-Age": "86400",
    }

    response = Response.new(processed_response, headers=_to_js(cors_headers))
    return response