docker run --gpus all \
  --rm -p 8888:8888 \
  -v $(pwd)/data:/home/jovyan/work \
  -e JUPYTER_ENABLE_LAB=yes \
  --name sip_nvidia_jupyter sip_nvidia_jupyter
