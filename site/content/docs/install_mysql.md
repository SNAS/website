---
title: "SNAS MySQL Install"
date: 2017-01-04T15:04:10.000Z
---

SNAS MySQL Docker Install Steps
===========================================

<!--more-->
MySQL container includes MariaDB, MySQL consumer and the REST API.  This container providers everything needed
to get started with collecting data from the SNAS collector Kafka integration.

#### Container Includes:
* **MariaDB 10.2** - MySQL server (listening port TCP 3306)
* **SNAS MySQL Consumer** - Latest Consumer that puts all data into MySQL
* **DB_REST** - Latest REST interface for MySQL database


### Recommended Current Linux Distributions:

1. Ubuntu 16.04/Xenial
1. CentOS 7/RHEL 7

### **Installation Steps**

- - -

### 1) Install docker
Docker host should be **Linux x86_64**.   Follow the [Docker Instructions](https://docs.docker.com/installation/) to install docker.  


### 2) Download the docker image

    docker pull openbmp/mysql

### 3) Create MySQL volumes
MySQL/MariaDB uses a shared container (host) volume so that if you upgrade, restart or change the container it doesn't lose the database contents.  **The database will be initialized if the volume is empty.**  If the volume is not empty, the database will be left unchanged.

When starting the container you will need to map a host file system to **/data/mysql** for the container.  You do this using the ```-v <host path>:/data/mysql```.  The below examples default to the host path of ```/var/openbmp/mysql```

#### On host create MySQL shared directory:

    mkdir -p /var/openbmp/mysql
    chmod 777 /var/openbmp/mysql 

> #### NOTE
> The mode of 777 can be changed to chown <user> but you'll have to get that ID 
> by looking at the file owner after starting the container. 
    

#### *Applying Latest Database Schema* 
To reinit the database and apply the latest schema use docker run with the ```-e REINIT_DB=1``` option.

### 4) Add persistent configs [OPTIONAL] 

#### On host create persistent config location

    mkdir -p /var/openbmp/config
    chmod 777 /var/openbmp/config

#### config/hosts
You can add custom host entries so that the collector will reverse lookup IP addresses using a persistent hosts file.

Run docker with ```-v /var/openbmp/config:/config``` to make use of the persistent config files.

You can also add other hosts into a container’s /etc/hosts file by using one or more --add-host flags. 

### 5) Run docker container

### Memory for MySQL
MySQL requires a lot of memory in order to run well.   Currently there is not a consistent way to check on the container memory limit. The ```-e MEM=size_in_GB`` should be specified in gigabytes (e.g. 16 for 16GB of RAM).   If you fail to supply this variable, the default will use **/proc/meminfo** .  In other words, the default is to assume no memory limit. 


#### Environment Variables
Below table lists the environment variables that can be used with ``docker -e <name=value>``

NAME | Value | Details
:---- | ----- |:-------
MEM | RAM in GB | The size of RAM allowed for container in gigabytes. (e.g. ```-e MEM=15```)
GROUP\_ID | string | The Kafka consumer group ID, default is 'openbmp-mysql-consumer'
KAFKA\_FQDN | hostanme or IP | Kafka broker hostname[:port].  Hostname can be an IP address
MYSQL\_ROOT\_PASSWORD | password | MySQL root user password.  The default is **OpenBMP**.  The root password can be changed using [standard MySQL instructions](https://dev.mysql.com/doc/refman/5.6/en/resetting-permissions.html).  If you do change the password, you will need to run the container with this env set.
MYSQL\_OPENBMP\_PASSWORD | password | MySQL openbmp user password.  The default is **openbmp**.  You can change the default openbmp user password using [standard mysql instructions](https://dev.mysql.com/doc/refman/5.6/en/set-password.html).  If you change the openbmp user password you MUST use this env.  

#### Run normally

- - -

### **IMPORTANT:** You **MUST define the KAFKA_FQDN** as a **'hostname'** (or fqdn) and not by IP. 
#### If all containers are running on the same node, this hostname can be local specific, such as 'localhost' or 'myhost'. 
#### If Kafka is running on a different server than the consumers and producers, then the KAFKA_FQDN should be a valid hostname that can be resolved using DNS. This can be internal DNS or manually done by updating the /etc/hosts file on each machine.

- - -

    docker run -d --name=openbmp_mysql -e KAFKA_FQDN=localhost -e MEM=15 \
         -v /var/openbmp/mysql:/data/mysql -v /var/openbmp/config:/config \
         -p 3306:3306 -p 8001:8001 \
         openbmp/mysql

> ### NOTE
>Allow at least a few minutes for mysql to init the database on first start.


### **Monitoring/Troubleshooting**
You can navigate all the log files from within the container. Connect to container using:
    
    docker exec -it openbmp_mysql bash

Or, you can use standard docker exec commands on host to monitor the log files.  To monitor logs, use: 

    docker exec openbmp_mysql tail -f /var/log/*.log

Or, you can monitor the docker container by getting the console logs. This is useful if the container exits due to invalid start or for another reason. 
To see console logs for collector, use:

    docker logs openbmp_mysql
    

Once the container is running you can connect to MySQL database using any ODBC/JDBC/MySQL client.

You can also connect to the database REST interface on port 8001.  For example: 

    http://localhost:8001/db_rest/v1/routers


### **System Start/Restart Config (Ubuntu 16.04/Xenial)**
 By default, the containers will not start automatically on system boot/startup.  You can use the below example to instruct the container to start automatically.

You can read more at [Docker Admin Guide](https://docs.docker.com/engine/admin/start-containers-automatically/) on how to start containers automatically. 

> #### IMPORTANT
> The ```--name=openbmp_mysql``` parameter given to the ```docker run``` command is used with the ```-a openbmp_mysql``` parameter below to start the container by name instead of container ID.  You can use whatever name you want, but make sure to use the same name used in docker run.

    cat <<END > /etc/init/mysql-openbmp.conf
    description "OpenBMP MySQL container"
    author "tim@openbmp.org"
    start on filesystem and started docker
    stop on runlevel [!2345]
    respawn
    script
      /usr/bin/docker start -a openbmp_mysql
    end script
    END
     
     


