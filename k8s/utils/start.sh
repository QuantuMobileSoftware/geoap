#!/usr/bin/env bash

cd ..
kubectl apply -f namespace-sip-prod.yaml

cd utils
kubectl create secret docker-registry regcred --namespace="sip-prod" --docker-server="http://192.168.1.34:5000" --docker-username="registry" --docker-password="2uFXN3NAnr" --docker-email=""

cd ..
kubectl apply -k ./
