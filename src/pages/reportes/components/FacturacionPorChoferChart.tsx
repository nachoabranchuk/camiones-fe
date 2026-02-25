import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface FacturacionPorChoferChartProps {
  data: Array<{ chofer: string; total: number }>;
  loading?: boolean;
}

const formatMoney = (value: number) =>
  Number(value ?? 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function FacturacionPorChoferChart({
  data,
  loading,
}: FacturacionPorChoferChartProps) {
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
        <p className="text-gray-500">No hay facturación por chofer</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Facturación por chofer
      </h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis type="number" stroke="#6b7280" fontSize={12} tickFormatter={(v) => `$${formatMoney(v)}`} />
            <YAxis type="category" dataKey="chofer" stroke="#6b7280" fontSize={11} width={75} />
            <Tooltip
              formatter={(value: number) => [`$${formatMoney(value)}`, "Total"]}
            />
            <Legend />
            <Bar dataKey="total" name="Total facturado" fill="#9A0000" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
