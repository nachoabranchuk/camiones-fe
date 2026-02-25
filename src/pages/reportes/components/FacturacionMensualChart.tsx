import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface FacturacionMensualChartProps {
  data: Array<{ mes: string; total: number }>;
  loading?: boolean;
}

const formatMoney = (value: number) =>
  Number(value ?? 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function FacturacionMensualChart({
  data,
  loading,
}: FacturacionMensualChartProps) {
  if (loading) {
    return (
      <div className="h-80 rounded-lg border border-gray-200 bg-white p-4 shadow-sm flex items-center justify-center">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="h-80 rounded-lg border border-gray-200 bg-white p-4 shadow-sm flex items-center justify-center">
        <p className="text-gray-500">No hay datos de facturación mensual</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Facturación por mes
      </h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="mes" stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(v) => `$${formatMoney(v)}`} />
            <Tooltip
              formatter={(value: number) => [`$${formatMoney(value)}`, "Total"]}
              labelFormatter={(label) => `Mes: ${label}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="total"
              name="Total facturado"
              stroke="#9A0000"
              strokeWidth={2}
              dot={{ fill: "#9A0000" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
