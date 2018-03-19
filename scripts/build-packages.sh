#!/usr/bin/env bash

# We can't use Beemo to build our packages with Babel,
# as Beemo's CLI requires built files... which we don't have.
# So build them the old school way, which is faster anyways.
for pkg in ./packages/*; do
  node ./node_modules/.bin/babel "$pkg/src" --out-dir "$pkg/lib"
done
