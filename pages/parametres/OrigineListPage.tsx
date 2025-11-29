import React, { useState, useMemo } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useOrigines } from '../../context/AppContext';
import { AddIcon, SortIcon, SortAscIcon, SortDescIcon, SearchIcon, ChevronLeftIcon, ChevronRightIcon, GlobeAltIcon, EditIconAlt, DeleteIconAlt } from '../../components/icons';
import OrigineFormModal from './OrigineFormModal';

const MySwal = withReactContent(Swal);

// Définition des clés triables basées sur l'interface Origine
type SortableKeys = 'nomPays';

type SortConfig = {
    key: SortableKeys;
    direction: 'ascending' | 'descending';
} | null;

// Interface pour les props du composant SortableHeader
interface SortableHeaderProps {
    column: SortableKeys;
    title: string;
    sortConfig: SortConfig;
    requestSort: (key: SortableKeys) => void;
    className?: string;
}

const SortableHeader: React.FC<SortableHeaderProps> = ({ 
    column, 
    title, 
    sortConfig, 
    requestSort, 
    className = '' 
}) => {
    
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


const OrigineListPage: React.FC = () => {
    const { origines, deleteOrigine, loadingOrigines, errorOrigines } = useOrigines();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingOrigineId, setEditingOrigineId] = useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [sortConfig, setSortConfig] = useState<SortConfig>(null);

    const handleOpenModal = (origineId: string | null = null) => {
        setEditingOrigineId(origineId);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingOrigineId(null);
    };

    const processedOrigines = useMemo(() => {
        // Créer une copie des origines pour éviter de modifier l'état directement
        let filteredOrigines = [...origines];

        // Filtrer par terme de recherche si fourni
        if (searchTerm) {
            const lowercasedFilter = searchTerm.toLowerCase();
            filteredOrigines = filteredOrigines.filter(item => 
                item.nomPays?.toLowerCase().includes(lowercasedFilter) ?? false
            );
        }

        // Trier les résultats si une configuration de tri est définie
        if (sortConfig) {
            filteredOrigines.sort((a, b) => {
                // Récupérer les valeurs à comparer en fonction de la clé de tri
                const aValue = sortConfig.key === 'nomPays' ? a.nomPays : '';
                const bValue = sortConfig.key === 'nomPays' ? b.nomPays : '';

                // Gérer les valeurs nulles ou indéfinies
                if (aValue == null) return sortConfig.direction === 'ascending' ? 1 : -1;
                if (bValue == null) return sortConfig.direction === 'ascending' ? -1 : 1;

                // Effectuer la comparaison en tenant compte de la direction de tri
                const comparison = String(aValue).localeCompare(String(bValue), 'fr', { numeric: true });
                return sortConfig.direction === 'ascending' ? comparison : -comparison;
            });
        }

        return filteredOrigines;
    }, [origines, searchTerm, sortConfig]);
    
    const totalPages = Math.ceil(processedOrigines.length / itemsPerPage);
    const paginatedOrigines = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return processedOrigines.slice(startIndex, startIndex + itemsPerPage);
    }, [processedOrigines, currentPage, itemsPerPage]);

    const requestSort = (key: SortableKeys) => {
        setSortConfig(prevConfig => {
            // Si on clique sur la même colonne, on inverse le sens de tri
            if (prevConfig?.key === key) {
                return {
                    key,
                    direction: prevConfig.direction === 'ascending' ? 'descending' : 'ascending'
                };
            }
            // Sinon, on trie par ordre croissant par défaut
            return {
                key,
                direction: 'ascending'
            };
        });
        setCurrentPage(1);
    };

    const handleDelete = async (id: string, name: string) => {
        const result = await MySwal.fire({
            title: 'Êtes-vous sûr ?',
            text: `Vous êtes sur le point de supprimer l'origine ${name}. Cette action est irréversible !`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Oui, supprimer !',
            cancelButtonText: 'Annuler',
            background: '#334155',
            color: '#f8fafc',
            allowOutsideClick: false,
            showLoaderOnConfirm: true,
            preConfirm: async () => {
                try {
                    await deleteOrigine(id);
                    return true;
                } catch (error: any) {
                    const errorMessage = (error as Error).message || 'Une erreur est survenue lors de la suppression';
                    throw new Error(errorMessage);
                }
            }
        });

        if (result.isConfirmed) {
            try {
                // Attendre la fin de la promesse preConfirm
                if (result.value) {
                    await MySwal.fire({
                        title: 'Supprimé !',
                        text: `L'origine ${name} a été supprimée avec succès.`,
                        icon: 'success',
                        confirmButtonColor: '#3085d6',
                        background: '#334155',
                        color: '#f8fafc'
                    });
                }
            } catch (error: any) {
                await MySwal.fire({
                    title: 'Erreur',
                    text: (error as Error).message || 'Une erreur est survenue lors de la suppression',
                    icon: 'error',
                    confirmButtonColor: '#3085d6',
                    background: '#334155',
                    color: '#f8fafc'
                });
            }
        }
    };

    const startEntry = processedOrigines.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
    const endEntry = Math.min(currentPage * itemsPerPage, processedOrigines.length);

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

    if (loadingOrigines) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (errorOrigines) {
        return (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
                <p className="font-bold">Erreur</p>
                <p>{errorOrigines}</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white">Gestion des Origines</h1>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    disabled={loadingOrigines}
                >
                    <AddIcon className="w-5 h-5 mr-2" />
                    {loadingOrigines ? 'Chargement...' : 'Ajouter une origine'}
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
                            placeholder="Rechercher un pays..."
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
                                <th scope="col" className="px-6 py-2 cursor-pointer select-none group" onClick={() => requestSort('nomPays')}>
                                    <div className="flex items-center space-x-2">
                                        <span>Nom du pays</span>
                                        {sortConfig?.key === 'nomPays' && (
                                            <span className="text-slate-400 group-hover:text-white transition-colors">
                                                {sortConfig.direction === 'ascending' ? <SortAscIcon /> : <SortDescIcon />}
                                            </span>
                                        )}
                                        {sortConfig?.key !== 'nomPays' && (
                                            <span className="text-slate-400 group-hover:text-white transition-colors">
                                                <SortIcon />
                                            </span>
                                        )}
                                    </div>
                                </th>
                                <th scope="col" className="px-6 py-2 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="align-middle">
                            {paginatedOrigines.length > 0 ? paginatedOrigines.map((origine, index) => (
                                <tr key={origine.idOrigine} className={`border-t border-slate-200 hover:bg-primary/5 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}`}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{origine.nomPays}</div>
                                    </td>
                                    <td className="px-6 py-3">
                                        <div className="flex items-center justify-center space-x-2">
                                            <button onClick={() => handleOpenModal(origine.idOrigine.toString())} className="p-1.5 text-blue-600 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors" aria-label={`Modifier l'origine ${origine.nomPays}`}>
                                                <EditIconAlt className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(origine.idOrigine.toString(), origine.nomPays)} className="p-1.5 text-red-600 bg-red-100 hover:bg-red-200 rounded-md transition-colors" aria-label={`Supprimer l'origine ${origine.nomPays}`}>
                                                <DeleteIconAlt className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={2} className="text-center py-16 text-slate-500">
                                         <div className="inline-block bg-slate-100 p-4 rounded-full text-slate-400">
                                            <GlobeAltIcon />
                                        </div>
                                        <p className="font-semibold mt-4 text-lg">Aucune origine trouvée</p>
                                        <p className="text-sm mt-1">{searchTerm ? 'Essayez de modifier vos critères de recherche.' : 'Créez une nouvelle origine pour commencer.'}</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {processedOrigines.length > 0 && (
                <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-slate-200 rounded-b-xl">
                    <p className="text-sm text-slate-600 mb-4 sm:mb-0">
                        Affichage de <span className="font-semibold">{startEntry}</span> à <span className="font-semibold">{endEntry}</span> sur <span className="font-semibold">{processedOrigines.length}</span> éléments
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

            <OrigineFormModal isOpen={isModalOpen} onClose={handleCloseModal} origineId={editingOrigineId} />
        </div>
    );
};

export default OrigineListPage;