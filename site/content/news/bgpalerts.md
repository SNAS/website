---
title: "Internet BGP Monitoring"
date: 2018-08-04T17:30:00.000Z
---


Real-time Internet hijack and leak BGP monitoring.  

Subscribe to the alerts on gitter!

<!--more-->

[Snas Alerting](https://gitter.im/snas/alerts) is a live message feed of hijack and leak
alerts.  Every Internet IPv4 and IPv6 prefix is being monitored.

A learning algorithm is used to reduce noise, such as the ability to follow IP lease/allocation movement. 
 
The ALG adapts to routing presence by alerting once on initial detection and then suppressing subsequent alerts
if the offending ASN or prefix is actively and consistently routed by 20% or more diverse peers.  
If the prefix/ASN is no longer advertised, it'll expire and a new alert will be generated when seen again.  
For example, company A leaks a prefix and then corrects that mistake a day later.  The ALG will alert
once on initial leak and then suppress until the hijack/leak has been resolved.  If the prefix
is again leaked
(e.g. by mistake) it'll be alerted again after a grace period. The grace periods (ages) are different
based on the type of leak (transit, upstream, or origin).  Currently these are set to 3 hours for origin
leaks and 2 days for upstream and transit leaks/hijacks.  They objective here, and is believed to be working, is
to detect all hijacks/leaks that occur once or multiple times without the currently seen alert noise.  

{{% figure src="/img/demo-shots/gitter-alerts.png" link="https://gitter.im/snas/alerts" 
    class="w-80 center" %}}

> This application is currently in **proof of concept**.
 

Leak and hijack detection is a separate application that monitors the live BGP feeds. 
Contact **tim@snas.io** if you are interested in this or if you find a problem with it.

     
