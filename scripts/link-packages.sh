#!/usr/bin/env bash

# There's a bug in Yarn where our local packages are not symlinked
# to node_modules, as @beemo dependencies already exist in the tree
# because of @milesj/build-tool-config. So let's symlink manually.
# https://github.com/yarnpkg/yarn/issues/5538
dst="$PWD/node_modules/@beemo"

rm -rf "$dst"
mkdir -p "$dst"

for pkg in ./packages/*; do
  name=$(basename "$pkg")
  src="$PWD/packages/$name"

  ln -s -f "$src" "$dst/$name"

  echo "$pkg --> @beemo/$name"
done
