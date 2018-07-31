#!/usr/bin/env bash

root=$PWD

# We can't use Beemo to build our packages with TypeScript,
# as Beemo's CLI requires built files... which we don't have.
# So build them the old school way, which kind of sucks.

build_pkg() {
  echo "$1"
  cp "$root/scripts/build-tsconfig.json" "$root/$1/tsconfig.json"
  cd "$root/$1" || exit
  node ../../node_modules/.bin/tsc
}

build_pkg "./packages/core"
cd "$root" || exit

for pkg in ./packages/*; do
  if [ "$pkg" != "./packages/core" ]
  then
    build_pkg "$pkg"
  fi
done
