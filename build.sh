#!/bin/bash

pushd cctvApp

mkdir -p buildlog
ionic platform add android
ionic build android > buildlog/lastbuild.log
cat buildlog/lastbuild.log
grep "BUILD SUCCESS" buildlog/lastbuild.log

exit $?