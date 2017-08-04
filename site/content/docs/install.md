---
title: "SNAS Docker Install"
date: 2017-05-07T15:04:10.000Z
---

## SNAS Docker Install

<!--more-->

(Prerequisite) Platform Docker Install
--------------------------------------

> Ignore this step if you already have a current docker install. Go to [Install SNAS Using Docker](#install-snas-using-docker)

> #### NOTE
> You should use the latest docker version, documented in this section.

### CentOS 6

> #### CentOS 7 works fine by following the docker install instructions, so they are not documented here. 

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

### All Linux Distributions
Follow the [Docker Install Instructions](http://docs.docker.com/installation/) for your distro/platform. 


## Install SNAS Using Docker
Each docker file contains a readme file, see below:

* [All-In-One](install_aio)
* [UI](install_ui)
* [Collector](install_collector)
* [Kafka](install_kafka)
* [MySQL](install_mysql)

Install SNAS Using docker-compose
----------------------------
As alternative to [All In One](/docs/install_aio), docker image Collector, Kafka and Mysql can be started up using [docker-compose](https://docs.docker.com/compose/install/)

```
docker-compose up
```