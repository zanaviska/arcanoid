import { Dimensions } from "react-native";
import AsyncStorage from '@react-native-community/async-storage';
import dgram from 'dgram';
global.Buffer = global.Buffer || require('buffer').Buffer;

let settings = {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    ip: '192.168.117.41',
    port: 35662
}

let account = {}

const storeData = async (key, value) => {
  try {
    await AsyncStorage.setItem('@'+key, value)
  } catch (e) {
    // saving error
  }
}

const getData = async (key, callback) => {
  try {
    const value = await AsyncStorage.getItem('@'+key)
    if(value !== null) {
      callback(value)
    }
  } catch(e) {
    // error reading value
  }
}

let pending = [];
const client = dgram.createSocket("udp4");
client.on('message', (msg, info) => {
  const obj = JSON.parse(msg.toString());
  const idx = pending.findIndex(elem => obj.date === elem.date);
  //console.warn(obj, idx);
  if(idx >= 0) {
    clearInterval(pending[idx].timer);
    pending[idx].callback(obj);
    pending.splice(idx, 1);
  }
  //console.log(obj, idx, pending);
})

const sendReq = (param, callback, delay = 300) => {
  const date = Date.now();
  const buf = Buffer(param + ' date ' + date);
  const timer = setInterval(() => {
    console.log(param + ' date ' + date);
    client.send(buf, 0, buf.length, settings.port, settings.ip, function(err) {})
  }, delay)
  pending.push({
    timer,
    callback,
    buf,
    date
  })  
}

const clearPending = () => {
  pending.forEach(element => {
    clearInterval(element.timer)
  });
  pending = [];
}

const generate = [...new Array(1<<12)].map((elem, idx) => {
  let res = 0;
  while(idx != 0) {
    res = 2*res + idx&1;
    idx = ~~(idx/2);
  }
  return res;
})

export {settings, storeData, getData, sendReq, account, clearPending, generate};