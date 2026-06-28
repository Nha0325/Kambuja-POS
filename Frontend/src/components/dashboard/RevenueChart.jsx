import { useEffect, useRef, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;

  const row = payload[0].payload;

  return (
    <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-100 text-xs">
      <p className="font-semibold text-gray-700 mb-1">{row.date || row.name}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} style={{ color: entry.color }} className="font-medium">
          {entry.name}: {Number(entry.value || 0).toLocaleString()}
        </p>
      ))}
    </div>
  );
};

function RevenueChart({ data, isLoading }) {
  const chartRef = useRef(null);
  const [chartWidth, setChartWidth] = useState(0);
  const chartData = Array.isArray(data) ? data : [];
  const hasSales = chartData.some((item) => Number(item.totalSale || 0) > 0);

  useEffect(() => {
    if (!chartRef.current) return;

    const updateWidth = () => {
      setChartWidth(Math.floor(chartRef.current?.getBoundingClientRect().width || 0));
    };

    updateWidth();
    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(chartRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div className="min-h-[320px] min-w-0 w-full">
      <h1 className="text-lg font-semibold text-gray-800 mb-4">Sale in 30 days</h1>

      <div ref={chartRef} className="h-[300px] min-w-0 w-full">
        {isLoading && (
          <div className="flex h-full items-center justify-center text-sm text-gray-500">
            Loading chart...
          </div>
        )}

        {!isLoading && !hasSales && (
          <div className="flex h-full items-center justify-center text-sm text-gray-500">
            No sales in the last 30 days.
          </div>
        )}

        {!isLoading && hasSales && chartWidth > 0 && (
          <LineChart
            width={chartWidth}
            height={300}
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />

            <XAxis
              dataKey="name"
              tickLine={false}
              stroke="#9ca3af"
              fontSize={12}
              dy={10}
            />

            <YAxis
              tickLine={false}
              stroke="#9ca3af"
              fontSize={12}
              dx={-5}
              tickFormatter={(value) => Number(value || 0).toLocaleString()}
            />
            <YAxis yAxisId="count" orientation="right" hide />

            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={36} iconType="circle" />

            <Line
              name="Total Sale"
              type="monotone"
              dataKey="totalSale"
              stroke="#2563eb"
              activeDot={{ r: 8 }}
              strokeWidth={2}
            />

            <Line
              name="Sale Count"
              type="monotone"
              dataKey="saleCount"
              stroke="#16a34a"
              strokeWidth={2}
              yAxisId="count"
            />
          </LineChart>
        )}
      </div>
    </div>
  );
}

export default RevenueChart;
