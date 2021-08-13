FROM common_disease_detection:latest

COPY ./data/notebooks/dd /home/$NB_USER/code/src

USER root
RUN chown -R $NB_UID:$NB_GID /home/$NB_USER/code/src
USER $NB_UID