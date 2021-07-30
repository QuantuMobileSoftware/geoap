FROM 192.168.1.34:5000/sip-jupyter-example:latest
COPY ./data/notebooks/example/tci_ndvi/TCI_NDVI.ipynb ${NOTEBOOK_EXECUTION_PATH}