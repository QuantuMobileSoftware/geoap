FROM cschranz/gpu-jupyter:latest

USER root
RUN apt-get update && \
    apt-get install -y \
    git \
    gcc libspatialindex-dev python3-dev

COPY requirements.txt /tmp/
RUN pip install --requirement /tmp/requirements.txt && \
    fix-permissions $CONDA_DIR && \
    fix-permissions /home/$NB_USER

RUN pip install jupyter_contrib_nbextensions jupyterlab-git && \
    jupyter labextension install @jupyterlab/git && \
    jupyter lab build

USER $NB_UID
