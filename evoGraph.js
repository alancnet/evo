const _ = require('lodash')
function switchRandom (random) {
  const fns = Array.from(arguments).slice(1)
  return fns[Math.floor(random() * fns.length)]()
}

const mutateAddVertex = (organism, random, randomVertex, randomEdge) => {
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

const mutateAddEdge = (organism, random, randomEdge) => {
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

const mutateModifyVertex = (organism, random, mutateVertex) => {
  const ret = _.cloneDeep(organism)
  const i = Math.floor(organism.vertices.length * random())
  const v = ret.vertices[i]
  const newV = mutateVertex(v, random)
  ret.vertices[i] = newV || v
}

const mutateModifyEdge = (organism, random, mutateEdge) => {
  const ret = _.cloneDeep(organism)
  const i = Math.floor(ret.edges.length * random())
  const e = ret.edges[i]
  const newE = mutateEdge(e, random)
  ret.edges[i] = newE || e
}

const graph = ({random, randomVertex, randomEdge, mutateVertex, mutateEdge}) => {
  const mutate = (organism) =>
    switchRandom(random,
      () => mutateAddVertex(organism, random, randomVertex, randomEdge),
      () => mutateAddEdge(organism, random, randomEdge),
      () => mutateModifyVertex(organism, random, mutateVertex),
      () => mutateModifyEdge(organism, random, mutateEdge)
    )

  const clone = (organism) => _.cloneDeep(organism)

  const create = () => ({
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

  return {mutate, create, clone}
}

module.exports = graph
