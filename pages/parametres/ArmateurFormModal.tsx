import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import useArmateurs from '../../hooks/useArmateurs';
import { Armateur } from '../../services/armateurService';
import { XCircleIcon, RefreshIcon } from '../../components/icons';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';

const MySwal = withReactContent(Swal);

type ArmateurFormInputs = Omit<Armateur, 'IdArmat'>;

interface ArmateurFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    armateur?: Armateur | null;
    onSuccess?: () => void;
}

const ArmateurFormModal: React.FC<ArmateurFormModalProps> = ({ isOpen, onClose, armateur, onSuccess }) => {
    const { createArmateur, updateArmateur } = useArmateurs();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditing = Boolean(armateur?.IdArmat);

    const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm<ArmateurFormInputs>();

    useEffect(() => {
        if (isOpen) {
            if (isEditing && armateur) {
                setValue('NomArmat', armateur.NomArmat);
                setValue('ContactArmat', armateur.ContactArmat || '');
                setValue('EmailArmat', armateur.EmailArmat || '');
            } else {
                reset({
                    NomArmat: '',
                    ContactArmat: '',
                    EmailArmat: ''
                });
            }
        }
    }, [isOpen, isEditing, armateur, reset, setValue]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && !isSubmitting) {
                onClose();
            }
        };

        if (isOpen) {
            document.body.style.overflow = 'hidden';
            document.addEventListener('keydown', handleKeyDown);
        } else {
            document.body.style.overflow = 'unset';
            document.removeEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.body.style.overflow = 'unset';
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, isSubmitting, onClose]);

    const onSubmit: SubmitHandler<ArmateurFormInputs> = async (data) => {
        try {
            setIsSubmitting(true);
            
            if (isEditing && armateur?.IdArmat) {
                const result = await updateArmateur(armateur.IdArmat, data);
                
                if (result.success) {
                    MySwal.fire({
                        title: 'Succès',
                        text: 'L\'armateur a été mis à jour avec succès.',
                        icon: 'success',
                        confirmButtonText: 'OK'
                    });
                } else {
                    throw new Error(result.error || 'Une erreur est survenue lors de la mise à jour');
                }
            } else {
                const result = await createArmateur(data);
                
                if (result.success) {
                    MySwal.fire({
                        title: 'Succès',
                        text: 'L\'armateur a été créé avec succès.',
                        icon: 'success',
                        confirmButtonText: 'OK'
                    });
                } else {
                    throw new Error(result.error || 'Une erreur est survenue lors de la création');
                }
            }
            
            if (onSuccess) {
                onSuccess();
            }
            
            onClose();
            
        } catch (error: any) {
            console.error('Erreur lors de la sauvegarde de l\'armateur :', error);
            
            await MySwal.fire({
                title: 'Erreur',
                text: error.message || 'Une erreur est survenue lors de la sauvegarde de l\'armateur',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderSubmitButton = () => {
        if (isSubmitting) {
            return (
                <button
                    type="button"
                    disabled
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-400 cursor-not-allowed"
                >
                    <RefreshIcon className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    {isEditing ? 'Mise à jour...' : 'Création...'}
                </button>
            );
        }
        
        return (
            <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={isSubmitting}
            >
                {isEditing ? 'Mettre à jour' : 'Créer'}
            </button>
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
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
                        <h3 className="text-lg leading-6 font-semibold" id="modal-title">
                            {isEditing ? 'Modifier un armateur' : 'Ajouter un nouvel armateur'}
                        </h3>
                        <button
                            type="button"
                            className="text-blue-100 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary focus:ring-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={onClose}
                            disabled={isSubmitting}
                            aria-label="Fermer"
                        >
                            <XCircleIcon className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="mb-4">
                                <label htmlFor="NomArmat" className="block text-sm font-medium text-gray-700">
                                    Nom de l'armateur <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="NomArmat"
                                    disabled={isSubmitting}
                                    className={`mt-1 block w-full border ${
                                        errors.NomArmat ? 'border-red-300' : 'border-gray-300'
                                    } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-50`}
                                    {...register('NomArmat', { 
                                        required: "Le nom de l'armateur est requis",
                                        minLength: {
                                            value: 2,
                                            message: "Le nom doit contenir au moins 2 caractères"
                                        }
                                    })}
                                />
                                {errors.NomArmat && (
                                    <p className="mt-1 text-sm text-red-600">{errors.NomArmat.message}</p>
                                )}
                            </div>

                            <div className="mb-4">
                                <label htmlFor="ContactArmat" className="block text-sm font-medium text-gray-700">
                                    Contact
                                </label>
                                <input
                                    type="text"
                                    id="ContactArmat"
                                    disabled={isSubmitting}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-50"
                                    {...register('ContactArmat')}
                                />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="EmailArmat" className="block text-sm font-medium text-gray-700">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="EmailArmat"
                                    disabled={isSubmitting}
                                    className={`mt-1 block w-full border ${
                                        errors.EmailArmat ? 'border-red-300' : 'border-gray-300'
                                    } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-50`}
                                    {...register('EmailArmat', {
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: 'Adresse email invalide'
                                        }
                                    })}
                                />
                                {errors.EmailArmat && (
                                    <p className="mt-1 text-sm text-red-600">{errors.EmailArmat.message}</p>
                                )}
                            </div>

                            <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                                <button
                                    type="button"
                                    disabled={isSubmitting}
                                    className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={onClose}
                                >
                                    Annuler
                                </button>
                                {renderSubmitButton()}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArmateurFormModal;