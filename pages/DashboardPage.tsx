import React from 'react';
import { useAuth, useDossiers } from '../context/AppContext';
import { FolderIcon, GlobeIcon, BanknotesIcon, UserGroupIcon } from '../components/icons';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white p-4 rounded-lg border border-slate-200 flex items-center space-x-4">
        <div className="bg-primary/10 p-3 rounded-full text-primary">
            {icon}
        </div>
        <div>
            <p className="text-sm text-slate-500">{title}</p>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
        </div>
    </div>
);

const DashboardPage: React.FC = () => {
    const { user } = useAuth();
    const { dossiers } = useDossiers();

    const totalBsc = dossiers.reduce((acc, dossier) => acc + dossier.montantBSC, 0);
    const formattedTotalBsc = new Intl.NumberFormat('fr-FR').format(totalBsc);
    const uniqueOrigines = new Set(dossiers.map(d => d.origine)).size;

    return (
        <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-6">
                Bienvenue, <span className="text-primary">{user?.username}</span> !
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Nombre de dossiers" value={dossiers.length} icon={<FolderIcon />} />
                <StatCard title="Montant BSC Total" value={formattedTotalBsc} icon={<BanknotesIcon />} />
                <StatCard title="Origines Uniques" value={uniqueOrigines} icon={<GlobeIcon />} />
                <StatCard title="Vendeurs Uniques" value={new Set(dossiers.map(d => d.vendeur)).size} icon={<UserGroupIcon />} />
            </div>

            <div className="mt-8 bg-white p-6 rounded-lg border border-slate-200">
                 <h2 className="text-xl font-semibold text-slate-700 mb-4">Aperçu rapide</h2>
                 <p className="text-slate-600">
                    C'est ici que vous pouvez voir un résumé de vos activités. Utilisez la barre de navigation sur la gauche pour accéder aux différentes sections de l'application.
                 </p>
            </div>
        </div>
    );
};

export default DashboardPage;