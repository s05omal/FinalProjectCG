"use strict";

var canvas;
var gl;
var vBuffer;
var chips = [];
var triangle_count = 200;
var cBuffer;
var maxPoints = 10000;
var grid;
var bufferLength = 0;
var blackChips = 0;
var whiteChips = 0;


window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );

    gl = gl = canvas.getContext('webgl2');
    if ( !gl ) { alert( "WebGL 2.0 isn't available" ); }

     //  Configure WebGL

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.7, 0.0, 1.0 );

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU

    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, 8*maxPoints, gl.STATIC_DRAW );

    // Associate out shader variable with our data buffer

    var positionLoc = gl.getAttribLocation( program, "aPosition" );
    gl.vertexAttribPointer( positionLoc, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray(positionLoc);
	
	// Add color to the ball
	cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, 16*maxPoints, gl.STATIC_DRAW );

    var colorLoc = gl.getAttribLocation(program, "aColor");
    gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorLoc);
	

	grid = makeGrid();
	gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
	gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(grid.positions) );

	gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
	for (var i = 0; i < grid.positions.length; i++)
		gl.bufferSubData(gl.ARRAY_BUFFER, 0 + i * 16, flatten(grid.color) );
		
	bufferLength += grid.positions.length;


   render();
};

function makeGrid()
{
	var p= [];
	for (var i = 1; i < 8; i++){
		p.push(vec2(-1.0 + (0.25 * i), 1.0));
		p.push(vec2(-1.0 + (0.25 * i), -1.0));
		p.push(vec2(-1.0, -1.0 + (0.25 * i)));
		p.push(vec2(1.0, -1.0 + (0.25 * i)));
	}
	p.push(vec2(-1.0, -1.0));
	p.push(vec2(-1.0, 1.0));
	p.push(vec2(-1.0, 1.0));
	p.push(vec2(1.0, 1.0));
	p.push(vec2(1.0, 1.0));
	p.push(vec2(1.0, -1.0));
	p.push(vec2(1.0, -1.0));
	p.push(vec2(-1.0, -1.0));
	var c = vec4(0.0, 0.0, 0.0, 1.0);
	return {color:c, positions:p}
}


function updateBuffer()
{
	gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferSubData( gl.ARRAY_BUFFER, 0, flatten(ball.positions) );
}
function makeBall(x, y, colorIn) {
	var r = 0.12;
	//var r = 0.5;

	var c = vec2( x, y )  ;
   
	var p = [];
	p.push(c);
	
	
	for (var i = 0; i <= triangle_count; i++)
	{
		p.push(vec2(
		r * Math.cos(i * 2.0 * Math.PI / triangle_count) + x,
		//r * Math.sin(i * 2.0 * Math.PI / triangle_count) + 1.0 - r) + y);
		r * Math.sin(i * 2.0 * Math.PI / triangle_count) + y));
	}
	var col = colorIn;
	return {color: col, center:c, radius:r, positions:p};
}


function convertX(clickX, canvas)
{
	return 2 * clickX/canvas.width - 1;
}

function convertY(clickY, canvas)
{
	return 2 * (canvas.height - clickY)/canvas.height - 1;
}


window.addEventListener("click", (event) =>
{
		//console.log(event.button);
		var chipColor;

		
		console.log(closestSquare(convertX(event.clientX, canvas)));
		console.log(closestSquare(convertY(event.clientY, canvas)));

		for (var i = 0; i < chips.length; i++){
			if (closestSquare(convertX(event.clientX, canvas)) == chips[i].center[0] && closestSquare(convertY(event.clientY, canvas)) == chips[i].center[1]){
				if (chips[i].color[0] == 1.0){
					chips[i].color = vec4(0.0, 0.0, 0.0, 1.0);
					gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
					for (var j = 0; j < chips[chips.length - 1].positions.length; j++){
						gl.bufferSubData(gl.ARRAY_BUFFER, 16*(grid.positions.length + (i * chips[i].positions.length) + j), flatten(chips[i].color));
					}
					blackChips++;
					whiteChips--;
					updateCount();
					render();
					return;
				}
				else if (chips[i].color[0] == 0.0 && chips[i].color[1] != 0.7){
					chips[i].color = vec4(0.0, 0.7, 0.0, 1.0);
					gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
					for (var j = 0; j < chips[chips.length - 1].positions.length; j++){
						gl.bufferSubData(gl.ARRAY_BUFFER, 16*(grid.positions.length + (i * chips[i].positions.length) + j), flatten(chips[i].color));
					}
					blackChips--;
					updateCount();
					render();
					return;
				}
			}
		}

		chips.push(makeBall(closestSquare(convertX(event.clientX, canvas)), closestSquare(convertY(event.clientY, canvas)), vec4(1.0, 1.0, 1.0, 1.0)));
		//chips.push(makeBall(0,0, vec4(0.0, 0.0, 0.0, 1.0)));
		gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
		gl.bufferSubData(gl.ARRAY_BUFFER, 8*bufferLength, flatten(chips[chips.length - 1].positions));
		gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
		for (var i = 0; i < chips[chips.length - 1].positions.length; i++){
			gl.bufferSubData(gl.ARRAY_BUFFER, 16*(bufferLength + i), flatten(chips[chips.length - 1].color));
		}
		bufferLength += chips[chips.length - 1].positions.length;
		whiteChips++;
		updateCount();

		render();
}
);

function closestSquare(pos){
	var closestPos = -0.875;
	for (var i = 0; i < 8; i++){
		if (Math.abs(pos - (-0.875 + i * 0.25)) < Math.abs(pos - closestPos)){
			closestPos = -0.875 + i * 0.25;
		}
	}
	return closestPos;
}

function updateCount(){
	document.querySelector('#blackChips').textContent = blackChips;
	document.querySelector('#whiteChips').textContent = whiteChips;
}




function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
	
    gl.drawArrays( gl.LINES, 0, grid.positions.length);
	for (var i = 0; i < chips.length; i++){
		//console.log("render" + chips[i].center[0] + "/" + chips[i].center[1]);
		gl.drawArrays(gl.TRIANGLE_FAN, (grid.positions.length + i * chips[i].positions.length), chips[i].positions.length)
	}
	
	requestAnimationFrame(render);
}
