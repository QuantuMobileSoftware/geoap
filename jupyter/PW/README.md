#for adding planet_watchers package to sip project:
```
cd data/notebooks
git clone git@github.com:QuantuMobileSoftware/planetwatchers.git pw
cd pw
```

#for enabling nfs support
```
sudo apt-get install cifs-utils
sudo apt-get install nfs-common
```

#get some requirements from NFS server
go to project SIP root directory
```
sudo mount 192.168.1.58:/volume1/SIP /home/quantum/sip
cp -r --remove-destination /home/quantum/sip/.prod_notebooks_requirements/pw/.secret data/notebooks/pw
cp -r --remove-destination /home/quantum/sip/.prod_notebooks_requirements/pw/data data/notebooks/pw
sudo umount /home/quantum/sip
```

#for building images for prod
after updating all files from git repository, go to project SIP root directory
##copy requirements from repository to jupyter folder
```
cp -r --remove-destination data/notebooks/pw/environment.yml jupyter/PW/environment.yml
```
##for building common_disease_detection:latest
```
echo 'start building common_planet_watchers:latest'
docker build -f ./jupyter/PW/base.Dockerfile -t common_planet_watchers:latest .
```
##for building prod_crop_type:latest
```
echo 'start building prod_crop_type:latest'
docker build -f ./jupyter/PW/crop_type/prod.Dockerfile -t prod_sip_jupyter_pw:latest .

```