---
title: "PostgreSQL and TimescaleDB"
date: 2018-08-03T15:00:00.000Z
---


Coming soon... Better network monitoring and analytics with **PostgreSQL and TimescaleDB**.

<!--more-->

OpenBMP collectors produce parsed/translated BGP messages to Kafka for many applications to consume.  This 
follows the *"produce once and consume by many"* model. 

OpenBMP included a MySQL (MariaDB) DB for analytics of the state maintained RIB's and 
time series data.  The MySQL consumer will remain for a while, but will only be sustained for bug fixes. 
  

#### MySQL/MariaDB has served well for the past few years but it has the following shortcomings

- **Manual partition management for time series data**:   Partition management of the time
 series tables has been a problem for operators.  While MySQL does support partitions, you have to
 keep on top of dropping old partitions and repartition the **pOther** partition for upcoming date ranges. 
 This has proven to be a challenge for operators. More often than not, disk space runs out before
 the partitions have been maintained.  If disk space runs out, a MySQL recovery is needed. [TimescaleDB](http://www.timescale.com)
 addresses this problem.  
 
- **InnoDB recovery is horrible**: When disk space runs out, recovering can take hours.  If not
performed correctly, data loss results.  Postgres recovers quickly without requiring a manual configuration
of recovery mode. Based on testing, the postgres WAL recovery out performs InnoDB.  

- **InnoDB requires a ton of memory**: In order to perform well, InnoDB requires a lot of memory. Postgres
has better performance with half the amount of memory.  

- **InnoDB data (e.g. ibdata) grows over time even with per-file tables**:  InnoDB stores various
information in ibdata. This includes pending transactions. This results in the **ibdata**
files growing in size over time.  Stopping MariaDB without a graceful shutdown results in this
file growing. We have seen the ibdata file, even with per-file tables, grow to over 100+ GB.   What
makes things worse is that the ibdata files cannot be truncated without having to drop/create the
tables again.  This basically results in huge amount of disk space that gets wasted over time. Postgres
does not have this issue.     

- **Difficultly in using multiple disks**: Often multiple disks are used to spread the load of writes/reads.
InnoDB supports a DATA DIRECTORY configuation, but it has to be configured per table.  What is worse is that it
needs to be configured per partition.  This increaes the operator complexity to maintain partitions. Postgres solves
this using **tablespaces** and makes it really easy to use one or more disks. 
   


#### PostgreSQL and TimescaleDB add the following new features

In addition to resolving the above shotcomings... 

- **Aggregation tables are back**: Aggregation tables are where we track and record history of changes over time. This
 includes prefix counts by peer and family, advertisements and withdrawals by router/peer/asn/prefix, originating ASN
 prefix counts by family, etc.  These tables were disabled by default in MySQL because the performance with more than
 60,000,000 prefixes resulted in very poor InnoDB performance on full-table scans.  In other words, it would take
 more than 30 minutes to generate the aggregations.  We can now do this in just a few minutes with Postgres.
 
 
- **Better scale**: The current RouteViews data set (demo) has over **141,000,000** prefixes being monitored and over 
  **175,600,000** advertisements/withdrawals logged per day.  Postgres and TimescaleDB
  perform well enough to keep up with this scale while supporting the complex aggregations. 
 
  
- **Customizable retention policies**: TimescaleDB provides a simple method to purge old data, such as ```SELECT drop_chunks(interval '3 months', 'conditions');```. 
This enables simple cron or pg_agent events to maintain the desired retention.


- **Array datatype**: Postgres supports an array datatype to enable AS PATH and communities to be arrays 
instead of a string. 


- **INET datatype**: This is far better than the mysql **varbinary** type used to store the ip address. **GIST**
indexing supports prefix aware queries (e.g. find prefix 10.10.10.10) that would otherwise not be possible in MySQL. 


- **Better JSON support**: While MySQL has minimal support, Postgres has better support of native JSON. JSON datatypes
can be indexed on the JSON field if/when needed. This makes it possible to store JSON within a single field/column
supporting extraction and indexing on individual JSON objects. 
 

#### PostgreSQL and TimescaleDB add the following fixes

- **Peer states**: If the router does not support/implement a delay (**initial delay**) between router INIT and PEER UP messages,
 the MySQL consumer could process the PEER UP after the updates.  This results in
some peers showing incorrect states.   This has been fixed with the Postgres consumer. 


- **Prefix History**: The MySQL consumer logged history to ```path_attr_log``` and ```withdrawn_log``` tables.  ```path_attr_log```
log table only contained history if the prefix had an atribute change.  While this saved on some space, it resulted
in confusion with tracking withdrawal and subsequent advertisements.   This has changed with the Postgres consumer.
There is now a signle table ```ip_rib_log``` that contains both advertisements and withdrawals.  Duplicate advertisements with
the same attributes will be suppressed only if the previous was not a withdrawal.  This results in a natural
log of prefix history by suppressing route-refresh noise while maintaining high fidelity (microsecond granularity).

- **Table/Schema Changes**: Many any of the tables have been modified for postgres datatypes.   Some of the tables have been renamed
for better clarity.  