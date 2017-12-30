import React from 'react';
import Interactive from 'react-interactive';
import { Switch, Route } from 'react-router-dom';
import Home from './Home';
import ExampleComponent from './ExampleComponent';
import InfoVisApCorrelationComponent from './InfoVisApCorrelationComponent';
import InfoVisApEvalComponent from './InfoVisApEvalComponent';
import PageNotFound from './PageNotFound';
import Breadcrumbs from './Breadcrumbs';
import s from '../styles/app.style';

export default function App() {
  return (
    <div style={s.root}>
      <h1 style={s.title}>trungv</h1>

      <nav style={s.breadcrumbs}>
        <Breadcrumbs />
      </nav>

      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/example" component={ExampleComponent} />
        {/* <Route path="/info-vis" component={InfoVisComponent} /> */}
        <Route path="/info-vis/approval-correlation" component={InfoVisApCorrelationComponent} />
        <Route path="/info-vis/approval-vs-evaluation" component={InfoVisApEvalComponent} />
        <Route component={PageNotFound} />
      </Switch>
    </div>
  );
}
