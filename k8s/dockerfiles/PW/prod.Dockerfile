FROM 192.168.1.34:5000/sip_jupyter_pw_dev:latest

ARG NOTEBOOK_EXECUTION_PATH='/home/jovyan/code/src/notebook.ipynb'
ENV NOTEBOOK_EXECUTION_PATH ${NOTEBOOK_EXECUTION_PATH}

RUN mkdir -p /home/jovyan/code/src
COPY ./webapplication/aoi/management/commands/executor/NotebookExecutor.py /home/jovyan/code
COPY ./data/notebooks/pw/croptype_pipeline.ipynb ${NOTEBOOK_EXECUTION_PATH}
WORKDIR $HOME
