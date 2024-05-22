import * as React from "react";
export const Tab = ({ tab, children, activeTab, setActiveTab }) => {
    const handleClick = () => {
        setActiveTab(tab);
    };
    return (React.createElement("div", { className: "tab " + (activeTab == tab ? 'active' : ''), onClick: handleClick }, children));
};
// Tab pane component
export const TabPane = ({ tab, activeTab, children, id }) => {
    if (tab === activeTab) {
        return React.createElement("div", { id: id, className: "tab-pane " + (activeTab == tab ? 'active' : '') }, children);
    }
    return null;
};
