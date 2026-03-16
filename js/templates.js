const c600Template = (d)=>`conf t
interface gpon_olt-${d.iface}
onu ${d.onu} type ALL sn ${d.sn}
exit
interface gpon_ont-${d.iface}:${d.onu}
name ${d.user}
description ${d.desc}
tcont 1 profile kusuma
gemport 1 tcont 1
exit
interface vport-${d.iface}.${d.onu}:1
service-port 1 user-vlan 134 vlan 134
exit
pon-onu-mng gpon_onu-${d.iface}:${d.onu}
service 1 gemport 1 vlan 134
security-mgmt 1 state enable mode forward protocol web
wan-ip 1 ipv4 mode pppoe username ${d.user} password ${d.pass} vlan-profile v134 host 1
exit` 


const templates = {

// UHO
110:(d)=>`config terminal
interface gpon-olt_${d.iface}
onu ${d.onu} type ALL sn ${d.sn}
exit
interface gpon-onu_${d.iface}:${d.onu}
name ${d.user}
description ${d.desc}
tcont 1 profile kusuma
gemport 1 tcont 1
service-port 1 vport 1 user-vlan 110 vlan 110
exit
pon-onu-mng gpon-onu_${d.iface}:${d.onu}
service 1 gemport 1 vlan 110
security-mgmt 1 state enable mode forward protocol web
wan-ip 1 mode pppoe username ${d.user} password ${d.pass} vlan-profile v110 host 1
exit
exit
write`,


// UBL
1002:(d)=>`config terminal
interface gpon-olt_${d.iface}
onu ${d.onu} type ALL sn ${d.sn}
exit
interface gpon-onu_${d.iface}:${d.onu}
name ${d.user}
description ${d.desc}
tcont 1 profile kusuma
gemport 1 tcont 1
service-port 1 vport 1 user-vlan 1002 vlan 1002
exit
pon-onu-mng gpon-onu_${d.iface}:${d.onu}
service 1 gemport 1 vlan 1002
security-mgmt 1 state enable mode forward protocol web
wan-ip 1 mode pppoe username ${d.user} password ${d.pass} vlan-profile 1 host 1
exit
exit
write`,


// UGR
1000:(d)=>`config terminal
interface gpon-olt_${d.iface}
onu ${d.onu} type ALL sn ${d.sn}
exit
interface gpon-onu_${d.iface}:${d.onu}
name ${d.user}
description ${d.desc}
tcont 1 profile kusuma
gemport 1 tcont 1
service-port 1 vport 1 user-vlan 1000 vlan 1000
exit
pon-onu-mng gpon-onu_${d.iface}:${d.onu}
service 1 gemport 1 vlan 1000
security-mgmt 1 state enable mode forward protocol web
wan-ip 1 mode pppoe username ${d.user} password ${d.pass} vlan-profile v1000 host 1
exit
exit
write`,


// UNB
100:(d)=>`conf t
interface gpon-olt_${d.iface}
onu ${d.onu} type ALL sn ${d.sn}
exit
interface gpon-onu_${d.iface}:${d.onu}
name ${d.user}
description ${d.desc}
sn-bind enable sn
tcont 1 name PPPOE profile kusuma
gemport 1 name PPPOE tcont 1
switchport mode hybrid vport 1
service-port 1 vport 1 user-vlan 100 vlan 100
exit
pon-onu-mng gpon-onu_${d.iface}:${d.onu}
service ServiceName gemport 1 cos 0 vlan 100
wan-ip 1 mode pppoe username ${d.user} password ${d.pass} vlan-profile pppoe host 1
wan-ip 1 ping-response enable traceroute-response enable
security-mgmt 212 state enable mode forward protocol web
exit
exit
write`,


// ALQORIYAH
1600:(d)=>`conf t
interface gpon-olt_${d.iface}
onu ${d.onu} type ALL sn ${d.sn}
exit
interface gpon-onu_${d.iface}:${d.onu}
name ${d.user}
description ${d.desc}
sn-bind enable sn
tcont 1 name PPPOE profile kusuma
gemport 1 name PPPOE tcont 1
switchport mode hybrid vport 1
service-port 1 vport 1 user-vlan 1600 vlan 1600
exit
pon-onu-mng gpon-onu_${d.iface}:${d.onu}
service ServiceName gemport 1 cos 0 vlan 1600
wan-ip mode pppoe username ${d.user} password ${d.pass} vlan-profile vlan1600 host 1
wan-ip 1 ping-response enable traceroute-response enable
security-mgmt 212 state enable mode forward protocol web
exit
exit
write`,


// BOLO
1501:(d)=>`conf t
interface gpon-olt_${d.iface}
onu ${d.onu} type ALL sn ${d.sn}
exit
interface gpon-onu_${d.iface}:${d.onu}
name ${d.user}
description ${d.desc}
sn-bind enable sn
tcont 1 name PPPOE profile kusuma
gemport 1 name PPPOE tcont 1
switchport mode hybrid vport 1
service-port 1 vport 1 user-vlan 1501 vlan 1501
exit
pon-onu-mng gpon-onu_${d.iface}:${d.onu}
service ServiceName gemport 1 cos 0 vlan 1501
wan-ip mode pppoe username ${d.user} password ${d.pass} vlan-profile bolo host 1
wan-ip 1 ping-response enable traceroute-response enable
security-mgmt 212 state enable mode forward protocol web
exit
exit
write`,


// CADAR
511:(d)=>`conf t
interface gpon-olt_${d.iface}
onu ${d.onu} type ALL sn ${d.sn}
exit
interface gpon-onu_${d.iface}:${d.onu}
name ${d.user}
description ${d.desc}
sn-bind enable sn
tcont 1 name PPPOE profile kusuma
gemport 1 name PPPOE tcont 1
switchport mode hybrid vport 1
service-port 1 vport 1 user-vlan 511 vlan 511
exit
pon-onu-mng gpon-onu_${d.iface}:${d.onu}
service ServiceName gemport 1 cos 0 vlan 511
wan-ip mode pppoe username ${d.user} password ${d.pass} vlan-profile vlan511 host 1
wan-ip 1 ping-response enable traceroute-response enable
security-mgmt 212 state enable mode forward protocol web
exit
exit
write`,


// ALNET
602:(d)=>`conf t
interface gpon-olt_${d.iface}
onu ${d.onu} type ALL-ONT sn ${d.sn}
exit
interface gpon-onu_${d.iface}:${d.onu}
name ${d.user}
description ${d.desc}
sn-bind enable sn
tcont 1 name PPPOE profile metro10
gemport 1 name PPPOE tcont 1
switchport mode hybrid vport 1
service-port 1 vport 1 user-vlan 602 vlan 602
exit
pon-onu-mng gpon-onu_${d.iface}:${d.onu}
service ServiceName gemport 1 cos 0 vlan 602
wan-ip 1 mode pppoe username ${d.user} password ${d.pass} vlan-profile vlan602 host 1
wan-ip 1 ping-response enable traceroute-response enable
security-mgmt 212 state enable mode forward protocol web
exit
exit
write`,


// LEXXA
903:(d)=>`conf t
interface gpon-olt_${d.iface}
onu ${d.onu} type ALL-ONT sn ${d.sn}
exit
interface gpon-onu_${d.iface}:${d.onu}
name ${d.user}
description ${d.desc}
sn-bind enable sn
tcont 1 name PPPOE profile default
gemport 1 name PPPOE tcont 1
encrypt 1 enable downstream
switchport mode hybrid vport 1
service-port 1 vport 1 user-vlan 903 vlan 903
exit
pon-onu-mng gpon-onu_${d.iface}:${d.onu}
service ServiceName gemport 1 cos 0 vlan 903
wan-ip 1 mode pppoe username ${d.user} password ${d.pass} vlan-profile vlan903 host 1
wan-ip 1 ping-response enable traceroute-response enable
security-mgmt 212 state enable mode forward protocol web
exit
exit
write`

}