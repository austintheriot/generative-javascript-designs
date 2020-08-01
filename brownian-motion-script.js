//CSS Animations:
let sidebar = document.querySelector('.sidebar')
let hamburger = document.querySelector('.hamburger')
let line1 = document.querySelector('.hamburger__line1')
let line2 = document.querySelector('.hamburger__line2')
let line3 = document.querySelector('.hamburger__line3')

function showSliders() {
  if (sidebar.style.left === '0px') {
    sidebar.style.left = '-200px'
    sidebar.style.opacity = '0'
    hamburger.style.left = '20px'
    line1.style.transform = 'translate(0px, 0px) rotate(0deg)'
    line1.style.marginTop = '4px'
    line2.style.transform = 'translate(0px, 0px) rotate(0deg)'
    line2.style.marginTop = '4px'
    line3.style.transform = 'translate(0px, 0px) rotate(0deg)'
    line3.style.marginTop = '4px'
  } else {
    sidebar.style.left = '0px'
    sidebar.style.opacity = '0.95'
    hamburger.style.left = '220px'
    line1.style.transform = 'translate(-2px, 9px) rotate(45deg)'
    line1.style.marginTop = '0px'
    line2.style.transform = 'translate(-2px, 5px) rotate(135deg)'
    line2.style.marginTop = '0px'
    line3.style.transform = 'translate(-2px, 1px) rotate(135deg)'
    line3.style.marginTop = '0px'
  }
}

const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
ctx.globalCompositeOperation = 'multiply'
canvas.style.background = '#fff'
canvas.width = window.innerWidth
canvas.height = window.innerHeight
let numberOfFrames
let circleArray

let settings = {
  maxMovementDistance: 1,
  numberOfStartingPoints: 100,
  maxNumberOfFrames: 1000,
  circleRadius: 0.5,
  startingRadius: Math.min(canvas.width / 3, canvas.height / 3),
  containMovementWithinCircle: true,
  randomizeColors: true,
  circleOutlineWidth: 0.05,
  circleColor: '#000',
  centerPoint: {
    x: Math.round(canvas.width / 2),
    y: Math.round(canvas.height / 2),
  },
}

const settingsBackup = { ...settings }

//HTML Interaction
//////////////////////////////////////////////////////////////////////
function addSliderListener(selector, modifier = () => 1) {
  let el = document.querySelector(`#${selector}`)
  el.value = settings[selector] / modifier()
  el.addEventListener('change', (e) => {
    settings[selector] = e.target.value * modifier()
    stopAnimationAndRestart()
  })
}

//programatically updating settings based on sliders
addSliderListener('maxMovementDistance')
addSliderListener('numberOfStartingPoints')
addSliderListener('maxNumberOfFrames')
addSliderListener('circleRadius')
addSliderListener('startingRadius')

//CALCUATION FUNCTIONS
//////////////////////////////////////////////////////////////////////
function distance(start, stop) {
  return Math.sqrt((stop.x - start.x) ** 2 + (stop.y - start.y) ** 2)
}

//create a random point within a given radius
function randomPointWithinACircle(center, radius) {
  let r = radius * Math.sqrt(Math.random())
  let theta = Math.random() * 2 * Math.PI
  return {
    x: Math.round(center.x + r * Math.cos(theta)),
    y: Math.round(center.y + r * Math.sin(theta)),
  }
}

function calculateUnitVector(point1, point2) {
  let dx = point2.x - point1.x
  let dy = point2.y - point1.y
  let magnitude = Math.sqrt(dx ** 2 + dy ** 2)
  return { x: Math.round(dx / magnitude), y: Math.round(dy / magnitude) }
}

function randomColor() {
  return `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${
    Math.random() * 255
  })`
}

//CICLE ARRAY
//////////////////////////////////////////////////////////////////////
//add a starting point at [0, 0]
function addCircleElement(location) {
  circleArray.push({
    x: location.x || 0,
    y: location.y || 0,
    radius: settings.circleRadius,
    locationArray: [],
    locationMarker: 0,
    color: settings.randomizeColors ? randomColor() : settings.circleColor,
  })
}

//add starting locations in the shape of a circle
function addCircleElementWithinAGivenRadius(center, radius) {
  let randomPointInACircle = randomPointWithinACircle(center, radius)
  addCircleElement(randomPointInACircle)
}

//LOCATION ARRAY & MOVEMENT
//////////////////////////////////////////////////////////////////////
//add location to every circle element
function addRandomLocationElement(circle) {
  circle.locationArray.push({
    x: Math.round(Math.random() * canvas.width),
    y: Math.round(Math.random() * canvas.height),
  })
}

//add location to every circle element within a given radius
function addCircularLocationElement(circle, radius) {
  //finds a random point within a given radius of the circle's location
  let randomPointInACircle = randomPointWithinACircle(circle, radius)
  //adds that location to the circle's location
  circle.locationArray.push({
    x: randomPointInACircle.x,
    y: randomPointInACircle.y,
  })
}

//MOVEMENT
//////////////////////////////////////////////////////////////////////

//move the circle element around on the canvas
function incrementCircleLocation() {
  for (let i = 0; i < circleArray.length; i++) {
    let circle = circleArray[i]
    let location = circle.locationArray[circle.locationMarker]
    let unitVector = calculateUnitVector(circle, location)
    if (distance(circle, location) > 1) {
      circle.x = circle.x + unitVector.x
      circle.y = circle.y + unitVector.y
    }
    if (distance(circle, location) <= 1) {
      //constrain next random location within circle
      if (settings.containMovementWithinCircle) {
        let nextRandomLocation
        if (distance(circle, location) <= 1) {
          do {
            nextRandomLocation = randomPointWithinACircle(
              circle,
              settings.maxMovementDistance
            )
          } while (
            distance(settings.centerPoint, nextRandomLocation) >
            settings.startingRadius
          )
          circle.locationArray.push({
            x: nextRandomLocation.x,
            y: nextRandomLocation.y,
          })
          circle.locationMarker += 1
        }
      }
      //do not constrain next random location
      if (settings.containMovementWithinCircle === false) {
        nextRandomLocation = randomPointWithinACircle(
          circle,
          settings.maxMovementDistance
        )
        circle.locationArray.push({
          x: nextRandomLocation.x,
          y: nextRandomLocation.y,
        })
        circle.locationMarker += 1
      }
    }
  }
}

//DRAWING
//////////////////////////////////////////////////////////////////////
function drawCircles() {
  for (let i = 0; i < circleArray.length; i++) {
    let circle = circleArray[i]
    ctx.beginPath()
    //draw a circle: (x-center, y-center, radius, starting angle (radians), ending angle (radians), counterclockwise (false by default))
    ctx.arc(circle.x, circle.y, circle.radius, Math.PI * 2, false)
    //draws the line created by the arc path
    ctx.strokeStyle = circle.color
    ctx.lineWidth = settings.circleOutlineWidth
    ctx.stroke()
    ctx.fillStyle = circle.color
    ctx.fill()
  }
}

//Initialization & Animation
//////////////////////////////////////////////////////////////////////
function addWhiteBackground() {
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

function init() {
  circleArray = []
  numberOfFrames = 0

  addWhiteBackground()
  //create starting points within the bounds of the canvas
  for (let i = 0; i < settings.numberOfStartingPoints; i++) {
    addCircleElementWithinAGivenRadius(
      settings.centerPoint,
      //use whichever constraint is smaller, so that the whole circle fits on the screen
      settings.startingRadius
    )
  }

  //add one location element to every circle
  for (let i = 0; i < circleArray.length; i++) {
    let circle = circleArray[i]
    addCircularLocationElement(circle, settings.maxMovementDistance)
  }
}

let animationFrameId
const requestAnimationFrame =
  window.requestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.msRequestAnimationFrame
const cancelAnimationFrame =
  window.cancelAnimationFrame || window.mozCancelAnimationFrame

function animate() {
  //stop animations after reaching a max number of iterations
  if (numberOfFrames >= settings.maxNumberOfFrames) {
    cancelAnimationFrame(animationFrameId)
    console.log('The max number of animation frames has been reached')
  } else {
    animationFrameId = requestAnimationFrame(animate)
    drawCircles()
    incrementCircleLocation()
    numberOfFrames++
  }
}

/////////////////////////////////////////////////////////////////////
init()
animate()

const buttonGenerateNew = document.querySelector('.generate-new')
//restart when buttonGenerateNew is pressed
buttonGenerateNew.addEventListener('click', stopAnimationAndRestart)

const buttonRestoreDefaults = document.querySelector('.restore-defaults')
buttonRestoreDefaults.addEventListener('click', restoreDefaultSettings)

function restoreDefaultSettings() {
  settings = { ...settingsBackup }
  document.querySelectorAll('input').forEach((el) => {
    el.value = settings[el.id]
  })
  stopAnimationAndRestart()
}

function stopAnimationAndRestart() {
  cancelAnimationFrame(animationFrameId)
  init()
  animate()
}

//calibrate canvas to window width & height
window.addEventListener('resize', resize)
function resize() {
  numberOfFrames = 0
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  drawCircles()
}
