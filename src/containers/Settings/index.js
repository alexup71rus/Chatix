import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import './index.scss';

export const SettingsSidebar = (ex) => {
    return <div>
        <button onClick={ex.history.goBack}>Назад</button>
    </div>
}

export const SettingsPage = () => {
    return <div>
        <p>Settings</p>
    </div>
}