# SIP


## Prerequisites and run with docker
* `Docker` and `docker-compose` are needed for running the app. Here are the instructions:

https://docs.docker.com/engine/installation/#platform-support-matrix

https://docs.docker.com/engine/installation/linux/linux-postinstall/

https://docs.docker.com/compose/install/

To run app make the next steps:
```
cd sip/
docker-compose up -d
```
Go to `localhost:3000`.

To reload add make the next:
```
docker-compose exec webapplication touch uwsgi.ini
```

To run tests make the next:
```
docker-compose exec webapplication ./manage.py test
```

## API
Go to  `localhost:9000/api/docs`

## Swagger
Go to  `localhost:9000/api/swagger`


## Admin
Go to  `localhost:9000/admin/`
```
username: admin
password: AiL9uumi
```


## Test user

```
username: test
password: jooZee9i
```

### Usage of apikey

```
curl -X POST "http://localhost:9000/api/login" -H "accept: application/json" -H "Content-Type: application/json" -d "{  \"username\": \"test\",  \"password\": \"jooZee9i\"}"
{"key":"507928511085e6684cfa105c74339d46fc097ad0"}
curl -H  "accept: application/json" http://localhost:9000/api/users/current?apikey=507928511085e6684cfa105c74339d46fc097ad0
{"pk":2,"username":"test","email":"","first_name":"","last_name":""}
```


## Jupyter
Go to http://127.0.0.1:8888/
password: God9uumi

# Working with k8s

## Installing kind for local development 

Check [kind documentation](https://kind.sigs.k8s.io/docs/user/quick-start/#installation) for details.

## Running local cluster with kind

To create cluster with kind use command:

`kind create cluster --config=./helpers/kind-config.yaml`

then use `kubectl` to interact with cluster.

Also you could use bash script `./k8s/helpers/start_cluster.sh` to deploy all components into local kind k8s cluster.


## Authorization on registry.quantumobile.co

### Local authorization

To auth locally visit [utility special endpoint](https://utility.quantumobile.co/2/registry/instructions/)
to receive bash command for authorization with login and password included, like:

`docker login --username ***********@quantumobile.com --password ***************************************************** https://registry.quantumobile.co`

### Authorizing k8s cluster to pull images

To allow k8s pull images you need to create special secret with command

`kubectl create secret docker-registry regcred --docker-server=https://registry.quantumobile.co --docker-username=***********@quantumobile.com --docker-password=***************************************************** --docker-email=***********@quantumobile.com`

## Building & Pushing images

### Web application

To build image for web application use command:
`docker build -t registry.quantumobile.co/sip-web-application:latest -f ./webapplication/prod.Dockerfile  ./webapplication`

To push image into registry use command:
`docker push registry.quantumobile.co/sip-web-application:latest`

### Web server

To build web server use command:

`docker build -t registry.quantumobile.co/sip-web-server:latest -f ./webserver/prod.Dockerfile  ./`

To push image into registry use command:

`docker push registry.quantumobile.co/sip-web-server:latest`

###  Use locally built images with kind

To make local images available for using in deployments and creating pods processes may be used command:

`kind load docker-image registry.quantumobile.co/sip-web-server:latest registry.quantumobile.co/sip-web-application:latest`
This command will copy locally built images into kind cluster.

[Check kind documentation for details](https://kind.sigs.k8s.io/docs/user/quick-start/#loading-an-image-into-your-cluster).

## NFS server in docker container for local development

For development purpure could be used simple NFS server.
Command below created local NFS server with 3 exports:
 - `./data` : for mounting PV with data 
 - `./mapbox` : for mounting PV with mapbox cache
 - `./db` : for mounting PV with Postgresql database files

`docker run -d --name nfs --privileged -e NFS_EXPORT_0='/nfs *(fsid=0,ro,insecure,no_subtree_check)' -e NFS_EXPORT_1='/nfs/data *(fsid=1,rw,insecure,no_subtree_check,no_root_squash)' -e NFS_EXPORT_2='/nfs/mapbox *(fsid=2,rw,insecure,no_subtree_check,no_root_squash)' -e NFS_EXPORT_3='/nfs/db *(fsid=3,rw,insecure,no_subtree_check,no_root_squash)' -v nfs:/nfs -v /home/dlukash/Projects/sip/data:/nfs/data -v mapbox:/nfs/mapbox -v db:/nfs/db -p 2049:2049 erichough/nfs-server:latest`