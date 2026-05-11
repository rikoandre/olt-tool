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
 * Fungsi Validasi Input yang Sempurna
 * Mendukung validasi standar (10 digit) dan fleksibilitas DDR Prisma di semua tipe OLT
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

    // 3. LOGIKA VALIDASI USERNAME (DDR Prisma vs Reguler)
    // Perbaikan: Cek berdasarkan VLAN saja agar berlaku di C600 maupun C300
    if (vlan === "2104") {
        // --- VALIDASI DDR PRISMA ---
        const ddrRegex = /^[a-zA-Z0-9._-]+$/;
        
        if (!ddrRegex.test(userValue)) {
            Swal.fire({
                icon: 'error',
                title: 'Format DDR Prisma Salah',
                text: 'Username hanya boleh Huruf, Angka, Titik(.), atau Underscore(_). Tanpa Spasi!',
                confirmButtonColor: '#d33'
            });
            return false;
        }
        
        if (userValue.length < 10) {
            Swal.fire("Username Terlalu Pendek", "Username DDR Prisma minimal 10 karakter!", "warning");
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
        const onuValue = parseInt(document.getElementById("onu").value.trim());
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
        // Gunakan autoDescription atau fallback ke username jika deskripsi kosong
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
                // Khusus DDR Prisma di C600
                script = c600DdrPrismaTemplate(data);
            } else {
                // Default C600 (VLAN 134) mendukung Bridge & PPPoE
                script = (mode === "bridge") ? c600BridgeTemplate(data) : c600Template(data);
            }

        } else {
            // ==========================================
            // SEKSI OLT ZTE C300 / C320 (V6)
            // ==========================================
            if (vlan === "2104") {
                // Khusus DDR Prisma di C300260509001_Faizal_Adi_Pratama
                script = c300DdrPrismaTemplate(data);
            } else if (mode === "bridge") {
                // Seleksi Template Bridge berdasarkan VLAN C300
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
                // Mode PPPoE Standar C300 (VLAN 1001, 110, 1002, dll)
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
        // C600: Hanya tampilkan VLAN 134 dan 2104
        for (let i = 0; i < options.length; i++) {
            const val = options[i].value;
            options[i].style.display = (val === "134" || val === "2104") ? "block" : "none";
        }
        // Safety: Jika tersesat di VLAN lain, paksa ke 134
        if (vlanVal !== "134" && vlanVal !== "2104") vlanSelect.value = "134";
    } else {
        // C300/C320: Tampilkan semua kecuali 134
        for (let i = 0; i < options.length; i++) {
            const val = options[i].value;
            options[i].style.display = (val === "134") ? "none" : "block";
        }
        // Safety: Jika tersesat di VLAN 134, pindahkan ke default C300
        if (vlanVal === "134") vlanSelect.value = "1001";
    }

    // Ambil nilai VLAN terbaru setelah kemungkinan dipindah oleh safety check
    const currentVlan = vlanSelect.value;

    // --- 2. LOGIKA VALIDASI & UI BERDASARKAN VLAN ---
    if (currentVlan === "2104") {
        // KHUSUS DDR PRISMA (Berlaku untuk semua OLT)
        applyDdrPrismaLogic(userInput, modeSelect);
    } else {
        // PELANGGAN REGULER
        applyRegulerLogic(userInput, modeSelect, olt, currentVlan);
    }
}

/**
 * Helper: Logika Alfanumerik untuk DDR Prisma
 */
function applyDdrPrismaLogic(userInput, modeSelect) {
    userInput.placeholder = "Contoh: 260509001_Faizal_Adi";
    userInput.maxLength = 50;
    userInput.oninput = function() {
        // Izinkan Huruf, Angka, Underscore, Titik, dan Dash
        this.value = this.value.replace(/[^a-zA-Z0-9._-]/g, '');
    };
    
    // DDR Prisma wajib PPPoE
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
        // Hanya angka
        this.value = this.value.replace(/[^0-9]/g, '');
    };

    // Logika Mode Bridge untuk OLT C300/C320
    const supportBridge = ["100", "1501", "1000", "511"];
    
    if (olt === "c600") {
        // C600 reguler (134) selalu bisa pilih mode
        modeSelect.disabled = false;
    } else {
        // C300 reguler: Hanya VLAN tertentu yang bisa Bridge
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
    output.setSelectionRange(0, 99999); // Untuk mobile
    
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
            // Reset semua input kecuali select OLT
            document.querySelectorAll("input").forEach(i => i.value = "");
            document.getElementById("output").value = "";
            
            // Fokuskan kembali ke input pertama
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
 * Hanya mewajibkan Username, Password, dan Profile.
 */
function generateSecret() {
    // 1. Jalankan Validasi khusus Secret (isSecret = true)
    // Ini akan mengecek apakah User, Pass, dan Profile sudah terisi & User sesuai 10 digit angka
    if (!validasiInput(true)) return;

    // 2. Ambil data dari form
    const user = document.getElementById("user").value.trim();
    const pass = document.getElementById("pass").value.trim();
    const rawDesc = document.getElementById("desc") ? document.getElementById("desc").value.trim() : "";
    
    // Ambil nilai profile (Paket), pastikan elemen ada
    const profileElem = document.getElementById("profile");
    const profile = profileElem ? profileElem.value : "default";

    // 3. Logic Comment/Deskripsi (Opsional)
    // Jika kolom deskripsi diisi, tampilkan di comment Mikrotik. Jika kosong, script tetap jalan.
    let commentPart = "";
    if (rawDesc) {
        const commentValue = `${user} - ${rawDesc.toUpperCase()}`;
        commentPart = ` comment="${commentValue}"`;
    }

    // 4. Konstruksi Perintah CLI Mikrotik
    // script utama (User, Pass, Profile) + part comment (jika ada)
    const script = `/ppp secret add name="${user}" password="${pass}" service=pppoe profile="${profile}"${commentPart}`;

    // 5. Tampilkan Hasil ke Output Area
    const outputArea = document.getElementById("output");
    if (outputArea) {
        outputArea.value = script;
    }

    // 6. Notifikasi Visual menggunakan SweetAlert2
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
/**
 * Logika untuk membedah teks copypaste (Username|Nama)
 * Membersihkan spasi, tab, dan simbol yang tidak diinginkan.
 */
function handlePaste(event) {
    // Ambil teks dari clipboard
    let paste = (event.clipboardData || window.clipboardData).getData('text');
    
    // RegEx Delimiter: Mendukung |, :, -, dan Tab (\t)
    const delimiters = /[|:\t-]/;

    if (delimiters.test(paste)) {
        // Hentikan proses paste default
        event.preventDefault();

        // 1. Bagi teks berdasarkan delimiter
        let parts = paste.split(delimiters);
        
        // 2. Ambil ID Pelanggan (Hanya ambil angka, hapus spasi/simbol tersembunyi)
        let idPel = parts[0].replace(/\D/g, '').substring(0, 10);
        
        // 3. Ambil Nama Pelanggan (Bersihkan spasi di awal/akhir dan spasi ganda di tengah)
        let namaPel = "";
        if (parts[1]) {
            namaPel = parts[1]
                .trim()                 // Hapus spasi di depan & belakang
                .replace(/\s+/g, ' ')   // Ubah tab atau spasi ganda menjadi satu spasi saja
                .toUpperCase();         // Ubah ke HURUF BESAR
        }

        // 4. Masukkan ke kolom masing-masing
        document.getElementById("user").value = idPel;
        
        const descInput = document.getElementById("desc");
        if (descInput && namaPel) {
            descInput.value = namaPel;
            
            // Notifikasi Toast Sukses
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
    
    // Ambil Tanggal, Bulan (+1 karena index mulai dari 0), dan Tahun
    // padStart(2, '0') memastikan jika angka satuan tetap dapet nol di depan (contoh: 05)
    const date = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = String(d.getFullYear()).substring(2); // Ambil 2 digit terakhir tahun

    const passOtomatis = `${date}${month}${year}`;
    
    const passInput = document.getElementById("pass");
    if (passInput) {
        passInput.value = passOtomatis;
        
        // Notifikasi Toast Kecil
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
