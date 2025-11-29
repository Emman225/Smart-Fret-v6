
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import useArmateurs from '../../hooks/useArmateurs';
import { 
  AddIcon, 
  SortIcon, 
  SortAscIcon, 
  SortDescIcon, 
  SearchIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  EditIconAlt, 
  DeleteIconAlt,
  RefreshIcon,
  XCircleIcon
} from '../../components/icons';
import ArmateurFormModal from './ArmateurFormModal';
import { Armateur } from '../../services/armateurService';

const MySwal = withReactContent(Swal);

type SortableKeys = 'IdArmat' | 'NomArmat' | 'ContactArmat' | 'EmailArmat';

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


const ITEMS_PER_PAGE_OPTIONS = [5, 10, 20, 50];

const ArmateurListPage: React.FC = () => {
    const {
        armateurs = [],
        loading,
        error,
        pagination = { current_page: 1, per_page: 10, total: 0, total_pages: 1 },
        fetchArmateurs,
        deleteArmateur: deleteArmateurApi
    } = useArmateurs();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingArmateur, setEditingArmateur] = useState<Armateur | null>(null);
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'IdArmat', direction: 'descending' });
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Trier les armateurs côté frontend selon la configuration de tri
    const sortedArmateurs = useMemo(() => {
        if (!sortConfig) return armateurs;
        return [...armateurs].sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];
            if (aValue < bValue) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
    }, [armateurs, sortConfig]);

    // Paginer les armateurs triés côté frontend
    const paginatedArmateurs = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return sortedArmateurs.slice(startIndex, endIndex);
    }, [sortedArmateurs, currentPage, itemsPerPage]);

    // Calculer les informations de pagination côté frontend
    const totalItems = sortedArmateurs.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startEntry = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
    const endEntry = Math.min(currentPage * itemsPerPage, totalItems);

    // Helper function to normalize pagination object
    const getNormalizedPagination = (pagination: any) => {
        if (!pagination) {
            return {
                currentPage: 1,
                itemsPerPage: 10,
                totalItems: 0,
                totalPages: 1
            };
        }

        return {
            currentPage: pagination.currentPage || pagination.current_page || 1,
            itemsPerPage: pagination.itemsPerPage || pagination.per_page || 10,
            totalItems: pagination.totalItems || pagination.total || 0,
            totalPages: pagination.totalPages || pagination.total_pages || 
                       Math.ceil((pagination.totalItems || pagination.total || 0) / 
                               (pagination.itemsPerPage || pagination.per_page || 10))
        };
    };

    const normalizedPagination = useMemo(() => getNormalizedPagination(pagination), [pagination]);

    const handleOpenModal = (armateur: Armateur | null = null) => {
        setEditingArmateur(armateur);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingArmateur(null);
    };
    
    useEffect(() => {
        const timerId = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setCurrentPage(1); // Reset à la première page lors d'une nouvelle recherche
        }, 500);

        return () => {
            clearTimeout(timerId);
        };
    }, [searchTerm, setDebouncedSearchTerm, setCurrentPage]);

    const requestSort = (key: SortableKeys) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
        setCurrentPage(1);
    };

    // Set default sort to most recent first on component mount
    useEffect(() => {
        if (!sortConfig) {
            setSortConfig({ key: 'IdArmat', direction: 'descending' });
        }
    }, []);

    const fetchData = useCallback(async () => {
        try {
            // Fetch all data for frontend sorting and pagination
            await fetchArmateurs({
                search: debouncedSearchTerm,
                sort_by: sortConfig?.key,
                sort_order: sortConfig?.direction === 'ascending' ? 'asc' : 'desc'
            });
        } catch (error) {
            console.error('Erreur lors du chargement des armateurs:', error);
        }
    }, [debouncedSearchTerm, sortConfig, fetchArmateurs]);

    const handleSuccess = useCallback(() => {
        fetchData();
    }, [fetchData]);

    // Effet pour charger les données au montage et lorsque les dépendances changent
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDelete = useCallback(async (id: string, name: string) => {
        try {
            const result = await MySwal.fire({
                title: 'Êtes-vous sûr ?',
                text: `Vous êtes sur le point de supprimer l'armateur ${name || 'sélectionné'}. Cette action est irréversible !`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Oui, supprimer !',
                cancelButtonText: 'Annuler',
                background: '#334155',
                color: '#f8fafc',
                allowOutsideClick: false,
                allowEscapeKey: false,
                allowEnterKey: false,
                showLoaderOnConfirm: true,
                preConfirm: async () => {
                    try {
                        const deleteResult = await deleteArmateurApi(Number(id));
                        if (!deleteResult.success) {
                            throw new Error(deleteResult.error || 'Échec de la suppression');
                        }
                        return deleteResult;
                    } catch (error) {
                        throw error;
                    }
                }
            });

            if (result.isConfirmed) {
                await MySwal.fire({
                    title: 'Supprimé !',
                    text: "L'armateur a été supprimé avec succès.",
                    icon: 'success',
                    background: '#334155',
                    color: '#f8fafc'
                });
                // Recharger les données après suppression
                handleSuccess();
            }
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            await MySwal.fire({
                title: 'Erreur',
                text: error instanceof Error ? error.message : 'Une erreur est survenue lors de la suppression de l\'armateur.',
                icon: 'error',
                background: '#334155',
                color: '#f8fafc'
            });
        }
    }, []);




    const getPaginationItems = () => {
        const pages: (number | string)[] = [];
        const DOTS = '...';
        const totalDisplayedPages = 5; // Nombre maximum de pages à afficher

        // Cas où le nombre total de pages est inférieur ou égal au nombre de pages à afficher
        if (totalPages <= totalDisplayedPages) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        // Toujours afficher la première page
        pages.push(1);

        // Calculer les pages à afficher autour de la page courante
        let startPage = Math.max(2, currentPage - 1);
        let endPage = Math.min(totalPages - 1, currentPage + 1);

        // Ajuster si on est proche du début ou de la fin
        if (currentPage <= 3) {
            endPage = Math.min(4, totalPages - 1);
        } else if (currentPage >= totalPages - 2) {
            startPage = Math.max(totalPages - 3, 2);
        }

        // Ajouter les points de suspension après la première page si nécessaire
        if (startPage > 2) {
            pages.push(DOTS);
        }

        // Ajouter les pages autour de la page courante
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        // Ajouter les points de suspension avant la dernière page si nécessaire
        if (endPage < totalPages - 1) {
            pages.push(DOTS);
        }

        // Toujours ajouter la dernière page
        pages.push(totalPages);

        return pages;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="flex flex-col items-center">
                    <RefreshIcon className="animate-spin h-12 w-12 text-blue-600 mb-4" />
                    <p className="text-gray-600">Chargement des armateurs...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <XCircleIcon className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-red-700">
                            Une erreur est survenue lors du chargement des armateurs : {error}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Gestion des Armateurs</h1>
                    <button
                        onClick={() => handleOpenModal(null)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        disabled={loading}
                    >
                        <AddIcon className="-ml-1 mr-2 h-5 w-5" />
                        Nouvel Armateur
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
                                    setCurrentPage(1); // Reset à la première page lors du changement de pagination
                                }}
                                className="bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
                                disabled={loading}
                            >
                                {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                            <span className="text-slate-600">entrées</span>
                        </div>
                        <div className="relative w-full sm:w-auto">
                            <label htmlFor="table-search" className="sr-only">Rechercher</label>
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <SearchIcon className="w-4 h-4 text-slate-400"/>
                            </div>
                            <input
                                type="text"
                                id="table-search"
                                placeholder="Rechercher un armateur..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                }}
                                className="block w-full sm:w-72 pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-600">
                            <thead className="text-xs font-semibold text-sidebar-text bg-sidebar-bg uppercase">
                                <tr>
                                    <SortableHeader column="IdArmat" title="ID" sortConfig={sortConfig} requestSort={requestSort} className="hidden" />
                                    <SortableHeader column="NomArmat" title="Armateur" sortConfig={sortConfig} requestSort={requestSort} />
                                    <SortableHeader column="ContactArmat" title="Contact" sortConfig={sortConfig} requestSort={requestSort} />
                                    <SortableHeader column="EmailArmat" title="Email" sortConfig={sortConfig} requestSort={requestSort} />
                                    <th scope="col" className="px-6 py-2 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="align-middle">
                                {paginatedArmateurs.length > 0 ? paginatedArmateurs.map((armateur, index) => (
                                    <tr key={armateur.IdArmat} className={`border-t border-slate-200 hover:bg-primary/5 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}`}>
                                        <th scope="row" className="px-6 py-3 font-medium text-slate-900 whitespace-nowrap">
                                            {armateur.NomArmat ? (
                                                <span className="flex items-center">
                                                    {armateur.NomArmat}
                                                </span>
                                            ) : 'N/A'}
                                        </th>
                                        <td className="px-6 py-3">
                                            {armateur.ContactArmat ? (
                                                <span className="inline-flex items-center">
                                                    <span className="truncate max-w-[200px]" title={armateur.ContactArmat}>
                                                        {armateur.ContactArmat}
                                                    </span>
                                                </span>
                                            ) : 'N/A'}
                                        </td>
                                        <td className="px-6 py-3">
                                            {armateur.EmailArmat ? (
                                                <a
                                                    href={`mailto:${armateur.EmailArmat}`}
                                                    className="text-blue-600 hover:underline hover:text-blue-800 transition-colors"
                                                    title="Envoyer un email"
                                                >
                                                    {armateur.EmailArmat}
                                                </a>
                                            ) : 'N/A'}
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="flex items-center justify-center space-x-2">
                                                <button onClick={() => handleOpenModal(armateur)} className="p-1.5 text-blue-600 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors" aria-label={`Modifier l'armateur ${armateur.NomArmat}`}>
                                                    <EditIconAlt className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(armateur.IdArmat.toString(), armateur.NomArmat)} className="p-1.5 text-red-600 bg-red-100 hover:bg-red-200 rounded-md transition-colors" aria-label={`Supprimer l'armateur ${armateur.NomArmat}`}>
                                                    <DeleteIconAlt className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="text-center py-16 text-slate-500">
                                            <p className="font-semibold mt-4 text-lg">Aucun armateur trouvé</p>
                                            <p className="text-sm mt-1">{searchTerm ? 'Essayez de modifier vos critères de recherche.' : 'Créez un nouvel armateur pour commencer.'}</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {paginatedArmateurs.length > 0 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-slate-200 rounded-b-xl">
                        <p className="text-sm text-slate-600 mb-4 sm:mb-0">
                            Affichage de <span className="font-semibold">{startEntry}</span> à <span className="font-semibold">{endEntry}</span> sur <span className="font-semibold">{totalItems}</span> éléments
                        </p>
                        {totalPages > 1 && (
                            <nav>
                                <ul className="inline-flex items-center -space-x-px text-sm">
                                    <li>
                                        <button 
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            disabled={normalizedPagination.currentPage <= 1} 
                                            className="flex items-center justify-center px-2 h-8 ml-0 leading-tight text-slate-500 bg-white border border-slate-300 rounded-l-lg hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronLeftIcon />
                                        </button>
                                    </li>
                                    {getPaginationItems().map((page, index) => (
                                        <li key={index}>
                                            {typeof page === 'number' ? (
                                                <button
                                                    onClick={() => setCurrentPage(page)}
                                                    className={`flex items-center justify-center px-3 h-8 leading-tight border border-slate-300 transition-colors ${normalizedPagination.currentPage === page ? 'text-white bg-primary border-primary hover:bg-blue-600 font-bold' : 'text-slate-500 bg-white hover:bg-slate-100 hover:text-slate-700'}`}
                                                >
                                                    {page}
                                                </button>
                                            ) : (
                                                <span className="flex items-center justify-center px-3 h-8 leading-tight text-slate-500 bg-white border border-slate-300">{page}</span>
                                            )}
                                        </li>
                                    ))}
                                    <li>
                                        <button 
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, normalizedPagination.totalPages))}
                                            disabled={normalizedPagination.currentPage >= normalizedPagination.totalPages} 
                                            className="flex items-center justify-center px-2 h-8 leading-tight text-slate-500 bg-white border border-slate-300 rounded-r-lg hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronRightIcon />
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        )}
                    </div>
                    )}
                </div>

                <ArmateurFormModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    armateur={editingArmateur}
                    onSuccess={handleSuccess}
                />
            </div>
        </div>
    );
};

export default ArmateurListPage;