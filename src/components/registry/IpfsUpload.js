import React, { Component } from 'react';
import ipfsAPI from 'ipfs-api/lib/index.js';
import defaultAvatar from '../../default_avatar.png'
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Avatar from '@material-ui/core/Avatar';
import LinearProgress from '@material-ui/core/LinearProgress';
import Typography from '@material-ui/core/Typography';

const styles = theme => ({
  avatar: {
    width: 110,
    height: 110,
    marginTop: 30
  }
})

class IpfsUpload extends Component {
  constructor () {
    super()
    this.state = {
      added_file_hash: null,
      loading: false,
      errorMsg: ''
    }
    this.ipfsApi = new ipfsAPI('ipfs.infura.io', 5001,{ protocol: 'https' });
  }

  captureFile = (event) => {
    event.stopPropagation()
    event.preventDefault()
    const file = event.target.files[0]
    let reader = new window.FileReader()
    reader.onloadend = async () => {
      await this.saveToIpfs(reader)
    }
    reader.readAsArrayBuffer(file)
  }

  saveToIpfs = async (reader) => {
    this.setState({loading: true})
    const buffer = await Buffer.from(reader.result)
    return this.ipfsApi.add(buffer)
    .then((response) => {
      this.setState({loading: false})
      this.setState({added_file_hash: response[0].hash})
      this.props.onUpload(response[0].hash)
    }).catch((err) => {
      this.setState({
        loading: false,
        errorMsg: 'Unable to upload image to INFURA ipfs gateway. Please try again later.'
      })
    })
  }

  arrayBufferToString = (arrayBuffer) => {
    return String.fromCharCode.apply(null, new Uint16Array(arrayBuffer))
  }

  handleSubmit = (event) => {
    event.preventDefault()
  }

  render () {
    const  { classes } = this.props;
    const { added_file_hash, loading, errorMsg } = this.state;
    const currentUrl = `https://ipfs.io/ipfs/${added_file_hash}`
    return (
      <div>
        <p>Upload your avatar (Optional)</p>
        <input type="file" onChange={this.captureFile} />
        { added_file_hash && (
          <Grid container justify="center">
            <a target="_blank"
              href={currentUrl}>
              <Avatar src={currentUrl} className={classes.avatar} />
            </a>
          </Grid>
        )}
        { !added_file_hash && (
          <Grid container justify="center">
            <Avatar className={classes.avatar} src={defaultAvatar} />
          </Grid>
        )}
        { !!errorMsg.length && (<Typography variant="caption" align="center" color="error" style={{ marginTop: 10 }}>{errorMsg}</Typography>)}
        <div style={{ marginTop: 20, visibility: loading ? "visible": "hidden"}}>
          <LinearProgress color="secondary" style={{ marginTop: 20 }}/>
          <Typography variant="caption" style={{ marginTop: 10 }}>Uploading to IPFS via Infura. Can take some minutes, depending image size, please wait.</Typography>
        </div>
      </div>
    )
  }
}

export default withStyles(styles)(IpfsUpload)