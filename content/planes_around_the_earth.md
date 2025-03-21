Title: Planes Around the World
Date: 2024-12-24
Category: Tinkering
Tags: ThreeJS, OpenSky, CSS3
Slug: planes-around-the-world
Authors: Owyn Richen
Status: published

# Why Planes Around the World

I wanted a reason to play around with ThreeJS for this little site. I thought it would be a good
way for me to get a better handle on what is 'more current' as far as webdev. I didn't realize this
until later, but there are a ton of 'render the earth' projects already out there, which was extremely
helpful in learning. I did want to add a little 'personal flair' to it.

I am a private pilot and I love planes, so I thought it might be fun to incorporate that into the mix.
There is a wealth of realtime data out there for active flights, so I started digging in with that.

Beyond learning ThreeJS, one of the main reasons for this project was to also test out Cloudflare Pages
& Workers, which turned out to be great!  More on that later.

<style>
#plane-container {
    width: 80%;
    position: relative;
}

#c {
    width: 100%;
    aspect-ratio: 16/9;
    z-index: 1;
    border: solid 3px var(--heading-background);
    border-radius: 5px;
    /* pointer-events: none; */
}
</style>
<div style="width: 100%; text-align: center">
    <div id="plane-container">
        <canvas id="c">
        </canvas>
        <section id="plane-details">
            <h1 id="plane-tail-number"></h1>
            <p>Starting Position: <span id="plane-start-position"></span></p>
            <p>Current Position: <span id="plane-current-position"></span></p>
            <p>Heading: <span id="plane-heading"></span></p>
            <p>Speed: <span id="plane-speed"></span></p>
            <p>Altitude: <span id="plane-altitude"></span></p>
        </section>
    </div>
</div>

# Getting Started

Before realizing there were a ton of Earth via [ThreeJS](https://threejs.org/) tutorials out there,
I started by attempting to model it in [Blender](https://www.blender.org).

I'd played around with ThreeJS before, but not enough to realize how simple texturing a regular sphere
geometry would be. I wanted an excuse to try out Blender for the 100th time in any case, so roping
it into this little project sounded fun.  I used it later in any case.

## Textures

Before realizing this was common practice, I googled around and found the great set of earth textures
from sattelite photography, and after modeling my sphere in Blender I setup a BSDF material with
the various color, specular and heightmap textures referenced below.

Earth textures: https://planetpixelemporium.com/earth8081.html

The good news is it was easy to reference these directly via a ThreeJS material, so there wasn't
any lost work, and I got more control over how it was managed.

Later in the project, I wanted to add some additional 'realistic flair' to the Earth, and found
this great GitHub repo that builds live cloud maps on a regular interval (8 times a day).  My code
hits his site directly, but digging in a bit, it looks like it references EUMetStat under the covers.

Daily Cloud textures: https://github.com/matteason/live-cloud-maps?tab=readme-ov-file


### What's Left?

- I also don't really like how the clouds show up, they could 'pop' more.  We'll see if I come back to these.

# Javascript Organization

## Initial Code

Being a suit at my day-job, I hadn't written proper JS in quite a while and so I started out pretty sloppy.
Originally when I started prototyping, my Javascript code was all smashed into a single file. That
became unwieldy eventually (obviously) and so I began to factor things out into proper JS classes. If you
care, you can look at this [commit log](https://github.com/owynrichen/owynrichen.com/commit/53d1b56ccd716372dee56c3363253dca97f83ed0#diff-386d817bab250590d49191499086cea609acaddbed642f92fb83b4a72ef1915d) and laugh a bit.

## Code Refactoring

This began when I wanted to add the 'atmosphere' to the Earth, and I found it was done a few ways online
already. The way I thought was the nicest was using a custom, shader-based Fresnel material that I ported
found [here](https://github.com/beagas/Earth-Visualization-React).  I pulled it over but ported it so it
didn't require React and fit the coding style.  [MeshFresnelMaterial](https://github.com/owynrichen/owynrichen.com/blob/main/theme/static/js/MeshFresnelMaterial.js) was borne from that.

Once that happened, I started by factoring out the [Starfield](https://github.com/owynrichen/owynrichen.com/blob/main/theme/static/js/Starfield.js)
into a class, then the [Sun](https://github.com/owynrichen/owynrichen.com/blob/main/theme/static/js/Sun.js),
then the [Earth](https://github.com/owynrichen/owynrichen.com/blob/main/theme/static/js/Earth.js).
I left the system that managed the "Planes" to last, but eventually ported that out too.  More on Planes later.

The code is fairly clean and readable (in my opinion), but feedback is welcome :).

## New Functionality

After I got the code all cleaned up, I begun tackling new functions in earnest.  I wanted to showcase some
of the details of the OpenSky data, so I added a [Picker](https://github.com/owynrichen/owynrichen.com/blob/main/theme/static/js/Picker.js).
This wraps basic Raycasting with some convenience functions, and adds some convenience functions.

I also created [TrackingCameraControls](https://github.com/owynrichen/owynrichen.com/blob/main/theme/static/js/TrackingCameraControls.js). This extended the basic OrbitControls with some functionality to enable the camera to track a path.
That is what enables the 'fly in' at the beginning plus the movement to look at new planes when you click,
or when the timer fires.  It has a few bugs but is mostly decent.

### Day/Night Texture

There are a lot of simple shaders that showcase how to selectively mix between a day/night texture.
See [here](https://sangillee.com/2024-06-07-create-realistic-earth-with-shaders/), or [here](https://github.com/pyshadi/globe-threejs/blob/main/src/globe.js) or [here](https://stackoverflow.com/questions/10644236/adding-night-lights-to-a-webgl-three-js-earth) for a few.

The challenge I had with these is I was already using a ```MeshPhysicalMaterial``` and liked how it was
working with specular and height maps/etc. I opted to use this as an exercise to learn a little more
about the GLSL for that material and replace key areas in ```onBeforeCompile()```.

The fragment shader is pretty complex, but I opted to replace features of the ```map``` and eventually also
```emissiveMap```.

Basically, this involved finding includes and and replacing them with the existing contents of the shader
plus extra stuff.

[MeshPhysicalMaterial's glsl](https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderLib/meshphysical.glsl.js) is pretty complex, but well organized.

Here's the snippet of the particular material replacement. The 3 includes I'm replacing are:

- [map_pars_fragment](https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderChunk/map_pars_fragment.glsl.js)
which contains the parmeters for the map, extending it with the nightMap uniform.
- [map_fragment](https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderChunk/map_fragment.glsl.js) - where I'm getting the direction of the 'sun' (the first PointLight) in the Scene, and stealing
some math from other tutorials to interpolate the intensity.
- [emmisivemap_fragment](https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderChunk/emissivemap_fragment.glsl.js) - I'm doing similar interpolation so the 'lights' I'm overlaying as an emissiveMap only show up on the night side of Earth.

```javascript
const earthMat = new THREE.MeshPhysicalMaterial({
                map: mapTex,
                bumpMap: bumpTex,
                bumpScale: 10,
                specularIntensity: 1,
                specularIntensityMap: specTex,
                roughness: 0.5,
                roughnessMap: specTex,
                metalness: 0.2,
                metalnessMap: specTex,
                opacity: 0,
                transparent: true,
                emissiveMap: emissiveMapTex,
                emissive: new THREE.Color(0xffffaa),
                emissiveIntensity: 0.5,
            });

earthMat.onBeforeCompile = (shader) => {
                shader.uniforms.nightMap = { value: mapNightTex };
                shader.fragmentShader = shader.fragmentShader.replace("#include <map_pars_fragment>", `
#ifdef USE_MAP

	uniform sampler2D map;
    uniform sampler2D nightMap;
#endif`);
                shader.fragmentShader = shader.fragmentShader.replace("#include <map_fragment>", `
#ifdef USE_MAP

    vec3 sunPos = pointLights[0].position;
    vec3 lVector = sunPos - vViewPosition;

	vec3 sunDir = normalize( lVector );
    vec3 transformedNormal = normalize(vNormal);
    float intensity = dot(transformedNormal, sunDir);
    intensity = 1. / (1. + (exp(-20. * intensity)));  // sigmoid function to increase the contrast
    intensity = clamp(intensity, -0.05, 1.0);
    vec4 dayColor = texture2D(map, vMapUv);
    vec4 nightColor = texture2D(nightMap, vMapUv);
    vec4 sampledDiffuseColor = mix(nightColor, dayColor, intensity);

	#ifdef DECODE_VIDEO_TEXTURE

		// use inline sRGB decode until browsers properly support SRGB8_ALPHA8 with video textures (#26516)

		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );

	#endif

	diffuseColor *= sampledDiffuseColor;

#endif`);

                shader.fragmentShader = shader.fragmentShader.replace("#include <emissivemap_fragment>", `
#ifdef USE_EMISSIVEMAP

	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );

	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE

		// use inline sRGB decode until browsers properly support SRGB8_ALPHA8 with video textures (#26516)

		emissiveColor = sRGBTransferEOTF( emissiveColor );

	#endif
    vec4 lightsColor = mix(emissiveColor, vec4(0), intensity);

	totalEmissiveRadiance *= lightsColor.rgb;

#endif
`);
                console.log("compiled shader");
                console.log(shader);
            };
```


### What's Left?

- It could due with some optimization of draw calls and more general optimization.
- There are a few bugs in TrackingCameraControls. The biggest one is in [trackTo()](https://github.com/owynrichen/owynrichen.com/blob/main/theme/static/js/TrackingCameraControls.js#L114).
    - It attempts to generate a CatmullRomCurve3 with 3 points around the sphere but fails miserably when going
too far around the world, so it flies through the Earth sometimes.
- The FXAA post processing filter blurs away most of the stars, I should either switch them from Points to
real geometry or explore alternatives.
- Additionally, I should add unit tests (sigh).

# Incorporating Planes

One of the main reasons to try this was to bring in realtime flight data. Being a pilot, I often look at
products like FlightAware and have even considered setting up my own ADS-B receiver at the house (but haven't
yet).

There are a few places this is available, but the easiest one is [The OpenSky Network](https://opensky-network.org/).

## OpenSky Network and APIs

The OpenSky APIs are pretty easy to use. "Planes Around the World" has a lightweight wrapper API
that sits on top of [GET /states/all](https://openskynetwork.github.io/opensky-api/rest.html).

## Cloudflare Python Workers

The [wrapper API](https://github.com/owynrichen/owynrichen.com/blob/main/src/fun_worker.py) is hosted as a [Cloudflare Worker](https://developers.cloudflare.com/workers/).

I'd never used these before, but they're pretty easy to setup and run great!

I wanted to try out their [Python worker](https://developers.cloudflare.com/workers/languages/python/)
support, which is in Beta.

Because of that, it took me a minute to get it working, but after figuring it out, it has been great!
The limitation I fumbled through the most was my Python code was originally setup as a module
and didn't work in production (as they have documented).

## Why a Wrapper API?

The Opensky APIs are open to all, but have some limitations (particularly for unauthenticated accounts),
most noteably throttling.

Additionally, I'm on a "free" Cloudflare account and they have some limitations
too (CPU utilization limits, as an example). Around the world there are typically 7500-9000 planes
registering data at any given time, so there is a fair bit of data. Processing it on-demand every request
caused me to routinely hit those CPU limits, causing requests to fail.

Because of this, the wrapper does a few things:
- Restructures the data from a multidimentional array to a dictionary. This actually increases the size
but makes it easier to manage as JSON.
- Filters out planes who have the "on_ground" flag checked. This flag isn't perfect, so we do some subsequent
filtering later.
- Stores the data in pre-processed and post-processed states in the [Cloudflare Work KV](https://developers.cloudflare.com/kv/)
store.
    - It stores a cache timestamp as a separate key and if it's < 1 hour old it returns KV values.
This prevents both hitting the OpenSky throttling limits and helps with the Cloudflare Worker CPU limit issues.

### CORS

One thing that wasn't a sure thing for me was translating CORS headers support to Python.
In hindsight it's pretty straightforward and the [documentation has improved](https://developers.cloudflare.com/workers/examples/cors-header-proxy/),
but I'm still not deeply familiar with pyodide so it wasn't obvious to me at the time.  I'm documenting
it here to remind me in the future :).

```python
from pyodide.ffi import to_js as _to_js

cors_headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
      "Access-Control-Max-Age": "86400",
    }

response = Response.new(processed_response, headers=_to_js(cors_headers))

```

## ThreeJS Rendering Thousands of Planes

Once I got the system to fetch plane data, I had get the planes rendered onto the globe.  This meant
converting the latitude, longitude (and altitude) to an XYZ position on the Earth.

There are plenty of code snippets online to convert a latitude/longitude to a unit circle XYZ coordinate (
and back), but it still took me a while to fumble through getting it right. I had similar fumbling issues
with [orienting the plane on its heading/track](https://github.com/owynrichen/owynrichen.com/blob/main/theme/static/js/Planes.js#L181), and making it 'fly' in the right direction around the globe vs.
[off into space](https://github.com/owynrichen/owynrichen.com/blob/main/theme/static/js/Planes.js#L211), but eventually figured it out in an only slightly hacky way.

I got this going with Cones initially, but that didn't look great.

Once I did that, I started by finding a 'low-poly' plane model on Sketchfab, loading it and rendering it.
I thought it'd be pretty good (it had ~700 triangles), but because each plane is it's own mesh and each
mesh is a draw call, that made it SLOOOOOW.

I toyed with the idea of the common optimization ThreeJS uses around a single mesh with MorphTargets, but
abandoned the idea when it didn't work immediately :D. I shifted to dust of Blender and model (poorly)
a *much* lower-poly mesh. [lowpoly_plane.blend](https://github.com/owynrichen/owynrichen.com/blob/main/earth/lowpoly_plane.blend) has 114 triangles, and while it is ugly, it does work.

## N563VW

This is my plane. I wanted to highlight it specially when it was flying and have it show up
even on the ground. To encapsulate all of these things I have a [custom set of classes](https://github.com/owynrichen/owynrichen.com/blob/main/theme/static/js/Planes.js#L224) that inherit from
Plane and change the Material/Scale and store KHIO's lat/long if it's not in the list (meaning not in the
air) or filtered because it's on the ground.

```javascript
class PlaneN563VW extends Plane {
    static material = new THREE.MeshStandardMaterial({
        color: 0xff0000,
        emissive: 0xff0000,
        emissiveIntensity: 0.4,
        roughness: 0.5,
        transparent: true,
        opacity: 0
    });

    constructor(data) {
        super(data, PlaneN563VW.material);
        this.scale.multiplyScalar(3);
    }
}

class PlaneN563VWGrounded extends PlaneN563VW {
    constructor() {
        const khio = { "lat": 45.5348093, "lon": -122.9498132 }
        const n563vw_grounded = {
            "tail" : "N563VW",
            "lat" : khio["lat"],
            "lon" : khio["lon"],
            "alt" : 250,
            "vel" : 0,
            "track" : 180,
            "vvel" : 0
        }

        super(n563vw_grounded);
    }
}
```

# Cloudflare Products and Architecture

~~~mermaid
---
title: Cloudflare Pages/Worker Architecture
config:
  theme: neutral
  look: handDrawn
  architecture:
    iconSize: 40
    fontSize: 12
---
architecture-beta
    group pages(logos:cloudflare-icon)[Pages]
    group api(logos:cloudflare-workers-icon)[API]

    service user(hugeicons:location-user-01)[User]

    service page(logos:cloudflare-icon)[owynrichen dot com] in pages

    service worker_api(logos:cloudflare-workers-icon)[Worker API] in api
    service kv_store(logos:cloudflare-workers-icon)[Worker KV Store] in api

    service opensky(hugeicons:airplane-02)[OpenSky Network]

    user:R --> L:page
    user:B --> T:worker_api
    worker_api:R <--> L:kv_store
    worker_api:B --> T:opensky
~~~

<script type="module" src="/theme/js/packed.js"></script>
