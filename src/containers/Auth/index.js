import React, { Component } from 'react';
import axios from 'axios-jsonp-pro';
import { browserHistory } from 'react-router';
import { BrowserRouter as Router, Route, Link, Redirect } from 'react-router-dom';
import './index.scss';

export const AuthSidebar = (ex, globalState) => {
    return <div className="auth_container-left">
        {
            globalState[0].me.hash ? <Redirect to="/id#" /> : null
        }
        <Link to="/auth#login" className="auth_btnSidebar">Авторизация</Link>
        <br/>
        <Link to="/auth#register"  className="auth_btnSidebar">Регистрация</Link>
    </div>
}

export class LoginPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            login: '',
            password: '',
        }
    }

    handleSubmit(e) {
        e.preventDefault();
        if (this.state.login.length > 0 && this.state.password.length > 3) {            
            axios.post(`//chatix.khodyr.ru/backend/`, {
                request: "AUTH",
                login: this.state.login,
                pass: this.state.password,
            })
            .then(response=>{
                console.log(response);
                if (response.data.error == 0) {
                    window.localStorage.hash = response.data.message.hash;
                    window.localStorage.id = response.data.message.data.id;
                    const userInfo = {
                        avatar: response.data.message.data.avatar,
                        first_name: response.data.message.data.first_name,
                        last_name: response.data.message.data.last_name,
                        status: response.data.message.data.status,
                    }
                    window.localStorage.userInfo = JSON.stringify(userInfo);
                } else {
                    console.error(response.data);
                    alert(response.data.message);
                }
            });
        } else {
            alert("Не все поля заполнены");
        }
    }

    render () {
        return <div>
            <h1 className="title">Авторизация</h1>
            <form onSubmit={ev=>this.handleSubmit(ev)}>
                <input type="login" name="login" placeholder="Лоигн" onChange={(ev)=>this.setState({login: ev.target.value})} value={this.state.login} />
                <input type="password" name="password" placeholder="Пароль" onChange={(ev)=>this.setState({password: ev.target.value})} value={this.state.password} />
                <input type="submit"/>
            </form>
            <button>Забыли логин или пароль?</button>
        </div>
    }
}

export class RegisterPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            email: '',
            login: '',
            password: '',
            repeatPassword: '',
        }
    }

    handleSubmit(e) {
        e.preventDefault();
        if (this.state.name && this.state.login && this.state.password) {
            if (this.state.password.length > 3) {
                if (this.state.password == this.state.repeatPassword) {
                    axios.post(`https://khodyr.ru/chatix/backend/`, {
                        request: "REGISTER",
                        login: this.state.login,
                        pass: this.state.password,
                        mail: this.state.email,
                        first_name: this.state.name,
                    })
                    .then(response=>{
                        console.log(response);
                        if (response.data.error == 0) {
                            window.localStorage.hash = response.data.message.hash;
                            window.localStorage.id = response.data.message.id;
                        } else {
                            console.error(response.data);
                            alert(response.data.message);
                        }
                    });
                } else {
                    alert("Пароли не совпадают");
                }
            } else {
                alert("Пароль слишком короткий");
            }
        } else {
            alert("Не все поля заполнены");
        }
    }

    render () {
        return <div>
            <h1 className="title">Регистрация</h1>
            <form onSubmit={ev=>this.handleSubmit(ev)}>
                <input type="name" name="name" placeholder="Отображаемое имя" onChange={(ev)=>this.setState({name: ev.target.value})} value={this.state.name} />
                <input type="email" name="email" placeholder="Почта" onChange={(ev)=>this.setState({email: ev.target.value})} value={this.state.email} />
                <input type="login" name="login" placeholder="Логин" onChange={(ev)=>this.setState({login: ev.target.value})} value={this.state.login} />
                <input type="password" name="password" placeholder="Пароль" onChange={(ev)=>this.setState({password: ev.target.value})} value={this.state.password} />
                <input type="password" name="repeatPassword" placeholder="Повтор пароля" onChange={(ev)=>this.setState({repeatPassword: ev.target.value})} value={this.state.repeatPassword} />
                <input type="submit"/>
            </form>
        </div>
    }
}