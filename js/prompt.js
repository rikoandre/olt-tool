// ==========================
// FORMAT INTERFACE
// ==========================
function formatInterface(v){
v = v.trim()

// support 146 → 1/4/6
if(/^\d{3}$/.test(v)){
return `${v[0]}/${v[1]}/${v[2]}`
}

return v
}

function getInterface(){
return formatInterface(document.getElementById("iface").value)
}

// ==========================
// HELPER PATH
// ==========================
function getOnuPath(iface, onu, olt){
return (olt === "c600")
? `gpon_onu-${iface}:${onu}`
: `gpon-onu_${iface}:${onu}`
}

function getOltPath(iface, olt){
return (olt === "c600")
? `gpon_olt-${iface}`
: `gpon-olt_${iface}`
}

// ==========================
// OUTPUT
// ==========================
function setOutput(cmd){
document.getElementById("output").value = cmd
}

// ==========================
// VALIDASI SEDERHANA
// ==========================
function validasiBasic(iface, onu){
if(!iface || !onu){
Swal.fire({
icon:'warning',
title:'Oops...',
text:'Interface & ONU wajib diisi!'
})
return false
}
return true
}

// ==========================
// ACTION
// ==========================

// RESET MODEM
function resetModem(){
let iface = getInterface()
let onu = document.getElementById("onu").value
let olt = document.getElementById("olt").value

if(!validasiBasic(iface, onu)) return

let cmd = `configure terminal
pon-onu-mng ${getOnuPath(iface, onu, olt)}
restore factory`

setOutput(cmd)
}

// REBOOT MODEM
function rebootModem(){
let iface = getInterface()
let onu = document.getElementById("onu").value
let olt = document.getElementById("olt").value

if(!validasiBasic(iface, onu)) return

let cmd = `configure terminal
pon-onu-mng ${getOnuPath(iface, onu, olt)}
reboot`

setOutput(cmd)
}

// GANTI MODEM
function gantiModem(){
let iface = getInterface()
let onu = document.getElementById("onu").value
let sn = document.getElementById("sn").value.toUpperCase()
let olt = document.getElementById("olt").value

if(!validasiBasic(iface, onu)) return

let cmd = `configure terminal
interface ${getOnuPath(iface, onu, olt)}
registration-method sn ${sn}`

setOutput(cmd)
}

// CEK REDAMAN PORT
function cekRedamanPort(){
let iface = getInterface()
let olt = document.getElementById("olt").value

let cmd = (olt === "c600")
? `sho pon power onu-rx ${getOltPath(iface, olt)}`
: `show pon power onu-rx ${getOltPath(iface, olt)}`

setOutput(cmd)
}

// CEK REDAMAN ONU
function cekRedamanOnu(){
let iface = getInterface()
let onu = document.getElementById("onu").value
let olt = document.getElementById("olt").value

if(!validasiBasic(iface, onu)) return

let cmd = (olt === "c600")
? `sho pon power attenuation ${getOnuPath(iface, onu, olt)}`
: `show pon power attenuation ${getOnuPath(iface, onu, olt)}`

setOutput(cmd)
}

// CEK STATUS PORT
function cekStatusPort(){
let iface = getInterface()
let olt = document.getElementById("olt").value

let cmd = (olt === "c600")
? `sho gpon onu state ${getOltPath(iface, olt)}`
: `show gpon onu state ${getOltPath(iface, olt)}`

setOutput(cmd)
}

// HAPUS ONU
function hapusOnu(){
let iface = getInterface()
let onu = document.getElementById("onu").value
let olt = document.getElementById("olt").value

if(!validasiBasic(iface, onu)) return

let cmd = `configure terminal
interface ${getOltPath(iface, olt)}
no onu ${onu}`

setOutput(cmd)
}

// AKTIFKAN PORT
function aktifkanPort(){
let iface = getInterface()
let olt = document.getElementById("olt").value

let cmd = `configure terminal
interface ${getOltPath(iface, olt)}
no shutdown`

setOutput(cmd)
}

// CEK INTERFACE
function cekInterface(){
let iface = getInterface()
let onu = document.getElementById("onu").value
let olt = document.getElementById("olt").value

if(!validasiBasic(iface, onu)) return

let cmd = `show run interface ${getOnuPath(iface, onu, olt)}`

setOutput(cmd)
}

// CEK DETAIL ONU
function cekDetailOnu(){
let iface = getInterface()
let onu = document.getElementById("onu").value
let olt = document.getElementById("olt").value

if(!validasiBasic(iface, onu)) return

let cmd = (olt === "c600")
? `sho gpon onu detail-info ${getOnuPath(iface, onu, olt)}`
: `show gpon onu detail-info ${getOnuPath(iface, onu, olt)}`

setOutput(cmd)
}

// CEK WAN CONFIG
function cekWan(){
let iface = getInterface()
let onu = document.getElementById("onu").value
let olt = document.getElementById("olt").value

if(!validasiBasic(iface, onu)) return

let cmd = `show onu running config ${getOnuPath(iface, onu, olt)}`
setOutput(cmd)
}

// CEK SN
function cekSn(){
let sn = document.getElementById("sn").value.toUpperCase()
setOutput(`show gpon onu by sn ${sn}`)
}

// CEK IP
function cekIp(){
let iface = getInterface()
let onu = document.getElementById("onu").value
let olt = document.getElementById("olt").value

if(!validasiBasic(iface, onu)) return

let base = getOnuPath(iface, onu, olt)

let cmd = (olt === "c600")
? `show gpon remote-onu wan-ip ${base}`
: `show gpon remote-onu ip-host ${base}`

setOutput(cmd)
}

// ==========================
// NAVIGASI
// ==========================
function goHome(){
window.location.href="index.html"
}
