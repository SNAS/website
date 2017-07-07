---
title: "Rest Integration"
date: 2017-01-04T15:04:10.000Z
---

<p>Network data published by the snas.io collector is stored in a MySQL database and developers can directly query the DB.
    See example MySQL queries <a href="/docs/examples">here</a>.</p>

<p><br>Alternatively, the DB supports REST APIs that developers can use to query the DB. A full list of the
REST APIs supported can be found <a href="https://github.com/OpenBMP/db_rest">here</a>.</p>

<p>All queries have the following JSON syntax/output:</p>
<img src="/img/json_format_for_website.png" alt="" class="left db mb1" style="width: 740px">

<p>Below is an example DB response to a GET for count of BGP peers by type (GET /db_rest/v1/peer/type/count)-</p>

<img src="/img/json_output_for_website.png" alt="" class="left db mb1" style="width: 740px">

The REST interface provide multiple APIs to get filtered data about BGP peers and prefixes in widely
adopted JSON format - a flexible and extensible alternative to MySQL queries or using Kafka data from the message bus directly!
