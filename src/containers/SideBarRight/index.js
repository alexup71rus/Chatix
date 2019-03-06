import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import { SettingsPage } from '../Settings/';
import { LoginPage, RegisterPage } from '../Auth/';
import DialogContainer from './DialogContainer/';

const SideBarRight = (props) => {
    const { watchOnlineStatus } = props;
    return <div className="dialog-container">
        <Route exact path="/auth" render={ (ev)=>{
            switch (ev.location.hash) {
                case "#login":
                return <LoginPage />;

                case "#register":
                return <RegisterPage />;

                default:
                return <div></div>;
            }
        } } />
        <Route exact path="/id" render={(ev) => {
            return <DialogContainer
                loc={ev}
                watchOnlineStatus={watchOnlineStatus}
            />
        }} />
        <Route exact path="/settings" render={ (ev)=>SettingsPage(ev) } />
    </div>;
}

export default SideBarRight;