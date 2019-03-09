import React from 'react';

export const SidebarSearch = (props) => {
    const { conversations, conversationsSearch, routeLocation } = props;
    return <div className="sidebar-search">
    <input
    className="sidebar-search_input"
    placeholder="Поиск собеседников"
    onChange={ev=>{
        if (ev.target.value.slice(0,1) == "#" && ev.target.value.length > 1 && Number.isInteger(+ev.target.value.slice(1))) {
            routeLocation.history.push(`/id#${ev.target.value.slice(1)}`);
        } else {
            conversationsSearch(ev.target.value);
        }
    }} />
        <i className="fas sidebar-search_icon fa-search"></i>
    </div>;
}

export const DialogSearch = (props) => {
    const { conversations, conversationsSearch } = props;
    return <div className="dialog-search">
    <input
    className="dialog-search_input"
    placeholder="Поиск по чату"
    onChange={ev=>{
        
    }} />
        <i className="fas dialog-search_icon fa-search"></i>
    </div>;
}