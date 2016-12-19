// @flow
import React, { Component } from 'react';
import { Link } from 'react-router';
import styles from './Chat.css';



class Chat extends Component {
 constructor(props) {
    super(props);
    // this.props.protectedTest({user: this.props.user, token: this.props.token});
  }

  handleFormSubmit() {
    //Handle the message sending
  }

  renderContent() {
    if(this.props.user) {
      return (
        <p>{this.props.content}</p>
      );
    }
  }

  render() {
    return (
      <div>
        <h1>Message List</h1>
        <form onSubmit={this.handleSubmit} className={styles.messageText}>
          <div className={styles.messageHistory}>
            <ul>
              <li>
                <strong>Username: </strong> 
				        <span>Sample Message</span>
              </li>
            </ul>
          </div>
					<input />
          <button type="submit" className={styles.sendButton}>Send</button>
				</form>

      </div>
    );
  }
}

export default Chat;