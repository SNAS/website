---
title: "SNAS Kafka Install"
date: 2017-01-04T15:04:10.000Z
---

SNAS Kafka Docker Install Steps
===============================

<!--more-->

Kafka container is a pre-configured install for SNAS.  You can use this container for SNAS or you can use your own 
Kafka install.  SNAS supports consumer load balancing, so we do define at least 4 partitions.

#### Container Includes
* **Apache Kafka 0.10.1.1** - High performing message bus (listening ports are TCP 2181 and 9092)


### Recommended Current Linux Distributions

  1. Ubuntu 16.04/Xenial
  1. CentOS 7/RHEL 7


### **Installation Steps**

- - -

### 1) Install docker
Docker host should be **Linux x86_64**.   Follow the [Docker Instructions](https://docs.docker.com/installation/) to install docker.  


### 2) Download the docker image

    docker pull openbmp/kafka

### 3) Create Kafka persistent volume
Depending on your docker [devicedriver](https://docs.docker.com/engine/reference/commandline/dockerd/), the root filesystem in the container may not be the best
place to house the kafka data files.  The default for **devicemapper** is 10GB, which isn't enough
disk space for a large data collection.  The way to work around this is to use the below docker
volume.

    mkdir -p /var/openbmp/kafka
    chmod 777 /var/openbmp/kafka

> #### NOTE
> The mode of 777 can be changed to chown <user> but you'll have to get that ID 
> by looking at the file owner after starting the container. 


### 4) Run docker container

#### Environment Variables
Below table lists the environment variables that can be used with ``docker -e <name=value>``

NAME | Value | Details
:---- | ----- |:-------
**KAFKA\_FQDN** | hostname | **REQUIRED**. Fully qualified hostname for the docker host of this container. Will be used for API and Kafka. It is also the default OPENBMP_ADMIN_ID.
#### Run normally

- - -

### **IMPORTANT:** You **MUST define the KAFKA_FQDN** as a **'hostname'** (or fqdn) and not by IP. 
#### If all containers are running on the same node, this hostname can be local specific, such as 'localhost' or 'myhost'. 
#### If Kafka is running on a different server than the consumers and producers, then the KAFKA_FQDN should be a valid hostname that can be resolved using DNS. This can be internal DNS or manually done by updating the /etc/hosts file on each machine.

- - -

    docker run -d \
         --name=openbmp_kafka \
         -e KAFKA_FQDN=localhost \
         -v /var/openbmp/kafka:/data/kafka \
         -p 2181:2181 -p 9092:9092 \
         openbmp/kafka


### **Monitoring/Troubleshooting**
You can navigate all the log files from within the container. Connect to container using:
    
    docker exec -it openbmp_kafka bash

Or, you can use standard docker exec commands on host to monitor the log files.  To monitor logs, use: 

    docker exec openbmp_kafka tail -f /var/log/*.log

Or, you can monitor the docker container by getting the console logs. This is useful if the container exits due to invalid start or for another reason. 
To see console logs for collector, use:

    docker logs openbmp_kafka
    
You can also monitor individual Kafka topics to see messages.  For example, you can monitor the openbmp.parsed.unicast_prefix topic using:

    docker exec openbmp_kafka /usr/local/kafka/bin/kafka-console-consumer.sh -z localhost --topic openbmp.parsed.unicast_prefix

    
### **System Start/Restart Config (Ubuntu 16.04/Xenial)**
 By default, the containers will not start automatically on system boot/startup.  You can use the below example to instruct the container to start automatically.

You can read more at [Docker Admin Guide](https://docs.docker.com/engine/admin/start-containers-automatically/) on how to start containers automatically. 


> #### IMPORTANT
> The ```--name=openbmp_kafka``` parameter given to the ```docker run``` command is used with the ```-a openbmp_kafka``` parameter below to start the container by name instead of container ID.  You can use whatever name you want, but make sure to use the same name used in docker run.

    cat <<END > /etc/init/kafka-openbmp.conf
    description "OpenBMP Kafka container"
    author "tim@openbmp.org"
    start on filesystem and started docker
    stop on runlevel [!2345]
    respawn
    script
      /usr/bin/docker start -a openbmp_kafka
    end script
    END