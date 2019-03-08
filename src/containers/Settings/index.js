import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { modal, setChatInfo, setMyProfileInfo } from '../../actions';
import './index.scss';

class SettingsPage extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
        };
        this.route_path = props.route_path;
        this.globalState = props.globalState;
        this.setMyProfileInfo = props.setMyProfileInfo;
        this.isAnimationReady = false;
    }

    componentWillUnmount() {
    }

    componentDidMount() {
    }

    render() {
        const modalClass = this.globalState[0].modal == "settings"
            ? "fullscreen-show"
            : this.isAnimationReady === true
                ? "fullscreen-hide"
                : "fullscreen-hide-non-animation";
        // this.isAnimationReady = true;
        return <div className={`settings ${modalClass}`}>
            <div className="settings_sidebar-left">
                <button onClick={()=>this.props.modal("")} className="settings_sidebar_button-back">Назад</button>
            </div>
            <div className="settings_sidebar-right">
                <p>Settings</p>
            </div>
        </div>
    }
}

const mapStateToProps = (state) => {
    return {
      globalState: state
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        setChatInfo: (info) => dispatch(setChatInfo(info)),
        setMyProfileInfo: (info) => dispatch(setMyProfileInfo(info)),
        modal:(typeModal) => {return dispatch(modal(typeModal))}
    }
}
  
SettingsPage = connect(
    mapStateToProps,
    mapDispatchToProps
)(SettingsPage);

export default SettingsPage;