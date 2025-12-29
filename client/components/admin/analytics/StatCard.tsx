
'use client';

import { ArrowUp, ArrowDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatCardProps {
    title: string;
    value: string | number;
    trend?: number;
    trendLabel?: string;
    icon?: React.ElementType;
}

export default function StatCard({ title, value, trend, trendLabel, icon: Icon }: StatCardProps) {
    const isPositive = trend && trend >= 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
        >
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-2">{value}</h3>
                </div>
                {Icon && (
                    <div className="p-2 bg-indigo-50 rounded-lg">
                        <Icon className="w-6 h-6 text-indigo-600" />
                    </div>
                )}
            </div>

            {(trend !== undefined) && (
                <div className="mt-4 flex items-center">
                    <div className={`flex items-center text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {isPositive ? <ArrowUp className="w-4 h-4 mr-1" /> : <ArrowDown className="w-4 h-4 mr-1" />}
                        {Math.abs(trend)}%
                    </div>
                    <span className="text-sm text-gray-500 ml-2">{trendLabel}</span>
                </div>
            )}
        </motion.div>
    );
}
