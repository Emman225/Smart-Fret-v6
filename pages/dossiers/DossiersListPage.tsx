import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getDossiers, deleteDossier } from '../../services/dossierService';
import { Dossier } from '../../types';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    MagnifyingGlassIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    FunnelIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useArmateurs, useNavires, useOrigines } from '../../context/AppContext';
import { getArmateurs } from '../../services/armateurService';
import { Armateur as ArmateurType } from '../../services/armateurService';

const MySwal = withReactContent(Swal);

type SortConfig = {
    key: keyof Dossier;
    direction: 'asc' | 'desc';
} | null;

const DossiersListPage: React.FC = () => {
    const navigate = useNavigate();
    const [dossiers, setDossiers] = useState<Dossier[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortConfig, setSortConfig] = useState<SortConfig>(null);
    const [totalItems, setTotalItems] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(1);

    // Fetch reference data for lookups
    const { armateurs } = useArmateurs();
    const { navires, fetchNavires } = useNavires();
    const { origines, fetchOrigines } = useOrigines();

    // Local state for armateurs since context doesn't load them
    const [armateursList, setArmateursList] = useState<ArmateurType[]>([]);

    // Create lookup maps for quick name resolution
    const armateurMap = useMemo(() => {
        const map = new Map<string, string>();
        // Use local armateursList if context armateurs is empty
        const dataSource = armateurs.length > 0 ? armateurs : armateursList;
        dataSource.forEach((a: any) => {
            // Handle both frontend (id) and backend (IdArmat) property names
            const armateurId = String(a.id || a.IdArmat || '');
            const armateurName = a.armateur || a.NomArmat || '';
            if (armateurId) map.set(armateurId, armateurName);
        });
        return map;
    }, [armateurs, armateursList]);

    const navireMap = useMemo(() => {
        const map = new Map<string, string>();
        navires.forEach(n => {
            map.set(String(n.id), n.nomNavire || '');
        });
        return map;
    }, [navires]);

    const origineMap = useMemo(() => {
        const map = new Map<string, string>();
        origines.forEach(o => {
            // Handle both frontend (id) and backend (idOrigine) property names
            const origineId = String((o as any).id || (o as any).idOrigine || (o as any).IdOrigine || '');
            const origineName = (o as any).nomPays || (o as any).NomPays || '';
            if (origineId) map.set(origineId, origineName);
        });
        return map;
    }, [origines]);

    // Fetch reference data on mount
    useEffect(() => {
        let isMounted = true;

        const loadArmateurs = async () => {
            try {
                const response = await getArmateurs();
                if (isMounted) {
                    setArmateursList(response.data || []);
                }
            } catch (error) {
                console.error('Error loading armateurs:', error);
            }
        };

        loadArmateurs();

        // Only fetch if not already loaded
        if (fetchNavires && navires.length === 0) fetchNavires();
        if (fetchOrigines && origines.length === 0) fetchOrigines();

        return () => {
            isMounted = false;
        };
    }, []); // Empty dependency array - only run once on mount

    // Debug logs removed for performance optimization

    const fetchDossiers = async (page: number, limit: number, search: string = '') => {
        setLoading(true);
        try {
            const data = await getDossiers({
                page,
                per_page: limit,
                search: search,
                sort_by: sortConfig?.key,
                sort_order: sortConfig?.direction
            });
            setDossiers(data.data);
            if (data.pagination) {
                setTotalItems(data.pagination.total);
                setTotalPages(data.pagination.last_page);
                setCurrentPage(data.pagination.current_page);
            } else {
                // Fallback si pas de pagination backend
                setTotalItems(data.data.length);
                setTotalPages(Math.ceil(data.data.length / limit));
            }
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Erreur lors du chargement des dossiers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchDossiers(currentPage, itemsPerPage, searchTerm);
        }, searchTerm ? 300 : 0); // No delay for pagination/sort, only for search

        return () => clearTimeout(delayDebounceFn);
    }, [currentPage, itemsPerPage, searchTerm, sortConfig]);

    const handleDelete = async (id: number) => {
        const result = await MySwal.fire({
            title: 'Êtes-vous sûr ?',
            text: "Cette action est irréversible !",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Oui, supprimer',
            cancelButtonText: 'Annuler',
            customClass: {
                popup: 'rounded-2xl',
                confirmButton: 'rounded-xl px-4 py-2',
                cancelButton: 'rounded-xl px-4 py-2'
            }
        });

        if (result.isConfirmed) {
            try {
                await deleteDossier(id);
                await fetchDossiers(currentPage, itemsPerPage, searchTerm);
                MySwal.fire({
                    title: 'Supprimé !',
                    text: 'Le dossier a été supprimé.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false,
                    customClass: { popup: 'rounded-2xl' }
                });
            } catch (err: any) {
                MySwal.fire({
                    title: 'Erreur',
                    text: err.message || 'Impossible de supprimer le dossier',
                    icon: 'error',
                    customClass: { popup: 'rounded-2xl' }
                });
            }
        }
    };

    const handleSort = (key: keyof Dossier) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const SortableHeader: React.FC<{ label: string; sortKey: keyof Dossier }> = ({ label, sortKey }) => (
        <th
            className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider cursor-pointer hover:text-blue-300 transition-colors group select-none"
            onClick={() => handleSort(sortKey)}
        >
            <div className="flex items-center space-x-1">
                <span>{label}</span>
                <span className="flex flex-col">
                    {sortConfig?.key === sortKey ? (
                        sortConfig.direction === 'asc' ? '▲' : '▼'
                    ) : (
                        <span className="opacity-0 group-hover:opacity-50 text-[10px]">▲▼</span>
                    )}
                </span>
            </div>
        </th>
    );

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Loading Overlay */}
            {loading && (
                <div className="fixed top-20 right-6 z-50 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 animate-pulse">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm font-medium">Chargement...</span>
                </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Liste des dossiers</h1>
                    <p className="text-slate-500 mt-1">Gérez vos dossiers d'importation et d'exportation.</p>
                </div>
                <Link
                    to="/dossiers/new"
                    className="inline-flex items-center justify-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-200"
                >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Nouveau Dossier
                </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Toolbar */}
                <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="relative max-w-md w-full">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Rechercher un dossier..."
                            className="block w-full pl-10 pr-3 py-2.5 border-none rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 shadow-sm text-sm transition-shadow"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => fetchDossiers(currentPage, itemsPerPage, searchTerm)}
                            className="px-3 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors font-medium"
                            title="Actualiser"
                        >
                            Actualiser
                        </button>
                        <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-xl shadow-sm border border-slate-200/50">
                            <span className="text-xs font-medium text-slate-500">Lignes:</span>
                            <select
                                value={itemsPerPage}
                                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                className="border-none bg-transparent text-sm font-semibold text-slate-700 focus:ring-0 cursor-pointer p-0 pr-6"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100">
                        <thead className="bg-slate-900">
                            <tr>
                                <SortableHeader label="N° Dossier" sortKey="numeroDossier" />
                                <SortableHeader label="Origine" sortKey="origine" />
                                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Désignation</th>
                                <SortableHeader label="N° FRI" sortKey="numFRI" />
                                <SortableHeader label="N° BSC" sortKey="numBSC" />
                                <SortableHeader label="Mt BSC" sortKey="montantBSC" />
                                <SortableHeader label="Vendeur" sortKey="vendeur" />
                                <SortableHeader label="N° BL" sortKey="numBL" />
                                <SortableHeader label="Navire" sortKey="navire" />
                                <SortableHeader label="Armateur" sortKey="armateur" />
                                <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider sticky right-0 bg-slate-900">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={11} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3"></div>
                                            <span className="text-slate-500 text-sm font-medium">Chargement des données...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : dossiers.length === 0 ? (
                                <tr>
                                    <td colSpan={11} className="px-6 py-12 text-center text-slate-500">
                                        Aucun dossier trouvé.
                                    </td>
                                </tr>
                            ) : (
                                dossiers.map((dossier) => (
                                    <tr key={dossier.id} className="hover:bg-slate-50/80 transition-colors group">
                                        {/* N° Dossier */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-3 font-bold text-xs">
                                                    {(dossier.numeroDossier || 'N/A').substring(0, 2).toUpperCase()}
                                                </div>
                                                <span className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                                                    {dossier.numeroDossier || 'N/A'}
                                                </span>
                                            </div>
                                        </td>
                                        {/* Origine */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                                                {origineMap.get(String(dossier.origine)) || (typeof dossier.origine === 'string' ? dossier.origine : (dossier.origine?.nom || dossier.origine?.label || (dossier.origine as any)?.nomPays || (dossier.origine as any)?.NomPays || '—'))}
                                            </span>
                                        </td>
                                        {/* Désignation */}
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            <div className="max-w-xs truncate" title={dossier.items?.[0]?.designation || '—'}>
                                                {dossier.items?.[0]?.designation || '—'}
                                            </div>
                                        </td>
                                        {/* N° FRI */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                            {dossier.numFRI || '—'}
                                        </td>
                                        {/* N° BSC */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                            {dossier.numBSC || '—'}
                                        </td>
                                        {/* Mt BSC */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 text-right">
                                            {dossier.montantBSC ? new Intl.NumberFormat('fr-FR').format(dossier.montantBSC) : '—'}
                                        </td>
                                        {/* Vendeur */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                            {dossier.vendeur || '—'}
                                        </td>
                                        {/* N° BL */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                            {dossier.numBL || '—'}
                                        </td>
                                        {/* Navire */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                            {navireMap.get(String(dossier.navire)) || dossier.navire || '—'}
                                        </td>
                                        {/* Armateur */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                            {armateurMap.get(String(dossier.armateur)) || dossier.armateur || '—'}
                                        </td>
                                        {/* Actions - Fixed column */}
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium sticky right-0 bg-white group-hover:bg-slate-50 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)]">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={() => navigate(`/dossiers/${dossier.id}/edit`)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Modifier"
                                                >
                                                    <PencilIcon className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(Number(dossier.id))}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Supprimer"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="bg-slate-50/50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-slate-500">
                                Affichage de <span className="font-medium text-slate-900">{Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}</span> à <span className="font-medium text-slate-900">{Math.min(currentPage * itemsPerPage, totalItems)}</span> sur <span className="font-medium text-slate-900">{totalItems}</span> résultats
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-xl shadow-sm -space-x-px" aria-label="Pagination">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center px-3 py-2 rounded-l-xl border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <span className="sr-only">Précédent</span>
                                    <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
                                </button>
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    // Logic to show window of pages around current page could be added here
                                    // For simplicity, showing first 5 or logic needs to be more complex for many pages
                                    let pageNum = i + 1;
                                    if (totalPages > 5 && currentPage > 3) {
                                        pageNum = currentPage - 2 + i;
                                    }
                                    if (pageNum > totalPages) return null;

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === pageNum
                                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-50'
                                                } transition-colors`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="relative inline-flex items-center px-3 py-2 rounded-r-xl border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <span className="sr-only">Suivant</span>
                                    <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DossiersListPage;
