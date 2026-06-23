// Alternatives Management Logic

document.addEventListener('DOMContentLoaded', () => {
    const formAlternative = document.getElementById('form-alternative');
    if(formAlternative) {
        formAlternative.addEventListener('submit', handleAlternativeSubmit);
    }
});

function renderAlternatives() {
    const criteria = Store.getCriteria();
    const alternatives = Store.getAlternatives();
    
    const theadTr = document.getElementById('alternatives-thead-tr');
    const tbody = document.getElementById('alternatives-table-body');
    
    if(!theadTr || !tbody) return;

    // Reset headers to just No and Nama Laptop
    theadTr.innerHTML = `
        <th class="p-4 border-b dark:border-gray-700 font-semibold w-16">No</th>
        <th class="p-4 border-b dark:border-gray-700 font-semibold min-w-[200px]">Nama Laptop</th>
    `;
    
    // Add criteria headers
    criteria.forEach(c => {
        theadTr.innerHTML += `<th class="p-4 border-b dark:border-gray-700 font-semibold text-center">${c.code} (${c.name})</th>`;
    });
    
    // Add actions header
    theadTr.innerHTML += `<th class="p-4 border-b dark:border-gray-700 font-semibold text-center w-28">Aksi</th>`;

    tbody.innerHTML = '';

    if (alternatives.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="${criteria.length + 3}" class="p-8 text-center text-gray-500">
                    <i class="ph ph-empty text-4xl mb-2 block"></i>
                    Belum ada data alternatif.
                </td>
            </tr>
        `;
        return;
    }

    alternatives.forEach((alt, index) => {
        let tr = document.createElement('tr');
        tr.className = "hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors";
        
        let html = `
            <td class="p-4 border-b dark:border-gray-700">${index + 1}</td>
            <td class="p-4 border-b dark:border-gray-700 font-medium">${alt.name}</td>
        `;
        
        criteria.forEach(c => {
            const val = alt.values[c.id] !== undefined ? alt.values[c.id] : '-';
            // format number if it's large (like price)
            const displayVal = val > 1000 ? new Intl.NumberFormat('id-ID').format(val) : val;
            html += `<td class="p-4 border-b dark:border-gray-700 text-center">${displayVal}</td>`;
        });
        
        html += `
            <td class="p-4 border-b dark:border-gray-700 text-center">
                <div class="flex justify-center space-x-2">
                    <button onclick="editAlternative('${alt.id}')" class="text-blue-500 hover:text-blue-700 p-1 bg-blue-50 hover:bg-blue-100 rounded dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors" title="Edit">
                        <i class="ph ph-pencil-simple text-lg"></i>
                    </button>
                    <button onclick="deleteAlternative('${alt.id}')" class="text-red-500 hover:text-red-700 p-1 bg-red-50 hover:bg-red-100 rounded dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors" title="Hapus">
                        <i class="ph ph-trash text-lg"></i>
                    </button>
                </div>
            </td>
        `;
        
        tr.innerHTML = html;
        tbody.appendChild(tr);
    });
}

window.openAlternativeModal = function() {
    const criteria = Store.getCriteria();
    if(criteria.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Kriteria Kosong',
            text: 'Silakan tambahkan data kriteria terlebih dahulu sebelum menambah alternatif.',
            confirmButtonColor: '#3b82f6'
        });
        return;
    }

    document.getElementById('modal-alt-title').textContent = 'Tambah Laptop';
    document.getElementById('form-alternative').reset();
    document.getElementById('alt-id').value = '';
    
    generateCriteriaInputs();
    openModal('modal-alternative');
};

function generateCriteriaInputs(existingValues = {}) {
    const criteria = Store.getCriteria();
    const container = document.getElementById('alt-criteria-inputs');
    container.innerHTML = '';
    
    criteria.forEach(c => {
        const val = existingValues[c.id] !== undefined ? existingValues[c.id] : '';
        const div = document.createElement('div');
        div.innerHTML = `
            <label class="block text-sm font-medium mb-1">${c.name} (${c.code}) - <span class="text-xs text-gray-500 uppercase">${c.type}</span></label>
            <input type="number" step="any" required data-crit-id="${c.id}" value="${val}" class="crit-val-input w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm">
        `;
        container.appendChild(div);
    });
}

function handleAlternativeSubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById('alt-id').value;
    const name = document.getElementById('alt-name').value;
    
    const inputs = document.querySelectorAll('.crit-val-input');
    let values = {};
    inputs.forEach(input => {
        const critId = input.getAttribute('data-crit-id');
        values[critId] = parseFloat(input.value);
    });
    
    let alternatives = Store.getAlternatives();
    
    if (id) {
        // Edit
        const index = alternatives.findIndex(a => a.id === id);
        if(index !== -1) {
            alternatives[index] = { id, name, values };
            Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Data laptop diperbarui!', timer: 1500, showConfirmButton: false });
        }
    } else {
        // Tambah
        const newId = 'alt_' + Date.now();
        alternatives.push({ id: newId, name, values });
        Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Data laptop ditambahkan!', timer: 1500, showConfirmButton: false });
    }
    
    Store.saveAlternatives(alternatives);
    closeModal('modal-alternative');
    renderAlternatives();
}

window.editAlternative = function(id) {
    const alternatives = Store.getAlternatives();
    const alt = alternatives.find(a => a.id === id);
    
    if(alt) {
        document.getElementById('modal-alt-title').textContent = 'Edit Laptop';
        document.getElementById('alt-id').value = alt.id;
        document.getElementById('alt-name').value = alt.name;
        
        generateCriteriaInputs(alt.values);
        openModal('modal-alternative');
    }
};

window.deleteAlternative = function(id) {
    Swal.fire({
        title: 'Hapus Laptop?',
        text: "Data yang dihapus tidak dapat dikembalikan!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal'
    }).then((result) => {
        if (result.isConfirmed) {
            let alternatives = Store.getAlternatives();
            alternatives = alternatives.filter(a => a.id !== id);
            Store.saveAlternatives(alternatives);
            renderAlternatives();
            Swal.fire({ icon: 'success', title: 'Terhapus!', timer: 1500, showConfirmButton: false });
        }
    });
};
