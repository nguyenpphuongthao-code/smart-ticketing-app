"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
} from "recharts";

interface TripChartItem {
  tripLabel: string;
  tickets: number;
  requestsCount: number;
  isHighest: boolean;
}

interface DateChartItem {
  date: string;
  tickets: number;
  requestsCount: number;
}

interface Props {
  tripData: TripChartItem[];
  dateData: DateChartItem[];
}

export function DemandCharts({ tripData, dateData }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Chart 1: Số vé đang chờ theo chuyến */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Số vé đang chờ theo chuyến tàu
            </h3>
            <p className="text-[11px] text-slate-500">
              Chỉ tính các yêu cầu có trạng thái <strong>Đang chờ</strong>
            </p>
          </div>
          <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">
            Cột vàng: Nhu cầu cao
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={tripData} margin={{ top: 20, right: 20, left: -10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="tripLabel"
                tick={{ fontSize: 11, fill: "#475569" }}
                angle={-15}
                textAnchor="end"
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#475569" }} />
              <Tooltip
                formatter={(value: any, name: any) => [
                  `${value} vé`,
                  name === "tickets" ? "Vé đang chờ" : name,
                ]}
                labelFormatter={(label) => `Chuyến: ${label}`}
              />
              <Bar dataKey="tickets" name="Số vé" radius={[6, 6, 0, 0]}>
                {tripData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.isHighest ? "#f59e0b" : "#3b82f6"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Số vé đang chờ theo ngày */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Số vé đang chờ theo ngày khởi hành
            </h3>
            <p className="text-[11px] text-slate-500">
              Phân bổ lượng vé khách đang đợi theo mốc thời gian
            </p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dateData} margin={{ top: 20, right: 20, left: -10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#475569" }}
                angle={-15}
                textAnchor="end"
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#475569" }} />
              <Tooltip
                formatter={(value: any) => [`${value} vé`, "Vé đang chờ"]}
                labelFormatter={(label) => `Ngày: ${label}`}
              />
              <Bar dataKey="tickets" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
