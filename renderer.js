// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const pixi = require('pixi.js')
const { create, render, mutate, toBodies, updateBodies } = require('./organism')
const sim = require('./sim')

const size = [800, 600]

var app = new pixi.Application(size[0], size[1], {backgroundColor: 0x1099bb, antialias: true, forceCanvas: false})
document.body.appendChild(app.view)

const canvas = new pixi.Graphics()
app.stage.addChild(canvas)
canvas.y = size[0] / 2
canvas.x = size[1] / 2
canvas.scale = new pixi.Point(100, -100)
var org = create(Math.random)
for (var i = 0; i < 10; i++) { org = mutate(org, Math.random) }
const bodies = toBodies(org)
console.log(bodies)
const world = sim.createSim()
world.addBodies(bodies)
var time = 0
var interval = 1 / 60
setInterval(() => {
  time += interval
  updateBodies(bodies, time)
  world.step(interval)
  canvas.clear()
  render(canvas, world)
}, 1000 / 60)
