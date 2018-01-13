import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  location: PropTypes.object.isRequired,
};

export default function PageNotFound({ location }) {
  return (
    <p>
      Oops! Page not found!
    </p>
  );
}

PageNotFound.propTypes = propTypes;
