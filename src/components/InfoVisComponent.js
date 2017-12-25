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

const margin = { top: 50, right: 0, bottom: 100, left: 45 };
const width = 640 - margin.left - margin.right;
const height = 480 - margin.top - margin.bottom;
const gridSize = Math.floor(height / 10);
const legendElementWidth = gridSize * 2;

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

function mutualApprovalHeatMap(dataSets, elementId) {
  const svg = d3.select(`#${elementId}`)
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);
    
  const candidates = extractCandidates(dataSets.columns);
  const yLabels = svg.append('g')
    .attr('class', 'axis axis-y')
    .selectAll('.label-candidate-y')
    .data(candidates)
    .enter().append('text')
      .text(d => d)
      .attr('x', 0)
      .attr('y', (d, i) => i * gridSize)
      .style('text-anchor', 'end')
      .attr('transform', `translate(-6, ${gridSize / 1.5})`)
      .attr('class', 'label-candidate label-candidate-y');

  const xLabels = svg.append('g')
    .attr('class', 'axis axis-x')
    .selectAll('.label-candidate-x')
    .data(candidates)
    .enter().append('text')
      .text(d => d)
      .attr('x', (d, i) => i * gridSize)
      .attr('y', 0)
      .style('text-anchor', 'middle')
      .attr('transform', `translate(${gridSize / 2}, -6)`)
      .attr('class', 'label-candidate label-candidate-x');

  const mutualApData = [];
  candidates.forEach(cand1 => {
    const row = {};

    candidates.forEach((cand2, j) => {
      const countIntersection = _.filter(dataSets, item => item[`AV_${cand1}`] == 1 && item[`AV_${cand2}`] == 1).length;
      const countUnion = _.filter(dataSets, item => item[`AV_${cand1}`] == 1 || item[`AV_${cand2}`] == 1).length;
      row[cand2] = countIntersection / countUnion; 
      // row.push(countIntersection / countUnion);
    });
    mutualApData.push(row)
  });

  const cellGroups = svg.append('g');
  candidates.forEach((cand, j) => {
    const group = cellGroups.selectAll(`.grid-cell.grid-cell-${j}`)
      .data(mutualApData)
      .enter().append('g')
        .attr('class', `grid-cell grid-cell-${j}`)
        .attr('transform', (d, i) => `translate(${i * gridSize}, ${j * gridSize})`)
    group.append('rect')
      .attr('stroke', '#333')
      .attr('fill', 'none')
      .attr('width', gridSize)
      .attr('height', gridSize);
    group.append('text')
      .text(d => d[cand])
      .style('stroke', '#f00')
    group.exit().remove();
  });
}

class InfoVisComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    let dataSets = parseSsvData(vt1, vt2, vt3);
    console.log(dataSets)
    mutualApprovalHeatMap(dataSets, 'mutual-ap-container');
    
    
  }

  render() {
    return (
      <section>
        <h1 style={s.title}>Information Visualization Demo</h1>
        <div id="mutual-ap-container" className="graph-container" />
      </section>
    );
  }
}

export default InfoVisComponent;
