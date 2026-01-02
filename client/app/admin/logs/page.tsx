'use client';

import AdminSidebar from '@/components/admin/AdminSidebar';
import SystemLogs from '@/components/admin/SystemLogs';

export default function LogsPage() {
    return (
        <div className="flex h-screen bg-gray-50">
            <AdminSidebar />
            
            <main className="flex-1 overflow-y-auto">
                <div className="max-w-7xl mx-auto p-8">
                     <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-900">System Logs</h1>
                        <p className="text-gray-500">Monitor all critical system actions and financial events.</p>
                    </div>
                    
                    <SystemLogs />
                </div>
            </main>
        </div>
    );
}
