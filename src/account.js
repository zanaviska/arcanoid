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
    spinner: false
  }
  componentWillMount() {
    this.forceUpdate();
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
        <Text>Win: {account.wins}</Text>
        <Text>Games: {account.games}</Text>
        <Text>Percantage: {(account.games ? account.wins/account.games*100 : 0)}%</Text>
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