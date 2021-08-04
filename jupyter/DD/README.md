#for adding disease_detection package to sip project:
```
cd data/notebook
git clone git@github.com:QuantuMobileSoftware/disease_detection.git dd
cd dd
```


#for enabling nfs support 
```
sudo apt-get install cifs-utils
sudo apt-get install nfs-common
```


#get some requirements from NFS server
```
sudo mount 192.168.1.58:/volume1/SIP /home/quantum/sip
cp -r --remove-destination /home/quantum/sip/.prod_notebooks_requirements/dd/water_stress/sentinel2grid.geojson data/notebooks/dd
cp -r --remove-destination /home/quantum/sip/.prod_notebooks_requirements/dd/water_stress/jupyter_notebook_config.json data/notebooks/dd
sudo umount /home/quantum/sip
```

#for building images for prod
after updating all files from git repository, go to project SIP root directory
##copy requirements from repository to jupyter folder
```
cp -r --remove-destination data/notebooks/dd/requirements.txt jupyter/DD/requirements.txt
```
##for building common_disease_detection:latest
```
echo 'start building common_disease_detection:latest'
docker build -f ./jupyter/DD/base.Dockerfile -t common_disease_detection:latest .
```
##for building prod_water_stress_detection:latest
```
echo 'start building prod_water_stress_detection:latest'
docker build -f ./jupyter/DD/water_stress/prod.Dockerfile -t prod_water_stress_detection:latest .

```