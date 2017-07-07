---
title: "Message Bus Integration"
date: 2017-01-04T15:04:10.000Z
---


<p>The lightweight snas.io collector publishes data about the network including information about BGP peers,
routers participating in the openbmp protocol and sending data to the collector as well as parsed and raw
BGP updates to the Kafka message bus. Developers can directly consume the data by subscribing to various Kafka topics.
All the snas.io topics and parsed data formats can be found in the <a href="/docs/message_bus_api">Message Bus Specification</a></p>

<p><br>The example below shows an opensource utility, kafkacat, subscribing to a Kafka topic, 'openbmp.parsed.unicast_prefix', to
receive information about IPv4 and IPv6 unicast prefixes in the network-</p>
<img src="/img/topic_name_change_for_website.png" alt="" class="left db mb1" style="width: 740px">

<p>Developers can create their own custom topic names instead of the defaults, like 'openbmp.parsed.unicast_prefix' above,
by modifying the configuration file of the snas.io collector. In the example below, the topic name 'unicast_prefix' has been mapped
to a new topic name 'ipv4_unicast'. The snas.io now publishes the data about unicast prefixes to this new topic name.
Based on Kafka retention policies defined in the Kafka config, the old topic 'openbmp.parsed.unicast_prefix' will continue
to persist and have old records about unicast prefixes.</p>

<img src="/img/topic_name_change_for_website_2.png" alt="" class="left db mb1" style="width: 740px">

<p>The data published to kafka is tab-delimited, and easy to manipulate using well-known linux utilities like awk, or
    programmatically as well as easily ingested by various editors and databases. In case developers want to consume the data in
json format (show of hands!) there are  <a href="https://github.com/OpenBMP/openbmp-python-api-message">Python</a> and
    <a href="https://github.com/OpenBMP/openbmp-java-api-message">Java</a> libraries that convert the tab-delimited data into
json format-</p>

<img src="/img/python_lib_output_for_website.png" alt="" class="left db mb1" style="width: 740px">