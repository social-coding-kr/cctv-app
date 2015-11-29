#!/bin/bash

./prepare.sh
pushd cctvApp

ionic platform rm ios
ionic platform rm android
ionic platform add ios
ionic platform add android