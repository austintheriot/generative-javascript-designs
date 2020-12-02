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

//CANVAS SCRIPT ////////////////////////////////////////////////////////

//Future Changes to Make:
//look up circuit designs--include the possiility of circles, squares, rectangles, double lines, etc.
//create little shiny lights that flow through the lines
//allow avoidant behavior with other lines
//create a simultaneous upside-down version//horixontal versions

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
ctx.globalCompositeOperation = 'multiply';
function getWidth() {
	return document.documentElement.clientWidth;
}
function getHeight() {
	return document.documentElement.clientHeight;
}
canvas.width = getWidth();
canvas.height = getHeight();

let mouse = {
	x: canvas.width / 2,
	y: canvas.height / 2,
};

//update mouse coordinates when the mouse moves
window.addEventListener('mousemove', (e) => {
	mouse.x = e.x;
	mouse.y = e.y;
});

let settings = {
	simultaneousBranches: 10,
	maxIterations: 150,
	startingX: canvas.width / 2,
	startingY: 0,
	//line settings
	maxVerticalDistance: 0.33 * canvas.height,
	minimumVerticalLength: 0.1, //guaranteed minimum length - as a ratio of the total possible length
	maxHorizontalDistance: 0.1 * canvas.width,
	lineColor: '0, 3, 20',
	lineWidth: 1,
	lineWidthMultiplier: 1,
	lineOpacityMultiplier: 0.9,
	horizontalXIncrement: 3,
	horizontalYIncrement: 5,
	verticalYIncrement: 2,
	verticalXIncrement: 0,
	//circle settings
	circleColor: '0, 3, 20',
	circleLineWidth: 2,
	drawCircleProbability: 0.75, //0. to 1.
};
const settingsBackup = { ...settings };

canvas.style.background = '#fff'; //canvas color

function addSliderListener(selector, modifier = () => 1) {
	let el = document.querySelector(`#${selector}`);
	el.value = settings[selector] / modifier();
	el.addEventListener('change', (e) => {
		settings[selector] = e.target.value * modifier();
		stopAnimationAndRestart();
	});
}

//programatically updating settings based on sliders
addSliderListener('simultaneousBranches');
addSliderListener('startingX', getWidth);
addSliderListener('startingY', getHeight);
addSliderListener('maxVerticalDistance', getHeight);
addSliderListener('minimumVerticalLength');
addSliderListener('maxHorizontalDistance', getWidth);
addSliderListener('lineWidth');
addSliderListener('lineWidthMultiplier');
addSliderListener('lineOpacityMultiplier');
addSliderListener('horizontalXIncrement');
addSliderListener('horizontalYIncrement');
addSliderListener('verticalYIncrement');
addSliderListener('verticalXIncrement');
addSliderListener('circleLineWidth');
addSliderListener('drawCircleProbability');

//initialize array containing info about each line segment group and circle
let lineArray;
let circleArray;

function init() {
	lineArray = [];
	circleArray = [];
	startSeed();
}

function addLineElement(xStart, yStart, opacity, width) {
	lineArray.push({
		verticalStart: {
			x: xStart,
			y: yStart,
		},
		verticalEnd: {
			x: xStart,
			y: yStart,
		},
		horizontalStart: {
			x: xStart,
			y: yStart,
		},
		horizontalEnd1: {
			x: xStart,
			y: yStart,
		},
		horizontalEnd2: {
			x: xStart,
			y: yStart,
		},
		maxVerticalLineDistance:
			(Math.random() * (1 - settings.minimumVerticalLength) +
				settings.minimumVerticalLength) *
			settings.maxVerticalDistance,
		maxHorizontalLineDistance: Math.random() * settings.maxHorizontalDistance,
		verticalComplete: false,
		horizontalComplete: false,
		complete: false,
		branched: false,
		logged: false,
		opacity: opacity || 1,
		width: width || settings.lineWidth,
	});
}

function addCircleElement(xStart, yStart, opacity, width) {
	circleArray.push({
		x: xStart,
		y: yStart,
		radius: Math.random() * 2.5 + 0.5,
		drawCircle: Math.random() < settings.drawCircleProbability ? true : false,
		opacity: opacity || 1,
		width: width || settings.circleLineWidth,
	});
}

//do something when mouse down
window.addEventListener('mousedown', mouseDownHandler);
//do something when mouse up
window.addEventListener('mouseup', mouseUpHandler);
//change line color to red on mousedown
function mouseDownHandler() {}
function mouseUpHandler() {}

function startSeed() {
	//create a seed from which to grow the roots
	for (let i = 0; i < settings.simultaneousBranches; i++) {
		addLineElement(settings.startingX, settings.startingY);
	}
}

function distance(start, stop) {
	return Math.sqrt((stop.x - start.x) ** 2 + (stop.y - start.y) ** 2);
}

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
	if (lineArray.length >= settings.maxIterations) {
		cancelAnimationFrame(animationFrameId);
	} else {
		animationFrameId = requestAnimationFrame(animate);
		drawLines();
		branch();
		increment();
	}
}

function increment() {
	for (let i = 0; i < lineArray.length; i++) {
		let line = lineArray[i];
		//increment the vertical line to the max
		if (
			distance(line.verticalStart, line.verticalEnd) <
			line.maxVerticalLineDistance
		) {
			line.verticalEnd.y += settings.verticalYIncrement;
			line.horizontalStart.y += settings.verticalYIncrement;
			line.horizontalEnd1.y += settings.verticalYIncrement;
			line.horizontalEnd2.y += settings.verticalYIncrement;

			line.verticalEnd.x += settings.verticalXIncrement;
			line.horizontalStart.x += settings.verticalXIncrement;
			line.horizontalEnd1.x += settings.verticalXIncrement;
			line.horizontalEnd2.x += settings.verticalXIncrement;
			continue;
		}

		if (line.verticalComplete === false) {
			addCircleElement(line.verticalEnd.x, line.verticalEnd.y, line.opacity);
			line.verticalComplete = true;
		}

		//once the vertical line is maxed out,
		//increment the horizontal line to the max
		if (
			distance(line.horizontalStart, line.horizontalEnd1) <
			line.maxHorizontalLineDistance
		) {
			//LINE LEFT
			line.horizontalEnd1.x -= settings.horizontalXIncrement;
			line.horizontalEnd1.y += settings.horizontalYIncrement;
			//LINE RIGHT
			line.horizontalEnd2.x += settings.horizontalXIncrement;
			line.horizontalEnd2.y += settings.horizontalYIncrement;
			continue;
		}

		if (line.horizontalComplete === false) {
			if (line.logged === false) {
				addCircleElement(
					line.horizontalEnd1.x,
					line.horizontalEnd1.y,
					line.opacity
				);
				addCircleElement(
					line.horizontalEnd2.x,
					line.horizontalEnd2.y,
					line.opacity
				);
				line.horizontalComplete = true;
			}
		}

		//if both lines are maxed out, mark segment as complete & add circle elements
		if (
			distance(line.verticalStart, line.verticalEnd) >=
				line.maxVerticalLineDistance &&
			distance(line.horizontalStart, line.horizontalEnd1) >=
				line.maxHorizontalLineDistance
		) {
			line.complete = true;
		}
	}
}

function addWhiteBackground() {
	ctx.fillStyle = '#fff';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawLines() {
	//DRAW
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	addWhiteBackground();
	for (let i = 0; i < lineArray.length; i++) {
		let line = lineArray[i];

		//draw vertical line
		ctx.beginPath();
		ctx.strokeStyle = `rgba(${settings.lineColor}, ${line.opacity})`;
		ctx.lineWidth = line.width;
		ctx.moveTo(line.verticalStart.x, line.verticalStart.y);
		ctx.lineTo(line.verticalEnd.x, line.verticalEnd.y);
		ctx.stroke();

		//draw horizontal line 1
		ctx.beginPath();
		ctx.strokeStyle = `rgba(${settings.lineColor}, ${line.opacity})`;
		ctx.lineWidth = line.width;
		ctx.moveTo(line.horizontalStart.x, line.horizontalStart.y);
		ctx.lineTo(line.horizontalEnd1.x, line.horizontalEnd1.y);
		ctx.stroke();

		//draw horizontal line 2
		ctx.beginPath();
		ctx.strokeStyle = `rgba(${settings.lineColor}, ${line.opacity})`;
		ctx.lineWidth = line.width;
		ctx.moveTo(line.horizontalStart.x, line.horizontalStart.y);
		ctx.lineTo(line.horizontalEnd2.x, line.horizontalEnd2.y);
		ctx.stroke();
	}

	for (let i = 0; i < circleArray.length; i++) {
		let circle = circleArray[i];
		//create an array of locations for the circles to be drawn from
		//draw circles
		if (circle.drawCircle === true) {
			ctx.beginPath();
			//draw a circle: (x-center, y-center, radius, starting angle (radians), ending angle (radians), counterclockwise (false by default))
			ctx.arc(circle.x, circle.y, circle.radius, Math.PI * 2, false);
			//draws the line created by the arc path
			ctx.strokeStyle = `rgba(${settings.circleColor}, ${circle.opacity})`;
			ctx.lineWidth = circle.width;
			ctx.stroke();

			/* //select color with which to fill the circles
    ctx.fillStyle = settings.circleColor;
    ctx.fill(); */
		}
	}
}

function branch() {
	for (let i = 0; i < lineArray.length; i++) {
		let line = lineArray[i];
		//if the drawoing is complete and it hasnt been branched
		//add 2 branches to every element and mark branched true on its object;
		if (line.complete === true && line.branched === false) {
			//ADD NEW LEFT ELEMENT
			addLineElement(
				line.horizontalEnd1.x,
				line.horizontalEnd1.y,
				line.opacity * settings.lineOpacityMultiplier,
				line.width * settings.lineWidthMultiplier
			);
			//ADD NEW RIGHT ELEMENT
			addLineElement(
				line.horizontalEnd2.x,
				line.horizontalEnd2.y,
				line.opacity * settings.lineOpacityMultiplier,
				line.width * settings.lineWidthMultiplier
			);
			//mark current item successfully branched
			line.branched = true;
		}
	}
}

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
		console.log(settings[el.id]);
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
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	drawLines();
}
resize();
