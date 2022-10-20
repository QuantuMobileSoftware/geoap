#!/bin/bash 

kind create cluster --config=./k8s/helpers/kind-config.yaml
kind load docker-image registry.quantumobile.co/sip-web-server:latest registry.quantumobile.co/sip-web-application:latest

kubectl apply -k ./k8s/

kubectl apply -f ./k8s/postgresql/postgresql-deployment.yaml
kubectl apply -f ./k8s/postgresql/postgresql-service.yaml

kubectl wait deployment -n prod postgres --for condition=Available=True

kubectl apply -f ./k8s/webapplication/web-application-deployment.yaml
kubectl apply -f ./k8s/webapplication/web-application-service.yaml

kubectl wait deployment -n prod webapplication --for condition=Available=True

kubectl apply -f ./k8s/webserver/webserver-deployment.yaml
kubectl apply -f ./k8s/webserver/webserver-service-nodeport.yaml