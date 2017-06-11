const _ = require('lodash')

const organism = {
  vertices: [
    {
      position: [0.55, 0.61],
      friction: 0.89,
      mass: 0.1
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
      off: 0.2,
      strength: 0.99
    }
  ]
}

const randomVertex = (random) => ({
  position: [random(), random],
  friction: random(),
  mass: random()
})

const randomEdge = (random) => ({
  on: random(),
  off: random(),
  strength: random()
})

const mutateAddVertex = (organism, random, heat) => {
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

const mutateAddEdge = (organism, random, heat) => {
  const ret = _.cloneDeep(organism)
  const [inv, outv] = [
    Math.floor(random() * ret.vertices.length),
    Math.floor(random() * ret.vertices.length)
  ]
  
}

const mutate = (organism, random, heat) => {
  const ret = _.cloneDeep(organism)
}

const p2 = require('p2')

const world = new p2.World({
  gravity: [0, -9.82]
})

const groundBody = new p2.Body({
  mass: 0
})
const groundShape = new p2.Plane()
groundBody.addShape(groundShape)

world.addBody(groundBody)

const circleBody = new p2.Body({
  mass: 5,
  position: [0, 10]
})

const circleShape = new p2.Circle({
  radius: 1
})

circleBody.addShape(circleShape)

world.addBody(circleBody)

for (var i = 0; i < 100; i++) {
  world.step(1 / 60)
  console.log(circleBody.position)
}
