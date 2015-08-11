#!/bin/bash

pushd cctvApp

ionic platform add android
ionic plugin add https://github.com/apache/cordova-plugin-whitelist.git
ionic plugin add cordova-plugin-file
ionic plugin add cordova-plugin-file-transfer
ionic plugin add https://github.com/pwlin/cordova-plugin-file-opener2.git
ionic plugin add https://github.com/Initsogar/cordova-webintent.git
ionci plugin add org.apache.cordova.camera
