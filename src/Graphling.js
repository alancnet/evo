const _ = require('lodash')
const { Graph, RID } = require('memory-graph')
const p2 = require('p2')
const PIXI = require('pixi.js')


/**
  Responsible for creating the physical objects, and the drawing objects
  for an organism based on a graph.
*/
class Graphling {
  constructor(g) {
    if (!(g instanceof Graph)) throw new Error('Expected Graph')

    // Physics
    this.graph = g
    const temp = {}
    const vertices = g.v().toArray().map(v => {
      const body = new p2.Body(_.defaults({}, v, {
        fixedRotation: true,
        mass: 0.5,
        position: [Math.random(), Math.random()]
      }))
      const circle = new p2.Circle({
        radius: 0.5,
        material: Graphling.nodeMaterial,
        collisionGroup: 0b0010,
        collisionMask: 0b0001
      })
      body.addShape(circle)
      temp[v[RID]] = body
      return body
    })
    const edges = g.e().toArray().map(e => {
      const out = temp[e.out]
      const in_ = temp[e.in]
      return new p2.DistanceConstraint(out, in_, _.defaults({}, e, {
        distance: 1
      }))
    })

    this.bodies = vertices
    this.constraints = edges

    // Drawing
    this.drawing = new PIXI.Container()
    this._label = new PIXI.Text('Score...', {
      fontFamily: 'Arial',
      fontSize: 12,
      fill: 0x000000,
      align: 'center'
    })
    this._graphics = new PIXI.Graphics()
    //this.drawing.addChild(this._label)
    this.drawing.addChild(this._graphics)
  }

  updateDrawing() {
    const g = this._graphics
    g.clear()
    this.bodies.forEach(b => {
      b.shapes.forEach(s => {
        if (s instanceof p2.Circle) {
          g.lineStyle(0, 0, 0)
          g.beginFill(Math.floor(b.mass * 256))
          g.drawCircle(b.position[0], -b.position[1], s.radius)
          g.endFill()
        } else {
          throw new Error(`Unexpected shape: ${s.constructor.name}`)
        }
      })
    })
    this.constraints.forEach(c => {
      g.lineStyle(
        c.width === undefined ? 0.5 : c.width,
        c.color === undefined ? 0x000000 : c.color,
        c.opacity === undefined ? 0.9 : c.opacity
      )
      g.moveTo(c.bodyA.position[0], -c.bodyA.position[1])
      g.lineTo(c.bodyB.position[0], -c.bodyB.position[1])
    })
  }
}

Object.assign(Graphling, {
  fieldMaterial: new p2.Material(),
  nodeMaterial: new p2.Material()
})
module.exports = Graphling
