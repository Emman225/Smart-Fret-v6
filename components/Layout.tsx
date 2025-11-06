
import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AppContext';
import { 
    DashboardIcon, FolderIcon, LogoutIcon, MenuIcon, ChevronDownIcon, CogIcon,
    ChartBarIcon, DocumentReportIcon, ListIcon, CashIcon, ReceiptTaxIcon,
    BanknotesIcon, DocumentDuplicateIcon, CalendarIcon, ShoppingCartIcon,
    ArchiveBoxIcon, ChartPieIcon, UserGroupIcon, ClipboardDocumentListIcon,
    UsersIcon, ArchiveBoxArrowDownIcon, TrashIcon, UserCircleIcon, GlobeAltIcon,
    DocumentIcon, ShipIcon, TagIcon, CubeIcon, MapIcon, DocumentTextIcon
} from './icons';

// --- Header Component ---
const Header: React.FC<{ onMenuClick: () => void; }> = ({ onMenuClick }) => {
    const { user, logout } = useAuth();
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    
    const getInitials = (name?: string): string => {
        if (!name || name.trim() === '') return '?';
        const names = name.trim().split(/\s+/);
        const firstInitial = names[0].charAt(0);
        const lastInitial = names.length > 1 ? names[names.length - 1].charAt(0) : '';
        return (firstInitial + lastInitial).toUpperCase();
    };

    return (
        <header className="bg-white px-4 flex justify-between items-center z-10 shadow-sm h-16">
            <button onClick={onMenuClick} className="text-slate-600 hover:text-slate-900">
                <MenuIcon className="w-6 h-6" />
            </button>
            
            <div className="relative" ref={dropdownRef}>
                <button 
                    onClick={() => setDropdownOpen(prev => !prev)} 
                    className="flex items-center space-x-2 text-slate-600 transition duration-150"
                    aria-haspopup="true"
                    aria-expanded={isDropdownOpen}
                >
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-base select-none">
                        {getInitials(user?.fullName)}
                    </div>
                    <div className="flex flex-col ml-2">
                        <span className="font-medium text-sm text-slate-800">{user?.fullName || 'Utilisateur'}</span>
                        <span className="text-xs text-slate-500">{user?.email || ''}</span>
                    </div>
                    <ChevronDownIcon className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 border border-slate-100" role="menu">
                        <button 
                            onClick={() => {
                                logout();
                                setDropdownOpen(false);
                            }}
                            className="w-full text-left flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            role="menuitem"
                        >
                            <LogoutIcon className="w-4 h-4" />
                            <span>Déconnexion</span>
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};


// --- Sidebar Menu Components ---

interface NavItemProps {
    to: string;
    label: string;
    icon: React.ReactNode;
    isSubItem?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, label, icon, isSubItem = false }) => {
    const baseClasses = "flex items-center space-x-3 text-sidebar-text transition-all duration-200 relative group";
    const layoutClasses = isSubItem 
        ? 'py-2 pl-3 pr-3 text-sm rounded-md' 
        : 'p-3 text-base rounded-lg';
    
    return (
        <NavLink 
            to={to} 
            className={({ isActive }) => `${baseClasses} ${layoutClasses} ${isActive ? (isSubItem ? 'bg-sidebar-hover-bg text-white' : '') : 'hover:bg-sidebar-hover-bg'} ${isActive && !isSubItem ? 'font-semibold' : ''}`}
        >
            {({ isActive }) => (
                <>
                    {!isSubItem && isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-2/3 w-1 bg-primary rounded-r-full" aria-hidden="true"></span>}
                    
                    <span className={`flex-shrink-0 transition-colors ${isActive ? (isSubItem ? 'text-white' : 'text-primary') : 'text-slate-400 group-hover:text-white'}`}>
                        {icon}
                    </span>

                    <span className={`flex-grow ${isActive ? 'text-white' : ''}`}>{label}</span>
                </>
            )}
        </NavLink>
    );
};


interface CollapsibleMenuProps {
    label: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    paths: string[];
    isSubMenu?: boolean;
}

const CollapsibleMenu: React.FC<CollapsibleMenuProps> = ({ label, icon, children, paths, isSubMenu = false }) => {
    const location = useLocation();
    const isParentActive = paths.some(path => location.pathname.startsWith(path));
    const [isOpen, setIsOpen] = useState(isParentActive);

    useEffect(() => {
        if (isParentActive) setIsOpen(true);
    }, [isParentActive, location.pathname]);

    const buttonBaseClasses = "flex items-center justify-between w-full text-sidebar-text hover:text-white transition-colors group";
    const buttonLayoutClasses = isSubMenu
        ? 'py-2 pl-3 pr-2 text-sm rounded-md'
        : 'p-3 text-base rounded-lg';

    return (
        <li className={isSubMenu ? "pl-5" : ""}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`${buttonBaseClasses} ${buttonLayoutClasses} ${isParentActive ? '' : 'hover:bg-sidebar-hover-bg'}`}
                aria-expanded={isOpen}
            >
                <div className="flex items-center space-x-3">
                     <span className={`transition-colors ${isParentActive ? 'text-primary' : 'text-slate-400 group-hover:text-white'}`}>
                        {icon}
                    </span>
                    <span className={`${isParentActive ? 'text-white font-semibold' : ''}`}>{label}</span>
                </div>
                <ChevronDownIcon className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} ${isParentActive ? 'text-white' : 'text-slate-400'}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[1000px]' : 'max-h-0'}`}>
                <ul className="pt-2 pl-4 space-y-1 border-l border-slate-700 ml-3.5">
                    {children}
                </ul>
            </div>
        </li>
    );
};

// --- Main Sidebar Component ---
const Sidebar: React.FC<{ isOpen: boolean; }> = ({ isOpen }) => {
    const iconSubMenuProps = { className: "w-5 h-5" };
    
    return (
        <aside className={`bg-sidebar-bg w-72 absolute md:relative inset-y-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out shadow-lg z-30 flex flex-col`}>
            <div className="p-4 border-b border-slate-700 h-16 flex items-center justify-center shrink-0">
                <h1 className="text-2xl font-bold text-white text-center">Smart Fret</h1>
            </div>
            <nav className="flex-1 p-4 overflow-y-auto">
                <ul className="space-y-2">
                    <li><NavItem to="/dashboard" icon={<DashboardIcon />} label="Dashboard" /></li>
                    
                    <CollapsibleMenu label="Gestion des dossiers" icon={<FolderIcon />} paths={["/dossiers", "/traitement"]}>
                        <li><NavItem to="/dossiers" icon={<ListIcon {...iconSubMenuProps} />} label="Liste des dossiers" isSubItem /></li>
                        <CollapsibleMenu label="Traitement" icon={<DocumentReportIcon {...iconSubMenuProps} />} paths={["/traitement"]} isSubMenu>
                            <li><NavItem to="/traitement/reglements" label="Etat des règlements" icon={<CashIcon {...iconSubMenuProps} />} isSubItem /></li>
                            <li><NavItem to="/traitement/couts-revient" label="Etat des coûts de revient" icon={<ReceiptTaxIcon {...iconSubMenuProps} />} isSubItem /></li>
                            <li><NavItem to="/traitement/commissions" label="Commissions bancaires" icon={<BanknotesIcon {...iconSubMenuProps} />} isSubItem /></li>
                            <li><NavItem to="/traitement/declarations" label="Etat des déclarations" icon={<DocumentTextIcon {...iconSubMenuProps} />} isSubItem /></li>
                            <li><NavItem to="/traitement/d3" label="Etat des D3" icon={<DocumentDuplicateIcon {...iconSubMenuProps} />} isSubItem /></li>
                            <li><NavItem to="/traitement/declarations-mensuelles" label="Déclarations mensuelles" icon={<CalendarIcon {...iconSubMenuProps} />} isSubItem /></li>
                            <li><NavItem to="/traitement/commandes" label="Etat des commandes" icon={<ShoppingCartIcon {...iconSubMenuProps} />} isSubItem /></li>
                            <li><NavItem to="/traitement/couts-revient-anciens" label="Coûts de revient - anciens" icon={<ArchiveBoxIcon {...iconSubMenuProps} />} isSubItem /></li>
                            <li><NavItem to="/traitement/stat-conteneurs-pays-produit" label="Stat conteneurs pays/produit" icon={<ChartPieIcon {...iconSubMenuProps} />} isSubItem /></li>
                            <li><NavItem to="/traitement/stat-conteneurs-armateur" label="Stat conteneurs armateur" icon={<UserGroupIcon {...iconSubMenuProps} />} isSubItem /></li>
                            <li><NavItem to="/traitement/liste-conteneurs-bl" label="Liste conteneurs avec BL" icon={<ClipboardDocumentListIcon {...iconSubMenuProps} />} isSubItem /></li>
                            <li><NavItem to="/traitement/stat-dossiers-transitaires" label="Stat dossiers transitaires" icon={<UsersIcon {...iconSubMenuProps} />} isSubItem /></li>
                            <li><NavItem to="/traitement/archivage" label="Archivage fichiers" icon={<ArchiveBoxArrowDownIcon {...iconSubMenuProps} />} isSubItem /></li>
                            <li><NavItem to="/traitement/suppression" label="Suppression dossiers" icon={<TrashIcon {...iconSubMenuProps} />} isSubItem /></li>
                        </CollapsibleMenu>
                    </CollapsibleMenu>

                    <CollapsibleMenu label="Paramètres" icon={<CogIcon />} paths={["/parametres"]}>
                        <li><NavItem to="/parametres/utilisateur" label="Utilisateur" icon={<UserCircleIcon {...iconSubMenuProps} />} isSubItem /></li>
                        <li><NavItem to="/parametres/armateur" label="Armateur" icon={<UserGroupIcon {...iconSubMenuProps} />} isSubItem /></li>
                        <li><NavItem to="/parametres/origine" label="Origine" icon={<GlobeAltIcon {...iconSubMenuProps} />} isSubItem /></li>
                        <li><NavItem to="/parametres/type-dossier" label="Type dossier" icon={<DocumentIcon {...iconSubMenuProps} />} isSubItem /></li>
                        <li><NavItem to="/parametres/navire" label="Navire" icon={<ShipIcon {...iconSubMenuProps} />} isSubItem /></li>
                        <li><NavItem to="/parametres/categorie-produit" label="Catégorie produit" icon={<TagIcon {...iconSubMenuProps} />} isSubItem /></li>
                        <li><NavItem to="/parametres/produits" label="Produits" icon={<CubeIcon {...iconSubMenuProps} />} isSubItem /></li>
                    </CollapsibleMenu>

                    <CollapsibleMenu label="Statistiques" icon={<ChartBarIcon />} paths={["/statistiques"]}>
                        <li><NavItem to="/statistiques/produits-par-pays" label="Produits par pays" icon={<MapIcon {...iconSubMenuProps} />} isSubItem /></li>
                        <li><NavItem to="/statistiques/conteneur-par-armateur" label="Conteneur par armateur" icon={<UserGroupIcon {...iconSubMenuProps} />} isSubItem /></li>
                        <li><NavItem to="/statistiques/conteneur-par-produit" label="Conteneur par produit" icon={<ClipboardDocumentListIcon {...iconSubMenuProps} />} isSubItem /></li>
                    </CollapsibleMenu>
                </ul>
            </nav>
        </aside>
    );
};

// --- Main Layout Component ---
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    const isFormPage = /^\/dossiers\/(new|[^/]+\/edit)$/.test(location.pathname);
    
    const [isSidebarOpen, setSidebarOpen] = useState(!isFormPage && window.innerWidth > 768);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        if (isFormPage && window.innerWidth > 768) {
            setSidebarOpen(false);
        }
    }, [location.pathname, isFormPage]);

    if (!isAuthenticated) {
        return null; // or a loading spinner
    }
    
    return (
        <div className="flex h-screen bg-light-bg text-slate-800">
            <Sidebar isOpen={isSidebarOpen} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header onMenuClick={() => setSidebarOpen(prev => !prev)} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-light-bg p-4 md:p-6">
                    {children}
                </main>
                <footer className="bg-white text-center p-4 text-xs text-slate-500 border-t border-slate-200">
                    © 2025 Smart Fret
                </footer>
            </div>
             {isSidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black opacity-50 z-20 md:hidden"></div>}
        </div>
    );
};

export default Layout;
