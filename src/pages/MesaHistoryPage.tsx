import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { mesasApi, ticketsApi } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import type { Mesa, Ticket } from "../types";

const MesaHistoryPage = () => {
  const { numeroMesa } = useParams<{ numeroMesa: string }>();
  const navigate = useNavigate();
  const { hasAccessToAccion } = useAuth();
  const mesaNum = parseInt(numeroMesa || "0", 10);
  const [mesa, setMesa] = useState<Mesa | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  /** Ticket en el modal de previsualización */
  const [ticketPreview, setTicketPreview] = useState<Ticket | null>(null);
  /** Ticket a imprimir: se renderiza en un div oculto y al imprimir solo se ve ese contenido */
  const [ticketToPrint, setTicketToPrint] = useState<Ticket | null>(null);

  useEffect(() => {
    if (!ticketToPrint) return;
    const timer = setTimeout(() => {
      const html = document.documentElement;
      const body = document.body;
      const prevHtmlZoom = html.style.zoom;
      const prevBodyZoom = body.style.zoom;
      html.style.zoom = "100%";
      body.style.zoom = "100%";
      window.print();
      const restore = () => {
        html.style.zoom = prevHtmlZoom;
        body.style.zoom = prevBodyZoom;
      };
      window.addEventListener("afterprint", restore, { once: true });
    }, 150);
    const onAfterPrint = () => setTicketToPrint(null);
    window.addEventListener("afterprint", onAfterPrint);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("afterprint", onAfterPrint);
    };
  }, [ticketToPrint]);

  useEffect(() => {
    if (mesaNum <= 0) {
      setError("Número de mesa inválido");
      setLoading(false);
      return;
    }
    loadData();
  }, [mesaNum]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const mesas = await mesasApi.getAll();
      const found = mesas.find((m) => m.numero === mesaNum);
      if (!found) {
        setError("Mesa no encontrada");
        setMesa(null);
        setTickets([]);
        return;
      }
      setMesa(found);
      const data = await ticketsApi.getByMesa(found.idmesa);
      // Ordenar del más reciente al más viejo (por si el API no lo devuelve así)
      const sorted = (data || []).sort(
        (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
      );
      setTickets(sorted);
    } catch (err: unknown) {
      console.error("Error loading data:", err);
      setError("Error al cargar el historial");
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPrintPreview = (ticket: Ticket) => {
    setTicketPreview(ticket);
  };

  const handleClosePreview = () => setTicketPreview(null);

  const handlePrintFromModal = () => {
    if (!ticketPreview) return;
    setTicketToPrint(ticketPreview);
    setTicketPreview(null);
  };

  const renderTicketContent = (ticket: Ticket, printClass: boolean) => (
    <>
      <h2
        className={
          printClass
            ? "ticket-title text-center"
            : "text-center font-bold text-sm mb-0.5"
        }
      >
        Bar App - Ticket
      </h2>
      <p
        className={
          printClass ? "ticket-mesa text-center" : "text-center text-xs mb-1"
        }
      >
        Mesa {mesa?.numero ?? "?"}
      </p>
      <hr
        className={
          printClass
            ? "ticket-line"
            : "border-t border-dashed border-gray-400 my-1"
        }
      />
      <p className={printClass ? "" : "text-xs my-0.5"}>
        <strong>Ticket #{ticket.idticket}</strong>
      </p>
      <p className={printClass ? "" : "text-xs my-0.5"}>
        {new Date(ticket.fecha).toLocaleString("es-AR")}
      </p>
      <hr
        className={
          printClass
            ? "ticket-line"
            : "border-t border-dashed border-gray-400 my-1"
        }
      />
      {ticket.pedido != null ? (
        <>
          <p className={printClass ? "ticket-pedido-header" : "text-xs my-0.5"}>
            <strong>Pedido #{ticket.pedido.idpedido}</strong>
          </p>
          <hr
            className={
              printClass
                ? "ticket-line"
                : "border-t border-dashed border-gray-400 my-1"
            }
          />
          {ticket.pedido.detallespedido &&
          ticket.pedido.detallespedido.length > 0 ? (
            <div className={printClass ? "ticket-items" : "text-xs"}>
              {ticket.pedido.detallespedido.map((d) => (
                <div
                  key={d.idDetalle ?? d.producto?.id ?? Math.random()}
                  className={
                    printClass
                      ? "ticket-item-row"
                      : "flex justify-between gap-2 my-0.5"
                  }
                >
                  <span
                    className={
                      printClass
                        ? "ticket-item-name"
                        : "flex-1 truncate max-w-[45mm]"
                    }
                  >
                    {d.producto?.nombre ?? "—"}
                  </span>
                  <span className={printClass ? "ticket-item-qty" : "shrink-0"}>
                    x{d.cantidad}
                  </span>
                  <span
                    className={
                      printClass
                        ? "ticket-item-sub"
                        : "shrink-0 text-right min-w-[14mm]"
                    }
                  >
                    ${((d.cantidad ?? 0) * (d.precioUnitario ?? 0)).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className={printClass ? "ticket-items" : "text-xs"}>
              (Sin ítems)
            </p>
          )}
        </>
      ) : null}
      <hr
        className={
          printClass
            ? "ticket-line"
            : "border-t border-dashed border-gray-400 my-1"
        }
      />
      <p
        className={
          printClass
            ? "ticket-total text-right"
            : "text-right font-bold text-xs mt-0.5"
        }
      >
        Total: ${Number(ticket.total).toFixed(2)}
      </p>
      <hr
        className={
          printClass
            ? "ticket-line"
            : "border-t border-dashed border-gray-400 my-1"
        }
      />
    </>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Estilos para imprimir: solo el ticket (navbar y resto de la página ocultos) */}
      <style>
        {`
          @media print {
            /* Una sola página alta para que el ticket no se parta en 2 hojas */
            @page {
              size: 80mm 1000mm;
              margin: 4mm;
            }
            /* Ocultar todo (navbar, layout, contenido) y mostrar solo el ticket */
            body * { visibility: hidden !important; }
            #ticket-print-only,
            #ticket-print-only * { visibility: visible !important; }
            body { margin: 0 !important; padding: 0 !important; }
            html, body { height: auto !important; overflow: visible !important; }
            #ticket-print-only {
              display: block !important;
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 72mm !important;
              max-width: 72mm !important;
              min-height: auto !important;
              margin: 0 !important;
              padding: 1mm 0 !important;
              background: white !important;
              font-family: "Courier New", Courier, monospace !important;
              font-size: 8pt !important;
              line-height: 1.1 !important;
              color: black !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            #ticket-print-only .ticket-title { font-size: 10pt !important; font-weight: bold !important; margin: 0 0 0.5mm 0 !important; }
            #ticket-print-only .ticket-mesa { font-size: 8pt !important; margin: 0 0 1mm 0 !important; }
            #ticket-print-only .ticket-line { border: none !important; border-top: 1px dashed #333 !important; margin: 0.5mm 0 !important; }
            #ticket-print-only p { margin: 0.5mm 0 !important; }
            #ticket-print-only .ticket-pedido-header { font-size: 8pt !important; margin: 0 !important; }
            #ticket-print-only .ticket-total { font-size: 9pt !important; font-weight: bold !important; margin: 0.5mm 0 0 !important; }
            #ticket-print-only .ticket-items { font-size: 7pt !important; }
            #ticket-print-only .ticket-item-row { display: flex !important; justify-content: space-between !important; margin: 0.3mm 0 !important; }
            #ticket-print-only .ticket-item-name { flex: 1 !important; overflow: hidden !important; text-overflow: ellipsis !important; white-space: nowrap !important; max-width: 45mm !important; }
            #ticket-print-only .ticket-item-qty { margin: 0 2mm !important; }
            #ticket-print-only .ticket-item-sub { min-width: 14mm !important; text-align: right !important; }
          }
        `}
      </style>
      {/* Contenido del ticket para imprimir: dimensiones de recibo real (80mm) */}
      {ticketToPrint && (
        <div
          id="ticket-print-only"
          className="fixed -left-[9999px] top-0 font-mono text-black bg-white"
          style={{
            width: "72mm",
            maxWidth: "72mm",
            padding: "4mm 0",
            fontSize: "9pt",
          }}
          aria-hidden="true"
        >
          {renderTicketContent(ticketToPrint, true)}
        </div>
      )}

      {/* Modal de previsualización del ticket */}
      {ticketPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={handleClosePreview}
          role="dialog"
          aria-modal="true"
          aria-labelledby="ticket-preview-title"
        >
          <div
            className="bg-white rounded-lg shadow-xl max-h-[90vh] overflow-auto flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2
                id="ticket-preview-title"
                className="text-lg font-semibold text-gray-900"
              >
                Vista previa del ticket
              </h2>
              <button
                type="button"
                onClick={handleClosePreview}
                className="p-1 text-gray-500 hover:text-gray-700 rounded"
                aria-label="Cerrar"
              >
                <svg
                  className="w-5 h-5"
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
            <div className="p-6 overflow-auto flex-1 flex justify-center">
              <div
                className="font-mono text-black bg-white border border-gray-300 rounded p-4 shadow-inner"
                style={{ width: "72mm", maxWidth: "72mm", fontSize: "10pt" }}
              >
                {renderTicketContent(ticketPreview, false)}
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 flex gap-3 justify-end">
              <button
                type="button"
                onClick={handleClosePreview}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={handlePrintFromModal}
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg"
              >
                Imprimir
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="screen-only">
        <div className="flex items-center justify-between mb-6">
          <div>
            <button
              onClick={() => navigate("/mesas")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Volver a Mesas
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              Historial de tickets - Mesa {mesaNum}
            </h1>
            <p className="text-gray-600 mt-1">
              Últimos 5 tickets para reimprimir
            </p>
          </div>
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Actualizar
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{error}</p>
            <button
              onClick={() => setError("")}
              className="text-red-600 underline text-sm mt-1"
            >
              Cerrar
            </button>
          </div>
        )}

        {!mesa ? null : tickets.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <svg
              className="w-16 h-16 mx-auto text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-gray-500">
              No hay tickets registrados para esta mesa
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Los tickets se generan al imprimir la cuenta de un pedido
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <div
                key={ticket.idticket}
                className="bg-white rounded-lg shadow border p-4 flex items-center justify-between"
              >
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Ticket #{ticket.idticket}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {new Date(ticket.fecha).toLocaleString("es-AR", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                  <p className="text-lg font-bold text-gray-900 mt-1">
                    Total: ${Number(ticket.total).toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenPrintPreview(ticket)}
                    disabled={!hasAccessToAccion("Mesas.Imprimir Ticket")}
                    className={`flex items-center justify-center p-2.5 rounded-lg ${
                      hasAccessToAccion("Mesas.Imprimir Ticket")
                        ? "text-gray-700 bg-gray-100 hover:bg-gray-200"
                        : "text-gray-400 bg-gray-50 cursor-not-allowed"
                    }`}
                    title={
                      hasAccessToAccion("Mesas.Imprimir Ticket")
                        ? "Vista previa e imprimir"
                        : "No tienes permisos para imprimir tickets"
                    }
                    aria-label="Imprimir ticket"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.75}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      viewBox="0 0 24 24"
                    >
                      <path d="M6 9V2h12v7" />
                      <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
                      <rect x="6" y="14" width="12" height="8" rx="1" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MesaHistoryPage;
