import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { RainfallPoint } from "../shared/data";

type Props = {
  data: RainfallPoint[];
};

export default function RainfallChart({ data }: Props) {
  return (
    <section className="paper-card p-5">
      <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="field-label">Rainfall Trend</p>
          <h2 className="text-xl font-semibold">Last 12 hours</h2>
        </div>
        <p className="text-sm text-gray-500">
          Used to estimate whether commute conditions are worsening.
        </p>
      </div>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" tick={{ fontSize: 12 }} />
            <YAxis unit=" mm" tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="mm"
              stroke="#005A9C"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}