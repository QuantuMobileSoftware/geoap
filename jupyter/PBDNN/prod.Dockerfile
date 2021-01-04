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

COPY jupyter_notebook_config.json /etc/jupyter/

RUN git clone https://72976594646dea5629c7605bfe505166391faa07@github.com/QuantuMobileSoftware/sip_plot_boundary_detection_nn /home/$NB_USER/work/notebooks/pbdnn/sip_plot_boundary_detection_nn
