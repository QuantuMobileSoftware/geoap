# GEOAP


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

# Work with registry.quantumobile.co

## Authorization on registry.quantumobile.co

### Local authorization

To auth locally visit [utility special endpoint](https://utility.quantumobile.co/2/registry/instructions/)
to receive bash command for authorization with login and password included, like:

`docker login --username ***********@quantumobile.com --password ***************************************************** https://registry.quantumobile.co`

### Authorizing k8s cluster to pull images from local registry

To allow k8s pull images you need to create special secret. Keep in mind that Secret is namespace bound object so you need to create namespace first:
```
kubectl create namespace sip --save-config && \
kubectl create secret docker-registry regcred \
  --docker-server=https://registry.quantumobile.co \
  --docker-username=***********@quantumobile.com \
  --docker-password=***************************************************** \
  --namespace=sip
```

## Building & Pushing images

### Web application

To build image for web application use command:
`docker build -t registry.quantumobile.co/sip-web-application:latest -f ./webapplication/prod.Dockerfile  ./webapplication`

To push image into registry use command:
`docker push registry.quantumobile.co/sip-web-application:latest`

### Webserver

To build image for webserver use command:

`docker build -t registry.quantumobile.co/sip-web-server:latest -f ./webserver/prod.Dockerfile  ./`

To push image into registry use command:

`docker push registry.quantumobile.co/sip-web-server:latest`

### Copying images into kind cluster

To copy images from host to kind cluster use command:

`kind load docker-image registry.quantumobile.co/sip-web-server:latest registry.quantumobile.co/sip-web-application:latest`

# Working with k8s

## Installing kind for local development 

Check [kind documentation](https://kind.sigs.k8s.io/docs/user/quick-start/#installation) for installation details.

## Running local cluster with kind

To create cluster with kind use command:

`kind create cluster  --config=./k8s/kind-config.yaml`

then use `kubectl` to interact with cluster.

## Running sip in k8s cluster

To run sip in kind use command:

`kubectl apply -f ./k8s/sip-deploy.yaml`

After this UI will be available on `http://localhost:31080/`

### Database initiation

During the first run and after volume erasing you need to populate data with initial and test values 
The next command will fill database with data:

`kubectl exec -it deploy/webapplication -- bash -c "python -m manage dbshell < clear.sql&&python -m manage dbshell < ./db.dump"`
