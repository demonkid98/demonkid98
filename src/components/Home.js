import React from 'react';
import Interactive from 'react-interactive';
import { Link } from 'react-router-dom';
import { Code } from '../styles/style';
import s from '../styles/home.style';

export default function Home() {
  return (
    <div>
      <div style={s.pageLinkContainer}>
        <Interactive
          as={Link}
          {...s.link}
          to="/info-vis/approval-correlation"
        >Information Visualization Demo 1</Interactive>
        {' '}
        <Interactive
          as={Link}
          {...s.link}
          to="/info-vis/approval-vs-evaluation"
        >2</Interactive>
      </div>
    </div>
  );
}
