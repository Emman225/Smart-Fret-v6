import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import { User } from '../../types';
import { useUsers } from '../../context/AppContext';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { UserIcon } from '../../components/icons';

const MySwal = withReactContent(Swal);

type UserFormInputs = Omit<User, 'id'> & {
    confirmPassword?: string;
};

const UserFormPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { getUserById, addUser, updateUser } = useUsers();
    const isEditing = Boolean(id);

    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<UserFormInputs>();
    const password = watch('password');

    useEffect(() => {
        if (isEditing && id) {
            const user = getUserById(id);
            if (user) {
                // Ne pas pré-remplir les champs de mot de passe pour la modification
                const { password, ...userData } = user;
                reset(userData);
            }
        }
    }, [id, isEditing, getUserById, reset]);

    const onSubmit: SubmitHandler<UserFormInputs> = (data) => {
        const { confirmPassword, ...userData } = data;
        
        if (isEditing && id) {
             const finalUserData: User = { ...userData, id };
             if (!userData.password) {
                 delete finalUserData.password;
             }
            updateUser(finalUserData);
        } else {
            addUser(userData);
        }
        
        MySwal.fire({
            title: 'Succès !',
            text: `L'utilisateur a été ${isEditing ? 'mis à jour' : 'créé'} avec succès.`,
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            background: '#334155',
            color: '#f8fafc'
        });
        navigate('/parametres/utilisateur');
    };

    const FieldWrapper: React.FC<{ label: string; htmlFor: keyof UserFormInputs; error?: string; children: React.ReactNode }> = ({ label, htmlFor, error, children }) => (
        <div>
            <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
            {children}
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-800">
                    {isEditing ? "Modifier l'utilisateur" : "Créer un nouvel utilisateur"}
                </h1>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="bg-white p-8 rounded-xl shadow-xl border border-slate-200">
                    <div className="space-y-8">
                        {/* Section Informations */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <FieldWrapper label="Nom d'utilisateur" htmlFor="username" error={errors.username?.message}>
                                <input
                                    id="username"
                                    type="text"
                                    {...register('username', { required: "Le nom d'utilisateur est requis" })}
                                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.username ? 'border-red-500 focus:ring-red-400' : 'border-slate-300 focus:ring-primary'}`}
                                />
                            </FieldWrapper>

                            <FieldWrapper label="Nom et Prénoms" htmlFor="fullName" error={errors.fullName?.message}>
                                <input
                                    id="fullName"
                                    type="text"
                                    {...register('fullName', { required: 'Le nom complet est requis' })}
                                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.fullName ? 'border-red-500 focus:ring-red-400' : 'border-slate-300 focus:ring-primary'}`}
                                />
                            </FieldWrapper>

                            <FieldWrapper label="Contact" htmlFor="contact" error={errors.contact?.message}>
                                <input
                                    id="contact"
                                    type="tel"
                                    {...register('contact')}
                                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.contact ? 'border-red-500 focus:ring-red-400' : 'border-slate-300 focus:ring-primary'}`}
                                />
                            </FieldWrapper>

                            <FieldWrapper label="Email" htmlFor="email" error={errors.email?.message}>
                                <input
                                    id="email"
                                    type="email"
                                    {...register('email', { 
                                        required: "L'email est requis",
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: "Adresse email invalide"
                                        }
                                    })}
                                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.email ? 'border-red-500 focus:ring-red-400' : 'border-slate-300 focus:ring-primary'}`}
                                />
                            </FieldWrapper>
                        </div>
                        
                        {/* Section Sécurité */}
                        <div className="border-t border-slate-200 pt-8">
                            <div>
                               <h3 className="text-lg font-semibold text-slate-700">Sécurité</h3>
                               <p className="text-sm text-slate-500 mt-1">{isEditing ? "Laissez les champs de mot de passe vides pour ne pas le modifier." : "Définissez un mot de passe pour le nouvel utilisateur."}</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mt-6">
                                <FieldWrapper label="Mot de passe" htmlFor="password" error={errors.password?.message}>
                                    <input
                                        id="password"
                                        type="password"
                                        {...register('password', { required: !isEditing ? 'Le mot de passe est requis' : false })}
                                        className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.password ? 'border-red-500 focus:ring-red-400' : 'border-slate-300 focus:ring-primary'}`}
                                    />
                                </FieldWrapper>

                                <FieldWrapper label="Confirmer le mot de passe" htmlFor="confirmPassword" error={errors.confirmPassword?.message}>
                                    <input
                                        id="confirmPassword"
                                        type="password"
                                        {...register('confirmPassword', {
                                            validate: value => value === password || "Les mots de passe ne correspondent pas"
                                        })}
                                        className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.confirmPassword ? 'border-red-500 focus:ring-red-400' : 'border-slate-300 focus:ring-primary'}`}
                                    />
                                </FieldWrapper>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-4 pt-6 mt-8 border-t border-slate-200">
                        <button type="button" onClick={() => navigate('/parametres/utilisateur')} className="bg-white border border-slate-300 text-slate-700 px-6 py-2 rounded-lg hover:bg-slate-50 text-sm font-medium transition-colors">
                            Annuler
                        </button>
                        <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-600 text-sm font-medium transition-colors shadow-sm hover:shadow-md">
                            {isEditing ? 'Mettre à jour' : 'Créer l\'utilisateur'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default UserFormPage;
