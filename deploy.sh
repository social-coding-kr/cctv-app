#!/bin/bash

pushd cctvApp
echo $1

ps -ef | grep "ionic serve -p" | grep -v "grep"
not_found=$?
echo $not_found

if [ $not_found = 0 ]; then
    echo "KILL exist serve process"
    
fi

screen -d -m -L ionic serve -p $1 --nolivereload


#exit $?