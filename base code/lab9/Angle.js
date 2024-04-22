"use strict";

var canvas;
var gl;
var triangle_count = 200;
var vBuffer;
var xOffset = 0;
var yOffset = -0.85;
var theta = Math.random() * 90;

var left = false;
var up = true;



var ball;


window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );

    gl = gl = canvas.getContext('webgl2');
    if ( !gl ) { alert( "WebGL 2.0 isn't available" ); }

    ball = makeBall();
	


     //  Configure WebGL

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU

    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, 8*(ball.positions.length), gl.STATIC_DRAW );

    // Associate out shader variable with our data buffer

    var positionLoc = gl.getAttribLocation( program, "aPosition" );
    gl.vertexAttribPointer( positionLoc, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray(positionLoc);
	
	//for (var i = 0; i < ball1.positions.length; i++)
	gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
	gl.bufferSubData(gl.ARRAY_BUFFER,0, flatten(ball.positions));

	// Add color to the ball
	var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, 16*ball.positions.length, gl.STATIC_DRAW );
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(ball.positions));

    var colorLoc = gl.getAttribLocation(program, "aColor");
    gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorLoc);
	
	gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
	var color = vec4(1.0, 1.0, 1.0, 1.0);
	for (var ii = 0; ii < ball.positions.length; ii++)
		gl.bufferSubData(gl.ARRAY_BUFFER, 16*ii, flatten(color));
 


     render();
};

function makeBall() {
	var c = vec2( xOffset, yOffset)  ;
   
	var p = [];
	p.push(c);
	
	var r = 0.15;
	for (var i = 0; i <= triangle_count; i++)
	{
		p.push(vec2(
		r * Math.cos(i * 2.0 * Math.PI / triangle_count) + xOffset,
		r * Math.sin(i * 2.0 * Math.PI / triangle_count) + yOffset));
	}
	
	return {center:c, radius:r, positions:p};
}





function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );

    if (!left && ball.center[0] >= 0.85){
        left = true;
    }
    else if (left && ball.center[0] <= -0.85){
        left = false;
    }

    if (up && ball.center[1] >= 0.85){
        up = false;
    }
    else if (!up && ball.center[1] <= -0.85){
        up = true;
    }

    if (left){
        xOffset -= 0.05 * Math.cos(theta * Math.PI / 180);
    }
    else{
        xOffset += 0.05 * Math.cos(theta * Math.PI / 180);
    }
    if (up){
        yOffset += 0.05 * Math.sin(theta * Math.PI / 180);
    }
    else{
        yOffset -= 0.05 * Math.sin(theta * Math.PI / 180);
    }

    ball = makeBall();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(ball.positions));
	
    gl.drawArrays( gl.TRIANGLE_FAN, 0, ball.positions.length);
	
	requestAnimationFrame(render);
}
