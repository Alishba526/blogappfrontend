'use client';

import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { Bell } from 'lucide-react';
import { socket } from '@/lib/socket';
import React from 'react';

export const useNotifications = () => {
    useEffect(() => {
        socket.on('notification received', (notif: any) => {
            toast.custom((t) => (
                <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
                  <div className="flex-1 w-0 p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 pt-0.5">
                        <Bell className="h-10 w-10 text-purple-600 bg-purple-50 p-2 rounded-full" />
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-gray-900">New Notification</p>
                        <p className="mt-1 text-sm text-gray-500">{notif.message}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ));
        });
        return () => { socket.off('notification received'); };
    }, []);
};
