// @flow
import React, { Component } from 'react';
import { Link } from 'react-router';
import styles from './Channellist.css';



class Channellist extends Component {
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

  render() {
    return (
      <div className={styles.channels}>
        <h3> Channels </h3>
        <hr/>
        <ul>
          <li> Channel #1 </li>
          <li> Channel #2 </li>
          <li> Channel #3 </li>
          <li> Channel #4 </li>
        </ul>				
    </div>
    );
  }
}

export default Channellist;