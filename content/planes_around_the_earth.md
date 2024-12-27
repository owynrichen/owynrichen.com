Title: Planes Around the World
Date: 2024-12-24
Category: Tinkering
Tags: ThreeJS, OpenSky, CSS3
Slug: planes-around-the-world
Authors: Owyn Richen
Status: published

# Why Planes Around the World

I wanted a reason to play around with ThreeJS for this little site.  There are a ton of 'build the earth'
tutorials out there for THREE and I figured it'd be a good place to start.  I did want to add a little
'personal flair' to it, though.

I am a private pilot and I love planes, so I thought it might be fun to incorporate that into the mix.
There is a wealth of realtime data out there for active flights, so I started digging in with that.

<style>
#c {
    width: 100%;
    height: 40vh;
    z-index: 1;
    border: solid 3px var(--heading-background);
    border-radius: 5px;
    /* pointer-events: none; */
}
</style>
<canvas id="c"></canvas>

OUTLINE

# Getting Started

## Baseline
THREEJS
Started by Modeling
Switched to basic geometry

## Textures

Earth textures: https://planetpixelemporium.com/earth8081.html
Daily Cloud textures: https://github.com/matteason/live-cloud-maps?tab=readme-ov-file

# Javascript Organization

Started sloppy
Factored things out to proper classes
No tests (boo)

# Incorporating Planes

## OpenSky APIs

Fetched directly from OpenSky (using free account)
Uses Cloudflare Workers
Filters planes that are 'on the ground' out.
Caches data hourly using Cloudflare Workers KV store to rate-limit

## N563VW

My plane is this. Wanted to highlight it specially when it was flying and have it show up
even on the ground. This required a few custom things...

## TODOs

* Day/Night textures
* The planes look like shit
* Incorporate flight plans/desinations and arcs

<script type="importmap">
{
    "imports": {
        "three": "https://unpkg.com/three@0.171.0/build/three.module.js",
        "three/addons/": "https://unpkg.com/three@0.171.0/examples/jsm/",
        "gsap": "https://unpkg.com/gsap@3.12.5/all.js"
    }
}
</script>
<script type="module" src="/theme/js/main.js"></script>