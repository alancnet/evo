const PIXI = require('pixi.js')
const p2 = require('p2')
const Graphling = require('./Graphling')

class Field2D {
  constructor () {
    this.drawing = new PIXI.Graphics()
    const plane = new p2.Plane({
      material: Graphling.fieldMaterial,
      collisionGroup: 0b0001,
      collisionMask: 0b0010
    })
    const ground = new p2.Body({
      mass: 0,
      position: [0, 0],
      fixedX: true,
      fixedY: true
    })
    ground.addShape(plane)
    this.bodies = [ground]
    this.focus = [0, 0]
    // this.contactMaterials = [new p2.ContactMaterial(
    //   Graphling.fieldMaterial,
    //   Graphling.nodeMaterial,
    //   {
    //     friction: 1,
    //     restitution: 1,
    //     stiffness: Number.MAX_VALUE
    //   }
    // )]
  }
  updateDrawing (organisms) {
    const g = this.drawing
    g.clear()
    const positions = organisms.map(o => o.getPosition())
    const max = positions.reduce((a, b) => a[0] > b[0] ? a : b, [0, 0])
    this.focus = max
    const xOff = max[0] - (max[0] % 20)
    const y = this.bodies[0].position[1]
    var toggle = 0
    for (var x = xOff - 100; x < xOff + 100; x += 10) {
      const color = toggle++ % 2 === 0 ? 0x00bf00 : 0x00e000
      g.lineStyle(0, 0, 0)
      g.beginFill(color)
      g.drawRect(x, -y, 10, 20)
      g.endFill()
    }
  }
}

module.exports = Field2D
