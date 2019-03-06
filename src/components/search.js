import React, { Component } from 'react';


export const SidebarSearch = () => {
    return <div className="sidebar-search">
    <input
    className="sidebar-search_input"
    placeholder="Поиск собеседников"
    onChange={ev=>{
        
    }} />
        <i className="fas sidebar-search_icon fa-search"></i>
    </div>;
}

export const DialogSearch = () => {
    return <div className="dialog-search">
    <input
    className="dialog-search_input"
    placeholder="Поиск по чату"
    onChange={ev=>{
        
    }} />
        <i className="fas dialog-search_icon fa-search"></i>
    </div>;
}