"use strict";

var canvas;
var gl;
var vBuffer;
var cBuffer;
var paddle;
var ball;
let myForm;
var paddleOffset;
var triangle_count = 20;
var ballDropped;
var ballBounced;
var ballGone;
var ballX;
var ballY;
var reset;
var lives = 3;
var colors = [vec4(1.0, 0.0, 0.0, 1.0), vec4(1.0, 0.8, 0.0, 1.0), vec4(0.0, 0.8, 0.0, 1.0), vec4(0.0, 0.0, 0.8, 1.0)]
var theta = Math.random() * (Math.PI) / 2;
var score = 0;
var highScore = 0;
var bricks = [];

var left;
var up = false;


window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );
    reset = document.getElementById("reset");

    gl = gl = canvas.getContext('webgl2');
    if ( !gl ) { alert( "WebGL 2.0 isn't available" ); }

    paddleOffset = 0;

    
    if (Math.random() > 0.5){
        left = false;
    }
    else{
        left = true;
    }
    canvas.addEventListener("mousemove", function(event){
        paddleOffset = 2*event.clientX/canvas.width-1;
    })
    canvas.addEventListener("mousedown", function(event){
        if (lives > 0){
			ballDropped = true;
		}
		console.log((theta * 180) / Math.PI);
    });
    reset.addEventListener("click", function(event){
        ballX = (Math.random() * 1.8) - 0.9;
		ballY = 0.3;
        ball = makeBall(0.03, ballX, ballY);
        theta = Math.random() * Math.PI / 2;
	    paddle = makePaddle(paddleOffset);
        ballDropped = false;
        ballBounced = false;
        ballGone = false;
		lives = 3;
		for (var i = 0; i < 4; i++){
			for (var j = 0; j < 10; j++){
				bricks[i][j].broken = false;
			}
		}
		gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
		for (var i = 0; i < 4; i++){
			for (var j = 0; j < 10; j++){
				for (var k = 0; k < 4; k++){
					gl.bufferSubData(gl.ARRAY_BUFFER, 16*(paddle.positions.length + ball.positions.length + (i * 10 * 4) + (j * 4) + k), flatten(bricks[i][j].color));
				}
			}
		}
		score = 0;
		updateScore();
		updateLives();
    });
    ballX = (Math.random() * 2) - 1;
    ballY = 0.3;
	paddle = makePaddle(paddleOffset);
    ball = makeBall(0.03, ballX, ballY);
    var extra = 0.01;
    var temp = [];
    for (var i = 0; i < 4; i++){
        temp = [];
        for (var j = 0; j < 10; j++){
            temp.push(makeBrick(-1.0 + (0.2 * j) + 0.02, 0.98 - (0.10 * i) - 0.2, colors[3 - i]));
        }
        bricks.push(temp);
    }
    ballDropped = false;
    ballBounced = false;
    ballGone = false;

    myForm = document.forms["myForm"];


     //  Configure WebGL

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU

    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, 8*10000, gl.STATIC_DRAW );
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(paddle.positions));
    gl.bufferSubData(gl.ARRAY_BUFFER, 8*paddle.positions.length, flatten(ball.positions));
    for (var i = 0; i < 4; i++){
        for (var j = 0; j < 10; j++){
            gl.bufferSubData(gl.ARRAY_BUFFER, 8*(paddle.positions.length + ball.positions.length + (i * 10 * 4) + (j * 4)), flatten(bricks[i][j].positions));
        }
    }

    // Associate out shader variable with our data buffer

    var positionLoc = gl.getAttribLocation( program, "aPosition" );
    gl.vertexAttribPointer( positionLoc, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray(positionLoc);
	
	
	// Add color
	cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, 16*10000, gl.STATIC_DRAW );
    //gl.bufferData( gl.ARRAY_BUFFER, flatten(paddle.colors), gl.STATIC_DRAW );
    for (var ii = 0; ii < paddle.positions.length; ii++)
		gl.bufferSubData(gl.ARRAY_BUFFER, 16*ii, flatten(paddle.color));

    for (var ii = paddle.positions.length; ii < paddle.positions.length + ball.positions.length; ii++)
        gl.bufferSubData(gl.ARRAY_BUFFER, 16*ii, flatten(ball.color));

    for (var i = 0; i < 4; i++){
        for (var j = 0; j < 10; j++){
            for (var k = 0; k < 4; k++){
                gl.bufferSubData(gl.ARRAY_BUFFER, 16*(paddle.positions.length + ball.positions.length + (i * 10 * 4) + (j * 4) + k), flatten(bricks[i][j].color));
            }
        }
    }

    var colorLoc = gl.getAttribLocation(program, "aColor");
    gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorLoc);
	
    myForm.onchange = evt => {
        paddleOffset = 0;
        paddle = makePaddle(paddleOffset);
    }


     render();
};

function makePaddle(offset) {
	var p = [];
    var c = vec4(1.0, 1.0, 1.0, 0);
    if (document.getElementById("small").checked){
		p.push(vec2(-0.1 + offset, -0.95));
        p.push(vec2(0.1 + offset, -0.95));
        p.push(vec2(0.1 + offset, -1.0));
        p.push(vec2(-0.1 + offset, -1.0));
	}
    else if (document.getElementById("medium").checked){
        p.push(vec2(-0.2 + offset, -0.95));
        p.push(vec2(0.2 + offset, -0.95));
        p.push(vec2(0.2 + offset, -1.0));
        p.push(vec2(-0.2 + offset, -1.0));
    }
    else{
        p.push(vec2(-0.3 + offset, -0.95));
        p.push(vec2(0.3 + offset, -0.95));
        p.push(vec2(0.3 + offset, -1.0));
        p.push(vec2(-0.3 + offset, -1.0));
    }
	//Add code here to create a paddle Object
	//Your paddle object needs positions and a color
	
	return {positions:p, color:c};
}

function makeBrick(xPos, yPos, brickColor) {
	var b = false;
    var p = [];
    var c = brickColor;
    p.push(vec2(0.0 + xPos, 0.0 + yPos));
    p.push(vec2(0.16 + xPos, 0.0 + yPos));
    p.push(vec2(0.16 + xPos, -0.06 + yPos));
    p.push(vec2(0.0 + xPos, -0.06 + yPos));
	
	
	return {positions:p, color:c, broken:b};
}

function makeBall(r, x, y) {
	var c = vec2( x, y );
    var color = vec4(1.0, 1.0, 1.0, 1.0);
	var p = [];
	p.push(c);
	
	for (var i = 0; i <= triangle_count; i++)
	{
		p.push(vec2(
		r * Math.cos(i * 2.0 * Math.PI / triangle_count) + x ,
		r * Math.sin(i * 2.0 * Math.PI / triangle_count) + (y)));
	}
	
	return {center:c, radius:r, positions:p, color:color};
}

function updateScore(){
	document.querySelector('#score').textContent = score;
	document.querySelector('#highScore').textContent = highScore;
}
function updateLives(){
	document.querySelector('#lives').textContent = lives;
	if (lives == 0){
		document.querySelector('#gameOver').textContent = "Game Over! Press Reset to try again.";
	}
	else{
		document.querySelector('#gameOver').textContent = " ";
	}
}





function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
	paddle = makePaddle(paddleOffset);
	if (ballGone && lives > 0){
		ballX = (Math.random() * 1.8) - 0.9;
		ballY = 0.3;
        ball = makeBall(0.03, ballX, ballY);
        theta = Math.random() * Math.PI / 2;
	    paddle = makePaddle(paddleOffset);
        ballDropped = false;
        ballBounced = false;
        ballGone = false;
		lives--;
		updateLives();
	}
	else if (ballGone && lives == 0){
		updateLives();
	}
    if (!left && ball.center[0] >= 0.97){
        left = true;
    }
    else if (left && ball.center[0] <= -0.97){
        left = false;
    }

    if (up && ball.center[1] >= 0.97){
        up = false;
    }
    else if (!up && ball.center[1] <= -1.03){
        ballGone = true;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
	var brickBroken = false;
    for (var i = 0; i < 4; i++){
		if (brickBroken){
			brickBroken = false;
			break;
		}
        for (var j = 0; j < 10; j++){
            if (bricks[i][j].broken){
				continue;
			}
			if (up && (ball.center[1] + 0.03) > bricks[i][j].positions[2][1] && (ball.center[1] + 0.03) < bricks[i][j].positions[2][1] + 0.03
            && (ball.center[0] + 0.03) > bricks[i][j].positions[0][0] && (ball.center[0] - 0.03) < bricks[i][j].positions[1][0]){
				if (document.getElementById("small").checked){
					score += (4 - i) * 1500;
				}
				else if (document.getElementById("medium").checked){
					score += (4 - i) * 1250;
				}
				else {
					score += (4 - i) * 1000;
				}
                bricks[i][j].broken = true;
                for (var k = 0; k < 4; k++){
                    gl.bufferSubData(gl.ARRAY_BUFFER, 16*(paddle.positions.length + ball.positions.length + (i * 10 * 4) + (j * 4) + k), flatten(vec4(0.0, 0.0, 0.0, 1.0)));
                }
				updateScore();
                up = false;
				brickBroken = true;
				document.getElementById("myAudio").play();
				break;
            }
			else if (!up && (ball.center[1] - 0.03) < bricks[i][j].positions[1][1] && (ball.center[1] - 0.03) > bricks[i][j].positions[1][1] - 0.03
            && (ball.center[0] + 0.03) > bricks[i][j].positions[0][0] && (ball.center[0] - 0.03) < bricks[i][j].positions[1][0]){
                if (document.getElementById("small").checked){
					score += (4 - i) * 1500;
				}
				else if (document.getElementById("medium").checked){
					score += (4 - i) * 1250;
				}
				else {
					score += (4 - i) * 1000;
				}
                bricks[i][j].broken = true;
                for (var k = 0; k < 4; k++){
                    gl.bufferSubData(gl.ARRAY_BUFFER, 16*(paddle.positions.length + ball.positions.length + (i * 10 * 4) + (j * 4) + k), flatten(vec4(0.0, 0.0, 0.0, 1.0)));
                }
				updateScore();
                up = true;
				brickBroken = true;
				document.getElementById("myAudio").play();
				break;
            }
			
			if (left && (ball.center[0] - 0.03) < bricks[i][j].positions[1][0] && (ball.center[0] - 0.03) > bricks[i][j].positions[1][0] - 0.03
			&& ball.center[1] + 0.03 > bricks[i][j].positions[2][1] && ball.center[1] - 0.03 < bricks[i][j].positions[1][1]){
				if (document.getElementById("small").checked){
					score += (4 - i) * 1500;
				}
				else if (document.getElementById("medium").checked){
					score += (4 - i) * 1250;
				}
				else {
					score += (4 - i) * 1000;
				}
                bricks[i][j].broken = true;
                for (var k = 0; k < 4; k++){
                    gl.bufferSubData(gl.ARRAY_BUFFER, 16*(paddle.positions.length + ball.positions.length + (i * 10 * 4) + (j * 4) + k), flatten(vec4(0.0, 0.0, 0.0, 1.0)));
                }
				updateScore();
                left = false;
				brickBroken = true;
				document.getElementById("myAudio").play();
				break;
			}
			else if (!left && (ball.center[0] + 0.03) > bricks[i][j].positions[0][0] && (ball.center[0] + 0.03) < bricks[i][j].positions[0][0] + 0.03
			&& ball.center[1] + 0.03 > bricks[i][j].positions[2][1] && ball.center[1] - 0.03 < bricks[i][j].positions[1][1]){
				if (document.getElementById("small").checked){
					score += (4 - i) * 1500;
				}
				else if (document.getElementById("medium").checked){
					score += (4 - i) * 1250;
				}
				else {
					score += (4 - i) * 1000;
				}
                bricks[i][j].broken = true;
                for (var k = 0; k < 4; k++){
                    gl.bufferSubData(gl.ARRAY_BUFFER, 16*(paddle.positions.length + ball.positions.length + (i * 10 * 4) + (j * 4) + k), flatten(vec4(0.0, 0.0, 0.0, 1.0)));
                }
				updateScore();
                left = true;
				brickBroken = true;
				document.getElementById("myAudio").play();
				break;
			}
			
            
        }
    }
	if (score > highScore){
		highScore = score;
		updateScore();
	}
    if (ballDropped && !ballGone){
        if (up){
            ballY += 0.033 * Math.sin(theta);
        }
        else if (!up){
            ballY -= 0.033 * Math.sin(theta);
        }
        if (left){
            ballX -= 0.033 * Math.cos(theta);
        }
        else{
            ballX += 0.033 * Math.cos(theta);
        }
    }
    if (ballY <= -0.92 && ballX > paddle.positions[0][0] && ballX < paddle.positions[1][0]){
        if (ballY < -0.95){
            ballGone = true;
        }
		else{
			if (ballX > (paddle.positions[0][0] + paddle.positions[1][0]) / 2 + 0.05){
				if (left){
					if (theta + 0.05 < Math.PI - 0.05){
						theta -= 0.05;
					}
				}
				else{
					if (theta - 0.05 > 0.05){
						theta += 0.05;
					}
				}
			}
			else if (ballX < (paddle.positions[0][0] + paddle.positions[1][0]) / 2 - 0.05){
				if (left){
					if (theta + 0.05 < Math.PI - 0.05){
						theta += 0.05;
					}
				}
				else{
					if (theta - 0.05 > 0.05){
						theta -= 0.05;
					}
				}
			}
			up = true;
		}
        
    }
    ball = makeBall(0.03, ballX, ballY);
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(paddle.positions));
    gl.drawArrays( gl.TRIANGLE_FAN, 0, paddle.positions.length);

    
    gl.bufferSubData(gl.ARRAY_BUFFER, 8*paddle.positions.length, flatten(ball.positions));
    
    
    for (var i = 0; i < 4; i++){
        for (var j = 0; j < 10; j++){
            gl.drawArrays(gl.TRIANGLE_FAN, paddle.positions.length + ball.positions.length + i*40 + j*4, 4);
        }
    }

    gl.drawArrays(gl.TRIANGLE_FAN, paddle.positions.length, ball.positions.length);
    

	requestAnimationFrame(render);
}
