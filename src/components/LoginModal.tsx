import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Modal from './Modal';

const LoginModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { setUser } = useAuth();

  const handleLogin = () => {
    // Test login - set user with test modulos
    setUser({ 
      id: 1, 
      modulosAccesibles: ['Dashboard', 'Módulos', 'Formularios', 'Acciones', 'Grupos', 'Usuarios'] 
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Login (Testing)">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Test login component. In production, use the real login page.
        </p>
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleLogin}
            className="px-4 py-2 bg-brandRed-dark text-white rounded-md hover:bg-brandRed"
          >
            Login (Test)
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default LoginModal;

