import React from 'react';

let uid = "";
export const SidebarSearch = ({ conversations, conversationsSearch, routeLocation }) => {
    return <div className="sidebar-search">
    <input
    className="sidebar-search_input"
    placeholder="Поиск собеседников"
    onKeyUp={ev=>{
        if (ev.target.value.slice(0,1) == "#" && ev.target.value.length == 1 && uid === "") {
            if (routeLocation.location.hash) {
                uid = routeLocation.location.hash;
            }
        } else if (ev.target.value.length === 0 && uid) {
            routeLocation.history.push(`/id${uid}`);
            uid = "";
        }
        if (ev.target.value.slice(0,1) == "#" && ev.target.value.length >= 1 && Number.isInteger(+ev.target.value.slice(1))) {
            routeLocation.history.push(`/id#${ev.target.value.slice(1)}`);
        } else {
            conversationsSearch(ev.target.value);
        }
    }} />
        <i className="fas sidebar-search_icon fa-search"></i>
    </div>;
}

export const DialogSearch = ({ conversations, messagesSearch }) => {
    return <div className="dialog-search">
    <input
    className="dialog-search_input"
    placeholder="Поиск по чату"
    onKeyUp={ev=>messagesSearch(ev.target.value)} />
        <i className="fas dialog-search_icon fa-search"></i>
    </div>;
}