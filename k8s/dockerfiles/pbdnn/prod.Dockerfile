FROM cschranz/gpu-jupyter:latest

USER root
RUN apt-get update && \
    apt-get install -y \
    gcc libspatialindex-dev python3-dev

RUN conda install --quiet --yes -c conda-forge jupyterlab-git && \
    conda clean --all -f -y && \
    npm cache clean --force && \
#    jupyter notebook --generate-config && \
    jupyter lab clean && \
    rm -rf /home/$NB_USER/.cache/yarn && \
    fix-permissions $CONDA_DIR && \
    fix-permissions /home/$NB_USER

#RUN pip install --upgrade jupyterlab jupyterlab-git
#RUN jupyter labextension install @jupyterlab/git && \
#RUN jupyter lab build && \
#    fix-permissions /home/$NB_USER

USER $NB_UID
WORKDIR $HOME



COPY requirements.txt /tmp/
RUN pip install --upgrade pip && \
    pip uninstall -y torchaudio && \
    pip install --requirement /tmp/requirements.txt
#    fix-permissions $CONDA_DIR && \
#    fix-permissions /home/$NB_USER

#USER root
#
#RUN pip install jupyter_contrib_nbextensions jupyterlab-git && \
#    jupyter labextension install @jupyterlab/git && \
#    jupyter lab build

#USER $NB_UID

COPY jupyter_notebook_config.json /etc/jupyter/


ARG NOTEBOOK_EXECUTION_PATH='/home/jovyan/code/src/notebook.ipynb'
ENV NOTEBOOK_EXECUTION_PATH ${NOTEBOOK_EXECUTION_PATH}

RUN mkdir -p /home/jovyan/code/src
COPY ./webapplication/aoi/management/commands/executor/NotebookExecutor.py /home/jovyan/code
COPY ./data/notebooks/pbdnn/sip_plot_boundary_detection_nn/PBDNN_inference.ipynb ${NOTEBOOK_EXECUTION_PATH}
WORKDIR $HOME
