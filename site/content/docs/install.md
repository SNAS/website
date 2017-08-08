---
title: "SNAS Docker Install"
date: 2017-05-07T15:04:10.000Z
---

## SNAS Docker Install

<!--more-->

Use these instructions to install SNAS using docker containers.
 

(Prerequisite) Platform Docker Install
--------------------------------------

If you already have docker installed on your host you can skip this step and go to [Install SNAS Using Docker](#install-snas-using-docker).

### **All Linux Distributions**
Follow the [Docker Install Instructions](http://docs.docker.com/installation/) for your distro/platform. You should always use the latest docker version.

### **CentOS 6**

> #### NOTE
> CentOS 7 works fine by following the [Docker Install Instructions](http://docs.docker.com/installation/), so they are not documented here. 

The below are steps for how to install docker on CentOS 6.

```sh
# Add repo for docker package.  This works with CentOS 6.7 too
rpm -iUvh http://dl.fedoraproject.org/pub/epel/6/x86_64/epel-release-6-8.noarch.rpm

# Define any proxies if you have them
export http_proxy=https://proxy.blah.com:80
export https_proxy=https://proxy.blah.com:80

# Install docker
yum -y install docker-io

# add the below to /etc/sysconfig/docker if you have proxies
export http_proxy="http://proxy.blah.com:80"
export https_proxy="http://proxy.blah.com:80"

# Start docker
service docker start 
```


## Install SNAS Using Docker

Each docker file contains a readme file, see below:

* [All-In-One](install_aio)
* [UI](install_ui)
* [Collector](install_collector)
* [Kafka](install_kafka)
* [MySQL](install_mysql)

## Install SNAS Using docker-compose

As alternative to AIO docker image, Collector/Kafka/MySQL can be started up using [docker-compose](https://docs.docker.com/compose/install/).

```
docker-compose up
```