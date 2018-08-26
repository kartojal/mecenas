import React, { Component } from 'react'
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { withStyles } from '@material-ui/core/styles';

import { lightBlue } from '@material-ui/core/colors';
import 'typeface-roboto'

import Toolbar from './components/Toolbar'
import Footer from './components/Footer'

// Styles
import './css/oswald.css'
import './css/open-sans.css'
import "react-placeholder/lib/reactPlaceholder.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import './App.css'

const theme = createMuiTheme({
  palette: {
    secondary: {
      main: "#fda941",
    },
    primary: lightBlue,
    type: 'light',
  },
  overrides: {
    MuiButton: {
      label: {
        color: 'white',
      },
    },
  }
});

const styles = theme => ({
  appMain: {
  }
});

class App extends Component {
  render() {
    const { classes } = this.props;

    return ( 
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <Toolbar/>
        <main className={classes.appMain}>
           {this.props.children}
        </main>
        <Footer />
      </MuiThemeProvider>
    )
  }
}

export default   withStyles(styles)(App)