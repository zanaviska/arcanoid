import React, { Component } from "react";
import { View, StyleSheet, Text } from "react-native";
import { TextInput, Button, Checkbox } from 'react-native-paper';
import Spinner from 'react-native-loading-spinner-overlay';
import { TouchableOpacity } from "react-native-gesture-handler";

import { settings, storeData, getData, sendReq, account } from "./settings";

class Login extends Component {
  login(username, password) {
    this.setState({spinner: true});
    console.log(username, password);
    sendReq('login username '+ username +' password ' + password, (msg)=>{
      console.log('!', msg);
      this.setState({spinner: false});
      if(msg.status === 'failed') return;
      account.wins = msg.wins;
      account.games = msg.games;
      account.username = username;
      account.id = msg.id;
      account.password = password;
      if(this.state.checked) {
        storeData('auth', JSON.stringify({username: this.state.username, password: this.state.password}));
      }
      this.props.navigation.navigate('Account');
    });  
  }
  constructor(props) {
    super(props);
    getData('auth', arg => {
      const obj = JSON.parse(arg);
      this.login(obj.username, obj.password);
    });
  }
  state = {
    username: '',
    password: '',
    checked: false,
    spinner: false
  }
  render() {
    const { checked } = this.state;
    return (
      <View style={styles.page}>
        <Spinner
          visible={this.state.spinner}
          textContent={'Loading...'}
          textStyle={styles.spinnerTextStyle}
        />
        <View style={styles.textInput}><TextInput label="Username" onChangeText={text => this.setState({username: text})} value={this.state.username}/></View>
        <View style={styles.textInput}><TextInput label="Password" onChangeText={text => this.setState({password: text})} value={this.state.password}/></View>
        <View style={styles.checkbox}>
          <Checkbox
            status={checked ? 'checked' : 'unchecked'}
            onPress={() => { this.setState({ checked: !checked }); }}
          />
          <Text>Remember me</Text>
        </View>
        <Button icon="login" mode="contained" onPress={() => this.login(this.state.username, this.state.password)}>
          Login
        </Button>
        <Text />
        <Text />
        <TouchableOpacity onPress={() => this.props.navigation.navigate('Registration')}><Text>Register</Text></TouchableOpacity>
      </View>
    )
  }
};

export default Login;

const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  textInput: {
    padding: 20,
    width: '100%',
  },
  checkbox: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10
  }
})