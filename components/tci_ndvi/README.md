# SIP TCI NDVI
For given aoi, prepare TCI and NDVI sentinel latest images 

### Build image

`docker build -t quantumobile/sip_tci_ndvi ./components/tci_ndvi/`

### Pull image

`docker pull quantumobile/sip_tci_ndvi`

### Push to registry

`docker push quantumobile/sip_tci_ndvi`

### Docker run command

```
docker run \
    -e "AOI=POLYGON ((-85.299088 40.339368, -85.332047 40.241477, -85.134979 40.229427, -85.157639 40.34146, -85.299088 40.339368))" \
    -e "START_DATE=2020-07-01" \
    -e "END_DATE=2020-08-01" \
    -e "SENTINEL2_GOOGLE_API_KEY=/input/api-key-retriever.json" \
    -e "SENTINEL2_CACHE=/input/SENTINEL2_CACHE" \
    -e "OUTPUT_FOLDER=/output" \
    -v `pwd`/data/SENTINEL2_CACHE:/input/SENTINEL2_CACHE \
    -v `pwd`/data/api-key-retriever.json:/input/api-key-retriever.json \
    -v `pwd`/data/results/${REQUEST_ID}:/output \
    quantumobile/sip_tci_ndvi
```
## How to add model to SIP
____

1. Open Admin page, `localhost:9000/admin/`
2. In AOI block select `Components` and click on `+Add`
    * Add <b>Component name</b>: `Add your name`
    * Add <b>Image</b>: `quantumobile/sip_tci_ndvi`
    * Select <b>Run validation</b>
    * Select <b>Validation succeeded</b>
    * Select <b>Start and end dates are required</b>
    
        <i>note: `Sentinel Google API key` should be `true`</i>
3. <b>SAVE</b>
4. Update page with `SIP app` <i>(localhost:3000)</i>
5. Select `Area` or `Field` on the map and save it
6. Drop-down menu on your `Area` or `Field` -> `View reports`
7. `Create new`
8. In `Select layers` choose your component, add additional params like <i>Year</i>, <i>Date range</i> and so on
9. `Save changes`
