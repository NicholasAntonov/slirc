// @flow
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Dashboard from '../components/Dashboard';
import * as AuthActions from '../actions/auth';

function mapStateToProps(state) {
  return {
    content: state.auth.content,
    token: state.auth.token,
    user: state.auth.user
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(AuthActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
