#!/bin/bash 

# Creating cluster
kind create cluster --config=./k8s/helpers/kind-config.yaml

kind load docker-image registry.quantumobile.co/sip-web-server:latest registry.quantumobile.co/sip-web-application:latest

kubectl apply -f ./k8s/namespace.yaml
kubectl wait --for=jsonpath='{.status.phase}'=Active namespace/sip
kubectl apply -f ./k8s/configMap.yaml
kubectl apply -f ./k8s/secret.yaml

kubectl apply -f ./k8s/volumes/sip-data-pv.yaml
kubectl apply -f ./k8s/volumes/sip-data-pvc.yaml

kubectl apply -f ./k8s/postgresql/postgresql.yaml

kubectl wait deployment -n sip postgres --for condition=Available=True
kubectl apply -f ./k8s/webapplication/webapplication.yaml

kubectl wait deployment -n sip webapplication --for condition=Available=True
kubectl apply -f ./k8s/webserver/webserver.yaml

# Ingres and controller
kubectl apply -f ./k8s/NGINX-kind-ingres-controller.yaml

kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=120s

kubectl apply -f ./k8s/sip-ingres.yaml