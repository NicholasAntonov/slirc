import React, { Component } from 'react';
import { Link } from 'react-router';

class NotFoundPage extends Component {
  render() {
    return (
      <div>
        <h1>404 - Page Not Found</h1>
        <p>I'm sorry, the page you were looking for cannot be found!</p>
        <Link to="/">to Dashboard</Link>
      </div>
    )
  }
}
export default NotFoundPage;  