#!/usr/bin/env bash

# https://github.com/kubernetes/dashboard/blob/master/docs/user/access-control/creating-sample-user.md

cd ..
# create admin-user
kubectl apply -f dashboard-admin.yaml

#get admin-user token
kubectl -n kube-system get secret $(kubectl -n kube-system get sa/admin-user -o jsonpath="{.secrets[0].name}") -o go-template="{{.data.token | base64decode}}"
echo " "
microk8s dashboard-proxy