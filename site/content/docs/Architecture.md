---
title: "Architecture"
type: "develop"
date: 2017-02-03T15:04:10.000Z
---

    SNAS streams data from the network using a high performance collector. 
    The collector produces the parsed (and raw) BMP data to Kafka message bus 
    using a customizable topic structure.
    Consumer applications can access to data using regular Kafka APIs.
    One of these consumers is called mysql-consumer and is responsible for
    storing the data in a mysql/mariadb database. Applications can access
    the data in the database either using the RESTful API or natively.
        
## SNAS Flow

![](/img/snas-arch1.png)

Go to OpenBMP github repository: **https://github.com/OpenBMP**

Click on docker directory: **https://github.com/OpenBMP/docker**

Click on aio directory: **https://github.com/OpenBMP/docker/tree/master/aio**

aio is the all-in-one container that includes all the main components of OpenBMP: bmp collector, database, consumer that reads the data from the message bus and writes to the database, message bus, database api service, and RPKI validator.

Follow directions in this directory.

## Architecture I

Go to OpenBMP github repository: **https://github.com/OpenBMP**

Click on docker directory: **https://github.com/OpenBMP/docker**

Click on aio directory: **https://github.com/OpenBMP/docker/tree/master/ui**

OpenBMP UI is installed in its own container. 

Follow directions in this directory.




