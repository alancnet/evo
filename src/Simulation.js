const p2 = require('p2')
const PIXI = require('pixi.js')
const {sleep, interval} = require('./util')
class Simulation {
  constructor(stage, organisms, seconds, renderer) {
    this.stage = stage
    this.organisms = organisms
    this.renderer = renderer
    this.seconds = seconds
    this.time = 0
    this.interval = 1 / 30
    this.world = new p2.World({
      gravity: [0, -9.82],
      friction: 1
    })
    // Add a plane
    this.canvas = new PIXI.Container()
    this.canvas.scale = new PIXI.Point(20, 20)
    this.canvas.x = 400
    this.canvas.y = 300
    this.running = false

    const add = (o) => {
      if (o.bodies) o.bodies.forEach(b => this.world.addBody(b))
      if (o.constraints) o.constraints.forEach(c => this.world.addConstraint(c))
      if (o.drawing) this.canvas.addChild(o.drawing)
      if (o.contactMaterials) o.contactMaterials.forEach(m => this.world.addContactMaterial(m))
    }
    add(stage)
    organisms.forEach(add)
  }
  focus(x, y) {
    const tx = this.renderer.width / 2 - (x * this.canvas.scale.x)
    const ty = this.renderer.height / 2 + (y * this.canvas.scale.y)
    this.canvas.x = this.canvas.x + ((tx - this.canvas.x) * 0.1)
    this.canvas.y = this.canvas.y + ((ty - this.canvas.y) * 0.1)
  }
  async step() {
    this.organisms.forEach(o => o.updateBody(this.time))
    this.world.step(this.interval)
    this.time += this.interval
  }
  async xrender() {
    if (this.renderer) {
      this.organisms.forEach(o => o.updateDrawing())
      this.stage.updateDrawing(this.organisms)
      if (this.stage.focus) {
        this.focus(this.stage.focus[0], this.stage.focus[1])
      }
      return new Promise((resolve, reject) => {
        if (this.cancel) this.cancel()
        const id = window.requestAnimationFrame(() => {
          this.cancel = null
          this.renderer.render(this.canvas)
          resolve()
        })
        this.cancel = () => {
          window.cancelAnimationFrame(id)
          reject('Frame dropped')
        }
      })
    } else {
      return Promise.resolve()
    }
  }
  render() {
    var running = true
    if (this.renderer) {
      const doRender = (lastTime) => {
        if (running) window.requestAnimationFrame(() => {
          this.renderer.render(this.canvas)
          {
            this.organisms.forEach(o => o.updateDrawing())
            this.stage.updateDrawing(this.organisms)
            if (this.stage.focus) {
              this.focus(this.stage.focus[0], this.stage.focus[1])
            }
            window.requestAnimationFrame(doRender)
          }
        })
      }
      doRender()
    }
    return () => (running = false)
  }
  async run(seconds) {
    if (seconds === undefined) return await this.run(this.seconds)
    if (this.running) throw new Error('Already running')
    this.running = true
    const cancelRender = this.render()
    await new Promise((resolve, reject) => {
      const cancelTimer = interval(() => {
        if ((seconds -= this.interval) > 0) return this.step()
        else {
          cancelTimer()
          cancelRender()
          resolve()
        }
      }, this.interval)
    })
    this.running = false;
    this.time = 0
  }
}

module.exports = Simulation
