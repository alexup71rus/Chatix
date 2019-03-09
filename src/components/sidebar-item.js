import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';

export const DialogSidebarItem = ({conversation, isSelected}) => {
    const select = isSelected ? "sidebar-left_item__selected" : null;
    return <Link to={`/id#${conversation.id}`} className={`sidebar_left-item ${select} unselected-text`} title={`${conversation.title}`} >
        <img className="sidebar_left-item_avatar" src="https://vk.com/images/camera_200.png?ava=1" alt=""/>
        {
            conversation.last_visit == 0 ? <span className="sidebar_left-item_online"></span> : null
        }
        <div className="sidebar_left-item_contain">
            <span className="sidebar_left-item_username"><b>
            {
                conversation.title
                ? conversation.title.length > 20
                    ? conversation.title.slice(0, 16) + "..."
                    : conversation.title
                : "..."
            }</b></span>
            <br/>
            <span className="sidebar_left-item_last-message">{
                conversation.messages && conversation.messages[conversation.messages.length - 1]
                ? conversation.messages[conversation.messages.length - 1].message.text.length > 23
                    ? conversation.messages[conversation.messages.length - 1].message.text.slice(0, 20) + "..."
                    : conversation.messages[conversation.messages.length - 1].message.text
                : "..."
            }</span>
            <div className="sidebar_left-item_contain__right-contain">
                {
                    conversation.unread_count
                    ? 
                        conversation.unread_count < 100
                        ? <span className="sidebar_left-item_contain__right-contain___new-message">{conversation.unread_count}</span>
                        : <span className="sidebar_left-item_contain__right-contain___new-message">..</span>
                    : null
                }
            </div>
        </div>
    </Link>;
}