---
title: "Requirements"
date: 2017-01-04T15:04:10.000Z
---

Runtime Requirements 
---------------------
*When running openbmpd and mysql*
-----------------------------------

<!--more-->

Various requirements and suggested system configurations for runtime and build installs. 

### Database

* **MySQL 5.7 or MairaDB 10.2 Series or greater**

### Shared Libraries
* **MySQL/MariaDB Client libraries version 5.7 / 10.2 or greater**
* **libstdc++6 Version 4.6.x or greater**  (gcc version 4.6.x or greater)

> #### NOTE
> MariaDB should work, but this has not been tested yet.  Testing will be performed for CentOS7/RHEL7 installs.
>Please email **tim@openbmp.org** if you would like CentOS/RHEL support sooner.  

Server Requirements
-------------------
It is recommended to use the following server configuration


### Collector (Openbmpd) 
Openbmpd is not disk or memory heavy.  Therefore the VM itself doesn't have to have a lot of disk or memory.  The key is CPU, which normally 2 vCPU's are sufficient, but in large environments with many routers it is recommended to have more vCPU's. 

| Arch      | vCPU      | RAM        | DISK        | DISK TYPE |
| --------- | --------- | ---------- | ----------- | ----------| 
| VM x86_64 | 2 or more | 2G or more | 10G or more | Any       |

### Database (MySQL/MariaDB)
The database is CPU, memory, and disk intensive. It's recommended that the database server be as large as you can afford.  The size is directly related to the number of prefixes/data being stored, not how many peers or routers are being monitored. If you are monitoring routers with full internet routing tables (many peers) then the below is the recommended minimum for the database server. 

| Arch      | vCPU      | RAM         | DISK        | DISK TYPE  |
| --------- | --------- | ----------- | ----------- | -----------| 
| VM x86_64 | 8 or more | 16G or more | 60G or more | SSD or SAN |


> #### NOTE
> Collector can coexist on the same server as the database.  If you run collector and the database on the same box, then it's okay to use the above for both.  



BUILD/Development Requirements 
------------------------------
*When compiling and building openbmpd from source*
-----------------------------------------------------

### Database *(same as runtime requirement)*
* **MySQL 5.7 or MairaDB 10.2 Series or greater**

### Shared Libraries *(same as runtime plus extras for development)*
* **MySQL/MariaDB Client libraries version 5.7 / 10.2 or greater**
* **libstdc++6 Version 4.6.x or greater**  (gcc version 4.6.x or greater)

### Development Libraries and Headers
* **Boost Headers 0.41.0** or greater
* **Gcc/G++/STDC++ 4.6.x** or greater
* **CMake 2.8.x** or greater
* **[librdkafka](https://github.com/edenhill/librdkafka) 0.9.5** or greater

> #### NOTE
> MariaDB should work, but this has not been tested yet.  Testing will be performed for CentOS7/RHEL7 installs.
> Please email **tim@openbmp.org** if you would like CentOS/RHEL support sooner.  

