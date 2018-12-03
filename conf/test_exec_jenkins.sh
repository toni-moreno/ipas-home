#!/bin/bash

filename=./new_device.json

action="add"
if [ -n "$1" ]
then
	action=$1
fi


if [ -n "$2" ]
then
	filename=$2
fi

curl -X POST -F 'Msg="este es un  mensaje de prueba"' -F "CommitFile=@$filename;filename=$filename" http://localhost:5090/api/rt/jenkins/build/device/$action
