#!/bin/bash

./prepare.sh
pushd cctvApp

ionic platform rm ios
ionic platform add ios
