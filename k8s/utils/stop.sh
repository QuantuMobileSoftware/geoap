#!/usr/bin/env bash

cd ..
kubectl delete -k ./
#kubectl delete -f sip-deployment.yaml
#kubectl delete -f frontend-deployment.yaml
#kubectl delete -f postgis-deployment.yaml
#kubectl delete -f sip_ingress.yaml