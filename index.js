'use strict'

var track = {}

module.exports = function (signature, cb, opts) {
  opts = opts || {}
  var threshold = opts.threshold
  var throttle = opts.throttle
  var resetAfter = opts.resetAfter
  // get (or create) tracking instance that matches signature
  var inst = track[signature] = track[signature] || { count: 0 }
  // increment count, get values from instance, update lastRun to now
  ++inst.count
  var count = inst.count
  var lastCall = inst.lastCall
  var lastRun = inst.lastRun
  var now = Date.now()
  inst.lastCall = now
  //  if lastCall is beyond the resetAfter limit, put count to 1 and return
  var needsReset = resetAfter && lastCall && ((now - lastCall) > resetAfter)
  // if lastRun happened before the throttle window is up then return
  var needsThrottled = throttle && lastRun && ((now - lastRun) < throttle)
  // if it needs reset or throttled we reset the count back to 1
  if (needsReset || needsThrottled) return (inst.count = 1)
  // if count is less than the threshold then return
  if (threshold && (count < threshold)) return
  // now we set lastRun to now and call the callback
  inst.lastRun = now
  return cb()
}
