# owynrichen.com
Test repo for owynrichen.com

# Building the Website

This website uses Poetry for dependency management and Pelican to generate a static site.

Here's how to install poetry:
https://python-poetry.org/docs/#installing-with-the-official-installer

Here's how to install the application dependencies:

```bash
poetry install
```

Here's how to build the website with the bundling and appropriate theme:
```bash
cd buildscripts
./build.sh
```

Here's how to run a local version of a server that will autoreload:
```bash
poetry run pelican --autoreload --listen -t ./theme/
```

## Optimizing SVGs

```bash
svgo content/images/headIcon_forSite.svg -o content/images/headIcon_minimized.svg --multipass --precision 1 --pretty --config buildscripts/svgo.config.mjs
svgo content/images/planetaryGears.svg -o content/images/planetaryGears_minimized.svg --multipass --precision 1 --pretty --config buildscripts/svgo.config.mjs
```

## Deploying

This is deployed to Cloudflare automatically with GitOps when the ```main``` branch
is updated.

## Earth

Textures taken from: https://planetpixelemporium.com/earth8081.html
https://github.com/matteason/live-cloud-maps?tab=readme-ov-file
Put together quickly in Blender 4.3.1

# Deploy Workers

This also uses Cloudflare Workers to provide interfaces to some APIs/etc.  It uses the
standard ```wrangler``` cli to manage that, but is using their beta Python Workers which has
some limitations.

Here's how to deploy the worker:

```bash
npx wrangler@latest deploy
```
