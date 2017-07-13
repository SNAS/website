---
title: Browser UI App
image: background_image_01.png
---
**Browser UI** is the basic user interface into BMP maintained data.  The UI can be used
 to view the routers, peers, and ribs.  The UI implements many analysis components such as 
   ASN visualization, looking glass, geo-coding, prefix history and per peer aggregate
   analysis.  

<!--more-->


[Take me to the demo!](http://demo-rv.snas.io:8000/)

### **Login Information**

##### **Username**: demo
##### **Password**: snas 

### **Data Source**

This demo uses publically available data from [RouteViews](http://routeviews.org).   The 
[MRT2BMP](https://github.com/OpenBMP/openbmp-mrt2bmp) application is being used to load the
 RouteViews data every 15 minutes.   Initial RIB dumps are loaded on initial collection and when
 intervals are missed. 
 
 > You may notice in the **tops view** that the last 15 minutes of data may look to be missing
 > (flat line).  This is expected since the data is delayed by 15 to 20 minutes. 
 > The timestamps are available in the data, so once loaded the data will fill in those gaps. 
 > This delay is due to the collection source from MRT. This delay is **not** seen with
 > real-time live BMP feeds. 

{{% figure src="/img/demo-shots/browser-ui-1.png" link="http://demo-rv.snas.io:8000/" 
    class="w-80 center" %}}


{{% figure src="/img/demo-shots/browser-ui-2.png" link="http://demo-rv.snas.io:8000/" 
    class="w-80 center" %}}
 
 
