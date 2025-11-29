
import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Origine } from '../../types';
import { useOrigines } from '../../context/AppContext';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { XCircleIcon, ExclamationCircleIcon } from '../../components/icons';

const MySwal = withReactContent(Swal);

type OrigineFormInputs = {
    NomPays: string;
};

interface OrigineFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    origineId: string | null;
}

const OrigineFormModal: React.FC<OrigineFormModalProps> = ({ isOpen, onClose, origineId }) => {
    const { getOrigineById, addOrigine, updateOrigine } = useOrigines();
    const isEditing = Boolean(origineId);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<OrigineFormInputs>({
        defaultValues: {
            NomPays: ''
        },
        mode: 'onChange', // Valide les champs au changement
        reValidateMode: 'onChange' // Re-valide les champs au changement
    });

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.body.style.overflow = 'hidden';
            document.addEventListener('keydown', handleKeyDown);
            if (isEditing && origineId) {
                const origine = getOrigineById(origineId);
                if (origine) {
                    reset({
                        NomPays: origine.nomPays
                    });
                }
            } else {
                reset({ NomPays: '' });
            }
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, origineId, isEditing, getOrigineById, reset, onClose]);

    const onSubmit: SubmitHandler<OrigineFormInputs> = async (data) => {
        setSubmitError(null);
        setIsSubmitting(true);

        try {
            if (isEditing && origineId) {
                await updateOrigine({
                    idOrigine: parseInt(origineId),
                    nomPays: data.NomPays
                });
            } else {
                await addOrigine({ nomPays: data.NomPays });
            }
            
            onClose();
            MySwal.fire({
                title: 'Succès !',
                text: `L'origine a été ${isEditing ? 'mise à jour' : 'créée'} avec succès.`,
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
                background: '#334155',
                color: '#f8fafc'
            });
        } catch (error: any) {
            console.error('Erreur lors de la soumission du formulaire:', error);
            
            // Extraire le message d'erreur de la réponse de l'API
            let errorMessage = 'Une erreur est survenue lors de la soumission du formulaire';
            
            if (error.response) {
                // Erreur de réponse du serveur (4xx, 5xx)
                console.log('Réponse complète du serveur:', error.response);
                const responseData = error.response.data;
                console.log('Données de la réponse:', responseData);
                
                if (typeof responseData === 'string') {
                    // Vérifier les messages d'erreur de doublon dans différentes langues
                    const lowerCaseResponse = responseData.toLowerCase();
                    if (lowerCaseResponse.includes('already been taken') || 
                        lowerCaseResponse.includes('le nom du pays existe déjà') ||
                        lowerCaseResponse.includes('nom pays a déjà été pris') ||
                        lowerCaseResponse.includes('nom du pays existe déjà')) {
                        errorMessage = 'Ce nom de pays existe déjà. Veuillez en choisir un autre.';
                    } else {
                        errorMessage = responseData;
                    }
                } else if (responseData.message) {
                    // Vérifier les messages d'erreur de doublon dans différentes langues
                    if (typeof responseData.message === 'string') {
                        const lowerCaseMessage = responseData.message.toLowerCase();
                        if (lowerCaseMessage.includes('already been taken') || 
                            lowerCaseMessage.includes('le nom du pays existe déjà') ||
                            lowerCaseMessage.includes('nom pays a déjà été pris') ||
                            lowerCaseMessage.includes('nom du pays existe déjà')) {
                            errorMessage = 'Ce nom de pays existe déjà. Veuillez en choisir un autre.';
                        } else {
                            errorMessage = responseData.message;
                        }
                    } else {
                        errorMessage = String(responseData.message);
                    }
                } else if (responseData.errors) {
                    // Gestion des erreurs de validation
                    const errorMessages = Object.entries(responseData.errors).map(([field, messages]) => {
                        // Personnalisation du message pour le champ NomPays
                        if (field === 'NomPays' && Array.isArray(messages)) {
                            const hasDuplicateError = messages.some(m => {
                                const lowerMessage = m.toLowerCase();
                                return lowerMessage.includes('already been taken') ||
                                       lowerMessage.includes('le nom du pays existe déjà') ||
                                       lowerMessage.includes('nom pays a déjà été pris') ||
                                       lowerMessage.includes('nom du pays existe déjà');
                            });
                            if (hasDuplicateError) {
                                return 'Ce nom de pays existe déjà. Veuillez en choisir un autre.';
                            }
                        }
                        return Array.isArray(messages) ? messages.join(', ') : String(messages);
                    });
                    errorMessage = errorMessages.join('\n');
                }
            } else if (error.request) {
                // La requête a été faite mais aucune réponse n'a été reçue
                errorMessage = 'Le serveur ne répond pas. Veuillez vérifier votre connexion.';
            } else if (error.message) {
                // Erreur lors de la configuration de la requête
                errorMessage = error.message;
            }
            
            setSubmitError(errorMessage);
            
            // Afficher l'erreur dans une alerte
            MySwal.fire({
                title: 'Erreur',
                text: errorMessage,
                icon: 'error',
                confirmButtonColor: '#3085d6',
                background: '#334155',
                color: '#f8fafc',
                confirmButtonText: 'OK'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const FieldWrapper: React.FC<{ label: string; htmlFor: string; error?: string; children: React.ReactNode }> = ({ label, htmlFor, error, children }) => (
        <div>
            <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
            {children}
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );

    if (!isOpen) return null;
    
    return (
        <div 
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-md transform animate-scale-up"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-5 bg-primary text-white rounded-t-xl">
                    <h2 className="text-xl font-bold">
                        {isEditing ? "Modifier l'origine" : "Créer une nouvelle origine"}
                    </h2>
                    <button onClick={onClose} className="text-blue-100 hover:text-white transition-colors" aria-label="Fermer">
                        <XCircleIcon className="w-7 h-7" />
                    </button>
                </div>
                 
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                        <FieldWrapper label="Nom du pays" htmlFor="NomPays" error={errors.NomPays?.message}>
                            <div className="relative">
                                <input
                                    id="NomPays"
                                    type="text"
                                    {...register('NomPays', { 
                                        required: "Le nom du pays est requis"
                                    })}
                                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.NomPays ? 'border-red-500 focus:ring-red-400 pr-10' : 'border-slate-300 focus:ring-primary'}`}
                                    disabled={isSubmitting}
                                    aria-invalid={errors.NomPays ? "true" : "false"}
                                    aria-describedby={errors.NomPays ? "nom-pays-error" : undefined}
                                />
                                {errors.NomPays && (
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                                    </div>
                                )}
                            </div>
                        </FieldWrapper>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-4 p-5 bg-slate-50 border-t border-slate-200 rounded-b-xl">
                        <button type="button" onClick={onClose} className="bg-white border border-slate-300 text-slate-700 px-6 py-2 rounded-lg hover:bg-slate-50 text-sm font-medium transition-colors">
                            Annuler
                        </button>
                        <button 
                            type="submit" 
                            className={`flex items-center justify-center bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-600 text-sm font-medium transition-colors shadow-sm hover:shadow-md ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {isEditing ? 'Mise à jour...' : 'Création...'}
                                </>
                            ) : isEditing ? 'Mettre à jour' : "Créer l'origine"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OrigineFormModal;