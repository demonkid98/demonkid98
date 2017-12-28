import React from 'react';
import Interactive from 'react-interactive';
import { Switch, Route, Link } from 'react-router-dom';
import PageNotFound from './PageNotFound';

import _ from 'lodash';
import numeral from 'numeral';

import vt1 from '../assets/VT1.csv';
import vt2 from '../assets/VT2.csv';
import vt3 from '../assets/VT3.csv';

import * as d3 from 'd3';
window.d3 = d3;

import '../styles/info-vis.css';

let ssv = d3.dsvFormat(';');

const margin = { top: 50, right: 0, bottom: 100, left: 45 };
const width = 640 - margin.left - margin.right;
const height = 480 - margin.top - margin.bottom;
const gridSize = Math.floor(height / 11);
const legendElementWidth = gridSize * 2;

let colors = {
  'NDA': '#0088c6',
  'MLP': '#83726d',
  'EM': '#ffd850',
  'BH': '#f39dc7',
  'NA': '#a21700',
  'PP': '#f96f43',
  'JC': '#464a4c',
  'JL': '#cee9f8',
  'JLM': '#de2707',
  'FA': '#131413',
  'FF': '#75bbe2',
};

function parseSsvData(...files) {
  let rawDataSets = _.map(files, vt => ssv.parse(vt))
  let dataSets = _.chain(rawDataSets)
    .flatMap((data, i) => {
      let _data = _.map(data, item => {
        const _item = {};
        for (const key in item) {
          let val = item[key];
          if (typeof val === 'string') {
            val = val.trim();
          }

          const newKey = key.trim();
          if (val === 'None') {
            _item[newKey] = null;
          } else if (!isNaN(val)) {
            _item[newKey] = Number(val);
          }
        }

        _item.vt = i + 1;
        return _item;
      });
      return _data;
    })
    .value();

  if (rawDataSets.length > 0) {
    dataSets.columns = _.map(rawDataSets[0].columns, col => col.trim());
  }
  return dataSets;
}

function extractCandidates(columns) {
  return _.chain(columns)
    .filter(col => col.startsWith('AV_'))
    .map(col => col.substr(3))
    .value();
}

function approvalVsEvalGraph(dataSets, elementId) {
  const svg = d3.select(`#${elementId}`)
    .append('svg')
    .attr('font-size', '80%')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  const candidates = extractCandidates(dataSets.columns);

  const xTicks = _.map(candidates, (c, i) => (width - 100) * i / candidates.length + 50);
  let x = d3.scaleOrdinal().range(xTicks);
  let y = d3.scaleLinear().rangeRound([height, 0]);
  let z = d3.scaleLinear().range([0, 25]);
  
  x.domain(candidates);
  z.domain([0, 1]);
  
  const minEval = -.3;
  const maxEval = 1;
  y.domain([minEval, maxEval]);

  svg.append('g')
    .attr('transform', `translate(0, ${height * maxEval / (maxEval - minEval)})`)
    .call(d3.axisBottom(x));
  svg.append('g')
    .call(d3.axisLeft(y));

  const nbBins = 26;

  const chart = svg.append('g');
  candidates.forEach((cand, i) => {
    const series0 = dataSets.filter(item => item[`AV_${cand}`] === 0).map(item => item[`EV_${cand}`] || 0);
    const series1 = dataSets.filter(item => item[`AV_${cand}`] === 1).map(item => item[`EV_${cand}`] || 0);

    let bins0 = d3.histogram()
      .domain(y.domain())
      .thresholds(y.ticks(nbBins)) (series0);
    let bins1 = d3.histogram()
      .domain(y.domain())
      .thresholds(y.ticks(nbBins)) (series1);

    let maxCount0 = d3.max(bins0, bin => bin.length);
    let maxCount1 = d3.max(bins1, bin => bin.length);

    chart.selectAll(`.bar-neg-${i}`)
      .data(bins0)
      .enter().append('g')
        .attr('class', `bar-neg-${i}`)
        .attr('transform', d => `translate(${x(cand)}, ${y(d.x0)})`)
        .append('rect')
          .attr('x', d => - z(d.length / maxCount0))
          .attr('width', d => z(d.length / maxCount0))
          .attr('height', height / nbBins)
          .attr('fill', d3.hsl(colors[cand]).darker(1))
          .attr('stroke', '#420000');
          
    chart.selectAll(`.bar-pos-${i}`)
      .data(bins1)
      .enter().append('g')
        .attr('class', `bar-pos-${i}`)
        .attr('transform', d => `translate(${x(cand)}, ${y(d.x0)})`)
        .append('rect')
          .attr('width', d => z(d.length / maxCount1))
          .attr('height', height / nbBins)
          .attr('fill', colors[cand])
          .attr('stroke', '#00114c');
  });
}

class InfoVisApEvalComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    let dataSets = parseSsvData(vt1, vt2, vt3);
    console.log(dataSets)
    approvalVsEvalGraph(dataSets, 'approval-vs-eval-container');
  }

  render() {
    return (
      <section>
        <h1>Information Visualization Demo</h1>
        <div id="approval-vs-eval-container" className="graph-container" />
      </section>
    );
  }
}

export default InfoVisApEvalComponent;
