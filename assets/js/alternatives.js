// Alternatives Management Logic

document.addEventListener('DOMContentLoaded', () => {
    const formAlternative = document.getElementById('form-alternative');
    if (formAlternative) {
        formAlternative.addEventListener('submit', handleAlternativeSubmit);
    }
});

// -------------------------------------------------------
// renderAlternatives — Tampilkan tabel data asli (raw)
// -------------------------------------------------------
function renderAlternatives() {
    const alternatives = Store.getAlternatives(); // format raw
    const theadTr = document.getElementById('alternatives-thead-tr');
    const tbody   = document.getElementById('alternatives-table-body');

    if (!theadTr || !tbody) return;

    theadTr.innerHTML = `
        <th class="p-4 border-b dark:border-gray-700 font-semibold w-16">No</th>
        <th class="p-4 border-b dark:border-gray-700 font-semibold min-w-[180px]">Nama Laptop</th>
        <th class="p-4 border-b dark:border-gray-700 font-semibold text-center">Harga (Rp)</th>
        <th class="p-4 border-b dark:border-gray-700 font-semibold text-center">RAM</th>
        <th class="p-4 border-b dark:border-gray-700 font-semibold text-center">Processor</th>
        <th class="p-4 border-b dark:border-gray-700 font-semibold text-center">Storage</th>
        <th class="p-4 border-b dark:border-gray-700 font-semibold text-center">Bundling OS</th>
        <th class="p-4 border-b dark:border-gray-700 font-semibold text-center">Jenis</th>
        <th class="p-4 border-b dark:border-gray-700 font-semibold text-center w-28">Aksi</th>
    `;

    tbody.innerHTML = '';

    if (alternatives.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="p-8 text-center text-gray-500">
                    <i class="ph ph-laptop text-4xl mb-2 block"></i>
                    Belum ada data alternatif.
                </td>
            </tr>
        `;
        return;
    }

    alternatives.forEach((alt, index) => {
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors';

        tr.innerHTML = `
            <td class="p-4 border-b dark:border-gray-700 text-center">${index + 1}</td>
            <td class="p-4 border-b dark:border-gray-700 font-medium">${alt.name}</td>
            <td class="p-4 border-b dark:border-gray-700 text-center">${new Intl.NumberFormat('id-ID').format(alt.harga)}</td>
            <td class="p-4 border-b dark:border-gray-700 text-center">${alt.ram}</td>
            <td class="p-4 border-b dark:border-gray-700 text-center">${alt.processor}</td>
            <td class="p-4 border-b dark:border-gray-700 text-center">${alt.storage}</td>
            <td class="p-4 border-b dark:border-gray-700 text-center">${alt.os}</td>
            <td class="p-4 border-b dark:border-gray-700 text-center">${alt.jenis}</td>
            <td class="p-4 border-b dark:border-gray-700 text-center">
                <div class="flex justify-center space-x-2">
                    <button onclick="editAlternative('${alt.id}')"
                        class="text-blue-500 hover:text-blue-700 p-1 bg-blue-50 hover:bg-blue-100 rounded dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                        title="Edit">
                        <i class="ph ph-pencil-simple text-lg"></i>
                    </button>
                    <button onclick="deleteAlternative('${alt.id}')"
                        class="text-red-500 hover:text-red-700 p-1 bg-red-50 hover:bg-red-100 rounded dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                        title="Hapus">
                        <i class="ph ph-trash text-lg"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// -------------------------------------------------------
// openAlternativeModal — Buka modal tambah laptop
// -------------------------------------------------------
window.openAlternativeModal = function () {
    document.getElementById('modal-alt-title').textContent = 'Tambah Laptop';
    document.getElementById('form-alternative').reset();
    document.getElementById('alt-id').value = '';
    openModal('modal-alternative');
};

// -------------------------------------------------------
// handleAlternativeSubmit — Simpan data raw ke store
// -------------------------------------------------------
function handleAlternativeSubmit(e) {
    e.preventDefault();

    const id        = document.getElementById('alt-id').value;
    const name      = document.getElementById('alt-name').value.trim();
    const harga     = parseInt(document.getElementById('alt-harga').value, 10);
    const ram       = document.getElementById('alt-ram').value;
    const processor = document.getElementById('alt-processor').value;
    const storage   = document.getElementById('alt-storage').value;
    const os        = document.getElementById('alt-os').value;
    const jenis     = document.getElementById('alt-jenis').value;

    const altData = { name, harga, ram, processor, storage, os, jenis };

    let alternatives = Store.getAlternatives();

    if (id) {
        // Edit
        const idx = alternatives.findIndex(a => a.id === id);
        if (idx !== -1) {
            alternatives[idx] = { id, ...altData };
            Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Data laptop diperbarui!', timer: 1500, showConfirmButton: false });
        }
    } else {
        // Tambah baru
        const newId = 'alt_' + Date.now();
        alternatives.push({ id: newId, ...altData });
        Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Data laptop ditambahkan!', timer: 1500, showConfirmButton: false });
    }

    Store.saveAlternatives(alternatives);
    closeModal('modal-alternative');
    renderAlternatives();
}

// -------------------------------------------------------
// editAlternative — Isi modal dengan data yang ada
// -------------------------------------------------------
window.editAlternative = function (id) {
    const alt = Store.getAlternatives().find(a => a.id === id);
    if (!alt) return;

    document.getElementById('modal-alt-title').textContent = 'Edit Laptop';
    document.getElementById('alt-id').value        = alt.id;
    document.getElementById('alt-name').value      = alt.name;
    document.getElementById('alt-harga').value     = alt.harga;
    document.getElementById('alt-ram').value       = alt.ram;
    document.getElementById('alt-processor').value = alt.processor;
    document.getElementById('alt-storage').value   = alt.storage;
    document.getElementById('alt-os').value        = alt.os;
    document.getElementById('alt-jenis').value     = alt.jenis;

    openModal('modal-alternative');
};

// -------------------------------------------------------
// deleteAlternative — Konfirmasi dan hapus
// -------------------------------------------------------
window.deleteAlternative = function (id) {
    Swal.fire({
        title: 'Hapus Laptop?',
        text: 'Data yang dihapus tidak dapat dikembalikan!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal'
    }).then(res => {
        if (res.isConfirmed) {
            let alternatives = Store.getAlternatives();
            alternatives = alternatives.filter(a => a.id !== id);
            Store.saveAlternatives(alternatives);
            renderAlternatives();
            Swal.fire({ icon: 'success', title: 'Terhapus!', timer: 1500, showConfirmButton: false });
        }
    });
};
