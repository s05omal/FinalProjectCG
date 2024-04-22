"use strict";

var canvas;
var gl;
var vBuffer;
var cBuffer;
var metronome;
var xOffset = 0.7;
var yOffset = -0.3;
var lines = [vec2(-0.1 + xOffset, 0.0 + yOffset), vec2(0.1 + xOffset, 0.0 + yOffset), vec2(0.1 + xOffset, 0.2 + yOffset), vec2(-0.1 + xOffset, 0.2 + yOffset)];
var theta = 70;




window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );

    gl = gl = canvas.getContext('webgl2');
    if ( !gl ) { alert( "WebGL 2.0 isn't available" ); }

	metronome = makeMetronome();

     //  Configure WebGL

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU

    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, 8*6, gl.STATIC_DRAW );
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(metronome.positions));
    gl.bufferSubData(gl.ARRAY_BUFFER, 8*2, flatten(lines));



    // Associate out shader variable with our data buffer

    var positionLoc = gl.getAttribLocation( program, "aPosition" );
    gl.vertexAttribPointer( positionLoc, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray(positionLoc);
	
	// Add color
	cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, 16*6, gl.STATIC_DRAW );

    var colorLoc = gl.getAttribLocation(program, "aColor");
    gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorLoc);
	
	var color = vec4(1.0, 1.0, 1.0, 1.0);
	for (var i = 0; i < metronome.positions.length; i++)
		gl.bufferSubData(gl.ARRAY_BUFFER, 16*i, flatten(color));
    color = vec4(0.0, 1.0, 1.0, 1.0);
    for (var i = 2; i <=6; i++){
        gl.bufferSubData(gl.ARRAY_BUFFER, 16*i, flatten(color));
    }
	
     render();
};

function makeMetronome(angle, mLeft) {
	var p = [];
	p.push(vec2(xOffset,yOffset));
	var len = 0.2;
	p.push(vec2(len * Math.cos(angle * Math.PI / 180.0) + xOffset, 
	            len * Math.sin(angle * Math.PI / 180.0) + yOffset)
		   );
	return {moveLeft:mLeft, armLength:len, positions:p};
}

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );

    if (metronome.moveLeft){
        theta += 1;
    }
    else{
        theta -= 1;
    }
    if (theta < 70 && !metronome.moveLeft){
        metronome = makeMetronome(theta, true);
    }
    else if (theta > 110 && metronome.moveLeft){
        metronome = makeMetronome(theta, false);
    }
    else{
        metronome = makeMetronome(theta, metronome.moveLeft);
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(metronome.positions));
	gl.drawArrays(gl.LINES, 0, metronome.positions.length);
    gl.drawArrays(gl.LINE_LOOP, 2, 4);

	requestAnimationFrame(render);
}
