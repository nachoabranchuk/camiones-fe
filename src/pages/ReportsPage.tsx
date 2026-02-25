import { useEffect } from "react";

import { choferesApi, tiposCargaApi } from "../services/api";
import { useState } from "react";
import type { Chofer, TipoCarga } from "../types";
import ReportsFilters from "./reportes/components/ReportsFilters";
import KpiCards from "./reportes/components/KpiCards";
import FacturacionMensualChart from "./reportes/components/FacturacionMensualChart";
import ViajesPorEstadoChart from "./reportes/components/ViajesPorEstadoChart";
import FacturacionPorChoferChart from "./reportes/components/FacturacionPorChoferChart";
import ViajesPorTipoCargaChart from "./reportes/components/ViajesPorTipoCargaChart";
import RendimientoKmCard from "./reportes/components/RendimientoKmCard";
import { useReports } from "../hooks/useReports";

export default function ReportsPage() {
  const [choferes, setChoferes] = useState<Chofer[]>([]);
  const [tiposCarga, setTiposCarga] = useState<TipoCarga[]>([]);

  const {
    filters,
    setFilters,
    kpis,
    facturacionMensual,
    viajesPorEstado,
    facturacionPorChofer,
    viajesPorTipoCarga,
    rendimientoKm,
    loading,
    error,
  } = useReports();

  useEffect(() => {
    choferesApi
      .getAll(true)
      .then(setChoferes)
      .catch(() => setChoferes([]));
    tiposCargaApi
      .getAll(true)
      .then(setTiposCarga)
      .catch(() => setTiposCarga([]));
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-black">Reportes</h1>
        <p className="mt-2 text-sm text-gray-600">
          Métricas y análisis de viajes y facturación
        </p>
      </div>

      <div className="space-y-6">
        <ReportsFilters
          filters={filters}
          onApply={setFilters}
          choferes={choferes}
          tiposCarga={tiposCarga}
        />

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">KPIs</h2>
          <KpiCards kpis={kpis} loading={loading} />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <FacturacionMensualChart
            data={facturacionMensual}
            loading={loading}
          />
          <ViajesPorEstadoChart data={viajesPorEstado} loading={loading} />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <FacturacionPorChoferChart
            data={facturacionPorChofer}
            loading={loading}
          />
          <ViajesPorTipoCargaChart
            data={viajesPorTipoCarga}
            loading={loading}
          />
        </div>

        <div>
          <RendimientoKmCard data={rendimientoKm} loading={loading} />
        </div>
      </div>
    </div>
  );
}
