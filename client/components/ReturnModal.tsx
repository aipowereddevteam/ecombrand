'use client';
import { useState } from 'react';
import { X, Camera } from 'lucide-react';

interface ReturnModalProps {
    order: any;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (returnRequest: any) => Promise<void>;
}

const ReturnModal = ({ order, isOpen, onClose, onSubmit }: ReturnModalProps) => {
    const [selectedItems, setSelectedItems] = useState<{ [key: string]: number }>({});
    const [reason, setReason] = useState('');
    const [condition, setCondition] = useState('New');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleQuantityChange = (orderItemId: string, qty: number, max: number) => {
        if (qty < 0) qty = 0;
        if (qty > max) qty = max;
        
        setSelectedItems(prev => {
            const next = { ...prev };
            if (qty === 0) delete next[orderItemId];
            else next[orderItemId] = qty;
            return next;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (Object.keys(selectedItems).length === 0) {
            alert('Please select at least one item to return');
            return;
        }
        if (!reason) {
            alert('Please provide a reason');
            return;
        }

        setLoading(true);
        const itemsToReturn = Object.entries(selectedItems).map(([orderItemId, quantity]) => {
             // Find original item to get product ID if needed, but endpoint just needs orderItemId usually?
             // My implementation in returnController uses orderItemId.
             // But let's pass what matches the backend expectation.
             return {
                 orderItemId,
                 quantity,
                 reason, // Global reason for now
                 condition
             }
        });

        await onSubmit({
            orderId: order._id,
            items: itemsToReturn,
            reason // Global reason fallback
        });
        setLoading(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold font-outfit">Request Return</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-4">
                        <label className="text-sm font-semibold text-gray-700">Select Items to Return</label>
                        {order.orderItems.map((item: any) => (
                            <div key={item._id} className="flex items-center gap-4 p-4 border rounded-xl hover:border-gray-300 transition-colors">
                                <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                                <div className="flex-1">
                                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                                    <p className="text-sm text-gray-500">Size: {item.size} | Price: ₹{item.price}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500">Qty:</span>
                                    <input 
                                        type="number" 
                                        min="0"
                                        max={item.quantity}
                                        value={selectedItems[item._id] || 0}
                                        onChange={(e) => handleQuantityChange(item._id, parseInt(e.target.value), item.quantity)}
                                        className="w-16 p-2 border rounded-lg text-center font-medium focus:ring-2 focus:ring-black focus:outline-none"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Reason for Return</label>
                            <select 
                                value={reason} 
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-black focus:outline-none bg-white"
                                required
                            >
                                <option value="">Select a reason</option>
                                <option value="Size issue">Size issue</option>
                                <option value="Defective">Defective product</option>
                                <option value="Wrong item">Wrong item received</option>
                                <option value="Not as expected">Not as expected</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Item Condition</label>
                            <div className="flex gap-4">
                                {['New', 'Opened', 'Damaged'].map((c) => (
                                    <label key={c} className="flex items-center gap-2 cursor-pointer">
                                        <input 
                                            type="radio" 
                                            name="condition" 
                                            value={c}
                                            checked={condition === c}
                                            onChange={(e) => setCondition(e.target.value)}
                                            className="w-4 h-4 text-black focus:ring-black"
                                        />
                                        <span className="text-gray-700">{c}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                         <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                             <h4 className="text-sm font-medium text-gray-900 mb-2">Refund Estimate</h4>
                             <div className="flex justify-between items-center">
                                 <span className="text-gray-500">Total Refund Amount</span>
                                 <span className="text-lg font-bold text-gray-900">
                                     ₹{Object.entries(selectedItems).reduce((acc, [id, qty]) => {
                                         const item = order.orderItems.find((i: any) => i._id === id);
                                         return acc + (item ? item.price * qty : 0);
                                     }, 0)}
                                 </span>
                             </div>
                             <p className="text-xs text-gray-400 mt-2">*Final refund amount may vary based on policy and inspection.</p>
                         </div>
                    </div>

                    <div className="pt-4 border-t sticky bottom-0 bg-white">
                        <button 
                            type="submit" 
                            disabled={loading || Object.keys(selectedItems).length === 0}
                            className="w-full py-4 bg-black text-white rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {loading ? 'Submitting Request...' : 'Confirm Return'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReturnModal;
