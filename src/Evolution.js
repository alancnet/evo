const Simulation = require('./Simulation')
class Evolution{
  constructor(StageClass, OrganismClass, population, seconds, renderer) {
    this.StageClass = StageClass
    this.OrganismClass = OrganismClass
    this.seconds = seconds
    this.renderer = renderer
    if (Array.isArray(population)) {
      this.popSize = population.length
      this.organisms = population
    } else {
      this.popSize = population
      this.organisms = Array(population).fill().map(() => new OrganismClass())
    }
  }

  async run() {
    const sim = new Simulation(
      new this.StageClass(),
      this.organisms,
      this.seconds,
      this.renderer
    )

    await sim.run()
  }
  sort() {
    const orgFit = this.organisms.map(o => ({
      o,
      f: o.getFitness()
    }))
    orgFit.sort((a, b) => b.f - a.f)
    this.organisms = orgFit.map(({o}) => o)
    console.log('Best fitness: ', this.organisms[0].getFitness())
  }
  cull() {
    this.organisms = this.organisms.map((o, i) =>
      (i / this.organisms.length + Math.random() - 0.6) < 0.5
      ? o : null
    )
    console.log('Culled', this.organisms.map(x => x ? 'X' : '_').join(''))
  }
  breed() {
    var i = 0
    const donors = this.organisms.filter(x => x)
    this.organisms = this.organisms.map((x, j) => x
      ? (j > 0 ? x.mutate() : x.clone())
      : donors[i++ % donors.length].mutate())
  }
  async evolve() {
    console.info('evolve')
    await this.run(this.seconds)
    this.sort()
    this.cull()
    this.breed()
  }
  async evolution() {
    while (true) {
      await this.evolve()
    }
  }
}

module.exports = Evolution
