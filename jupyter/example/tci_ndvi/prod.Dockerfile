FROM prod_sip-jupyter-example:latest

ARG NOTEBOOK_NAME='TCI_NDVI.ipynb'
ARG NOTEBOOK_PATH='/home/jovyan/code/src'
ENV NOTEBOOK_PATH ${NOTEBOOK_PATH}
ENV NOTEBOOK_NAME ${NOTEBOOK_NAME}

COPY ./data/notebooks/example/tci_ndvi ${NOTEBOOK_PATH}
WORKDIR $HOME/code/src