import React, { useState, useRef } from 'react';
import { DocumentDownloadIcon, PrinterIcon, ChevronLeftIcon, ChevronRightIcon } from '../../components/icons';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

// Données de test selon le modèle
const reglementsData = [
  {
    id: 1,
    date: '02/01/2024',
    numero: 'REG-2024-0001',
    client: 'SOCIETE IVOIRIENNE DE COMMERCE',
    montant: 1500000,
    modePaiement: 'VIREMENT',
    reference: 'VIR-2024-001',
    banque: 'SGBCI',
    compte: 'CI008 01018 12345678901 01',
    dateValeur: '03/01/2024'
  },
  {
    id: 2,
    date: '05/01/2024',
    numero: 'REG-2024-0002',
    client: 'GROUPE INDUSTRIEL IVOIRIEN',
    montant: 2750000,
    modePaiement: 'CHEQUE',
    reference: 'CHQ-2024-001',
    banque: 'ECOBANK',
    compte: 'CI015 01020 98765432109 02',
    dateValeur: '05/01/2024'
  },
  {
    id: 3,
    date: '10/01/2024',
    numero: 'REG-2024-0003',
    client: 'ENTREPRISE GENERALE DU SUD',
    montant: 980000,
    modePaiement: 'ESPECES',
    reference: 'ESP-2024-001',
    banque: 'BNI',
    compte: 'CI011 01019 45678912345 03',
    dateValeur: '10/01/2024'
  },
  {
    id: 4,
    date: '15/01/2024',
    numero: 'REG-2024-0004',
    client: 'SOCIETE IVOIRIENNE DE COMMERCE',
    montant: 3200000,
    modePaiement: 'VIREMENT',
    reference: 'VIR-2024-002',
    banque: 'SGBCI',
    compte: 'CI008 01018 12345678901 01',
    dateValeur: '16/01/2024'
  },
  {
    id: 5,
    date: '20/01/2024',
    numero: 'REG-2024-0005',
    client: 'GROUPE INDUSTRIEL IVOIRIEN',
    montant: 1250000,
    modePaiement: 'CHEQUE',
    reference: 'CHQ-2024-002',
    banque: 'ECOBANK',
    compte: 'CI015 01020 98765432109 02',
    dateValeur: '20/01/2024'
  },
  {
    id: 6,
    date: '25/01/2024',
    numero: 'REG-2024-0006',
    client: 'ENTREPRISE GENERALE DU SUD',
    montant: 2100000,
    modePaiement: 'VIREMENT',
    reference: 'VIR-2024-003',
    banque: 'BNI',
    compte: 'CI011 01019 45678912345 03',
    dateValeur: '26/01/2024'
  },
  {
    id: 7,
    date: '28/01/2024',
    numero: 'REG-2024-0007',
    client: 'SOCIETE IVOIRIENNE DE COMMERCE',
    montant: 1800000,
    modePaiement: 'ESPECES',
    reference: 'ESP-2024-002',
    banque: 'SGBCI',
    compte: 'CI008 01018 12345678901 01',
    dateValeur: '28/01/2024'
  }
];

const ReglementsPage: React.FC = () => {
  // Variables de calcul des totaux
  const calculateTotals = (data: typeof reglementsData) => {
    const totalGeneral = data.reduce((sum, item) => sum + item.montant, 0);
    const totalVirement = data
      .filter(item => item.modePaiement === 'VIREMENT')
      .reduce((sum, item) => sum + item.montant, 0);
    const totalCheque = data
      .filter(item => item.modePaiement === 'CHEQUE')
      .reduce((sum, item) => sum + item.montant, 0);
    const totalEspece = data
      .filter(item => item.modePaiement === 'ESPECES')
      .reduce((sum, item) => sum + item.montant, 0);
    
    return { totalGeneral, totalVirement, totalCheque, totalEspece };
  };

  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const [dateDebut, setDateDebut] = useState(formatDate(firstDayOfMonth));
  const [dateFin, setDateFin] = useState(formatDate(lastDayOfMonth));
  const [currentPage, setCurrentPage] = useState(1);
  const [showReport, setShowReport] = useState(false);
  const itemsPerPage = 10;
  
  const tableRef = useRef<HTMLDivElement>(null);
  
  // Calcul des éléments à afficher
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = reglementsData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(reglementsData.length / itemsPerPage);
  
  // Calculer les totaux initiaux
  const calculateInitialTotals = () => {
    const { totalGeneral, totalVirement, totalCheque, totalEspece } = calculateTotals(reglementsData);
    return { totalGeneral, totalVirement, totalCheque, totalEspece };
  };

  // État pour stocker les totaux
  const [totals, setTotals] = useState(calculateInitialTotals());

  const handleAfficher = (e?: React.FormEvent) => {
    e?.preventDefault();
    setCurrentPage(1);
    setShowReport(true);
  };

  const formatDateForExport = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const handleExportPDF = () => {
    if (!showReport) {
      alert('Veuillez d\'abord afficher le rapport avant d\'exporter en PDF');
      return;
    }

    // Calculer les totaux pour l'export PDF
    const { totalGeneral: pdfTotalGeneral, totalVirement: pdfTotalVirement, 
            totalCheque: pdfTotalCheque, totalEspece: pdfTotalEspece } = calculateTotals(reglementsData);
    
    // Mettre à jour les totaux dans l'état
    setTotals({ totalGeneral: pdfTotalGeneral, totalVirement: pdfTotalVirement, 
                totalCheque: pdfTotalCheque, totalEspece: pdfTotalEspece });

    const doc = new jsPDF('l', 'pt', 'a4'); // Mode paysage pour plus d'espace
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // En-tête
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('RÉPUBLIQUE DE CÔTE D\'IVOIRE', pageWidth / 2, margin + 15, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('MINISTERE DU COMMERCE, DE L\'INDUSTRIE ET DE LA PROMOTION DES PME', pageWidth / 2, margin + 30, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.text('DIRECTION GENERALE DE L\'INDUSTRIE', pageWidth / 2, margin + 45, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.text('DIRECTION DE L\'INDUSTRIE', pageWidth / 2, margin + 60, { align: 'center' });
    doc.setFontSize(8);
    doc.text('BP V 29 ABIDJAN - TEL: (225) 20 22 20 12 - FAX: (225) 20 22 20 13', pageWidth / 2, margin + 75, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('ETAT DES REGLEMENTS', pageWidth / 2, margin + 95, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Période du ${formatDateForExport(dateDebut)} au ${formatDateForExport(dateFin)}`, pageWidth / 2, margin + 115, { align: 'center' });
    
    // Préparer les données du tableau
    const columns = [
      { header: 'N°', dataKey: 'id', width: 30 },
      { header: 'Date', dataKey: 'date', width: 60 },
      { header: 'N° Règlement', dataKey: 'numero', width: 80 },
      { header: 'Client', dataKey: 'client', width: 120 },
      { header: 'Montant', dataKey: 'montant', width: 60 },
      { header: 'Mode Paiement', dataKey: 'modePaiement', width: 70 },
      { header: 'Référence', dataKey: 'reference', width: 70 },
      { header: 'Banque', dataKey: 'banque' },
      { header: 'N° Compte', dataKey: 'compte' },
      { header: 'Date Valeur', dataKey: 'dateValeur' }
    ];
      
    const rows = reglementsData.map(item => ({
      ...item,
      montant: new Intl.NumberFormat('fr-FR').format(item.montant) + ' FCFA'
    }));
      
    (doc as any).autoTable({
      head: [columns.map(col => col.header)],
      body: rows.map(row => columns.map(col => row[col.dataKey as keyof typeof row] || '')),
      startY: 180,
      styles: { fontSize: 6, cellPadding: 2 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: 240 },
      margin: { left: 20, right: 20 },
      didDrawPage: function() {
        // Ajouter les totaux après le dessin du tableau
        const totalY = (doc as any).lastAutoTable.finalY + 20;
        
        // Afficher les totaux
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('TOTAL VIREMENT', 40, totalY);
        doc.text('TOTAL CHEQUE', 200, totalY);
        doc.text('TOTAL ESPECES', 360, totalY);
        doc.text('TOTAL GENERAL', 520, totalY);
        
        doc.setFont('helvetica', 'normal');
        doc.text(`${new Intl.NumberFormat('fr-FR').format(totals.totalVirement)} FCFA`, 40, totalY + 20);
        doc.text(`${new Intl.NumberFormat('fr-FR').format(totals.totalCheque)} FCFA`, 200, totalY + 20);
        doc.text(`${new Intl.NumberFormat('fr-FR').format(totals.totalEspece)} FCFA`, 360, totalY + 20);
        doc.text(`${new Intl.NumberFormat('fr-FR').format(totals.totalGeneral)} FCFA`, 520, totalY + 20);
        
        // Pied de page
        const footerY = totalY + 50;
        doc.setFontSize(10);
        doc.text('Arrêté le présent état à la date du', 40, footerY);
        doc.text('Fait à Abidjan, le', 40, footerY + 40);
        
        // Lignes de signature
        doc.line(40, footerY + 60, 200, footerY + 60);
        doc.line(400, footerY + 60, 560, footerY + 60);
        
        doc.text('Le Directeur', 100, footerY + 80);
        doc.text('Le Comptable', 460, footerY + 80);
      }
    });
    
    // Sauvegarder le PDF
    doc.save(`etat-reglements-${dateDebut}-${dateFin}.pdf`);
  };
  
  const formatDisplayDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  
  const handleExportExcel = () => {
    if (!showReport) {
      alert('Veuillez d\'abord afficher le rapport avant d\'exporter en Excel');
      return;
    }

    // Calculer les totaux pour l'export
    const { totalGeneral: expTotalGeneral, totalVirement: expTotalVirement, 
            totalCheque: expTotalCheque, totalEspece: expTotalEspece } = calculateTotals(reglementsData);

    // Formater les données pour l'export Excel
    const dataToExport = reglementsData.map(item => ({
      'N°': item.id,
      'Date': item.date,
      'N° Règlement': item.numero,
      'Client': item.client,
      'Montant': item.montant,
      'Mode Paiement': item.modePaiement,
      'Référence': item.reference,
      'Banque': item.banque,
      'N° Compte': item.compte,
      'Date Valeur': item.dateValeur
    }));

    // Ajouter les totaux
    const totalRow = {
      'N°': 'TOTAL GENERAL',
      'Montant': expTotalGeneral,
      'Mode Paiement': `VIREMENT: ${new Intl.NumberFormat('fr-FR').format(expTotalVirement)} | ` +
                      `CHEQUE: ${new Intl.NumberFormat('fr-FR').format(expTotalCheque)} | ` +
                      `ESPECES: ${new Intl.NumberFormat('fr-FR').format(expTotalEspece)}`
    };

    // Créer la feuille de calcul
    const worksheet = XLSX.utils.json_to_sheet([...dataToExport, {}, totalRow]);
    
    // Mettre en forme l'en-tête
    const headerStyle = {
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '2C5282' } },
      alignment: { horizontal: 'center' }
    };

    // Appliquer le style à la première ligne (en-têtes)
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:J1');
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
      worksheet[cellAddress].s = headerStyle;
    }

    // Créer le classeur et sauvegarder
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Règlements');
    
    // Générer le nom du fichier avec la date
    const formattedDate = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `etat-reglements-${formattedDate}.xlsx`);
  };

  const handlePrint = () => {
    if (!showReport) {
      alert('Veuillez d\'abord afficher le rapport avant d\'imprimer');
      return;
    }
    
    // Mettre à jour les totaux avant l'impression
    const updatedTotals = calculateTotals(reglementsData);
    setTotals(updatedTotals);
    
    // Créer une nouvelle fenêtre pour l'impression
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Créer le contenu HTML pour l'impression
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>État des Règlements</title>
        <style>
          @page { size: A4 landscape; margin: 1cm; }
          body { font-family: Arial, sans-serif; font-size: 10pt; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #000; padding: 4px; text-align: left; }
          th { background-color: #f0f0f0; font-weight: bold; text-align: center; }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .total-row { font-weight: bold; background-color: #f0f0f0; }
          .header { text-align: center; margin-bottom: 20px; }
          .title { font-size: 14pt; font-weight: bold; margin: 10px 0; }
          .subtitle { font-size: 10pt; margin: 5px 0; }
          .footer { margin-top: 30px; display: flex; justify-content: space-between; }
          .signature { width: 200px; border-top: 1px solid #000; margin-top: 50px; padding-top: 5px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>RÉPUBLIQUE DE CÔTE D'IVOIRE</div>
          <div>MINISTERE DU COMMERCE, DE L'INDUSTRIE ET DE LA PROMOTION DES PME</div>
          <div class="title">DIRECTION GENERALE DE L'INDUSTRIE</div>
          <div>DIRECTION DE L'INDUSTRIE</div>
          <div>BP V 29 ABIDJAN - TEL: (225) 20 22 20 12 - FAX: (225) 20 22 20 13</div>
          <div class="title">ETAT DES REGLEMENTS</div>
          <div class="subtitle">Période du ${formatDisplayDate(new Date(dateDebut))} au ${formatDisplayDate(new Date(dateFin))}</div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>N°</th>
              <th>Date</th>
              <th>N° Règlement</th>
              <th>Client</th>
              <th>Montant</th>
              <th>Mode Paiement</th>
              <th>Référence</th>
              <th>Banque</th>
              <th>Compte</th>
              <th>Date Valeur</th>
            </tr>
          </thead>
          <tbody>
            ${reglementsData.map((item, index) => `
              <tr>
                <td class="text-center">${index + 1}</td>
                <td class="text-center">${item.date}</td>
                <td>${item.numero}</td>
                <td>${item.client}</td>
                <td class="text-right">${new Intl.NumberFormat('fr-FR').format(item.montant)}</td>
                <td class="text-center">${item.modePaiement}</td>
                <td class="text-center">${item.reference || ''}</td>
                <td>${item.banque || ''}</td>
                <td class="text-center">${item.compte || ''}</td>
                <td class="text-center">${item.dateValeur || ''}</td>
              </tr>
            `).join('')}
            
            <!-- Lignes de totaux -->
            <tr class="total-row">
              <td colspan="4">TOTAL VIREMENT</td>
              <td class="text-right">${new Intl.NumberFormat('fr-FR').format(updatedTotals.totalVirement)}</td>
              <td colspan="5"></td>
            </tr>
            <tr class="total-row">
              <td colspan="4">TOTAL CHEQUE</td>
              <td class="text-right">${new Intl.NumberFormat('fr-FR').format(updatedTotals.totalCheque)}</td>
              <td colspan="5"></td>
            </tr>
            <tr class="total-row">
              <td colspan="4">TOTAL ESPECES</td>
              <td class="text-right">${new Intl.NumberFormat('fr-FR').format(updatedTotals.totalEspece)}</td>
              <td colspan="5"></td>
            </tr>
            <tr style="background-color: #e0e0e0; font-weight: bold;">
              <td colspan="4">TOTAL GENERAL</td>
              <td class="text-right">${new Intl.NumberFormat('fr-FR').format(updatedTotals.totalGeneral)}</td>
              <td colspan="5"></td>
            </tr>
          </tbody>
        </table>
        
        <div class="footer">
          <div>
            <div>Arrêté le présent état à la date du ${new Date().toLocaleDateString('fr-FR')}</div>
            <div class="signature">Le Directeur</div>
          </div>
          <div class="signature" style="margin-left: auto; margin-right: 50px;">
            Le Comptable
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 50px;">
          Fait à Abidjan, le ${new Date().toLocaleDateString('fr-FR')}
        </div>
        
        <script>
          // Imprimer automatiquement quand la page est chargée
          window.onload = function() {
            setTimeout(function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            }, 500);
          };
        </script>
      </body>
      </html>
    `;

    // Écrire le contenu dans la nouvelle fenêtre
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
  };


  return (
    <div className="p-6">
      {/* Formulaire de recherche */}
      <div className="bg-white p-4 mb-4 rounded-lg shadow-md">
        <form onSubmit={handleAfficher} className="flex flex-col">
          <div className="flex items-end space-x-4">
            <div className="flex-1">
              <div className="flex items-center">
                <span className="text-sm font-medium mr-2 whitespace-nowrap">Période du</span>
                <input
                  type="date"
                  className="p-2 border border-gray-300 rounded text-sm w-full"
                  value={dateDebut}
                  onChange={(e) => setDateDebut(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center">
                <span className="text-sm font-medium mr-2 whitespace-nowrap">au</span>
                <input
                  type="date"
                  className="p-2 border border-gray-300 rounded text-sm w-full"
                  value={dateFin}
                  onChange={(e) => setDateFin(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center"
              >
                Afficher
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Boutons d'export et d'impression */}
      {showReport && (
        <div className="mb-4">
          <div className="border-b border-black p-2 text-center bg-gray-50 mb-4">
            <div className="text-sm font-medium">
              Période du {dateDebut.split('-').reverse().join('/')} au {dateFin.split('-').reverse().join('/')}
            </div>
          </div>
          <div className="flex justify-end space-x-4">
            <button
              onClick={handleExportPDF}
              className="bg-red-600 text-white px-4 py-2 rounded flex items-center space-x-2 hover:bg-red-700"
            >
              <DocumentDownloadIcon className="h-5 w-5" />
              <span>Exporter en PDF</span>
            </button>
            <button
              onClick={handleExportExcel}
              className="bg-green-600 text-white px-4 py-2 rounded flex items-center space-x-2 hover:bg-green-700"
            >
              <DocumentDownloadIcon className="h-5 w-5" />
              <span>Exporter en Excel</span>
            </button>
            <button
              onClick={handlePrint}
              className="bg-blue-600 text-white px-4 py-2 rounded flex items-center space-x-2 hover:bg-blue-700"
            >
              <PrinterIcon className="h-5 w-5" />
              <span>Imprimer</span>
            </button>
          </div>
        </div>

        {/* Tableau */}
        <div className="text-xs">
          <div className="overflow-x-auto">
            <div ref={tableRef}>
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border border-black p-1 text-center w-8">N°</th>
                    <th className="border border-black p-1 text-center w-16">Date</th>
                    <th className="border border-black p-1 text-center w-24">N° Règlement</th>
                    <th className="border border-black p-1 text-center w-32">Client</th>
                    <th className="border border-black p-1 text-center w-24">Montant</th>
                    <th className="border border-black p-1 text-center w-20">Mode Paiement</th>
                    <th className="border border-black p-1 text-center w-16">Référence</th>
                    <th className="border border-black p-1 text-center w-24">Banque</th>
                    <th className="border border-black p-1 text-center w-20">N° Compte</th>
                    <th className="border border-black p-1 text-center w-16">Date Valeur</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((reglement, index) => (
                    <tr key={reglement.id}>
                      <td className="border border-black p-1 text-center">{index + 1}</td>
                      <td className="border border-black p-1 text-center">{reglement.date}</td>
                      <td className="border border-black p-1 text-center">{reglement.numero}</td>
                      <td className="border border-black p-1">{reglement.client}</td>
                      <td className="border border-black p-1 text-right">
                        {new Intl.NumberFormat('fr-FR').format(reglement.montant)}
                      </td>
                      <td className="border border-black p-1 text-center">{reglement.modePaiement}</td>
                      <td className="border border-black p-1 text-center">{reglement.reference}</td>
                      <td className="border border-black p-1">{reglement.banque}</td>
                      <td className="border border-black p-1 text-center">{reglement.compte}</td>
                      <td className="border border-black p-1 text-center">{reglement.dateValeur}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={4} className="border border-black p-1 font-bold">TOTAL VIREMENT</td>
                    <td className="border border-black p-1 text-right font-bold">
                      {new Intl.NumberFormat('fr-FR').format(totals.totalVirement)}
                    </td>
                    <td colSpan={5} className="border border-black p-1"></td>
                  </tr>
                  <tr>
                    <td colSpan={4} className="border border-black p-1 font-bold">TOTAL CHEQUE</td>
                    <td className="border border-black p-1 text-right font-bold">
                      {new Intl.NumberFormat('fr-FR').format(totals.totalCheque)}
                    </td>
                    <td colSpan={5} className="border border-black p-1"></td>
                  </tr>
                  <tr>
                    <td colSpan={4} className="border border-black p-1 font-bold">TOTAL ESPECES</td>
                    <td className="border border-black p-1 text-right font-bold">
                      {new Intl.NumberFormat('fr-FR').format(totals.totalEspece)}
                    </td>
                    <td colSpan={5} className="border border-black p-1"></td>
                  </tr>
                  <tr>
                    <td colSpan={4} className="border border-black p-1 font-bold bg-gray-100">TOTAL GENERAL</td>
                    <td className="border border-black p-1 text-right font-bold bg-gray-100">
                      {new Intl.NumberFormat('fr-FR').format(totals.totalGeneral)}
                    </td>
                    <td colSpan={5} className="border border-black p-1 bg-gray-100"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Pied de page */}
          <div className="mt-4 p-1 text-xs">
            <div className="mb-2">
              Arrêté le présent état à la date du {new Date().toLocaleDateString('fr-FR')}
            </div>
            <div className="flex justify-between mt-8">
              <div className="text-center">
                <div className="border-t border-black w-48 mx-auto mb-1"></div>
                <div>Le Directeur</div>
              </div>
              <div className="text-center">
                <div className="border-t border-black w-48 mx-auto mb-1"></div>
                <div>Le Comptable</div>
              </div>
            </div>
            <div className="text-center mt-8">
              Fait à Abidjan, le {new Date().toLocaleDateString('fr-FR')}
            </div>
          </div>

          {/* Pagination simplifiée */}
          {totalPages > 1 && (
            <div className="mt-4 flex justify-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-black rounded"
              >
                Précédent
              </button>
              <span className="px-3 py-1">
                Page {currentPage} sur {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-black rounded"
              >
                Suivant
              </button>
            </div>
          )}
        </div>
      </div>
    )}

    {/* Boutons d'export et d'impression - affichés uniquement quand le rapport est visible */}
    {showReport && (
      <div className="flex justify-end space-x-4 mb-4">
        <button
          onClick={handleExportPDF}
          className="bg-red-600 text-white px-4 py-2 rounded flex items-center space-x-2 hover:bg-red-700"
        >
          <DocumentDownloadIcon className="h-5 w-5" />
          <span>Exporter en PDF</span>
        </button>
        <button
          onClick={handleExportExcel}
          className="bg-green-600 text-white px-4 py-2 rounded flex items-center space-x-2 hover:bg-green-700"
        >
          <DocumentDownloadIcon className="h-5 w-5" />
          <span>Exporter en Excel</span>
        </button>
        <button
          onClick={handlePrint}
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center space-x-2 hover:bg-blue-700"
        >
          <PrinterIcon className="h-5 w-5" />
          <span>Imprimer</span>
        </button>
      </div>
      <div className="text-xs">MINISTERE DU COMMERCE, DE L'INDUSTRIE ET DE LA PROMOTION DES PME</div>
      <div className="text-xs font-bold">DIRECTION GENERALE DE L'INDUSTRIE</div>
      <div className="text-xs">DIRECTION DE L'INDUSTRIE</div>
      <div className="text-xs">BP V 29 ABIDJAN - TEL: (225) 20 22 20 12 - FAX: (225) 20 22 20 13</div>
      <div className="mt-1 text-sm font-bold">ETAT DES REGLEMENTS</div>
      <div className="border-b border-black p-2 text-center bg-gray-50">
        <div className="text-sm font-medium">
          Période du {dateDebut.split('-').reverse().join('/')} au {dateFin.split('-').reverse().join('/')}
          
          {/* Période affichée */}
          <div className="border-b border-black p-2 text-center bg-gray-50">
            <div className="text-sm font-medium">
              Période du {dateDebut.split('-').reverse().join('/')} au {dateFin.split('-').reverse().join('/')}
            </div>
          </div>

          {/* Tableau */}
          <div className="text-xs">
            <div className="overflow-x-auto">
              <div ref={tableRef}>
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border border-black p-1 text-center w-8">N°</th>
                      <th className="border border-black p-1 text-center w-16">Date</th>
                      <th className="border border-black p-1 text-center w-24">N° Règlement</th>
                      <th className="border border-black p-1 text-center w-32">Client</th>
                      <th className="border border-black p-1 text-center w-24">Montant</th>
                      <th className="border border-black p-1 text-center w-20">Mode Paiement</th>
                      <th className="border border-black p-1 text-center w-16">Référence</th>
                      <th className="border border-black p-1 text-center w-24">Banque</th>
                      <th className="border border-black p-1 text-center w-20">N° Compte</th>
                      <th className="border border-black p-1 text-center w-16">Date Valeur</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((reglement, index) => (
                      <tr key={reglement.id}>
                        <td className="border border-black p-1 text-center">{index + 1}</td>
                        <td className="border border-black p-1 text-center">{reglement.date}</td>
                        <td className="border border-black p-1 text-center">{reglement.numero}</td>
                        <td className="border border-black p-1">{reglement.client}</td>
                        <td className="border border-black p-1 text-right">
                          {new Intl.NumberFormat('fr-FR').format(reglement.montant)}
                        </td>
                        <td className="border border-black p-1 text-center">{reglement.modePaiement}</td>
                        <td className="border border-black p-1 text-center">{reglement.reference}</td>
                        <td className="border border-black p-1">{reglement.banque}</td>
                        <td className="border border-black p-1 text-center">{reglement.compte}</td>
                        <td className="border border-black p-1 text-center">{reglement.dateValeur}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={4} className="border border-black p-1 font-bold">TOTAL VIREMENT</td>
                      <td className="border border-black p-1 text-right font-bold">
                        {new Intl.NumberFormat('fr-FR').format(totals.totalVirement)}
                      </td>
                      <td colSpan={5} className="border border-black p-1"></td>
                    </tr>
                    <tr>
                      <td colSpan={4} className="border border-black p-1 font-bold">TOTAL CHEQUE</td>
                      <td className="border border-black p-1 text-right font-bold">
                        {new Intl.NumberFormat('fr-FR').format(totals.totalCheque)}
                      </td>
                      <td colSpan={5} className="border border-black p-1"></td>
                    </tr>
                    <tr>
                      <td colSpan={4} className="border border-black p-1 font-bold">TOTAL ESPECES</td>
                      <td className="border border-black p-1 text-right font-bold">
                        {new Intl.NumberFormat('fr-FR').format(totals.totalEspece)}
                      </td>
                      <td colSpan={5} className="border border-black p-1"></td>
                    </tr>
                    <tr>
                      <td colSpan={4} className="border border-black p-1 font-bold bg-gray-100">TOTAL GENERAL</td>
                      <td className="border border-black p-1 text-right font-bold bg-gray-100">
                        {new Intl.NumberFormat('fr-FR').format(totals.totalGeneral)}
                      </td>
                      <td colSpan={5} className="border border-black p-1 bg-gray-100"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Pied de page */}
            <div className="mt-4 p-1 text-xs">
              <div className="mb-2">
                Arrêté le présent état à la date du {new Date().toLocaleDateString('fr-FR')}
              </div>
              <div className="flex justify-between mt-8">
                <div className="text-center">
                  <div className="border-t border-black w-48 mx-auto mb-1"></div>
                  <div>Le Directeur</div>
                </div>
                <div className="text-center">
                  <div className="border-t border-black w-48 mx-auto mb-1"></div>
                  <div>Le Comptable</div>
                </div>
              </div>
              <div className="text-center mt-8">
                Fait à Abidjan, le {new Date().toLocaleDateString('fr-FR')}
              </div>
            </div>

            {/* Pagination simplifiée */}
            {totalPages > 1 && (
              <div className="mt-4 flex justify-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-black rounded"
                >
                  Précédent
                </button>
                <span className="px-3 py-1">
                  Page {currentPage} sur {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-black rounded"
                >
                  Suivant
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    )}
  </div>
);

export default ReglementsPage;