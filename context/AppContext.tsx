
import React, { createContext, useState, useContext, useEffect, useCallback, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dossier, User, Armateur, Origine, TypeDossier, Navire, CategorieProduit, Produit } from '../types';
import { mockDossiers, mockUsers, mockArmateurs, mockOrigines, mockTypeDossiers, mockNavires, mockCategorieProduits, mockProduits } from '../data/mockData';

// --- AUTH CONTEXT ---
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- DOSSIER CONTEXT ---
interface DossierContextType {
  dossiers: Dossier[];
  getDossierById: (id: string) => Dossier | undefined;
  addDossier: (dossier: Omit<Dossier, 'id'>) => void;
  updateDossier: (dossier: Dossier) => void;
  deleteDossier: (id: string) => void;
}

const DossierContext = createContext<DossierContextType | undefined>(undefined);

// --- USER CONTEXT ---
interface UserContextType {
  users: User[];
  getUserById: (id: string) => User | undefined;
  addUser: (user: Omit<User, 'id' | 'password'> & { password?: string }) => void;
  updateUser: (user: User) => void;
  deleteUser: (id: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// --- ARMATEUR CONTEXT ---
interface ArmateurContextType {
  armateurs: Armateur[];
  getArmateurById: (id: string) => Armateur | undefined;
  addArmateur: (armateur: Omit<Armateur, 'id'>) => void;
  updateArmateur: (armateur: Armateur) => void;
  deleteArmateur: (id: string) => void;
}

const ArmateurContext = createContext<ArmateurContextType | undefined>(undefined);

// --- ORIGINE CONTEXT ---
interface OrigineContextType {
  origines: Origine[];
  getOrigineById: (id: string) => Origine | undefined;
  addOrigine: (origine: Omit<Origine, 'id'>) => void;
  updateOrigine: (origine: Origine) => void;
  deleteOrigine: (id: string) => void;
}

const OrigineContext = createContext<OrigineContextType | undefined>(undefined);

// --- TYPE DOSSIER CONTEXT ---
interface TypeDossierContextType {
  typeDossiers: TypeDossier[];
  getTypeDossierById: (id: string) => TypeDossier | undefined;
  addTypeDossier: (typeDossier: Omit<TypeDossier, 'id'>) => void;
  updateTypeDossier: (typeDossier: TypeDossier) => void;
  deleteTypeDossier: (id: string) => void;
}

const TypeDossierContext = createContext<TypeDossierContextType | undefined>(undefined);

// --- NAVIRE CONTEXT ---
interface NavireContextType {
  navires: Navire[];
  getNavireById: (id: string) => Navire | undefined;
  addNavire: (navire: Omit<Navire, 'id'>) => void;
  updateNavire: (navire: Navire) => void;
  deleteNavire: (id: string) => void;
}
const NavireContext = createContext<NavireContextType | undefined>(undefined);

// --- CATEGORIE PRODUIT CONTEXT ---
interface CategorieProduitContextType {
  categorieProduits: CategorieProduit[];
  getCategorieProduitById: (id: string) => CategorieProduit | undefined;
  addCategorieProduit: (categorieProduit: Omit<CategorieProduit, 'id'>) => void;
  updateCategorieProduit: (categorieProduit: CategorieProduit) => void;
  deleteCategorieProduit: (id: string) => void;
}
const CategorieProduitContext = createContext<CategorieProduitContextType | undefined>(undefined);

// --- PRODUIT CONTEXT ---
interface ProduitContextType {
  produits: Produit[];
  getProduitById: (id: string) => Produit | undefined;
  addProduit: (produit: Omit<Produit, 'id'>) => void;
  updateProduit: (produit: Produit) => void;
  deleteProduit: (id: string) => void;
}
const ProduitContext = createContext<ProduitContextType | undefined>(undefined);


// --- COMBINED PROVIDER ---
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // User State for settings CRUD
  const [users, setUsers] = useState<User[]>(() => {
    const savedUsers = localStorage.getItem('users');
    return savedUsers ? JSON.parse(savedUsers) : mockUsers;
  });

  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (username: string) => {
    const foundUser = users.find(u => u.username === username);
    if (foundUser) {
        const { password, ...userToStore } = foundUser;
        localStorage.setItem('user', JSON.stringify(userToStore));
        localStorage.setItem('token', 'fake-auth-token');
        setUser(userToStore);
        navigate('/dashboard');
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  }, [navigate]);

  // Dossier State
  const [dossiers, setDossiers] = useState<Dossier[]>(() => {
    const savedDossiers = localStorage.getItem('dossiers');
    return savedDossiers ? JSON.parse(savedDossiers) : mockDossiers;
  });

  useEffect(() => {
    localStorage.setItem('dossiers', JSON.stringify(dossiers));
  }, [dossiers]);

  const getDossierById = (id: string) => dossiers.find(d => d.id === id);

  const addDossier = (dossierData: Omit<Dossier, 'id'>) => {
    const newDossier: Dossier = {
      ...dossierData,
      id: `dossier_${Date.now()}`,
    };
    setDossiers(prev => [newDossier, ...prev]);
  };

  const updateDossier = (updatedDossier: Dossier) => {
    setDossiers(prev => prev.map(d => d.id === updatedDossier.id ? updatedDossier : d));
  };

  const deleteDossier = (id: string) => {
    setDossiers(prev => prev.filter(d => d.id !== id));
  };

  // User CRUD State (from useState above)
  const getUserById = (id: string) => users.find(u => u.id === id);

  const addUser = (userData: Omit<User, 'id' | 'password'> & { password?: string }) => {
    const newUser: User = {
      ...userData,
      id: `user_${Date.now()}`,
    };
    setUsers(prev => [newUser, ...prev]);
  };

  const updateUser = (updatedUser: User) => {
    setUsers(prev => prev.map(u => {
      if (u.id === updatedUser.id) {
        // If password is not provided in the update, keep the old one
        return { ...u, ...updatedUser, password: updatedUser.password || u.password };
      }
      return u;
    }));
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  // Armateur State
  const [armateurs, setArmateurs] = useState<Armateur[]>(() => {
    const savedArmateurs = localStorage.getItem('armateurs');
    return savedArmateurs ? JSON.parse(savedArmateurs) : mockArmateurs;
  });

  useEffect(() => {
    localStorage.setItem('armateurs', JSON.stringify(armateurs));
  }, [armateurs]);

  const getArmateurById = (id: string) => armateurs.find(a => a.id === id);

  const addArmateur = (armateurData: Omit<Armateur, 'id'>) => {
    const newArmateur: Armateur = {
      ...armateurData,
      id: `arm_${Date.now()}`,
    };
    setArmateurs(prev => [newArmateur, ...prev]);
  };

  const updateArmateur = (updatedArmateur: Armateur) => {
    setArmateurs(prev => prev.map(a => a.id === updatedArmateur.id ? updatedArmateur : a));
  };

  const deleteArmateur = (id: string) => {
    setArmateurs(prev => prev.filter(a => a.id !== id));
  };

  // Origine State
  const [origines, setOrigines] = useState<Origine[]>(() => {
    const savedOrigines = localStorage.getItem('origines');
    return savedOrigines ? JSON.parse(savedOrigines) : mockOrigines;
  });

  useEffect(() => {
    localStorage.setItem('origines', JSON.stringify(origines));
  }, [origines]);

  const getOrigineById = (id: string) => origines.find(o => o.id === id);

  const addOrigine = (origineData: Omit<Origine, 'id'>) => {
    const newOrigine: Origine = {
      ...origineData,
      id: `orig_${Date.now()}`,
    };
    setOrigines(prev => [newOrigine, ...prev]);
  };

  const updateOrigine = (updatedOrigine: Origine) => {
    setOrigines(prev => prev.map(o => o.id === updatedOrigine.id ? updatedOrigine : o));
  };

  const deleteOrigine = (id: string) => {
    setOrigines(prev => prev.filter(o => o.id !== id));
  };

  // TypeDossier State
  const [typeDossiers, setTypeDossiers] = useState<TypeDossier[]>(() => {
    const savedTypeDossiers = localStorage.getItem('typeDossiers');
    return savedTypeDossiers ? JSON.parse(savedTypeDossiers) : mockTypeDossiers;
  });

  useEffect(() => {
    localStorage.setItem('typeDossiers', JSON.stringify(typeDossiers));
  }, [typeDossiers]);

  const getTypeDossierById = (id: string) => typeDossiers.find(t => t.id === id);

  const addTypeDossier = (typeDossierData: Omit<TypeDossier, 'id'>) => {
    const newTypeDossier: TypeDossier = {
      ...typeDossierData,
      id: `td_${Date.now()}`,
    };
    setTypeDossiers(prev => [newTypeDossier, ...prev]);
  };

  const updateTypeDossier = (updatedTypeDossier: TypeDossier) => {
    setTypeDossiers(prev => prev.map(t => t.id === updatedTypeDossier.id ? updatedTypeDossier : t));
  };

  const deleteTypeDossier = (id: string) => {
    setTypeDossiers(prev => prev.filter(t => t.id !== id));
  };

  // Navire State
  const [navires, setNavires] = useState<Navire[]>(() => {
    const savedNavires = localStorage.getItem('navires');
    return savedNavires ? JSON.parse(savedNavires) : mockNavires;
  });

  useEffect(() => {
    localStorage.setItem('navires', JSON.stringify(navires));
  }, [navires]);

  const getNavireById = (id: string) => navires.find(n => n.id === id);

  const addNavire = (navireData: Omit<Navire, 'id'>) => {
    const newNavire: Navire = {
      ...navireData,
      id: `nav_${Date.now()}`,
    };
    setNavires(prev => [newNavire, ...prev]);
  };

  const updateNavire = (updatedNavire: Navire) => {
    setNavires(prev => prev.map(n => n.id === updatedNavire.id ? updatedNavire : n));
  };

  const deleteNavire = (id: string) => {
    setNavires(prev => prev.filter(n => n.id !== id));
  };
  
  // CategorieProduit State
  const [categorieProduits, setCategorieProduits] = useState<CategorieProduit[]>(() => {
    const savedCategorieProduits = localStorage.getItem('categorieProduits');
    return savedCategorieProduits ? JSON.parse(savedCategorieProduits) : mockCategorieProduits;
  });

  useEffect(() => {
    localStorage.setItem('categorieProduits', JSON.stringify(categorieProduits));
  }, [categorieProduits]);

  const getCategorieProduitById = (id: string) => categorieProduits.find(c => c.id === id);

  const addCategorieProduit = (categorieProduitData: Omit<CategorieProduit, 'id'>) => {
    const newCategorieProduit: CategorieProduit = {
      ...categorieProduitData,
      id: `catp_${Date.now()}`,
    };
    setCategorieProduits(prev => [newCategorieProduit, ...prev]);
  };

  const updateCategorieProduit = (updatedCategorieProduit: CategorieProduit) => {
    setCategorieProduits(prev => prev.map(c => c.id === updatedCategorieProduit.id ? updatedCategorieProduit : c));
  };

  const deleteCategorieProduit = (id: string) => {
    setCategorieProduits(prev => prev.filter(c => c.id !== id));
  };

  // Produit State
  const [produits, setProduits] = useState<Produit[]>(() => {
    const savedProduits = localStorage.getItem('produits');
    return savedProduits ? JSON.parse(savedProduits) : mockProduits;
  });

  useEffect(() => {
    localStorage.setItem('produits', JSON.stringify(produits));
  }, [produits]);

  const getProduitById = (id: string) => produits.find(p => p.id === id);

  const addProduit = (produitData: Omit<Produit, 'id'>) => {
    const newProduit: Produit = {
      ...produitData,
      id: `prod_${Date.now()}`,
    };
    setProduits(prev => [newProduit, ...prev]);
  };

  const updateProduit = (updatedProduit: Produit) => {
    setProduits(prev => prev.map(p => p.id === updatedProduit.id ? updatedProduit : p));
  };

  const deleteProduit = (id: string) => {
    setProduits(prev => prev.filter(p => p.id !== id));
  };


  return (
    <AuthContext.Provider value={{ isAuthenticated: !!user, user, login, logout }}>
      <DossierContext.Provider value={{ dossiers, getDossierById, addDossier, updateDossier, deleteDossier }}>
        <UserContext.Provider value={{ users, getUserById, addUser, updateUser, deleteUser }}>
          <ArmateurContext.Provider value={{ armateurs, getArmateurById, addArmateur, updateArmateur, deleteArmateur }}>
            <OrigineContext.Provider value={{ origines, getOrigineById, addOrigine, updateOrigine, deleteOrigine }}>
              <TypeDossierContext.Provider value={{ typeDossiers, getTypeDossierById, addTypeDossier, updateTypeDossier, deleteTypeDossier }}>
                <NavireContext.Provider value={{ navires, getNavireById, addNavire, updateNavire, deleteNavire }}>
                  <CategorieProduitContext.Provider value={{ categorieProduits, getCategorieProduitById, addCategorieProduit, updateCategorieProduit, deleteCategorieProduit }}>
                    <ProduitContext.Provider value={{ produits, getProduitById, addProduit, updateProduit, deleteProduit }}>
                      {children}
                    </ProduitContext.Provider>
                  </CategorieProduitContext.Provider>
                </NavireContext.Provider>
              </TypeDossierContext.Provider>
            </OrigineContext.Provider>
          </ArmateurContext.Provider>
        </UserContext.Provider>
      </DossierContext.Provider>
    </AuthContext.Provider>
  );
};

// --- HOOKS ---
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AppProvider');
  }
  return context;
};

export const useDossiers = () => {
  const context = useContext(DossierContext);
  if (context === undefined) {
    throw new Error('useDossiers must be used within an AppProvider');
  }
  return context;
};

export const useUsers = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUsers must be used within an AppProvider');
  }
  return context;
};

export const useArmateurs = () => {
  const context = useContext(ArmateurContext);
  if (context === undefined) {
    throw new Error('useArmateurs must be used within an AppProvider');
  }
  return context;
};

export const useOrigines = () => {
  const context = useContext(OrigineContext);
  if (context === undefined) {
    throw new Error('useOrigines must be used within an AppProvider');
  }
  return context;
};

export const useTypeDossiers = () => {
  const context = useContext(TypeDossierContext);
  if (context === undefined) {
    throw new Error('useTypeDossiers must be used within an AppProvider');
  }
  return context;
};

export const useNavires = () => {
  const context = useContext(NavireContext);
  if (context === undefined) {
    throw new Error('useNavires must be used within an AppProvider');
  }
  return context;
};

export const useCategorieProduits = () => {
  const context = useContext(CategorieProduitContext);
  if (context === undefined) {
    throw new Error('useCategorieProduits must be used within an AppProvider');
  }
  return context;
};

export const useProduits = () => {
  const context = useContext(ProduitContext);
  if (context === undefined) {
    throw new Error('useProduits must be used within an AppProvider');
  }
  return context;
};
