import React from 'react';

interface UploadProgressModalProps {
    progress: number;
}

export default function UploadProgressModal({ progress }: UploadProgressModalProps) {
    const isProcessing = progress >= 95;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[100] backdrop-blur-sm">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md text-center border border-gray-100">
                <h3 className="text-xl font-bold mb-6 text-gray-800">
                    {isProcessing ? 'Processing on Server...' : 'Uploading Files'}
                </h3>
                
                {isProcessing ? (
                     <div className="flex flex-col items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
                        <p className="text-gray-600 font-medium">Finalizing media uploads...</p>
                        <p className="text-sm text-gray-400 mt-2">Large videos may take a minute.</p>
                     </div>
                ) : (
                    <>
                        <div className="text-6xl font-black text-blue-600 mb-4 tracking-tighter">
                            {progress}%
                        </div>
                        
                        <div className="w-full bg-gray-100 rounded-full h-3 mb-6 overflow-hidden">
                            <div 
                                className="bg-blue-600 h-full transition-all duration-300 ease-out rounded-full"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </>
                )}
                
                <p className="text-gray-500 font-medium animate-pulse mt-4">
                    Please do not close this window.
                </p>
            </div>
        </div>
    );
}
