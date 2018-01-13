import React from 'react';
import Interactive from 'react-interactive';
import { Switch, Route } from 'react-router-dom';
import Home from './Home';
import ExampleComponent from './ExampleComponent';
import InfoVisComponent from './InfoVisComponent';
import PageNotFound from './PageNotFound';
import Breadcrumbs from './Breadcrumbs';

import '../styles/global.scss';

export default function App() {
  return (
    <div>
      <nav className="breadcrumbs">
        <Breadcrumbs />
      </nav>

      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/example" component={ExampleComponent} />
        <Route path="/info-vis" component={InfoVisComponent} />
        <Route component={PageNotFound} />
      </Switch>
    </div>
  );
}
