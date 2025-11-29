
import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ArmateurProvider } from './context/ArmateurContext';
import { OrigineProvider } from './context/OrigineContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import DossiersListPage from './pages/dossiers/DossiersListPage';
import DossierFormAddPage from './pages/dossiers/DossierFormAddPage';
import DossierFormEditPage from './pages/dossiers/DossierFormEditPage';

import ReglementsPage from './pages/traitement/ReglementsPage';
// Imports des pages de liste
import ArmateurListPage from './pages/parametres/ArmateurListPage';
import OrigineListPage from './pages/parametres/OrigineListPage';
import TypeDossierListPage from './pages/parametres/TypeDossierListPage';
import NavireListPage from './pages/parametres/NavireListPage';
import CategorieProduitListPage from './pages/parametres/CategorieProduitListPage';
import ProduitListPage from './pages/parametres/ProduitListPage';
import UserListPage from './pages/parametres/UserListPage';

const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
    <h1 className="text-2xl font-semibold text-slate-800 mb-4">{title}</h1>
    <p className="text-slate-600">
      Cette page est en cours de construction.
    </p>
  </div>
);

// Composant pour protéger les routes
const ProtectedRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const [initialCheck, setInitialCheck] = React.useState(true);

  React.useEffect(() => {
    // Marquer que le chargement initial est terminé après un court délai
    const timer = setTimeout(() => {
      setInitialCheck(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Pendant le chargement initial, afficher un écran de chargement
  if (loading || initialCheck) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Rediriger vers la page de connexion si l'utilisateur n'est pas authentifié
  if (!isAuthenticated) {
    // Stocker l'URL actuelle pour rediriger après la connexion
    const redirectTo = window.location.pathname !== '/login' ? window.location.pathname : '/dashboard';
    return <Navigate to={`/login?redirect=${encodeURIComponent(redirectTo)}`} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

function App() {
  return (
    <AuthProvider>
      <ArmateurProvider>
        <OrigineProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={
              <ProtectedRoute>
                <Layout>
                  <Outlet />
                </Layout>
              </ProtectedRoute>
            }>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
            
            {/* Dossiers */}
            <Route path="/dossiers" element={<DossiersListPage />} />
            <Route path="/dossiers/new" element={<DossierFormAddPage />} />
            <Route path="/dossiers/:id/edit" element={<DossierFormEditPage />} />
            
            {/* Traitement */}
            <Route path="/traitement/reglements" element={<ReglementsPage />} />
            <Route path="/traitement/couts-revient" element={<PlaceholderPage title="Etat des coûts de revient" />} />
            <Route path="/traitement/commissions" element={<PlaceholderPage title="Etat des commissions bancaires" />} />
            <Route path="/traitement/declarations" element={<PlaceholderPage title="Etat des déclarations" />} />
            <Route path="/traitement/d3" element={<PlaceholderPage title="Etat des D3" />} />
            <Route path="/traitement/declarations-mensuelles" element={<PlaceholderPage title="Etat des déclarations mensuelles" />} />
            <Route path="/traitement/commandes" element={<PlaceholderPage title="Etat des commandes" />} />
            <Route path="/traitement/couts-revient-anciens" element={<PlaceholderPage title="Etat des coûts de revient - anciens dossiers" />} />
            <Route path="/traitement/stat-conteneurs-pays-produit" element={<PlaceholderPage title="Statistique nombre de conteneurs par pays et par produit" />} />
            <Route path="/traitement/stat-conteneurs-armateur" element={<PlaceholderPage title="Statistique nombre de conteneurs par armateur" />} />
            <Route path="/traitement/liste-conteneurs-bl" element={<PlaceholderPage title="Etat liste de conteneurs avec numéro et date BL" />} />
            <Route path="/traitement/stat-dossiers-transitaires" element={<PlaceholderPage title="Statistique des dossiers par transitaires" />} />
            <Route path="/traitement/archivage" element={<PlaceholderPage title="Archivage des fichiers de dossiers" />} />
            <Route path="/traitement/suppression" element={<PlaceholderPage title="Suppression de dossiers obsolètes" />} />
            
            {/* Paramètres */}
            <Route path="/parametres/utilisateurs" element={<UserListPage />} />
            <Route path="/parametres/armateurs" element={<ArmateurListPage />} />
            <Route path="/parametres/origines" element={<OrigineListPage />} />
            <Route path="/parametres/types-dossier" element={<TypeDossierListPage />} />
            <Route path="/parametres/navires" element={<NavireListPage />} />
            <Route path="/parametres/categories-produit" element={<CategorieProduitListPage />} />
            <Route path="/parametres/produits" element={<ProduitListPage />} />
            
            {/* Autres pages */}
            <Route path="/etats" element={<PlaceholderPage title="États" />} />
            <Route path="/rapports" element={<PlaceholderPage title="Rapports" />} />
            <Route path="/parametres" element={<PlaceholderPage title="Paramètres" />} />
            {/* Route par défaut pour les URLs inconnues */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </OrigineProvider>
      </ArmateurProvider>
    </AuthProvider>
  );
}

export default App;
