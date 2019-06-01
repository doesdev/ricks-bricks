# ricks-bricks [![NPM version](https://badge.fury.io/js/ricks-bricks.svg)](https://npmjs.org/package/ricks-bricks)   [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)   [![Dependency Status](https://dependencyci.com/github/doesdev/ricks-bricks/badge)](https://dependencyci.com/github/doesdev/ricks-bricks)

> Run if happened X times within X ms and hasn't been run in X ms

## What is it this?

Simply put it's yet another throttling utility. Specifically, I made to restart
a server process if ECONNREFUSED is encountered by the reverse proxy beyond the
threshold. It has plenty of other potential uses, but more than anything I
wanted the logic isolated and reusable. So here it is in module form.

## Double you tea eff is that name 'bout brah?

Run if happened X times within X seconds(ms, actually) and hasn't been run in X seconds(ms)   
-> rihxtwxsahbrixs   
-> rix-twix-sabrixs   
-> ricks-bricks   

## Install

```sh
$ npm install --save ricks-bricks
```

## Usage

#### Only execute callback if called with same signature count >= threshold
```js
const rb = require('ricks-bricks')
const someCb = () => console.log('oak yeah')

// set the threshold
const rbOpts = { threshold: 3 }

// call with sig 2 times, 1 less than threshold
rb('sig', someCb, rbOpts)
rb('sig', someCb, rbOpts)
// call with differentSig once, doesn't trigger callback
rb('differentSig', someCb, rbOpts)
// call with sig a third time, now meets threshold, executes callback
rb('sig', someCb, rbOpts)
```

#### Only execute callback if (...) within specified timeframe
```js
const rb = require('ricks-bricks')
const ms = require('pico-ms')
const someCb = () => console.log('oak yeah')
const delay = async (d) => {
  await new Promise((resolve, reject) => setTimeout(resolve, d))
}

// this time also we also set resetAfter
const rbOpts = { threshold: 3, resetAfter: ms('5sec') }

async function main () {
// call with sig 2 times, 1 less than threshold
  rb('sig', someCb, rbOpts)
  rb('sig', someCb, rbOpts)
  // wait 7 seconds
  await delay(ms('7sec'))
  // call with sig 3rd time, outside resetAfter, doesn't trigger callback
  rb('sig', someCb, rbOpts)
  // now call again once, shouldn't meet threshold
  rb('sig', someCb, rbOpts)
  // now call again, should meet threshold and call
  rb('sig', someCb, rbOpts)
}
main()
```

#### Only execute callback if (...) throttling calls for X ms
```js
const rb = require('ricks-bricks')
const ms = require('pico-ms')
const someCb = () => console.log('oak yeah')
const delay = async (d) => {
  await new Promise((resolve, reject) => setTimeout(resolve, d))
}

// this time also we also set throttle
const rbOpts = { threshold: 3, throttle: ms('5sec') }

async function main () {
  // call with sig 3 times, should execute callback
  rb('sig', someCb, rbOpts)
  rb('sig', someCb, rbOpts)
  rb('sig', someCb, rbOpts)
  // call a 4th time and 5th time, it should not execute, end count should be 1
  rb('sig', someCb, rbOpts)
  rb('sig', someCb, rbOpts)
  // wait 7 seconds
  await delay(ms('7sec'))
  // call again, should effectively be the 2nd call as far as count is concerned
  rb('sig', someCb, rbOpts)
  // and we call one last time, this should be 3 and trigger cb
  rb('sig', someCb, rbOpts)
}
main()
```

## API

#### `rb(signature, callback, options)`
- **signature** *(String - required)*
  - Identifier to track
- **callback** *(Function - required)*
  - Function to execute when conditions met
- **options** *(Object - optional)*
  - **threshold** *(Number - optional)*
    - How many times rb is called for signature before we execute callback
  - **throttle** *(Number - milliseconds - optional)*
    - Once callback is executed don't track until this many ms have passed
  - **resetAfter** *(Number - milliseconds - optional)*
    - Reset tracking once this many ms have passed since previous call

## License

MIT © [Andrew Carpenter](https://github.com/doesdev)
