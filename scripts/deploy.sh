#!/bin/bash

rm -rf /data/alerta-server/*

cd /data/alerta-server/

git clone -b b1.0.0 -o upstream https://github.com/TerraMA2/terrama2-report-server.git .
#git clone -b b1.0.0 -o upstream https://github.com/MarceloPilatti/terrama2-report.git .

npm i
