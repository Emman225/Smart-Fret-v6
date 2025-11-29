import React, { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import {
    AddIcon,
    SearchIcon,
    SortIcon,
    SortAscIcon,
    SortDescIcon,
    RefreshIcon,
    EditIconAlt,
    DeleteIconAlt,
    DocumentIcon,
    ChevronLeftIcon,
    ChevronRightIcon
} from '../../components/icons';
import { useUsers } from '../../context/AppContext';
import { User } from '../../types';
import UserFormModal from './UserFormModal';

const ITEMS_PER_PAGE_OPTIONS = [5, 10, 20, 50];
const SORTABLE_COLUMNS = [
    { key: 'fullName', label: 'Nom complet' },
    { key: 'username', label: "Nom d'utilisateur" },
    { key: 'email', label: 'Email' },
    { key: 'contact', label: 'Contact' },
    { key: 'role', label: 'Rôle' }
] as const;

type SortableKeys = (typeof SORTABLE_COLUMNS)[number]['key'];

type SortConfig = {
    key: SortableKeys;
    direction: 'ascending' | 'descending';
} | null;

const MySwal = withReactContent(Swal);

const UserListPage: React.FC = () => {
    const {
        users,
        loading,
        error,
        fetchUsers,
        deleteUser
    } = useUsers();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortConfig, setSortConfig] = useState<SortConfig>(null);


    const processedUsers = useMemo(() => {
        let result = [...users];

        if (searchTerm.trim()) {
            const lowered = searchTerm.trim().toLowerCase();
            result = result.filter(user =>
                [user.fullName, user.username, user.email, user.contact]
                    .filter(Boolean)
                    .some(value => value?.toLowerCase().includes(lowered))
            );
        }

        if (sortConfig) {
            result.sort((a, b) => {
                const aValue = a[sortConfig.key] ?? '';
                const bValue = b[sortConfig.key] ?? '';
                const comparison = String(aValue).localeCompare(String(bValue), 'fr', { numeric: true, sensitivity: 'base' });
                return sortConfig.direction === 'ascending' ? comparison : -comparison;
            });
        }

        return result;
    }, [users, searchTerm, sortConfig]);

    const totalPages = Math.max(1, Math.ceil(processedUsers.length / itemsPerPage));

    const paginatedUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return processedUsers.slice(startIndex, startIndex + itemsPerPage);
    }, [processedUsers, currentPage, itemsPerPage]);

    // Charger les utilisateurs au montage du composant
    useEffect(() => {
        fetchUsers().catch(() => {});
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(Math.max(1, totalPages));
        }
    }, [currentPage, totalPages]);

    const openCreateModal = () => {
        setEditingUser(null);
        setIsModalOpen(true);
    };

    const openEditModal = (user: User) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
    };

    const handleModalSuccess = () => {
        fetchUsers().catch(() => {});
    };

    const requestSort = (key: SortableKeys) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
        setCurrentPage(1);
    };

    const handleDelete = (id: string, name?: string) => {
        MySwal.fire({
            title: 'Êtes-vous sûr ? ',
            text: `Vous êtes sur le point de supprimer ${name || "cet utilisateur"}. Cette action est irréversible !`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Oui, supprimer',
            cancelButtonText: 'Annuler',
            background: '#0f172a',
            color: '#f8fafc'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await deleteUser(id);
                    await fetchUsers();
                    MySwal.fire({
                        title: 'Supprimé !',
                        text: "L'utilisateur a été supprimé avec succès.",
                        icon: 'success',
                        timer: 2000,
                        showConfirmButton: false,
                        background: '#0f172a',
                        color: '#f8fafc'
                    });
                } catch (err: any) {
                    MySwal.fire({
                        title: 'Erreur',
                        text: err?.message || 'Une erreur est survenue lors de la suppression.',
                        icon: 'error',
                        background: '#0f172a',
                        color: '#f8fafc'
                    });
                }
            }
        });
    };

    const startEntry = paginatedUsers.length ? (currentPage - 1) * itemsPerPage + 1 : 0;
    const endEntry = Math.min(currentPage * itemsPerPage, processedUsers.length);

    const renderSortIcon = (column: SortableKeys) => {
        if (!sortConfig || sortConfig.key !== column) return <SortIcon className="w-4 h-4" />;
        if (sortConfig.direction === 'ascending') return <SortAscIcon className="w-4 h-4" />;
        return <SortDescIcon className="w-4 h-4" />;
    };

    const getPaginationItems = () => {
        const pages: (number | string)[] = [];
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
            pages.push(i);
        }

        if (currentPage < totalPages - 2) pages.push(DOTS);
        pages.push(totalPages);
        return pages;
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <p className="text-sm uppercase text-slate-500 tracking-wide">Paramètres</p>
                        <h1 className="text-2xl font-bold text-slate-900">Gestion des utilisateurs</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={openCreateModal}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-60"
                            disabled={loading}
                        >
                            <AddIcon className="-ml-1 mr-2 h-5 w-5" />
                            Nouvel utilisateur
                        </button>
                    </div>
                </header>

                <section className="bg-white border border-slate-200 rounded-2xl shadow-sm">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-4 border-b border-slate-100 bg-slate-50/70 rounded-t-2xl">
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
                                disabled={loading}
                            >
                                {ITEMS_PER_PAGE_OPTIONS.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                            <span className="text-slate-600">entrées</span>
                        </div>
                        <div className="relative w-full lg:w-80">
                            <SearchIcon className="w-4 h-4 text-slate-400 absolute inset-y-0 left-3 my-auto pointer-events-none" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                placeholder="Rechercher par nom, email ou login..."
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-600">
                            <thead className="text-xs font-semibold text-white bg-sidebar-bg uppercase">
                                <tr>
                                    {SORTABLE_COLUMNS.map(({ key, label }) => (
                                        <th
                                            key={key}
                                            scope="col"
                                            className="px-6 py-3 cursor-pointer select-none"
                                            onClick={() => requestSort(key)}
                                        >
                                            <div className="flex items-center space-x-2">
                                                <span>{label}</span>
                                                <span className="text-slate-300 group-hover:text-white transition-colors">
                                                    {renderSortIcon(key)}
                                                </span>
                                            </div>
                                        </th>
                                    ))}
                                    <th scope="col" className="px-6 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={SORTABLE_COLUMNS.length + 1} className="py-16 text-center">
                                            <div className="flex flex-col items-center text-slate-500">
                                                <RefreshIcon className="h-12 w-12 animate-spin text-primary mb-3" />
                                                Chargement des utilisateurs...
                                            </div>
                                        </td>
                                    </tr>
                                ) : error ? (
                                    <tr>
                                        <td colSpan={SORTABLE_COLUMNS.length + 1} className="py-10 px-6">
                                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-center">
                                                {error}
                                            </div>
                                        </td>
                                    </tr>
                                ) : paginatedUsers.length ? (
                                    paginatedUsers.map((user, index) => (
                                        <tr key={user.id} className={`border-t border-slate-100 hover:bg-primary/5 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}`}>
                                            <td className="px-6 py-3 font-medium text-slate-900">{user.fullName || 'Non renseigné'}</td>
                                            <td className="px-6 py-3">{user.username}</td>
                                            <td className="px-6 py-3">
                                                {user.email ? (
                                                    <a href={`mailto:${user.email}`} className="text-blue-600 hover:underline">
                                                        {user.email}
                                                    </a>
                                                ) : '—'}
                                            </td>
                                            <td className="px-6 py-3">{user.contact || '—'}</td>
                                            <td className="px-6 py-3 uppercase text-xs font-semibold text-slate-500">
                                                {user.role || 'USER'}
                                            </td>
                                            <td className="px-6 py-3">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => openEditModal(user)}
                                                        className="p-1.5 text-blue-600 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors disabled:opacity-50"
                                                        title="Modifier l'utilisateur"
                                                        disabled={loading}
                                                    >
                                                        <EditIconAlt className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(user.id, user.fullName)}
                                                        className="p-1.5 text-red-600 bg-red-100 hover:bg-red-200 rounded-md transition-colors disabled:opacity-50"
                                                        disabled={loading}
                                                        title="Supprimer l'utilisateur"
                                                    >
                                                        <DeleteIconAlt className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={SORTABLE_COLUMNS.length + 1} className="py-16 text-center text-slate-500">
                                            <div className="inline-block bg-slate-100 p-4 rounded-full text-slate-400">
                                                <DocumentIcon />
                                            </div>
                                            <p className="text-lg font-semibold mt-4">Aucun utilisateur trouvé</p>
                                            <p className="text-sm mt-1">{searchTerm ? 'Essayez de modifier vos critères de recherche.' : 'Créez un nouvel utilisateur pour commencer.'}</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {processedUsers.length > 0 && (
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 border-t border-slate-100 rounded-b-2xl">
                            <p className="text-sm text-slate-500">
                                Affichage de <span className="font-semibold">{startEntry}</span> à <span className="font-semibold">{endEntry}</span>
                                {' '}sur <span className="font-semibold">{processedUsers.length}</span> utilisateurs
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                                    disabled={currentPage <= 1 || loading}
                                >
                                    <ChevronLeftIcon className="w-4 h-4" />
                                </button>
                                <ul className="flex items-center gap-1">
                                    {getPaginationItems().map((page, index) => (
                                        <li key={`${page}-${index}`}>
                                            {typeof page === 'number' ? (
                                                <button
                                                    onClick={() => setCurrentPage(page)}
                                                    className={`px-3 py-1.5 border border-slate-300 rounded-lg text-sm transition-colors ${currentPage === page ? 'bg-primary text-white border-primary' : 'text-slate-600 hover:bg-slate-50'}`}
                                                >
                                                    {page}
                                                </button>
                                            ) : (
                                                <span className="px-2 text-sm text-slate-400">{page}</span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                                    disabled={currentPage >= totalPages || loading}
                                >
                                    <ChevronRightIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                </section>
            </div>
            <UserFormModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onSuccess={handleModalSuccess}
                user={editingUser}
            />
        </div>
    );
};

export default UserListPage;
