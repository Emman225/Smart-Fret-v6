
import React, { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useAuth } from '../context/AppContext';

const MySwal = withReactContent(Swal);

type LoginFormInputs = {
  username: string;
  password: string;
};

const LoginPage: React.FC = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>();
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    const showLoginError = (message: string) => {
        MySwal.fire({
            title: 'Erreur',
            text: message,
            icon: 'error',
            confirmButtonText: 'OK',
            background: '#334155', // slate-700
            color: '#f8fafc' // slate-50
        });
    };

    const onSubmit: SubmitHandler<LoginFormInputs> = data => {
        if (data.username === 'a' && data.password === 'a') {
            login(data.username);
        } else {
            showLoginError('Identifiants incorrects.');
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-primary">Smart Fret</h1>
                    <p className="text-slate-500 mt-2">Connectez-vous à votre tableau de bord</p>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1" htmlFor="username">
                            Nom d’utilisateur
                        </label>
                        <input
                            id="username"
                            type="text"
                            {...register('username', { required: 'Le nom d\'utilisateur est requis' })}
                            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.username ? 'border-red-500 focus:ring-red-400' : 'border-slate-300 focus:ring-primary'}`}
                        />
                        {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1" htmlFor="password">
                            Mot de passe
                        </label>
                        <input
                            id="password"
                            type="password"
                            {...register('password', { required: 'Le mot de passe est requis' })}
                            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.password ? 'border-red-500 focus:ring-red-400' : 'border-slate-300 focus:ring-primary'}`}
                        />
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-primary text-white py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-300"
                    >
                        Se connecter
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;