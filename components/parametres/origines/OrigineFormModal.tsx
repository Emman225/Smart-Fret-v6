import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Origine } from '../../../types';

interface OrigineFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Origine, 'IdOrigine'>) => Promise<void>;
  title: string;
  submitButtonText: string;
  initialData?: Origine | null;
  loading?: boolean;
}

const OrigineFormModal: React.FC<OrigineFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  submitButtonText,
  initialData,
  loading = false,
}) => {
  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm<Omit<Origine, 'IdOrigine'>>({
    defaultValues: {
      nomPays: '',
    },
  });

  // Réinitialiser le formulaire lorsque les données initiales changent
  useEffect(() => {
    if (initialData) {
      setValue('nomPays', initialData.nomPays);
    } else {
      reset();
    }
  }, [initialData, setValue, reset]);

  const handleFormSubmit = async (data: Omit<Origine, 'IdOrigine'>) => {
    try {
      await onSubmit(data);
      onClose();
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire:', error);
    }
  };

  return (
    <Transition.Root show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div className="flex items-center justify-between px-5 py-4 sm:px-6 bg-primary text-white">
                  <Dialog.Title as="h3" className="text-lg font-semibold">
                    {title}
                  </Dialog.Title>
                  <button
                    type="button"
                    className="text-blue-100 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary focus:ring-white rounded-full"
                    onClick={onClose}
                    aria-label="Fermer"
                  >
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                
                <div className="px-4 pb-4 pt-5 sm:p-6 sm:pb-6">
                  <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                    <div>
                      <label htmlFor="nomPays" className="block text-sm font-medium text-gray-700">
                        Nom du pays <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="nomPays"
                        {...register('nomPays', { required: 'Le nom du pays est requis' })}
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                          errors.nomPays ? 'border-red-500' : ''
                        }`}
                        placeholder="Entrez le nom du pays"
                      />
                      {errors.nomPays && (
                        <p className="mt-1 text-sm text-red-600">{errors.nomPays.message}</p>
                      )}
                    </div>
                    
                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                      <button
                        type="submit"
                        disabled={loading}
                        className={`inline-flex w-full justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:col-start-2 sm:text-sm ${
                          loading ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                      >
                        {loading ? 'Traitement...' : submitButtonText}
                      </button>
                      <button
                        type="button"
                        className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm"
                        onClick={onClose}
                        disabled={loading}
                      >
                        Annuler
                      </button>
                    </div>
                  </form>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default OrigineFormModal;
