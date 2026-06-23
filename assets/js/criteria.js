// Criteria Management Logic

document.addEventListener('DOMContentLoaded', () => {
    // We already init in app.js on route change, but this is for specific form binds
    const formCriteria = document.getElementById('form-criteria');
    if(formCriteria) {
        formCriteria.addEventListener('submit', handleCriteriaSubmit);
    }
});

function renderCriteria() {
    const criteria = Store.getCriteria();
    const tbody = document.getElementById('criteria-table-body');
    
    if(!tbody) return;

    tbody.innerHTML = '';

    if (criteria.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="p-8 text-center text-gray-500">
                    <i class="ph ph-empty text-4xl mb-2 block"></i>
                    Belum ada data kriteria.
                </td>
            </tr>
        `;
        updateWeightStatus(0);
        return;
    }

    let totalWeight = 0;

    criteria.forEach((c, index) => {
        totalWeight += parseFloat(c.weight);
        
        const typeBadge = c.type === 'benefit' 
            ? `<span class="px-2 py-1 rounded-md text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Benefit</span>`
            : `<span class="px-2 py-1 rounded-md text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Cost</span>`;

        const tr = document.createElement('tr');
        tr.className = "hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors";
        tr.innerHTML = `
            <td class="p-4 border-b dark:border-gray-700">${index + 1}</td>
            <td class="p-4 border-b dark:border-gray-700 font-medium">${c.code}</td>
            <td class="p-4 border-b dark:border-gray-700">${c.name}</td>
            <td class="p-4 border-b dark:border-gray-700">${typeBadge}</td>
            <td class="p-4 border-b dark:border-gray-700 text-center font-semibold">${c.weight}</td>
            <td class="p-4 border-b dark:border-gray-700 text-center">
                <div class="flex justify-center space-x-2">
                    <button onclick="editCriteria('${c.id}')" class="text-blue-500 hover:text-blue-700 p-1 bg-blue-50 hover:bg-blue-100 rounded dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors" title="Edit">
                        <i class="ph ph-pencil-simple text-lg"></i>
                    </button>
                    <button onclick="deleteCriteria('${c.id}')" class="text-red-500 hover:text-red-700 p-1 bg-red-50 hover:bg-red-100 rounded dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors" title="Hapus">
                        <i class="ph ph-trash text-lg"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    updateWeightStatus(totalWeight);
}

function updateWeightStatus(total) {
    const statusEl = document.getElementById('weight-status');
    const progressEl = document.getElementById('weight-progress');
    
    if(!statusEl || !progressEl) return;

    progressEl.style.width = `${Math.min(total, 100)}%`;
    
    if (total === 100) {
        statusEl.className = "px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
        statusEl.textContent = `Total: ${total} (Valid)`;
        progressEl.className = "bg-success h-2 rounded-full transition-all duration-500";
    } else {
        statusEl.className = "px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
        statusEl.textContent = `Total: ${total} (Harus 100)`;
        progressEl.className = "bg-yellow-500 h-2 rounded-full transition-all duration-500";
    }
}

window.openCriteriaModal = function() {
    document.getElementById('modal-criteria-title').textContent = 'Tambah Kriteria';
    document.getElementById('form-criteria').reset();
    document.getElementById('crit-id').value = '';
    openModal('modal-criteria');
};

function handleCriteriaSubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById('crit-id').value;
    const code = document.getElementById('crit-code').value;
    const name = document.getElementById('crit-name').value;
    const type = document.getElementById('crit-type').value;
    const weight = parseFloat(document.getElementById('crit-weight').value);
    
    let criteria = Store.getCriteria();
    
    // Validasi Total Bobot sementara
    let currentTotal = criteria.reduce((sum, c) => sum + parseFloat(c.weight), 0);
    if(id) {
        // jika edit, kurangi bobot lama
        const oldC = criteria.find(c => c.id === id);
        currentTotal -= parseFloat(oldC.weight);
    }
    
    if (currentTotal + weight > 100) {
        Swal.fire({
            icon: 'warning',
            title: 'Bobot Berlebih!',
            text: `Total bobot saat ini ${currentTotal}, ditambah ${weight} menjadi ${currentTotal + weight}. Total maksimal adalah 100.`,
            confirmButtonColor: '#3b82f6'
        });
        return;
    }

    if (id) {
        // Edit
        const index = criteria.findIndex(c => c.id === id);
        if(index !== -1) {
            criteria[index] = { id, code, name, type, weight };
            Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Kriteria diperbarui!', timer: 1500, showConfirmButton: false });
        }
    } else {
        // Tambah
        const newId = 'crit_' + Date.now();
        criteria.push({ id: newId, code, name, type, weight });
        Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Kriteria ditambahkan!', timer: 1500, showConfirmButton: false });
    }
    
    Store.saveCriteria(criteria);
    closeModal('modal-criteria');
    renderCriteria();
    
    // Update alternatives if needed (add new property)
    if(!id) {
        updateAlternativesSchema();
    }
}

window.editCriteria = function(id) {
    const criterion = Store.getCriterionById(id);
    if(criterion) {
        document.getElementById('modal-criteria-title').textContent = 'Edit Kriteria';
        document.getElementById('crit-id').value = criterion.id;
        document.getElementById('crit-code').value = criterion.code;
        document.getElementById('crit-name').value = criterion.name;
        document.getElementById('crit-type').value = criterion.type;
        document.getElementById('crit-weight').value = criterion.weight;
        openModal('modal-criteria');
    }
};

window.deleteCriteria = function(id) {
    Swal.fire({
        title: 'Hapus Kriteria?',
        text: "Data yang dihapus tidak dapat dikembalikan!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal'
    }).then((result) => {
        if (result.isConfirmed) {
            let criteria = Store.getCriteria();
            criteria = criteria.filter(c => c.id !== id);
            Store.saveCriteria(criteria);
            renderCriteria();
            Swal.fire({ icon: 'success', title: 'Terhapus!', timer: 1500, showConfirmButton: false });
        }
    });
};

function updateAlternativesSchema() {
    // When a new criteria is added, we should make sure alternatives have this key
    const criteria = Store.getCriteria();
    let alternatives = Store.getAlternatives();
    let changed = false;
    
    alternatives.forEach(alt => {
        criteria.forEach(c => {
            if(alt.values[c.id] === undefined) {
                alt.values[c.id] = 0; // default value
                changed = true;
            }
        });
    });
    
    if(changed) {
        Store.saveAlternatives(alternatives);
    }
}
