const fs = require('fs-extra')
const path = require('path')

const absSum = (arr) => arr.reduce((c, i) => c + Math.abs(i), 0)

class Particle {
  constructor (id, position, velocity, acceleration) {
    this.id = id
    this.position = position
    this.velocity = velocity
    this.acceleration = acceleration
  }

  accelerationDistance () {
    return absSum(Object.keys(this.acceleration).map((k) => this.acceleration[k]))
  }

  velocityDistance () {
    return absSum(Object.keys(this.velocity).map((k) => this.velocity[k]))
  }

  positionDistance () {
    return absSum(Object.keys(this.position).map((k) => this.position[k]))
  }

  step () {
    let [vx, vy, vz] = Object.keys(this.velocity).map((k) => this.velocity[k] + this.acceleration[k])
    this.velocity = {x: vx, y: vy, z: vz}

    let [px, py, pz] = Object.keys(this.position).map((k) => this.position[k] + this.velocity[k])
    this.position = {x: px, y: py, z: pz}
  }

}

const solveFirstTask = (particles) => {

  return particles.reduce((c, p) => {
    if (c.accelerationDistance() < p.accelerationDistance()) {
      return c
    }
    if (c.accelerationDistance() > p.accelerationDistance()) {
      return p
    }

    if (c.velocityDistance() < p.velocityDistance()) {
      return c
    }
    if (c.velocityDistance() > p.velocityDistance()) {
      return p
    }

    if (c.positionDistance() < p.positionDistance()) {
      return c
    }

    return p

  })
}

const solveSecondTask = (particles) => {

  for (let i = 0; i < 2E3; i++) {
    let positions = []
    let particleIdsToRemove = []

    particles.forEach((p) => {
      p.step()
    })
    particles.forEach((p) => {
        let posString = JSON.stringify(p.position)
        let indexOfPosString = positions.map(p => p.position).indexOf(posString)
        if (indexOfPosString !== -1) {
          particleIdsToRemove.push(p.id, positions[indexOfPosString].id)
        } else {
          positions.push({id: p.id, position: posString})
        }
      }
    )

    particles = particles.filter(p => !particleIdsToRemove.includes(p.id))
  }
  return particles.length
}

const solveTasks = (rawParticles) => {

  let particles = (rawParticles).split('\n').map((line, id) => {
    let [position, velocity, acceleration] = line.split(' ').map((coordinates) => {
      let [x, y, z] = coordinates.substr(3, coordinates.indexOf('>') + 1).split(',').map((i) => parseInt(i))

      return {x, y, z}
    })
    return new Particle(id, position, velocity, acceleration)
  })

  console.log(solveFirstTask(particles), solveSecondTask(particles))
}

fs.readFile(path.join(__dirname, 'input.txt'), 'utf8').then(solveTasks).catch(e => console.error(e))