import React from 'react'
import ReactDOM from 'react-dom'

// import store from './store'

// Setup drizzle
import drizzleOptions from './drizzleOptions'
import { Drizzle, generateStore } from "drizzle";
import { DrizzleContext } from "drizzle-react";

const drizzleStore = generateStore(drizzleOptions);
const drizzle = new Drizzle(drizzleOptions, drizzleStore);

// components
import App from './App'
import Home from './components/home/Home'
import Registry from './components/registry/Registry'
import ContentCreatorView from './components/content_creator/ContentCreatorView'
import BeMecenas from './components/be_mecenas/BeMecenasView'
import Error404 from './components/404';
import { LoadingContainer } from 'drizzle-react-components'

import {
  BrowserRouter as Router,
  Route,
  Switch
} from 'react-router-dom'


ReactDOM.render((
  <DrizzleContext.Provider drizzle={drizzle}>
    <Router basename={`${process.env.PUBLIC_URL}`}>
      <App>
        <Switch>
          <Route exact path='/' component={Home} />
          <Route path='/registry' component={Registry} />
          <Route path='/be-mecenas/:contentCreator' component={BeMecenas} />
          <Route path='/not-found' component={Error404} />
          <Route sensitive path='/:contentCreator' component={ContentCreatorView} />
          <Route component={Error404} />
        </Switch>
      </App>
    </Router>
  </DrizzleContext.Provider>
  ),
  document.getElementById('root')
);
/*

*/
