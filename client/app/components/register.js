import React, { Component } from 'react';  
import { Link } from 'react-router';
import { Field } from 'redux-form';  
import styles from './Register.css';

const renderField = field => (  
    <div>
      <input className="form-control" {...field.input}/>
      {field.touched && field.error && <div className="error">{field.error}</div>}
    </div>
);

class Register extends Component {  
  handleFormSubmit(formProps) {
    this.props.registerUser(formProps);
  }

  renderAlert() {
    if(this.props.errorMessage) {
      return (
        <div>
          <span><strong>Error!</strong> {this.props.errorMessage}</span>
        </div>
      );
    }
  }

  render() {
    const { handleSubmit } = this.props;

    return (
      <div>
        <form onSubmit={handleSubmit(this.handleFormSubmit.bind(this))}>
        {this.renderAlert()}
        <div className="row">
          <div className="col-md-6">
            <label>Username</label>
            <Field name="username" className="form-control" component={renderField} type="text" />
          </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              <label>Password</label>
              <Field name="password" className="form-control" component={renderField} type="password" />
            </div>
          </div>
          <button type="submit" className="btn btn-primary">Register</button>
        </form>
        <Link to="/login">Login</Link>
      </div>
    );
  }
}

export default Register;