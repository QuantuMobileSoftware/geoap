#!/bin/sh

docker build -f Dockerfile -t dd_nvidia_jupyter .
docker run -d --shm-size=1g --gpus device=0 -p 8852:8888 -v /home/quantum/sip:/home/jovyan/work \
  -e JUPYTER_ENABLE_LAB=yes -e NVIDIA_DRIVER_CAPABILITIES=all --restart always \
  --name dd_nvidia_jupyter_1 dd_nvidia_jupyter:latest \
  start-notebook.sh --NotebookApp.password='sha1:74d6a239364a:516b051cdd1d8d838164ca507f0091e20ef25f3b'
