// ============================================================
// converter.js — Modul Konversi Skala Likert
// Mengubah data asli (raw) menjadi nilai skala Likert
// ============================================================

const LikertScale = {
    ram: {
        '8 GB':  3,
        '16 GB': 5
    },
    processor: {
        'I3': 3,
        'I5': 4,
        'I7': 5
    },
    storage: {
        '256 GB': 2,
        '512 GB': 4
    },
    os: {
        'LINUX':   3,
        'WINDOWS': 5
    },
    jenis: {
        'SECOND':   2,
        'ORIGINAL': 5
    }
};

/**
 * Konversi satu alternatif raw menjadi format nilai SAW
 * C1 = Harga (nilai asli rupiah, tidak dikonversi)
 * C2 = RAM (skala Likert)
 * C3 = Processor (skala Likert)
 * C4 = Storage (skala Likert)
 * C5 = Bundling OS (skala Likert)
 * C6 = Jenis (skala Likert)
 * @param {Object} rawAlt - Alternatif dengan data asli
 * @returns {Object} Alternatif dengan values {c1, c2, c3, c4, c5, c6}
 */
function convertToLikert(rawAlt) {
    return {
        id:   rawAlt.id,
        name: rawAlt.name,
        // simpan data asli agar bisa ditampilkan di Tabel 1
        raw: {
            harga:     rawAlt.harga,
            ram:       rawAlt.ram,
            processor: rawAlt.processor,
            storage:   rawAlt.storage,
            os:        rawAlt.os,
            jenis:     rawAlt.jenis
        },
        values: {
            c1: rawAlt.harga,                                         // Harga: nilai asli
            c2: LikertScale.ram[rawAlt.ram]       || 0,               // RAM
            c3: LikertScale.processor[rawAlt.processor] || 0,         // Processor
            c4: LikertScale.storage[rawAlt.storage]     || 0,         // Storage
            c5: LikertScale.os[rawAlt.os]               || 0,         // Bundling OS
            c6: LikertScale.jenis[rawAlt.jenis]         || 0          // Jenis
        }
    };
}

/**
 * Konversi semua alternatif raw sekaligus
 * @param {Array} rawAlts - Array alternatif dengan data asli
 * @returns {Array} Array alternatif terkonversi
 */
function convertAllAlternatives(rawAlts) {
    return rawAlts.map(alt => convertToLikert(alt));
}

/**
 * Kembalikan label yang tampil di tabel
 * Format rupiah untuk harga, string untuk field lainnya
 */
function getRawDisplayValue(field, value) {
    if (field === 'harga') {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
    }
    return value;
}
