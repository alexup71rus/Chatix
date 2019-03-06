import React, { Component } from 'react';

import Textarea from 'react-textarea-autosize';
import { Scrollbars } from 'react-custom-scrollbars'; // Кастомный скролл
import axios from 'axios-jsonp-pro';

import 'emoji-mart/css/emoji-mart.css';
import { Picker } from 'emoji-mart';

class TextAreaMessage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            emojibar: false,
            key: false,
            text: "",
            enterKey: false,
            shiftKey: false,
        };
        this.addEmoji = this.addEmoji.bind(this);
    }

    componentDidMount() {
    }
    
    componentDidUpdate() {
        this.textarea.focus();
    }

    addEmoji = (e) => {
        if (e.unified.length <= 5){
          let emojiPic = String.fromCodePoint(`0x${e.unified}`)
          this.setState({
            text: this.state.text + `:${e.id}:`,
            key: !this.state.key,
          })
        } else {
          let sym = e.unified.split('-')
          let codesArray = []
          sym.forEach(el => codesArray.push('0x' + el))
          let emojiPic = String.fromCodePoint(...codesArray)
          this.setState({
            text: this.state.text + `:${e.id}:`,
            key: !this.state.key,
          })
        }
    }
    
    render() {
        const { globalState, setUserOnline, watchOnlineStatus, setMessages, ownerClass } = this.props;
        return <div className="textarea-container" onKeyDown={ev=>{
            const value = ev.target.value.trim();
            const validText = value.replace(/\s+/g,'');
            if (ev.keyCode == 13 && this.state.shiftKey == false && validText.length > 0) {
                this.setState({
                    enterKey: true,
                });
                const id = window.location.hash.slice(1);
                setMessages({
                    owner: true,
                    type: "push",
                    event:{
                        data: {
                            avatar: globalState[0].me.info.avatar,
                            date: Math.floor(Date.now() / 1000),
                            read_time: 0,
                            first_name: globalState[0].me.info.first_name,
                            from_id: id, // означает из какого чата сообщение, а не кому или кто отправил!
                            id: Date.now(),
                            last_name: globalState[0].me.info.last_name,
                            message: {text: value, forward: "", attach: ""},
                        }
                    }
                }, globalState, setUserOnline);
                ownerClass.setState({isSend: true});
                axios.post(`https://khodyr.ru/chatix/backend/?request=SEND_PRIVATE_MESSAGE&id=${id}&text=${value}&hash=${globalState[0].me.hash}`, {
                    request: "SEND_PRIVATE_MESSAGE",
                    id: id,
                    text: value,
                    hash: globalState[0].me.hash
                })
                .then(response=>{
                    if (response.data.info) {
                        setMessages({
                            type: "replace_title",
                            response: response
                        });
                        watchOnlineStatus.checkOnlineStatus(globalState, setUserOnline);
                    }
                });
            }

            if (ev.keyCode == 16) { this.setState({shiftKey: true}); }
        }}

        onKeyUp={ev=>{
            if (ev.keyCode == 16) { this.setState({shiftKey: false}); }
            if (ev.keyCode == 13) { this.setState({enterKey: false}); }
        }}
        >
            <Scrollbars
            className="message-container_scrollbar-textarea"
            style={{ height: "60px", width: "94%" }}
            autoHide ref="scrollbars"
            onScroll={this.updateScroll}
            onClick={ev=>{
                if (this.state.emojibar) this.setState({emojibar: false});
            }}
            >
                <Textarea
                    inputRef={obj=>(this.textarea = obj)}
                    useCacheForDOMMeasurements
                    value={this.state.text}
                    onChange={(ev) => {
                        this.setState({text: ev.target.value});
                        if (this.state.enterKey == true && this.state.shiftKey == false) {
                            this.setState({
                                text: "",
                            });
                        }
                    }}
                    className="textarea"
                    maxLength="500"
                    style={{minHeight: 45}}
                    placeholder="Ваше сообщение"
                />
            </Scrollbars>
            
            <div className="textarea-container_items">
                <Picker
                set='emojione'
                onSelect={this.addEmoji}
                showPreview={false}
                emojiTooltip={true}
                color="#4d50a9"
                style={{display: this.state.emojibar ? "block" : "none"}}
                />
                <button className="textarea-container_item__smile" onClick={ev=>{
                    this.setState({emojibar: !this.state.emojibar});
                }}><i className="fas fa-grin textarea-container_item__smile-icon"></i></button>
            </div>
        </div>
    }
}

export default TextAreaMessage;