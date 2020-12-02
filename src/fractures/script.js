//CSS Animations:
let sidebar = document.querySelector('.sidebar');
let hamburger = document.querySelector('.hamburger');
let line1 = document.querySelector('.hamburger__line1');
let line2 = document.querySelector('.hamburger__line2');
let line3 = document.querySelector('.hamburger__line3');

hamburger.addEventListener('click', () => {
	if (sidebar.style.left === '0px') {
		sidebar.style.left = '-200px';
		sidebar.style.opacity = '0';
		hamburger.style.left = '20px';
		line1.style.transform = 'translate(0px, 0px) rotate(0deg)';
		line1.style.marginTop = '4px';
		line2.style.transform = 'translate(0px, 0px) rotate(0deg)';
		line2.style.marginTop = '4px';
		line3.style.transform = 'translate(0px, 0px) rotate(0deg)';
		line3.style.marginTop = '4px';
	} else {
		sidebar.style.left = '0px';
		sidebar.style.opacity = '0.95';
		hamburger.style.left = '220px';
		line1.style.transform = 'translate(-2px, 9px) rotate(45deg)';
		line1.style.marginTop = '0px';
		line2.style.transform = 'translate(-2px, 5px) rotate(135deg)';
		line2.style.marginTop = '0px';
		line3.style.transform = 'translate(-2px, 1px) rotate(135deg)';
		line3.style.marginTop = '0px';
	}
});

//CANVAS CODE
//fix branch offset to be based on theta rather than linear adjustments

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
ctx.globalCompositeOperation = 'multiply';
canvas.width = document.documentElement.clientWidth;
canvas.height = document.documentElement.clientHeight;

let sourceArray;
let fractureArray;
let currentNumberofFrames = 0;

let settings = {
	numberOfStartingFractures: 10,
	fractureLineSegmentLength: 10,
	chanceOfBranchingOff: 0.2,
	maxBranchLength: 10,
	numberOfRandomLines: 0,
	maxRandomLineLength: 100,
	maxFrames: 1000,
	fractureLineWidth: 1,
	centerPoint: { x: canvas.width / 2, y: canvas.height / 2 },
	startingRadius: Math.min(canvas.width / 2.5, canvas.height / 2.5),
	contstrainWithinCircle: true,
	fractureLineColor: '#000',
	backgroundColor: '#fff',
};

const settingsBackup = { ...settings };

function addSliderListener(selector, modifier = () => 1) {
	let el = document.querySelector(`#${selector}`);
	el.value = settings[selector] / modifier();
	el.addEventListener('change', (e) => {
		settings[selector] = e.target.value * modifier();
		stopAnimationAndRestart();
	});
}

function getWidth() {
	return document.documentElement.clientWidth;
}
function getHeight() {
	return document.documentElement.clientHeight;
}

//programatically updating settings based on sliders
addSliderListener('numberOfStartingFractures');
addSliderListener('fractureLineSegmentLength');
addSliderListener('chanceOfBranchingOff');
addSliderListener('maxBranchLength');
addSliderListener('numberOfRandomLines');
addSliderListener('maxRandomLineLength');
addSliderListener('maxFrames');
addSliderListener('fractureLineWidth');

//CALCUATION FUNCTIONS
//////////////////////////////////////////////////////////////////////

function distance(point1x, point1y, point2x, point2y) {
	return Math.sqrt((point2x - point1x) ** 2 + (point2y - point1y) ** 2);
}

//create a random point within a given radius
function randomPointWithinACircle(center, radius) {
	let r = radius * Math.sqrt(Math.random());
	let theta = Math.random() * 2 * Math.PI;
	return {
		x: Math.round(center.x + r * Math.cos(theta)),
		y: Math.round(center.y + r * Math.sin(theta)),
	};
}

function doTheseTwoLinesIntersect(a, b, c, d, p, q, r, s) {
	var det, gamma, lambda;
	det = (c - a) * (s - q) - (r - p) * (d - b);
	if (det === 0) {
		return false;
	} else {
		lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
		gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
		return 0 < lambda && lambda < 1 && 0 < gamma && gamma < 1;
	}
}

function doesThisLineIntersectAnyOtherLine(x1, y1, x2, y2) {
	return !fractureArray.every(
		(el) =>
			!doTheseTwoLinesIntersect(el.x1, el.y1, el.x2, el.y2, x1, y1, x2, y2)
	);
	//returns true if the line DOES intersect with another line
}

function doesItExitTheCanvas(x1, y1, x2, y2) {
	//returns true if the any point on the line falls outside of the canvas
	return x1 < 0 ||
		x1 > canvas.width ||
		y1 < 0 ||
		y1 > canvas.height ||
		x2 < 0 ||
		x2 > canvas.width ||
		y2 < 0 ||
		y2 > canvas.height
		? true
		: false;
}

function doesItExitTheCircle(x1, y1, x2, y2) {
	if (!settings.contstrainWithinCircle) {
		return false;
	}
	return distance(settings.centerPoint.x, settings.centerPoint.y, x1, y1) >
		settings.startingRadius
		? true
		: distance(settings.centerPoint.x, settings.centerPoint.y, x2, y2) >
		  settings.startingRadius
		? true
		: false;
}

function randomLine() {
	let newLine = {};
	do {
		let pointA = {
			x: Math.random() * canvas.width,
			y: Math.random() * canvas.height,
		};
		let pointB = {
			x:
				pointA.x +
				Math.random() *
					settings.maxRandomLineLength *
					(Math.round(Math.random()) * 2 - 1),
			y:
				pointA.y +
				Math.random() *
					settings.maxRandomLineLength *
					(Math.round(Math.random()) * 2 - 1),
		};
		newLine = {
			pointA,
			pointB,
		};
	} while (
		doesThisLineIntersectAnyOtherLine(
			newLine.pointA.x,
			newLine.pointA.y,
			newLine.pointB.x,
			newLine.pointB.y
		) ||
		doesItExitTheCircle(
			newLine.pointA.x,
			newLine.pointA.y,
			newLine.pointB.x,
			newLine.pointB.y
		) ||
		doesItExitTheCanvas(
			newLine.pointA.x,
			newLine.pointA.y,
			newLine.pointB.x,
			newLine.pointB.y
		)
	);
	return newLine;
}

//INITIALIZING ARRAYS
//////////////////////////////////////////////////////////////////////
//create a starting point for the fractures
function addSource() {
	sourceArray.push(
		randomPointWithinACircle(settings.centerPoint, settings.startingRadius)
	);
}

//add starting fractures to the fracture array
function addFracture(x1, y1, dx, dy, x2, y2) {
	for (let i = 0; i < sourceArray.length; i++) {
		let theta = Math.random() * Math.PI * 2;
		let randomDX = Math.cos(theta) * settings.fractureLineSegmentLength;
		let randomDY = Math.sin(theta) * settings.fractureLineSegmentLength;
		fractureArray.push({
			x1: x1 || sourceArray[i].x,
			y1: y1 || sourceArray[i].y,
			dx: dx || randomDX,
			dy: dy || randomDY,
			x2: x2 || sourceArray[i].x + randomDX,
			y2: y2 || sourceArray[i].y + randomDY,
			width: settings.fractureLineWidth,
			color: settings.fractureLineColor,
			stopped: false,
			angle: theta,
		});
	}
}

function addRandomLines() {
	let line = randomLine();
	fractureArray.push({
		x1: line.pointA.x,
		y1: line.pointA.y,
		dx: 0,
		dy: 0,
		x2: line.pointB.x,
		y2: line.pointB.y,
		width: settings.fractureLineWidth,
		color: settings.fractureLineColor,
		stopped: true,
	});
}

//ONGOING LINE MOVEMENT
//////////////////////////////////////////////////////////////////////

function addNewFractureLineSegments() {
	let len = fractureArray.length; //define before the loop, or else it never ends
	for (let i = 0; i < len; i++) {
		let fracture = fractureArray[i];

		//only add more if the line is not 'stopped'
		if (fracture.stopped === false) {
			let branchingRandomization = Math.random();

			//continue the existing fracture line without branching
			if (branchingRandomization > settings.chanceOfBranchingOff) {
				let newx1 = fracture.x2;
				let newy1 = fracture.y2;
				let newdx = fracture.dx;
				let newdy = fracture.dy;
				let newx2 = fracture.x2 + newdx;
				let newy2 = fracture.y2 + newdy;
				if (
					doesThisLineIntersectAnyOtherLine(newx1, newy1, newx2, newy2) ===
						false &&
					doesItExitTheCircle(newx1, newy1, newx2, newy2) === false &&
					doesItExitTheCanvas(newx1, newy1, newx2, newy2) === false
				) {
					addFracture(fracture.x2, fracture.y2, newdx, newdy, newx2, newy2);
					fracture.stopped = true;
					continue;
				} else {
					fracture.stopped = true;
				}
			}

			//branch the existing line
			let angleRandomizationX = Math.random() * 2 - 1;
			let angleRandomizationY = Math.random() * 2 - 1;
			if (branchingRandomization < settings.chanceOfBranchingOff) {
				let newx1 = fracture.x2;
				let newy1 = fracture.y2;
				let newdx =
					fracture.dx + angleRandomizationX * settings.maxBranchLength;
				let newdy =
					fracture.dy + angleRandomizationY * settings.maxBranchLength;
				let newx2 = fracture.x2 + newdx;
				let newy2 = fracture.y2 + newdy;
				if (
					doesThisLineIntersectAnyOtherLine(newx1, newy1, newx2, newy2) ===
						false &&
					doesItExitTheCircle(newx1, newy1, newx2, newy2) === false
				) {
					addFracture(newx1, newy1, newdx, newdy, newx2, newy2);
				}
			}

			//add in to create a TWO-pronged branching lines
			/* if (branchingRandomization < settings.chanceOfBranchingOff) {
        let newx1 = fracture.x2;
        let newy1 = fracture.y2;
        let newdx = fracture.dx - angleRandomizationX * settings.maxBranchLength;
        let newdy = fracture.dy - angleRandomizationY * settings.maxBranchLength;
        let newx2 = fracture.x2 + newdx;
        let newy2 = fracture.y2 + newdy;
        if (
          doesThisLineIntersectAnyOtherLine(newx1, newy1, newx2, newy2) === false &&
          doesItExitTheCircle(newx1, newy1, newx2, newy2) === false
        ) {
          addFracture(newx1, newy1, newdx, newdy, newx2, newy2);
          fracture.stopped = true;
        } else {
          fracture.stopped = true;
        }
      } */
		}
	}
}

//DRAWING
//////////////////////////////////////////////////////////////////////
//like 'clear' but with a white background so that the image is opaque
function addWhiteBackground() {
	ctx.fillStyle = settings.backgroundColor;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawFracture() {
	addWhiteBackground();
	for (let i = 0; i < fractureArray.length; i++) {
		let fracture = fractureArray[i];
		ctx.beginPath();
		//creates starting point at x & y coordinates of ball1
		ctx.moveTo(fracture.x1, fracture.y1);
		//create lines depending on mouse position
		ctx.lineTo(fracture.x2, fracture.y2);
		ctx.lineWidth = fracture.width;
		ctx.strokeStyle = fracture.color;
		ctx.stroke();
	}
}

//INITIALIZATION
//////////////////////////////////////////////////////////////////////
function init() {
	currentNumberofFrames = 0;
	sourceArray = [];
	fractureArray = [];

	//add a source for the fractures
	addSource();

	//add in random lines (optional)
	for (let i = 0; i < settings.numberOfRandomLines; i++) {
		addRandomLines();
	}

	//add initial fractures coming from the source
	for (let i = 0; i < settings.numberOfStartingFractures; i++) {
		addFracture();
	}
}

//ANIMATE
//////////////////////////////////////////////////////////////////////
//limit how many frames to render

let animationFrameId;
const requestAnimationFrame =
	window.requestAnimationFrame ||
	window.mozRequestAnimationFrame ||
	window.webkitRequestAnimationFrame ||
	window.msRequestAnimationFrame;
const cancelAnimationFrame =
	window.cancelAnimationFrame || window.mozCancelAnimationFrame;

function animate() {
	//stop animations after reaching a max number of iterations
	if (currentNumberofFrames > settings.maxFrames) {
		cancelAnimationFrame(animationFrameId);
		console.log('The max number of animation frames has been reached');
	} else {
		animationFrameId = requestAnimationFrame(animate);
		drawFracture();
		addNewFractureLineSegments();
		currentNumberofFrames++;
	}
}

//////////////////////////////////////////////////////////////////////
init();
animate();

const buttonGenerateNew = document.querySelector('.generate-new');
//restart when buttonGenerateNew is pressed
buttonGenerateNew.addEventListener('click', stopAnimationAndRestart);

const buttonRestoreDefaults = document.querySelector('.restore-defaults');
buttonRestoreDefaults.addEventListener('click', restoreDefaultSettings);

function restoreDefaultSettings() {
	settings = { ...settingsBackup };
	document.querySelectorAll('input').forEach((el) => {
		el.value = settings[el.id];
	});
	stopAnimationAndRestart();
}

function stopAnimationAndRestart() {
	cancelAnimationFrame(animationFrameId);
	init();
	animate();
}

//calibrate canvas to window width & height
window.addEventListener('resize', resize);
function resize() {
	currentNumberofFrames = 0;
	canvas.width = document.documentElement.clientWidth;
	canvas.height = document.documentElement.clientHeight;
	drawFracture();
}
