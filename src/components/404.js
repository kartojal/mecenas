import React, { Component } from "react";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";

export default class Error404 extends Component {
  render() {
    return (
      <main style={{padding: 200}}>
        <Grid container alignItems="center">
          <Typography variant="display4">Not found</Typography>
          <Typography variant="display4" color="secondary" style={{marginLeft: 50}}>¯\_(ツ)_/¯</Typography>
        </Grid>
        <Typography variant="subheading" style={{marginTop: 40}}>The resourse you tried to load is not found. If you find something is broken, reach me at <a target="_blank" href="https://github.com/kartojal" style={{color: "orange"}}>github.com/kartojal</a></Typography>
      </main>
    )
  }
}