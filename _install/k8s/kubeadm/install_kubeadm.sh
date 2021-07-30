#!/bin/bash

sudo modprobe overlay
sudo modprobe br_netfilter
cat <<EOF | sudo tee /etc/modules-load.d/containerd.conf
overlay
br_netfilter
EOF

cat <<EOF | sudo tee /etc/sysctl.d/99-kubernetes-cri.conf
net.bridge.bridge-nf-call-iptables  = 1
net.ipv4.ip_forward                 = 1
net.bridge.bridge-nf-call-ip6tables = 1
EOF

sudo iptables -A INPUT -p tcp --dport 6443 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 6783 -j ACCEPT
sudo iptables -A INPUT -p udp --dport 6783 -j ACCEPT
sudo iptables -A INPUT -p udp --dport 6784 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 7946 -j ACCEPT
sudo iptables -A INPUT -p udp --dport 7946 -j ACCEPT
iptables-save > /etc/iptables/rules.v4

sudo sysctl --system

sudo apt-get update
sudo apt-get install -y containerd

sudo mkdir -p /etc/containerd
sudo containerd config default | sudo tee /etc/containerd/config.toml

# edit /etc/containerd/config.toml
#Within the [plugins."io.containerd.grpc.v1.cri".containerd.runtimes.runc] section, add the following lines:
  #[plugins."io.containerd.grpc.v1.cri".containerd.runtimes.runc.options]
  #  SystemdCgroup = true

#Within the [plugins."io.containerd.grpc.v1.cri".registry.mirrors] section, add the following lines:
#  [plugins."io.containerd.grpc.v1.cri".registry.mirrors."192.168.1.34:5000"]
#    endpoint = ["http://192.168.1.34:5000"]

sudo cp ./containerd/config.toml /etc/containerd/config.toml

sudo systemctl restart containerd

sudo swapoff -a

sudo apt-get update
sudo apt-get install -y apt-transport-https
curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key add -
echo "deb http://apt.kubernetes.io/ kubernetes-xenial main" | sudo tee -a /etc/apt/sources.list.d/kubernetes.list
sudo apt-get update && sudo apt install -y kubelet kubeadm kubectl
sudo apt-mark hold kubelet kubeadm kubectl

curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3
chmod 700 get_helm.sh
./get_helm.sh
