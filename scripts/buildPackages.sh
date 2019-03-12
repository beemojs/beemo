#!/usr/bin/env bash

root=$PWD

# We can't use Beemo to build our packages with TypeScript,
# as Beemo's CLI requires built files... which we don't have.
# So build them the old school way, which kind of sucks.

build_pkg() {
  echo "$1"
  cp "$root/scripts/tsconfig.build.json" "$root/$1/tsconfig.json"
  cd "$root/$1" || exit
  node ../../node_modules/.bin/tsc
}

build_pkg "./packages/dependency-graph"
build_pkg "./packages/core"
build_pkg "./packages/cli"
cd "$root/$1" || exit

for pkg in ./packages/*; do
  if [[ $pkg == *"driver"* ]]; then
    build_pkg "$pkg"
  fi
done
