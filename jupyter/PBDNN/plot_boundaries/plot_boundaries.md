####Repository:
```shell
https://github.com/QuantuMobileSoftware/sip_plot_boundary_detection_nn
```
Repository require additional rights

#STEPS TO REPRODUCE

###Delete all contents of 
```shell
data/notebooks/pbdnn
```

###To fetch submodules recursively
Run:
```shell
git submodule update --init --recursive
```

###Add requirements 
Copy requirements lines from
```shell
/notebooks/pbdnn/sip_plot_boundary_detection_nn/requirements.txt
```
to
```shell
jupyter/PBDNN/requirements.txt
```
if error while building, try to replace 
line 15 in 
/jupyter/PBDNN/prod.Dockerfile

```shell
pip install --upgrade jupyterlab-git && \
```
with
```shell
pip install --upgrade jupyterlab-git && \
```
documentation says farmer way is oldy.

if out of memory or low memory environment error
try to replace line 16 with
```shell
jupyter lab build --dev-build=False --minimize=False
```

###Missing details

sudo apt-get install cifs-utils
sudo apt-get install nfs-common
sudo mount 192.168.1.58:/volume1/SIP /home/quantum/sip
cp -r --remove-destination /home/quantum/sip/.prod_notebooks_requirements/pbdnn/sip_plot_boundary_detection_nn/ukr_shapes data/notebooks/pbdnn/sip_plot_boundary_detection_nn
cp -r --remove-destination /home/quantum/sip/.prod_notebooks_requirements/pbdnn/sip_plot_boundary_detection_nn/usa_shapes data/notebooks/pbdnn/sip_plot_boundary_detection_nn
cp -r --remove-destination /home/quantum/sip/.prod_notebooks_requirements/pbdnn/sip_plot_boundary_detection_nn/models data/notebooks/pbdnn/sip_plot_boundary_detection_nn
cp -r --remove-destination /home/quantum/sip/.prod_notebooks_requirements/pbdnn/sip_plot_boundary_detection_nn/sentinel2grid.geojson data/notebooks/pbdnn/sip_plot_boundary_detection_nn
    


sudo umount /home/quantum/sip
