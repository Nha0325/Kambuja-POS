import { useEffect } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import useCurrent from '../hooks/auth/useCurrent';
import { api } from '../utils/config/api';

const SocketListener = () => {
    const { data: user } = useCurrent();

    useEffect(() => {
        if (!user) return; // Only connect if logged in

        // Parse base URL for socket connection
        const baseURL = api.defaults.baseURL || 'http://localhost:8080/api/v1';
        const socketUrl = baseURL.replace(/\/api\/v1\/?$/, ''); // Remove trailing /api/v1
        const socket = io(socketUrl);

        socket.on('connect', () => {
            console.log('Connected to real-time socket:', socket.id);
            // Join specific room if needed based on role
            if (user.role === 'ADMIN_MANAGER') {
                socket.emit('joinRoom', 'ADMIN_MANAGER');
            } else if (user.role === 'ADMIN') {
                socket.emit('joinRoom', 'ADMIN');
            } else if (user.role === 'CASHIER') {
                socket.emit('joinRoom', 'CASHIER');
            }
        });

        socket.on('system_alert', (alert) => {
            const toastId = `${alert.type}-${alert.createdAt}`;

            const toastBody = (
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '15px', marginBottom: '4px' }}>
                        {alert.title}
                    </div>
                    <div style={{ fontSize: '14px' }}>
                        {alert.message}
                    </div>
                </div>
            );

            // Determine which sound to play
            let soundFile = '/Soft_Bell.mp3'; // Default sound
            
            if (alert.severity === 'CRITICAL' || alert.severity === 'ERROR') {
                soundFile = '/windows-error-sound.mp3';
            } else if (alert.type === 'SALE_CREATED') {
                soundFile = '/Cha-Ching.mp3';
            } else if (alert.type === 'USER_LOGIN') {
                soundFile = '/Soft_Bell.mp3';
            }

            // Play sound
            const audio = new Audio(soundFile);
            audio.play().catch(e => console.log('Audio play failed (maybe user needs to interact with page first):', e));
            
            if (alert.severity === 'CRITICAL' || alert.severity === 'ERROR') {
                toast.error(toastBody, { id: toastId, duration: 5000 });
            } else if (alert.severity === 'WARNING') {
                toast(toastBody, { 
                    id: toastId,
                    icon: '⚠️',
                    duration: 5000
                });
            } else {
                toast.success(toastBody, { 
                    id: toastId,
                    icon: 'ℹ️',
                    duration: 4000
                });
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [user]);

    return null; // This is a logic-only component
};

export default SocketListener;
