import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter} from 'react-router-dom';

import './index.scss';
import App from './containers/App/App';
import { Provider } from 'react-redux';
import * as serviceWorker from './serviceWorker';
import configureStore from './store/configureStore';

const initialState = [{
    modal: "",
    me: { // Информация о пользователе
        info: window.localStorage.userInfo ? JSON.parse(window.localStorage.userInfo) : {},
        hash: window.localStorage.hash,
        id: window.localStorage.id,
    },
    settings: { // Настройки приложения
        onScroll: false, // скролл вниз
        theme: 0, // Цветовая тема приложения
        language: 0, // Язык приложения
        send_keys: ['enter'],
        selected_user: 0, // Выбранный чат с пользователем
    },
    conversations_search: "",
    messages_search: "",
    conversation: {
        id: 0,
        title: "Заголовок",
        last_visit: "...",
    },
    conversations: {}
}];

const store = configureStore(initialState);

ReactDOM.render(
    <Provider store={store}>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </Provider>,
    document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
