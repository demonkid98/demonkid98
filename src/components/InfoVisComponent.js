import React from 'react';
import Interactive from 'react-interactive';
import { Switch, Route, Link } from 'react-router-dom';
import PageNotFound from './PageNotFound';
import s from '../styles/infoVisComponent.style';

import _ from 'lodash';

import vt1 from '../assets/VT1.csv';
import vt2 from '../assets/VT2.csv';
import vt3 from '../assets/VT3.csv';

import * as d3 from 'd3';

let ssv = d3.dsvFormat(';');

function parseSsvData(...files) {
  return _.chain(files)
    .map(vt => ssv.parse(vt))
    .flatMap((data, i) => {
      let _data = _.map(data, item => {
        item = _.map(item, (val, key) => {
          if (typeof val === 'string') {
            val = val.trim();
          }

          if (val === 'None') {
            return null;
          } else if (!isNaN(val)) {
            return Number(val);
          }
          return val;
        });
        
        item.vt = i + 1;
        return item;
      });
      return _data;
    })
    .value();
}

class InfoVisComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    let dataSets = parseSsvData(vt1, vt2, vt3);
    console.log(dataSets)
    
  }

  render() {
    return (
      <section>
        <h1 style={s.title}>Information Visualization Demo</h1>
        
      </section>
    );
  }
}

export default InfoVisComponent;
