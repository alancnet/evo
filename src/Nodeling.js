const Graphling = require('./Graphling')
const EvoGraph = require('./EvoGraph')
const {Graph} = require('memory-graph')
const { switchRandom, cycleTime } = require('./util')

class Nodeling extends Graphling {
  constructor (evoGraph) {
    evoGraph = evoGraph || new EvoGraph(Nodeling).genesis()
    super(evoGraph.graph)
    this.evoGraph = evoGraph
  }
  getPosition () {
    const all = this.bodies
      .map((b) => b.position)
    const sum = all
      .reduce(([x1, y1], [x2, y2]) => [x1 + x2, y1 + y2], [0, 0])
    const average = [sum[0] / all.length, sum[1] / all.length]
    return average
  }
  getFitness () {
    const all = this.bodies
      .map((b) => b.position[0])
    const sum = all
      .reduce((a, b) => a + b, 0)
    const average = sum / all.length
    return average
  }
  updateBody (time) {
    this.constraints.forEach((c, i) => {
      const e = this.graph.edges[i]
      if (cycleTime(e.onTime, e.offTime, time % 1)) {
        c.distance = e.on
        c.color = 0x800000
      } else {
        c.distance = e.off
        c.color = 0x000000
      }
    })
  }
  clone () {
    return new Nodeling(this.evoGraph.clone())
  }
  mutate () {
    return new Nodeling(this.evoGraph.mutateRandom())
  }
}
Object.assign(Nodeling, {
  randomVertex () {
    return {
      position: [Math.random(), 1 + Math.random()],
      friction: Math.random(),
      mass: 0.2,
      size: 0.5
    }
  },
  randomEdge () {
    return {
      on: Math.random() * 3,
      onTime: Math.random(),
      off: Math.random() * 3,
      offTime: Math.random(),
      strength: 1
    }
  },
  mutateVertex (v) {
    switchRandom(
      () => (v.position[0] = Math.random()),
      () => (v.position[1] = Math.random()),
      // () => (v.friction = Math.random()),
      () => (v.mass = Math.random())
      // () => (v.size = Math.random())
    )
  },
  mutateEdge (e) {
    switchRandom(
      () => (e.on = Math.random()),
      () => (e.off = Math.random()),
      () => (e.onTime = Math.random()),
      () => (e.offTime = Math.random()),
      () => (e.strength = Math.random())
    )
  },
  save (population) {
    return JSON.stringify(population.map(x => x.graph.export()))
  },
  load (data) {
    return JSON.parse(data.toString()).map(x => new Nodeling(
      new EvoGraph(Nodeling, new Graph(x))
    ))
  }
})

module.exports = Nodeling
