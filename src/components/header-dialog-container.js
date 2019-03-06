import React, { Component } from 'react';
import { DialogSearch } from '../components/search';

export const HeaderDialogContainer = () => {
    return <div className="dialog-header">
        <span className="dialog-header_left-container">
            <b>Username</b>
            <br/>
            <span>online</span>
        </span>
        <div className="dialog-header_online"></div>
        <span className="dialog-header_right-container">
            <DialogSearch />
        </span>
    </div>;
}