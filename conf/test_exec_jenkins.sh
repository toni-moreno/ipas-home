#!/bin/bash

filename=./new_device.json
if [ -n "$1" ]
then
	filename=$1
fi

curl -X POST -F 'Msg="este es un  mensaje de prueba"' -F "CommitFile=@$filename;filename=$filename" http://localhost:5090/api/rt/jenkins/build/device/add
