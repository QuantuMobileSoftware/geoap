You need fresh install of Ubuntu 20.04.
Dont install nvidia drivers, if you have one -
remove all Nvidia packages
    sudo dpkg -P $(dpkg -l | grep nvidia | awk '{print $2}')

Edit /etc/default/grub
set
    GRUB_CMDLINE_LINUX_DEFAULT="modprobe.blacklist=nouveau nouveau.modeset=0"
    sudo update-grub
    sudo reboot

To install kubeadm run:
install_kubeadm.sh

Then you can install cluster with gpu support. Run -
install_cluster.sh

now You can run all SIP system by single command. Run -
cd ../../../k8s/utils
start.sh

For stopping all run -
stop.sh