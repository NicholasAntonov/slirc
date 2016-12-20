// @flow
import React, { Component } from 'react';
import { Link } from 'react-router';
import styles from './Chat.css';

const ENTER_KEY = 13;


class Chat extends Component {
  constructor(props) {
    super(props);
    this.onPress = this.onPress.bind(this);
    // this.props.protectedTest({user: this.props.user, token: this.props.token});
  }

  onPress(event) {
    if (event.keyCode === ENTER_KEY) {
      this.props.state.sendMessage('general', this.input.value);
    }
  }

  renderContent() {
    if(this.props.user) {
      return (
        <p>{this.props.content}</p>
      );
    }
  }

  render() {
    console.log(this.props.state);
    return (
        <div className={styles.chatRoot}>
          <div className={styles.messageHistory}>
            <ul>
              <li>
                <strong>Username: </strong>
                <span>Sample Message</span>
              </li>
            </ul>
          </div>
        <input onKeyDown={this.onPress} ref={(input) => this.input = input}/>
        </div>
    );
  }
}

export default Chat;
