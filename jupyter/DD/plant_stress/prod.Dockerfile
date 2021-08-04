FROM common_disease_detection:latest

ARG NOTEBOOK_NAME='plant_stress_single_field.ipynb'
ARG NOTEBOOK_PATH='/home/jovyan/code/src'
ENV NOTEBOOK_PATH ${NOTEBOOK_PATH}
ENV NOTEBOOK_NAME ${NOTEBOOK_NAME}

COPY ./data/notebooks/dd ${NOTEBOOK_PATH}
WORKDIR $HOME/code/src