#!/usr/bin/env bash

root=$PWD

# We can't use Beemo to build our packages with TypeScript,
# as Beemo's CLI requires built files... which we don't have.
# So build them the old school way, which is faster anyways.
for pkg in ./packages/*; do
  cd "$root/$pkg"
  node ../../node_modules/.bin/tsc ./src/**/*.ts --outDir ./lib
done
