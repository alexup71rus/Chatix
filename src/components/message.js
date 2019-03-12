import React, { Component } from 'react';
import Linkify from 'react-linkify';
import { emojify } from 'react-emojione';

export const Separator = () => {
    return <div className="separator-item unselected"></div>;
}

export const DateSeparator = () => {
    return <div className="separator-item_date unselected"><b>---</b></div>;
}

export const SeparatorNoMessages = ({ name }) => {
    name = name.slice(-1) == " " ? name.slice(0, -1) : name;
    return <div className="separator-item_end unselected">Это начало истории ваших личных сообщений с <b>{name}</b>.</div>;
}

export const Message = ({ obj }) => {
    const username = obj.first_name;
    const date = obj.date;
    const text = obj.message.text;
    const readstate = obj.readstate;
    const unread = readstate ? 'message-item_unread' : '';
    const unixtime = new Date(date * 1000).toLocaleString();
    return <div className={"message-item " + unread}>
        <img className="message-item_avatar" src="https://vk.com/images/camera_200.png?ava=1" alt=""/>
        <span className="message-item_online"></span>
        <div className="message-item_contain">
            <div className="message-item-container">
                <span className="message-item_username"><b>{username}</b></span>
                <time className="message-item_time-message" title={unixtime}>{unixtime}</time>
            </div>
            <br/>
            <Linkify className="message-item_message">
                <pre className="message_text__pretty-message">
                    <Linkify>{emojify(text, { useEmoticon : true, emojiType: "emojione", convertAscii: true, convertUnicode: true, convertShortnames: true, style:{height: 22, } }) }</Linkify>
                </pre>
            </Linkify>
        </div>
    </div>;
}