---
title: "SNAS Ubuntu Install"
date: 2017-01-04T15:04:10.000Z
---

SNAS Install on Ubuntu 16.04/Xenial
===========================================

<!--more-->

Use these instructions to install SNAS directly on Ubuntu. 

### **Required Steps**

  1. Install either the **Server** or **Cloud** standard Ubuntu image available from [Ubuntu Download](http://www.ubuntu.com/download).
  1. Update the apt get repo
  1. Install collector (openbmpd) using package or from source
  1. Install MySQL consumer
  1. Install Apache Kafka 
  1. Install MySQL database server
  1. Create MySQL database and user
  1. Configure MySQL settings
  1. Restart MySQL
  1. Create/update the database schema
  1. Run collector (openbmpd)
  1. Run MySQL consumer (openbmp-mysql-consumer)


> #### NOTE
> Our builds of openbmpd statically links librdkafka so that you do not have to compile/install that. If needed, see [BUILD](build) for details on how to build/install librdkafka.


### Before using 'apt-get' do the following to make sure the repositories are up-to-date

```
sudo apt-get update
```

### **Install collector (openbmpd) via package**

   1. Download openbmpd [package for Ubuntu 14.04](https://build-jenkins-int.snas.io:8443/job/openbmp-server-ubuntu-trusty/lastSuccessfulBuild/artifact/build/deb_package). Works with Ubuntu 16.04.

   1. Install the package.                                                                                         
   
  
  
```
  dpkg -i openbmp-VERSION.deb**
```  
  
> #### NOTE  
> **You should have the dependencies already installed if you applied the above step.**

#### Example Collector Install Steps"

  
```
ubuntu@demo:~# sudo dpkg -i openbmp-0.11.0-pre3.deb 
(Reading database ... 57165 files and directories currently installed.)
Preparing to unpack openbmp-0.11.0-pre3.deb ...
Unpacking openbmp (0.11.0-pre3-pre3) over (0.10.0-pre3-pre3) ...
Setting up openbmp (0.11.0-pre3-pre3) ...
Processing triggers for ureadahead (0.100.0-16) ...
```

#### If installing from source

Follow the steps in [BUILD](build) to install via source from github.

### **Install MySQL consumer**

  Download the openbmp-mysql-consumer [package](https://build-jenkins-int.snas.io:8443/job/openbmp-mysql-consumer/lastSuccessfulBuild/artifact/target/).
      
      
> #### NOTE
> The consumer is a JAR file that is runnable using java -jar [filename].  In the near future this will be packaged in a DEB package so that you start it using 'service openbmp-mysql-consumer start'.  For now, you will need to run this JAR file via shell command.  See the last step regarding running the consumer for how to run it. 

### **Install Apache Kafka**

Follow the [Kafka Quick Start](http://kafka.apache.org/documentation.html#quickstart) guide in order to install and configure Apache Kafka.  You should have it up in running within minutes. 

> #### NOTE 
> Edit the **config/server.properties** file and make sure to define a valid FQDN for the variable **advertised.host.name** .  

The collector (producer) and consumers will connect to Kafka and receive the **advertised.host.name** as where it should contact the server.  If this is set to localhost the producer/consumer **will not be able to connect** successfully to Kafka, unless of course everything is running on a single node.

```
# Hostname the broker will advertise to producers and consumers. If not set, it uses the
# value for "host.name" if configured.  Otherwise, it will use the value returned from
# java.net.InetAddress.getCanonicalHostName().

advertised.host.name=bmp-dev.openbmp.org
```

#### Example Install Steps

```
# Install JRE
sudo apt-get install openjdk-7-jre-headless

sudo mkdir /usr/local/kafka
sudo chown $(id -u) /usr/local/kafka

wget http://supergsego.com/apache/kafka/0.8.2.1/kafka_2.10-0.8.2.1.tgz
tar xzf kafka_2.10-0.8.2.1.tgz
cd kafka_2.10-0.8.2.1
sudo mv * /usr/local/kafka/
cd /usr/local/kafka/

# Update the Kafka config
#    USE FQDN for this host that is reachable by the collectors
sed -i -r 's/^[#]*advertised.host.name=.*/advertised.host.name=collector.openbmp.org/' \
 config/server.properties
sed -i -r 's/^[#]*log.dirs=.*/log.dirs=\/var\/kafka/' config/server.properties

# Create the logs dir for Kafka topics
sudo mkdir -m 0750 /var/kafka
sudo chown $(id -u) /var/kafka

nohup bin/zookeeper-server-start.sh config/zookeeper.properties > zookeeper.log &
sleep 1
nohup bin/kafka-server-start.sh config/server.properties > kafka.log &
```

### **On DB server install MySQL**

> #### NOTE on MariaDB
> You can use MariaDB 10.0 or greater as well.  We have tested and validated that the schema and settings work with MariaDB >= 10.0
> You can gat instructions for installing MariaDB at [MariaDB Repositories](https://downloads.mariadb.org/mariadb/repositories/#mirror=digitalocean-nyc).  Make sure you **select Ubuntu 1604 LTS "xenial" 10.2**


```
sudo apt-get install software-properties-common
sudo apt-key adv --recv-keys --keyserver hkp://keyserver.ubuntu.com:80 0xF1656F24C74CD1D8
sudo add-apt-repository 'deb [arch=amd64,i386,ppc64el] http://sfo1.mirrors.digitalocean.com/mariadb/repo/10.2/ubuntu xenial main'
sudo apt update
sudo apt install mariadb-server
```

* Install will prompt for a MySQL root password, use one for the primary MySQL user 'root'

> #### NOTE
> The root password in mysql is the MYSQL root user account.  This can be any password you would 
> like to use. It is not related to the platform/system root user or any other user.  This password is only the primary "root" password used when using '**mysql -u root -p**'

* After install, MySQL should be running


### Login to MySQL and create the SNAS database and user account

Apply the below to create the database and user that will be used by the collector (openbmp daemon).

> **NOTE**
> The below defaults the openbmp username to use '**openbmp**' as the password.  Change the  
> identified by '**openbmp'** to something else.

```
mysql -u root -p

   create database openBMP;
   create user 'openbmp'@'localhost' identified by 'openbmp';
   create user 'openbmp'@'%' identified by 'openbmp';
   grant all on openBMP.* to 'openbmp'@'localhost';
   grant all on openBMP.* to 'openbmp'@'%';
```

### **MySQL Temporary Table Space**

Large queries or queries that involve sorting/counting/... will use a temporary table on disk.   We have found that using a **tmpfs** will improve performance. 


#### Create tmpfs (as root)

The below will also configure the tmpfs to be mounted upon restart/boot.

    mkdir -p /var/mysqltmp
    echo "tmpfs /var/mysqltmp tmpfs defaults,gid=mysql,uid=mysql,size=2400M,mode=0777 0 0" >> /etc/fstab
    mount /var/mysqltmp


### Update the /etc/my.cnf file to enable InnoDB and tune memory

The below **MUST** but adjusted based on your memory available.  Ideally it should be set as high as possible. Below is for a system that has 16G of RAM and 8vCPU.

> #### **IMPORTANT NOTE**
> You must define **max\_allowed\_packet** to **384M** or greater to support
> the bulk inserts/updates, otherwise you will get errors that indicate packet is
> is too large or that the server connection has gone away. 

* sudo vi /etc/mysql/my.cnf

Under **[mysqld]** section

```
# use the tmpfs mount point
tmpdir      = /var/mysqltmp

key_buffer_size     = 128M

# This is very IMPORTANT, must be high to handle bulk inserts/updates
max_allowed_packet  = 384M

net_read_timeout    = 45
thread_stack        = 192K
thread_cache_size   = 8

# This value should be roughly 80% of system memory
innodb_buffer_pool_size = 12G

# This value should be the GB value of the innodb_buffer_pool_size
#   Ideally one instance per GB
innodb_buffer_pool_instances =  12

transaction-isolation        = READ-UNCOMMITTED
innodb_flush_log_at_trx_commit  = 0
innodb_random_read_ahead        = 1
innodb_read_ahead_threshold     = 10
innodb_log_buffer_size    = 16M
innodb_log_file_size      = 2G
query_cache_limit         = 1G
query_cache_size          = 1G
query_cache_type          = ON
join_buffer_size          = 128M
sort_buffer_size          = 128M
innodb_sort_buffer_size   = 16M
myisam_sort_buffer_size   = 128M
read_rnd_buffer_size      = 128M
innodb_thread_concurrency = 0

max_heap_table_size       = 2M
tmp_table_size            = 2M
innodb_file_per_table     = ON
innodb_doublewrite        = OFF
innodb_spin_wait_delay    = 24
innodb_io_capacity        = 2000

# Adjust the below to roughly the number of vCPU's times 2
innodb_read_io_threads    = 16
innodb_write_io_threads   = 16
```

### Restart MySQL so that the changes to config take effect

* sudo service mysql restart

### Load the schema

Load the openbmp DB schema by downloading it from www.openbmp.org.  You can also get the 
latest from [GitHub OpenBMP](https://github.com/OpenBMP/openbmp)

> #### Choose the right schema
> See the [download](https://build-jenkins-int.snas.io:8443/job/openbmp-mysql-consumer/ws/database/)
 page for details on which schema to use for which package.

**Latest/Current DEB package uses the current schema as below**

```
curl -O https://raw.githubusercontent.com/OpenBMP/openbmp-mysql-consumer/master/database/mysql-openbmp-current.db

mysql -u root -p openBMP < mysql-openbmp-current.db 
```

> Use the password for root user that was created when MySQL was installed. 


### **Run the openbmp server (openbmpd)**

MySQL should be installed now and it should be running.   Collector is ready to run. 

**openbmpd**   *(normally installed in /usr/bin)*

```
  REQUIRED OPTIONS:
     -c <filename>     Config filename.
          OR
     -a <string>       Admin ID for collector, this must be unique for this collector.  hostname or IP is good to use


  OPTIONAL OPTIONS:
     -pid <filename>   PID filename, default is no pid file
     -l <filename>     Log filename, default is STDOUT
     -d <filename>     Debug filename, default is log filename
     -f                Run in foreground instead of daemon (use for upstart)

  OTHER OPTIONS:
     -v                   Version
     -h                   Help

  DEBUG OPTIONS:
     -debugDebug general items
     -dbgp             Debug BGP parser
     -dbmp             Debug BMP parser
     -dmsgbus          Debug message bus

  DEPRECATED OPTIONS:

       These options will be removed in a future release. You should switch to use the config file.
     -k <host:port>    Kafka broker list format: host:port[,...]
                       Default is 127.0.0.1:9092
     -m <mode>         Mode can be 'v4, v6, or v4v6'
                       Default is v4.  Enables IPv4 and/or IPv6 BMP listening port

     -p <port>         BMP listening port (default is 5000)
     -b <MB>           BMP read buffer per router size in MB (default is 15), range is 2 - 128
     -hi <minutes>     Collector message heartbeat interval in minutes (default is 5 minutes)
```

Below starts openbmp on port 5555 for inbound BMP connections using Kafka server localhost:9092 and buffer of 16MB per router. 

```
sudo openbmpd -a $(uname -n) -k localhost -b 16 -p 5555 -l /var/log/openbmpd.log -pid /var/run/openbmpd.pid
```

> **NOTE** 
> The above command uses 'sudo' because openbmp is creating the log file /var/log/openbmp.log and updating the pid file /var/run/openbmp.pid, which normally are not writable to normal users.  If the log and pid files are writable by the user running openbmpd, then sudo is not required. 


### **Run openbmp-mysql-consumer**

You can unpack the JAR file if you want to modify the logging config.  Otherwise,  you can run as follows:

> Consumer can run on any platform
    
      nohup java -Xmx512M -Xms512M -XX:+UseParNewGC -XX:+UseConcMarkSweepGC -XX:+DisableExplicitGC \
            -jar openbmp-mysql-consumer-0.1.0-081315.jar  -dh db.openbmp.org \
            -dn openBMP -du openbmp -dp openbmpNow -zk localhost > mysql-consumer.log &    
