import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { XCircleIcon, RefreshIcon } from '../../components/icons';
import { useUsers } from '../../context/AppContext';
import { User } from '../../types';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

interface UserFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    user: User | null;
}

type UserFormInputs = {
    fullName: string;
    username: string;
    email: string;
    contact: string;
    role: string;
    password: string;
};

const ROLE_OPTIONS = [
    { value: 'admin', label: 'Administrateur' },
    { value: 'manager', label: 'Gestionnaire' },
    { value: 'user', label: 'Utilisateur' }
];

const defaultValues: UserFormInputs = {
    fullName: '',
    username: '',
    email: '',
    contact: '',
    role: 'user',
    password: ''
};

const UserFormModal: React.FC<UserFormModalProps> = ({ isOpen, onClose, onSuccess, user }) => {
    const { addUser, updateUser } = useUsers();
    const { register, handleSubmit, reset, formState: { errors } } = useForm<UserFormInputs>({
        defaultValues
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const isEditing = Boolean(user);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            reset({
                fullName: user?.fullName || '',
                username: user?.username || '',
                email: user?.email || '',
                contact: user?.contact || '',
                role: user?.role || 'user',
                password: ''
            });
        } else {
            document.body.style.overflow = 'unset';
            reset(defaultValues);
            setFormError(null);
            setIsSubmitting(false);
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, user, reset]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && !isSubmitting) {
                onClose();
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, isSubmitting, onClose]);

    const submitHandler = async (values: UserFormInputs) => {
        setFormError(null);
        setIsSubmitting(true);

        const payload = {
            fullName: values.fullName.trim(),
            username: values.username.trim(),
            email: values.email.trim(),
            contact: values.contact.trim(),
            role: values.role,
            password: values.password
        };

        try {
            if (isEditing && user) {
                const updatePayload: User & { password?: string } = {
                    ...user,
                    fullName: payload.fullName,
                    username: payload.username,
                    email: payload.email,
                    contact: payload.contact,
                    role: payload.role
                };

                if (payload.password) {
                    updatePayload.password = payload.password;
                }

                await updateUser(updatePayload);

                // Afficher SweetAlert2 pour la mise à jour réussie
                await Swal.fire({
                    icon: 'success',
                    title: 'Utilisateur mis à jour',
                    text: 'L\'utilisateur a été mis à jour avec succès.',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#3B82F6'
                });
            } else {
                if (!payload.password) {
                    setFormError('Le mot de passe est requis pour créer un utilisateur.');
                    return;
                }
                await addUser({
                    fullName: payload.fullName,
                    username: payload.username,
                    email: payload.email,
                    contact: payload.contact,
                    role: payload.role,
                    password: payload.password
                });

                // Afficher SweetAlert2 pour la création réussie
                await Swal.fire({
                    icon: 'success',
                    title: 'Utilisateur créé',
                    text: 'L\'utilisateur a été créé avec succès.',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#3B82F6'
                });
            }

            onSuccess?.();
            onClose();
        } catch (error: any) {
            setFormError(error?.message || 'Une erreur est survenue.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div
                    className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                    aria-hidden="true"
                    onClick={isSubmitting ? undefined : onClose}
                ></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                    &#8203;
                </span>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="flex justify-between items-center px-5 py-4 sm:px-6 bg-primary text-white">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-blue-100">{isEditing ? 'Modification' : 'Création'}</p>
                            <h3 className="text-lg leading-6 font-semibold">
                                {isEditing ? 'Modifier un utilisateur' : 'Ajouter un utilisateur'}
                            </h3>
                        </div>
                        <button
                            type="button"
                            className="text-blue-100 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary focus:ring-white rounded-full disabled:opacity-50"
                            onClick={onClose}
                            disabled={isSubmitting}
                            aria-label="Fermer"
                        >
                            <XCircleIcon className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        {formError && (
                            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
                                {formError}
                            </div>
                        )}

                        <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
                            <div>
                                <label htmlFor="fullName" className="block text-sm font-medium text-slate-700">
                                    Nom complet <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="fullName"
                                    type="text"
                                    className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 ${errors.fullName ? 'border-red-300' : 'border-slate-300'}`}
                                    disabled={isSubmitting}
                                    {...register('fullName', { required: 'Le nom complet est requis' })}
                                />
                                {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>}
                            </div>

                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-slate-700">
                                    Nom d'utilisateur <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="username"
                                    type="text"
                                    className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 ${errors.username ? 'border-red-300' : 'border-slate-300'}`}
                                    disabled={isSubmitting || isEditing}
                                    {...register('username', { required: "Le nom d'utilisateur est requis" })}
                                />
                                {errors.username && <p className="mt-1 text-xs text-red-500">{errors.username.message}</p>}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 ${errors.email ? 'border-red-300' : 'border-slate-300'}`}
                                        disabled={isSubmitting}
                                        {...register('email', {
                                            required: "L'adresse email est requise",
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message: 'Adresse email invalide'
                                            }
                                        })}
                                    />
                                    {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                                </div>
                                <div>
                                    <label htmlFor="contact" className="block text-sm font-medium text-slate-700">
                                        Contact
                                    </label>
                                    <input
                                        id="contact"
                                        type="text"
                                        className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                                        disabled={isSubmitting}
                                        {...register('contact')}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="role" className="block text-sm font-medium text-slate-700">
                                        Rôle
                                    </label>
                                    <select
                                        id="role"
                                        className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                                        disabled={isSubmitting}
                                        {...register('role')}
                                    >
                                        {ROLE_OPTIONS.map(option => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                                        Mot de passe {isEditing ? '(laisser vide pour conserver)' : <span className="text-red-500">*</span>}
                                    </label>
                                    <input
                                        id="password"
                                        type="password"
                                        className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 ${errors.password ? 'border-red-300' : 'border-slate-300'}`}
                                        disabled={isSubmitting}
                                        {...register('password', {
                                            required: isEditing ? false : 'Le mot de passe est requis',
                                            // no minLength requirement for password
                                        })}
                                    />
                                    {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
                                </div>
                            </div>

                            <div className="flex items-center justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    className="inline-flex justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-200 disabled:opacity-50"
                                    onClick={onClose}
                                    disabled={isSubmitting}
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="inline-flex items-center justify-center rounded-lg border border-transparent px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <RefreshIcon className="w-4 h-4 animate-spin mr-2" />
                                            {isEditing ? 'Mise à jour...' : 'Création...'}
                                        </>
                                    ) : (
                                        isEditing ? 'Mettre à jour' : 'Créer'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserFormModal;
