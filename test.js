import test from 'mvt'
import ms from 'pico-ms'
import rb from './index.js'

const delay = async (d = 500) => {
  await new Promise((resolve, reject) => setTimeout(resolve, d))
}

const testA = 'rb only calls at threshold for signature'
test(testA, async (assert) => {
  let called = false

  const cb = async () => {
    called = !called
    return Promise.resolve()
  }

  const rbOpts = { threshold: 3 }

  assert.false(called)

  // call with sig 2 times, 1 less than threshold
  await rb(testA, cb, rbOpts)
  assert.false(called)
  await rb(testA, cb, rbOpts)
  assert.false(called)

  // call with differentSig 2 times, 1 less than threshold
  const differentSig = 'differentSig'
  await rb(differentSig, cb, rbOpts)
  assert.false(called)
  await rb(differentSig, cb, rbOpts)
  assert.false(called)

  // call with sig a third time, now meets threshold, should call callback
  await rb(testA, cb, rbOpts)
  assert.true(called)
})

const testB = 'rb does not call if threshold met outside resetAfter'
test(testB, async (assert) => {
  let called = false

  const cb = async () => {
    called = !called
    return Promise.resolve()
  }

  const rbOpts = { threshold: 3, resetAfter: ms('5sec') }

  assert.false(called)

  // call with sig 2 times, 1 less than threshold
  await rb(testB, cb, rbOpts)
  assert.false(called)
  await rb(testB, cb, rbOpts)
  assert.false(called)

  // wait 7 seconds
  await delay(ms('7sec'))

  // call with sig a third time, outside of resetAfter, shouldn't call callback
  await rb(testB, cb, rbOpts)
  assert.false(called)

  // now call again once, shouldn't meet threshold
  await rb(testB, cb, rbOpts)
  assert.false(called)

  // now call again, should meet threshold and call
  await rb(testB, cb, rbOpts)
  assert.true(called)
})

const testC = 'rb shouldn\'t call again within throttle period'
test(testC, async (assert) => {
  let called = false

  const cb = async () => {
    called = !called
    return Promise.resolve()
  }

  const rbOpts = { threshold: 3, throttle: ms('5sec') }

  assert.false(called)

  // call with sig 3 times, should call
  await rb(testC, cb, rbOpts)
  assert.false(called)
  await rb(testC, cb, rbOpts)
  assert.false(called)
  await rb(testC, cb, rbOpts)
  assert.true(called)

  // call a 4th time and 5th time, it should not call, end count should be 1
  await rb(testC, cb, rbOpts)
  assert.true(called)
  await rb(testC, cb, rbOpts)
  assert.true(called)

  // wait 7 seconds
  await delay(ms('7sec'))

  // call again, should effectively be the 2nd call as far as count is concerned
  await rb(testC, cb, rbOpts)
  assert.true(called)

  // and we call one last time, this should be 3 and trigger cb
  await rb(testC, cb, rbOpts)
  assert.false(called)
})
