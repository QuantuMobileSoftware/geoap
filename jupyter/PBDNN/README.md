# for adding sip_plot_boundary_detection_nn package to sip project:

## Delete all contents of data/notebook/pbdnn
```shell
cd data/notebook
rm -r pbdnn
```

## Clone repository:
```shell
git clone https://github.com/QuantuMobileSoftware/sip_plot_boundary_detection_nn pbdnn
cd pbdnn
git submodule update --init --recursive
```
Repository require additional rights

## for enabling nfs support 
```shell
sudo apt-get install cifs-utils
sudo apt-get install nfs-common
```

#get requirements from NFS server
```shell
sudo mount 192.168.1.58:/volume1/SIP /home/quantum/sip
cp -r --remove-destination /home/quantum/sip/.prod_notebooks_requirements/pbdnn/sip_plot_boundary_detection_nn/ukr_shapes data/notebooks/pbdnn/sip_plot_boundary_detection_nn
cp -r --remove-destination /home/quantum/sip/.prod_notebooks_requirements/pbdnn/sip_plot_boundary_detection_nn/usa_shapes data/notebooks/pbdnn/sip_plot_boundary_detection_nn
cp -r --remove-destination /home/quantum/sip/.prod_notebooks_requirements/pbdnn/sip_plot_boundary_detection_nn/models data/notebooks/pbdnn/sip_plot_boundary_detection_nn
cp -r --remove-destination /home/quantum/sip/.prod_notebooks_requirements/pbdnn/sip_plot_boundary_detection_nn/sentinel2grid.geojson data/notebooks/pbdnn/sip_plot_boundary_detection_nn
sudo umount /home/quantum/sip
```

## copy requirements from repository to jupyter folder
```shell
cp -r --remove-destination data/notebooks/pbdnn/sip_plot_boundary_detection_nn/requirements.txt jupyter/PBDNN/requirements.txt
```
# Building images for prod
after updating all files from git repository, go to project SIP root directory

## for building common_pbdnn:latest
```shell
docker build -f ./jupyter/PBDNN/base.Dockerfile -t common_pbdnn:latest .
```

## for building prod_plot_boundaries_detection:latest
```shell
docker build -f ./jupyter/PBDNN/plot_boundaries/prod.Dockerfile -t prod_plot_boundaries_detection:latest .
```