//CSS Animations
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

//FUTURE ADDITIONS CHANGES TO MAKE:

//add presets
//add a reset to default button
//add a button to set attraction forces to 0
//make it mobile friendly---no mouse movement on mobile devices
//make mouse location undefined onmouseout
//allow balls to fade when deleted rather than instantly disappear
//allow balls to bounce off oneanother?

//BASIC SETUP
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const CANVAS_EDGE = 3; //if set to 0, half of each ball goes off the edge before bouncing back
const BALL_DELETE_DELAY = 15000; //15 seconds
const SQUARED_CONSTANT = 100; //100, this constant 'evens out' the difference between linear and squared acceleration
const CUBED_CONSTANT = 1000000; //100, this constant 'evens out' the difference between squred and cubed acceleration
const MOUSE_DRAWING = 'ON'; //ON or OFF
const CANVAS_COLOR = '34, 34, 34'; // the rgb equivalent of '#222';
let TRAILS = 1;
let INITIAL_NUMBER_OF_BALLS = 50;
let MAX_CONNECTION_DISTANCE = 150;
let BALL_COLOR = '#ffffff';
let LINE_COLOR = '255, 255, 255'; //the rest is filled out below in the draw function
let LINE_WIDTH = 1;
let ACCELERATION_DAMP = 0.5; //0 === no damp, 1 ===fully damped
let BALL_LINEAR_ATTRACTION = 0.001; //0.001
let BALL_SQUARED_ATTRACTION = -0.004; //-0.004
let MOUSE_LINEAR_ATTRACTION = 0; //0
let MOUSE_SQUARED_ATTRACTION = 0.2; //0.2
let MOUSE_CUBED_ATTRACTION = -0.004; //-0.4
let MAX_VELOCITY = 2; //2
let CANVAS_BOUNCE = true; //ON (Bounce) or OFF (Wrap)

//set up canvas
const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
//initialize canvas width and height as the window size
c.globalCompositeOperation = 'lighter';
canvas.width = window.innerWidth - 20;
canvas.height = window.innerHeight - 20;
//initialize the array that will hold information for number of balls
const ballArray = [];
//create an object to contain mouse coordinates
let mouse = {
	x: canvas.width / 2,
	y: canvas.height / 2,
};

//update mouse coordinates when the mouse moves
window.addEventListener('mousemove', (e) => {
	mouse.x = e.x;
	mouse.y = e.y;
});

function addBall(specifyX, specifyY) {
	ballArray.push({
		//position
		x: specifyX || Math.random() * canvas.width,
		y: specifyY || Math.random() * canvas.height,
		//initializes z position between 500 and 1000

		//velocity
		dx: Math.random() * 2 - 1, //velocity between -1 and 1
		dy: Math.random() * 2 - 1,

		//acceleration
		dx2: 0,
		dy2: 0,

		//circle mass
		mass: Math.random() * 5, //between 0 and 5

		//circle radius
		radius: 2.5,
	});
}

//do something when mouse down
window.addEventListener('mousedown', mouseDownHandler);
//do something when mouse up
window.addEventListener('mouseup', mouseUpHandler);
//change line color to red on mousedown
function mouseDownHandler() {}
function mouseUpHandler() {
	//deletes new balls after the specified time
	setTimeout(deleteOldBalls, BALL_DELETE_DELAY);
	addBall(mouse.x, mouse.y);
}

//resize canvas size when window is resizes
window.addEventListener('resize', (e) => {
	canvas.width = window.innerWidth - 20;
	canvas.height = window.innerHeight - 20;
});

//INITIALIZING CUSTOMIZABLE/INTERACTIVE SLIDERS
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//NUMBER OF BALLS
const numberOfBallsSlider = document.getElementById('numberOfBalls');
numberOfBallsSlider.value = INITIAL_NUMBER_OF_BALLS;
numberOfBallsSlider.oninput = function () {
	let adjustAmount = this.value - INITIAL_NUMBER_OF_BALLS;
	INITIAL_NUMBER_OF_BALLS = this.value;
	adjustBallArray(adjustAmount);
};

//ACCELERATION DAMP
const acclerationDampSlider = document.getElementById('accelerationDamp');
acclerationDampSlider.value = ACCELERATION_DAMP;
acclerationDampSlider.oninput = function () {
	ACCELERATION_DAMP = 1 - this.value;
};

//MAX_VELOCITY
const maxVelocitySlider = document.getElementById('maxVelocitySlider');
maxVelocitySlider.value = MAX_VELOCITY;
maxVelocitySlider.oninput = function () {
	MAX_VELOCITY = this.value;
};

//TRAILS trailsSlider
const trailsSlider = document.getElementById('trailsSlider');
trailsSlider.value = 1 - TRAILS;
trailsSlider.oninput = function () {
	TRAILS = 1 - this.value;
};

//MAX CONNECTION DISTANCE
const connectionDistanceSlider = document.getElementById(
	'connectionDistanceSlider'
);
connectionDistanceSlider.value = MAX_CONNECTION_DISTANCE;
connectionDistanceSlider.oninput = function () {
	MAX_CONNECTION_DISTANCE = this.value;
};

//LINE WIDTH
const lineWidthSlider = document.getElementById('lineWidthSlider');
lineWidthSlider.value = LINE_WIDTH;
lineWidthSlider.oninput = function () {
	LINE_WIDTH = this.value;
};

//BALL_LINEAR_ATTRACTION
const ballLinearAttractionSlider = document.getElementById(
	'ballLinearAttractionSlider'
);
ballLinearAttractionSlider.value = BALL_LINEAR_ATTRACTION;
ballLinearAttractionSlider.oninput = function () {
	BALL_LINEAR_ATTRACTION = this.value;
};

//BALL SQUARED ATTRACTION
const ballSquaredAttractionSlider = document.getElementById(
	'ballSquaredAttractionSlider'
);
ballSquaredAttractionSlider.value = BALL_SQUARED_ATTRACTION;
ballSquaredAttractionSlider.oninput = function () {
	BALL_SQUARED_ATTRACTION = this.value;
};

//MOUSE_LINEAR_ATTRACTION
const mouseLinearAttractionSlider = document.getElementById(
	'mouseLinearAttractionSlider'
);
mouseLinearAttractionSlider.value = MOUSE_LINEAR_ATTRACTION;
mouseLinearAttractionSlider.oninput = function () {
	MOUSE_LINEAR_ATTRACTION = this.value;
};

//Mouse Squared Attraction
const mouseSquaredAttractionSlider = document.getElementById(
	'mouseSquaredAttractionSlider'
);
mouseSquaredAttractionSlider.value = MOUSE_SQUARED_ATTRACTION;
mouseSquaredAttractionSlider.oninput = function () {
	MOUSE_SQUARED_ATTRACTION = this.value;
};

//Mouse Cubed Attraction
const mouseCubedAttractionSlider = document.getElementById(
	'mouseCubedAttractionSlider'
);
mouseCubedAttractionSlider.value = MOUSE_CUBED_ATTRACTION;
mouseCubedAttractionSlider.oninput = function () {
	MOUSE_CUBED_ATTRACTION = this.value;
};

//BALL COLOR ballColor
const ballColor = document.getElementById('ballColor');
ballColor.value = BALL_COLOR;
ballColor.oninput = function () {
	BALL_COLOR = this.value;
};

//CANVAS_BOUNCE
const canvasBounceOnOff = document.getElementById('canvasBounceOnOff');
canvasBounceOnOff.checked = true;
canvasBounceOnOff.oninput = function () {
	if (canvasBounceOnOff.checked == true) {
		CANVAS_BOUNCE = true;
	} else {
		CANVAS_BOUNCE = false;
	}
};

//INITIALIZATION / HANDLING THE ARRAY
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//initialize the coordinates, initial velocity, and radius for each ball
function initializeBalls() {
	//for each ball, create an object that contains that
	for (let i = 0; i < INITIAL_NUMBER_OF_BALLS; i++) {
		addBall();
	}
}

function adjustBallArray(adjustAmount) {
	for (let i = 0; i < Math.abs(adjustAmount); i++) {
		adjustAmount > 0 ? addBall() : ballArray.pop();
	}
}

//intialize the balls' true radius to be proportional to their mass
function initializeRadius() {
	for (let i = 0; i < INITIAL_NUMBER_OF_BALLS; i++) {
		let ball = ballArray[i];
		ball.radius = ball.mass / (5 / 3) + 1; //size the radius proportionally to its mass (between 1 and 4)
	}
}

//deletes the first ball in the array when called
function deleteOldBalls() {
	if (ballArray.length > INITIAL_NUMBER_OF_BALLS) {
		ballArray.shift();
	}
}

//PHYSICS
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//helper function to calculate distance between two points
//distance = the hypotenuse between 2 points
//distance = Math.sqrt(dx^2 + dy^2);

function directionVector(point1, point2) {
	let dx = point2.x - point1.x; //change in x
	let dy = point2.y - point1.y; //change in y
	return [dx, dy];
}

function distance(point1, point2) {
	let dx = point2.x - point1.x; //change in x
	let dy = point2.y - point1.y; //change in y
	dx *= dx;
	dy *= dy;
	return Math.sqrt(dx + dy);
}

function animate() {
	//calls the function as fast as reasonably possible to enable animation
	//this is because using setInterval() is inconsistent and processor-heavy
	//it basically coordinates the screen repainting with when the computer is ready to do so
	//and also slows or stops animation while the tab isn't open
	requestAnimationFrame(animate);

	updateAcceleration();
	updateVelocity();
	updatePosition();
	draw();
}

function updateAcceleration() {
	for (let i = 0; i < ballArray.length; i++) {
		//first, damp residual acceleration for each ball
		let ball = ballArray[i];
		ball.dx2 = ball.dx2 * ACCELERATION_DAMP;
		ball.dy2 = ball.dy2 * ACCELERATION_DAMP;

		//attraction between balls (Exponential)
		for (let j = 0; j < ballArray.length; j++) {
			let ball1 = ballArray[i];
			let ball2 = ballArray[j];
			let dist = distance(ball1, ball2);

			//attraction to ball2 (linear)
			//X
			let dirx = directionVector(ball1, ball2)[0];
			let ballLinearAccelerationX =
				((dirx / (dist + 0.01)) * BALL_LINEAR_ATTRACTION) / ball1.mass;
			//Y
			let diry = directionVector(ball1, ball2)[1];
			let ballLinearAccelerationY =
				((diry / (dist + 0.01)) * BALL_LINEAR_ATTRACTION) / ball1.mass;

			//attraction to ball2 (sqaured)
			//X
			let ballExponentialAccelerationX =
				((dirx / (dist * dist + 0.01)) *
					BALL_SQUARED_ATTRACTION *
					SQUARED_CONSTANT) /
				ball1.mass;
			//Y
			let ballExponentialAccelerationY =
				((diry / (dist * dist + 0.01)) *
					BALL_SQUARED_ATTRACTION *
					SQUARED_CONSTANT) /
				ball1.mass;

			//adding accelerations together
			ball1.dx2 += ballLinearAccelerationX + ballExponentialAccelerationX;
			ball1.dy2 += ballLinearAccelerationY + ballExponentialAccelerationY;
		}

		let dist = distance(ball, mouse);

		//attraction to mouse (Linear)
		//X
		let dirx = directionVector(ball, mouse)[0];
		let mouseLinearAccelerationX =
			((dirx / (dist + 0.01)) * MOUSE_LINEAR_ATTRACTION) / ball.mass;
		//Y
		let diry = directionVector(ball, mouse)[1];
		let mouseLinearAccelerationY =
			((diry / (dist + 0.01)) * MOUSE_LINEAR_ATTRACTION) / ball.mass;

		//attraction to mouse (squared)
		//X
		let mouseSquaredAccelerationX =
			((dirx / (dist * dist + 0.01)) *
				MOUSE_SQUARED_ATTRACTION *
				SQUARED_CONSTANT) /
			ball.mass;
		//Y
		let mouseSquaredAccelerationY =
			((diry / (dist * dist + 0.01)) *
				MOUSE_SQUARED_ATTRACTION *
				SQUARED_CONSTANT) /
			ball.mass;

		//attraction to mouse (cubed)
		//X
		let mouseCubedAccelerationX =
			((dirx / (dist * dist * dist + 0.01)) *
				MOUSE_CUBED_ATTRACTION *
				CUBED_CONSTANT) /
			ball.mass;
		//Y
		let mouseCubedAccelerationY =
			((diry / (dist * dist * dist + 0.01)) *
				MOUSE_CUBED_ATTRACTION *
				CUBED_CONSTANT) /
			ball.mass;

		//adding forces together
		ball.dx2 +=
			mouseLinearAccelerationX +
			mouseSquaredAccelerationX +
			mouseCubedAccelerationX;
		ball.dy2 +=
			mouseLinearAccelerationY +
			mouseSquaredAccelerationY +
			mouseCubedAccelerationY;
	}
}

//for each frame, check each ball's velocity and adjust accordingly
function updateVelocity() {
	for (let i = 0; i < ballArray.length; i++) {
		let ball = ballArray[i];

		//velocity affected by acceleration
		ball.dx += ball.dx2;
		ball.dy += ball.dy2;

		//max velocity
		ball.dx = Math.min(MAX_VELOCITY, Math.max(-MAX_VELOCITY, ball.dx));
		ball.dy = Math.min(MAX_VELOCITY, Math.max(-MAX_VELOCITY, ball.dy));
	}
}

function updatePosition() {
	for (let i = 0; i < ballArray.length; i++) {
		let ball = ballArray[i];
		//change position based on velocity
		ball.x += ball.dx;
		ball.y += ball.dy;

		if (!CANVAS_BOUNCE) {
			ball.x = ball.x % canvas.width;
			ball.y = ball.y % canvas.height;
			//WRAP AROUND THE EDGES OF THE CANVAS
			if (ball.x <= 0) {
				ball.x += canvas.width;
			}
			if (ball.y <= 0) {
				ball.y += canvas.height;
			}
		}
		//BOUNCE OFF THE SIDES OF THE CANVAS
		else {
			if (ball.x < CANVAS_EDGE) {
				ball.dx = Math.abs(ball.dx);
				ball.dx2 = Math.abs(ball.dx2);
			}
			if (ball.x > canvas.width - CANVAS_EDGE) {
				ball.dx = -Math.abs(ball.dx);
				ball.dx2 = -Math.abs(ball.dx2);
			}
			if (ball.y < CANVAS_EDGE) {
				ball.dy = Math.abs(ball.dx);
				ball.dy2 = Math.abs(ball.dy2);
			}
			if (ball.y > canvas.height - CANVAS_EDGE) {
				ball.dy = -Math.abs(ball.dy);
				ball.dy2 = -Math.abs(ball.dy2);
			}
		}
	}
}

//DRAWING
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//DRAW BALLS & LINES
function draw() {
	//first clears the canvas
	c.fillStyle = `rgba(${CANVAS_COLOR}, ${TRAILS})`;
	c.fillRect(0, 0, canvas.width, canvas.height);

	//draw the balls
	for (let i = 0; i < ballArray.length; i++) {
		let ball = ballArray[i];
		//initialize a path for a circle
		c.beginPath();
		//draw a circle: (x-center, y-center, radius, starting angle (radians), ending angle (radians), counterclockwise (false by default))
		c.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2, false);
		//draws the line created by the arc path
		c.strokeStyle = BALL_COLOR;
		c.stroke();
		//fills in the circle with a color
		c.fill();
		//select color with which to fill the circles
		c.fillStyle = BALL_COLOR;
	}

	//draw the lines between the mouse and each ball
	for (let i = 0; i < ballArray.length; i++) {
		let ball1 = ballArray[i];
		let mouseDistance = distance(mouse, ball1);
		let mouseDistanceProportion = 1 - mouseDistance / MAX_CONNECTION_DISTANCE;
		let mouseDistanceAlpha = Math.min(1, Math.max(0, mouseDistanceProportion));
		//initialize a path for a line
		c.beginPath();
		//creates starting point at x & y coordinates of ball1
		c.moveTo(ball1.x, ball1.y);
		//create lines depending on mouse position
		if (mouseDistance < MAX_CONNECTION_DISTANCE && MOUSE_DRAWING === 'ON') {
			//with lineTo, the line keeps the same starting point,
			//but draws a line to the place indicated
			c.lineTo(mouse.x, mouse.y);
			c.lineWidth = LINE_WIDTH;
			c.strokeStyle = `rgba(${LINE_COLOR}, ${mouseDistanceAlpha})`;
			c.stroke();
		}

		//draw lines between each ball
		for (let j = 0; j < ballArray.length; j++) {
			let ball2 = ballArray[j]; //ball2 == the individual ball object of each array
			let ballDistance = distance(ball1, ball2);
			let ballDistanceProportion = 1 - ballDistance / MAX_CONNECTION_DISTANCE;
			let ballDistanceAlpha = Math.min(1, Math.max(0, ballDistanceProportion));
			//initialize a path for a line
			c.beginPath();
			//creates starting point at x & y coordinates of ball1
			c.moveTo(ball1.x, ball1.y);
			//create lines depending on mouse position
			if (ballDistance < MAX_CONNECTION_DISTANCE) {
				c.lineTo(ball2.x, ball2.y);
				c.lineWidth = LINE_WIDTH;
				c.strokeStyle = `rgba(${LINE_COLOR}, ${ballDistanceAlpha})`;
				c.stroke();
			}
		}
	}
}

//CALL THE FUNCTIONS
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

initializeBalls();
initializeRadius();
animate();
