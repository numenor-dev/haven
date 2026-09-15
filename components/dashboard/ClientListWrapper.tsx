'use client';

import { useIsMobile } from './hooks/useIsMobile';
import ClientList from './ClientList';
import type { ChatRecordsListItem } from '@/types/types';
import ClientListMobile from './ClientListMobile';

export default function ClientListWrapper({ chats }: { chats: ChatRecordsListItem[] }) {
    const isMobile = useIsMobile();

    if (isMobile) {
        return <ClientListMobile chats={chats} />;
    }

    return <ClientList chats={chats} />;
}