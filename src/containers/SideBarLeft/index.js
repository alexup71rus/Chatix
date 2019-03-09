import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import { AuthSidebar } from '../Auth/';
import ConversationPanel from './ConversationPanel/';

const SideBarLeft = (props) => {
    const { globalState } = props;
    return <div className="sidebar-left"><div className="sidebar-left-items">
        <Route exact path="/auth" render={ (ev)=>AuthSidebar(ev, globalState) } />
        <Route exact path="/id" render={ (ev)=><ConversationPanel routeLocation={ev} />} />
    </div></div>;
}

export default SideBarLeft;