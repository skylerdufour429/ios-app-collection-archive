#!/usr/bin/env python3
"""Validate the app catalog JSON schema."""

import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
catalog_path = root / 'catalog.json'

with catalog_path.open('r', encoding='utf-8') as infile:
    catalog = json.load(infile)

apps = catalog.get('apps', [])
required = {'name', 'bundleId', 'version', 'platform', 'minimumOS', 'binarySizeMB'}

if not isinstance(apps, list):
    raise SystemExit('catalog.json must contain an apps list.')

for index, app in enumerate(apps, start=1):
    missing = sorted(required - set(app.keys()))
    if missing:
        raise SystemExit(f'App #{index} is missing required keys: {missing}')

print(f'Validated {len(apps)} apps successfully.')
