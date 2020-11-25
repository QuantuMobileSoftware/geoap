FROM cschranz/gpu-jupyter:latest

COPY requirements.txt /tmp/
RUN pip install --requirement /tmp/requirements.txt && \
    fix-permissions $CONDA_DIR && \
    fix-permissions /home/$NB_USER

RUN wget -q http://step.esa.int/downloads/8.0/installers/esa-snap_sentinel_unix_8_0.sh

RUN chmod +x ./esa-snap_sentinel_unix_8_0.sh

USER root

RUN ./esa-snap_sentinel_unix_8_0.sh -q

RUN rm esa-snap_sentinel_unix_8_0.sh

RUN ln -s /opt/snap/bin/gpt /usr/bin/gpt

USER $NB_UID