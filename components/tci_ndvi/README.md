This is a test component

### Build image

`docker build -t registry.quantumobile.co/sip_tci_ndvi:0.0.3-dev ./components/tci_ndvi/`

### Push to registry

`docker push registry.quantumobile.co/sip_tci_ndvi:0.0.3-dev`

### Docker run command

```
docker run \
    -e "AOI=POLYGON ((-85.299088 40.339368, -85.332047 40.241477, -85.134979 40.229427, -85.157639 40.34146, -85.299088 40.339368))" \
    -e "START_DATE=2020-07-01" \
    -e "END_DATE=2020-08-01" \
    -e "SENTINEL2_GOOGLE_API_KEY=/input/api-key-retriever.json" \
    -e "SENTINEL2_CACHE=/input/satellite_cache" \
    -e "OUTPUT_FOLDER=/output" \
    -v /home/dlukash/Projects/sip/data/satellite_imagery:/input/satellite_cache \
    -v /home/dlukash/Projects/sip/components/tci_ndvi/api-key-retriever.json:/input/api-key-retriever.json \
    -v /home/dlukash/Projects/sip/data/results/request_id:/output \
    registry.quantumobile.co/sip_tci_ndvi:0.0.3-dev
```
