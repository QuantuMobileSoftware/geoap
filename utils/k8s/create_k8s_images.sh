#!/usr/bin/env bash

cd ../..

#webapplication
docker build -f ./webapplication/Dockerfile -t 192.168.1.34:5000/sip-webapplication ./webapplication
docker push 192.168.1.34:5000/sip-webapplication:latest

#PBDNN_COMMON
echo 'start building common_pbdnn:latest'
docker build -f ./jupyter/PBDNN/base.Dockerfile -t common_pbdnn .
#docker push 192.168.1.34:5000/common_pbdnn:latest

#PLOT_BOUNDARIES
echo 'start building prod_plot_boundaries_detection:latest'
docker build -f ./jupyter/PBDNN/plot_boundaries/prod.Dockerfile -t 192.168.1.34:5000/prod_plot_boundaries_detection .
docker push 192.168.1.34:5000/prod_plot_boundaries_detection:latest

exit 0
#EXAMPLE_COMMON
echo 'start building prod_sip-jupyter-example:latest'
docker build -f ./jupyter/example/base.Dockerfile -t 192.168.1.34:5000/prod_sip-jupyter-example .
docker push 192.168.1.34:5000/prod_sip-jupyter-example:latest

#EXAMPLE/tci_ndvi
echo 'start building prod_sip_jupyter-tci_ndvi:latest'
docker build -f ./jupyter/example/tci_ndvi/prod.Dockerfile -t 192.168.1.34:5000/prod_sip_jupyter-tci_ndvi .
docker push 192.168.1.34:5000/prod_sip_jupyter-tci_ndvi:latest

#DD_COMMON
echo 'start building common_disease_detection:latest'
docker build -f ./jupyter/DD/base.Dockerfile -t 192.168.1.34:5000/common_disease_detection .
docker push 192.168.1.34:5000/common_disease_detection:latest

#WATER_STRESS
echo 'start building prod_water_stress_detection:latest'
docker build -f ./jupyter/DD/water_stress/prod.Dockerfile -t 192.168.1.34:5000/prod_water_stress_detection .
docker push 192.168.1.34:5000/prod_water_stress_detection:latest

#PLANET_WATCHERS_COMMON
echo 'start building common_planet_watchers:latest'
docker build -f ./jupyter/PW/base.Dockerfile -t 192.168.1.34:5000/common_planet_watchers .
docker push 192.168.1.34:5000/common_planet_watchers:latest

#CROP_TYPE
echo 'start building prod_crop_type:latest'
docker build -f ./jupyter/PW/crop_type/prod.Dockerfile -t 192.168.1.34:5000/prod_crop_type_classification:latest .
docker push 192.168.1.34:5000/prod_crop_type_classification:latest

exit 0
