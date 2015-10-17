#!/bin/bash

pushd cctvApp
cordova plugin | awk '{ print $1 }' | xargs ionic plugin rm
cordova plugin | awk '{ print $1 }' | xargs ionic plugin rm


cordova plugin add cordova-plugin-file
cordova plugin add cordova-plugin-file-transfer
cordova plugin add cordova-plugin-camera
cordova plugin add cordova-plugin-geolocation
cordova plugin add https://github.com/apache/cordova-plugin-whitelist.git
cordova plugin add https://github.com/pwlin/cordova-plugin-file-opener2.git
cordova plugin add https://github.com/Initsogar/cordova-webintent.git
cordova plugin add https://github.com/EddyVerbruggen/Toast-PhoneGap-Plugin.git
cordova plugin add https://git-wip-us.apache.org/repos/asf/cordova-plugin-inappbrowser.git
cordova plugin add https://github.com/cloverhearts/cordova-plugin-splashscreen
cordova plugin add cordova-plugin-network-information
cordova plugin add https://github.com/dpa99c/cordova-diagnostic-plugin.git

ionic platform rm android
ionic platform add android
