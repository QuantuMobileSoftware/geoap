FROM cschranz/gpu-jupyter:latest

COPY requirements.txt /tmp/

RUN conda create -n PW python=3.7 -c conda-forge --file /tmp/requirements.txt -q -y && \
    conda run -n PW python -m ipykernel install --user --name=PW

USER root

RUN wget -q http://step.esa.int/downloads/8.0/installers/esa-snap_sentinel_unix_8_0.sh && \
    chmod +x ./esa-snap_sentinel_unix_8_0.sh && \
    ./esa-snap_sentinel_unix_8_0.sh -q && \
    rm esa-snap_sentinel_unix_8_0.sh && \
    ln -s /opt/snap/bin/gpt /usr/bin/gpt

RUN fix-permissions $CONDA_DIR && \
    fix-permissions /home/$NB_USER

USER $NB_UID