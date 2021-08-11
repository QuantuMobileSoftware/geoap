#!/bin/sh

docker build -f Dockerfile -t pbdnn_nvidia_jupyter .
docker run -d --shm-size=1g --gpus device=0 -p 8850:8888 -v /home/quantum/sip:/home/jovyan/work \
  -e JUPYTER_ENABLE_LAB=yes -e NVIDIA_DRIVER_CAPABILITIES=all --restart always \
  --name pbdnn_nvidia_jupyter_1 pbdnn_nvidia_jupyter:latest \
  start-notebook.sh --NotebookApp.password='sha1:e49e73b0eb0e:a268a2c9c7f7f24c07393b8a0852684de4b62ff8'
