export const ALL_MODULES = [
    'Accounts',
    'Audit Trail',
    'Customer KYC',
    'Elock-Operation',
    'Employee Onboarding',
    'Directories',
    'Manage Orders',
    'Packing',
    'Analytics',
    'User Management',
    'QC_Module'
];

export const PERMISSION_HIERARCHY = {
    orders: {
        label: "Order Management",
        scopes: [
            { key: 'orders.view', label: 'View Orders Page' },
            { key: 'orders.tab.all', label: 'Tab: View All' },
            { key: 'orders.tab.confirmed', label: 'Tab: Confirmed (Ready to Pack)' },
            { key: 'orders.action.pack', label: 'Action: Mark Packed' },
            { key: 'orders.action.print', label: 'Action: Print Invoices' }
        ]
    },
    analytics: {
        label: "Analytics",
        scopes: [
            { key: 'analytics.view', label: 'View Dashboard' },
            { key: 'analytics.financial', label: 'Financial Reports' }
        ]
    },
    users: {
        label: "User Management",
        scopes: [
            { key: 'users.view', label: 'View Users' },
            { key: 'users.manage', label: 'Manage Roles & Access' }
        ]
    }
};
