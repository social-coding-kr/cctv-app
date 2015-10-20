#!/bin/bash

pushd cctvApp
cordova plugin rm sky1core.cordova.plugin.labs
cordova plugin add ../plugins/sky1core.cordova.plugin.labs/

ionic platform rm android
ionic platform add android
../build.sh