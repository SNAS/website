---
title: "SNAS Kafka Install"
date: 2017-08-11T18:00:00.000Z
---

Custom Geo-Coding
=================

The MairaDB/MySQL schema includes the ```geo_ip``` table that can be updated to add custom geo-coding to BGP Peers, routers, and link-state nodes.  The REST API will include/link to this table for geo-coding. 

### Geo-Coding table schema:

##### TABLE: **geo_ip**

```bash
+-------------------+-------------------------------------------------------+------+-----+---------+-------+
| Field             | Type                                                  | Null | Key | Default | Extra |
+-------------------+-------------------------------------------------------+------+-----+---------+-------+
| addr_type         | enum('ipv4','ipv6')                                   | NO   | MUL | NULL    |       |
| ip_start          | varbinary(16)                                         | NO   | PRI | NULL    |       |
| ip_end            | varbinary(16)                                         | NO   | MUL | NULL    |       |
| country           | char(2)                                               | NO   | MUL | NULL    |       |
| stateprov         | varchar(80)                                           | NO   | MUL | NULL    |       |
| city              | varchar(80)                                           | NO   | MUL | NULL    |       |
| latitude          | float                                                 | NO   |     | NULL    |       |
| longitude         | float                                                 | NO   |     | NULL    |       |
| timezone_offset   | float                                                 | NO   |     | NULL    |       |
| timezone_name     | varchar(64)                                           | NO   |     | NULL    |       |
| isp_name          | varchar(128)                                          | NO   |     | NULL    |       |
| connection_type   | enum('dialup','isdn','cable','dsl','fttx','wireless') | YES  |     | NULL    |       |
| organization_name | varchar(128)                                          | YES  |     | NULL    |       |
+-------------------+-------------------------------------------------------+------+-----+---------+-------+
```

##### **Notice** that the ```ip_start``` and ```ip_end``` IP addresses are ```varbinary(16)```.  We use the MySQL function ```inet6_aton(IP)``` to convert the printed IP address to binary. This function works for both IPv4 and IPv6.   

### CSV File format

We'll use a CSV file format to update in bulk the geo_ip table.

Schema is:

```
# Starting IP, Ending IP, City, State, Country, Latitude, Longitude, Org Name, ISP Name, TZ Offset, TZ Name
```

* Starting IP
* Ending IP
* City
* State
* Latitude
* Longitude
* Org Name
* ISP Name
* TZ Offset
* TZ Name

#### Example

```
# Starting IP,Ending IP,City,State,Country,Latitude,Longitude,Org Name,ISP Name,TZ Offset,TZ Name
::,FFFF:FFFF:FFFF:FFFF:FFFF:FFFF:FFFF:FFFF,Eugene,OR,US,44.044834,-123.0747942,rv,rv,0,UTC
 0.0.0.0                            ,255.255.255.255,Eugene,OR,US,44.044834,-123.0747942,rv,rv,0,UTC
185.1.27.0,185.1.27.255,Belgrade,Serbia,RS,44.8154029,20.2821721,rv-sox,rv,0,UTC
187.16.216.0,182.16.223.255,San Paulo,BR,BR,-22.986197,-50.9793001,rv-spix,rv,0,UTC
193.105.163.0,193.105.163.255,Belgrade,Serbia,RS,44.8154029,20.2821721,rv-sox,rv,0,UTC
195.66.224.0,195.66.226.255,London,LN,GB,52.0402552,-0.7259395,rv-linx,rv,0,UTC
195.66.236.0,195.66.239.255,London,LN,GB,52.0402552,-0.7259395,rv-linx,rv,0,UTC
196.223.14.0,196.223.15.255,Johannesburg,ZA,AF,-26.1713505,27.9699847,rv-jinx,rv,0,UTC
196.223.21.0,196.223.21.255,Nairobi,KE,AF,-1.3044564,36.7073117,rv-kixp,rv,0,UTC
198.32.132.0,198.32.132.255,Atlanta,GA,US,33.755468,-84.3937268,rv-telx,rv,0,UTC
198.32.176.0,198.32.176.254,Palo Alto,CA,US,37.4254387,-122.1696281,rv-isc,rv,0,UTC
198.32.195.0,198.32.195.255,Portland,OR,US,45.5425913,-122.7945048,rv-nmax,rv,0,UTC
2001:12f8::,2001:12f8:FFFF:FFFF:FFFF:FFFF:FFFF:FFFFF,San Paulo,BR,BR,-22.986197,-50.9793001,rv-spix,rv,0,UTC
2001:200:0:fe00::,2001:200:0:fe00:FFFF:FFFF:FFFF:FFFF,Tokyo,JP,JP,35.6735404,139.5699623,rv-wide,rv,0,UTC
```


### Convert the CSV to MySQL/MariaDB Syntax

There are several ways to take the CSV and convert it into a bulk update query or individual queries.  Below is an example AWK based scrip that should run on any Unix like system (including Mac OSX).  

If the filename is **geo-coding-data.csv**

```
awk -F ',' '{ 
      if (index($1,"."))
         addr_type = "ipv4";
      else
         addr_type = "ipv6";

      if ($0 !~ /[:space]*#.*/ && length($1) > 0)
        printf("REPLACE INTO geo_ip (addr_type,ip_start,ip_end,city,stateprov,country, \
                    latitude,longitude,organization_name,isp_name,timezone_offset,timezone_name) \
                values (\"%s\",inet6_aton(trim(\"%s\")),inet6_aton(trim(\"%s\")),\"%s\",\"%s\",\"%s\",%f,%f,\"%s\",\"%s\",\"%d\", \"%s\");\n",
            addr_type, $1, $2, $3, $4, $5, $6, $7, $8, $9,$10,gsub(/\n/, "", $11));
  }' geo-code-data.csv
```

#### Example

```
REPLACE INTO geo_ip (addr_type,ip_start,ip_end,city,stateprov,country,
                    latitude,longitude,organization_name,isp_name,timezone_offset,timezone_name)
                values ("ipv6",inet6_aton(trim("::")),inet6_aton(trim("FFFF:FFFF:FFFF:FFFF:FFFF:FFFF:FFFF:FFFF")),"Eugene","OR","US",44.044834,-123.074794,"rv","rv","0", "0");
REPLACE INTO geo_ip (addr_type,ip_start,ip_end,city,stateprov,country,
                    latitude,longitude,organization_name,isp_name,timezone_offset,timezone_name)
                values ("ipv4",inet6_aton(trim(" 0.0.0.0                            ")),inet6_aton(trim("255.255.255.255")),"Eugene","OR","US",44.044834,-123.074794,"rv","rv","0", "0");
REPLACE INTO geo_ip (addr_type,ip_start,ip_end,city,stateprov,country,
                    latitude,longitude,organization_name,isp_name,timezone_offset,timezone_name)
                values ("ipv4",inet6_aton(trim("185.1.27.0")),inet6_aton(trim("185.1.27.255")),"Belgrade","Serbia","RS",44.815403,20.282172,"rv-sox","rv","0", "0");
REPLACE INTO geo_ip (addr_type,ip_start,ip_end,city,stateprov,country,
                    latitude,longitude,organization_name,isp_name,timezone_offset,timezone_name)
                values ("ipv4",inet6_aton(trim("187.16.216.0")),inet6_aton(trim("182.16.223.255")),"San Paulo","BR","BR",-22.986197,-50.979300,"rv-spix","rv","0", "0");
REPLACE INTO geo_ip (addr_type,ip_start,ip_end,city,stateprov,country,
                    latitude,longitude,organization_name,isp_name,timezone_offset,timezone_name)
                values ("ipv4",inet6_aton(trim("193.105.163.0")),inet6_aton(trim("193.105.163.255")),"Belgrade","Serbia","RS",44.815403,20.282172,"rv-sox","rv","0", "0");
```

### Update BGP Peers and Routers

Link state uses the ```geo_ip``` table real-time, but ```bgp_peers``` and ```routers``` are updated only on change.   To trigger an change/update, issue the following:


```
update routers set timestamp = current_timestamp;
update bgp_peers set timestamp = current_timestamp;
```
