'use client';

import { useIsMobile } from './hooks/useIsMobile';
import ClientList from './ClientList';
import type { ChatRecordsListItem } from '@/types/types';

export default function ClientListWrapper({ chats }: { chats: ChatRecordsListItem[] }) {
    const isMobile = useIsMobile();

    if (isMobile) {
        return null; // <ClientListMobile chats={chats} /> when ready
    }

    return <ClientList chats={chats} />;
}