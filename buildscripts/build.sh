#!/bin/bash
set -e

cd ../

# install node packages and run esbuild

npm install
npm run bundle

# Install poetry

curl -sSL https://install.python-poetry.org | python3 -

poetry --version

poetry install

poetry run pelican content -t ./theme

cp -r output buildscripts/