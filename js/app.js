function formatInterface(iface){

iface = iface.trim()

// jika user mengetik 146
if(/^\d{3}$/.test(iface)){
return iface[0] + "/" + iface[1] + "/" + iface[2]
}

// jika user mengetik 1/4/6
iface = iface.replace(/[^0-9/]/g,'')

let p = iface.split("/")

if(p.length === 3){
return p[0] + "/" + p[1] + "/" + p[2]
}

return iface

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
alert("Interface belum diisi")
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

alert("Script copied")

}

// validasi input
function validasiInput(){

let iface=document.getElementById("iface").value.trim()
let onu=document.getElementById("onu").value.trim()
let sn=document.getElementById("sn").value.trim()
let user=document.getElementById("user").value.trim()
let pass=document.getElementById("pass").value.trim()

if(!iface || !onu || !sn || !user || !pass){

alert("Semua field wajib diisi!")

return false

}

return true

}


function clearForm(){

document.querySelectorAll("input").forEach(i=>i.value="")

document.getElementById("output").value=""

}