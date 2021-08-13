FROM common_disease_detection:latest

COPY ./data/notebooks/dd /home/$NB_USER/code/src

USER root
RUN chown -R $NB_UID:$NB_GID /home/$NB_USER/code/src
#RUN fix-permissions /home/$NB_USER
USER $NB_UID