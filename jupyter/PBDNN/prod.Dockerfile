FROM cschranz/gpu-jupyter:latest

USER root
RUN apt-get update && \
    apt-get install -y \
    git \
    gcc libspatialindex-dev python3-dev
USER $NB_UID

COPY requirements.txt /tmp/

RUN conda create -n PBDNN python=3.7 -c conda-forge --file /tmp/requirements.txt -q -y && \
    conda run -n PBDNN python -m ipykernel install --user --name=PBDNN

USER root
RUN fix-permissions $CONDA_DIR && \
    fix-permissions /home/$NB_USER
USER $NB_UID
