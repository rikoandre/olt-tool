/**
 * DATABASE TEMPLATE OLT
 * File: templates.js
 * Deskripsi: Menyimpan semua template konfigurasi untuk berbagai jenis OLT dan VLAN.
 */

// ==========================================
// 1. TEMPLATE ZTE C600 (SERI TERBARU)
// ==========================================

const c600Template = (d) => `conf t
interface gpon_olt-${d.iface}
  onu ${d.onu} type ALL sn ${d.sn}
exit
interface gpon_onu-${d.iface}:${d.onu}
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
  wan 1 service tr069 internet
  tr069-mgmt 1 state unlock
  tr069-mgmt 1 acs http://acs.upaz.net.id:9999/ validate basic username acs@upaz.net.id password upaz8ersinar
exit
exit
write`;

const c600BridgeTemplate = (d) => `conf t
interface gpon_olt-${d.iface}
  onu ${d.onu} type ALL sn ${d.sn}
exit
interface gpon_onu-${d.iface}:${d.onu}
  name ${d.user}
  description ${d.desc}
  tcont 1 profile kusuma
  tcont 2 profile kusuma
  gemport 1 tcont 1
  gemport 2 tcont 2
exit
interface vport-${d.iface}.${d.onu}:1
  service-port 1 user-vlan 128 vlan 128
interface vport-${d.iface}.${d.onu}:2
  service-port 2 user-vlan 129 vlan 129
exit
pon-onu-mng gpon_onu-${d.iface}:${d.onu}
  service 1 gemport 1 vlan 128
  service 2 gemport 2 vlan 129
  vlan port eth_0/1 mode tag vlan 129
  vlan port eth_0/2 mode tag vlan 129
  vlan port eth_0/3 mode tag vlan 129
  vlan port eth_0/4 mode tag vlan 129
  security-mgmt 1 state enable mode forward protocol web
  wan-ip 1 ipv4 mode pppoe username ${d.user} password ${d.pass} vlan-profile v128 host 1
exit
exit
write`;

// ==========================================
// 2. TEMPLATE BRIDGE ZTE C320/C300
// ==========================================

const ugrBridgeTemplate = (d) => `conf t
interface gpon-olt_${d.iface}
  onu ${d.onu} type ALL sn ${d.sn}
exit
interface gpon-onu_${d.iface}:${d.onu}
  name ${d.user}
  tcont 1 profile kusuma
  gemport 1 tcont 1
  gemport 2 tcont 1
  service-port 1 vport 1 user-vlan 1000 vlan 1000
  service-port 2 vport 2 user-vlan 200 vlan 200
exit
pon-onu-mng gpon-onu_${d.iface}:${d.onu}
  service 1 gemport 1 vlan 1000
  service 2 gemport 2 vlan 200
  vlan port eth_0/1 mode tag vlan 200
  security-mgmt 1 state enable mode forward protocol web
  wan-ip 1 mode pppoe username ${d.user} password ${d.pass} vlan-profile v1000 host 1
exit
exit
write`;

const unbBridgeTemplate = (d) => `conf t
interface gpon-olt_${d.iface}
  onu ${d.onu} type ALL sn ${d.sn}
exit
interface gpon-onu_${d.iface}:${d.onu}
  name ${d.user}
  description ${d.desc}_bridge
  sn-bind enable sn
  tcont 1 profile kusuma
  gemport 1 tcont 1
  gemport 2 tcont 1
  service-port 1 vport 1 user-vlan 105 vlan 105
  service-port 2 vport 2 user-vlan 102 vlan 102
exit
pon-onu-mng gpon-onu_${d.iface}:${d.onu}
  service 105 gemport 1 vlan 105
  service pppoe gemport 2 vlan 102
  vlan port eth_0/1 mode tag vlan 105
  vlan port eth_0/2 mode tag vlan 105
  vlan port eth_0/3 mode tag vlan 105
  vlan port eth_0/4 mode tag vlan 105
  wan-ip mode pppoe username ${d.user} password ${d.pass} vlan-profile pppoe_vlan102 host 1
  security-mgmt 1 state enable mode forward protocol web
exit
exit
write`;

const boloBridgeTemplate = (d) => `conf t
interface gpon-olt_${d.iface}
  onu ${d.onu} type ALL sn ${d.sn}
exit
interface gpon-onu_${d.iface}:${d.onu}
  name ${d.user}
  description ${d.desc}
  sn-bind enable sn
  tcont 1 profile kusuma
  gemport 1 tcont 1
  gemport 2 tcont 1
  service-port 1 vport 1 user-vlan 1500 vlan 1500
  service-port 2 vport 2 user-vlan 1501 vlan 1501
exit
pon-onu-mng gpon-onu_${d.iface}:${d.onu}
  service 1500 gemport 1 vlan 1500
  service pppoe gemport 2 vlan 1501
  vlan port eth_0/1 mode hybrid def-vlan 1500
  vlan port eth_0/2 mode hybrid def-vlan 1500
  vlan port eth_0/3 mode hybrid def-vlan 1500
  wan-ip mode pppoe username ${d.user} password ${d.pass} vlan-profile bolo host 1
  security-mgmt 1 state enable mode forward protocol web 
exit
exit
write`;

// ==========================================
// 3. DATABASE TEMPLATE PPPoE (KEY BY VLAN)
// ==========================================

const templates = {
    // UNR / VLAN 134
    "134": (d) => `conf t
interface gpon-olt_${d.iface}
  onu ${d.onu} type ALL sn ${d.sn}
exit
interface gpon-onu_${d.iface}:${d.onu}
  name ${d.user}
  description ${d.desc}
  tcont 1 profile kusuma
  gemport 1 tcont 1
  service-port 1 vport 1 user-vlan 134 vlan 134
exit
pon-onu-mng gpon-onu_${d.iface}:${d.onu}
  service 1 gemport 1 vlan 134
  security-mgmt 1 state enable mode forward protocol web
  wan-ip 1 mode pppoe username ${d.user} password ${d.pass} vlan-profile v134 host 1
exit
exit
write`,

    // UHO
    "110": (d) => `config terminal
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
    "1002": (d) => `config terminal
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
    "1000": (d) => `config terminal
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
    "100": (d) => `conf t
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
    "1600": (d) => `conf t
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
    "1501": (d) => `conf t
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
    "511": (d) => `conf t
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
    "602": (d) => `conf t
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
    "903": (d) => `conf t
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
};
