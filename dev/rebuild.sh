#!/bin/sh

cd "$(dirname "$0")"

./down.sh
echo ""
./build.sh
echo ""
./up.sh
