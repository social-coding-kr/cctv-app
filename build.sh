#!/bin/bash

pushd cctvApp

mkdir -p buildlog
ionic platform add android
ionic plugin add https://github.com/apache/cordova-plugin-whitelist.git
ionic plugin add cordova-plugin-file
ionic plugin add cordova-plugin-file-transfer
ionic plugin add https://github.com/pwlin/cordova-plugin-file-opener2.git


ionic build --release android > buildlog/lastbuild.log
cat buildlog/lastbuild.log

# 개발용 key
# key_store : my-devel-key.keystore
# alias : alias_name
# password : devel_pass
# keytool -genkey -v -keystore my-devel-key.keystore -alias alias_name -keyalg RSA -keysize 2048 -validity 10000


jarsigner -verbose -storepass devel_pass -sigalg SHA1withRSA -digestalg SHA1 -keystore my-devel-key.keystore platforms/android/build/outputs/apk/android-release-unsigned.apk alias_name
$ANDROID_HOME/build-tools/22.0.1/zipalign -f -v 4 platforms/android/build/outputs/apk/android-release-unsigned.apk platforms/android/build/outputs/apk/cctvApp.apk
jarsigner -verify -verbose -certs platforms/android/build/outputs/apk/cctvApp.apk


grep "BUILD SUCCESS" buildlog/lastbuild.log

exit $?