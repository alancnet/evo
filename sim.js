const p2 = require('p2')
const delay = (ms) => new Promise((resolve, reject) => setTimeout(resolve, ms))

const continueWith = (p, next) => p && p.then ? p.then(next) : next()
const optionalStep = (step, next) => continueWith(step && step(), next)

const run = (sim, time) => new Promise((resolve, reject) => {
  const groundMaterial = new p2.Material(0)
  const world = new p2.World({
    gravity: [0, -9.82],
    friction: 1
  })
  const groundBody = new p2.Body({
    mass: 0
  })
  const groundShape = new p2.Plane({
    material: groundMaterial
  })
  world.groundMaterial = groundMaterial
  groundBody.addShape(groundShape)
  world.addBody(groundBody)

  optionalStep(sim.beforeAll.bind(sim, world), () => {
    var elapsed = 0
    var timeStep = 1 / 60
    const doStep = () => {
      while (elapsed < time) { // Keep stack flat if possible
        var isAsync = false
        elapsed += timeStep
        optionalStep(sim.beforeEach.bind(sim, world, elapsed), () => {
          world.step(timeStep)
          optionalStep(sim.afterEach.bind(sim, world, elapsed), () => {
            if (isAsync) doStep()
            else isAsync = true
          })
        })
        if (!isAsync) return (isAsync = true)
      }
      optionalStep(sim.afterAll.bind(sim, world), () => resolve(sim))
    }
    doStep()
  })
})

module.exports = { run, delay }
