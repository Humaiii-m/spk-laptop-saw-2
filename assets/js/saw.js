// SAW Calculation Logic

function calculateSAW() {
    const criteria     = Store.getCriteria();
    const rawAlts      = Store.getAlternatives();          // data asli
    const alternatives = Store.getAlternativesConverted(); // data terkonversi (Likert)

    if (criteria.length === 0 || alternatives.length === 0) {
        return { error: true, message: 'Data kriteria atau alternatif masih kosong.' };
    }

    // Check weight total
    const totalWeight = criteria.reduce((sum, c) => sum + parseFloat(c.weight), 0);
    if (totalWeight !== 100) {
        return { error: true, message: 'Total bobot kriteria harus 100.' };
    }

    // 1. Matriks Keputusan — menggunakan nilai terkonversi (Likert + harga asli)
    // Tidak perlu kalkulasi tambahan; ini adalah `alternatives.values`

    // 2. Normalisasi (R)
    // Cari min/max untuk setiap kriteria
    const minMax = {};
    criteria.forEach(c => {
        let values = alternatives.map(a => a.values[c.id] || 0);
        minMax[c.id] = {
            max: Math.max(...values),
            min: Math.min(...values)
        };
    });

    const rMatrix = alternatives.map(alt => {
        let rValues = {};
        criteria.forEach(c => {
            const x = alt.values[c.id] || 0;
            if (c.type === 'benefit') {
                rValues[c.id] = minMax[c.id].max === 0 ? 0 : x / minMax[c.id].max;
            } else { // cost
                rValues[c.id] = x === 0 ? 0 : minMax[c.id].min / x;
            }
        });
        return { id: alt.id, name: alt.name, rValues };
    });

    // 3. Nilai Preferensi (V)
    const vMatrix = rMatrix.map((rAlt, idx) => {
        let vValues = {};
        let total   = 0;
        criteria.forEach(c => {
            const r      = rAlt.rValues[c.id];
            const weight = parseFloat(c.weight) / 100;
            const v      = r * weight;
            vValues[c.id] = v;
            total += v;
        });
        return { id: rAlt.id, name: rAlt.name, vValues, total };
    });

    return { error: false, criteria, rawAlts, alternatives, rMatrix, vMatrix };
}

// -------------------------------------------------------
// renderCalculation — Halaman Perhitungan SAW
// Menampilkan 5 tabel: Data Asli, Skala Likert, Matriks
// Keputusan, Normalisasi, Nilai Preferensi
// -------------------------------------------------------
function renderCalculation() {
    const result = calculateSAW();

    // Elemen-elemen per tabel
    const rawBody    = document.getElementById('raw-body');
    const likertBody = document.getElementById('likert-body');
    const matHead    = document.getElementById('matrix-head');
    const matBody    = document.getElementById('matrix-body');
    const normHead   = document.getElementById('norm-head');
    const normBody   = document.getElementById('norm-body');
    const prefBody   = document.getElementById('pref-body');

    const showError = (msg) => {
        [rawBody, likertBody, matBody, normBody, prefBody].forEach(el => {
            if (el) el.innerHTML = `<tr><td class="p-4 text-center text-red-500" colspan="20">${msg}</td></tr>`;
        });
    };

    if (result.error) {
        showError(result.message);
        return;
    }

    const { criteria, rawAlts, alternatives } = result;

    // ---- TABEL A: DATA ASLI ----
    if (rawBody) {
        const rawHead = document.getElementById('raw-head');
        if (rawHead) {
            rawHead.innerHTML = `<tr>
                <th class="p-2 border border-gray-200 dark:border-gray-600 text-center">No</th>
                <th class="p-2 border border-gray-200 dark:border-gray-600">Nama Laptop</th>
                <th class="p-2 border border-gray-200 dark:border-gray-600 text-center">Harga (Rp)</th>
                <th class="p-2 border border-gray-200 dark:border-gray-600 text-center">RAM</th>
                <th class="p-2 border border-gray-200 dark:border-gray-600 text-center">Processor</th>
                <th class="p-2 border border-gray-200 dark:border-gray-600 text-center">Storage</th>
                <th class="p-2 border border-gray-200 dark:border-gray-600 text-center">Bundling OS</th>
                <th class="p-2 border border-gray-200 dark:border-gray-600 text-center">Jenis</th>
            </tr>`;
        }
        rawBody.innerHTML = '';
        rawAlts.forEach((alt, index) => {
            rawBody.innerHTML += `<tr>
                <td class="p-2 border border-gray-200 dark:border-gray-600 text-center">${index + 1}</td>
                <td class="p-2 border border-gray-200 dark:border-gray-600 font-medium">${alt.name}</td>
                <td class="p-2 border border-gray-200 dark:border-gray-600 text-center">${new Intl.NumberFormat('id-ID').format(alt.harga)}</td>
                <td class="p-2 border border-gray-200 dark:border-gray-600 text-center">${alt.ram}</td>
                <td class="p-2 border border-gray-200 dark:border-gray-600 text-center">${alt.processor}</td>
                <td class="p-2 border border-gray-200 dark:border-gray-600 text-center">${alt.storage}</td>
                <td class="p-2 border border-gray-200 dark:border-gray-600 text-center">${alt.os}</td>
                <td class="p-2 border border-gray-200 dark:border-gray-600 text-center">${alt.jenis}</td>
            </tr>`;
        });
    }

    // ---- TABEL B: SKALA LIKERT ----
    if (likertBody) {
        const likertHead = document.getElementById('likert-head');
        let criteriaHeaderHTML = `<tr>
            <th class="p-2 border border-gray-200 dark:border-gray-600 text-center">No</th>
            <th class="p-2 border border-gray-200 dark:border-gray-600">Nama Laptop</th>`;
        criteria.forEach(c => {
            criteriaHeaderHTML += `<th class="p-2 border border-gray-200 dark:border-gray-600 text-center">${c.code}<br><span class="text-xs font-normal text-gray-500">${c.name}</span></th>`;
        });
        criteriaHeaderHTML += `</tr>`;
        if (likertHead) likertHead.innerHTML = criteriaHeaderHTML;

        likertBody.innerHTML = '';
        alternatives.forEach((alt, index) => {
            let tr = `<tr>
                <td class="p-2 border border-gray-200 dark:border-gray-600 text-center">${index + 1}</td>
                <td class="p-2 border border-gray-200 dark:border-gray-600 font-medium">${alt.name}</td>`;
            criteria.forEach(c => {
                const val = alt.values[c.id] !== undefined ? alt.values[c.id] : 0;
                const display = (c.id === 'c1') ? new Intl.NumberFormat('id-ID').format(val) : val;
                tr += `<td class="p-2 border border-gray-200 dark:border-gray-600 text-center">${display}</td>`;
            });
            tr += `</tr>`;
            likertBody.innerHTML += tr;
        });
    }

    // ---- TABEL C: MATRIKS KEPUTUSAN ----
    if (matHead && matBody) {
        let theadHTML = `<tr>
            <th class="p-2 border border-gray-200 dark:border-gray-600 w-10 text-center">No</th>
            <th class="p-2 border border-gray-200 dark:border-gray-600">Alternatif</th>`;
        criteria.forEach(c => {
            theadHTML += `<th class="p-2 border border-gray-200 dark:border-gray-600 text-center">${c.code}</th>`;
        });
        theadHTML += `</tr>`;
        matHead.innerHTML = theadHTML;
        normHead.innerHTML = theadHTML;

        matBody.innerHTML = '';
        alternatives.forEach((alt, index) => {
            let tr = `<tr>
                <td class="p-2 border border-gray-200 dark:border-gray-600 text-center">${index + 1}</td>
                <td class="p-2 border border-gray-200 dark:border-gray-600 font-medium">${alt.name}</td>`;
            criteria.forEach(c => {
                const val = alt.values[c.id] || 0;
                const display = (val > 1000) ? new Intl.NumberFormat('id-ID').format(val) : val;
                tr += `<td class="p-2 border border-gray-200 dark:border-gray-600 text-center">${display}</td>`;
            });
            tr += `</tr>`;
            matBody.innerHTML += tr;
        });
    }

    // ---- TABEL D: NORMALISASI ----
    if (normBody) {
        normBody.innerHTML = '';
        result.rMatrix.forEach((rAlt, index) => {
            let tr = `<tr>
                <td class="p-2 border border-gray-200 dark:border-gray-600 text-center">${index + 1}</td>
                <td class="p-2 border border-gray-200 dark:border-gray-600 font-medium">${rAlt.name}</td>`;
            criteria.forEach(c => {
                tr += `<td class="p-2 border border-gray-200 dark:border-gray-600 text-center">${rAlt.rValues[c.id].toFixed(4)}</td>`;
            });
            tr += `</tr>`;
            normBody.innerHTML += tr;
        });
    }

    // ---- TABEL E: NILAI PREFERENSI ----
    if (prefBody) {
        prefBody.innerHTML = '';
        result.vMatrix.forEach((vAlt, index) => {
            let calcStr = criteria.map(c => {
                const w = parseFloat(c.weight) / 100;
                return `(${result.rMatrix[index].rValues[c.id].toFixed(4)} &times; ${w})`;
            }).join(' + ');

            prefBody.innerHTML += `
                <tr>
                    <td class="p-2 border border-gray-200 dark:border-gray-600 font-medium whitespace-nowrap">${vAlt.name}</td>
                    <td class="p-2 border border-gray-200 dark:border-gray-600 text-xs font-mono text-gray-500 dark:text-gray-400 max-w-lg truncate overflow-hidden" title="${calcStr}">${calcStr}</td>
                    <td class="p-2 border border-gray-200 dark:border-gray-600 text-center font-bold text-primary">${vAlt.total.toFixed(4)}</td>
                </tr>`;
        });
    }
}

// -------------------------------------------------------
// renderRanking — Halaman Hasil Ranking
// -------------------------------------------------------
function renderRanking() {
    const result      = calculateSAW();
    const tbody       = document.getElementById('ranking-table-body');
    const winnerBanner = document.getElementById('winner-banner');
    const winnerName  = document.getElementById('winner-name');
    const winnerScore = document.getElementById('winner-score');

    if (!tbody) return;

    if (result.error) {
        tbody.innerHTML = `<tr><td colspan="3" class="p-8 text-center text-red-500">${result.message}</td></tr>`;
        if (winnerBanner) winnerBanner.classList.add('hidden');
        return;
    }

    // Urutkan berdasarkan total V descending
    const sorted = [...result.vMatrix].sort((a, b) => b.total - a.total);

    tbody.innerHTML = '';
    sorted.forEach((item, index) => {
        const isWinner  = index === 0;
        const rankClass = isWinner
            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400'
            : index === 1 ? 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
            : index === 2 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-400'
            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';

        const tr = document.createElement('tr');
        tr.className = isWinner
            ? 'bg-green-50 dark:bg-green-900/10 transition-colors'
            : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors';

        tr.innerHTML = `
            <td class="p-4 border-b dark:border-gray-700 text-center">
                <span class="inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${rankClass}">${index + 1}</span>
            </td>
            <td class="p-4 border-b dark:border-gray-700 font-medium ${isWinner ? 'text-green-700 dark:text-green-400 text-lg' : ''}">
                ${item.name}
            </td>
            <td class="p-4 border-b dark:border-gray-700 text-center font-bold ${isWinner ? 'text-green-700 dark:text-green-400 text-lg' : 'text-primary'}">
                ${item.total.toFixed(4)}
            </td>
        `;
        tbody.appendChild(tr);
    });

    if (sorted.length > 0) {
        if (winnerName)  winnerName.textContent  = sorted[0].name;
        if (winnerScore) winnerScore.textContent = sorted[0].total.toFixed(4);
        if (winnerBanner) winnerBanner.classList.remove('hidden');
    } else {
        if (winnerBanner) winnerBanner.classList.add('hidden');
    }
}

function leadingSpaceTrim(str) {
    return str.replace(/^\s+/gm, '');
}
