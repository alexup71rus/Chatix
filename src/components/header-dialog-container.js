import React, { Component } from 'react';
import { DialogSearch } from '../components/search';

export const HeaderDialogContainer = ({ globalState }) => {
    const convId = globalState[0].conversation;
    let convInfo = null;
    if (globalState[0].conversations && globalState[0].conversations[`id${convId}`]) {
        convInfo = {
            id: globalState[0].conversations[`id${convId}`].id,
            key: globalState[0].conversations[`id${convId}`].key,
            last_visit: globalState[0].conversations[`id${convId}`].last_visit,
            read_time: globalState[0].conversations[`id${convId}`].read_time,
            unread_count: globalState[0].conversations[`id${convId}`].unread_count,
            title: globalState[0].conversations[`id${convId}`].title,
        }
    }
    return <div className="dialog-header">
        <span className="dialog-header_left-container">
            <b className="dialog-header_left-container__title-dialog">
            {
                convInfo
                ? convInfo.title.length > 20
                    ? convInfo.title.slice(0, 16) + "..."
                    : convInfo.title
                : "Заголовок"
            }
            </b>
            <b className="dialog-header_left-container__id-dialog">
            {
                convInfo
                ? convInfo.id
                    ? ` #${convInfo.id}`
                    : " #"
                : " #"
            }
            </b>
            <br/>
            <span>
            {
                convInfo
                ? convInfo.last_visit == 0
                    ? "Сейчас в сети"
                    : convInfo.last_visit >= Math.floor(Date.now() / 1000) - 120
                        ? "Был(а) в сети пару минут назад"
                        : convInfo.last_visit == -1
                            ? `Не в сети`
                            : `Был(а) в сети ${new Date((convInfo.last_visit) * 1000).toLocaleString().slice(0, -3)}`
                : "..."
            }
            </span>
        </span>
        <span className="dialog-header_right-container">
            <DialogSearch />
        </span>
    </div>;
}