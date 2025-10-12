import React from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onTabChange, className = '' }: TabsProps) {
  return (
    <div className={`ot-tabs ${className}`}>
      <div className="flex overflow-x-auto border-b scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent" style={{ borderColor: 'var(--border)' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 lg:px-4 py-2 sm:py-3 
              text-xs sm:text-sm font-medium transition-colors whitespace-nowrap
              flex-shrink-0 min-w-0
              ${activeTab === tab.id
                ? 'border-b-2 text-blue-600 border-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
            style={{
              color: activeTab === tab.id ? 'var(--ot-blue-500)' : 'var(--text-muted)',
              borderBottomColor: activeTab === tab.id ? 'var(--ot-blue-500)' : 'transparent'
            }}
          >
            <span className="flex-shrink-0">
              {tab.icon}
            </span>
            <span className="hidden sm:inline truncate">
              {tab.label}
            </span>
            <span className="sm:hidden truncate">
              {tab.label.split(' ')[0]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

interface TabPanelProps {
  children: React.ReactNode;
  className?: string;
}

export function TabPanel({ children, className = '' }: TabPanelProps) {
  return (
    <div className={`ot-tab-panel ${className}`}>
      {children}
    </div>
  );
}
