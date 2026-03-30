function formatInterface(v){
v = v.trim()

if(/^\d{3}$/.test(v)){
return v[0]+"/"+v[1]+"/"+v[2]
}

return v
}

function getInterface(){
let iface = formatInterface(document.getElementById("iface").value)
return iface
}

function setOutput(cmd){
document.getElementById("output").value = cmd
}

// =================== ACTION ===================

function resetModem(){
let iface=getInterface()
let onu=document.getElementById("onu").value
let olt=document.getElementById("olt").value

let cmd = (olt==="c600")
? `configure terminal
pon-onu-mng gpon_onu-${iface}:${onu}
restore factory`
: `configure terminal
pon-onu-mng gpon-onu_${iface}:${onu}
restore factory`

setOutput(cmd)
}

function rebootModem(){
let iface=getInterface()
let onu=document.getElementById("onu").value
let olt=document.getElementById("olt").value

let cmd = (olt==="c600")
? `configure terminal
pon-onu-mng gpon_onu-${iface}:${onu}
reboot`
: `configure terminal
pon-onu-mng gpon-onu_${iface}:${onu}
reboot`

setOutput(cmd)
}

function gantiModem(){
let iface=getInterface()
let onu=document.getElementById("onu").value
let sn=document.getElementById("sn").value.toUpperCase()
let olt=document.getElementById("olt").value

let cmd = (olt==="c600")
? `configure terminal
interface gpon_onu-${iface}:${onu}
registration-method sn ${sn}`
: `configure terminal
interface gpon-onu_${iface}:${onu}
registration-method sn ${sn}`

setOutput(cmd)
}

function cekRedamanPort(){
let iface=getInterface()
let olt=document.getElementById("olt").value

let cmd = (olt==="c600")
? `sho pon power onu-rx gpon_olt-${iface}`
: `show pon power onu-rx gpon-olt_${iface}`

setOutput(cmd)
}

function cekRedamanOnu(){
let iface=getInterface()
let onu=document.getElementById("onu").value
let olt=document.getElementById("olt").value

let cmd = (olt==="c600")
? `sho pon power attenuation gpon_onu-${iface}:${onu}`
: `show pon power attenuation gpon-onu_${iface}:${onu}`

setOutput(cmd)
}

function cekStatusPort(){
let iface=getInterface()
let olt=document.getElementById("olt").value

let cmd = (olt==="c600")
? `sho gpon onu state gpon_olt-${iface}`
: `show gpon onu state gpon-olt_${iface}`

setOutput(cmd)
}

function hapusOnu(){
let iface=getInterface()
let onu=document.getElementById("onu").value
let olt=document.getElementById("olt").value

let cmd = (olt==="c600")
? `configure terminal
interface gpon_olt-${iface}
no onu ${onu}`
: `configure terminal
interface gpon-olt_${iface}
no onu ${onu}`

setOutput(cmd)
}

function aktifkanPort(){
let iface=getInterface()
let olt=document.getElementById("olt").value

let cmd = (olt==="c600")
? `configure terminal
interface gpon_olt-${iface}
no shutdown`
: `configure terminal
interface gpon-olt_${iface}
no shutdown`

setOutput(cmd)
}

function cekInterface(){
let iface=getInterface()
let onu=document.getElementById("onu").value
let olt=document.getElementById("olt").value

let cmd = (olt==="c600")
? `show run interface gpon_onu-${iface}:${onu}`
: `show run interface gpon-onu_${iface}:${onu}`

setOutput(cmd)
}

function cekWan(){
let iface=getInterface()
let onu=document.getElementById("onu").value

setOutput(`show onu running config gpon-onu_${iface}:${onu}`)
}

function cekSn(){
let sn=document.getElementById("sn").value.toUpperCase()
setOutput(`show gpon onu by sn ${sn}`)
}

function cekIp(){
let iface=getInterface()
let onu=document.getElementById("onu").value

setOutput(`show gpon remote-onu ip-host gpon-onu_${iface}:${onu}`)
}

function goHome(){
window.location.href="index.html"
}