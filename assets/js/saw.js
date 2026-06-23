// SAW Calculation Logic

function calculateSAW() {
    const criteria = Store.getCriteria();
    const alternatives = Store.getAlternatives();

    if (criteria.length === 0 || alternatives.length === 0) {
        return { error: true, message: 'Data kriteria atau alternatif masih kosong.' };
    }

    // Check weight total
    const totalWeight = criteria.reduce((sum, c) => sum + parseFloat(c.weight), 0);
    if (totalWeight !== 100) {
        return { error: true, message: 'Total bobot kriteria harus 100.' };
    }

    // 1. Matrix Keputusan (X)
    // No explicit calculation needed, it's just the alternatives values
    
    // 2. Normalisasi (R)
    // Find min/max for each criteria
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
    const vMatrix = rMatrix.map(rAlt => {
        let vValues = {};
        let total = 0;
        criteria.forEach(c => {
            const r = rAlt.rValues[c.id];
            const weight = parseFloat(c.weight) / 100; // Convert to decimal 0-1
            const v = r * weight;
            vValues[c.id] = v;
            total += v;
        });
        return { id: rAlt.id, name: rAlt.name, vValues, total };
    });

    return { error: false, criteria, alternatives, rMatrix, vMatrix };
}

function renderCalculation() {
    const result = calculateSAW();
    
    const matHead = document.getElementById('matrix-head');
    const matBody = document.getElementById('matrix-body');
    const normHead = document.getElementById('norm-head');
    const normBody = document.getElementById('norm-body');
    const prefBody = document.getElementById('pref-body');

    if(!matHead || result.error) {
        if(result.error && matBody) {
            matBody.innerHTML = `<tr><td class="p-4 text-center text-red-500">${result.message}</td></tr>`;
            normBody.innerHTML = '';
            prefBody.innerHTML = '';
        }
        return;
    }

    // Build Headers
    let theadHTML = `<tr><th class="p-2 border border-gray-200 dark:border-gray-600 w-10 text-center">No</th><th class="p-2 border border-gray-200 dark:border-gray-600">Alternatif</th>`;
    result.criteria.forEach(c => {
        theadHTML += `<th class="p-2 border border-gray-200 dark:border-gray-600 text-center">${c.code}</th>`;
    });
    theadHTML += `</tr>`;
    
    matHead.innerHTML = leadingSpaceTrim(theadHTML);
    normHead.innerHTML = leadingSpaceTrim(theadHTML);

    // Build Matrix Body
    matBody.innerHTML = '';
    result.alternatives.forEach((alt, index) => {
        let tr = `<tr><td class="p-2 border border-gray-200 dark:border-gray-600 text-center">${index + 1}</td><td class="p-2 border border-gray-200 dark:border-gray-600 font-medium">${alt.name}</td>`;
        result.criteria.forEach(c => {
            const val = alt.values[c.id] || 0;
            const displayVal = val > 1000 ? new Intl.NumberFormat('id-ID').format(val) : val;
            tr += `<td class="p-2 border border-gray-200 dark:border-gray-600 text-center">${displayVal}</td>`;
        });
        tr += `</tr>`;
        matBody.innerHTML += leadingSpaceTrim(tr);
    });

    // Build Norm Body
    normBody.innerHTML = '';
    result.rMatrix.forEach((rAlt, index) => {
        let tr = `<tr><td class="p-2 border border-gray-200 dark:border-gray-600 text-center">${index + 1}</td><td class="p-2 border border-gray-200 dark:border-gray-600 font-medium">${rAlt.name}</td>`;
        result.criteria.forEach(c => {
            tr += `<td class="p-2 border border-gray-200 dark:border-gray-600 text-center">${rAlt.rValues[c.id].toFixed(3)}</td>`;
        });
        tr += `</tr>`;
        normBody.innerHTML += leadingSpaceTrim(tr);
    });

    // Build Pref Body
    prefBody.innerHTML = '';
    result.vMatrix.forEach((vAlt, index) => {
        let calcStr = result.criteria.map(c => {
            const w = parseFloat(c.weight) / 100;
            return `(${result.rMatrix[index].rValues[c.id].toFixed(3)} &times; ${w})`;
        }).join(' + ');

        let tr = `
            <tr>
                <td class="p-2 border border-gray-200 dark:border-gray-600 font-medium whitespace-nowrap">${vAlt.name}</td>
                <td class="p-2 border border-gray-200 dark:border-gray-600 text-xs font-mono text-gray-500 dark:text-gray-400 max-w-lg truncate overflow-hidden" title="${calcStr}">${calcStr}</td>
                <td class="p-2 border border-gray-200 dark:border-gray-600 text-center font-bold text-primary">${vAlt.total.toFixed(4)}</td>
            </tr>
        `;
        prefBody.innerHTML += leadingSpaceTrim(tr);
    });
}

function renderRanking() {
    const result = calculateSAW();
    const tbody = document.getElementById('ranking-table-body');
    const winnerBanner = document.getElementById('winner-banner');
    const winnerName = document.getElementById('winner-name');
    const winnerScore = document.getElementById('winner-score');

    if(!tbody) return;

    if (result.error) {
        tbody.innerHTML = `<tr><td colspan="3" class="p-8 text-center text-red-500">${result.message}</td></tr>`;
        winnerBanner.classList.add('hidden');
        return;
    }

    // Sort by total V descending
    const sorted = [...result.vMatrix].sort((a, b) => b.total - a.total);

    tbody.innerHTML = '';
    sorted.forEach((item, index) => {
        const isWinner = index === 0;
        const rankClass = isWinner ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400' 
                          : index === 1 ? 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          : index === 2 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-400'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
                          
        let tr = document.createElement('tr');
        tr.className = isWinner ? "bg-green-50 dark:bg-green-900/10 transition-colors" : "hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors";
        
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
        winnerName.textContent = sorted[0].name;
        winnerScore.textContent = sorted[0].total.toFixed(4);
        winnerBanner.classList.remove('hidden');
    } else {
        winnerBanner.classList.add('hidden');
    }
}

function leadingSpaceTrim(str) {
    return str.replace(/^\s+/gm, '');
}
