#!/bin/sh
docker build -f prod.Dockerfile -t ce_nvidia_jupyter .
docker run -d --shm-size=1g --gpus all -p 8851:8888 -v /home/quantum/sip:/home/jovyan/work -e JUPYTER_ENABLE_LAB=yes -e NVIDIA_DRIVER_CAPABILITIES=all --restart always --name ce_nvidia_jupyter_1 ce_nvidia_jupyter:latest start-notebook.sh --NotebookApp.password='sha1:262ffe1ba53e:bfeccd1c4f200bad5c7fbb60e38b65234bed6ea4'
