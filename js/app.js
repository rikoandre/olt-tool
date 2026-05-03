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
 * Validasi Input yang Fleksibel
 * @param {boolean} isSecret - Jika true, hanya validasi user, pass, dan paket.
 */
function validasiInput(isSecret = false) {
    // 1. Tentukan field mana yang wajib berdasarkan konteks
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

    // 2. Loop cek kekosongan
    for (let f of fields) {
        const el = document.getElementById(f.id);
        if (!el || !el.value.trim()) {
            Swal.fire("Oops!", `${f.name} wajib diisi!`, "warning");
            return false;
        }
    }

    // 3. Validasi spesifik: Username wajib 10 digit angka
    const userValue = document.getElementById("user").value.trim();
    const regexAngka = /^[0-9]{10}$/; 
    if (!regexAngka.test(userValue)) {
        Swal.fire({
            icon: 'error',
            title: 'Username Tidak Valid',
            text: 'Username wajib berupa 10 digit angka!',
            confirmButtonColor: '#d33'
        });
        return false;
    }

    // --- TAMBAHAN VALIDASI KHUSUS OLT (Hanya jika bukan isSecret) ---
    if (!isSecret) {
        // 4. Validasi ONU ID: Maksimal 128
        const onuValue = parseInt(document.getElementById("onu").value.trim());
        if (isNaN(onuValue) || onuValue < 1 || onuValue > 128) {
            Swal.fire("Batas ONU ID", "ONU ID harus berupa angka antara 1 sampai 128!", "warning");
            return false;
        }

        // 5. Validasi Serial Number: Minimal 8 karakter
        const snValue = document.getElementById("sn").value.trim();
        if (snValue.length < 8) {
            Swal.fire("SN Terlalu Pendek", "Serial Number minimal harus 8 karakter!", "warning");
            return false;
        }
    }

    return true;
}


/**
 * Fungsi Utama untuk Generate Script OLT
 */
function generate() {
    // 1. Jalankan validasi (Cek kekosongan & format 10 digit username)
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
        desc: autoDescription(document.getElementById("user").value, document.getElementById("desc").value)
    };

    const olt = document.getElementById("oltType").value;
    const vlan = document.getElementById("vlan").value;
    const mode = document.getElementById("mode").value;

    let script = "";

    try {
        // --- LOGIC PEMILIHAN TEMPLATE ---
        if (olt === "c600") {
            // Logic khusus ZTE C600
            script = (mode === "bridge") ? c600BridgeTemplate(data) : c600Template(data);
        } else {
            // Logic khusus ZTE C300 / C320
            if (mode === "bridge") {
                // Seleksi Template Bridge berdasarkan VLAN
                if (vlan === "100") {
                    script = unbBridgeTemplate(data);
                } else if (vlan === "1501") {
                    script = boloBridgeTemplate(data);
                } else if (vlan === "1000") {
                    script = ugrBridgeTemplate(data);
                } else if (vlan === "511") {
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

        // 4. Output Hasil ke Textarea
        document.getElementById("output").value = script;

        // 5. Notifikasi Berhasil
        Swal.fire({ 
            icon: 'success', 
            title: 'Berhasil!', 
            text: 'Script berhasil dibuat', 
            timer: 1000, 
            showConfirmButton: false 
        });

    } catch (error) {
        console.error(error);
        Swal.fire({
            icon: 'error',
            title: 'Template Error',
            text: 'Gagal memanggil template. Pastikan templates.js sudah ter-load dengan benar.'
        });
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
    Swal.fire({ icon: 'success', title: 'Copied!', timer: 500, showConfirmButton: false });
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
