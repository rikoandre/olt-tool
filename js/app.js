// ==========================
// FORMAT INTERFACE
// ==========================
function formatInterface(iface){

iface = iface.trim()

// support 146 → 1/4/6
if(/^\d{3}$/.test(iface)){
return iface[0] + "/" + iface[1] + "/" + iface[2]
}

// support 1/10/12
iface = iface.replace(/[^0-9/]/g,'')

let p = iface.split("/")

if(p.length === 3 && p.every(x => x !== "")){
return p.join("/")
}

return ""
}


// ==========================
// AUTO DESCRIPTION
// ==========================
function autoDescription(user, desc){

desc = desc.trim()

// kalau kosong → pakai user saja
if(!desc){
return user
}

// jika sudah mengandung "-" → biarkan (biar tidak double)
if(desc.includes("-")){
return desc.toUpperCase()
}

// format default: ID - NAMA
return `${user} - ${desc.toUpperCase()}`
}


function cekIndexOnu(){

let ifaceInput = document.getElementById("iface").value
let olt = document.getElementById("oltType").value

if(!ifaceInput){
Swal.fire({
icon:'warning',
title:'Oops...',
text:'Interfaces belum diisi!'
})
return
}

let iface = formatInterface(ifaceInput)

if(!iface){
Swal.fire({
icon:'error',
title:'Format salah',
text:'Gunakan format 1/4/6 atau 146'
})
return
}

let cmd=""
if(olt==="c600"){
cmd = `sho gpon onu state gpon_olt-${iface}`
}else{
cmd = `show gpon onu state gpon-olt_${iface}`
}

document.getElementById("output").value = cmd

}


// ==========================
// GENERATE SCRIPT
// ==========================
function generate(){

if(!validasiInput()) return

let ifaceInput = document.getElementById("iface").value
let iface = formatInterface(ifaceInput)

if(!iface){
Swal.fire({
icon:'error',
title:'Format Interface salah',
text:'Gunakan 1/4/6 atau 146'
})
return
}

let onu = document.getElementById("onu").value.trim()
let sn = document.getElementById("sn").value.trim().toUpperCase()
let user = document.getElementById("user").value.trim()
let pass = document.getElementById("pass").value.trim()

let descInput = document.getElementById("desc").value.trim()
let desc = autoDescription(user, descInput)

let olt = document.getElementById("oltType").value
let vlan = document.getElementById("vlan").value
let mode = document.getElementById("mode").value

let data = { iface, onu, sn, user, pass, desc }

let script = ""

// ==========================
// C600
// ==========================
if(olt === "c600"){

if(mode === "bridge"){
script = c600BridgeTemplate(data)
}else{
script = c600Template(data)
}

// ==========================
// C300 / C320
// ==========================
}else{

// ==========================
// MODE BRIDGE C300/C320
// ==========================
if(mode === "bridge"){

if(vlan === "100"){
script = unbBridgeTemplate(data)

}else if(vlan === "1501"){
script = boloBridgeTemplate(data)

}else if(vlan === "1000"){
script = ugrBridgeTemplate(data)

}else{
Swal.fire({
icon:'warning',
title:'Bridge tidak tersedia',
text:'VLAN ini belum support mode bridge'
})
return
}

}else{

// MODE NORMAL
script = templates[vlan](data)

}

}

// 🔥 WAJIB ADA
document.getElementById("output").value = script

// 🔥 ALERT SUCCESS
Swal.fire({
icon:'success',
title:'Berhasil',
text:'Script berhasil dibuat!',
timer:1200,
showConfirmButton:false
})

}

// ==========================
// TOGGLE VLAN & MODE
// ==========================
function toggleVlan(){

let olt = document.getElementById("oltType").value
let vlanSelect = document.getElementById("vlan")
let vlanVal = vlanSelect.value
let mode = document.getElementById("mode")

// ==========================
// C600
// ==========================
if(olt === "c600"){
vlanSelect.disabled = true
mode.disabled = false
return
}

// ==========================
// C300 / C320
// ==========================
vlanSelect.disabled = false

// VLAN yang support bridge
if(vlanVal === "100" || vlanVal === "1501" || vlanVal === "1000"){
mode.disabled = false
}else{
mode.value = "pppoe"
mode.disabled = true
}

}


// ==========================
// COPY SCRIPT
// ==========================
function copyScript(){

let text=document.getElementById("output")

if(!text.value){
Swal.fire({
icon:'warning',
title:'Kosong',
text:'Tidak ada script untuk dicopy'
})
return
}

text.select()
document.execCommand("copy")

Swal.fire({
icon:'success',
title:'Berhasil',
text:'Script berhasil dicopy!',
timer:1500,
showConfirmButton:false
})
}


// ==========================
// VALIDASI INPUT
// ==========================
function validasiInput(){

let iface=document.getElementById("iface").value.trim()
let onu=document.getElementById("onu").value.trim()
let sn=document.getElementById("sn").value.trim()
let user=document.getElementById("user").value.trim()
let pass=document.getElementById("pass").value.trim()

if(!iface || !onu || !sn || !user || !pass){

Swal.fire({
icon:'warning',
title:'Oops...',
text:'Semua field wajib diisi!'
})

return false
}

return true
}


// ==========================
// CLEAR FORM
// ==========================
function clearForm(){

Swal.fire({
title:'Yakin?',
text:'Semua input akan dihapus',
icon:'warning',
showCancelButton:true,
confirmButtonText:'Ya'
}).then((result)=>{

if(result.isConfirmed){

document.querySelectorAll("input").forEach(i=>i.value="")
document.getElementById("output").value=""

}

})
}


// ==========================
// HOME
// ==========================
function goHome(){
window.location.href="index.html"
}

// CREATE SECRET
function generateSecret(){

let user=document.getElementById("user").value.trim()
let pass=document.getElementById("pass").value.trim()
let desc=document.getElementById("desc").value.trim()
let profile=document.getElementById("profile").value

if(!user || !pass){
Swal.fire({
icon:'warning',
title:'Oops...',
text:'Username & Password wajib diisi!'
})
return
}

if(!desc){
desc = user
}

// format comment USERNAME-NAMA
let comment = `${user}-${desc.toUpperCase()}`

let cmd = `/ppp secret add name=${user} password=${pass} service=pppoe profile="${profile}" comment="${comment}"`

document.getElementById("output").value = cmd

Swal.fire({
icon:'success',
title:'PPP Secret siap!',
text:'Siap di copy ke Mikrotik',
timer:1500,
showConfirmButton:false
})

}
