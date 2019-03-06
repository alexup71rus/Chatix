import React from 'react';
import axios from 'axios-jsonp-pro';

export class WatchOnlineStatus {
    constructor() {
        this.userStatusKeys = {};
        this.TrackOnlineStatus = function (id, userStatusKeys, setUserOnline) { // подписывает на онлайн статус конкретного пользователя
            this.state = {};
            if (userStatusKeys[id]) {
              window.cometApi.unsubscription(userStatusKeys[id]['online_key']);
              window.cometApi.unsubscription(userStatusKeys[id]['offline_key']);
            }
            this.state['online_key'] = window.cometApi.subscription(`user_status_${id}.online`, function(event) {
              setUserOnline({ data: [{ id: id, time: 0, }] });
            });
            this.state['offline_key'] = window.cometApi.subscription(`user_status_${id}.offline`, function(event) {
              setUserOnline({ data: [{ id: id, time: -1, }] });
            });
            return this.state;
        }
    }

    checkOnlineStatus(globalState, setUserOnline) { // получает временные метки всех пользователей в контактах
        const ids = Object.keys(globalState[0].conversations).map(id=>{
          id = id.slice(2);
          this.userStatusKeys[id] = new this.TrackOnlineStatus(id, this.userStatusKeys, setUserOnline);
          return id;
        });
        if (ids) {
            axios.post(`https://khodyr.ru/chatix/backend/`, { // получает временные метки всех пользователей в контактах
                request: "CHECK_ONLINE_STATUS",
                data: ids.join(',')
            })
            .then(response=>{
                setUserOnline(response);
            });
        }
    }
}




// export class WatchOnlineStatus {
//     constructor(props) {
//         this.userStatusKeys = {};
//         this.setUserOnline = this.props.setUserOnline;
//         this.globalState = this.props.globalState;
//     }

//     TrackOnlineStatus (id, userStatusKeys, setUserOnline) { // подписывает на онлайн статус конкретного пользователя
//         this.state = {};
//         if (userStatusKeys[id]) {
//           window.cometApi.unsubscription(userStatusKeys[id]['online_key']);
//           window.cometApi.unsubscription(userStatusKeys[id]['offline_key']);
//         }
//         this.state['online_key'] = window.cometApi.subscription(`user_status_${id}.online`, function(event) {
//           setUserOnline({ data: [{ id: id, time: 0, }] });
//         });
//         this.state['offline_key'] = window.cometApi.subscription(`user_status_${id}.offline`, function(event) {
//           setUserOnline({ data: [{ id: id, time: -1, }] });
//         });
//         return this.state;
//     }

//     checkOnlineStatus() { // получает временные метки всех пользователей в контактах
//         const ids = Object.keys(this.globalState[0].conversations).map(id=>{
//           id = id.slice(2);
//           this.userStatusKeys[id] = new this.TrackOnlineStatus(id, this.userStatusKeys, this.setUserOnline);
//           return id;
//         });
//         if (ids) {
//             axios.post(`https://khodyr.ru/chatix/backend/`, { // получает временные метки всех пользователей в контактах
//                 request: "CHECK_ONLINE_STATUS",
//                 data: ids.join(',')
//             })
//             .then(response=>{
//                 this.props.setUserOnline(response);
//             });
//         }
//     }
// }