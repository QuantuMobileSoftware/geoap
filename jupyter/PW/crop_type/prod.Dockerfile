FROM common_planet_watchers:latest

ARG NOTEBOOK_NAME='croptype_pipeline.ipynb'
ARG NOTEBOOK_PATH='/home/jovyan/code/src'
ENV NOTEBOOK_PATH ${NOTEBOOK_PATH}
ENV NOTEBOOK_NAME ${NOTEBOOK_NAME}

COPY ./data/notebooks/pw/croptype_pipeline.ipynb ${NOTEBOOK_PATH}
WORKDIR $HOME/code/src