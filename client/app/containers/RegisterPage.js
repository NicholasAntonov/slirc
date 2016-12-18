// @flow
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Register from '../components/Register';
import * as RegisterActions from '../actions/auth';
import { reduxForm } from 'redux-form';  

const form = reduxForm({  
  form: 'register',
  validate
});

function validate(formProps) {  
  const errors = {};

  if (!formProps.username) {
    errors.username = 'Please enter an username';
  }

  if (!formProps.password) {
    errors.password = 'Please enter a password';
  }

  return errors;
}


function mapStateToProps(state) {
  return {
    errorMessage: state.auth.error,
    message: state.auth.message
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(RegisterActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(form(Register));
