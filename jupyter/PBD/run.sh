#!/bin/sh
docker build -f prod.Dockerfile -t pbd_nvidia_jupyter .
docker run -d --shm-size=1g --gpus all -p 8848:8888 -v /mnt/disk1:/mnt/disk1 -v /home/quantum/sip:/home/jovyan/work -e JUPYTER_ENABLE_LAB=yes -e NVIDIA_DRIVER_CAPABILITIES=all --restart always --name pbd_nvidia_jupyter_1 pbd_nvidia_jupyter:latest start-notebook.sh --NotebookApp.password='sha1:935d0c7b894e:e114a5b66735ae8fe59b255f42b7f92bdac84882'
