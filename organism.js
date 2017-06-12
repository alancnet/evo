const _ = require('lodash')
const p2 = require('p2')

var organism = {
  vertices: [
    {
      position: [0.55, 0.61],
      friction: 0.89,
      mass: 0.1,
      size: 0.2
    },
    {
      position: [0.55, 0.61],
      friction: 0.89,
      mass: 0.1
    }
  ],
  edges: [
    {
      in: 0,
      out: 1,
      on: 0.8,
      onTime: 0.1,
      off: 0.2,
      offTime: 0.3,
      strength: 0.99
    }
  ]
}

const create = (random) => ({
  vertices: [
    randomVertex(random),
    randomVertex(random)
  ],
  edges: [
    Object.assign(randomEdge(random), {
      in: 0,
      out: 1
    })
  ]
})

function switchRandom (random) {
  const fns = Array.from(arguments).slice(1)
  return fns[Math.floor(random() * fns.length)]()
}

const randomVertex = (random) => ({
  position: [random(), random()],
  friction: random(),
  mass: random(),
  size: random()
})

const randomEdge = (random) => ({
  on: 2 + random(),
  onTime: random(),
  off: 2 + random(),
  offTime: random(),
  strength: random()
})

const mutateAddVertex = (organism, random) => {
  const ret = _.cloneDeep(organism)
  const v = ret.vertices.length
  ret.vertices.push(randomVertex(random))
  const newEdge = randomEdge(random)
  const fromVertex = Math.floor(random() * v)
  newEdge.out = v
  newEdge.in = fromVertex
  ret.edges.push(newEdge)
  return ret
}

const mutateAddEdge = (organism, random) => {
  const ret = _.cloneDeep(organism)
  const [inv, outv] = [
    Math.floor(random() * ret.vertices.length),
    Math.floor(random() * ret.vertices.length)
  ].sort()

  const edge = ret.edges.find((e) => e.in === inv && e.out === outv) || {
    in: inv, out: outv
  }
  Object.assign(edge, randomEdge(random))
  return ret
}

const mutateModifyVertex = (organism, random) => {
  const ret = _.cloneDeep(organism)
  const v = ret.vertices[Math.floor(ret.vertices.length * random())]
  switchRandom(random,
    () => (v.position[0] = random()),
    () => (v.position[1] = random()),
    () => (v.friction = random()),
    () => (v.mass = random()),
    () => (v.size = random())
  )
  return ret
}

const mutateModifyEdge = (organism, random) => {
  const ret = _.cloneDeep(organism)
  const e = ret.edges[Math.floor(ret.edges.length * random())]
  switchRandom(random,
    () => (e.on = random()),
    () => (e.off = random()),
    () => (e.onTime = random()),
    () => (e.offTime = random()),
    () => (e.strength = random())
  )
  return ret
}

const mutate = (organism, random) =>
  switchRandom(random,
    () => mutateAddVertex(organism, random),
    () => mutateAddEdge(organism, random),
    () => mutateModifyVertex(organism, random),
    () => mutateModifyEdge(organism, random)
  )

const cycleTime = (onTime, offTime, time) =>
  onTime > offTime
  ? time < offTime || time > onTime
  : time > onTime && time < offTime

  // 0--------(on)############(off)--------------1
  // 0########(off)------------(on)##############1

const jointMaterial = new p2.Material(1)
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
    const spring = new p2.LinearSpring(joints[e.out], joints[e.in], {
      restLength: cycleTime(e.onTime, e.offTime, 0) ? e.on : e.off,
      stiffness: e.strength * 100
    })
    spring.source = e
    return spring
  })

  return joints.concat(muscles)
}

const updateBodies = (bodies, time) =>
  bodies.forEach((b) => {
    const o = b.source
    b instanceof p2.LinearSpring
    ? Object.assign(b, {
      restLength: cycleTime(o.onTime, o.offTime, time % 1) ? o.on : o.off
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

const render = (g, world) => {
  world.bodies.forEach((b) => {
    b.shapes.forEach((s) => {
      if (s instanceof p2.Circle) {
        g.lineStyle(0, 0, 0)
        g.beginFill(Math.floor(b.source.friction * 256))
        g.drawCircle(b.position[0], b.position[1], s.radius)
        g.endFill()
      } else if (s instanceof p2.Plane) {
        g.beginFill(0x008800)
        g.drawRect(-10000 / 2, b.position[1], 10000, -10000)
        g.endFill()
      }
    })
  })
  world.springs.forEach((b) => {
    g.lineStyle(b.source.strength / 10, 0x000000, 1)
    g.moveTo(b.bodyA.position[0], b.bodyA.position[1])
    g.lineTo(b.bodyB.position[0], b.bodyB.position[1])
  })
}

module.exports = {
  mutate, create, toBodies, render, updateBodies
}
