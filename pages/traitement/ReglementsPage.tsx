import React, { useState, useRef } from 'react';
import { DocumentDownloadIcon, PrinterIcon } from '../../components/icons';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface Reglement {
  id: number;
  numeroDossier: string;
  vendeur: string;
  quantite: number;
  produit: string;
  dateTransfert: string;
  montantDebite: number;
  montantTransfert: number;
  montantDevise: number;
  devise: string;
  date?: string;
  numero?: string;
  client?: string;
  montant?: number;
  modePaiement?: string;
  reference?: string;
  banque?: string;
  compte?: string;
  dateValeur?: string;
}

const MOCK_REGLEMENTS: Reglement[] = [
  {
    id: 2,
    numeroDossier: 'DOSS-002',
    vendeur: 'Vendeur 2',
    quantite: 2,
    produit: 'Produit B',
    dateTransfert: '05/01/2024',
    montantDebite: 2750000,
    montantTransfert: 2750000,
    montantDevise: 4500,
    devise: 'EUR',
    date: '05/01/2024',
    numero: 'REG-2024-0002',
    client: 'SOCIETE AFRICAINE DE COMMERCE',
    montant: 2750000,
    modePaiement: 'VIREMENT',
    reference: 'VIR-2024-001',
    banque: 'ECOBANK',
    compte: 'CI015 01020 98765432109 02',
    dateValeur: '05/01/2024'
  },
  {
    id: 3,
    numeroDossier: 'DOSS-003',
    vendeur: 'Vendeur 3',
    quantite: 1,
    produit: 'Produit C',
    dateTransfert: '10/01/2024',
    montantDebite: 980000,
    montantTransfert: 980000,
    montantDevise: 1600,
    devise: 'EUR',
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
    numeroDossier: 'DOSS-004',
    vendeur: 'Vendeur 4',
    quantite: 3,
    produit: 'Produit D',
    dateTransfert: '15/01/2024',
    montantDebite: 3200000,
    montantTransfert: 3200000,
    montantDevise: 5500,
    devise: 'USD',
    date: '15/01/2024',
    numero: 'REG-2024-0004',
    client: 'SOCIETE IVOIRIENNE DE COMMERCE',
    montant: 3200000,
    modePaiement: 'VIREMENT',
    reference: 'VIR-2024-002',
    banque: 'SGBCI',
    compte: 'CI008 01018 12345678901 01',
    dateValeur: '15/01/2024'
  },
  {
    id: 5,
    numeroDossier: 'DOSS-005',
    vendeur: 'Vendeur 5',
    quantite: 1,
    produit: 'Produit E',
    dateTransfert: '20/01/2024',
    montantDebite: 1850000,
    montantTransfert: 1850000,
    montantDevise: 3000,
    devise: 'EUR',
    date: '20/01/2024',
    numero: 'REG-2024-0005',
    client: 'GROUPE INDUSTRIEL OUEST AFRICAIN',
    montant: 1850000,
    modePaiement: 'CHEQUE',
    reference: 'CHQ-2024-002',
    banque: 'NSIA',
    compte: 'CI059 01023 45678912345 01',
    dateValeur: '20/01/2024'
  },
  {
    id: 6,
    numeroDossier: 'DOSS-006',
    vendeur: 'Vendeur 6',
    quantite: 2,
    produit: 'Produit F',
    dateTransfert: '25/01/2024',
    montantDebite: 2200000,
    montantTransfert: 2200000,
    montantDevise: 3700,
    devise: 'USD',
    date: '25/01/2024',
    numero: 'REG-2024-0006',
    client: 'ENTREPRISE NATIONALE DE COMMERCE',
    montant: 2200000,
    modePaiement: 'VIREMENT',
    reference: 'VIR-2024-003',
    banque: 'BICICI',
    compte: 'CI015 01020 98765432109 02',
    dateValeur: '25/01/2024'
  },
  {
    id: 7,
    numeroDossier: 'DOSS-007',
    vendeur: 'Vendeur 7',
    quantite: 1,
    produit: 'Produit G',
    dateTransfert: '28/01/2024',
    montantDebite: 1500000,
    montantTransfert: 1500000,
    montantDevise: 2500,
    devise: 'EUR',
    date: '28/01/2024',
    numero: 'REG-2024-0007',
    client: 'SOCIETE GENERALE DE COMMERCE',
    montant: 1500000,
    modePaiement: 'ESPECES',
    reference: 'ESP-2024-002',
    banque: 'SGBCI',
    compte: 'CI008 01018 12345678901 01',
    dateValeur: '28/01/2024'
  }
];

const ReglementsPage: React.FC = () => {
  interface Totals {
    montantDebite: number;
    montantTransfert: number;
    montantDevise: number;
  }

  const calculateTotals = (data: Reglement[]): Totals =>
    data.reduce(
      (acc, item) => ({
        montantDebite: acc.montantDebite + (item.montantDebite || 0),
        montantTransfert: acc.montantTransfert + (item.montantTransfert || 0),
        montantDevise: acc.montantDevise + (item.montantDevise || 0)
      }),
      { montantDebite: 0, montantTransfert: 0, montantDevise: 0 }
    );

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
  const [reglementsData] = useState<Reglement[]>(MOCK_REGLEMENTS);
  const itemsPerPage = 10;

  const tableRef = useRef<HTMLDivElement>(null);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = reglementsData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(reglementsData.length / itemsPerPage);

  const calculateInitialTotals = (): Totals => ({
    montantDebite: 0,
    montantTransfert: 0,
    montantDevise: 0
  });

  const [totals, setTotals] = useState<Totals>(calculateInitialTotals());

  const handleAfficher = (e?: React.FormEvent) => {
    e?.preventDefault();
    setCurrentPage(1);
    setShowReport(true);
    setTotals(calculateTotals(reglementsData));
  };

  const formatDateForExport = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);

  const handleExportPDF = () => {
    if (!showReport) {
      alert("Veuillez d'abord afficher le rapport avant d'exporter en PDF");
      return;
    }

    const pdfTotals = calculateTotals(reglementsData);
    setTotals(pdfTotals);

    const doc = new jsPDF('l', 'pt', 'a4');
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text("RÉPUBLIQUE DE CÔTE D'IVOIRE", pageWidth / 2, margin + 15, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(
      "MINISTERE DU COMMERCE, DE L'INDUSTRIE ET DE LA PROMOTION DES PME",
      pageWidth / 2,
      margin + 30,
      { align: 'center' }
    );
    doc.setFont('helvetica', 'bold');
    doc.text('DIRECTION GENERALE DE L\'INDUSTRIE', pageWidth / 2, margin + 45, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.text("DIRECTION DE L'INDUSTRIE", pageWidth / 2, margin + 60, { align: 'center' });
    doc.setFontSize(8);
    doc.text('BP V 29 ABIDJAN - TEL: (225) 20 22 20 12 - FAX: (225) 20 22 20 13', pageWidth / 2, margin + 75, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('ETAT DES REGLEMENTS', pageWidth / 2, margin + 95, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Période du ${formatDateForExport(dateDebut)} au ${formatDateForExport(dateFin)}`,
      pageWidth / 2,
      margin + 115,
      { align: 'center' }
    );

    const columns = [
      { header: 'N°', dataKey: 'id' },
      { header: 'Date', dataKey: 'date' },
      { header: 'N° Règlement', dataKey: 'numero' },
      { header: 'Client', dataKey: 'client' },
      { header: 'Montant', dataKey: 'montant' },
      { header: 'Mode Paiement', dataKey: 'modePaiement' },
      { header: 'Référence', dataKey: 'reference' },
      { header: 'Banque', dataKey: 'banque' },
      { header: 'N° Compte', dataKey: 'compte' },
      { header: 'Date Valeur', dataKey: 'dateValeur' }
    ];

    const rows = reglementsData.map(item => ({
      ...item,
      montant: `${new Intl.NumberFormat('fr-FR').format(item.montant ?? 0)} FCFA`
    }));

    (doc as any).autoTable({
      head: [columns.map(col => col.header)],
      body: rows.map(row => columns.map(col => row[col.dataKey as keyof typeof row] || '')),
      startY: 180,
      styles: { fontSize: 6, cellPadding: 2 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: 240 },
      margin: { left: 20, right: 20 },
      didDrawPage: function () {
        const totalY = (doc as any).lastAutoTable.finalY + 20;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('TOTAL', 40, totalY);
        doc.text(
          `${new Intl.NumberFormat('fr-FR').format(
            reglementsData.reduce((sum, item) => sum + (item.montantDebite || 0), 0)
          )} FCFA`,
          200,
          totalY + 20
        );
        doc.text(`${new Intl.NumberFormat('fr-FR').format(pdfTotals.montantTransfert)} FCFA`, 360, totalY + 20);
        doc.text(`${new Intl.NumberFormat('fr-FR').format(pdfTotals.montantDevise)} FCFA`, 520, totalY + 20);
        doc.text(
          `${new Intl.NumberFormat('fr-FR').format(
            pdfTotals.montantDebite + pdfTotals.montantTransfert + pdfTotals.montantDevise
          )} FCFA`,
          680,
          totalY + 20
        );

        const footerY = totalY + 50;
        doc.setFontSize(10);
        doc.text("Arrêté le présent état à la date du", 40, footerY);
        doc.text('Fait à Abidjan, le', 40, footerY + 40);

        doc.line(40, footerY + 60, 200, footerY + 60);
        doc.line(400, footerY + 60, 560, footerY + 60);

        doc.text('Le Directeur', 100, footerY + 80);
        doc.text('Le Comptable', 460, footerY + 80);
      }
    });

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
      alert("Veuillez d'abord afficher le rapport avant d'exporter en Excel");
      return;
    }

    const excelTotals = calculateTotals(reglementsData);

    const dataForExcel = reglementsData.map(item => ({
      'N° dossier': item.numeroDossier || 'N/A',
      Vendeur: item.vendeur || 'N/A',
      'Qté': item.quantite || 0,
      Produit: item.produit || 'N/A',
      'Date transfert': item.dateTransfert || 'N/A',
      'Mt débité': item.montantDebite || 0,
      'Mt transfert': item.montantTransfert || 0,
      'Mt devise': item.montantDevise || 0,
      Devise: item.devise || 'FCFA'
    }));

    const totalsRow = {
      'N° dossier': '',
      Vendeur: 'TOTAL',
      'Qté': '',
      Produit: '',
      'Date transfert': '',
      'Mt débité': excelTotals.montantDebite,
      'Mt transfert': excelTotals.montantTransfert,
      'Mt devise': excelTotals.montantDevise,
      Devise: ''
    };

    const worksheet = XLSX.utils.json_to_sheet([...dataForExcel, {}, totalsRow]);

    const headerStyle = {
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '2C5282' } },
      alignment: { horizontal: 'center' }
    };

    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:J1');
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
      worksheet[cellAddress].s = headerStyle;
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Règlements');

    const formattedDate = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `etat-reglements-${formattedDate}.xlsx`);
  };

  const handlePrint = () => {
    if (!showReport) {
      alert("Veuillez d'abord afficher le rapport avant d'imprimer");
      return;
    }

    const updatedTotals = calculateTotals(reglementsData);
    setTotals(updatedTotals);

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

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
              <th>N° dossier</th>
              <th>Vendeur</th>
              <th>Qté</th>
              <th>Produit</th>
              <th>Date transfert</th>
              <th>Mt débité</th>
              <th>Mt transfert</th>
              <th>Mt devise</th>
            </tr>
          </thead>
          <tbody>
            ${reglementsData
              .map(
                item => `
              <tr>
                <td class="text-center">${item.numeroDossier || 'N/A'}</td>
                <td>${item.vendeur || 'N/A'}</td>
                <td class="text-center">${item.quantite || 0}</td>
                <td>${item.produit || 'N/A'}</td>
                <td class="text-center">${item.dateTransfert || 'N/A'}</td>
                <td class="text-right">${new Intl.NumberFormat('fr-FR').format(item.montantDebite || 0)}</td>
                <td class="text-right">${new Intl.NumberFormat('fr-FR').format(item.montantTransfert || 0)}</td>
                <td class="text-right">${new Intl.NumberFormat('fr-FR').format(item.montantDevise || 0)}</td>
              </tr>
            `
              )
              .join('')}
            
            <tr class="total-row">
              <td colspan="5">TOTAL</td>
              <td class="text-right">${new Intl.NumberFormat('fr-FR').format(updatedTotals.montantDebite)}</td>
              <td class="text-right">${new Intl.NumberFormat('fr-FR').format(updatedTotals.montantTransfert)}</td>
              <td class="text-right">${new Intl.NumberFormat('fr-FR').format(updatedTotals.montantDevise)}</td>
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

    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  return (
    <div className="p-6">
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
                  onChange={e => setDateDebut(e.target.value)}
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
                  onChange={e => setDateFin(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={handleAfficher}
                className="bg-blue-600 text-white px-6 py-2 rounded text-sm hover:bg-blue-700 flex items-center h-[42px] whitespace-nowrap"
              >
                Afficher
              </button>
              {showReport && (
                <>
                  <button
                    type="button"
                    onClick={handleExportPDF}
                    className="bg-green-600 text-white p-2 rounded text-sm hover:bg-green-700 flex items-center h-[42px]"
                    title="Exporter en PDF"
                  >
                    <DocumentDownloadIcon className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleExportExcel}
                    className="bg-green-600 text-white p-2 rounded text-sm hover:bg-green-700 flex items-center h-[42px]"
                    title="Exporter en Excel"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="bg-green-600 text-white p-2 rounded text-sm hover:bg-green-700 flex items-center h-[42px]"
                    title="Imprimer"
                  >
                    <PrinterIcon className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </form>
      </div>

      {showReport && (
        <div className="bg-white border border-black max-w-4xl mx-auto">
          <div className="text-center py-2 border-b border-black">
            <div className="text-sm font-bold">RÉPUBLIQUE DE CÔTE D'IVOIRE</div>
            <div className="text-xs">MINISTERE DU COMMERCE, DE L'INDUSTRIE ET DE LA PROMOTION DES PME</div>
            <div className="text-xs font-bold">DIRECTION GENERALE DE L'INDUSTRIE</div>
            <div className="text-xs">DIRECTION DE L'INDUSTRIE</div>
            <div className="text-xs">BP V 29 ABIDJAN - TEL: (225) 20 22 20 12 - FAX: (225) 20 22 20 13</div>
            <div className="mt-1 text-sm font-bold">ETAT DES REGLEMENTS</div>
          </div>

          <div className="border-b border-black p-1 text-center bg-gray-50">
            <div className="text-sm">
              Période du {formatDateForExport(dateDebut)} au {formatDateForExport(dateFin)}
            </div>
          </div>

          <div className="text-xs">
            <div className="overflow-x-auto">
              <div ref={tableRef}>
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border border-black p-1 text-center">N° dossier</th>
                      <th className="border border-black p-1 text-center">Vendeur</th>
                      <th className="border border-black p-1 text-center">Qté</th>
                      <th className="border border-black p-1 text-center">Produit</th>
                      <th className="border border-black p-1 text-center">Date transfert</th>
                      <th className="border border-black p-1 text-center">Mt débité</th>
                      <th className="border border-black p-1 text-center">Mt transfert</th>
                      <th className="border border-black p-1 text-center">Mt devise</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map(item => (
                      <tr key={item.id}>
                        <td className="border border-black p-1 text-center">{item.numeroDossier || 'N/A'}</td>
                        <td className="border border-black p-1">{item.vendeur || 'N/A'}</td>
                        <td className="border border-black p-1 text-center">{item.quantite || 0}</td>
                        <td className="border border-black p-1">{item.produit || 'N/A'}</td>
                        <td className="border border-black p-1 text-center">{item.dateTransfert || 'N/A'}</td>
                        <td className="border border-black p-1 text-right">
                          {item.montantDebite ? (
                            <>
                              {new Intl.NumberFormat('fr-FR').format(item.montantDebite)}
                              <span className="text-xs ml-1">FCFA</span>
                            </>
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td className="border border-black p-1 text-right">{formatCurrency(item.montantTransfert || 0)}</td>
                        <td className="border border-black p-1 text-right">{formatCurrency(item.montantDevise || 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={5} className="border border-black p-1 text-right font-bold">
                        TOTAL
                      </td>
                      <td className="border border-black p-1 text-right font-bold">
                        {formatCurrency(totals.montantDebite || 0)}
                      </td>
                      <td className="border border-black p-1 text-right font-bold">
                        {formatCurrency(totals.montantTransfert || 0)}
                      </td>
                      <td className="border border-black p-1 text-right font-bold">
                        {formatCurrency(totals.montantDevise || 0)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="mt-4 p-2 text-xs">
              <div className="text-right mb-8">
                Abidjan, le{' '}
                {new Date().toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}
              </div>
              <div className="text-center mb-2">
                Arrêté le présent état à la date du{' '}
                {new Date().toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}
              </div>
              <div className="flex justify-between mt-12">
                <div className="text-center">
                  <div className="border-t border-black w-48 mx-auto mb-1"></div>
                  <div>Le Directeur</div>
                </div>
                <div className="text-center">
                  <div className="border-t border-black w-48 mx-auto mb-1"></div>
                  <div>Le Comptable</div>
                </div>
              </div>
            </div>

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
    </div>
  );
};

export default ReglementsPage;