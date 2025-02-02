import React from 'react';
import { RequestsTabs } from './RequestsTabs';
import RequestsContent from './RequestsContent';

interface RequestsPageProps {
  activeRequestTab: string;
  setActiveRequestTab: (tab: string) => void;
}

export function RequestsPage({ activeRequestTab, setActiveRequestTab }: RequestsPageProps) {
  return (
    <div className="flex flex-col h-full min-h-0">
      <RequestsTabs
        activeRequestTab={activeRequestTab}
        setActiveRequestTab={setActiveRequestTab}
      />
      <RequestsContent activeRequestTab={activeRequestTab} />
    </div>
  );
}