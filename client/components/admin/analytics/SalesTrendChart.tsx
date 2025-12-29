
'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

interface SalesData {
    _id: string; // Date string: "YYYY-MM-DD"
    totalSales: number;
    ordersCount: number;
}

interface Props {
    data: SalesData[];
}

export default function SalesTrendChart({ data }: Props) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
        >
            <h3 className="text-lg font-bold text-gray-900 mb-6">Revenue Trend</h3>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                            dataKey="_id"
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `₹${value}`}
                        />
                        <Tooltip
                            contentStyle={{ background: '#fff', border: '1px solid #eee', borderRadius: '8px' }}
                            formatter={(value: number) => [`₹${value}`, 'Revenue']}
                        />
                        <Line
                            type="monotone"
                            dataKey="totalSales"
                            stroke="#6366f1"
                            strokeWidth={3}
                            activeDot={{ r: 8, fill: '#6366f1' }}
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
}
