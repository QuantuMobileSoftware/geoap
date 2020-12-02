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
USER $NB_UID

COPY jupyter_notebook_config.json /etc/jupyter/
