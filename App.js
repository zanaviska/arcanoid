import * as React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import Gameplay from './src/gameplay';
import Login from './src/login';
import Registration from './src/registration';
import Account from './src/account';
import {settings} from './src/settings';

const Stack = createStackNavigator();

function App() {
  return (
    <SafeAreaView style={{flex: 1}}> 
      <View style={{flex: 1}} onLayout={({nativeEvent}) => {settings.height = nativeEvent.layout.height; settings.width = nativeEvent.layout.width}}>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="Login" component={Login} options={{headerShown: false}}/>
            <Stack.Screen name="Registration" component={Registration}/>
            <Stack.Screen name="Account" component={Account}/>
            <Stack.Screen name="Game" component={Gameplay} options={{headerShown: false}}/>
          </Stack.Navigator>
        </NavigationContainer>
      </View>
    </SafeAreaView>
  );
}

export default App;