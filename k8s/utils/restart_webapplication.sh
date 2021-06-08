#!/usr/bin/env bash

cd ..
#kubectl delete -k ./
for j in $(kubectl get jobs -o custom-columns=:.metadata.name)
do
    kubectl delete jobs $j &
done

kubectl delete -f webapplication-deployment.yaml
kubectl delete -f webserver-deployment.yaml

kubectl apply -f webserver-deployment.yaml
kubectl apply -f webapplication-deployment.yaml