#!/bin/bash

#kubeadm reset -f

sudo kubeadm init  --cri-socket=/run/containerd/containerd.sock

mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config && sudo chown $(id -u):$(id -g) $HOME/.kube/config


sudo kubectl taint nodes --all node-role.kubernetes.io/master-

kubectl apply -f https://docs.projectcalico.org/manifests/calico.yaml

# https://metallb.universe.tf/installation/
#sipcalc 192.168.1.1/24
kubectl apply -f metallb/namespace.yaml
kubectl apply -f metallb/metallb_configmap.yaml
kubectl apply -f metallb/metallb.yaml


helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
#helm search repo ingress

kubectl create ns ingress-nginx
#helm show values ingress-nginx/ingress-nginx > ingress-nginx.yaml
helm install ingress-nginx ingress-nginx/ingress-nginx -n ingress-nginx --values ingress-nginx/ingress-nginx.yaml
#helm uninstall ingress-nginx -n ingress-nginx


helm repo add nvidia https://nvidia.github.io/gpu-operator
helm repo update

helm install --wait --generate-name \
     nvidia/gpu-operator \
     --set operator.defaultRuntime=containerd
