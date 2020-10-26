## Container for Jupyter and test notebooks

1. Dockerfile uses [jupyter/scipy-notebook](https://jupyter-docker-stacks.readthedocs.io/en/latest/using/selecting.html)
image. It installs default environment (with Python 3.8.x version). If you need libraries, 
add them to `requirements.txt` before running container. Also the Dockerfile installs additional 
environment with Python 3.7.x (not all libs work with Python 3.8). Use `requirements_37.txt`.
So the user can switch Kernel inside notebook to desired one.

2. `docker-compose.yml` manages process of running and adds volumes. By default jupyter notebooks 
use `jovyan` user and paths inside it are given as `/home/jovyan/<path>`.
The `TEST_TILE_PATH=/home/jovyan/work/test_tile/L1C_T36UYA_A017393_20200705T083602_TCI.jp2`
is added as env var. **Put inside dir .jp2 tile.** You can 
 download it [here](https://drive.google.com/file/d/1M4nvnkKfohqZEF3ezbG6ZTBNSJJOhTQs/view?usp=sharing). 
 **Change the path to .jp2 tile on real NAS server.**

3. Additional [Docker options](https://jupyter-docker-stacks.readthedocs.io/en/latest/using/common.html#Docker-Options)
and [permission denied error](https://github.com/jupyter/docker-stacks/issues/885) and
[adding envs](https://jupyter-docker-stacks.readthedocs.io/en/latest/using/recipes.html#using-pip-install-or-conda-install-in-a-child-docker-image).

4. There are 2 notebooks (`geojson.ipynb` and `geotiff.ipynb`) in the `/notebooks` folder.
They creates and stores in mounted `/results` directory `.geojson` and `.tif` files. 


