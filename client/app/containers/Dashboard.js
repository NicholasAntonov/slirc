// @flow
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Dashboard from '../components/Dashboard';
import * as AuthActions from '../actions/auth';
import * as MessageActions from '../actions/message';

function mapStateToProps(state) {
  return {
    content: state.auth.content,
    token: state.auth.token,
    user: state.auth.user,
    messages: state.messages
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    ...AuthActions,
    ...MessageActions
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
