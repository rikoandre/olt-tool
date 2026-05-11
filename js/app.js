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
 * Mendukung validasi standar (10 digit) dan fleksibilitas DDR Prisma
 */
function validasiInput(isSecret = false) {
    const olt = document.getElementById("oltType").value;
    const vlan = document.getElementById("vlan").value;
    const userValue = document.getElementById("user").value.trim();

    // 1. Tentukan field mana yang wajib diisi berdasarkan konteks (isSecret atau OLT)
    let fields = [];
    if (isSecret) {
        fields = [
            { id: 'user', name: 'Username' },
            { id: 'pass', name: 'Password' },
            { id: 'profile', name: 'Paket/Profile' }
        ];
    } else {
        fields = [
            { id: 'iface', name: 'Interface' },
            { id: 'onu', name: 'ONU ID' },
            { id: 'sn', name: 'Serial Number' },
            { id: 'user', name: 'Username' },
            { id: 'pass', name: 'Password' }
        ];
    }

    // 2. Cek kekosongan semua field yang wajib
    for (let f of fields) {
        const el = document.getElementById(f.id);
        if (!el || !el.value.trim()) {
            Swal.fire("Oops!", `${f.name} wajib diisi!`, "warning");
            return false;
        }
    }

    // 3. Logika Validasi Username (Pemisahan DDR Prisma vs Reguler)
    if (olt === "c600" && vlan === "2104") {
        // --- VALIDASI DDR PRISMA ---
        // Mendukung Alfanumerik, Underscore, dan Titik
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
    } else {
        // --- VALIDASI REGULER (10 Digit Angka) ---
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

    // 4. Validasi Tambahan Khusus Konfigurasi OLT (Bukan Secret Mikrotik)
    if (!isSecret) {
        // Validasi ONU ID: Harus angka 1 - 128
        const onuValue = parseInt(document.getElementById("onu").value.trim());
        if (isNaN(onuValue) || onuValue < 1 || onuValue > 128) {
            Swal.fire("Batas ONU ID", "ONU ID harus berupa angka antara 1 sampai 128!", "warning");
            return false;
        }

        // Validasi Serial Number: Minimal 8 karakter (ZTE biasanya 12 karakter)
        const snValue = document.getElementById("sn").value.trim();
        if (snValue.length < 8) {
            Swal.fire("SN Terlalu Pendek", "Serial Number minimal harus 8 karakter!", "warning");
            return false;
        }
    }

    return true; // Semua validasi lolos
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
            // --- Logic Khusus ZTE C600 ---
            if (vlan === "2104") {
                // Fitur Baru: DDR Prisma
                script = c600DdrPrismaTemplate(data);
            } else {
                // Default C600 (VLAN 134)
                script = (mode === "bridge") ? c600BridgeTemplate(data) : c600Template(data);
            }
        } 
        else {
            // --- Logic Khusus ZTE C300 / C320 ---
            if (mode === "bridge") {
                // Seleksi Template Bridge berdasarkan VLAN
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
                // Mode PPPoE (Normal) mengambil dari object 'templates' di templates.js
                // Menangani VLAN 1001, 134 (C300), 110, 1002, dll.
                script = templates[vlan] ? templates[vlan](data) : "Template VLAN tidak ditemukan.";
            }
        }

        // 4. Output Hasil ke Textarea
        const outputField = document.getElementById("output");
        if (outputField) {
            outputField.value = script;
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
// ==========================
// 3. UI HELPER FUNCTIONS
// ==========================

/**
 * Mengatur tampilan dropdown VLAN, Mode, dan Validasi Input berdasarkan tipe OLT
 */
function toggleVlan() {
    const olt = document.getElementById("oltType").value;
    const vlanSelect = document.getElementById("vlan");
    const modeSelect = document.getElementById("mode");
    const userInput = document.getElementById("user");
    
    if (!vlanSelect || !modeSelect || !userInput) return;

    const options = vlanSelect.options;
    const vlanVal = vlanSelect.value;

    if (olt === "c600") {
        // --- LOGIC OLT C600 ---
        vlanSelect.disabled = false; 

        // 1. Filter Dropdown: Hanya tampilkan VLAN khusus C600 (134 & 2104)
        for (let i = 0; i < options.length; i++) {
            const val = options[i].value;
            options[i].style.display = (val === "134" || val === "2104") ? "block" : "none";
        }

        // 2. Logic khusus per VLAN di C600
        if (vlanVal === "2104") {
            // --- MODE DDR PRISMA ---
            userInput.placeholder = "Contoh: 260509001_Faizal_Adi";
            userInput.maxLength = 50; 
            // Izinkan huruf, angka, titik, underscore, dan dash
            userInput.oninput = function() {
                this.value = this.value.replace(/[^a-zA-Z0-9._-]/g, '');
            };
            
            modeSelect.value = "pppoe";
            modeSelect.disabled = true; // DDR Prisma wajib PPPoE
        } else {
            // --- MODE C600 REGULER (VLAN 134) ---
            applyRegulerValidation(userInput);
            modeSelect.disabled = false;
        }

        // 3. Pastikan tidak nyangkut di VLAN C300
        if (vlanVal !== "134" && vlanVal !== "2104") {
            vlanSelect.value = "134";
        }

    } else {
        // --- LOGIC OLT C300 / C320 ---
        vlanSelect.disabled = false;
        applyRegulerValidation(userInput);

        // 1. Filter Dropdown: Sembunyikan VLAN khusus C600
        for (let i = 0; i < options.length; i++) {
            const val = options[i].value;
            options[i].style.display = (val === "134" || val === "2104") ? "none" : "block";
        }

        // 2. Pastikan tidak nyangkut di VLAN C600
        if (vlanVal === "134" || vlanVal === "2104") {
            vlanSelect.value = "1001"; // Default ke salah satu VLAN C300
        }

        // 3. Logic Pembatasan Mode Bridge C300
        const supportBridge = ["100", "1501", "1000", "511"];
        if (supportBridge.includes(vlanSelect.value)) {
            modeSelect.disabled = false;
        } else {
            modeSelect.value = "pppoe";
            modeSelect.disabled = true;
        }
    }
}

/**
 * Fungsi Pembantu untuk Reset Validasi ke Standar (10 Digit Angka)
 */
function applyRegulerValidation(inputEl) {
    if (!inputEl) return;
    inputEl.placeholder = "Username (10 Digit Angka)";
    inputEl.maxLength = 10;
    // Paksa hanya angka untuk mode selain DDR Prisma
    inputEl.oninput = function() {
        this.value = this.value.replace(/[^0-9]/g, '');
    };
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
