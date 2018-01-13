import React from 'react';
import Interactive from 'react-interactive';
import { Switch, Route, Link } from 'react-router-dom';
import PageNotFound from './PageNotFound';

import _ from 'lodash';
import numeral from 'numeral';
import qs from 'querystring';

import vt1 from '../assets/VT1.csv';
import vt2 from '../assets/VT2.csv';
import vt3 from '../assets/VT3.csv';

import * as d3Original from 'd3';
import * as d3ScaleChromatic from 'd3-scale-chromatic';
const d3 = Object.assign({}, d3Original, d3ScaleChromatic);

import '../styles/info-vis.scss';

let ssv = d3.dsvFormat(';');

const margin = { top: 30, right: 100, bottom: 20, left: 45 };
const width = 640 - margin.left - margin.right;
const height = 450 - margin.top - margin.bottom;
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
  let x = d3.scaleLinear().domain([0, candidates.length]).range([0, height]); // h < w
  let y = d3.scaleLinear().domain([0, candidates.length]).range([0, height]);

  const yLabels = svg.append('g')
    .attr('class', 'axis axis-y')
    .selectAll('.label-candidate-y')
    .data(candidates)
    .enter().append('text')
      .text(d => d)
      .attr('x', 0)
      .attr('y', (d, i) => y(i))
      .style('text-anchor', 'end')
      .attr('transform', `translate(-6, ${gridSize / 1.5})`)
      .attr('class', 'label-candidate label-candidate-y');

  const xLabels = svg.append('g')
    .attr('class', 'axis axis-x')
    .selectAll('.label-candidate-x')
    .data(candidates)
    .enter().append('text')
      .text(d => d)
      .attr('x', (d, i) => x(i))
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
        row[cand2] = {i: 0, u: 0, r: 0};
      } else {
        const countIntersection = _.filter(dataSets, item => item[`AV_${cand1}`] == 1 && item[`AV_${cand2}`] == 1).length;
        const countUnion = _.filter(dataSets, item => item[`AV_${cand1}`] == 1 || item[`AV_${cand2}`] == 1).length;
        row[cand2] = {i: countIntersection, u: countUnion, r: countIntersection / countUnion};
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
        .attr('transform', (d, i) => `translate(${x(i)}, ${y(j)})`)
        .on('mouseover', (d, i) => {
          if (i === j) {
            return;
          }
          const tooltip = svg.append('g')
            .attr('id', `tooltip-cell-${cand}-${i}`)
            .attr('class', 'tooltip')
            .attr('transform', `translate(${x(i + 1) + 3}, ${y(j) - 4})`);
          tooltip.append('rect')
            .attr('width', 150)
            .attr('height', 53);
          tooltip.append('text')
            .text(`# votes for ${cand} and/or ${candidates[i]}`)
            .attr('transform', 'translate(5, 15)');
          tooltip.append('text')
            .text(`- both: ${d[cand]['i']}`)
            .attr('transform', 'translate(10, 30)');
          tooltip.append('text')
            .text(`- either one: ${d[cand]['u']}`)
            .attr('transform', 'translate(10, 45)');
        })
        .on('mouseout', (d, i) => {
          svg.selectAll(`#tooltip-cell-${cand}-${i}`)
            .remove();
        });
    group.append('rect')
      .attr('stroke', '#333')
      .attr('fill', d => colorScale(d[cand]['r']))
      .attr('width', gridSize)
      .attr('height', gridSize);
    group.append('text')
      .text(d => numeral(d[cand]['r']).format('0.00'))
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('visibility', (d, i) => i === j ? 'hidden' : 'visible')
      .attr('x', gridSize / 2)
      .attr('y', gridSize / 2)
      .attr('stroke', d => d[cand]['r'] >= maxVal / 2 ? '#fff' : '#333')
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
    .attr('transform', `translate(${gridSize * candidates.length + 30}, 0)`)
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
      .attr('class', 'scale-color-edge');
  legend.selectAll('bars')
    .data(scaleBarPoints)
    .enter()
    .append('rect')
      .attr('x', 0)
      .attr('y', (d, i) => i * barHeight)
      .attr('width', barWidth)
      .attr('height', barHeight)
      .attr('stroke', colorScale)
      .attr('fill', colorScale);
}

class InfoVisApCorrelationComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const queries = qs.parse(this.props.location.search.replace('?', ''));
    if (queries.hasOwnProperty('g')) {
      document.body.classList.add('g');
    }

    let dataSets = parseSsvData(vt1, vt2, vt3);
    mutualApprovalHeatMap(dataSets, 'mutual-ap-container');
  }

  componentWillUnmount() {
    document.body.classList.remove('g');
  }

  render() {
    return (
      <section className="content">
        <h1>Information Visualization Demo</h1>
        <p>Which candidates are approved together?</p>
        <div id="mutual-ap-container" className="graph-container" />
      </section>
    );
  }
}

export default InfoVisApCorrelationComponent;
