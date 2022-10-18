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

## Authorization on registry.quantumobile.co

### Local authorization

To auth locally visit [https://utility.quantumobile.co/2/registry/instructions/]
You will receive bash command for authorization, something like:

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

### Use locally builded images with minikube

Use command `eval $(minikube docker-env)`to point your terminal to use the docker daemon inside minikube. Now you can ‘build’ against the docker inside minikube, which is instantly accessible to kubernetes cluster. Just use build command above. Evaluating the docker-env is only valid for the current terminal. By closing the terminal, you will go back to using your own system’s docker daemon.

###  Use locally builded images with kind

To make local images available for using in deployments and creating pods processes may be used command:

`kind load docker-image registry.quantumobile.co/sip-web-server:latest registry.quantumobile.co/sip-web-application:latest`
This command will copy locally builded images into kind cluster.

[Check kind documentation for details](https://kind.sigs.k8s.io/docs/user/quick-start/#loading-an-image-into-your-cluster).

## Local NFS server for development

For development purpure could be used simple NFS server.
Command below mount ./data folder into NFS server in docker container.

`docker run -d --name nfs --privileged -v /home/dlukash/Projects/sip/data:/nfsshare -e SHARED_DIRECTORY=/nfsshare -p 2049:2049 itsthenetwork/nfs-server-alpine:latest`