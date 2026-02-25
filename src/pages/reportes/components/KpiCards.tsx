import type { ReportesKpis } from "../../../types";

const formatMoney = (value: number) =>
  Number(value ?? 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

interface KpiCardsProps {
  kpis: ReportesKpis | null;
  loading?: boolean;
}

export default function KpiCards({ kpis, loading }: KpiCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm animate-pulse"
          >
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
            <div className="h-8 bg-gray-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (!kpis) return null;

  const cards = [
    { label: "Total facturado", value: `$${formatMoney(kpis.totalFacturado)}`, color: "text-green-700" },
    { label: "Total viajes", value: String(kpis.totalViajes), color: "text-gray-900" },
    { label: "Promedio por viaje", value: `$${formatMoney(kpis.promedioPorViaje)}`, color: "text-gray-900" },
    { label: "KM totales", value: Number(kpis.kilometrosTotales).toLocaleString("en-US", { maximumFractionDigits: 0 }), color: "text-gray-900" },
    { label: "Peso total", value: Number(kpis.pesoTotal).toLocaleString("en-US", { maximumFractionDigits: 2 }), color: "text-gray-900" },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
        >
          <p className="text-sm text-gray-500">{card.label}</p>
          <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
}
