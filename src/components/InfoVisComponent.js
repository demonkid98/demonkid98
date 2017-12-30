import React from 'react';
import Interactive from 'react-interactive';
import { Switch, Route, Link } from 'react-router-dom';
import PageNotFound from './PageNotFound';

import _ from 'lodash';
import numeral from 'numeral';

import vt1 from '../assets/VT1.csv';
import vt2 from '../assets/VT2.csv';
import vt3 from '../assets/VT3.csv';

import * as d3Original from 'd3';
import * as d3ScaleChromatic from 'd3-scale-chromatic';
const d3 = Object.assign({}, d3Original, d3ScaleChromatic);

import '../styles/info-vis.scss';

let ssv = d3.dsvFormat(';');

const margin = { top: 50, right: 0, bottom: 100, left: 45 };
const width = 640 - margin.left - margin.right;
const height = 480 - margin.top - margin.bottom;
const gridSize = Math.floor(height / 11);
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
    .attr('font-size', '80%')
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

  let maxVal = 0;
  const mutualApData = [];
  candidates.forEach(cand1 => {
    const row = {};

    candidates.forEach((cand2, j) => {
      if (cand1 === cand2) {
        row[cand2] = 0
      } else {
        const countIntersection = _.filter(dataSets, item => item[`AV_${cand1}`] == 1 && item[`AV_${cand2}`] == 1).length;
        const countUnion = _.filter(dataSets, item => item[`AV_${cand1}`] == 1 || item[`AV_${cand2}`] == 1).length;
        row[cand2] = countIntersection / countUnion;
        if (maxVal < countIntersection / countUnion) {
          maxVal = countIntersection / countUnion;
        }
        // row.push(countIntersection / countUnion);
      }
    });
    mutualApData.push(row)
  });

  const colorScale = d3.scaleSequential(d3.interpolateBlues)
    .domain([0, maxVal]);

  const cellGroups = svg.append('g');
  candidates.forEach((cand, j) => {
    const group = cellGroups.selectAll(`.grid-cell.grid-cell-${j}`)
      .data(mutualApData)
      .enter().append('g')
        .attr('class', `grid-cell grid-cell-${j}`)
        .attr('transform', (d, i) => `translate(${i * gridSize}, ${j * gridSize})`)
    group.append('rect')
      .attr('stroke', '#333')
      .attr('fill', d => colorScale(d[cand]))
      .attr('width', gridSize)
      .attr('height', gridSize);
    group.append('text')
      .text(d => numeral(d[cand]).format('0.00'))
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('visibility', (d, i) => i === j ? 'hidden' : 'visible')
      .attr('x', gridSize / 2)
      .attr('y', gridSize / 2)
      .attr('stroke', d => d[cand] >= maxVal / 2 ? '#fff' : '#333')
      .attr('font-size', '70%');
    group.exit().remove();
  });

  let scaleBarPoints = [];
  let nbPoints = 101;
  let barWidth = 15;
  let barHeight = height / nbPoints;
  for (let i = nbPoints - 1; i >= 0; i--) {
    scaleBarPoints.push(maxVal * i / nbPoints);
  }

  let legend = svg.append('g')
    .attr('class', 'scale-color')
    .attr('transform', `translate(400, 0)`)
    .attr('font-size', '70%')
    .attr('text-anchor', 'end');
  legend.append('text')
    .attr('dominant-baseline', 'middle')
    .attr('x', -5)
    .attr('y', 0)
    .text(numeral(maxVal).format('0.00'));
  legend.append('text')
    .attr('dominant-baseline', 'middle')
    .attr('x', -5)
    .attr('y', height)
    .text('0.00');
  legend.append('rect')
      .attr('width', barWidth)
      .attr('height', height)
      .attr('fill', 'none')
      .attr('stroke', '#333');
  legend.selectAll('bars')
    .data(scaleBarPoints)
    .enter()
    .append('rect')
      .attr('x', 0)
      .attr('y', (d, i) => i * barHeight)
      .attr('width', barWidth)
      .attr('height', barHeight)
      .attr('fill', colorScale);
}

class InfoVisComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    let dataSets = parseSsvData(vt1, vt2, vt3);
    mutualApprovalHeatMap(dataSets, 'mutual-ap-container');
  }

  render() {
    return (
      <section>
        <h1>Information Visualization Demo</h1>
        <div id="mutual-ap-container" className="graph-container" />
      </section>
    );
  }
}

export default InfoVisComponent;
