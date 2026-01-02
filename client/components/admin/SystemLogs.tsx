'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, RotateCcw, ChevronLeft, ChevronRight, FileText, AlertCircle } from 'lucide-react';

interface AuditLog {
    _id: string;
    action: string;
    performedBy: string;
    entityType: string;
    targetId: string;
    timestamp: string;
    metadata?: any;
    oldValue?: any;
    newValue?: any;
    correlationId?: string;
}

export default function SystemLogs() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [stats, setStats] = useState({ total: 0 });
    
    // Filters
    const [correlationId, setCorrelationId] = useState('');
    const [action, setAction] = useState('');
    const [performedBy, setPerformedBy] = useState('');
    
    // Expanded row for details
    const [expandedRow, setExpandedRow] = useState<string | null>(null);

    const BACKEND_API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${BACKEND_API}/admin/audit-logs`, {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    page,
                    limit: 20,
                    correlationId: correlationId || undefined,
                    action: action || undefined,
                    performedBy: performedBy || undefined
                }
            });

            if (res.data.success) {
                setLogs(res.data.logs);
                setTotalPages(res.data.pages);
                setStats({ total: res.data.total });
            }
        } catch (error) {
            console.error("Failed to fetch logs", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [page]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchLogs();
    };

    const toggleExpand = (id: string) => {
        setExpandedRow(expandedRow === id ? null : id);
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <FileText className="text-blue-600" /> System Audit Logs
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Immutable ledger of all critical system actions ({stats.total} records)</p>
                </div>
                
                <button 
                    onClick={fetchLogs} 
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors ml-auto"
                    title="Refresh Logs"
                >
                    <RotateCcw size={20} />
                </button>
            </div>

            {/* Filters */}
            <form onSubmit={handleSearch} className="p-4 bg-gray-50 border-b grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder="Search Correlation ID..." 
                        value={correlationId}
                        onChange={e => setCorrelationId(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                </div>
                <div>
                     <input 
                        type="text" 
                        placeholder="Filter by Action (e.g. REFUND...)" 
                        value={action}
                        onChange={e => setAction(e.target.value)}
                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                </div>
                <div>
                     <input 
                        type="text" 
                        placeholder="Performed By (User ID)" 
                        value={performedBy}
                        onChange={e => setPerformedBy(e.target.value)}
                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                </div>
                <button 
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors shadow-sm"
                >
                    Search Logs
                </button>
            </form>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                        <tr>
                            <th className="px-6 py-3">Timestamp</th>
                            <th className="px-6 py-3">Action</th>
                            <th className="px-6 py-3">Entity</th>
                            <th className="px-6 py-3">Performed By</th>
                            <th className="px-6 py-3">Correlation ID</th>
                            <th className="px-6 py-3">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading logs...</td>
                            </tr>
                        ) : logs.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No logs found matching criteria.</td>
                            </tr>
                        ) : (
                            logs.map((log) => (
                                <>
                                    <tr key={log._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-3 whitespace-nowrap text-gray-500">
                                            {new Date(log.timestamp).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-3 font-medium text-gray-900">
                                            <span className={`px-2 py-1 rounded-full text-xs border ${
                                                log.action.includes('REFUND') ? 'bg-red-50 border-red-200 text-red-700' :
                                                log.action.includes('STOCK') ? 'bg-amber-50 border-amber-200 text-amber-700' :
                                                'bg-blue-50 border-blue-200 text-blue-700'
                                            }`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-gray-600">
                                            {log.entityType} <span className="text-gray-400 text-xs">({log.targetId?.substring(0, 8)}...)</span>
                                        </td>
                                        <td className="px-6 py-3 text-gray-600">
                                            {log.performedBy === 'SYSTEM' ? (
                                                <span className="flex items-center gap-1 text-purple-600 font-medium"><AlertCircle size={12}/> SYSTEM</span>
                                            ) : log.performedBy}
                                        </td>
                                        <td className="px-6 py-3 font-mono text-xs text-gray-500">
                                            {log.correlationId || '-'}
                                        </td>
                                        <td className="px-6 py-3">
                                            <button 
                                                onClick={() => toggleExpand(log._id)}
                                                className="text-blue-600 hover:underline text-xs"
                                            >
                                                {expandedRow === log._id ? 'Hide Data' : 'View Data'}
                                            </button>
                                        </td>
                                    </tr>
                                    {expandedRow === log._id && (
                                        <tr className="bg-gray-50">
                                            <td colSpan={6} className="px-6 py-4">
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                                                    {log.metadata && (
                                                        <div className="bg-white p-3 border rounded shadow-sm">
                                                            <strong className="block text-gray-700 mb-1">Metadata</strong>
                                                            <pre className="whitespace-pre-wrap text-gray-600">{JSON.stringify(log.metadata, null, 2)}</pre>
                                                        </div>
                                                    )}
                                                    {log.oldValue && (
                                                        <div className="bg-white p-3 border rounded shadow-sm border-l-4 border-l-red-400">
                                                            <strong className="block text-red-700 mb-1">Old Value</strong>
                                                            <pre className="whitespace-pre-wrap text-gray-600">{JSON.stringify(log.oldValue, null, 2)}</pre>
                                                        </div>
                                                    )}
                                                    {log.newValue && (
                                                        <div className="bg-white p-3 border rounded shadow-sm border-l-4 border-l-green-400">
                                                            <strong className="block text-green-700 mb-1">New Value</strong>
                                                            <pre className="whitespace-pre-wrap text-gray-600">{JSON.stringify(log.newValue, null, 2)}</pre>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t flex items-center justify-between text-sm text-gray-600">
                <span>Page {page} of {totalPages}</span>
                <div className="flex gap-2">
                    <button 
                        disabled={page === 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <button 
                        disabled={page === totalPages}
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
