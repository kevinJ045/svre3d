import * as React from "react";

export const Tab = (
  { tab, children, activeTab, setActiveTab }
  :
  { tab: string, activeTab: string, setActiveTab: (tab: string) => void, children?: any }) => {
  const handleClick = () => {
    setActiveTab(tab);
  };

  return (
    <div className={"sidebar-item tab "+(activeTab == tab ? 'active' : '')} onClick={handleClick}>
      {children}
    </div>
  );
};

// Tab pane component
export const TabPane = ({ tab, activeTab, children, id } : { tab: string, activeTab: string, id?: string, children?: any }) => {
  if (tab === activeTab) {
    return <div id={id} className={"tab-content "+(activeTab == tab ? 'active' : '')}>{children}</div>;
  }
  return null;
};