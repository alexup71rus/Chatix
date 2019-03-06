import React, { Component, PureComponent } from 'react';
import { connect } from 'react-redux';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import { SidebarSearch } from '../../../components/search';
import { DialogSidebarItem } from '../../../components/sidebar-item';
import { Scrollbars } from 'react-custom-scrollbars';
import { setConversations, setChatInfo, setMyProfileInfo } from '../../../actions';
import './index.scss';

class ConversationPanel extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            isMounted: false,
        };
        this.globalState = props.globalState;
        this.setChatInfo = props.setChatInfo;
        this.setConversations = props.setConversations;
        this.setMyProfileInfo = props.setMyProfileInfo;
    }

    componentDidMount() {
        this.setState({isMounted: true});
    }
    
    componentDidUpdate() {
        
    }

    render() {
        const globalState = this.props.globalState;
        return <nav>
            <SidebarSearch />
            <Scrollbars className="sidebar-left_items" autoHide>
                {Object.keys(globalState[0].conversations).map(id => (
                    <DialogSidebarItem
                    key={globalState[0].conversations[id].id}
                    conversation={globalState[0].conversations[id]}
                    isSelected={ this.props.globalState[0].conversation == id.slice(2) ? true : false } />
                ))}
            </Scrollbars>
            <div className="sidebar-left_navbar-panel" title="Information about me">
                <li>
                    <img className="sidebar-left_navbar-panel__avatar" src="https://vk.com/images/camera_200.png?ava=1" alt="avatar"/>
                    <span className="sidebar-left_navbar-panel__nickname" title={`id${this.props.globalState[0].me.id}`}>id# {this.props.globalState[0].me.id}</span>
                </li>
                <li>
                    <Link to="/settings" className="fas fa-cog sidebar-left_navbar-panel__settings" title="settings"></Link>
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
        setChatInfo: (info) => dispatch(setChatInfo(info)),
        setMyProfileInfo: (info) => dispatch(setMyProfileInfo(info)),
    }
}
  
ConversationPanel = connect(
    mapStateToProps,
    mapDispatchToProps
)(ConversationPanel);

export default ConversationPanel;