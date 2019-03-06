import React from 'react';
import { connect } from 'react-redux';
import { BrowserRouter as Router, Route, Link, Redirect } from 'react-router-dom';
import axios from 'axios-jsonp-pro';
import './App.scss';
import { WatchOnlineStatus } from '../../components/tracker';
import SideBarLeft from '../SideBarLeft/';
import SideBarRight from '../SideBarRight/';
import { setConversations, setUserOnline, setMessages } from '../../actions';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.userStatusKeys = {};
    this.watchOnlineStatus = new WatchOnlineStatus();
  }

  componentDidMount() {
    const { globalState, setUserOnline, setConversations, setMessages } = this.props;
    const watchOnlineStatus = this.watchOnlineStatus;
    window.cometApi.onAuthSuccess(function(){
      if (globalState[0].me.hash) {
        const token = globalState[0].me.hash;
        axios.post("https://khodyr.ru/chatix/backend/", {
          request: "CONVERSATION_LIST",
          hash: token
        })
        .then(response=>{
          setConversations(response);
        })
        .then(()=>{
          const location = window.location.hash;
          if (location && globalState[0].conversations["id"+location.slice(1)]) {
            const id = location.slice(1);
            const fetch = globalState[0].conversations["id"+id].messages.length || 0;
            if (globalState[0].conversations["id"+id] && fetch) {
              watchOnlineStatus.checkOnlineStatus(globalState, setUserOnline);
              axios.post(`https://khodyr.ru/chatix/backend/`, { // получает все сообщения в открытом чате
                request: "GET_MESSAGES",
                id: location.slice(1),
                hash: token,
                fetch: fetch,
              })
              .then(response=>{
                if (!response.data.length) { // если старых сообщений больше нет и нет уже добавленного значка о том, что больше нечего грузить, то выводить этот значок
                  setMessages({
                    type: "separator_no-messages",
                    id: location.slice(1),
                  });
                } else if (response.data.length) {
                  setMessages({
                    type: "lazy_load",
                    event: response,
                    id: location.slice(1),
                  });
                }
              });
            }
          }
        })
        .then(()=>{
          setInterval(()=>{
            watchOnlineStatus.checkOnlineStatus(globalState, setUserOnline);
          }, 150000);
        });
      }
    });
    window.cometApi.onAuthFalill(function(){ // если авторизация провалилась выходить из аккаунта
      console.error("Сессия истекла.");
      window.localStorage.hash = ""; window.localStorage.id = "";
    });
    if(globalState[0].me.id && globalState[0].me.hash) {
      window.CometServer().start({ dev_id:2450, user_key:globalState[0].me.hash, user_id:globalState[0].me.id });
    }
  }

  render () {
    return (
      <Router>
        <div>
          {
            this.props.globalState[0].me.hash
            ? <Route exact path="/" render={() => (<Redirect to="/id#"/>)} />
            : <Route exact path="/*" render={(ev) => {
              if (ev.location.hash != "#login" || ev.location.hash != "#register") {
                return <Redirect to="/auth#login" />;
              }
            }} />
          }
          <Route exact path="/*" render={() => <div>
            <SideBarLeft
              globalState={this.props.globalState}
            />
            <SideBarRight
              watchOnlineStatus={this.watchOnlineStatus}
            />
          </div>} />
        </div>
      </Router>
    )
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
    setUserOnline: (response) => dispatch(setUserOnline(response)),
    setMessages: (response) => dispatch(setMessages(response)),
  }
}

App = connect(
  mapStateToProps,
  mapDispatchToProps
)(App);

export default App;