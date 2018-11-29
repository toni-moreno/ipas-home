#!/bin/bash


curl -X POST -F 'Msg="este es un  mensaje de prueba"' -F 'CommitFile=@./new_device.json;filename="new_device.json"' http://localhost:5090/api/rt/jenkins/build/device/add
