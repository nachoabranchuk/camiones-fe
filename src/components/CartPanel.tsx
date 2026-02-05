import { useCart } from "../contexts/CartContext";
import { pedidosApi } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";

interface CartPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartPanel: React.FC<CartPanelProps> = ({ isOpen, onClose }) => {
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice } =
    useCart();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mesaId, setMesaId] = useState<number>(1);

  const handleSubmitOrder = async () => {
    if (!user || items.length === 0) return;

    setIsSubmitting(true);
    try {
      const detallesPedido = items.map((item) => ({
        cantidad: item.cantidad,
        precioUnitario: item.producto.precio,
        producto: {
          id: item.producto.id,
        },
      }));

      await pedidosApi.create({
        mesaId,
        detallesPedido,
        user: { id: user.id },
      });

      clearCart();
      onClose();
      alert("Pedido enviado exitosamente");
    } catch (error) {
      console.error("Error al enviar pedido:", error);
      alert("Error al enviar el pedido");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={onClose}
      />
      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col lg:relative lg:max-w-sm lg:shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">Carrito</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 lg:hidden"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>Tu carrito está vacío</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.producto.id}
                  className="flex items-start justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {item.producto.nombre}
                    </h3>
                    <p className="text-sm text-gray-500">
                      ${item.producto.precio.toFixed(2)} c/u
                    </p>
                    <div className="flex items-center mt-2 space-x-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.producto.id, item.cantidad - 1)
                        }
                        className="w-8 h-8 flex items-center justify-center border rounded text-gray-600 hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="w-8 text-center">{item.cantidad}</span>
                      <button
                        onClick={() =>
                          updateQuantity(item.producto.id, item.cantidad + 1)
                        }
                        className="w-8 h-8 flex items-center justify-center border rounded text-gray-600 hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <p className="font-medium text-gray-900">
                      ${(item.producto.precio * item.cantidad).toFixed(2)}
                    </p>
                    <button
                      onClick={() => removeItem(item.producto.id)}
                      className="text-sm text-red-600 hover:text-red-800 mt-1"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-4 space-y-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>${getTotalPrice().toFixed(2)}</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mesa
              </label>
              <input
                type="number"
                min="1"
                value={mesaId}
                onChange={(e) => setMesaId(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={handleSubmitOrder}
              disabled={isSubmitting || !user}
              className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isSubmitting ? "Enviando..." : "Enviar Pedido"}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartPanel;

