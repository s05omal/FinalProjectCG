"use strict";

var canvas;
var gl;
var vBuffer;
var cBuffer;
var paddle;
var ball;
let myForm;
var paddleOffset;
var ballOffset;
var triangle_count = 20;
var ballDropped;
var ballBounced;
var ballGone;
var ballX;


window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );

    gl = gl = canvas.getContext('webgl2');
    if ( !gl ) { alert( "WebGL 2.0 isn't available" ); }

    paddleOffset = 0;
    ballOffset = 0;
    canvas.addEventListener("mousemove", function(event){
        paddleOffset = 2*event.clientX/canvas.width-1;
    })
    canvas.addEventListener("mousedown", function(event){
        ballDropped = true;
    });

    ballX = (Math.random() * 2) - 1;
	paddle = makePaddle(paddleOffset);
    ball = makeBall(0.03, ballX, 0.97);
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
    gl.bufferData( gl.ARRAY_BUFFER, 8*paddle.positions.length + 8*ball.positions.length, gl.STATIC_DRAW );
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(paddle.positions));
    gl.bufferSubData(gl.ARRAY_BUFFER, 8*paddle.positions.length, flatten(ball.positions));

    // Associate out shader variable with our data buffer

    var positionLoc = gl.getAttribLocation( program, "aPosition" );
    gl.vertexAttribPointer( positionLoc, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray(positionLoc);
	
	
	// Add color
	cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, 16*paddle.positions.length + 16*ball.positions.length, gl.STATIC_DRAW );
    //gl.bufferData( gl.ARRAY_BUFFER, flatten(paddle.colors), gl.STATIC_DRAW );
    for (var ii = 0; ii < paddle.positions.length; ii++)
		gl.bufferSubData(gl.ARRAY_BUFFER, 16*ii, flatten(paddle.color));

    for (var ii = paddle.positions.length; ii < paddle.positions.length + ball.positions.length; ii++)
        gl.bufferSubData(gl.ARRAY_BUFFER, 16*ii, flatten(ball.color));

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

function makeBall(r, x, y, offset) {
	var c = vec2( x, y - offset );
    var color = vec4(0.0, 1.0, 0.2, 1.0);
	var p = [];
	p.push(c);
	
	for (var i = 0; i <= triangle_count; i++)
	{
		p.push(vec2(
		r * Math.cos(i * 2.0 * Math.PI / triangle_count) + x ,
		r * Math.sin(i * 2.0 * Math.PI / triangle_count) + (y - offset)));
	}
	
	return {center:c, radius:r, positions:p, color:color};
}





function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
	paddle = makePaddle(paddleOffset);
    if (ballDropped){
        if (!ballBounced && !ballGone){
            ballOffset += 0.01;
        }
        else if (ballBounced && !ballGone){
            ballOffset -= 0.01;
        }
    }
    if ((ballOffset >= 0.97 + 0.92 && ballX > paddle.positions[0][0] && ballX < paddle.positions[1][0])|| ballOffset < 0 ){
        if (ballOffset > 2){
            ballGone = true;
        }
        ballBounced = !ballBounced;
    }
    ball = makeBall(0.03, ballX, 0.97, ballOffset);
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(paddle.positions));
    gl.drawArrays( gl.TRIANGLE_FAN, 0, paddle.positions.length);

    
    gl.bufferSubData(gl.ARRAY_BUFFER, 8*paddle.positions.length, flatten(ball.positions));
    gl.drawArrays(gl.TRIANGLE_FAN, paddle.positions.length, ball.positions.length);
    

	requestAnimationFrame(render);
}
