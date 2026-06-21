// ==========================================
// 1. UTILITY FUNCTIONS
// ==========================================

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
 * Otomatisasi Deskripsi Pelanggan (Perbaikan Anti-Double Output)
 */
function autoDescription(user, desc) {
    user = user.trim();
    desc = desc.trim().toUpperCase();
    
    // Jika kolom deskripsi kosong, langsung kembalikan Username kapital
    if (!desc) return user.toUpperCase();
    
    // PERBAIKAN: Jika kolom deskripsi sudah diawali/mengandung username itu sendiri
    // (misal: "0000000000 - JOKO"), kembalikan nilai deskripsi tersebut apa adanya.
    if (desc.includes(user)) {
        return desc;
    }
    
    // Jika kolom deskripsi sudah punya tanda hubung dari format lain, gunakan deskripsi itu saja
    if (desc.includes("-")) {
        return desc;
    }
    
    // Format standar jika bersih: "USER - DESC"
    return `${user} - ${desc}`;
}

// ==========================================
// 2. CORE LOGIC (GENERATOR)
// ==========================================

/**
 * Fungsi Validasi Input yang Sempurna
 * Mendukung validasi standar (10 digit) dan fleksibilitas DDR Prisma & ALNET di semua tipe OLT
 */
function validasiInput(isSecret = false) {
    const olt = document.getElementById("oltType").value;
    const vlan = document.getElementById("vlan").value;
    const userValue = document.getElementById("user").value.trim();

    // 1. Tentukan field wajib berdasarkan konteks
    let fields = isSecret 
        ? [
            { id: 'user', name: 'Username' },
            { id: 'pass', name: 'Password' },
            { id: 'profile', name: 'Paket/Profile' }
          ]
        : [
            { id: 'iface', name: 'Interface' },
            { id: 'onu', name: 'ONU ID' },
            { id: 'sn', name: 'Serial Number' },
            { id: 'user', name: 'Username' },
            { id: 'pass', name: 'Password' }
          ];

    // 2. Cek kekosongan field
    for (let f of fields) {
        const el = document.getElementById(f.id);
        if (!el || !el.value.trim()) {
            Swal.fire("Oops!", `${f.name} wajib diisi!`, "warning");
            return false;
        }
    }

    // 3. LOGIKA VALIDASI USERNAME (Alfanumerik vs Reguler)
    if (vlan === "2104" || vlan === "602") {
        // --- VALIDASI ALFANUMERIK (DDR PRISMA & ALNET) ---
        const alfanumerikRegex = /^[a-zA-Z0-9._\-@]+$/;
        
        if (!alfanumerikRegex.test(userValue)) {
            Swal.fire({
                icon: 'error',
                title: 'Format Username Salah',
                text: 'Username hanya boleh Huruf, Angka, Titik(.), Underscore(_), atau Simbol(@). Tanpa Spasi!',
                confirmButtonColor: '#d33'
            });
            return false;
        }
        
        if (userValue.length < 10) {
            Swal.fire("Username Terlalu Pendek", "Username minimal harus 10 karakter!", "warning");
            return false;
        }
    } else {
        // --- VALIDASI REGULER (Wajib 10 Digit Angka) ---
        const regexAngka = /^[0-9]{10}$/; 
        if (!regexAngka.test(userValue)) {
            Swal.fire({
                icon: 'error',
                title: 'Username Tidak Valid',
                text: 'Username PPPoE reguler wajib berupa 10 digit angka!',
                confirmButtonColor: '#d33'
            });
            return false;
        }
    }

    // 4. Validasi Tambahan untuk Konfigurasi OLT (Bukan Secret)
    if (!isSecret) {
        // Validasi ONU ID
        const onuValue = parseInt(document.getElementById("onu").value.trim(), 10);
        if (isNaN(onuValue) || onuValue < 1 || onuValue > 128) {
            Swal.fire("Batas ONU ID", "ONU ID harus berupa angka antara 1 sampai 128!", "warning");
            return false;
        }

        // Validasi Serial Number (Min 8 karakter)
        const snValue = document.getElementById("sn").value.trim();
        if (snValue.length < 8) {
            Swal.fire("SN Terlalu Pendek", "Serial Number minimal harus 8 karakter!", "warning");
            return false;
        }
    }

    return true; // Lolos semua validasi
}

/**
 * Fungsi Utama untuk Generate Script OLT
 */
function generate() {
    // 1. Jalankan validasi (Cek kekosongan & format username)
    if (!validasiInput(false)) return;

    // 2. Ambil dan format Interface
    const ifaceRaw = document.getElementById("iface").value;
    const iface = formatInterface(ifaceRaw);

    if (!iface) {
        Swal.fire("Format Salah", "Gunakan format 1/4/6 atau 146", "error");
        return;
    }

    // 3. Mengambil data dari form untuk dikirim ke template
    const data = {
        iface: iface,
        onu: document.getElementById("onu").value.trim(),
        sn: document.getElementById("sn").value.trim().toUpperCase(),
        user: document.getElementById("user").value.trim(),
        pass: document.getElementById("pass").value.trim(),
        desc: (typeof autoDescription === "function") 
              ? autoDescription(document.getElementById("user").value, document.getElementById("desc").value)
              : (document.getElementById("desc").value.trim() || document.getElementById("user").value.trim())
    };

    const olt = document.getElementById("oltType").value;
    const vlan = document.getElementById("vlan").value;
    const mode = document.getElementById("mode").value;

    let script = "";

    try {
        // --- LOGIC PEMILIHAN TEMPLATE ---
        if (olt === "c600") {
            // ==========================================
            // SEKSI OLT ZTE C600 (V9)
            // ==========================================
            if (vlan === "2104") {
                script = c600DdrPrismaTemplate(data);
            } else {
                script = (mode === "bridge") ? c600BridgeTemplate(data) : c600Template(data);
            }
        } else {
            // ==========================================
            // SEKSI OLT ZTE C300 / C320 (V6)
            // ==========================================
            if (vlan === "2104") {
                script = c300DdrPrismaTemplate(data);
            } else if (mode === "bridge") {
                switch (vlan) {
                    case "100":  script = unbBridgeTemplate(data); break;
                    case "1501": script = boloBridgeTemplate(data); break;
                    case "1000": script = ugrBridgeTemplate(data); break;
                    case "511":  script = ucdBridgeTemplate(data); break;
                    default:
                        Swal.fire("Info", "VLAN ini belum mendukung mode bridge otomatis.", "info");
                        return;
                }
            } else {
                script = templates[vlan] ? templates[vlan](data) : "Template VLAN tidak ditemukan.";
            }
        }

        // 4. Output Hasil ke Textarea
        const outputField = document.getElementById("output");
        if (outputField) {
            outputField.value = script;
        } else {
            console.warn("Elemen output tidak ditemukan");
        }

        // 5. Notifikasi Berhasil
        Swal.fire({ 
            icon: 'success', 
            title: 'Berhasil!', 
            text: 'Script berhasil dibuat', 
            timer: 1000, 
            showConfirmButton: false 
        });

    } catch (error) {
        console.error("Error Detail:", error);
        Swal.fire({
            icon: 'error',
            title: 'Template Error',
            text: 'Gagal memanggil template. Pastikan templates.js sudah ter-load.'
        });
    }
}

/**
 * Mengatur tampilan dropdown VLAN dan validasi input berdasarkan tipe OLT & VLAN
 */
function toggleVlan() {
    const olt = document.getElementById("oltType").value;
    const vlanSelect = document.getElementById("vlan");
    const modeSelect = document.getElementById("mode");
    const userInput = document.getElementById("user");

    if (!vlanSelect || !modeSelect || !userInput) return;

    const vlanVal = vlanSelect.value;
    const options = vlanSelect.options;

    // --- 1. FILTER DROPDOWN BERDASARKAN OLT ---
    if (olt === "c600") {
        for (let i = 0; i < options.length; i++) {
            const val = options[i].value;
            options[i].style.display = (val === "134" || val === "2104") ? "block" : "none";
        }
        if (vlanVal !== "134" && vlanVal !== "2104") vlanSelect.value = "134";
    } else {
        for (let i = 0; i < options.length; i++) {
            const val = options[i].value;
            options[i].style.display = (val === "134") ? "none" : "block";
        }
        if (vlanVal === "134") vlanSelect.value = "1001";
    }

    const currentVlan = vlanSelect.value;

    // --- 2. LOGIKA VALIDASI & UI BERDASARKAN VLAN ---
    if (currentVlan === "2104" || currentVlan === "602") {
        applyAlfanumerikLogic(userInput, modeSelect, currentVlan);
    } else {
        applyRegulerLogic(userInput, modeSelect, olt, currentVlan);
    }
}

/**
 * Helper: Logika Alfanumerik untuk DDR Prisma & ALNET
 */
function applyAlfanumerikLogic(userInput, modeSelect, vlanVal) {
    if (vlanVal === "2104") {
        userInput.placeholder = "Contoh: 260509001_Faizal_Adi";
    } else if (vlanVal === "602") {
        userInput.placeholder = "Contoh: 17260515001@tulungagung.net";
    }
    
    userInput.maxLength = 50;
    userInput.oninput = function() {
        this.value = this.value.replace(/[^a-zA-Z0-9._\-@]/g, '');
    };
    
    modeSelect.value = "pppoe";
    modeSelect.disabled = true;
}

/**
 * Helper: Logika Numerik untuk Pelanggan Reguler
 */
function applyRegulerLogic(userInput, modeSelect, olt, vlanVal) {
    userInput.placeholder = "Username (10 Digit Angka)";
    userInput.maxLength = 10;
    userInput.oninput = function() {
        this.value = this.value.replace(/[^0-9]/g, '');
    };

    const supportBridge = ["100", "1501", "1000", "511"];
    
    if (olt === "c600") {
        modeSelect.disabled = false;
    } else {
        const canBridge = supportBridge.includes(vlanVal);
        modeSelect.disabled = !canBridge;
        if (!canBridge) modeSelect.value = "pppoe";
    }
}

/**
 * Menyalin script ke clipboard
 */
function copyScript() {
    const output = document.getElementById("output");
    if (!output || !output.value) {
        Swal.fire("Kosong", "Tidak ada script untuk disalin", "warning");
        return;
    }
    
    output.select();
    output.setSelectionRange(0, 99999);
    
    try {
        document.execCommand("copy");
        Swal.fire({ 
            icon: 'success', 
            title: 'Berhasil Disalin!', 
            timer: 800, 
            showConfirmButton: false 
        });
    } catch (err) {
        Swal.fire("Error", "Gagal menyalin teks", "error");
    }
}

/**
 * Membersihkan form dengan konfirmasi
 */
function clearForm() {
    Swal.fire({
        title: 'Bersihkan form?',
        text: "Semua data input dan output akan dihapus!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Ya, hapus!',
        cancelButtonText: 'Batal'
    }).then((result) => {
        if (result.isConfirmed) {
            document.querySelectorAll("input").forEach(i => i.value = "");
            document.getElementById("output").value = "";
            
            const ifaceInput = document.getElementById("iface");
            if (ifaceInput) ifaceInput.focus();

            Swal.fire({
                title: 'Dibersihkan!',
                icon: 'success',
                timer: 800,
                showConfirmButton: false
            });
        }
    });
}

/**
 * Fungsi Terpadu untuk Generate Script PPPoE Secret Mikrotik
 */
function generateSecret() {
    if (!validasiInput(true)) return;

    const user = document.getElementById("user").value.trim();
    const pass = document.getElementById("pass").value.trim();
    const rawDesc = document.getElementById("desc") ? document.getElementById("desc").value.trim() : "";
    
    const profileElem = document.getElementById("profile");
    const profile = profileElem ? profileElem.value : "default";

    let commentPart = "";
    if (rawDesc) {
        const commentValue = `${user} - ${rawDesc.toUpperCase()}`;
        commentPart = ` comment="${commentValue}"`;
    }

    const script = `/ppp secret add name="${user}" password="${pass}" service=pppoe profile="${profile}"${commentPart}`;

    const outputArea = document.getElementById("output");
    if (outputArea) {
        outputArea.value = script;
    }

    Swal.fire({
        icon: 'success',
        title: 'Secret Mikrotik Siap!',
        text: `User: ${user} | Profil: ${profile}`,
        timer: 1500,
        showConfirmButton: false,
        position: 'center'
    });
}

/**
 * Logika Cerdas Membedah Teks dari Hasil Paste
 * Mendukung deteksi otomatis: Interface, ONU ID, dan Serial Number (SN)
 */
function handlePaste(event) {
    const vlan = document.getElementById("vlan").value;
    
    // Ambil data teks dari clipboard
    let paste = (event.clipboardData || window.clipboardData).getData('text').trim();

    // =========================================================================
    // JALUR 1: DETEKSI FORMAT INPUT CLI / UNCONFIGURED (Dengan/Tanpa Tipe & SN)
    // =========================================================================
    const interfaceRegex = /(?:gpon[-_](?:onu|olt)[-_])?(\d+\/\d+\/\d+)/i;
    const matchIface = paste.match(interfaceRegex);

    if (matchIface) {
        event.preventDefault(); // Hentikan aksi paste default browser

        // 1. Ekstrak dan Set Nilai Interface
        let extractedIface = formatInterface(matchIface[1]);
        document.getElementById("iface").value = extractedIface;

        // 2. Ekstrak ONU ID (jika ada tanda titik dua setelah interface, misal :1 atau :103)
        const onuRegex = /\d+\/\d+\/\d+:(\d+)/;
        const matchOnu = paste.match(onuRegex);
        if (matchOnu && matchOnu[1]) {
            let onuId = parseInt(matchOnu[1], 10);

            // Validasi: Wajib angka dan Maksimal 128
            if (!isNaN(onuId) && onuId >= 1 && onuId <= 128) {
                document.getElementById("onu").value = onuId;
            } else if (onuId > 128) {
                // Jika hasil paste lebih dari 128, otomatis set ke batas maksimal (128)
                document.getElementById("onu").value = 128; 
                
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'warning',
                    title: 'ONU ID melebihi 128! Otomatis diatur ke 128.',
                    showConfirmButton: false,
                    timer: 2000
                });
            }
        }

        // 3. Ekstrak Serial Number (SN) ZTE 
        const snRegex = /(ZTEG[A-F0-9]{8}|[A-F0-9]{12})/i;
        const matchSn = paste.match(snRegex);
        if (matchSn && matchSn[1]) {
            document.getElementById("sn").value = matchSn[1].toUpperCase();
        }

        // Tampilkan Notifikasi Sukses
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Data OLT & SN Berhasil Dipisah!',
            showConfirmButton: false,
            timer: 1500
        });
        return; // Keluar dari fungsi, jangan lanjut ke jalur database pelanggan
    }

    // PERBAIKAN: Proteksi tambahan untuk VLAN tertentu (termasuk BB D / 207) agar tidak bentrok dengan database
    if (vlan === "2104" || vlan === "602" || vlan === "207") return;

    // =========================================================================
    // JALUR 2: DETEKSI FORMAT DATABASE PELANGGAN (e.g., "ID|NAMA")
    // =========================================================================
    const delimiters = /[|:\t-]/;
    if (delimiters.test(paste)) {
        event.preventDefault();

        let parts = paste.split(delimiters);
        let idPel = parts[0].replace(/\D/g, '').substring(0, 10);
        
        let namaPel = "";
        if (parts[1]) {
            namaPel = parts[1].trim().replace(/\s+/g, ' ').toUpperCase();
        }

        document.getElementById("user").value = idPel;
        
        const descInput = document.getElementById("desc");
        if (descInput && namaPel) {
            descInput.value = namaPel;
            
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'ID & Nama otomatis terpisah!',
                showConfirmButton: false,
                timer: 1500
            });
        }
    }
}

/**
 * Generate Password berdasarkan tanggal hari ini (DDMMYY)
 */
function generateDatePass() {
    const d = new Date();
    const date = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = String(d.getFullYear()).substring(2);

    const passOtomatis = `${date}${month}${year}`;
    
    const passInput = document.getElementById("pass");
    if (passInput) {
        passInput.value = passOtomatis;
        
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'info',
            title: `Password diatur ke: ${passOtomatis}`,
            showConfirmButton: false,
            timer: 1500
        });
    }
}

/**
 * Inisialisasi Event Listener Global saat DOM selesai dimuat
 */
document.addEventListener("DOMContentLoaded", function() {
    // Mencegah user mengetik manual melebihi angka 128 atau memasukkan karakter non-angka
    document.getElementById("onu").addEventListener("input", function() {
        if (this.value === "") return; // Ijinkan input kosong saat user menghapus angka
        
        let val = parseInt(this.value, 10);
        if (isNaN(val)) {
            this.value = "";
        } else if (val > 128) {
            this.value = 128;
        } else if (val < 1) {
            this.value = ""; // Biarkan kosong agar user bisa mengetik ulang dengan mudah
        }
    });
});
