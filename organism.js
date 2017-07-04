const _ = require('lodash')
const p2 = require('p2')
const evoGraph = require('./evoGraph')

// var organism = {
//   vertices: [
//     {
//       position: [0.55, 0.61],
//       friction: 0.89,
//       mass: 0.1,
//       size: 0.2
//     },
//     {
//       position: [0.55, 0.61],
//       friction: 0.89,
//       mass: 0.1
//     }
//   ],
//   edges: [
//     {
//       in: 0,
//       out: 1,
//       on: 0.8,
//       onTime: 0.1,
//       off: 0.2,
//       offTime: 0.3,
//       strength: 0.99
//     }
//   ]
// }
//
function switchRandom (random) {
  const fns = Array.from(arguments).slice(1)
  return fns[Math.floor(random() * fns.length)]()
}

const randomVertex = (random) => ({
  position: [random(), random()],
  friction: random(),
  mass: 0.2,
  size: 0.5
})

const randomEdge = (random) => ({
  on: random() * 3,
  onTime: random(),
  off: random() * 3,
  offTime: random(),
  strength: 1
})

const mutateVertex = (oldV, random) => {
  const v = _.cloneDeep(oldV)
  switchRandom(random,
    () => (v.position[0] = random()),
    () => (v.position[1] = random()),
    // () => (v.friction = random()),
    () => (v.mass = random())
    // () => (v.size = random())
  )
  return v
}

const mutateEdge = (oldE, random) => {
  const e = _.cloneDeep(oldE)
  switchRandom(random,
    () => (e.on = random()),
    () => (e.off = random()),
    () => (e.onTime = random()),
    () => (e.offTime = random()),
    () => (e.strength = random())
  )
  return e
}

const cycleTime = (onTime, offTime, time) => {
  const ret = cycleTime_(onTime,offTime, time)
  // console.log(onTime, offTime, time, ret)
  return ret
}
const cycleTime_ = (onTime, offTime, time) =>
  onTime > offTime
  ? time < offTime || time > onTime
  : time > onTime && time < offTime

  // 0--------(on)############(off)--------------1
  // 0########(off)------------(on)##############1

const jointMaterial = new p2.Material(1)
// const build = (organism, world) => {
//   const joints = organism.vertices.map(v => {
//     const body = new p2.Bodt({
//       fixedRotation: true,
//       mass: v.mass,
//       position: [v.position[0], v.position[1] + 2]
//     })
//   })
// }
const toBodies = (organism) => {
  const joints = organism.vertices.map((v) => {
    const body = new p2.Body({
      fixedRotation: true,
      mass: v.mass,
      position: [v.position[0], v.position[1] + 2]
    })
    const shape = new p2.Circle({
      radius: v.size,
      material: jointMaterial
    })
    body.addShape(shape)
    body.shape = shape
    body.source = v
    return body
  })

  const muscles = organism.edges.map((e) => {
    const spring = new p2.DistanceConstraint(joints[e.out], joints[e.in], {
      distance: cycleTime(e.onTime, e.offTime, 0) ? e.on : e.off
      //stiffness: e.strength * 100
    })
    spring.source = e
    return spring
  })

  return joints.concat(muscles)
}

const updateBodies = (bodies, time) =>
  bodies.forEach((b) => {
    const o = b.source
    b instanceof p2.DistanceConstraint
    ? Object.assign(b, {
      distance: cycleTime(o.onTime, o.offTime, time % 1) ? o.on : o.off
    })
    : b instanceof p2.Body
    ? [
      Object.assign(b, {
        mass: o.mass
      }),
      Object.assign(b.shape, {
        radius: o.size
      })
    ]
    : null
  })

const render = (g, world, renderer, fitness) => {
  world.bodies.forEach((b) => {
    b.shapes.forEach((s) => {
      if (s instanceof p2.Circle) {
        g.lineStyle(0, 0, 0)
        g.beginFill(Math.floor(b.source.mass * 256))
        g.drawCircle(b.position[0], b.position[1], s.radius)
        g.endFill()
      } else if (s instanceof p2.Plane) {
        g.beginFill(0x008800)
        g.drawRect(-10000 / 2, b.position[1], 10000, -10000)
        g.endFill()
      }
    })
  })
  world.constraints.forEach((b) => {
    g.lineStyle(b.source.strength / 10, 0x000000, 1)
    g.moveTo(b.bodyA.position[0], b.bodyA.position[1])
    g.lineTo(b.bodyB.position[0], b.bodyB.position[1])
  })
  renderer(g, fitness)
}

const graph = evoGraph({
  random: Math.random,
  randomVertex,
  randomEdge,
  mutateVertex,
  mutateEdge
})

const newGraph = () => {
  const g = graph.create()
  g.vertices.push(randomVertex(Math.random))
  g.edges.push(Object.assign(randomEdge(Math.random), {
    out: 0, in: 2
  }))
  g.edges.push(Object.assign(randomEdge(Math.random), {
    out: 1, in: 2
  }))
  return g
}

const create = (data, graphics, renderer) => ({
  log: [],
  data: data || newGraph(), // Not ideal
  clone: function() {
    return Object.assign(
      create(graph.clone(this.data), graphics, renderer),
      {
        fitness: this.fitness
      }
    )
  },
  mutate: function () {
    return create(graph.mutate(this.data), graphics, renderer)
  },
  getFitness: function(world) {
    const all = world.bodies
      .map((b) => b.position[0])
      .filter(p => p)
    const sum = all
      .reduce((a,b) => a + b)
//      .reduce(([xa, ya], [xb, yb]) => [xa + xb, ya + yb])
    const average = sum / all.length
    this.fitness = average
    return average
  },
  beforeAll: function (world) {
    if (this.log.length) throw new Error('Before all called twice')
    //this.log.push('[BA]')
    world.addContactMaterial(new p2.ContactMaterial(world.groundMaterial, jointMaterial, {
      friction: 100
    }))
    const addBodies = (bodies) => bodies.forEach((body, i) =>
      body instanceof p2.DistanceConstraint
      ? world.addConstraint(body)
      : body instanceof p2.ContactMaterial
      ? world.addContactMaterial(body)
      : world.addBody(body) || bodies.slice(i + 1)
        .filter((b) => b instanceof p2.Body).forEach(
        (b) => world.disableBodyCollision(b, body)
      )
    )
    this.bodies = toBodies(this.data)
    addBodies(this.bodies)
  },
  beforeEach: function (world, time) {
    //this.log.push('[BE]')
    updateBodies(this.bodies, time)
    world.step(1 / 60)
  },
  afterEach: function (world, time) {
    //this.log.push('[AE]')
    const fitness = this.getFitness(world)
    if (graphics) {
      return new Promise((resolve, reject) => {
        graphics.clear()
        render(graphics, world, renderer, fitness)
        setTimeout(resolve, 1000 / 60)
      })
    } else {
      return new Promise((resolve, reject) => {
        setTimeout(resolve)
      })
    }
  },
  afterAll: function (world) {
    //this.log.push('[AA]')
    this.getFitness(world)
    //console.log(this.log.join(''))
  }
})

module.exports = {
  create, toBodies, render, updateBodies
}
