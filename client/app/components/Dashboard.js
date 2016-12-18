// @flow
import React, { Component } from 'react';
import { Link } from 'react-router';
import styles from './Dashboard.css';

class Dashboard extends Component {
 constructor(props) {
    super(props);
    // this.props.protectedTest({user: this.props.user, token: this.props.token});
  }

  renderContent() {
    if(this.props.user) {
      return (
        <p>{this.props.content}</p>
      );
    }
  }

  logout(e) {
    this.props.logoutUser();
  }

  render() {
    return (
      <div>
        <h1>This is the dashboard after logging in</h1>
        <aside>
          <button onClick={(e) => this.logout(e)}>Logout</button>
          Channel list
        </aside>
        <main>Chat</main>
      </div>
    );
  }
}

export default Dashboard;