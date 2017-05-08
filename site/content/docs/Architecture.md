---
title: "SNAS Architecture"
type: "develop"
date: 2017-05-07T15:04:10.000Z
---

The main architectural components of the SNAS framework are:  
  
A high speed, low foot print collector, a high performance message bus, consumer applications, database, APIs and user applications
        
<!--more-->

## Flow

SNAS streams data from the network using a high performance collector. 
    The collector produces the parsed (and raw) BMP data to Kafka message bus 
    using a customizable topic structure.
    
![](/img/arch1.svg)

Consumer applications can access to data using regular Kafka APIs.
    One of these consumers is called mysql-consumer and is responsible for
    storing the data in a mysql/mariadb database. Applications can access
    the data in the database either using the RESTful API or natively.
    
## Architecture Diagram

![](/img/arch2-1.svg)

## Application Integration (Database)

![](/img/arch2-2.svg)

## Application Integration (Message Bus)

![](/img/arch2-3.svg)

