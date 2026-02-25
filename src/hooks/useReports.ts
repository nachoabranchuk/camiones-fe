import { useState, useEffect, useCallback } from "react";
import { reportesApi } from "../services/api";
import type {
  ReportesFilters,
  ReportesKpis,
  FacturacionMensualItem,
  ViajesPorEstadoItem,
  FacturacionPorChoferItem,
  ViajesPorTipoCargaItem,
  RendimientoKm,
} from "../types";

function defaultDateRange(): { fechaDesde: string; fechaHasta: string } {
  const now = new Date();
  const hasta = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const desde = new Date(hasta);
  desde.setMonth(desde.getMonth() - 6);
  return {
    fechaDesde: desde.toISOString().slice(0, 10),
    fechaHasta: hasta.toISOString().slice(0, 10),
  };
}

export function useReports(initialFilters?: ReportesFilters) {
  const def = defaultDateRange();
  const [filters, setFilters] = useState<ReportesFilters>({
    fechaDesde: initialFilters?.fechaDesde ?? def.fechaDesde,
    fechaHasta: initialFilters?.fechaHasta ?? def.fechaHasta,
    choferId: initialFilters?.choferId ?? "",
    estado: initialFilters?.estado ?? "",
    tipoCargaId: initialFilters?.tipoCargaId ?? "",
  });

  const [kpis, setKpis] = useState<ReportesKpis | null>(null);
  const [facturacionMensual, setFacturacionMensual] = useState<
    FacturacionMensualItem[]
  >([]);
  const [viajesPorEstado, setViajesPorEstado] = useState<
    ViajesPorEstadoItem[]
  >([]);
  const [facturacionPorChofer, setFacturacionPorChofer] = useState<
    FacturacionPorChoferItem[]
  >([]);
  const [viajesPorTipoCarga, setViajesPorTipoCarga] = useState<
    ViajesPorTipoCargaItem[]
  >([]);
  const [rendimientoKm, setRendimientoKm] = useState<RendimientoKm | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const params = {
    ...filters,
    choferId: filters.choferId || undefined,
    estado: filters.estado || undefined,
    tipoCargaId: filters.tipoCargaId || undefined,
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        kpisRes,
        facturacionMensualRes,
        viajesPorEstadoRes,
        facturacionPorChoferRes,
        viajesPorTipoCargaRes,
        rendimientoKmRes,
      ] = await Promise.all([
        reportesApi.getKpis(params),
        reportesApi.getFacturacionMensual(params),
        reportesApi.getViajesPorEstado(params),
        reportesApi.getFacturacionPorChofer(params),
        reportesApi.getViajesPorTipoCarga(params),
        reportesApi.getRendimientoKm(params),
      ]);
      setKpis(kpisRes);
      setFacturacionMensual(facturacionMensualRes);
      setViajesPorEstado(viajesPorEstadoRes);
      setFacturacionPorChofer(facturacionPorChoferRes);
      setViajesPorTipoCarga(viajesPorTipoCargaRes);
      setRendimientoKm(rendimientoKmRes);
    } catch (e) {
      setError((e as Error).message ?? "Error al cargar reportes");
    } finally {
      setLoading(false);
    }
  }, [
    filters.fechaDesde,
    filters.fechaHasta,
    filters.choferId,
    filters.estado,
    filters.tipoCargaId,
  ]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const applyFilters = useCallback((newFilters: ReportesFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  return {
    filters,
    setFilters: applyFilters,
    kpis,
    facturacionMensual,
    viajesPorEstado,
    facturacionPorChofer,
    viajesPorTipoCarga,
    rendimientoKm,
    loading,
    error,
    refetch: fetchAll,
  };
}
