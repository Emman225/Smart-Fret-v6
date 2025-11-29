import React, { useState, useMemo, useCallback } from 'react';
import { useDossiers } from '../../context/AppContext';
import { Dossier } from '../../types';
import { SearchIcon, DownloadIcon, PrinterIcon, ChevronLeftIcon, ChevronRightIcon } from '../../components/icons';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Définition du type pour les colonnes du tableau
type Column = {
  id: keyof Dossier | 'actions';
  label: string;
  minWidth?: number;
  align?: 'left' | 'right' | 'center';
  format?: (value: any) => string;
};

// Configuration des colonnes du tableau
const columns: Column[] = [
  { id: 'numeroDossier', label: 'N° Dossier', minWidth: 100 },
  { id: 'numBL', label: 'N° BL', minWidth: 150 },
  { id: 'origine', label: 'Origine', minWidth: 100 },
  { id: 'type', label: 'Type', minWidth: 100 },
  { id: 'qte', label: 'Qté', minWidth: 50, align: 'right' },
  { id: 'nbreTEU', label: 'Nbre TEU', minWidth: 80, align: 'right' },
  { id: 'vendeur', label: 'Vendeur', minWidth: 150 },
];

const DossierEtatPage: React.FC = () => {
  const { dossiers } = useDossiers();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedDossiers, setSelectedDossiers] = useState<string[]>([]);

  // Filtrage des dossiers
  const filteredDossiers = useMemo(() => {
    if (!searchTerm) return dossiers;
    
    const term = searchTerm.toLowerCase();
    return dossiers.filter(dossier => 
      dossier.numeroDossier?.toLowerCase().includes(term) ||
      dossier.numBL?.toLowerCase().includes(term) ||
      dossier.origine?.toLowerCase().includes(term) ||
      dossier.type?.toLowerCase().includes(term)
    );
  }, [dossiers, searchTerm]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDossiers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDossiers.length / itemsPerPage);

  // Gestion de la sélection
  const toggleSelectDossier = (id: string) => {
    setSelectedDossiers(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const selectAllDossiers = () => {
    if (selectedDossiers.length === currentItems.length) {
      setSelectedDossiers([]);
    } else {
      setSelectedDossiers(currentItems.map(d => d.id));
    }
  };

  // Exportation en Excel
  const exportToExcel = (data: Dossier[]) => {
    const worksheet = XLSX.utils.json_to_sheet(data.map(dossier => ({
      'N° Dossier': dossier.numeroDossier,
      'N° BL': dossier.numBL,
      'Origine': dossier.origine,
      'Type': dossier.type,
      'Qté': dossier.qte,
      'Nbre TEU': dossier.nbreTEU,
      'Vendeur': dossier.vendeur,
      'Montant BSC': dossier.montantBSC,
      'Date création': new Date(dossier.id.split('_')[1]).toLocaleDateString()
    })));
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dossiers');
    
    // Générer le fichier Excel
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(blob, `etat-dossiers-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Exportation en PDF
  const exportToPDF = (data: Dossier[]) => {
    const doc = new jsPDF('l', 'mm', 'a4');
    const title = 'ÉTAT DES DOSSIERS';
    const date = new Date().toLocaleDateString('fr-FR');
    
    // En-tête
    doc.setFontSize(16);
    doc.text(title, 14, 15);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Généré le: ${date}`, 14, 22);
    
    // Préparation des données pour le tableau
    const tableData = data.map(dossier => [
      dossier.numeroDossier || '',
      dossier.numBL || '',
      dossier.origine || '',
      dossier.type || '',
      dossier.qte?.toString() || '0',
      dossier.nbreTEU?.toString() || '0',
      dossier.vendeur || ''
    ]);
    
    // Configuration du tableau
    (doc as any).autoTable({
      head: [columns.map(col => col.label)],
      body: tableData,
      startY: 30,
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { top: 30 },
      styles: { fontSize: 8, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 40 },
        2: { cellWidth: 30 },
        3: { cellWidth: 30 },
        4: { cellWidth: 20, halign: 'right' },
        5: { cellWidth: 25, halign: 'right' },
        6: { cellWidth: 50 }
      }
    });
    
    // Pied de page
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text(
        `Page ${i} sur ${pageCount}`,
        doc.internal.pageSize.width - 30,
        doc.internal.pageSize.height - 10
      );
    }
    
    // Enregistrement du PDF
    doc.save(`etat-dossiers-${new Date().toISOString().split('T')[0]}.pdf`);
  };
  
  // Gestionnaire d'export
  const handleExport = (format: 'excel' | 'pdf') => {
    const dataToExport = selectedDossiers.length > 0 
      ? dossiers.filter(d => selectedDossiers.includes(d.id))
      : filteredDossiers;
    
    if (format === 'excel') {
      exportToExcel(dataToExport);
    } else {
      exportToPDF(dataToExport);
    }
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        {/* En-tête */}
        <div className="px-6 py-4 border-b border-slate-200">
          <h1 className="text-xl font-semibold text-slate-800">État des dossiers</h1>
        </div>
        
        {/* Barre d'outils */}
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <div className="relative w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => handleExport('excel')}
              className="inline-flex items-center px-3 py-2 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <DownloadIcon className="h-4 w-4 mr-2 text-slate-500" />
              Exporter en Excel
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="inline-flex items-center px-3 py-2 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <PrinterIcon className="h-4 w-4 mr-2 text-slate-500" />
              Exporter en PDF
            </button>
          </div>
        </div>
        
        {/* Tableau */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded"
                    checked={selectedDossiers.length > 0 && selectedDossiers.length === currentItems.length}
                    onChange={selectAllDossiers}
                  />
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  N° Dossier
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  N° BL
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Origine
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Qté
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Nbre TEU
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Vendeur
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {currentItems.map((dossier) => (
                <tr key={dossier.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded"
                      checked={selectedDossiers.includes(dossier.id)}
                      onChange={() => toggleSelectDossier(dossier.id)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    {dossier.numeroDossier}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {dossier.numBL}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {dossier.origine}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {dossier.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {dossier.qte}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {dossier.nbreTEU}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {dossier.vendeur}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <div className="flex-1 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-700">
                Affichage de <span className="font-medium">{indexOfFirstItem + 1}</span> à{' '}
                <span className="font-medium">
                  {Math.min(indexOfLastItem, filteredDossiers.length)}
                </span>{' '}
                sur <span className="font-medium">{filteredDossiers.length}</span> résultats
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md ${
                  currentPage === 1 ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <ChevronLeftIcon className="h-4 w-4 mr-1" />
                Précédent
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md ${
                  currentPage === totalPages ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                Suivant
                <ChevronRightIcon className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DossierEtatPage;
