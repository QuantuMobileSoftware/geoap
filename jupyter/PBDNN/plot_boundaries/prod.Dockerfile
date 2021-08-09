FROM common_pbdnn:latest

ARG NOTEBOOK_NAME='PBDNN_inference.ipynb'
ARG NOTEBOOK_PATH='/home/jovyan/code/src'
ENV NOTEBOOK_PATH ${NOTEBOOK_PATH}
ENV NOTEBOOK_NAME ${NOTEBOOK_NAME}

COPY ./data/notebooks/pbdnn/sip_plot_boundary_detection_nn ${NOTEBOOK_PATH}
WORKDIR $HOME