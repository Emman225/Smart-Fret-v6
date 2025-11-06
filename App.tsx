
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import DossiersListPage from './pages/dossiers/DossiersListPage';
import DossierFormPage from './pages/dossiers/DossierFormPage';
import UserListPage from './pages/parametres/UserListPage';
import ArmateurListPage from './pages/parametres/ArmateurListPage';
import OrigineListPage from './pages/parametres/OrigineListPage';
import TypeDossierListPage from './pages/parametres/TypeDossierListPage';
import NavireListPage from './pages/parametres/NavireListPage';
import CategorieProduitListPage from './pages/parametres/CategorieProduitListPage';
import ProduitListPage from './pages/parametres/ProduitListPage';

const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
         <h1 className="text-2xl font-semibold text-slate-800 mb-4">{title}</h1>
         <p className="text-slate-600">
            Cette page est en cours de construction.
         </p>
    </div>
);


function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <Layout>
            <Routes>
              <Route path="/dashboard" element={<DashboardPage />} />
              
              {/* Gestion des dossiers */}
              <Route path="/dossiers" element={<DossiersListPage />} />
              <Route path="/dossiers/new" element={<DossierFormPage />} />
              <Route path="/dossiers/:id/edit" element={<DossierFormPage />} />
              
              {/* Traitement */}
              <Route path="/traitement/reglements" element={<PlaceholderPage title="Etat des règlements" />} />
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
              <Route path="/parametres/utilisateur" element={<UserListPage />} />
              <Route path="/parametres/armateur" element={<ArmateurListPage />} />
              <Route path="/parametres/origine" element={<OrigineListPage />} />
              <Route path="/parametres/type-dossier" element={<TypeDossierListPage />} />
              <Route path="/parametres/navire" element={<NavireListPage />} />
              <Route path="/parametres/categorie-produit" element={<CategorieProduitListPage />} />
              <Route path="/parametres/produits" element={<ProduitListPage />} />

              {/* Statistiques */}
              <Route path="/statistiques/produits-par-pays" element={<PlaceholderPage title="Statistiques : Produits par pays" />} />
              <Route path="/statistiques/conteneur-par-armateur" element={<PlaceholderPage title="Statistiques : Conteneur par armateur" />} />
              <Route path="/statistiques/conteneur-par-produit" element={<PlaceholderPage title="Statistiques : Conteneur par produit avec date & N° BL" />} />
              
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Layout>
        }
      />
    </Routes>
  );
}

export default App;
