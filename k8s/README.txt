# to start minikube
minikube start --driver=docker --mount

# to run app
kubectl apply -k ./

# to stop all
kubectl delete -k ./