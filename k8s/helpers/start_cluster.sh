#!/bin/bash 

kubectl apply -k ./

kubectl apply -f ./postgresql/postgresql-deployment.yaml
kubectl apply -f ./postgresql/postgresql-service.yaml

echo Wait 10s postgresql POD to start up
sleep 10s

kubectl apply -f ./webapplication/web-application-deployment.yaml
kubectl apply -f ./webapplication/web-application-service.yaml

echo Wait 10s web application POD to start up
sleep 10s

kubectl apply -f ./webserver/webserver-deployment.yaml
kubectl apply -f ./webserver/webserver-service.yaml