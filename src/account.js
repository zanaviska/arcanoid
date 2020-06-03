import React, {Component} from 'react';
import { View, Text } from 'react-native';
import { Button } from 'react-native-paper';
import AsyncStorage from '@react-native-community/async-storage';
import Spinner from 'react-native-loading-spinner-overlay';

import { settings, storeData, getData, sendReq, account, clearPending } from "./settings";

export default class Account extends Component {
  state = {
    username: '',
    password: '',
    spinner: false,
    games: 0,
    wins: 0
  }
  componentWillMount() {
    this.forceUpdate();
    this._unsubscribe = this.props.navigation.addListener('focus', () => {
      console.warn('I am focused');
      sendReq('login username '+ account.username +' password ' + account.password, (msg)=>{
        this.setState({spinner: false});
        console.log('sending is done')
        console.warn('!', msg);
        if(msg.status === 'failed') return;
        account.wins = msg.wins;
        account.games = msg.games;
        account.id = msg.id;
        this.setState({wins: msg.wins, games: msg.games}, () => console.log(this.state));
      });  
    });
  }
  render() {
    return (
      <View style={{flex: 1}}>
        
        <Spinner
          visible={this.state.spinner}
          textContent={'Loading...'}
        />
        <Button icon="play" mode="contained" onPress={() => {
          this.setState({spinner: true})
          sendReq("start id " + account.id, msg => {
            console.log(msg)
            console.log('!!!!!!!!!!!!!!!!!!!!11');
            this.setState({spinner: false});
            this.props.navigation.navigate('Game', {port: msg.port});
          }, 3000);
        }}>
          Play
        </Button>
        <Text />
        <Text>Username: {account.username}</Text>
        <Text>Win: {this.state.wins}</Text>
        <Text>Games: {this.state.games}</Text>
        <Text>Percantage: {(this.state.games ? this.state.wins/this.state.games*100 : 0)}%</Text>
        <Text />
        <Text />
        <Text />
        <Text />
        <Button icon="logout" mode="contained" onPress={() => {
          account.username = '';
          account.password = '';
          clearPending();
          AsyncStorage.clear();
          this.props.navigation.goBack();
        }}>
          Log out
        </Button>
      </View>
    )
  }
}