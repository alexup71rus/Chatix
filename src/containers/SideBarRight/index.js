import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
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
            return <div>
                <DialogContainer
                    loc={ev}
                    watchOnlineStatus={watchOnlineStatus}
                />
            </div>
        }} />
    </div>;
}

export default SideBarRight;