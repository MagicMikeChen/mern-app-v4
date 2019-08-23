import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

const Alert = ({ alerts }) =>
  alerts !== null && alerts.length > 0 && alerts.map(alert => ( 
    //chech it's not null and at least one alert then return some alert 
    <div key={alert.id} className={`alert alert-${alert.alertType}`}>
      {alert.msg}
    </div>
  ));

Alert.propTypes = {
  alerts: PropTypes.array.isRequired
};

const mapStateToProps = state => ({
  alerts: state.alert //bring alert state in from combinereducers
});

export default connect(mapStateToProps)(Alert);
