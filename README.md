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

Here's how to build the website with the appropriate theme:
```bash
poetry run pelican content -t .\theme
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

xv6nEHAgDn4FTwMpsYpEd0kbT4ZI-ZzCAR7Uo4qS