---
title: Grafana Analytics & Monitoring
image: background_image_01.png
---
You can use **Grafana** to interact with the state maintained data as well as the analytical and time
series data in PostgreSQL. 

This is a fully functional demo using live data from RouteViews. 

<!--more-->

[Take me to the demo!](http://rv-obmp.cisco.com:3000/)


## Dashboards

### Top Prefixes

Visualizes prefix advertisements and withdrawals by router, peer, and prefix. This dashboard enables the operator by showing which
routers, peers, and prefixes are causing the most noise.  

{{% figure src="/img/demo-shots/grafana-tops.png" link="http://rv-obmp.cisco.com:3000/d/000000007/top-by-prefixes?orgId=2" 
    class="w-80 center" %}}

### Looking Glass

This looking glass shows the prefix over all routers and peers. This is unlike other looking glasses that only show
the prefix over peers on a single router.  This looking glass can be used to visualize a prefix over the entire
or filtered set of routers and peers.    RPKI and IRR validation is included.

{{% figure src="/img/demo-shots/grafana-looking-glass.png" link="http://rv-obmp.cisco.com:3000/d/u8FgTcFik/looking-glass?orgId=2" 
    class="w-80 center" %}}


### Prefix History

Advertisements and withdrawals are logged in TimescaleDB.  Every prefix change is recorded and can be visualized. Simply
input the prefix and time range of interest.  The complete history will be shown.  

> **NOTE**: OpenBMP removes duplicates caused by route-refresh and/or peer flaps.  Changes will be shown only if the
> prefix was withdrawn then advertised or if advertised again with some attribute change.  This is important
> because peers that flap or peers that see routes due to route-refresh do not result in additional logging.   

The SQL query supports any level of filtering.  The **provided** dashboards include:

- Filtering by Router
- Filtering by Peer
- Filtering by Originating ASN
- Filtering by Prefix


{{% figure src="/img/demo-shots/grafana-prefix-hist-asn.png" link="http://rv-obmp.cisco.com:3000/d/lfGwISKiz/prefix-history-by-asn?orgId=2" 
    class="w-80 center" %}}
    

### RPKI and IRR

RPKI and IRR validation is as simple as a JOIN query.  This dashboard provides RPKI and IRR data statistics 
based on advertisements in the time range configured. 

{{% figure src="/img/demo-shots/grafana-rpki.png" link="http://rv-obmp.cisco.com:3000/d/000000013/bgp-sec-rpki-and-irr?orgId=2" 
    class="w-80 center" %}}
    

### Inventory

Inventory visualizes routers and peers.  This includes router peer counts and peer rib counts.  

{{% figure src="/img/demo-shots/grafana-inv.png" link="http://rv-obmp.cisco.com:3000/d/000000011/inventory?orgId=2" 
    class="w-80 center" %}}


### HiJack/Leak Alerts

This application is currently in proof of concept.

Leak and hijack detection is a separate application that monitors the live BGP feeds.  The alerts are
based on Internet monitoring of new transits, upstreams, and origins for every Internet prefix.  This detects
99.9% of leaks and hijacks with less than 1% false positives. Contact **tievens@cisco.com** if you are interested in this
or if you find a problem with it.     

Live alerts are also in gitter.  Check out [Snas/alerts](https://gitter.im/snas/alerts)

{{% figure src="/img/demo-shots/grafana-bgp-sec.png" link="http://rv-obmp.cisco.com:3000/d/000000005/bgp-sec-hijack-leak?orgId=2" 
    class="w-80 center" %}}
