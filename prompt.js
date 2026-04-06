// ==========================
// 1. HELPER GETTER
// ==========================
// Fungsi untuk mengambil data input secara terpusat untuk Quick Commands
function getQuickData() {
    return {
        iface: formatInterface(document.getElementById("iface").value),
        onu: document.getElementById("onu").value.trim(),
        sn: document.getElementById("sn").value.trim().toUpperCase(),
        olt: document.getElementById("oltType").value // Menggunakan oltType sesuai index.html
    };
}

// Helper untuk menentukan path ONU/OLT berdasarkan tipe
function getOnuPath(iface, onu, olt) {
    return (olt === "c600")
        ? `gpon_onu-${iface}:${onu}`
        : `gpon-onu_${iface}:${onu}`;
}

function getOltPath(iface, olt) {
    return (olt === "c600")
        ? `gpon_olt-${iface}`
        : `gpon-olt_${iface}`;
}

// ==========================
// 2. QUICK COMMAND ACTIONS
// ==========================

// RESET MODEM
function resetModem() {
    const d = getQuickData();
    if (!validasiBasic(d.iface, d.onu)) return;

    let cmd = `configure terminal
pon-onu-mng ${getOnuPath(d.iface, d.onu, d.olt)}
  restore factory
  exit
exit`;
    document.getElementById("output").value = cmd;
}

// REBOOT MODEM
function rebootModem() {
    const d = getQuickData();
    if (!validasiBasic(d.iface, d.onu)) return;

    let cmd = `configure terminal
pon-onu-mng ${getOnuPath(d.iface, d.onu, d.olt)}
  reboot
  exit
exit`;
    document.getElementById("output").value = cmd;
}

// GANTI SN MODEM
function gantiModem() {
    const d = getQuickData();
    if (!validasiBasic(d.iface, d.onu)) return;
    if (!d.sn) return Swal.fire("SN Kosong", "Masukkan SN baru di kolom SN", "warning");

    let cmd = `configure terminal
interface ${getOnuPath(d.iface, d.onu, d.olt)}
  registration-method sn ${d.sn}
exit
exit`;
    document.getElementById("output").value = cmd;
}

// CEK REDAMAN PORT
function cekRedamanPort() {
    const d = getQuickData();
    if (!d.iface) return Swal.fire("Interface Kosong", "Isi interface dulu!", "warning");

    let cmd = (d.olt === "c600")
        ? `show pon power onu-rx ${getOltPath(d.iface, d.olt)}`
        : `show pon power onu-rx ${getOltPath(d.iface, d.olt)}`;

    document.getElementById("output").value = cmd;
}

// CEK REDAMAN ONU
function cekRedamanOnu() {
    const d = getQuickData();
    if (!validasiBasic(d.iface, d.onu)) return;

    let cmd = `show pon power attenuation ${getOnuPath(d.iface, d.onu, d.olt)}`;
    document.getElementById("output").value = cmd;
}

// CEK STATUS PORT (ALL ONU IN PORT)
function cekStatusPort() {
    const d = getQuickData();
    if (!d.iface) return Swal.fire("Interface Kosong", "", "warning");

    let cmd = `show gpon onu state ${getOltPath(d.iface, d.olt)}`;
    document.getElementById("output").value = cmd;
}

// CEK DETAIL ONU (CONFIG, DISTANCE, DLL)
function cekDetailOnu() {
    const d = getQuickData();
    if (!validasiBasic(d.iface, d.onu)) return;

    let cmd = `show gpon onu detail-info ${getOnuPath(d.iface, d.onu, d.olt)}`;
    document.getElementById("output").value = cmd;
}

// CEK WAN CONFIG
function cekWan() {
    const d = getQuickData();
    if (!validasiBasic(d.iface, d.onu)) return;

    let cmd = `show onu running config ${getOnuPath(d.iface, d.onu, d.olt)}`;
    document.getElementById("output").value = cmd;
}

// CEK IP ONU
function cekIp() {
    const d = getQuickData();
    if (!validasiBasic(d.iface, d.onu)) return;

    let path = getOnuPath(d.iface, d.onu, d.olt);
    let cmd = (d.olt === "c600")
        ? `show gpon remote-onu wan-ip ${path}`
        : `show gpon remote-onu ip-host ${path}`;

    document.getElementById("output").value = cmd;
}

// HAPUS ONU
function hapusOnu() {
    const d = getQuickData();
    if (!validasiBasic(d.iface, d.onu)) return;

    Swal.fire({
        title: 'Hapus ONU?',
        text: `Anda akan menghapus ONU ${d.onu} di port ${d.iface}`,
        icon: 'danger',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Ya, Hapus!'
    }).then((result) => {
        if (result.isConfirmed) {
            let cmd = `configure terminal
interface ${getOltPath(d.iface, d.olt)}
  no onu ${d.onu}
exit
exit`;
            document.getElementById("output").value = cmd;
        }
    });
}

// AKTIFKAN PORT OLT
function aktifkanPort() {
    const d = getQuickData();
    if (!d.iface) return;

    let cmd = `configure terminal
interface ${getOltPath(d.iface, d.olt)}
  no shutdown
exit
exit`;
    document.getElementById("output").value = cmd;
}

// ==========================
// 3. VALIDASI & UTILITY
// ==========================
function validasiBasic(iface, onu) {
    if (!iface || !onu) {
        Swal.fire({
            icon: 'warning',
            title: 'Oops...',
            text: 'Interface & ONU ID wajib diisi untuk perintah ini!'
        });
        return false;
    }
    return true;
}