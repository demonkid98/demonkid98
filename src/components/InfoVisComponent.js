import React from 'react';
import Interactive from 'react-interactive';
import { Switch, Route, Link } from 'react-router-dom';
import PageNotFound from './PageNotFound';

import InfoVisApCorrelationComponent from './InfoVisApCorrelationComponent';
import InfoVisApEvalComponent from './InfoVisApEvalComponent';

import '../styles/info-vis.scss';

export default function InfoVisComponent() {
  return (
    <Switch>
      <Route exact path="/info-vis/approval-correlation" component={InfoVisApCorrelationComponent} />
      <Route exact path="/info-vis/approval-vs-evaluation" component={InfoVisApEvalComponent} />
      <Route
        exact path="/info-vis"
        render={() => (
          <section>
            <h1>Information Visualization Demos</h1>
            <ul>
              <li>
                <Interactive
                  as={Link}
                  to="/info-vis/approval-correlation"
                >Demo 1</Interactive>
              </li>
              <li>
                <Interactive
                  as={Link}
                  to="/info-vis/approval-vs-evaluation"
                >Demo 2</Interactive>
              </li>
            </ul>
          </section>
        )}
      />
      <Route component={PageNotFound} />
    </Switch>
  );
}
