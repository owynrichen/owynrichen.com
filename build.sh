#!/bin/bash
set -e
# Install poetry

curl -sSL https://install.python-poetry.org | python3 -

poetry --version;

poetry run pelican content -t ./theme