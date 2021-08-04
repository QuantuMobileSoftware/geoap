FROM cschranz/gpu-jupyter:latest

USER root
RUN apt-get update && apt-get install -y gcc libspatialindex-dev python3-dev

RUN conda install --quiet --yes -c conda-forge jupyterlab-git && \
    conda clean --all -f -y && \
    npm cache clean --force && \
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

COPY ./jupyter/PBDNN/jupyter_notebook_config.json /etc/jupyter/