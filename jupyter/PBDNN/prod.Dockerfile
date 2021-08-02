FROM cschranz/gpu-jupyter:latest

USER root
RUN apt-get update && apt-get install -y gcc libspatialindex-dev python3-dev

RUN conda install --quiet --yes -c conda-forge jupyterlab-git && \
    conda clean --all -f -y && \
    npm cache clean --force && \
#    jupyter notebook --generate-config && \
    jupyter lab clean && \
    rm -rf /home/$NB_USER/.cache/yarn && \
    fix-permissions $CONDA_DIR && \
    fix-permissions /home/$NB_USER


USER $NB_UID
WORKDIR $HOME



COPY ./jupyter/PBDNN/requirements.txt /tmp/
RUN pip install --upgrade pip && \
    pip uninstall -y torchaudio && \
    pip install --requirement /tmp/requirements.txt

#RUN pip install nbconvert==6.0.7
#RUN pip install nbformat==5.1.3

COPY ./jupyter/PBDNN/jupyter_notebook_config.json /etc/jupyter/

RUN mkdir -p /home/jovyan/code/src
COPY ./webapplication/aoi/management/commands/executor/NotebookExecutor.py /home/jovyan/code
WORKDIR $HOME


ARG NOTEBOOK_NAME='PBDNN_inference.ipynb'
ARG NOTEBOOK_PATH='/home/jovyan/code/src'
ENV NOTEBOOK_PATH ${NOTEBOOK_PATH}
ENV NOTEBOOK_NAME ${NOTEBOOK_NAME}

COPY ./data/notebooks/pbdnn/sip_plot_boundary_detection_nn ${NOTEBOOK_PATH}
WORKDIR $HOME/code/src