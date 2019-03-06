import { combineReducers } from 'redux';

const reducers = (state = [], action) => {
    let newState = [...state];
    switch (action.type) {
        case 'SET_MY_PROFILE_INFO':
            newState[0].me.info = { // Информация обо мне
                first_name: action.info.first_name || "first_name",
                last_name: action.message.data.last_name || "last_name",
                unread_count: 0 || 0,
                status: action.message.data.status || "",
                last_visit: action.message.data.last_visit || 1,
            };
            return [...newState];

        case 'SET_CHAT_INFO': // обновить отображение информации о чате
            return [...newState];

        case 'SET_CONVERSATIONS': // обновить отображение диалогов
            action.response.data.forEach(element => {
                const lm = JSON.parse(element.last_message);
                newState[0].conversations["id"+element.to_user_id] = {
                    key: element.id,
                    id: element.to_user_id,
                    title: element.title || lm.first_name + " " + lm.last_name || "...",
                    last_visit: +element.last_visit,
                    read_time: +element.read_time,
                    unread_count: +element.unread_count,
                    messages: [{
                        type: "first_load_message",
                        avatar: lm.avatar,
                        date: lm.date,
                        first_name: lm.first_name,
                        from_id: lm.from_id,
                        id: lm.id,
                        last_name: lm.last_name,
                        message: {text: lm.message.text, forward: lm.message.forward, attach: lm.message.attach},
                    }]
                };
            });
            return [...newState];

        case 'SET_USER_ONLINE': // обновить временной статус диалогов (онлайн)
            action.response.data.forEach(elem=>{
                newState[0].conversations["id" + elem.id].last_visit = elem.time;
            });
            return [...newState];

        case 'SET_SELECT_CHAT_ITEM': // выделить выбранный чат
            newState[0].conversation = action.chat_id           
            return [...newState];

        case 'MARK_AS_READ': // отметить все сообщения в чате как прочитанные
            if (!action.errUC && !action.errUT) {
                newState[0].conversations["id" + action.id].unread_count = 0;
                newState[0].conversations["id" + action.id].unread_time = Math.floor(Date.now() / 1000);
            } else if (action.errUC >= 0 && action.errUT >= 0) {
                newState[0].conversations["id" + action.id].unread_count = action.errUC;
                newState[0].conversations["id" + action.id].unread_time = action.errUT;
            }
            return [...newState];

        case 'SET_MESSAGES': // обновить отображение сообщений
            if (action.response.type == "push") {
                const data = action.response.event.data;
                if (!newState[0].conversations["id"+data.from_id]) { // если пользователя нет в контактах, то он добавляется
                    newState[0].conversations["id"+data.from_id] = {
                        id: data.from_id,
                        title: data.to_id ? data.title || data.first_name + " " + data.last_name || "..." : "...",
                        last_visit: -1,
                        unread_time: 0,
                        unread_count: 0,
                        messages: []
                    }
                }
                if (data.from_id != newState[0].me.id) { // удаляю старые сообщения из оперативки
                    if (newState[0].conversations["id"+data.from_id].messages.length > 41) { // очищает старые сообщения при получении нового сообщения
                        newState[0].conversations["id"+data.from_id].messages = newState[0].conversations["id"+data.from_id].messages.slice(10);
                    } else if (newState[0].conversations["id"+data.from_id].messages.length > 91) {
                        newState[0].conversations["id"+data.from_id].messages = newState[0].conversations["id"+data.from_id].messages.slice(35);
                    }
                } else {
                    if (newState[0].conversations["id"+data.from_id].messages.length > 21) { // очищает старые сообщения при отправке нового сообщения
                        newState[0].conversations["id"+data.from_id].messages = newState[0].conversations["id"+data.from_id].messages.slice(5);
                    } else if (newState[0].conversations["id"+data.from_id].messages.length > 51) {
                        newState[0].conversations["id"+data.from_id].messages = newState[0].conversations["id"+data.from_id].messages.slice(25);
                    }
                }
                if (data.unread) {
                    newState[0].conversations["id"+data.from_id].unread_count++;
                    newState[0].conversations["id"+data.from_id].unread_time = data.date;
                }
                if (!newState[0].conversations["id"+data.from_id].messages.length) {
                    newState[0].conversations["id"+data.from_id].messages = [{
                        type: "push_message",
                        avatar: data.avatar || "",
                        date: data.date,
                        first_name: data.first_name,
                        from_id: data.from_id,
                        id: data.id,
                        last_name: data.last_name,
                        message: {text: data.message.text, forward: data.message.forward, attach: data.message.attach},
                    }];
                } else {
                    newState[0].conversations["id"+data.from_id].messages.push({
                        type: "push_message",
                        avatar: data.avatar || "",
                        date: data.date,
                        first_name: data.first_name,
                        from_id: data.from_id,
                        id: data.id,
                        last_name: data.last_name,
                        message: {text: data.message.text, forward: data.message.forward, attach: data.message.attach},
                    });
                }
            } else if (action.response.type == "separator_no-messages") {
                newState[0].conversations["id"+action.response.id].messages.unshift({
                    type: "separator_no-messages"
                });
            } else if (action.response.type == "separator_date") { // не доделано
                newState[0].conversations["id"+action.response.id].messages.unshift({
                    type: "separator_date",
                    date: "..."
                });
            } else if (action.response.type == "replace_title") {
                newState[0].conversations["id"+action.response.response.data.id].title = action.response.response.data.title;
            } else if (action.response.type == "lazy_load") {
                const data = action.response.event.data.reverse();
                const chat = newState[0].conversations["id"+action.response.id];
                if (chat && data) {
                    const newMessages = data.map(obj=>{
                        return {
                            type: "load_message",
                            avatar: obj.avatar || "",
                            date: obj.date,
                            unread_time: obj.message.read_state,
                            first_name: obj.first_name,
                            from_id: obj.from_id,
                            id: obj.id,
                            last_name: obj.last_name,
                            message: {text: obj.message.text, forward: obj.message.forward, attach: obj.message.attach},
                        }
                    });
                    newState[0].conversations["id"+action.response.id].messages.unshift(...newMessages);
                }
            }
            return [...newState];

        default:
            return state;
    }
}

export default reducers;