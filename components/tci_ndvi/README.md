This is a test component

### Build image
To build image run:

`docker build -t registry.quantumobile.co/sip_tci_ndvi:0.0.3-dev ./components/tci_ndvi/`

### Push to registry

`docker push registry.quantumobile.co/sip_tci_ndvi:0.0.3-dev`

### Inputs and outputs

#### This component requires environment variables:
* `AOI` - in WKT format
* `START_DATE` - date format. Example: "2020-07-01"
* `END_DATE` - date format. Example: "2020-08-01"
* `SENTINEL2_GOOGLE_API_KEY` - filename of JSON file.
* `SENTINEL2_CACHE` - folder to store downloaded satellite images.
* `OUTPUT_FOLDER` - folder to store outputs.

### Docker run command

```
docker run \
    -e "OUTPUT_FOLDER=/output" \
    -e "SENTINEL2_GOOGLE_API_KEY=/input/api-key-retriever.json" \
    -e "AOI=POLYGON ((-85.299088 40.339368, -85.332047 40.241477, -85.134979 40.229427, -85.157639 40.34146, -85.299088 40.339368))" \
    -e "START_DATE=2020-07-01" \
    -e "END_DATE=2020-08-01" \
    -e "SENTINEL2_CACHE=/input/satellite_cache" \
    -v /home/dlukash/Projects/sip/data/satellite_imagery:/input/satellite_cache \
    -v /home/dlukash/Projects/sip/data/notebooks/example/tci_ndvi_component/TCI_NDVI.ipynb:/code/TCI_NDVI.ipynb \
    -v /home/dlukash/Projects/sip/components/tci_ndvi/api-key-retriever.json:/input/api-key-retriever.json \
    -v /home/dlukash/Projects/sip/data/results/request_id:/output \
    registry.quantumobile.co/sip_tci_ndvi:0.0.3-dev
```
docker run \
    -e "OUTPUT_FOLDER=/output" \
    -e "SENTINEL2_GOOGLE_API_KEY=/input/api-key-retriever.json" \
    -e "AOI=POLYGON ((-85.299088 40.339368, -85.332047 40.241477, -85.134979 40.229427, -85.157639 40.34146, -85.299088 40.339368))" \
    -e "START_DATE=2020-07-01" \
    -e "END_DATE=2020-08-01" \
    -e "SENTINEL2_CACHE=/input/satellite_cache" \
    -v /home/dlukash/Projects/sip/data/satellite_imagery:/input/satellite_cache \
    -v /home/dlukash/Projects/sip/components/tci_ndvi/api-key-retriever.json:/input/api-key-retriever.json \
    -v /home/dlukash/Projects/sip/data/results/request_id:/output \
    registry.quantumobile.co/sip_tci_ndvi:0.0.3-dev

