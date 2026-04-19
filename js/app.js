// ==========================
// 1. UTILITY FUNCTIONS
// ==========================

/**
 * Format input interface: mendukung '146' -> '1/4/6' atau manual '1/4/6'
 */
function formatInterface(iface) {
    iface = iface.trim();
    
    // Jika input hanya 3 angka (misal: 146)
    if (/^\d{3}$/.test(iface)) {
        return `${iface[0]}/${iface[1]}/${iface[2]}`;
    }

    // Membersihkan karakter selain angka dan slash
    iface = iface.replace(/[^0-9/]/g, '');
    let p = iface.split("/");

    // Validasi format standar x/x/x
    if (p.length === 3 && p.every(x => x !== "")) {
        return p.join("/");
    }
    return "";
}

/**
 * Otomatisasi Deskripsi Pelanggan
 */
function autoDescription(user, desc) {
    desc = desc.trim();
    if (!desc) return user.toUpperCase();
    
    // Hindari duplikasi tanda hubung
    if (desc.includes("-")) return desc.toUpperCase();
    
    return `${user} - ${desc.toUpperCase()}`;
}

// ==========================
// 2. CORE LOGIC (GENERATOR)
// ==========================

/**
 * Validasi semua field input sebelum proses
 */
function validasiInput() {
    const fields = [
        { id: 'iface', name: 'Interface' },
        { id: 'onu', name: 'ONU ID' },
        { id: 'sn', name: 'Serial Number' },
        { id: 'user', name: 'Username' },
        { id: 'pass', name: 'Password' }
    ];

    for (let f of fields) {
        if (!document.getElementById(f.id).value.trim()) {
            Swal.fire("Oops!", `${f.name} wajib diisi!`, "warning");
            return false;
        }
    }
    return true;
}

/**
 * Fungsi Utama untuk Generate Script OLT
 */
function generate() {
    if (!validasiInput()) return;

    const ifaceRaw = document.getElementById("iface").value;
    const iface = formatInterface(ifaceRaw);

    if (!iface) {
        Swal.fire("Format Salah", "Gunakan format 1/4/6 atau 146", "error");
        return;
    }

    // Mengambil data dari form
    const data = {
        iface: iface,
        onu: document.getElementById("onu").value.trim(),
        sn: document.getElementById("sn").value.trim().toUpperCase(),
        user: document.getElementById("user").value.trim(),
        pass: document.getElementById("pass").value.trim(),
        desc: autoDescription(document.getElementById("user").value, document.getElementById("desc").value)
    };

    const olt = document.getElementById("oltType").value;
    const vlan = document.getElementById("vlan").value;
    const mode = document.getElementById("mode").value;

    let script = "";

    try {
        if (olt === "c600") {
            // Logic C600 (Menggunakan template dari templates.js)
            script = (mode === "bridge") ? c600BridgeTemplate(data) : c600Template(data);
        } else {
            // Logic C300 / C320
            if (mode === "bridge") {
                if (vlan === "100") {
                    script = unbBridgeTemplate(data);
                } else if (vlan === "1501") {
                    script = boloBridgeTemplate(data);
                } else if (vlan === "1000") {
                    script = ugrBridgeTemplate(data);
                } else if (vlan === "511") {
                    // Penambahan Template UCD Bridge
                    script = ucdBridgeTemplate(data);
                } else {
                    Swal.fire("Info", "VLAN ini belum mendukung mode bridge otomatis.", "info");
                    return;
                }
            } else {
                // Mode PPPoE (Normal) mengambil dari object 'templates' di templates.js
                script = templates[vlan] ? templates[vlan](data) : "Template VLAN tidak ditemukan.";
            }
        }

        document.getElementById("output").value = script;
        Swal.fire({ 
            icon: 'success', 
            title: 'Berhasil!', 
            text: 'Script berhasil dibuat', 
            timer: 1000, 
            showConfirmButton: false 
        });

    } catch (error) {
        console.error(error);
        Swal.fire("Error", "Terjadi kesalahan saat memanggil template. Pastikan templates.js sudah ter-load dan fungsi ucdBridgeTemplate tersedia.", "error");
    }
}

// ==========================
// 3. UI HELPER FUNCTIONS
// ==========================

function toggleVlan() {
    const olt = document.getElementById("oltType").value;
    const vlanSelect = document.getElementById("vlan");
    const modeSelect = document.getElementById("mode");
    const vlanVal = vlanSelect.value;

    // Ambil elemen option VLAN 134 (UNR)
    // Pastikan di HTML Anda, <option> untuk 134 memiliki value="134"
    const vlan134Option = vlanSelect.querySelector('option[value="134"]');

    if (olt === "c600") {
        // --- LOGIC C600 ---
        vlanSelect.disabled = true; 
        modeSelect.disabled = false;
        
        // Tampilkan kembali VLAN 134 jika sebelumnya disembunyikan
        if (vlan134Option) vlan134Option.style.display = "block";
        
        // Paksa pilih ke 134 karena C600 di template Anda menggunakan VLAN 134
        vlanSelect.value = "134"; 
        
    } else {
        // --- LOGIC C300 / C320 ---
        vlanSelect.disabled = false;

        // Sembunyikan VLAN 134 karena ini khusus C600
        if (vlan134Option) {
            vlan134Option.style.display = "none";
            
            // Jika saat ini sedang terpilih 134, pindahkan ke VLAN lain (misal 110 atau pertama)
            if (vlanSelect.value === "134") {
                vlanSelect.value = vlanSelect.options[0].value === "134" 
                                   ? vlanSelect.options[1].value 
                                   : vlanSelect.options[0].value;
            }
        }

        // Logic Bridge Support
        const supportBridge = ["100", "1501", "1000", "511"];
        if (supportBridge.includes(vlanSelect.value)) {
            modeSelect.disabled = false;
        } else {
            modeSelect.value = "pppoe";
            modeSelect.disabled = true;
        }
    }
}

function copyScript() {
    const output = document.getElementById("output");
    if (!output.value) {
        Swal.fire("Kosong", "Tidak ada script untuk disalin", "warning");
        return;
    }
    output.select();
    document.execCommand("copy");
    Swal.fire({ icon: 'success', title: 'Copied!', timer: 800, showConfirmButton: false });
}

function clearForm() {
    Swal.fire({
        title: 'Bersihkan form?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Ya, hapus!'
    }).then((result) => {
        if (result.isConfirmed) {
            document.querySelectorAll("input").forEach(i => i.value = "");
            document.getElementById("output").value = "";
        }
    });
}

/**
 * Generate Secret untuk Mikrotik
 */
function generateSecret() {
    const user = document.getElementById("user").value.trim();
    const pass = document.getElementById("pass").value.trim();
    const desc = document.getElementById("desc").value.trim() || user;
    const profile = document.getElementById("profile") ? document.getElementById("profile").value : "default";

    if (!user || !pass) {
        Swal.fire("Gagal", "User & Password wajib diisi!", "warning");
        return;
    }

    const comment = `${user}-${desc.toUpperCase()}`;
    const cmd = `/ppp secret add name=${user} password=${pass} service=pppoe profile="${profile}" comment="${comment}"`;

    document.getElementById("output").value = cmd;
    Swal.fire("Ready!", "PPP Secret siap disalin ke Mikrotik", "success");
}

function goHome() {
    window.location.href = "index.html";
}
