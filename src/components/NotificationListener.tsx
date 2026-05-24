'use client';

import { useNotifications } from "@/app/notifications/page";

export default function NotificationListener() {
    useNotifications();
    return null;
}
