// Export to PDF and Excel logic

function exportPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Check if data is valid
    const result = calculateSAW();
    if(result.error) {
        Swal.fire('Error', 'Tidak ada data untuk diexport', 'error');
        return;
    }
    
    const sorted = [...result.vMatrix].sort((a, b) => b.total - a.total);
    
    // Header
    doc.setFontSize(18);
    doc.text("Laporan Hasil Rekomendasi Laptop (Metode SAW)", 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 14, 30);
    
    // Table Data
    const tableColumn = ["Peringkat", "Nama Laptop", "Nilai Preferensi (V)"];
    const tableRows = [];

    sorted.forEach((item, index) => {
        const rowData = [
            index + 1,
            item.name,
            item.total.toFixed(4)
        ];
        tableRows.push(rowData);
    });

    // AutoTable plugin
    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 35,
        theme: 'grid',
        styles: { font: 'helvetica', fontSize: 10 },
        headStyles: { fillColor: [59, 130, 246] }, // Tailwind primary blue
        alternateRowStyles: { fillColor: [243, 244, 246] } // gray-100
    });
    
    // Winner Text
    const finalY = doc.lastAutoTable.finalY || 40;
    doc.setFontSize(12);
    doc.setTextColor(21, 128, 61); // green-700
    doc.text(`Rekomendasi Terbaik: ${sorted[0].name} (Nilai: ${sorted[0].total.toFixed(4)})`, 14, finalY + 15);

    doc.save("Hasil_Ranking_SPK_Laptop_SAW.pdf");
}

function exportExcel() {
    const result = calculateSAW();
    if(result.error) {
        Swal.fire('Error', 'Tidak ada data untuk diexport', 'error');
        return;
    }

    const sorted = [...result.vMatrix].sort((a, b) => b.total - a.total);
    
    // Prepare Data for SheetJS
    const data = sorted.map((item, index) => ({
        "Peringkat": index + 1,
        "Nama Laptop": item.name,
        "Nilai Akhir": parseFloat(item.total.toFixed(4))
    }));

    // Create Worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Adjust column widths
    const wscols = [
        {wch: 10}, // Peringkat
        {wch: 40}, // Nama Laptop
        {wch: 15}  // Nilai
    ];
    worksheet['!cols'] = wscols;

    // Create Workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ranking SAW");

    // Generate Excel File
    XLSX.writeFile(workbook, "Hasil_Ranking_SPK_Laptop_SAW.xlsx");
}
