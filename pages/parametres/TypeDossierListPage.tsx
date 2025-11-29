
import React, { useState, useMemo, useEffect } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useTypeDossiers } from '../../context/AppContext';
import { AddIcon, SortIcon, SortAscIcon, SortDescIcon, SearchIcon, ChevronLeftIcon, ChevronRightIcon, DocumentIcon, EditIconAlt, DeleteIconAlt } from '../../components/icons';
import { TypeDossier } from '../../types';
import TypeDossierFormModal from './TypeDossierFormModal';

const MySwal = withReactContent(Swal);

type SortableKeys = keyof Omit<TypeDossier, 'id'>;

type SortConfig = {
    key: SortableKeys;
    direction: 'ascending' | 'descending';
} | null;

const SortableHeader: React.FC<{
    column: SortableKeys;
    title: string;
    sortConfig: SortConfig;
    requestSort: (key: SortableKeys) => void;
    className?: string;
}> = ({ column, title, sortConfig, requestSort, className = '' }) => {
    
    const getIcon = () => {
        if (!sortConfig || sortConfig.key !== column) {
            return <SortIcon />;
        }
        if (sortConfig.direction === 'ascending') {
            return <SortAscIcon />;
        }
        return <SortDescIcon />;
    };

    return (
        <th scope="col" className={`px-6 py-2 cursor-pointer select-none group ${className}`} onClick={() => requestSort(column)}>
            <div className="flex items-center space-x-2">
                <span>{title}</span>
                <span className="text-slate-400 group-hover:text-white transition-colors">{getIcon()}</span>
            </div>
        </th>
    );
};


const TypeDossierListPage: React.FC = () => {
    const { typeDossiers, deleteTypeDossier, fetchTypeDossiers } = useTypeDossiers();

    useEffect(() => {
        fetchTypeDossiers();
    }, [fetchTypeDossiers]);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTypeDossierId, setEditingTypeDossierId] = useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [sortConfig, setSortConfig] = useState<SortConfig>(null);

    const handleOpenModal = (typeDossierId: string | null = null) => {
        setEditingTypeDossierId(typeDossierId);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTypeDossierId(null);
    };

    const processedTypeDossiers = useMemo(() => {
        let filteredTypeDossiers = [...typeDossiers];

        if (searchTerm) {
            const lowercasedFilter = searchTerm.toLowerCase();
            filteredTypeDossiers = filteredTypeDossiers.filter(item =>
                item.typeDossier.toLowerCase().includes(lowercasedFilter)
            );
        }
        
        if (sortConfig !== null) {
            filteredTypeDossiers.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];
                
                if (aValue === null || aValue === undefined) return 1;
                if (bValue === null || bValue === undefined) return -1;
                
                const comparison = String(aValue).localeCompare(String(bValue), 'fr', { numeric: true });
                return sortConfig.direction === 'ascending' ? comparison : -comparison;
            });
        }

        return filteredTypeDossiers;
    }, [typeDossiers, searchTerm, sortConfig]);
    
    const totalPages = Math.ceil(processedTypeDossiers.length / itemsPerPage);
    const paginatedTypeDossiers = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return processedTypeDossiers.slice(startIndex, startIndex + itemsPerPage);
    }, [processedTypeDossiers, currentPage, itemsPerPage]);

    const requestSort = (key: SortableKeys) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
        setCurrentPage(1);
    };

    const handleDelete = (id: string, name: string) => {
        MySwal.fire({
            title: 'Êtes-vous sûr ?',
            text: `Vous êtes sur le point de supprimer le type de dossier ${name}. Cette action est irréversible !`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Oui, supprimer !',
            cancelButtonText: 'Annuler',
            background: '#334155',
            color: '#f8fafc'
        }).then((result) => {
            if (result.isConfirmed) {
                deleteTypeDossier(id);
                MySwal.fire({
                   title: 'Supprimé !',
                   text: "Le type de dossier a été supprimé avec succès.",
                   icon: 'success',
                   background: '#334155',
                   color: '#f8fafc'
                });
            }
        });
    };

    const startEntry = processedTypeDossiers.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
    const endEntry = Math.min(currentPage * itemsPerPage, processedTypeDossiers.length);

    const getPaginationItems = () => {
        const pages = [];
        const DOTS = '...';
        
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
            return pages;
        }

        pages.push(1);
        if (currentPage > 3) pages.push(DOTS);
        
        const startPage = Math.max(2, currentPage - 1);
        const endPage = Math.min(totalPages - 1, currentPage + 1);

        for (let i = startPage; i <= endPage; i++) {
            if (i > 1 && i < totalPages) {
                pages.push(i);
            }
        }
        
        if (currentPage < totalPages - 2) pages.push(DOTS);
        pages.push(totalPages);
        
        return [...new Set(pages)]; // Remove duplicates
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-800">Gestion des Types de dossier</h1>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all duration-300 text-sm font-medium shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                    <AddIcon />
                    Ajouter un type
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-xl border border-slate-200">
                <div className="flex flex-col sm:flex-row justify-between items-center p-4 bg-slate-50/70 border-b border-slate-200 rounded-t-xl space-y-3 sm:space-y-0">
                    <div className="flex items-center space-x-2 text-sm">
                        <label htmlFor="items-per-page" className="text-slate-600">Afficher</label>
                        <select
                            id="items-per-page"
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
                        >
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="25">25</option>
                        </select>
                        <span className="text-slate-600">éléments</span>
                    </div>
                    <div className="relative w-full sm:w-auto">
                         <label htmlFor="table-search" className="sr-only">Rechercher</label>
                         <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <SearchIcon className="w-4 h-4 text-slate-400"/>
                         </div>
                         <input
                            type="text"
                            id="table-search"
                            placeholder="Rechercher un type..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="block w-full sm:w-72 pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-600">
                        <thead className="text-xs font-semibold text-sidebar-text bg-sidebar-bg uppercase">
                            <tr>
                                <SortableHeader column="typeDossier" title="Type de dossier" sortConfig={sortConfig} requestSort={requestSort} />
                                <th scope="col" className="px-6 py-2 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="align-middle">
                            {paginatedTypeDossiers.length > 0 ? paginatedTypeDossiers.map((item, index) => (
                                <tr key={item.id} className={`border-t border-slate-200 hover:bg-primary/5 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}`}>
                                    <th scope="row" className="px-6 py-3 font-medium text-slate-900 whitespace-nowrap">{item.typeDossier}</th>
                                    <td className="px-6 py-3">
                                        <div className="flex items-center justify-center space-x-2">
                                            <button onClick={() => handleOpenModal(item.id)} className="p-1.5 text-blue-600 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors" aria-label={`Modifier le type ${item.typeDossier}`}>
                                                <EditIconAlt className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(item.id, item.typeDossier)} className="p-1.5 text-red-600 bg-red-100 hover:bg-red-200 rounded-md transition-colors" aria-label={`Supprimer le type ${item.typeDossier}`}>
                                                <DeleteIconAlt className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={2} className="text-center py-16 text-slate-500">
                                         <div className="inline-block bg-slate-100 p-4 rounded-full text-slate-400">
                                            <DocumentIcon />
                                        </div>
                                        <p className="font-semibold mt-4 text-lg">Aucun type de dossier trouvé</p>
                                        <p className="text-sm mt-1">{searchTerm ? 'Essayez de modifier vos critères de recherche.' : 'Créez un nouveau type de dossier pour commencer.'}</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {processedTypeDossiers.length > 0 && (
                <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-slate-200 rounded-b-xl">
                    <p className="text-sm text-slate-600 mb-4 sm:mb-0">
                        Affichage de <span className="font-semibold">{startEntry}</span> à <span className="font-semibold">{endEntry}</span> sur <span className="font-semibold">{processedTypeDossiers.length}</span> éléments
                    </p>
                    {totalPages > 1 && (
                         <nav>
                            <ul className="inline-flex items-center -space-x-px text-sm">
                                <li>
                                    <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="flex items-center justify-center px-2 h-8 ml-0 leading-tight text-slate-500 bg-white border border-slate-300 rounded-l-lg hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                        <ChevronLeftIcon />
                                    </button>
                                </li>
                                {getPaginationItems().map((page, index) => (
                                    <li key={index}>
                                        {typeof page === 'number' ? (
                                            <button
                                                onClick={() => setCurrentPage(page)}
                                                className={`flex items-center justify-center px-3 h-8 leading-tight border border-slate-300 transition-colors ${ currentPage === page ? 'text-white bg-primary border-primary hover:bg-blue-600 font-bold' : 'text-slate-500 bg-white hover:bg-slate-100 hover:text-slate-700'}`}
                                            >
                                                {page}
                                            </button>
                                        ) : (
                                            <span className="flex items-center justify-center px-3 h-8 leading-tight text-slate-500 bg-white border border-slate-300">{page}</span>
                                        )}
                                    </li>
                                 ))}
                                <li>
                                    <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="flex items-center justify-center px-2 h-8 leading-tight text-slate-500 bg-white border border-slate-300 rounded-r-lg hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                        <ChevronRightIcon />
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    )}
                </div>
                )}
            </div>

            <TypeDossierFormModal isOpen={isModalOpen} onClose={handleCloseModal} typeDossierId={editingTypeDossierId} />
        </div>
    );
};

export default TypeDossierListPage;