This is a test component

### Build image
To build image run:

`docker build -t registry.quantumobile.co/sip_tci_ndvi:0.0.1-dev ./data/notebooks/example/tci_ndvi_component/`

### Push to registry

### Inputs and outputs

All inputs should be assigned as environment variables.
Inputs of type "FILE" this be mounted to `/mounted` directory, the name of a file should be assigned as an environment variable as well.

#### This component requires inputs:
* `SIP_AOI` - in WKT format
* `SIP_START_DATE` - date format. Example: "2020-07-01"
* `SIP_END_DATE` - date format. Example: "2020-08-01"
* `SENTINEL2_GOOGLE_API_KEY_PATH` - filename of JSON file. File should be mounted to `/input` directory in container.

#### This components require outputs:
* `SIP_TCI` - filename of TCI results *.tif raster file. Will be stored in `/output` directory in container
* `SIP_NDVI` - filename of NDVI results *.tif raster file. Will be stored in `/output` directory in container


`/output` directory should be mounted somewhere to preserve results and publisher can have access to it.

