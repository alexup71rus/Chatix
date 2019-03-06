// import axios from 'axios-jsonp-pro';

// export const getConversations = (token) => dispatch => {
//     return axios.get(`http://chatix.khodyr.ru/backend/?request=getUserConversations&token=${token}`)
//     .then(response=>{
//         dispatch({
//             type: "GOT_CONVERSATIONS",
//             message: response
//         });
//     });
// }

export const setMyProfileInfo = (info) => { // обновить отображение информации обо мне
    return {
        type: "SET_MY_PROFILE_INFO",
        info: info
    };
}

export const setChatInfo = (info) => { // обновить отображение информации о чате
    return {
        type: "SET_CHAT_INFO",
        info: info
    };
}

export const setConversations = (response) => { // обновить отображение диалогов
    return {
        type: "SET_CONVERSATIONS",
        response: response
    };
}

export const setUserOnline = (response) => { // обновить онлайн пользователей
    return {
        type: "SET_USER_ONLINE",
        response: response
    };
}

export const markAsRead = (id, errUC, errUT) => { // отметить сообщения в чате как прочитанные
    return {
        type: "MARK_AS_READ",
        id: id,
        errUC: errUC,
        errUT: errUT
    };
}

export const setSelectChatItem = (id) => { // выделить выбранный чат
    return {
        type: "SET_SELECT_CHAT_ITEM",
        chat_id: id
    };
}

export const setMessages = (response) => { // обновить отображение сообщений
    return {
        type: "SET_MESSAGES",
        response: response
    };
}