Docker IPv6 and AIO Container
=============================

[IPv6 with Docker](https://docs.docker.com/engine/userguide/networking/default_network/ipv6/) is a bit vague. 

What we have found is that docker will manage ```iptables``` IPv4 DNAT entires for each container port mapping but it will not do this for IPv6.  Using DNAT is ideal because it enables the docker container to receive the packets from the source via the **real source** address.  Being able to record the source address of the IP packets is important for tracking the connections to/from routers.

Current versions of docker use ```docker-proxy``` for each mapped port.  This is enabled by default and runs as a separate process for every port mapped to each container.

For example:

```sh
root     18566 18411  0 15:56 ?        00:00:11 docker-proxy -proto tcp -host-ip 0.0.0.0 -host-port 9092 -container-ip 172.17.0.2 -container-port 9092
root     18669 18411  0 15:56 ?        00:00:00 docker-proxy -proto tcp -host-ip 0.0.0.0 -host-port 8001 -container-ip 172.17.0.2 -container-port 8001
root     18716 18411  0 15:56 ?        00:00:00 docker-proxy -proto tcp -host-ip 0.0.0.0 -host-port 5000 -container-ip 172.17.0.2 -container-port 5000
root     18725 18411  0 15:56 ?        00:00:00 docker-proxy -proto tcp -host-ip 0.0.0.0 -host-port 3306 -container-ip 172.17.0.2 -container-port 3306
root     18733 18411  0 15:56 ?        00:00:00 docker-proxy -proto tcp -host-ip 0.0.0.0 -host-port 2181 -container-ip 172.17.0.2 -container-port 2181
```

If **DNAT** is configured, this proxy is **bypassed** and not used.  The proxy is used when **DNAT** is not configured.  The proxy does this by listening on the the mapped port. For example:

```sh
tcp6       0      0 :::8001                 :::*                    LISTEN      18669/docker-proxy off (0.00/0/0)
tcp6       0      0 :::9092                 :::*                    LISTEN      18566/docker-proxy off (0.00/0/0)
tcp6       0      0 :::2181                 :::*                    LISTEN      18733/docker-proxy off (0.00/0/0)
tcp6       0      0 :::5000                 :::*                    LISTEN      18716/docker-proxy off (0.00/0/0)
tcp6       0      0 :::3306                 :::*                    LISTEN      18725/docker-proxy off (0.00/0/0)
```

Docker does not appear to maintain ```ip6tables``` for IPv6 DNAT entires, which results in the proxy being used.  The proxy defaults to **IPv4** when performing a proxy from IPv6 connection to the container.  This results in the container seeing the IPv6 connection as IPv4 coming from the local machine (*e.g. 172.17.0.1*).  This is a bit odd for the container application since it only sees IPv4, not IPv6.   The collector is better served when it can communicate natively via IPv6, which includes the ability to see the **real IPv6** address of the connecting router (e.g. BMP sender).

See [PAT Configuration](#pat-configuration) for more details on how to enable the container to support docker proxy mode.

> #### NOTE:
> You can enable docker in bridged mode to configure the container with a real IPv6 address.  This document does not
> detail how to do that since the primary install of SNAS AIO is in a hosted environment (e.g. AWS) where the global IPv6
> address needs to be shared between the host VM and the AIO container. 

## Configure AIO to accept IPv6

By default the AIO container only listens for IPv4 connections.  You can enable the AIO container/collector to listen for IPv6 connections by following the below steps.

### Steps

1. Make sure your ```docker run``` included the ```-v /var/openbmp/config:/config``` volume mapping. If not, restart the container by doing a ```docker rm -f openbmp_aio``` followed by a ```docker run``` with the correct arguments. 
1. Copy the current default config to host folder: ```docker exec openbmp_aio cp /usr/etc/openbmp/openbmpd.conf /config/openbmpd.conf```
1. Edit ```/var/openbmp/config/openbmpd.conf``` and update ```listen_mode: v4``` to be ```listen_mode: v4v6```
    
    **For Example:**
    
    ```yaml
    base:
      # IPv4/IPv6 mode setting
      #    Can be "v4" "v6" or "v4v6"
      listen_mode: v4v6
    ```
1. Restart the docker container: ```docker restart openbmp_aio```


## Configuring Docker to Support IPv6 without Proxy (preferred)

Follow these steps to configure a current [install of docker](https://docs.docker.com/engine/installation/) to enable sharing the host IPv6 address with the container in a similar fashion as IPv4.  

### Steps

1. Edit ```/etc/default/docker``` and update ```DOCKER_OPTS``` variable by adding ```"--ipv6 --fixed-cidr-v6='fc00:172:17:0:0::/64'"```.  
    
    **For example:**
    
    ```sh
    DOCKER_OPTS="--ipv6 --fixed-cidr-v6='fc00:172:17:0:0::/64'"
    ```
    
1. Restart docker using: ```service restart docker```

    > **BEWARE**: This will stop all running containers
    
1. Start AIO: ```docker start openbmp_aio```

    > **NOTE**: The same run arguments can be used for both IPv4 and IPv6
    
1. Update ip6tables by adding DNAT entry using the following:
    
    ```sh
    # Below gets the dynamic IPv6 address that docker assigned for the container
    addr=$(docker inspect openbmp_aio | \
             grep GlobalIPv6Address | head -1 | awk -F ": " '{ gsub(/[,\"]/, "", $2); printf("%s", $2) }')
 
    # Add the DNAT rule
    ip6tables -t nat -A PREROUTING \! -i docker0 -p tcp -m tcp --dport 8001 -j DNAT --to-destination "[${addr}]:8001"
    ```
1. Verify that it looks good
    1. ```ps -ef | grep docker``` should show the new docker options for IPv6

        **For Example:**
        
        ```sh
        root     18411     1  2 15:55 ?        00:00:00 /usr/bin/docker daemon --ipv6 --fixed-cidr-v6='fc00:172:17:0:0::/64' --raw-logs

        ```
    1. Use curl to check IPv6 from a remote host

        **For example:**
        
        ```sh
        localadmin@cirl-ucs-1:~$ curl -6 -u openbmp:CiscoRA "http://\[2001:420:305c:102::70\]:8001/db_rest/v1/routers" | jq .
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100  4058  100  4058    0     0   386k      0 --:--:-- --:--:-- --:--:--  396k
{
  "routers": {
    "fetchTime_ms": 1,
    "queryTime_ms": 1,
    "size": 11,
    "data": [
      {
        "RouterHashId": "3b64382346ee80b009cf18a119bd6dac",
        "LastModified": "2017-08-17 22:18:39.363976",
        "InitData": "",
        "RouterName": "vmx-17.2",
        "RouterIP": "192.168.1.134",
        "RouterAS": null,
        "description": "Juniper Networks, Inc. vmx internet router, kernel FreeBSD JNPR-10.3-20170523.350481_build, Build date: 2017-06-01 23:55:22 UTC Copyright (c) 1996-2017 Juniper Networks, Inc.",
        "isConnected": 0,
        "isPassive": 0,
        "LastTermCode": 0,
        "LastTermReason": ""
      },
      {
        "RouterHashId": "626fa493fca4db22c9a89d94a710499e",
        "LastModified": "2017-08-11 22:44:02.000000",
        "InitData": "",
        "RouterName": "rtp5-dc-qualys-1.cisco.com",
        "RouterIP": "64.102.12.37",
        "RouterAS": null,
        "description": "",
        "isConnected": 0,
        "isPassive": 0,
        "LastTermCode": 65534,
        "LastTermReason": "ERROR: Unsupported BMP message version"
      },
      {
        "RouterHashId": "65e72b36e5e7182a97af31087c51b0e6",
        "LastModified": "2017-08-17 22:18:39.363976",
        "InitData": "",
        "RouterName": "XRv",
        "RouterIP": "192.168.1.135",
        "RouterAS": null,
        "description": " 6.1.4",
        "isConnected": 0,
        "isPassive": 0,
        "LastTermCode": 0,
        "LastTermReason": ""
      },
      {
        "RouterHashId": "69b62b1b1e706ee21e92523fb0cf3161",
        "LastModified": "2017-08-17 22:59:35.812793",
        "InitData": "",
        "RouterName": "",
        "RouterIP": "172.17.0.1",
        "RouterAS": null,
        "description": "",
        "isConnected": 0,
        "isPassive": 0,
        "LastTermCode": 65534,
        "LastTermReason": "ERROR: Unsupported BMP message version"
      },
      {
        "RouterHashId": "93ecaffd891977147dc2625569a32060",
        "LastModified": "2017-08-17 23:36:54.576136",
        "InitData": "",
        "RouterName": "tara-9k-03",
        "RouterIP": "200.1.1.3",
        "RouterAS": null,
        "description": "Cisco IOS XR Software, Version 6.1.1.11I[Default]\nCopyright (c) 2016 by Cisco Systems, Inc.",
        "isConnected": 0,
        "isPassive": 0,
        "LastTermCode": 0,
        "LastTermReason": ""
      },
      {
        "RouterHashId": "bbe959ad6d7bf6653c5db2478115e070",
        "LastModified": "2017-08-17 23:58:48.495167",
        "InitData": "",
        "RouterName": "tara-9k-02",
        "RouterIP": "200.1.1.2",
        "RouterAS": null,
        "description": "Cisco IOS XR Software, Version 5.3.4[Default]\nCopyright (c) 2016 by Cisco Systems, Inc.",
        "isConnected": 1,
        "isPassive": 0,
        "LastTermCode": 0,
        "LastTermReason": ""
      },
      {
        "RouterHashId": "c3e1ab7b0c5574424d0b2fcd9bfa5d7b",
        "LastModified": "2017-08-17 23:58:48.491798",
        "InitData": "",
        "RouterName": "tara-mx-06",
        "RouterIP": "200.1.1.6",
        "RouterAS": null,
        "description": "Juniper Networks, Inc. mx960 internet router, kernel JUNOS 14.2R6.5, Build date: 2016-04-05 05:54:04 UTC Copyright (c) 1996-2016 Juniper Networks, Inc.",
        "isConnected": 0,
        "isPassive": 0,
        "LastTermCode": 0,
        "LastTermReason": ""
      },
      {
        "RouterHashId": "d123b2aee26b1c8a0caad3c8192e2a41",
        "LastModified": "2017-08-17 22:18:39.363976",
        "InitData": "",
        "RouterName": "vmx-15.1",
        "RouterIP": "192.168.1.129",
        "RouterAS": null,
        "description": "Juniper Networks, Inc. vmx internet router, kernel FreeBSD JNPR-10.1-20160616.329709_builder_stable_10, Build date: 2016-07-01 14:15:55 UTC Copyright (c) 1996-2016 Juniper Networks, Inc.",
        "isConnected": 0,
        "isPassive": 0,
        "LastTermCode": 0,
        "LastTermReason": ""
      },
      {
        "RouterHashId": "d566b83fd5fac1a5ac7f77892b6e4eda",
        "LastModified": "2017-08-17 23:58:48.491798",
        "InitData": "tara-mx-01",
        "RouterName": "tara-mx-01",
        "RouterIP": "200.1.1.1",
        "RouterAS": null,
        "description": "Juniper Networks, Inc. mx960 internet router, kernel JUNOS 14.2R6.5, Build date: 2016-04-05 05:54:04 UTC Copyright (c) 1996-2016 Juniper Networks, Inc.",
        "isConnected": 0,
        "isPassive": 0,
        "LastTermCode": 0,
        "LastTermReason": ""
      },
      {
        "RouterHashId": "fa28fec3dcda25eed583f164a7ed45a3",
        "LastModified": "2017-08-17 23:36:54.576136",
        "InitData": "",
        "RouterName": "tara-9k-05",
        "RouterIP": "200.1.1.5",
        "RouterAS": null,
        "description": "Cisco IOS XR Software, Version 6.1.3[Default]\nCopyright (c) 2017 by Cisco Systems, Inc.",
        "isConnected": 0,
        "isPassive": 0,
        "LastTermCode": 0,
        "LastTermReason": ""
      },
      {
        "RouterHashId": "ffc92f8208b083154311b5b22e77bc5f",
        "LastModified": "2017-08-17 23:36:54.576136",
        "InitData": "",
        "RouterName": "tara-9k-04",
        "RouterIP": "200.1.1.4",
        "RouterAS": null,
        "description": "Cisco IOS XR Software, Version 6.1.1.11I[Default]\nCopyright (c) 2016 by Cisco Systems, Inc.",
        "isConnected": 0,
        "isPassive": 0,
        "LastTermCode": 0,
        "LastTermReason": ""
      }
    ],
    "cols": 11
  }
}
        ```
    

## Pat Configuration

In the event you wish to use ```docker-proxy```, you will need to enable the **PAT** feature in the collector.  You can do this by following the below steps.

### Steps

1. Make sure your ```docker run``` included the ```-v /var/openbmp/config:/config``` volume mapping. If not, restart the container by doing a ```docker rm -f openbmp_aio``` followed by a ```docker run``` with the correct arguments. 
1. Copy the current default config to host folder: ```docker exec openbmp_aio cp /usr/etc/openbmp/openbmpd.conf /config/openbmpd.conf```

    > **NOTE**: Do not copy the file if you have already done so, such as when you enabled **v4v6** listening mode. 

1. Edit ```/var/openbmp/config/openbmpd.conf``` and update ```pat: false``` to be ```pat: true```
    
    **For Example:**
    
    ```yaml
    base:
        #pat_enabled value is a boolean:
        #    false (the default) - MD5 of (connection source address, collector hash)
        #
        #    true                - MD5 of one of the following:
        #
        #			     If INIT_BGP_ID (type=65531) is present:
        #				(bgp_router_id, collector_hash)
        #
        #                        If INIT doesn't include the BGP_ID, then:
        #				(name, collector_hash)
        #
        #			     If INIT doesn't include either bgp_id or name, then it uses:
        #				(connection source address, collector hash)
        pat_enabled: true
    ```
1. Restart the container: ```docker restart openbmp_aio```

    > **IMPORTANT**
    > When you enable PAT the hashing changes. Any previous data will no longer match.  It's suggested that
    > you ```rm -r /var/openbmp/mysql/*``` the old data before restarting. 

