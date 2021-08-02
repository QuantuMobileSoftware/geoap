#!/usr/bin/env bash


DOCKERFILES_PATH=./dockerfiles

cd ..


#example
echo 'start building prod_sip-jupyter-example:latest'
docker build -f ./jupyter/example/prod.Dockerfile -t prod_sip-jupyter-example:latest .

#example/tci_ndvi
echo 'start building prod_sip_jupyter-tci_ndvi:latest'
docker build -f ./jupyter/example/tci_ndvi/prod.Dockerfile -t prod_sip_jupyter-tci_ndvi:latest .

#PBDNN
echo 'start building prod_pbdnn_nvidia_jupyter:latest'
docker build -f ./jupyter/PBDNN/prod.Dockerfile -t prod_pbdnn_nvidia_jupyter:latest .

exit 0


#webserver
docker build -f ./webserver/prod.Dockerfile -t 192.168.1.34:5000/sip-webserver ./
docker push 192.168.1.34:5000/sip-webserver:latest









#PW
echo 'start building sip_jupyter_pw_dev'
echo $(pwd)
docker build -f ./jupyter/PW/prod.Dockerfile -t 192.168.1.34:5000/sip_jupyter_pw_dev ./jupyter/PW
docker push 192.168.1.34:5000/sip_jupyter_pw_dev:latest

echo 'start building sip_jupyter_pw_prod'
docker build -f $DOCKERFILES_PATH/pw/prod.Dockerfile -t 192.168.1.34:5000/sip_jupyter_pw_prod .
docker push 192.168.1.34:5000/sip_jupyter_pw_prod:latest


exit 0