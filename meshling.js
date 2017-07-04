const Graph = require('memory-graph')
/*
  +-----+-----+-----+
  |0,0 /|2,0 /|4,0 /|
  |/ 1,0|/ 3,0|/ 5,0|  +---------+
  +-----+-----+-----+  | X,Y   / |
  |0,1 /|2,1 /|4,1 /|  |     /   |
  |/ 1,1|/ 3,1|/ 5,1|  |   /     |
  +-----+-----+-----+  | /   X,Y |
  |0,2 /|2,2 /|4,2 /|  +---------+
  |/ 1,2|/ 3,2|/ 5,2|  Edge Priority: Top to Bottom, Left to Right
  +-----+-----+-----+

  y= 3Y        * <-(0,4)
              / \
  y= 2Y      *---* <-(1,2)
            / \ / \
  y= 1Y    *---*---* <-(2,1)
          / \ / \ / \
 (0,0)-> *---*---*---* <-(3,0)
      x= 0 1 2 3 4 5 6

      // Edge Priority: Left to Right, Bottom to Top
*/
const vid = (x, y) => `v${x}x${y}`
const eid = (x1, y1, x2, y2) => `e${x1}x${y1}to${x2}x${y2}`
const vertex = (x, y) => ({
  id: vid(x, y),
  position: getCoords(x, y)
})
const edge = (x1, y1, x2, y2) => ({
  id: eid(x1, y1, x2, y2),
  out: vid(x1, y1),
  in: vid(x2, y2)
})
const getTriangle = (x, y) =>
  x % 2 === 0 ? {
    vertices: [
      vertex(x, y),
      vertex(x, y + 1),
      vertex(x + 1, y)
    ],
    edges: [
      edge(x, y, x + 1, y),
      edge(x, y, x, y + 1),
      edge(x + 1, y, x, y + 1)
    ]
  } : {
    vertices: [
      vertex(x, y),
      vertex(x, y + 1),
      vertex(x - 1, y + 1)
    ],
    edge: [
      edge(x, y, x, y + 1),
      edge(x, y, x - 1, y + 1),
      edge(x - 1, y + 1, x, y + 1)
    ]
  }

const getNeighbors = (x, y) =>
  x % 2 === 0 ? [
    [x + 1, y - 1],
    [x - 1, y],
    [x + 1, y]
  ] : [
    [x - 1, y],
    [x + 1, y],
    [x - 1, y + 1]
  ]

const Y = Math.sqrt(1.25)
const getCoords = (x, y) => [(x * 2) + y, y * Y]


class Creature {
  constructor () {
    this.nodes = [[[{
      off: 0.5,
      on: 1.0,
      offAt: 0.0,
      onAt: 0.5
    }]]]
    this.graph = new Graph(getTriangle(0,0))
  }
  updateGraph () {
    const ng = new Graph()
  }
}
const newCreature = () => {
  const nodes = [[[true]]]
  const graph = new Graph(getTriangle(0,0))
}

module.exports = {
  vid,
  eid,
  vertex,
  edge,
  getTriangle,
  getNeighbors,
  Y,
  getCoords
}
