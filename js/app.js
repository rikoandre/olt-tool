function formatInterface(iface){

iface = iface.trim()

let ifaceInput = document.getElementById("iface").value
let iface = formatInterface(ifaceInput)

if(!iface){
Swal.fire({
icon: 'error',
title: 'Format Interface salah',
text: 'Gunakan format seperti 1/4/6 atau 146'
})
return
}


function autoDescription(user,desc){

if(desc.trim()==""){
return user.toUpperCase()
}

return desc

}

// cek index ONU kosong
function cekIndexOnu(){

let iface = document.getElementById("iface").value
let olt = document.getElementById("oltType").value

if(!iface){
Swal.fire({
icon: 'warning',
title: 'Oops...',
text: 'Interfaces Belum Diisi!!'
})
return
}

iface = formatInterface(iface)

let cmd=""

if(olt==="c600"){

cmd=`show gpon onu state gpon_olt-${iface}`

}else{

cmd=`show gpon onu by interface gpon-olt_${iface}`

}

document.getElementById("output").value = cmd

}



// tombol generate script
function generate(){

if(!validasiInput()){
return
}

let iface=formatInterface(document.getElementById("iface").value)
let onu=document.getElementById("onu").value
let sn=document.getElementById("sn").value.trim().toUpperCase()
let user=document.getElementById("user").value.trim()
let pass=document.getElementById("pass").value.trim()
let desc=document.getElementById("desc").value.toUpperCase()

let olt=document.getElementById("oltType").value
let vlan=document.getElementById("vlan").value

desc=autoDescription(user,desc)

let data={
iface,
onu,
sn,
user,
pass,
desc
}

let script=""

if(olt==="c600"){

script=c600Template(data)

}else{

script=templates[vlan](data)

}

document.getElementById("output").value=script

}

function toggleVlan(){

let olt=document.getElementById("oltType").value
let vlan=document.getElementById("vlan")

if(olt==="c600"){

vlan.disabled=true

}else{

vlan.disabled=false

}

}



function copyScript(){

let text=document.getElementById("output")

text.select()

document.execCommand("copy")

Swal.fire({
icon: 'success',
title: 'Berhasil',
text: 'Script berhasil dicopy!',
timer: 1500,
showConfirmButton: false
})

}

// validasi input
function validasiInput(){

let iface=document.getElementById("iface").value.trim()
let onu=document.getElementById("onu").value.trim()
let sn=document.getElementById("sn").value.trim()
let user=document.getElementById("user").value.trim()
let pass=document.getElementById("pass").value.trim()

if(!iface || !onu || !sn || !user || !pass){

Swal.fire({
icon: 'warning',
title: 'Oops...',
text: 'Semua field wajib diisi!'
})

return false

}

return true

}

function goHome(){
window.location.href="index.html"
}


function clearForm(){

document.querySelectorAll("input").forEach(i=>i.value="")

document.getElementById("output").value=""

}
