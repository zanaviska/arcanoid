import React, {Component} from 'react';
import { View, Text } from 'react-native';
import { TextInput, Button } from 'react-native-paper';

export default class Registration extends Component {
  state = {
    username: '',
    password: ''
  }
  render() {
    return (
      <View style={{flex: 1, backgroundColor: 'red'}}>
        <TextInput label="Username" onChangeText={text => this.setState({username: text})} value={this.state.username}/>
        <TextInput label="Password" onChangeText={text => this.setState({password: text})} value={this.state.password}/>
        <Text />
        <Button icon="registration" mode="contained" onPress={() => {
          sendReq('registration username ' + this.state.username + ' password ' + this.state.password, () => {
            this.props.navigation.goBack()
          })
        }}>
          Register
        </Button>
      </View>
    )
  }
}