#!/bin/sh
docker build -f Dockerfile -t planet_downloader_jupyter .
docker run -d -p 8855:8888 -v /home/ec2-user/data:/home/jovyan/work -e JUPYTER_ENABLE_LAB=yes --restart always --name planet_downloader_jupyter_1 planet_downloader_jupyter:latest start-notebook.sh --NotebookApp.password="argon2:\$argon2id\$v=19\$m=10240,t=10,p=8\$j8e8HyWWqDT6nIA1F4loUg\$PNWzcQVF1SyKTiuNkZuXYQ"
