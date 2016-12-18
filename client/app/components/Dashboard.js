// @flow
import React, { Component } from 'react';
import { Link } from 'react-router';
import styles from './Dashboard.css';

class Dashboard extends Component {
 constructor(props) {
    super(props);
    console.dir(props)
    this.props.protectedTest({user: this.props.user, token: this.props.token});
  }

  renderContent() {
    if(this.props.content) {
      return (
        <p>{this.props.content}</p>
      );
    }
  }

  render() {
    return (
      <div>
        {this.renderContent()}
      </div>
    );
  }
}

export default Dashboard;