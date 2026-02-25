import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface ViajesPorEstadoChartProps {
  data: Array<{ estado: string; cantidad: number }>;
  loading?: boolean;
}

const COLORS = ["#F59E0B", "#3B82F6", "#22C55E", "#EF4444"]; // amber, blue, green, red
const ESTADO_LABEL: Record<string, string> = {
  PENDIENTE: "Pendiente",
  EN_CURSO: "En curso",
  FINALIZADO: "Finalizado",
  CANCELADO: "Cancelado",
};

export default function ViajesPorEstadoChart({
  data,
  loading,
}: ViajesPorEstadoChartProps) {
  const chartData = data.filter((d) => d.cantidad > 0).map((d) => ({ ...d, name: ESTADO_LABEL[d.estado] ?? d.estado }));

  if (loading) {
    return (
      <div className="h-80 rounded-lg border border-gray-200 bg-white p-4 shadow-sm flex items-center justify-center">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  if (!chartData.length) {
    return (
      <div className="h-80 rounded-lg border border-gray-200 bg-white p-4 shadow-sm flex items-center justify-center">
        <p className="text-gray-500">No hay viajes en el período</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Viajes por estado
      </h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="cantidad"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ name, cantidad }) => `${name}: ${cantidad}`}
            >
              {chartData.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => [value, "Cantidad"]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
