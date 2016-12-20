// @flow
import React, { Component } from 'react';
import { Link } from 'react-router';
import styles from './Dashboard.css';
import Chat from '../components/Chat';
import Channellist from '../components/Channellist';


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
        <div className={styles.dashboardRoot}>
        <header>
          <h1>Welcome, {this.props.user}</h1>
          <button  onClick={(e) => this.logout(e)}>Logout</button>
        </header>
        <div className={styles.dashContent}>
          <aside>
            <Channellist />
          </aside>
          <main>
        <Chat state={this.props}/>
          </main>
        </div>
      </div>
    );
  }
}

export default Dashboard;
