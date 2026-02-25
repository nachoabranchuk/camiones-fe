import { useState } from "react";
import type { ReportesFilters } from "../../../types";
import type { Chofer, TipoCarga } from "../../../types";

const ESTADOS = [
  { value: "", label: "Todos" },
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "EN_CURSO", label: "En curso" },
  { value: "FINALIZADO", label: "Finalizado" },
  { value: "CANCELADO", label: "Cancelado" },
];

function defaultDateRange() {
  const now = new Date();
  const hasta = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const desde = new Date(hasta);
  desde.setMonth(desde.getMonth() - 6);
  return {
    fechaDesde: desde.toISOString().slice(0, 10),
    fechaHasta: hasta.toISOString().slice(0, 10),
  };
}

interface ReportsFiltersProps {
  filters: ReportesFilters;
  onApply: (f: ReportesFilters) => void;
  choferes: Chofer[];
  tiposCarga: TipoCarga[];
}

export default function ReportsFilters({
  filters,
  onApply,
  choferes,
  tiposCarga,
}: ReportsFiltersProps) {
  const def = defaultDateRange();
  const [fechaDesde, setFechaDesde] = useState(filters.fechaDesde ?? def.fechaDesde);
  const [fechaHasta, setFechaHasta] = useState(filters.fechaHasta ?? def.fechaHasta);
  const [choferId, setChoferId] = useState(filters.choferId ?? "");
  const [estado, setEstado] = useState(filters.estado ?? "");
  const [tipoCargaId, setTipoCargaId] = useState(filters.tipoCargaId ?? "");

  const handleApply = () => {
    onApply({
      fechaDesde,
      fechaHasta,
      choferId: choferId || undefined,
      estado: estado || undefined,
      tipoCargaId: tipoCargaId || undefined,
    });
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Filtros</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Desde</label>
          <input
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Hasta</label>
          <input
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Chofer</label>
          <select
            value={choferId}
            onChange={(e) => setChoferId(e.target.value)}
            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
          >
            <option value="">Todos</option>
            {choferes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.apellido}, {c.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Estado</label>
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
          >
            {ESTADOS.map((o) => (
              <option key={o.value || "all"} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Tipo de carga</label>
          <select
            value={tipoCargaId}
            onChange={(e) => setTipoCargaId(e.target.value)}
            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
          >
            <option value="">Todos</option>
            {tiposCarga.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button
            type="button"
            onClick={handleApply}
            className="w-full bg-brandRed-dark text-white px-4 py-2 rounded text-sm font-medium hover:bg-brandRed"
          >
            Aplicar filtros
          </button>
        </div>
      </div>
    </div>
  );
}
