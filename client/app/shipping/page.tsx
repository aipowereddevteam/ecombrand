'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { saveShippingInfo } from '@/redux/slices/cartSlice';
import { useRouter } from 'next/navigation';
import { RootState } from '@/redux/store';

export default function ShippingPage() {
    const dispatch = useDispatch();
    const router = useRouter();
    const { shippingInfo } = useSelector((state: RootState) => state.cart);

    const [address, setAddress] = useState(shippingInfo.address || '');
    const [city, setCity] = useState(shippingInfo.city || '');
    const [state, setState] = useState(shippingInfo.state || '');
    const [country, setCountry] = useState(shippingInfo.country || 'India');
    const [pinCode, setPinCode] = useState<string | number>(shippingInfo.pinCode || '');
    const [phoneNo, setPhoneNo] = useState<string | number>(shippingInfo.phoneNo || '');

    const submitHandler = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        dispatch(saveShippingInfo({
            address,
            city,
            state,
            country,
            pinCode: Number(pinCode),
            phoneNo: Number(phoneNo)
        }));
        router.push('/order/confirm');
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Shipping Details</h2>

                <form onSubmit={submitHandler} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Address</label>
                        <input
                            type="text"
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            value={address}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setAddress(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">City</label>
                            <input
                                type="text"
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                value={city}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setCity(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">State</label>
                            <input
                                type="text"
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                value={state}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setState(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Pin Code</label>
                            <input
                                type="number"
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                value={pinCode}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setPinCode(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Phone No</label>
                            <input
                                type="number"
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                value={phoneNo}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setPhoneNo(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Country</label>
                        <select
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            value={country}
                            onChange={(e: ChangeEvent<HTMLSelectElement>) => setCountry(e.target.value)}
                        >
                            <option value="India">India</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mt-6"
                    >
                        Continue to Payment
                    </button>
                </form>
            </div>
        </div>
    );
}
