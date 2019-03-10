import React, { Component, PureComponent } from 'react';
import { connect } from 'react-redux';
import { Separator, DateSeparator, SeparatorNoMessages, Message } from '../../../components/message';
import { HeaderDialogContainer } from '../../../components/header-dialog-container';
import { Scrollbars } from 'react-custom-scrollbars'; // Кастомный скролл
import axios from 'axios-jsonp-pro';
import TextAreaMessage from '../../../components/textarea';
import { markAsRead, setMyProfileInfo, setConversations, setSelectChatItem, setUserOnline, setMessages } from '../../../actions';
import './index.scss';

class DialogContainer extends PureComponent {
    constructor(props) {
        super(props);
        this.loc = props.loc;
        this.globalState = props.globalState;
        this.setUserOnline = props.setUserOnline;
        this.watchOnlineStatus = props.watchOnlineStatus;
        this.setMessages = props.setMessages;
        this.markAsRead = props.markAsRead;
        this.setSelectChatItem = props.setSelectChatItem;
        this.setMyProfileInfo = props.setMyProfileInfo;
        this.handleScrollBottom = this.handleScrollBottom.bind(this);
        this.read = this.read.bind(this);
        this.loadUserInfo = this.loadUserInfo.bind(this);
        this.state = {
            isMount: false, // инициализировано
            isStart: false, // получены первые сообщения
            isSend: false, // было отправлено сообщение от моего имени
            id: '',
            secondId: '',
            timerId: '',
        };
    }

    componentWillUnmount() {
        this.unlisten();
    }

    getMessages (id, hash, fetch, fetch_end, firstOpen) {
        const scrollToBottom = this.refs.scrollbars.scrollToBottom;
        const setMessages = this.setMessages;
        if (this.globalState[0].me.hash) {
            axios.post(`https://khodyr.ru/chatix/backend/`, {
                request: "GET_MESSAGES",
                id: id,
                hash: hash,
                fetch: fetch,
                fetch_end: fetch_end,
                getterConv: [],
            })
            .then(response=>{
                if (!response.data.length) { // если старых сообщений больше нет и нет уже добавленного значка о том, что больше нечего грузить, то выводить этот значок
                    if (this.globalState[0].conversations['id'+id].messages[0].type != "separator_no-messages") {
                        setMessages({
                            type: "separator_no-messages",
                            id: id,
                        });
                    }
                } else if (response.data.length) {
                    setMessages({
                        type: "lazy_load",
                        event: response,
                        id: id,
                    });
                    if (firstOpen) {
                        scrollToBottom();
                    }
                }
            });
        }
    }

    read(id) {
        const { markAsRead, globalState } = this.props;
        const oldUnreadCount = globalState[0].conversations['id'+id].unread_count;
        const oldReadTime = globalState[0].conversations['id'+id].read_time;
        markAsRead(id);
        axios.post(`https://khodyr.ru/chatix/backend/`, {
            request: "MARK_AS_READ",
            id: id,
            hash: globalState[0].me.hash,
            })
        .then(response=>{
            if (response.data.error != 0) {
                markAsRead(id, oldUnreadCount, oldReadTime);
                console.error(response.data.message);
            }
        });
    }

    loadUserInfo(id) {
        axios.post(`https://khodyr.ru/chatix/backend/`, {
            request: "GET_USERS_INFO",
            id: id,
            hash: this.globalState[0].me.hash
        })
        .then(response=>{
            if (this.globalState[0].conversation.last_visit === -1) {
                if (response.data.error == 2) {
                    this.setSelectChatItem(id, "Пользователь не найден", -1);
                } else if (!response.data.error) {
                    this.setSelectChatItem(response.data.id, response.data.first_name+" "+response.data.last_name, response.data.last_visit);
                }
            }
        });
    }

    componentDidMount() {
        const self = this;
        const { globalState, setUserOnline, watchOnlineStatus, setMessages } = this.props;
        if(this.loc.location.hash) {
            this.setState({ isMount: true, id: this.loc.location.hash.slice(1) });
            this.setSelectChatItem(this.loc.location.hash.slice(1));
        }
        this.unlisten = this.loc.history.listen((location, action) => { // слушаю измнение id в адресной строке
            const id = location.hash ? location.hash.slice(1) : "";
            if(id && this.globalState[0].conversations["id"+id]) {
                this.setSelectChatItem(id);
                if (this.globalState[0].conversations["id"+id].messages.length <= 1 && location.hash != this.state.id) {
                    this.getMessages(id, this.globalState[0].me.hash, this.globalState[0].conversations["id"+id].messages.length, 20, true); // Получаю все сообщения при открытии диалога
                } else if (this.refs.scrollbars) {
                    this.refs.scrollbars.scrollToBottom();
                }
                if (this.globalState[0].conversations["id"+id].unread_count > 0) { // отметить сообщения в чате как прочитанные
                    this.read(id);
                }
            } else if (location.hash.length > 1 && !globalState[0].conversations["id"+location.hash.slice(1)]) {
                this.setSelectChatItem(location.hash.slice(1), "Загрузка...", -1);
                if (this.state.timerId) {
                    clearTimeout(this.state.timerId);
                }
                this.setState({ timerId: setTimeout(() => {
                    this.loadUserInfo(location.hash.slice(1));
                }, 1000) });
                
            }
            if(location.hash) {
                this.setState({ id: location.hash.slice(1) });
            } else {
                this.setState({ id: null });
            }
        });
        window.CometServer().subscription("msg.private_user_message", function(event){ // слушаю личные сообщения
            if(globalState[0].conversations['id'+event.data.from_id] && event.data.from_id == self.state.id) {
                setMessages({ type: "push", event: event });
                self.read(self.state.id);
            } else if (globalState[0].conversations['id'+event.data.from_id] && event.data.from_id != self.state.id) {
                event.data.unread = true;
                setMessages({ type: "push", event: event });
            } else {
                event.data.unread = true;
                setMessages({ type: "push", event: event });
                watchOnlineStatus.checkOnlineStatus(globalState, setUserOnline);
            }
            self.handleScrollBottom();
        });
    }
    
    componentDidUpdate() {
        if (!this.state.secondId && this.state.id) {
            this.setState({ secondId: this.state.id });
        } else if (this.state.secondId) {
            if(this.state.secondId != this.state.id) {
                this.refs.scrollbars.scrollToBottom();
                this.setState({ secondId: this.state.id });
            } else if (this.state.isMount && !this.state.isStart && this.props.globalState[0].conversations['id'+ this.state.id ] && this.props.globalState[0].conversations['id'+ this.state.id ].messages.length > 5) {
                this.refs.scrollbars.scrollToBottom();
                this.setState({ secondId: this.state.id, isStart : true });
            } else if (this.state.isMount && !this.state.isStart && !this.props.globalState[0].conversations['id'+ this.state.id ]) {
                setTimeout(() => {
                    this.loadUserInfo(this.state.id);
                }, 500);
                this.setState({ secondId: this.state.id, isStart : true });
            }
            if (this.state.isSend) {
                this.refs.scrollbars.scrollToBottom();
                this.setState({ isSend: false });
            }
        }
    }

    handleScrollFrame(ev) {
        if (ev.top == 0) {
            if (this.state.id, this.globalState[0].me.hash, this.globalState[0].conversations["id"+this.state.id]
            && this.globalState[0].conversations["id"+this.state.id].messages.length > 2
            && this.globalState[0].conversations['id'+this.state.id].messages[0].type != "separator_no-messages") {
                this.getMessages(this.state.id, this.globalState[0].me.hash, (this.globalState[0].conversations["id"+this.state.id].messages.length), 5 );  
            }
        } else {
            this.refs.top = ev.top;
        }
    }

    handleScrollBottom() {
        if (this.refs.top > 0.8 && this.refs.scrollbars) {
            this.refs.scrollbars.scrollToBottom();
        }
    }

    // handleScrollStop() {}

    render() {
        const conversations = this.props.globalState[0].conversations['id'+this.state.id];
        if (this.state.id) {
            return <div className="dialog-left">
                <HeaderDialogContainer
                    globalState={this.props.globalState}
                />
                <Scrollbars
                    style={{height: "calc(100vh - 180px)" }}
                    autoHide ref="scrollbars"
                    onScrollFrame={(ev)=>this.handleScrollFrame(ev)}
                    // onScrollStop={()=>this.handleScrollStop()} для показа стрелки вниз а мобилках
                    >
                    <div className="dialog-left_container" id="dialog-left_container">
                    {
                        conversations
                        ? conversations.messages.map(obj => {
                                if (obj.type == "load_message" || obj.type == "push_message") {
                                    return <Message key={obj.id} obj={obj} />
                                } else if (obj.type == "first_load_message") {
                                    return <div key={obj.id}><Message obj={obj} /><Separator /></div>
                                } else if (obj.type == "separator_no-messages") {
                                    return <SeparatorNoMessages key={obj.type} name={conversations.title} />
                                }
                            })
                        : <div>Вы пишите пользователю, которого нет в ваших контактах</div>
                    }
                    </div>
                </Scrollbars>
                {
                    this.globalState[0].conversation.last_visit != -1 ? <TextAreaMessage globalState={this.globalState} setMessages={this.props.setMessages} watchOnlineStatus={this.watchOnlineStatus} setUserOnline={this.setUserOnline} ownerClass={this} /> : null
                }
            </div>
        } else {
            return <div className="dialog-left">
                <Scrollbars style={{height: "calc(100vh - 180px)" }} autoHide ref="scrollbars">Выберите диалог</Scrollbars>
            </div>
        }
    }
}

const mapStateToProps = (state) => {
    return {
      globalState: state
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
      markAsRead: (id, errUC, errUT) => dispatch(markAsRead(id, errUC, errUT)),
      setMyProfileInfo: (info) => dispatch(setMyProfileInfo(info)),
      setSelectChatItem: (id, title, lastVisit) => dispatch(setSelectChatItem(id, title, lastVisit)),
      setUserOnline: (response) => dispatch(setUserOnline(response)),
      setMessages: (response) => dispatch(setMessages(response)),
      setConversations: (res) => dispatch(setConversations(res)),
    }
}
  
DialogContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(DialogContainer);

export default DialogContainer;