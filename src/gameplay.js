import React, { Component } from 'react';
import { StyleSheet, View, NativeModules, Text, Dimensions } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import Animated, { block } from 'react-native-reanimated';
//import dgram from 'react-native-udp';
import dgram from 'dgram';
import Modal from 'react-native-modal';

import {settings, account} from './settings';

let {width, height} = settings;

const {
  or,
  event,
  Value,
  Clock,
  call,
  lessThan,
  greaterThan,
  divide,
  diff,
  abs,
  startClock,
  stopClock,
  cond,
  add,
  multiply,
  eq,
  set,
  sub,
  min,
  max,
  debug,
  and,
  lessOrEq,
  greaterOrEq,
  not
} = Animated;

const VELOCITY_THRESHOLD = 0.5;
const POSITION_THRESHOLD = 0.5;
let VELOCITY = width/2;
let paddleWidth = width/4;
let paddleHeight = height*0.04;
let blockWidth = 0.2*width;
let blockHeight = 0.05*height;


class App extends Component {
  port = this.props.route.params.port;
  constructor(props) {
    //const client = dgram.createSocket("udp4");
    super(props);
    this.client = dgram.createSocket("udp4");
    this.client.on('message', (msg, info) => {
      console.log(JSON.parse(msg.toString()));
    })
    width = settings.width;
    height = settings.height;
    VELOCITY = width/2;
    paddleWidth = width/4;
    paddleHeight = height*0.04;
    blockWidth = 0.2*width;
    blockHeight = 0.05*height;
    this.blocks = [
      {top: 0.88*height, width: paddleWidth, height: paddleHeight},
      {top: 0.225*height, left: 0, backgroundColor: 'red', width: blockWidth, height: blockHeight},
      {top: 0.225*height, left: (width - blockWidth)/3, backgroundColor: 'blue', width: blockWidth, height: blockHeight},
      {top: 0.225*height, left: 2*(width - blockWidth)/3, backgroundColor: 'red', width: blockWidth, height: blockHeight},
      {top: 0.225*height, left: (width - blockWidth), backgroundColor: 'blue', width: blockWidth, height: blockHeight},
      {top: 0.725*height, left: 0, backgroundColor: 'blue', width: blockWidth, height: blockHeight},
      {top: 0.725*height, left: (width - blockWidth)/3, backgroundColor: 'red', width: blockWidth, height: blockHeight},
      {top: 0.725*height, left: 2*(width - blockWidth)/3, backgroundColor: 'blue', width: blockWidth, height: blockHeight},
      {top: 0.725*height, left: (width - blockWidth), backgroundColor: 'red', width: blockWidth, height: blockHeight},
      {top: 0.625*height, left: 0, backgroundColor: 'red', width: blockWidth, height: blockHeight},
      {top: 0.625*height, left: (width - blockWidth)/3, backgroundColor: 'blue', width: blockWidth, height: blockHeight},
      {top: 0.625*height, left: 2*(width - blockWidth)/3, backgroundColor: 'red', width: blockWidth, height: blockHeight},
      {top: 0.625*height, left: (width - blockWidth), backgroundColor: 'blue', width: blockWidth, height: blockHeight},
      {top: 0.325*height, left: 0, backgroundColor: 'blue', width: blockWidth, height: blockHeight},
      {top: 0.325*height, left: (width - blockWidth)/3, backgroundColor: 'red', width: blockWidth, height: blockHeight},
      {top: 0.325*height, left: 2*(width - blockWidth)/3, backgroundColor: 'blue', width: blockWidth, height: blockHeight},
      {top: 0.325*height, left: (width - blockWidth), backgroundColor: 'red', width: blockWidth, height: blockHeight},
      {top: 0.425*height, left: 0, backgroundColor: 'red', width: blockWidth, height: blockHeight},
      {top: 0.425*height, left: (width - blockWidth)/3, backgroundColor: 'blue', width: blockWidth, height: blockHeight},
      {top: 0.425*height, left: 2*(width - blockWidth)/3, backgroundColor: 'red', width: blockWidth, height: blockHeight},
      {top: 0.425*height, left: (width - blockWidth), backgroundColor: 'blue', width: blockWidth, height: blockHeight},
      {top: 0.525*height, left: 0, backgroundColor: 'blue', width: blockWidth, height: blockHeight},
      {top: 0.525*height, left: (width - blockWidth)/3, backgroundColor: 'red', width: blockWidth, height: blockHeight},
      {top: 0.525*height, left: 2*(width - blockWidth)/3, backgroundColor: 'blue', width: blockWidth, height: blockHeight},
      {top: 0.525*height, left: (width - blockWidth), backgroundColor: 'red', width: blockWidth, height: blockHeight},
      {top: 0.08*height, width: paddleWidth, height: paddleHeight}
    ]
    this.deleted = this.blocks.map(elem => 0);
    this.deleted2 = this.blocks.map(() => new Value(0));
    this.state = {reverseTimer: 3};
    console.log(settings);
    const buf = Buffer('excellent!')
    /*client.send(buf, 0, buf.length, port, ip, function(err) {
      if (err) throw err
    })*/
    const gestureX = new Value(0);
    const state = new Value(-1);
    this._onGestureEvent = event([
      {
        nativeEvent: {
          x: gestureX,
          state: state,
        },
      },
    ]);
    const myNotAnim = 0.5;
    const myX = new Value(width/2 - paddleWidth/2);
    const notMyX = new Value(50);
    const movePaddle = (gestureX, gestureState) => {
      const position = new Value(width/2 - paddleWidth/2);
      const velocity = new Value(0);
      const dest = new Value(0);
      
      const clock = new Clock();
      const dt = divide(diff(clock), 1000);
      const dp = multiply(velocity, dt);

      const move = (position, dest, velocity) => set(
        velocity,
        cond(
          lessThan(position, dest),
          VELOCITY,
          cond(greaterThan(position, dest), -VELOCITY, 0)
        )
      )
      //setInterval(() => {console.log(myNotAnim)}, 500);
      return cond(
        or(eq(gestureState, State.ACTIVE), eq(gestureState, State.BEGAN)),
        [
          startClock(clock),
          set(dest, add(gestureX, -paddleWidth/2)),
          set(dest, max(dest, 0)),
          set(dest, min(dest, width-paddleWidth)),
          move(position, dest, velocity),
          
          //call([dest, position], ([dest, pos]) => {const buf = Buffer(`${dest/width} ${pos/width} ${Date.now()}`); client.send(buf, 0, buf.length, port, ip, function(err) {});}),
          cond(lessThan(abs(sub(position, dest)), VELOCITY_THRESHOLD), stopClock(clock)),
          set(position, add(position, cond(lessThan(abs(dp), abs(sub(dest, position))), dp, sub(dest, position)))),
          set(myX, position),
          position
        ],
        [
          startClock(clock),
          dt,
          position
        ]
      )
    }
    let ballVelocity = {
      x: new Value(width/1.2),
      y: new Value(width/1.2)
    }
    let ball = {
      x: new Value(width/2 - 0.015*width),
      y: new Value(height/2 - 0.015*width)
    }
    const removeElem = (idx) => {
      if(idx !== 0 && idx !== this.blocks.length-1) {
        this.deleted[idx] = 1;
        this.forceUpdate();
      }
    }
    const moveBallX = (velocity) => {
      const clock = new Clock();
      const dt = divide(diff(clock), 1000);
      const dp = multiply(velocity.x, dt);
      const truly = new Value(1);
      return cond(truly, [
        startClock(clock),
        cond(
          and(greaterThan(add(ball.x, 0.03*width), width), greaterThan(velocity.x, 0)), 
          set(velocity.x, multiply(velocity.x, -1)),
          cond(and(lessThan(ball.x, 0), lessThan(velocity.x, 0)), set(velocity.x, multiply(velocity.x, -1)))
        ),
        this.blocks.map((elem, idx) => {
          let need = new Value(0);
          if(idx === 0) elem.left = myX, need = new Value(1);
          if(idx == this.blocks.length-1) elem.left = notMyX, need = new Value(1);
          return cond(
            and(greaterOrEq(ball.y, elem.top), lessOrEq(add(ball.y, 0.03*width), elem.top + elem.height), not(this.deleted2[idx])),
            cond(
              and(lessOrEq(ball.x, elem.left), greaterOrEq(add(ball.x, 0.03*width), elem.left), greaterThan(velocity.x, 0)),
              [
                call([truly], () => removeElem(idx)),
                cond(not(need), set(this.deleted2[idx], new Value(1))),
                set(velocity.x, multiply(velocity.x, -1))
              ],
              cond(
                and(lessOrEq(ball.x, add(elem.left, elem.width)), greaterOrEq(add(ball.x, 0.03*width), add(elem.left, elem.width)), lessThan(velocity.x, 0)),
                [
                  call([truly], () => removeElem(idx)),
                  cond(not(need), set(this.deleted2[idx], new Value(1))),
                  set(velocity.x, multiply(velocity.x, -1))
                ]
              )
            ),
            []
          );
        }),
        set(ball.x, add(ball.x, dp)),
        ball.x
      ])
    };
    const moveBallY = (velocity) => {
      const clock = new Clock();
      const dt = divide(diff(clock), 1000);
      const dp = multiply(velocity.y, dt);
      const truly = new Value(1);
      return cond(truly, [
        startClock(clock),
        cond(
          and(greaterThan(add(ball.y, 0.03*width), height), greaterThan(velocity.y, 0)), 
          set(velocity.y, multiply(velocity.y, -1)),
          cond(and(lessThan(ball.y, 0), lessThan(velocity.y, 0)), set(velocity.y, multiply(velocity.y, -1)))
        ),
        cond(
          and(lessThan(ball.x, this.myPaddleX), lessThan(velocity.x, 0)),
          set(velocity.x, multiply(velocity.x, -1)),
        ),
        this.blocks.map((elem, idx) => {
          let need = new Value(0);
          if(idx === 0) elem.left = myX, need = new Value(1);
          if(idx == this.blocks.length-1) elem.left = notMyX, need = new Value(1);
          return cond(
            and(greaterOrEq(ball.x, elem.left), lessOrEq(add(ball.x, 0.03*width), add(elem.left, elem.width)), not(this.deleted2[idx])),
            cond(
              and(lessOrEq(ball.y, elem.top), greaterOrEq(add(ball.y, 0.03*width), elem.top), greaterThan(velocity.y, 0)),
              [
                call([truly], () => removeElem(idx)),
                cond(not(need), set(this.deleted2[idx], new Value(1))),
                set(velocity.y, multiply(velocity.y, -1))
              ],
              cond(
                and(lessOrEq(ball.y, elem.top + elem.height), greaterOrEq(add(ball.y, 0.03*width), elem.top+elem.height), lessThan(velocity.y, 0)),
                [
                  call([truly], () => removeElem(idx)),
                  cond(not(need), set(this.deleted2[idx], new Value(1))),
                  set(velocity.y, multiply(velocity.y, -1))
                ]
              )
            ),
            []
          );
        }),
        set(ball.y, add(ball.y, dp)),
        ball.y
      ])
    }
    this.ballPosX = moveBallX(ballVelocity);
    this.ballPosY = moveBallY(ballVelocity);
    this.myPaddleX = movePaddle(gestureX, state)
    this.blocks[0].left = this.myPaddleX;
  }
  componentDidMount() {
    console.log(account)
    const reverseTimeProc = setInterval(() => {
      this.setState({reverseTimer: this.state.reverseTimer-1}, () => {
        if(this.state.reverseTimer === 0) clearInterval(reverseTimeProc);
        const buf = Buffer('id ' + account.id + ' dest 0.5 pos 0.5 date ' + Date.now());
        this.client.send(buf, 0, buf.length, this.port, settings.ip, function(err) {});
      });
    }, 1000)
  }
  render() {
    return (
      <View style={styles.container}>
        <Modal isVisible={!!this.state.reverseTimer}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{fontSize: 30}}>{this.state.reverseTimer}</Text>
          </View>
        </Modal>
        <PanGestureHandler
          onGestureEvent={this._onGestureEvent}
          onHandlerStateChange={this._onGestureEvent}
        >
          <Animated.View style={styles.hor}>
            {
              this.blocks.reduce((acc, cur, idx) => {
                if(idx === 0 || idx === this.blocks.length-1)
                  acc.push(
                    <View style={styles.paddleSpace} key={idx}>
                      <Animated.View 
                        style={[
                          styles.box,
                          {
                            transform: [{ translateX: (idx === 0 ? this.myPaddleX : 50) }],
                            backgroundColor: (idx === 0 ? '#FF4400' : '#0064FF')
                          }
                        ]}
                      />
                    </View>
                  )
                else if(!this.deleted[idx])
                  acc.push(
                    <View 
                      key={idx}
                      style={[
                        styles.block,
                        cur
                      ]}
                    />
                  )
                return acc;
              }, [])
            }
            <Animated.View 
              style={[
                styles.ball,
                {
                  top: 0,
                  left: 0,
                  transform: [{translateX: this.ballPosX}, {translateY: this.ballPosY}]
                }
              ]}
            />
          </Animated.View>
        </PanGestureHandler>
      </View>
    )
  }
}

export default App;

const BOX_SIZE = 100;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#F5FCFF',
  },
  box: {
    width: paddleWidth,
    height: '20%',
    backgroundColor: 'teal',
    //margin: BOX_SIZE / 2,
  },
  block: {
    position: 'absolute',
    width: paddleWidth,
    height: paddleHeight,
    backgroundColor: 'black'
  },
  hor: {
    flex: 1,
    justifyContent: 'space-between',
    flexDirection: 'column-reverse'
  },
  paddleSpace: {
    width: '100%',
    height: '20%',
    justifyContent: 'center',
  },
  ball: {
    borderRadius: 2000,
    backgroundColor: 'black',
    position: 'absolute',
    width: '3%',
    aspectRatio: 1
  }
});
