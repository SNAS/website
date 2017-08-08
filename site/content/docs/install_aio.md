---
title: "SNAS AIO Install"
date: 2017-01-04T15:04:10.000Z
---

SNAS All-In-One (AIO) Docker Install Steps
===========================================

<!--more-->

AIO container includes all SNAS components except UI. 

Before instaling AIO container, see various requirements and suggested system configurations at [Requirements](requirements).
 
Install Using Docker
--------------------

### docker hub: openbmp/aio
 AIO container includes everything needed to run the collector and store the data in MySQL. You can use this container to test/evaluate SNAS as well as run smaller deployments.  AIO container will most likely not be sufficient for larger production deployments because of the need for distributed collectors and a redundant pair of MySQL/MariaDB servers.

#### Container Includes:
* **Openbmpd** - Latest collector (listening port is TCP 5000)
* **MariaDB 10.2** - MySQL server (listening port TCP 3306)
* **Apache Kafka 0.10.1** - High performing message bus (listening ports are TCP 2181 and 9092)
* **Tomcat/DB_REST** - Latest Rest interface into MySQL/MariaDB (listening port TCP 8001)
* **SNAS MySQL Consumer** - Latest Consumer that puts all data into MySQL

### Recommended Current Linux Distributions:

1. Ubuntu 16.04/Xenial
1. CentOS 7/RHEL 7

### **Installation Steps**

- - -

### 1) Install docker
Docker host should be **Linux x86_64**.   Follow [Docker Instructions](https://docs.docker.com/installation/) to install docker.  


### 2) Download AIO docker image

    docker pull openbmp/aio
    
### 3) Create MySQL volumes

MySQL/MariaDB uses a shared container (host) volume so that if you upgrade, restart, change the container it doesn't lose the database contents.  **The database will be initialized if the volume is empty.**  If the volume is not empty, the database will be left unchanged.  

When starting the container you will need to map a host file system to **/data/mysql** for the container.  You do this using the ```-v <host path>:/data/mysql```.  The below examples default to the host path of ```/var/openbmp/mysql```.

#### On host create mysql shared directory

    mkdir -p /var/openbmp/mysql
    chmod 777 /var/openbmp/mysql


> #### NOTE
> The mode of 777 can be changed to chown <user> but you'll have to get that ID 
> by looking at the file owner after starting the container. 

 
#### *Applying Latest Database Schema* 
To reinit the database and apply the latest schema use docker run with the ```-e REINIT_DB=1``` option.


### 4) Run docker container



### Memory for MySQL
MySQL requires a lot of memory in order to run well.   Currently there is not a consistent way to check on the container memory limit. The ```-e MEM=size_in_GB`` should be specified in gigabytes (e.g. 16 for 16GB of RAM).   If you fail to supply this variable, the default will use **/proc/meminfo** .  In other words, the default is to assume no memory limit. 

#### Environment Variables
Below table lists the environment variables that can be used with ``docker -e <name=value>``

NAME | Value | Details
:---- | ----- |:-------
**KAFKA\_FQDN** | hostname | **REQUIRED**. Fully qualified hostname that can be resolved inside docker container (e.g. ```localhost```).
MEM | RAM in GB | The size of RAM allowed for container in gigabytes. (e.g. ```-e MEM=15```)
OPENBMP_BUFFER | Size in MB | Defines the openbmpd buffer per router for BMP messages. Default is 16 MB.  
MYSQL\_ROOT\_PASSWORD | password | MySQL root user password.  The default is **OpenBMP**.  The root password can be changed using [standard MySQL instructions](https://dev.mysql.com/doc/refman/5.6/en/resetting-permissions.html).  If you do change the password, you will need to run the container with this env set.
MYSQL\_OPENBMP\_PASSWORD | password | MySQL openbmp user password.  The default is **openbmp**.  You can change the default openbmp user password using [standard mysql instructions](https://dev.mysql.com/doc/refman/5.6/en/set-password.html).  If you change the openbmp user password you MUST use this env.  

- - -

### **IMPORTANT:**
### • You **MUST define the KAFKA_FQDN** as a **'hostname'** that can be resolved inside the docker container.
### • We recommend to set it to 'localhost' (or '127.0.0.1') if you are not planning to have your own clients (consumers or producers) outside this container.
### • KAFKA_FQDN is used by Kafka to advertise the leader (advertised.host.name) which handles all read and write requests for a partition. If it can not be resolved, there will be no messages published or consumed (without a clear error message in the logs).
### • **If** you are planning to have **your own clients outside the container** that need access to Kafka running inside the docker container,  then the 'hostname' must be resolvable inside the container as well as on the hosts where the container and the clients are running.

- - -

#### Run Normally

    docker run -d -e KAFKA_FQDN=localhost --name=openbmp_aio -e MEM=15 \
         -v /var/openbmp/mysql:/data/mysql \
         -v /var/openbmp/config:/config \
         -p 3306:3306 -p 2181:2181 -p 9092:9092 -p 5000:5000 -p 8001:8001 \
         openbmp/aio

> ### NOTE
>Allow at least a few minutes for mysql to init the database on first start.


### **Monitoring/Troubleshooting**
You can navigate all the log files from within the container. Connect to container using:
    
    docker exec -it openbmp_aio bash

Or, you can use standard docker exec commands on host to monitor the log files.  To monitor collector, use: 

    docker exec openbmp_aio tail -f /var/log/openbmpd.log

Or, you can monitor the docker container by getting the console logs. This is useful if the container exits due to invalid start or for another reason. 
To see console logs for AIO, use:

    docker logs openbmp_aio


Once the container is running you can run a HTTP GET on your browser to test that the API interface is working: 

    http://docker_host:8001/db_rest/v1/routers
    
### **System Start/Restart Config (Ubuntu 16.04/Xenial)**
By default, the containers will not start automatically on system boot/startup.  You can use the below example to instruct the openbmp/aio container to start automatically. 

You can read more at [Docker Admin Guide](https://docs.docker.com/engine/admin/start-containers-automatically/) on how to start containers automatically. 

> #### IMPORTANT
> The ```--name=openbmp_aio``` parameter given to the ```docker run``` command is used with the ```-a openbmp_aio``` parameter below to start the container by name instead of container ID.  You can use whatever name you want, but make sure to use the same name used in docker run.

    cat <<END > /etc/init/aio-openbmp.conf
    description "SNAS All-In-One container"
    author "tim@openbmp.org"
    start on filesystem and started docker
    stop on runlevel [!2345]
    respawn
    script
      /usr/bin/docker start -a openbmp_aio
    end script
    END
     