#!/bin/bash

./prepare.sh
pushd cctvApp

ionic platform rm android
ionic platform add android
