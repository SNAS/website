---
title: Alerting Analytics App
image: background_image_01.png
---
**Watcher** is an application that implements user-defined analyses for alerting.
It is integrated within the SNAS pipeline of received data to perform various analytics. Each analysis is
grouped into an event **rule** that gets logged or transmitted to a remote alerting system.

Watcher is implements a push model to deliver events as they are generated.  
<!--more-->

[Take me to the demo!](http://demo.snas.io:8001/)


*Streaming Network Analytics System* (**SNAS**) *enables analytics and machine learning on data as it is received and
processed. We refer to this as* **received-time** *analytics as opposed to* **post-time** *analytics. Post analytics is
when the analysis is performed after the fact by loading or querying historical data.*


> Received-time analytics can be considered real-time analytics if the data feed represents current time
> (e.g. live BMP feed from router). Data feeds can be replayed or batched (e.g. MRT interval based collection),
> which means it doesn't represent real-time.

Watcher rules are flexible and scalable to support deep analysis on all streaming data.  **Events can be pushed to
any system or platform**, such as [PNDA](http://pnda.io), ElasticSearch, Splunk, Cisco Spark, Slack, and many
more!

> All events in this demo are grouped by **peer** and by **period time**. Period time is currently set to
> **30 minutes.** The period time enables visualization of the same event being seen by several peers,
> common with propagation. Grouping the events by peers and period time also helps identify impact based
> on peers seeing the same event.


{{% figure src="/img/demo-shots/watcher-1.png" link="http://demo.snas.io:8001/" 
    class="w-80 center" %}}


