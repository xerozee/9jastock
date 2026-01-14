'use client';

import { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { StockHistoryPoint, TimeRange } from '@/types/stock';
import { formatCurrency } from '@/lib/stockData';

interface StockChartProps {
  data: StockHistoryPoint[];
  symbol: string;
}

const timeRanges: TimeRange[] = ['1W', '1M', '3M', '6M', '1Y', 'ALL'];

export default function StockChart({ data, symbol }: StockChartProps) {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('1M');

  const filteredData = useMemo(() => {
    const today = new Date();
    let startDate: Date;

    switch (selectedRange) {
      case '1D':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 1);
        break;
      case '1W':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 7);
        break;
      case '1M':
        startDate = new Date(today);
        startDate.setMonth(today.getMonth() - 1);
        break;
      case '3M':
        startDate = new Date(today);
        startDate.setMonth(today.getMonth() - 3);
        break;
      case '6M':
        startDate = new Date(today);
        startDate.setMonth(today.getMonth() - 6);
        break;
      case '1Y':
        startDate = new Date(today);
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      case 'ALL':
      default:
        return data;
    }

    return data.filter((point) => new Date(point.date) >= startDate);
  }, [data, selectedRange]);

  const chartData = useMemo(() => {
    return filteredData.map((point) => ({
      ...point,
      displayDate: new Date(point.date).toLocaleDateString('en-NG', {
        month: 'short',
        day: 'numeric',
      }),
    }));
  }, [filteredData]);

  const isPositive = useMemo(() => {
    if (chartData.length < 2) return true;
    return chartData[chartData.length - 1].close >= chartData[0].close;
  }, [chartData]);

  const minValue = useMemo(() => {
    return Math.min(...chartData.map((d) => d.low)) * 0.98;
  }, [chartData]);

  const maxValue = useMemo(() => {
    return Math.max(...chartData.map((d) => d.high)) * 1.02;
  }, [chartData]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{symbol} Price Chart</h3>
        <div className="flex space-x-1">
          {timeRanges.map((range) => (
            <button
              key={range}
              onClick={() => setSelectedRange(range)}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                selectedRange === range
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={isPositive ? '#059669' : '#dc2626'}
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor={isPositive ? '#059669' : '#dc2626'}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="displayDate"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis
              domain={[minValue, maxValue]}
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
              tickFormatter={(value) => `₦${value.toFixed(0)}`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-500">{data.date}</p>
                      <p className="text-sm">
                        <span className="text-gray-500">Open:</span>{' '}
                        <span className="font-medium">{formatCurrency(data.open)}</span>
                      </p>
                      <p className="text-sm">
                        <span className="text-gray-500">High:</span>{' '}
                        <span className="font-medium">{formatCurrency(data.high)}</span>
                      </p>
                      <p className="text-sm">
                        <span className="text-gray-500">Low:</span>{' '}
                        <span className="font-medium">{formatCurrency(data.low)}</span>
                      </p>
                      <p className="text-sm">
                        <span className="text-gray-500">Close:</span>{' '}
                        <span className="font-medium">{formatCurrency(data.close)}</span>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="close"
              stroke={isPositive ? '#059669' : '#dc2626'}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorPrice)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
