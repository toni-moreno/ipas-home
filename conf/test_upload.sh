#!/bin/bash

base64 /dev/urandom | head -c 100 > /tmp/file1.txt
base64 /dev/urandom | head -c 100 > /tmp/file2.txt
curl -X POST -F 'Msg="este es un  mensaje de prueba"' -F 'CommitFile=@/tmp/file1.txt;filename="TEST.txt"' -F 'CommitFile=@/tmp/file2.txt;filename="DIR1/TEST2.txt"' http://localhost:5090/api/rt/gitrepo/commitfile/
