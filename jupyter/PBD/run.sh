#!/bin/sh
docker build -f Dockerfile -t pbd_jupyter .
docker run -d --shm-size=1g --gpus all -p 8848:8888 -v /home/quantum/sip:/home/jovyan/work -e JUPYTER_ENABLE_LAB=yes NVIDIA_DRIVER_CAPABILITIES=all --restart always --name pbd_jupyter_1 pbd_jupyter:latest start-notebook.sh --NotebookApp.password='sha1:935d0c7b894e:e114a5b66735ae8fe59b255f42b7f92bdac84882'