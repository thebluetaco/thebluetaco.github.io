

//░█▀▀▀█ ░█▀▀█ ▀▀█▀▀ ▀█▀ ░█▀▀▀█ ░█▄─░█ ░█▀▀▀█ 
//░█──░█ ░█▄▄█ ─░█── ░█─ ░█──░█ ░█░█░█ ─▀▀▀▄▄ 
//░█▄▄▄█ ░█─── ─░█── ▄█▄ ░█▄▄▄█ ░█──▀█ ░█▄▄▄█ 

var HORIZON_Y = 0.4;
var SPACING_Y = 2.2;
var SPACING_X = 35;
var SPACING_SCANLINES = 12;
var SKEW = 15;
var SPEED = 0.01;
var P_GLITCH = 0.007;
var GLITCH_PAUSE_DURATION = [100, 300]; // min, max in ms.
var COLOR = [220, 0, 220];
var TITLE = '403';
//hex Settings
var hexagon_radius = 300;
var hexagon_max_absolute_speed = 0.9;
var hexagon_line_width = 30;
var hexagon_color = '#ff00d9';
var side_hex = 0;
var size_hex= 300;

/*
░█▀▀█ ░█▀▀▀█ ░█▀▀▄ ░█▀▀▀ 
░█─── ░█──░█ ░█─░█ ░█▀▀▀ 
░█▄▄█ ░█▄▄▄█ ░█▄▄▀ ░█▄▄▄ 
*/
var rombas = [] ;
var x_hex, y_hex;
var img, hex, text;
var dynamicCtx = document.createElement('canvas').getContext('2d');
var staticCtx = document.createElement('canvas').getContext('2d');
var screenCtx = document.createElement('canvas').getContext('2d');
var ctxs = [dynamicCtx, staticCtx, screenCtx];
var rombas_out = 0;
// Define and hydrate the state.
// The rest is filled onResize.
var state = {
	glitched: false,
	yOffset: 0 };

var audio = new Audio('boop.mp3');

function onResize() {
	var h = state.h = window.innerHeight * 2;
	var w = state.w = window.innerWidth * 2;
	var y0 = state.y0 = h * (1 - HORIZON_Y);
	state.nHorizontal =
	Math.pow(h * HORIZON_Y, 1 / SPACING_Y);
	state.nVertical = Math.ceil(w / SPACING_X);
	state.nScanlines = Math.ceil(h / SPACING_SCANLINES);

	// Update the DOM.
	ctxs.forEach(function (ctx) {
		ctx.canvas.height = state.h;
		ctx.canvas.width = state.w;
	});

	drawStatic();
};

function drawStatic() {
    
    var h = state.h,w = state.w,y0 = state.y0,nVertical = state.nVertical;
	var ctx = staticCtx;
    
    placeRombas();
	
    ctx.clearRect(0, 0, w, h);
    
	// Draw vertical lines.
    ctx.shadowColor = "rgba(0,0,0,0)";
    for (var n = 0; n < nVertical; ++n) {
		ctx.beginPath();
		var x = nVertical / 2 - n;
		var x1 = x * SPACING_X + w / 2;
		var x2 = x * SPACING_X * SKEW + w / 2;
		ctx.beginPath();
		ctx.moveTo(x1, 0);
		ctx.moveTo(x1, y0);
		ctx.lineTo(x2, h);
		stroke(ctx);
	}
	
	drawStaticHex(w,h,[100,0,100]);
	// setting up hex to draw in drawloop()
    placeHexagon(w / 2,h / 2,{l: 0});
    /*
    ctx.fillStyle = 'rgba(255,0,255, 1)';
    ctx.fillRect((w /2)- 156,(h /2)+ 20, 85, 85) ;
	
    ctx.fillStyle = 'rgba(100,0,100, 1)';
    ctx.fillRect((w/2) - 151,(h /2)+ 25,75,75);
    
    ctx.fillStyle = 'rgba(255,0,255, 1)';
    ctx.fillRect((w /2)- 75,(h /2)- 55, 150,160) ;
	
    ctx.fillStyle = 'rgba(100,0,100, 1)';
    ctx.fillRect((w/2) - 70,(h /2)- 50,140,150);
    
    ctx.fillStyle = 'rgba(255,0,255, 1)';
    ctx.fillRect((w /2)- 76,(h /2)- 55, 85, 85) ;
	
    ctx.fillStyle = 'rgba(100,0,100, 1)';
    ctx.fillRect((w/2) - 71,(h /2)- 50,75,75);
    */
    // Draw title.    
    ctx.shadowColor = 'rgb(0,0,0)';
    ctx.shadowBlur = 20;
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.fillStyle = 'rgba(' + COLOR + ', 1)';
	ctx.font = '64pt "Monoton", monospace';
	ctx.fillText(TITLE, w / 2,(h / 2) - 500);

	drawScreenArtifacts();
}

function drawScreenArtifacts() {var
	h = state.h,w = state.w;
	var ctx = screenCtx;

	ctx.clearRect(0, 0, w, h);
    
	// Draw scanlines.
	var strokeOptions = {
		c1: 'rgba(44, 74, 44, 0.16)',
		c2: 'rgba(0, 10, 0, 0.16)' };

	for (var n = 0; n < state.nScanlines; ++n) {
		var y = n * SPACING_SCANLINES;
		ctx.beginPath();
		ctx.moveTo(0, y);
		ctx.lineTo(w, y);
		stroke(ctx, strokeOptions);
	}

	// Draw glow.
	ctx.beginPath();
	var glow = ctx.createRadialGradient(
	w / 2, h / 2, Math.max(w, h),
	w / 2, h / 2, SPACING_X * 1.5);
    placeRombas();
	glow.addColorStop(0.2, 'rgba(0, 0, 0, 0.16)');
	glow.addColorStop(1.0, 'rgba(' + COLOR + ', 0.16)');
	ctx.fillStyle = glow;
	ctx.fillRect(0, 0, w, h);
}


function drawDynamic() {

    var h = state.h,w = state.w,y0 = state.y0,nHorizontal = state.nHorizontal,yOffset = state.yOffset;
	var ctx = dynamicCtx;
    
    ctx.clearRect(0, 0, w, h);
    
    ctx.beginPath();
    drawHexagonPath();
    
    //console.log(rombas.length);
    
    
    for (var n = 0; n < rombas.length; n++){
        var rect = rombas[n] 
        ctx.fillStyle = ('rgba(200,0,200,1)');
        ctx.fillRect(rect.x - 5 ,rect.y - 5,rect.h + 10 ,rect.w + 10);
        ctx.fillStyle = ('rgba(100,0,100,1)');
        ctx.fillRect(rect.x ,rect.y ,rect.h ,rect.w);
        rect.x = rect.x + rect.speed;    
        if(rect.x > w){
            rombas.splice(n,1);
        }
    };
    /*
    ctx.fillStyle = ('rgba(200,0,200,1)');
    ctx.fillRect(g - 5 ,f - 5,110 ,110);
    ctx.fillStyle = ('rgba(100,0,100,1)');
    ctx.fillRect(g ,f ,100 ,100);
    */
    // Draw horizontal lines.
    ctx.shadowColor = "rgba(0,0,0,0)";
	for (var n = 0; n < nHorizontal; n++) {
		var y = y0 + 2 + Math.pow(n + yOffset, SPACING_Y);
        ctx.beginPath();
		ctx.moveTo(0, y);
		ctx.lineTo(w, y);
		stroke(ctx);
	}
	state.yOffset = (yOffset + SPEED) % 1;
    
}

function drawLoop() {
	requestAnimationFrame(drawLoop);

	if (state.glitched) return;
	drawDynamic();

	if (Math.random() > P_GLITCH) return;
	//audio.play();
    drawGlitch();

    
}


//Draw Hexagons
function drawStaticHex(w,h,color){
    var ctx = staticCtx;
    var rotate = 0.5;
    ctx.beginPath();
    x_hex = (w / 2)
    y_hex = (h / 2)
    hex_radius = 100;
    ctx.moveTo(
        x_hex + Math.cos( Math.PI / 3 * (side_hex + rotate)  ) * hex_radius + Math.cos( Math.PI / 3 * (side_hex + (2 + rotate)) ) * hex_radius,
		y_hex + Math.sin( Math.PI / 3 * (side_hex + rotate) ) * hex_radius +  Math.sin( Math.PI / 3 * (side_hex + (2 + rotate)) ) * hex_radius 
    );
    for (side_hex; side_hex < 7; side_hex++) {
        ctx.lineTo(
        x_hex + Math.cos( Math.PI / 3 * ( side_hex + (1 + rotate) )) * hexagon_radius,
		y_hex + Math.sin( Math.PI / 3 * ( side_hex + (1 + rotate) )) * hexagon_radius
                  );
    };
    side_hex = 0
    ctx.shadowColor = "rgba(0,0,0,0)";
    ctx.fillStyle ='rgba('+color+',1)';
    ctx.fill();
    stroke(ctx);
}
// creates new rombas object to look cool
function placeRombas() {
    
    //console.log("place rombas")
    var ctx = staticCtx;
	var h = Math.floor(Math.random() * 500),
		w = Math.floor(Math.random() * 600),
        x = h - (h*2),
        y = Math.random() * 700,
        p = Math.random() * 10;
	var rect = ({x: x,y: y,w: w,h: h,speed:p});
    rombas.push(rect);
}

function placeHexagon(x, y, opts) {
    var ctx = staticCtx;
	var l = Math.floor(Math.random() * 6),
		p = Math.random();
	
	if(!opts) opts = {};
	
	hex = ({sl: opts.l || opts.l === 0 ? opts.l : l,
		p: opts.p || opts.p === 0 ? opts.p : p,
		x: x,
		y: y,
		speed: opts.speed || opts.speed === 0 ? opts.speed : ( Math.random() * hexagon_max_absolute_speed * 2 - hexagon_max_absolute_speed )
	});
}

function drawHexagonPath() {
    var rotate = 0.5
	var ctx = dynamicCtx;
    ctx.moveTo(
		hex.x + Math.cos( Math.PI / 3 * (hex.sl + rotate)  ) * hexagon_radius + Math.cos( Math.PI / 3 * (hex.sl + (2 + rotate)) ) * hexagon_radius * hex.p,
		hex.y + Math.sin( Math.PI / 3 * (hex.sl + rotate) ) * hexagon_radius +  Math.sin( Math.PI / 3 * (hex.sl + (2 + rotate)) ) * hexagon_radius * hex.p
	);
	
	//ctx.moveTo(hex.x, hex.y);
	
	ctx.lineTo(
		hex.x + Math.cos( Math.PI / 3 * ( hex.sl + (1 + rotate) )) * hexagon_radius,
		hex.y + Math.sin( Math.PI / 3 * ( hex.sl + (1 + rotate) )) * hexagon_radius
    );
    
    ctx.lineTo(
		hex.x + Math.cos( Math.PI / 3 * ( hex.sl + (1 + rotate) )) * hexagon_radius,
		hex.y + Math.sin( Math.PI / 3 * ( hex.sl + (1 + rotate) )) * hexagon_radius
	);
	
	ctx.lineTo(
		hex.x + Math.cos( Math.PI / 3 * ( hex.sl + (2 + rotate) ) ) * hexagon_radius,
		hex.y + Math.sin( Math.PI / 3 * ( hex.sl + (2 + rotate) ) )* hexagon_radius
	);
	
	ctx.lineTo(
		hex.x + Math.cos( Math.PI / 3 * ( hex.sl + (3 + rotate) ) ) * hexagon_radius,
		hex.y + Math.sin( Math.PI / 3 * ( hex.sl + (3 + rotate) ) ) * hexagon_radius
	);
	
	ctx.lineTo(
		hex.x + Math.cos( Math.PI / 3 * ( hex.sl + (3 + rotate ) )) * hexagon_radius + Math.cos( Math.PI / 3 * (hex.sl + (5+ rotate) )) * hexagon_radius * hex.p,
		hex.y + Math.sin( Math.PI / 3 * ( hex.sl + (3 + rotate ) )) * hexagon_radius + Math.sin( Math.PI / 3 * (hex.sl + (5+ rotate) )) * hexagon_radius * hex.p
	);
	
	hex.p += hex.speed;
	if(hex.p > 1 || hex.p < 0) {
		hex.p = hex.speed < 0 ? 1 : 0;
		hex.sl += hex.speed < 0 ? -1 : 1;
		hex.sl = hex.sl % 6;
		hex.sl = hex.sl < 0 ? 4 - hex.sl : hex.sl;
	}
    ctx.lineWidth = hexagon_line_width;
    ctx.fillStyle = "rgba(255,255,255,1)";
	ctx.shadowColor = hexagon_color;
	ctx.shadowBlur = 20;
	ctx.strokeStyle = hexagon_color;
    ctx.stroke();

}

function drawGlitch() {var
	w = state.w,h = state.h;

	dynamicCtx.drawImage(staticCtx.canvas, 0, 0);
	staticCtx.clearRect(0, 0, w, h);

	var fullImageData = dynamicCtx.getImageData(0, 0, w, h);
	var glitchOptions = {
		quality: 4,
		amount: 0,
		iterations: 3 };

	glitch(glitchOptions).
	fromImageData(fullImageData).
	toImageData().
	then(function (imageData) {
		dynamicCtx.clearRect(0, 0, w, h);
		dynamicCtx.putImageData(imageData, 0, 0);
	});


	state.glitched = true;var

	minDelay = GLITCH_PAUSE_DURATION[0],maxDelay = GLITCH_PAUSE_DURATION[1];
	var delay = minDelay + Math.random() * (maxDelay - minDelay);
	setTimeout(function (_) {
		drawStatic();
		state.glitched = false;
	}, delay);
}

window.addEventListener('resize', throttle(onResize));

// Kick it off!
WebFont.load({
	active: function active() {
		onResize();
		drawLoop();
		ctxs.forEach(function (_ref) {var canvas = _ref.canvas;
			document.body.appendChild(canvas);
		});
	},
	classes: false,
	google: {
		families: ['Monoton'] } });



// A thin white line gives us a nice glow-y effect.
function stroke(ctx)




{var _ref2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},_ref2$w = _ref2.w1,w1 = _ref2$w === undefined ? 10 : _ref2$w,_ref2$w2 = _ref2.w2,w2 = _ref2$w2 === undefined ? 2 : _ref2$w2,_ref2$c = _ref2.c1,c1 = _ref2$c === undefined ? 'rgba(' + COLOR + ', 0.5)' : _ref2$c,_ref2$c2 = _ref2.c2,c2 = _ref2$c2 === undefined ? 'rgb(' + COLOR + ')' : _ref2$c2;
	ctx.lineWidth = w1;
	ctx.strokeStyle = c1;
	ctx.stroke();
	ctx.lineWidth = w2;
	ctx.strokeStyle = c2;
	ctx.stroke();
}

// Throttles a function to RAF.
function throttle(cb) {
	var queued = false;

	return function () {for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {args[_key] = arguments[_key];}
		if (queued) return;

		queued = true;
		requestAnimationFrame(function (_) {
			queued = false;
			cb.apply(undefined, args);
		});
	};
}
