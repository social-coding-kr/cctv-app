#!/bin/bash

pushd cctvApp

mkdir -p buildlog
ionic platform add android
ionic plugin add https://github.com/apache/cordova-plugin-whitelist.git

ionic build android > buildlog/lastbuild.log
cat buildlog/lastbuild.log
grep "BUILD SUCCESS" buildlog/lastbuild.log

exit $?