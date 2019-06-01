'use strict'

const { runTests, testAsync } = require('mvt')
const rb = require('./index')
const ms = require('pico-ms')
const delay = async (d = 500) => {
  await new Promise((resolve, reject) => setTimeout(resolve, d))
}

runTests(`Testing ricks-bricks`, async () => {
  const testA = `rb only calls at threshold for signature`
  await testAsync(testA, async () => {
    let differentSig = 'differentSig'
    let called = false
    let cb = async () => {
      called = !called
      return Promise.resolve()
    }
    let rbOpts = { threshold: 3 }
    if (called) return false

    // call with sig 2 times, 1 less than threshold
    await rb(testA, cb, rbOpts)
    if (called) return false
    await rb(testA, cb, rbOpts)
    if (called) return false

    // call with differentSig 2 times, 1 less than threshold
    await rb(differentSig, cb, rbOpts)
    if (called) return false
    await rb(differentSig, cb, rbOpts)
    if (called) return false

    // call with sig a third time, now meets threshold, should call callback
    await rb(testA, cb, rbOpts)
    return called
  })

  const testB = `rb does not call if threshold met outside resetAfter`
  await testAsync(testB, async () => {
    let called = false
    let cb = async () => {
      called = !called
      return Promise.resolve()
    }
    let rbOpts = { threshold: 3, resetAfter: ms('5sec') }
    if (called) return false

    // call with sig 2 times, 1 less than threshold
    await rb(testB, cb, rbOpts)
    if (called) return false
    await rb(testB, cb, rbOpts)
    if (called) return false

    // wait 7 seconds
    await delay(ms('7sec'))

    // call with sig a third time, outside of resetAfter, shouldn't call callback
    await rb(testB, cb, rbOpts)
    if (called) return false

    // now call again once, shouldn't meet threshold
    await rb(testB, cb, rbOpts)
    if (called) return false

    // now call again, should meet threshold and call
    await rb(testB, cb, rbOpts)
    return called
  })

  const testC = `rb shouldn't call again within throttle period`
  await testAsync(testC, async () => {
    let called = false
    let cb = async () => {
      called = !called
      return Promise.resolve()
    }
    let rbOpts = { threshold: 3, throttle: ms('5sec') }
    if (called) return false

    // call with sig 3 times, should call
    await rb(testC, cb, rbOpts)
    if (called) return false
    await rb(testC, cb, rbOpts)
    if (called) return false
    await rb(testC, cb, rbOpts)
    if (!called) return false

    // call a 4th time and 5th time, it should not call, end count should be 1
    await rb(testC, cb, rbOpts)
    if (!called) return false
    await rb(testC, cb, rbOpts)
    if (!called) return false

    // wait 7 seconds
    await delay(ms('7sec'))

    // call again, should effectively be the 2nd call as far as count is concerned
    await rb(testC, cb, rbOpts)
    if (!called) return false

    // and we call one last time, this should be 3 and trigger cb
    await rb(testC, cb, rbOpts)
    return !called
  })
})
