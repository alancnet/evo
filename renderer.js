// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const pixi = require('pixi.js')
const { create } = require('./organism')
const sim = require('./sim')

const size = [800, 600]

const app = pixi.autoDetectRenderer({
  width: size[0],
  height: size[1],
  backgroundColor: 0x1099bb,
  antialias: true
})
document.body.appendChild(app.view)
// var app = new pixi.Application(size[0], size[1], {backgroundColor: 0x1099bb, antialias: true, forceCanvas: false})
// document.body.appendChild(app.view)

const data = { vertices:
   [ { position: [ 0.1, 0.1 ],
       friction: 1,
       mass: 0.2,
       size: 0.2 },
     { position: [ 0.2, 0.1 ],
       friction: 0.25,
       mass: 0.2,
       size: 0.2 },
     { position: [ 0.3, 0.1 ],
       friction: 0.0,
       mass: 0.2,
       size: 0.2 } ],
  edges:
   [ { on: 0.5,
       onTime: 0.25,
       off: 1.0,
       offTime: 0.75,
       strength: 1,
       in: 0,
       out: 1 },
     { on: 0.5,
       onTime: 0.25,
       off: 1.0,
       offTime: 0.75,
       strength: 1,
       out: 1,
       in: 2 } ] }

const container = new pixi.Container()
const canvas = new pixi.Graphics()
// app.stage.addChild(canvas)
canvas.y = size[0] / 2
canvas.x = size[1] / 2
canvas.scale = new pixi.Point(20, -20)

const text = new pixi.Text('This is a PixiJS text',{fontFamily : 'Arial', fontSize: 24, fill : 0xff1010, align : 'center'})
container.addChild(canvas)
container.addChild(text)
const render = (g, fitness) => {
  text.text = fitness.toString()
  app.render(container)
  //app.render(text)
}

// const org = create(data, canvas, app)
// sim.run(org, 20000000)
//   .then(console.log, console.error)


//
// var orgFast = create(org.data)
// sim.run(orgFast, 15).then(console.log)
const stepAll = (fns, delay) => fns.reduce((pv, fn, i) => {
  return (prev) => new Promise((resolve, reject) => {
    setTimeout(() => {
      pv().then((answers) => {
        Promise.resolve(fn()).then((answer) => {
          resolve(answers.concat([answer]))
        })
      }, reject)
    }, delay || 0)
  })
}, () => Promise.resolve([]))()

const evolve = (generation) => stepAll(
  generation
    // Test fitness
    .map((creature) => () => sim.run(creature, 15))
)
  // Cull population
//  .then((x) => { console.log('creatures', x); return x })
  .then(creatures => {
//    console.log(creatures.map(x => x.fitness))
    const sorted = creatures
      .sort((a, b) => b.fitness - a.fitness)
    console.log('best', creatures[0].fitness)
    return sorted.map(x => x.clone()).slice(0, creatures.length / 2)
  })
  // Evolve population (keeping and needlessly retesting half)
//  .then((x) => { console.log('survivors', x); return x })
  .then(survivors =>
    survivors.concat(survivors.map(survivor =>
      survivor.mutate()
    ))
  )

var generation = Array(10).fill(0).map(() => create())

const step = (generation, count, each) =>
  count > 1
  ? evolve(generation).then((newGen) => step(newGen, count - 1, each, each(newGen)))
  : generation

var playing = false
var g = 0
step(generation, Number.MAX_SAFE_INTEGER, (generation) => {
  g++
  console.log(`Best for Gen ${g}: ${generation[0].fitness}`)
  if (!playing) {
    playing = true
    const org = create(generation[0].data, canvas, render)
    sim.run(org, 15).then(() => {
      playing = false
    })
  }
}).then((generation) => {
  console.log('Done', generation)
})
