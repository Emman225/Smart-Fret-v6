import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.jpg';
import bgLogin from '../assets/bg_login.png';

const MySwal = withReactContent(Swal);

type LoginFormInputs = {
  username: string;
  password: string;
};

const LoginPage: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>();
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Effet: terminer la vérification initiale de l'authentification
  useEffect(() => {
    if (!authLoading && !initialCheckDone) {
      setInitialCheckDone(true);
    }
  }, [authLoading, initialCheckDone]);

  const showLoginError = (message: string, isServerError: boolean = false) => {
    // Nettoyer le message d'erreur
    let cleanMessage = message;

    // Si le message contient des détails techniques, les supprimer
    if (cleanMessage.includes('SQLSTATE') ||
      cleanMessage.includes('at ') ||
      cleanMessage.includes(' in ') ||
      cleanMessage.includes(' on line ')) {
      cleanMessage = 'Une erreur technique est survenue. Veuillez réessayer plus tard.';
      isServerError = true;
    }

    // Si c'est une erreur serveur, on ajoute un message plus détaillé
    const fullMessage = isServerError
      ? `${cleanMessage}\n\nVeuillez réessayer dans quelques instants.\nSi le problème persiste, contactez l'administrateur.`
      : cleanMessage;

    // Créer une instance de SweetAlert2 avec nos options
    const swalOptions: any = {
      title: isServerError ? 'Erreur serveur' : 'Erreur de connexion',
      html: fullMessage.replace(/\n/g, '<br>'),
      icon: 'error',
      confirmButtonText: 'OK',
      confirmButtonColor: '#3b82f6',
      background: '#1e293b',
      color: '#f8fafc',
      customClass: {
        popup: 'text-left max-w-md mx-4',
        title: 'text-red-400',
        confirmButton: 'px-4 py-2 rounded-md',
      },
      buttonsStyling: false,
      allowOutsideClick: false,
      showCloseButton: false,
      allowEscapeKey: false,
    };

    // Afficher l'alerte
    MySwal.fire(swalOptions);

    // Retourner la promesse pour permettre l'enchaînement si nécessaire
    return MySwal.getContainer();
  };

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    if (isSubmitting) {
      console.log('Soumission déjà en cours, on ignore...');
      return;
    }

    console.log('Tentative de connexion avec:', { username: data.username });
    setIsSubmitting(true);

    try {
      const success = await login(data.username, data.password);
      console.log('Résultat de la tentative de connexion:', success ? 'succès' : 'échec');

      if (!success) {
        showLoginError('Identifiants incorrects. Veuillez vérifier votre nom d\'utilisateur et votre mot de passe.');
        setIsSubmitting(false);
        return;
      }
      // Redirection immédiate en cas de succès, sans repasser par le loader global
      const searchParams = new URLSearchParams(window.location.search);
      const redirectTo = searchParams.get('redirect') || '/dashboard';
      navigate(redirectTo, { replace: true });

    } catch (error: any) {
      console.error('Erreur détaillée dans onSubmit:', error);

      // Déterminer le type d'erreur
      let errorMessage = 'Une erreur inattendue est survenue. Veuillez réessayer.';
      let isServerError = false;

      // Gestion des erreurs spécifiques à notre service d'authentification
      if (error.message) {
        errorMessage = error.message;
        isServerError = errorMessage.toLowerCase().includes('serveur') ||
          errorMessage.includes('500') ||
          errorMessage.includes('base de données');
      }

      // Nettoyer le message d'erreur des détails techniques
      if (errorMessage.includes('SQL') ||
        errorMessage.includes('at ') ||
        errorMessage.includes(' in ') ||
        errorMessage.includes(' on line ')) {
        errorMessage = 'Une erreur technique est survenue. Veuillez réessayer plus tard.';
        isServerError = true;
      }

      // Afficher l'erreur à l'utilisateur
      showLoginError(errorMessage, isServerError);
      setIsSubmitting(false);

    } finally {
      // Ne rien faire ici pour éviter le clignotement du formulaire si la redirection intervient
    }
  };

  // Afficher le loader uniquement pendant la vérification initiale de l'authentification
  if (authLoading && !initialCheckDone) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-slate-600">
            Chargement...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-slate-900">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <img
          src={bgLogin}
          alt="Background"
          className="w-full h-full object-cover"
        />
        {/* Dark overlay for better readability */}
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>
      </div>

      {/* Glass Card */}
      <div className="relative z-10 w-full max-w-md p-8 mx-4">
        <div className="absolute inset-0 bg-white/20 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl"></div>

        <div className="relative z-20">
          <div className="text-center mb-10">
            <div className="inline-block w-[88px] h-[88px] rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-white/10 mb-6 shadow-lg">
              <img src={logo} alt="Smart Fret" className="w-full h-full object-cover drop-shadow-md rounded-2xl" />
            </div>
            {/*<h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Smart Fret</h1>*/}
            <p className="text-slate-400 text-sm font-light">Connectez-vous à votre espace de gestion</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300 uppercase tracking-wider ml-1" htmlFor="username">
                Nom d'utilisateur
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  id="username"
                  type="text"
                  {...register('username', { required: "Le nom d'utilisateur est requis" })}
                  className={`block w-full pl-10 pr-3 py-3 bg-slate-800/50 border ${errors.username ? 'border-red-500/50 focus:border-red-500' : 'border-slate-700 focus:border-blue-500'} rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all duration-200 sm:text-sm`}
                  placeholder="Entrez votre identifiant"
                  disabled={isSubmitting}
                  autoComplete="username"
                />
              </div>
              {errors.username && <p className="text-red-400 text-xs mt-1 ml-1">{errors.username.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300 uppercase tracking-wider ml-1" htmlFor="password">
                Mot de passe
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', { required: 'Le mot de passe est requis' })}
                  className={`block w-full pl-10 pr-10 py-3 bg-slate-800/50 border ${errors.password ? 'border-red-500/50 focus:border-red-500' : 'border-slate-700 focus:border-blue-500'} rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all duration-200 sm:text-sm`}
                  placeholder="••••••••"
                  disabled={isSubmitting}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-6 0-10-7-10-7a19.59 19.59 0 014.672-5.6M9.88 9.88A3 3 0 0012 15a3 3 0 002.12-5.12M3 3l18 18" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1 ml-1">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center space-x-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500/50 focus:ring-offset-0 focus:ring-offset-transparent transition-colors"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">Se souvenir de moi</span>
              </label>
              <a href="#" className="text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium">
                Mot de passe oublié ?
              </a>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3.5 px-4 rounded-xl text-white font-semibold text-sm tracking-wide transition-all duration-300 flex items-center justify-center shadow-lg shadow-blue-500/20 ${isSubmitting
                ? 'bg-slate-700 cursor-not-allowed opacity-75'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0'
                }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connexion...
                </>
              ) : (
                <>
                  Se connecter
                  <svg className="ml-2 -mr-1 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 text-slate-500 text-xs font-light">
        &copy; {new Date().getFullYear()} Smart Fret. Tous droits réservés.
      </div>
    </div>
  );
};

export default LoginPage;
