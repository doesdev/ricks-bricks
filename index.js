const track = {}
const defaultCleanupInterval = 30000
const lastClean = Date.now()

function ricksBricks (signature, cb, opts) {
  opts = opts || {}
  const threshold = opts.threshold
  const throttle = opts.throttle
  const resetAfter = opts.resetAfter

  // get (or create) tracking instance that matches signature
  const inst = track[signature] = track[signature] || { count: 0 }

  // increment count, get values from instance, update lastRun to now
  ++inst.count
  const count = inst.count
  const lastCall = inst.lastCall
  const lastRun = inst.lastRun
  const now = Date.now()
  inst.lastCall = now
  inst.throttle = throttle

  // initiate cleanup of tracker
  rbCleanup(now)

  //  if lastCall is beyond the resetAfter limit, put count to 1 and return
  const needsReset = resetAfter && lastCall && ((now - lastCall) > resetAfter)

  // if lastRun happened before the throttle window is up then return
  const needsThrottled = throttle && lastRun && ((now - lastRun) < throttle)

  // if it needs reset or throttled we reset the count back to 1
  if (needsReset || needsThrottled) return (inst.count = 1)

  // if count is less than the threshold then return
  if (threshold && (count < threshold)) return

  // now we set lastRun to now and call the callback
  inst.lastRun = now
  return cb()
}

function rbCleanup (now) {
  const rawIntvl = +ricksBricks.cleanupInterval
  const intvl = Number.isNaN(rawIntvl) ? defaultCleanupInterval : rawIntvl

  if ((now - lastClean) < intvl) return

  Object.keys(track).forEach(function (k) {
    const inst = track[k] || {}
    const lastCall = inst.lastCall || now
    const throttle = inst.throttle

    if (!throttle || (now - lastCall) < throttle) return

    delete track[k]
  })
}

ricksBricks.cleanupInterval = defaultCleanupInterval

export default ricksBricks
