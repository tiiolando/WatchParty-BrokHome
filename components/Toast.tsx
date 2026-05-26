// Author: SyncStream Engineer
// OS support: Cross-platform
// Description: Composant Toast animé pour les notifications système

import React, { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
    message: string;
    type: ToastType;
    onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const bgClass = type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600';

    return (
        <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[300] flex items-center gap-3 px-6 py-3 rounded-full shadow-2xl animate-bounce-in border border-white/10 ${bgClass}`}>
            <span className="text-[14px] font-black uppercase italic tracking-tighter text-white">{message}</span>
            <button onClick={onClose} className="text-white/50 hover:text-white font-bold">✕</button>
        </div>
    );
};
