const createSim = () => {
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

  world.addBodies = (bodies) => bodies.forEach((body, i) =>
    body instanceof p2.Spring
    ? world.addSpring(body)
    : body instanceof p2.ContactMaterial
    ? world.addContactMaterial(body)
    : world.addBody(body) || bodies.slice(i + 1)
      .filter((b) => b instanceof p2.Body).forEach(
      (b) => world.disableBodyCollision(b, body)
    )
  )

  return world
}

module.exports = { createSim }
