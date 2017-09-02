---
title: Grafana Analytics & Monitoring
image: background_image_01.png
---
You can use **Grafana** to interact with the state maintained data as well as the analytical and time
series data in MySQL. 

This is a fully functional demo using live data from RouteViews. 

<!--more-->

> In the future we will be migrating the time series tables, such as the analysis ASN stats tables, to influxDB.

[Take me to the demo!](http://demo-rv.snas.io:3000/)


## Dashboards

1. **BGP Security** - Basically the same as the [Watcher App](/demo/demo-watcher/) but with some additional graphs. 
 
2. **Top ASN** - Various graphs showing ASN transit and originating prefix counts over time. 
Includes current stats for each ASN. 

3. **Top by Prefixes** - Graphs that highlight per router and peer RIB counts over time with 
top updates and withdraws by prefix. 

4. **Prefix History** - Table explorer of RIB update and withdraw history. 



{{% figure src="/img/demo-shots/grafana-top-asn.png" link="http://demo-rv.snas.io:3000/" 
    class="w-80 center" %}}


