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

interface ViajesPorTipoCargaChartProps {
  data: Array<{ tipoCarga: string; cantidad: number }>;
  loading?: boolean;
}

export default function ViajesPorTipoCargaChart({
  data,
  loading,
}: ViajesPorTipoCargaChartProps) {
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
        <p className="text-gray-500">No hay viajes por tipo de carga</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Viajes por tipo de carga
      </h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="tipoCarga" stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip />
            <Legend />
            <Bar dataKey="cantidad" name="Cantidad" fill="#6E0000" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
