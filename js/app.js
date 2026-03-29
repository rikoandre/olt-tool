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
function autoDescription(user,desc){
if(desc.trim()==""){
return user.toUpperCase()
}
return desc.toUpperCase()
}


// ==========================
// CEK INDEX ONU
// ==========================
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

let cmd = (olt==="c600")
? `sho gpon onu state gpon_olt-${iface}`
: `sho gpon onu state gpon_olt-${iface}`

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

let onu=document.getElementById("onu").value.trim()
let sn=document.getElementById("sn").value.trim().toUpperCase()
let user=document.getElementById("user").value.trim()
let pass=document.getElementById("pass").value.trim()
let desc=document.getElementById("desc").value

desc = autoDescription(user,desc)

let olt=document.getElementById("oltType").value
let vlan=document.getElementById("vlan").value

let data={iface,onu,sn,user,pass,desc}

let script=""

if(olt==="c600"){
script = c600Template(data)
}else{
script = templates[vlan](data)
}

document.getElementById("output").value = script

Swal.fire({
icon:'success',
title:'Berhasil',
text:'Script berhasil dibuat!',
timer:1200,
showConfirmButton:false
})
}


// ==========================
// DISABLE VLAN C600
// ==========================
function toggleVlan(){
let olt=document.getElementById("oltType").value
let vlan=document.getElementById("vlan")
vlan.disabled = (olt==="c600")
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
