import React from 'react';
import Interactive from 'react-interactive';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div>
      <div>
        <Interactive
          as={Link}
          to="/info-vis/approval-correlation"
        >Information Visualization Demo 1</Interactive>
        {' '}
        <Interactive
          as={Link}
          to="/info-vis/approval-vs-evaluation"
        >2</Interactive>
      </div>
    </div>
  );
}
