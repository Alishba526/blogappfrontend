'use client';

import { useNotifications } from "@/hooks/use-notifications";

export default function NotificationListener() {
    useNotifications();
    return null;
}
