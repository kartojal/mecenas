import React, { PureComponent } from 'react'
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import withDrizzleContext from "../../../util/withDrizzleContext";
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';


const styles = theme => ({
  paper: {
    marginTop: "22px",
    padding: "22px"
  },
  multiline: {
    width: "300px",
    fontSize: "18px",
    backgroundColor: "#d3d3d352"
  },
  name: {
    fontSize: "18px"
  }
});

class CreateMessage extends PureComponent {
  state = {
    errorText: ''
  }

  setName = (e) => {
    e.preventDefault();
    this.props.setName(value);
  }
  setMessage = (e) => {
    e.preventDefault();
    this.props.setMessage(value);
  }
  render() {
    const { classes, creator, message, name } = this.props;
    const { errorText } = this.state;
    return (
      <Paper className={classes.paper} elevation={1}>
        <Typography variant="title">
          Write your message to {name}
        </Typography>
        <br/>
        <Typography variant="body2">
          Your name
        </Typography>
        <TextField InputProps={{ className: classes.name}}  value={name} placeholder="Your name" onChange={this.setName}  margin="none" />
        <br/><br/>
        <Typography variant="body2">
          Your support message
        </Typography>
        <TextField multiline InputProps={{ className: classes.multiline}}  value={message} placeholder="Your message to the content creator" rows={6} onChange={this.setMessage} className={classes.textField} margin="none" />
      </Paper>
    )
  }
}

export default withStyles(styles)(CreateMessage);
