
const { Graph } = require('memory-graph')
const { switchRandom } = require('./util')

class EvoGraph {
  constructor (OrganismClass, data) {
    this.OrganismClass = OrganismClass
    this.graph = data instanceof Graph ? data : new Graph(data)
  }
  clone() {
    return new EvoGraph(this.OrganismClass, this.graph.clone())
  }
  next (data) {
    return new EvoGraph(this.OrganismClass, data)
  }
  genesis () {
    const graph = new Graph()
    const v1 = graph.addVertex(this.OrganismClass.randomVertex())
    const v2 = graph.addVertex(this.OrganismClass.randomVertex())
    const v3 = graph.addVertex(this.OrganismClass.randomVertex())

    graph.addEdge(v1, v2, 'EDGE', this.OrganismClass.randomEdge())
    graph.addEdge(v1, v3, 'EDGE', this.OrganismClass.randomEdge())
    graph.addEdge(v2, v3, 'EDGE', this.OrganismClass.randomEdge())
    return this.next(graph)
  }
  addVertex () {
    const ret = this.graph.clone()
    const fromVertex = switchRandom(ret.vertices)
    const toVertex = ret.addVertex(this.OrganismClass.randomVertex())
    if (fromVertex) {
      const newEdge = this.OrganismClass.randomEdge()
      ret.addEdge(fromVertex, toVertex, 'EDGE', newEdge)
    }
    return this.next(ret)
  }
  addEdge () {
    const ret = this.graph.clone()
    const fromVertex = switchRandom(ret.vertices)
    const toVertex = switchRandom(ret.vertices)
    if (fromVertex) {
      ret.addEdge(fromVertex, toVertex, 'EDGE', this.OrganismClass.randomEdge())
    }
    return this.next(ret)
  }
  mutateVertex () {
    const ret = this.graph.clone()
    const v = switchRandom(ret.vertices)
    if (v) this.OrganismClass.mutateVertex(v)
    return this.next(ret)
  }
  mutateEdge () {
    const ret = this.graph.clone()
    const e = switchRandom(ret.edges)
    if (e) this.OrganismClass.mutateEdge(e)
    return this.next(ret)
  }
  deleteVertex() {
    const ret = this.graph.clone()
    const v = switchRandom(ret.vertices)
    if (v) ret.remove(v)
    return this.next(ret)
  }
  deleteEdge () {
    const ret = this.graph.clone()
    const e = switchRandom(ret.edges)
    if (e) ret.remove(e)
    return this.next(ret)
  }
  mutateRandom () {
    return switchRandom(
      () => this.addVertex(),
      () => this.addEdge(),
      () => this.mutateVertex(),
      () => this.mutateEdge(),
      () => this.deleteVertex(),
      () => this.deleteEdge()
    )
  }
}

module.exports = EvoGraph
