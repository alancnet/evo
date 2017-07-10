function switchRandom () {
  const fns = Array.from(arguments)
  if (fns.length == 1 && Array.isArray(fns[0])) {
    return switchRandom.apply(null, fns[0])
  }
  const ret = fns[Math.floor(Math.random() * fns.length)]
  if (typeof ret === 'function') return ret()
  else return ret
}

const cycleTime = (onTime, offTime, time) =>
  onTime > offTime
  ? time < offTime || time > onTime
  : time > onTime && time < offTime

  // 0--------(on)############(off)--------------1
  // 0########(off)------------(on)##############1

const sleep = (seconds) => new Promise((resolve) => {
  setTimeout(resolve, 1000 * seconds)
})

const interval = (cb, seconds) => {
  const start = process.uptime()
  const ms = 1000 * seconds
  var running = true
  var lastPulse = start
  const run = (count) => {
    const pulse = process.uptime()
    if (running) Promise.resolve(cb(process.uptime() - start)).then(() => {
      const elapsed = process.uptime() - pulse
      const next = Math.max(0, seconds - elapsed)
      lastPulse = pulse
      if (next === 0 && count < 100) {
        run(count + 1)
      } else {
        setTimeout(run, next * 1000)
      }
    })
  }
  run(0)
  return () => (running = false)
}
module.exports = {
  switchRandom,
  cycleTime,
  sleep,
  interval
}
