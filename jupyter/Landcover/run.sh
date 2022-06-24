#!/bin/sh
docker build -f Dockerfile -t landcover .
docker run -d -p 5432:8888 -v /home/quantum/sip:/home/jovyan/work -e JUPYTER_ENABLE_LAB=yes --restart always --name landcover_1 landcover:latest start-notebook.sh --NotebookApp.password='argon2:$argon2id$v=19$m=10240,t=10,p=8$YQ047LTtnB0jm6M54wwGGA$dFwyEOesYv/umSRcU7yR+g'
