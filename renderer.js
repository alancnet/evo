// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const Evolution = require('./src/Evolution')
const Field2D = require('./src/Field2D')
const Nodeling = require('./src/Nodeling')
const PIXI = require('pixi.js')
const fs = require('fs')

const renderer = PIXI.autoDetectRenderer({
  width: 800,
  height: 600,
  backgroundColor: 0x1099bb,
  antialias: true
})
document.body.appendChild(renderer.view)
const population = fs.existsSync('save.json')
  ? Nodeling.load(fs.readFileSync('save.json'))
  : 20
const evolution = new Evolution(
  Field2D,
  Nodeling,
  population,
  20,
  renderer
)
evolution.evolution()
