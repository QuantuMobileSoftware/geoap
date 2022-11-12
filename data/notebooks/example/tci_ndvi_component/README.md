This is a test component

### Build image
To build image run:

`docker build -t registry.quantumobile.co/sip_tci_ndvi:0.0.1-dev ./data/notebooks/example/tci_ndvi_component/`

### Push to registry

### Inputs and outputs

All inputs should be assigned as environment variables.
Inputs of type "FILE" this be mounted to `/mounted` directory, the name of a file should be assigned as an environment variable as well.

#### This component requires inputs:
* `AOI` - in WKT format
* `START_DATE` - date format. Example: "2020-07-01"
* `END_DATE` - date format. Example: "2020-08-01"
* `SENTINEL2_GOOGLE_API_KEY` - filename of JSON file. File should be mounted to `/input` directory in container.
* `SATELLITE_CACHE` - folder to store downloaded satellite images.

#### This components require outputs:
* `TCI` - filename of TCI results *.tif raster file. Will be stored in `/output` directory in container
* `NDVI` - filename of NDVI results *.tif raster file. Will be stored in `/output` directory in container
* `OUTPUT_NODATA` - folder to store nodata results

#### Optional output
* `SIP_SATELLITE_CACHE` - folder to store downloaded satellite images

`/output` directory should be mounted somewhere to preserve results and publisher can have access to it.

#### Docker run command

```
docker run \
    -e "TCI=TCI_test_tif" \
    -e "NDVI=NDVI_test_tif" \
    -e "NODATA=nodata/" \
    -e "SENTINEL2_GOOGLE_API_KEY=api-key-retriever.json" \
    -e "AOI=POLYGON ((-85.299088 40.339368, -85.332047 40.241477, -85.134979 40.229427, -85.157639 40.34146, -85.299088 40.339368))" \
    -e "START_DATE=2020-07-01" \
    -e "END_DATE=2020-08-01" \
    -e "SATELLITE_CACHE=satellite_cache" \
    -v /home/dlukash/Projects/sip/data/satellite_imagery:/temp/satellite_cache \
    -v /home/dlukash/Projects/sip/data/notebooks/example/tci_ndvi_component/TCI_NDVI.ipynb:/code/TCI_NDVI.ipynb \
    -v /home/dlukash/Projects/sip/data/notebooks/example/tci_ndvi_component/api-key-retriever.json:/input/api-key-retriever.json \
    -v /home/dlukash/Projects/sip/data/notebooks/example/tci_ndvi_component/output:/output \
    registry.quantumobile.co/sip_tci_ndvi:0.0.3-dev
```

