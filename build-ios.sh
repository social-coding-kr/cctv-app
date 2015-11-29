#!/bin/bash

pushd cctvApp

mkdir -p buildlog

ionic build --release ios > buildlog/lastbuild.log
cat buildlog/lastbuild.log

grep "BUILD SUCCESS" buildlog/lastbuild.log

exit $?