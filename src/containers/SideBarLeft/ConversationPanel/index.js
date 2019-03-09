import React, { Component, PureComponent } from 'react';
import { connect } from 'react-redux';
import { SidebarSearch } from '../../../components/search';
import { DialogSidebarItem } from '../../../components/sidebar-item';
import { Scrollbars } from 'react-custom-scrollbars';
import { conversationsSearch, modal, setConversations, setMyProfileInfo } from '../../../actions';
import './index.scss';

class ConversationPanel extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            isMounted: false,
        };
    }

    componentDidMount() {
        this.setState({isMounted: true});
    }
    
    componentDidUpdate() {
        
    }

    render() {
        const { routeLocation, globalState, setConversations, setMyProfileInfo, conversationsSearch } = this.props;
        let conversations = globalState[0].conversations;
        if (globalState[0].conversations_search.slice(0,1) !== "#") {
            conversations = Object.keys(conversations).filter(id => conversations[id].title.includes(globalState[0].conversations_search));
        } else {
            conversations = Object.keys(conversations)
        }
        return <nav>
            <SidebarSearch conversations={conversations} conversationsSearch={conversationsSearch} routeLocation={routeLocation} />
            <Scrollbars className="sidebar-left_items" autoHide>
                {conversations.map(id => (
                    <DialogSidebarItem
                    key={globalState[0].conversations[id].id}
                    conversation={globalState[0].conversations[id]}
                    isSelected={ this.props.globalState[0].conversation.id == id.slice(2) ? true : false } />
                ))}
            </Scrollbars>
            <div className="sidebar-left_navbar-panel" title="Information about me">
                <li>
                    <img className="sidebar-left_navbar-panel__avatar" src="https://vk.com/images/camera_200.png?ava=1" alt="avatar"/>
                    <span className="sidebar-left_navbar-panel__nickname" title={`id${this.props.globalState[0].me.id}`}>{`${this.props.globalState[0].me.info.first_name} ${this.props.globalState[0].me.info.last_name}`}</span>
                </li>
                <li>
                    <button onClick={()=>this.props.modal("settings")} className="fas fa-cog sidebar-left_navbar-panel__settings" title="Настрйоки"></button>
                </li>
            </div>
        </nav>
    }
}

const mapStateToProps = (state) => {
    return {
      globalState: state
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        setConversations: (response) => dispatch(setConversations(response)),
        setMyProfileInfo: (info) => dispatch(setMyProfileInfo(info)),
        modal: (typeModal) => dispatch(modal(typeModal)),
        conversationsSearch: (text) => dispatch(conversationsSearch(text)),
    }
}
  
ConversationPanel = connect(
    mapStateToProps,
    mapDispatchToProps
)(ConversationPanel);

export default ConversationPanel;