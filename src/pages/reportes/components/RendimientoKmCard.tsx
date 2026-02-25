import type { RendimientoKm } from "../../../types";

const formatMoney = (value: number) =>
  Number(value ?? 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

interface RendimientoKmCardProps {
  data: RendimientoKm | null;
  loading?: boolean;
}

export default function RendimientoKmCard({ data, loading }: RendimientoKmCardProps) {
  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
        <div className="h-10 bg-gray-200 rounded w-1/2" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Rendimiento por KM
      </h3>
      <p className="text-2xl font-bold text-brandRed-dark">
        ${formatMoney(data.valorPorKm)} <span className="text-sm font-normal text-gray-500">/ km</span>
      </p>
      <p className="text-xs text-gray-500 mt-1">
        Promedio de facturación por kilómetro (viajes finalizados)
      </p>
    </div>
  );
}
