/*
 * Roulette wheel renderer
 * Copyright (c) 2010 Jeff D. Conrad
 */

function Rgb(r, g, b) {
	this.r = r;
	this.g = g;
	this.b = b;
}

var palette = {
	white: new Rgb(255, 255, 255),
	red: new Rgb(200, 0, 0),
	green: new Rgb(0, 150, 0),
	blue: new Rgb(0, 0, 255),
	black: new Rgb(0, 0, 0),
	
	getRgbForC: function(c) {
		switch (c) {
			case 'r':
				return this.red;
				break;
			case 'g':
				return this.green;
				break;
			case 'b':
				return this.black;
				break;
		}
	}
};

function Segment(c, number, rgb) {
	this.c = c;
	this.number = number;
	this.rgb = rgb;
}

var util = {
	reverse: function(a1) {
		var a2 = new Array(a1.length);
		for (var i=0; i < a1.length; i++) {
			a2[ a1.length - i - 1 ] = a1[i];
		}
		return a2;
	}
}

// 38 segments
var americanWheel = util.reverse([
	'g00', 'r1', 'b13', 'r36', 'b24',
	'r3', 'b15', 'r34', 'b22', 'r5',
	'b17', 'r32', 'b20', 'r7', 'b11',
	'r30', 'b26', 'r9', 'b28', 'g0',
	'b2', 'r14', 'b35', 'r23', 'b4',
	'r16', 'b33', 'r21', 'b6', 'r18',
	'b31', 'r19', 'b8', 'r12', 'b29',
	'r25', 'b10', 'r27'
]);

var roulette = {
	aps: 360.0/38.0,
	sa: 0, // start angle
	seg: null,
	wheel: null,
	rouletteWheelPaper: null,
	ballWheelPaper: null,

	init: function(rouletteWheelPaper, ballWheelPaper) {
		this.rouletteWheelPaper = rouletteWheelPaper;
		this.ballWheelPaper = ballWheelPaper;
		this.sa = this.aps / 2.0;
	
		// pick wheel type
		this.wheel = americanWheel;
	
		// create segments
		this.seg = new Array(this.wheel.length);
		for (var i=0; i<this.wheel.length; i++) {
			var w = this.wheel[i];
			var c = w.substring(0, 1);
			var n = w.substring(1);
			var rgb = palette.getRgbForC(c);
			this.seg[i] = new Segment(c, n, rgb);
		}
		
		this.renderRouletteWheel();
	},	
	renderRouletteWheel: function() {
		// roulette wheel
		var paper = this.rouletteWheelPaper;
		paper.clear();
		
		// outer path
		var d0 = 300;
		var m0 = d0 * 0.01;
		var x0 = d0 / 2;
		var y0 = d0 / 2;
		var r0 = d0 / 2 - 2 * m0;
		var outerWheel0 = paper.circle(x0, y0, r0);
		outerWheel0.attr("fill", "#c0c0c0");
		outerWheel0.attr("stroke", "#666666");
		outerWheel0.attr("stroke-width", "1");

		var d = d0;
		var m = d0 * 0.075;
		var x = d / 2;
		var y = d / 2;
		var r = d / 2 - m;
		
		// render segments
		for (var segIndex = 0; segIndex < roulette.seg.length; segIndex++) {
			var seg = this.seg[segIndex];
		
		 	var a1 = segIndex * roulette.aps + roulette.sa;
		 	var a2 = (segIndex + 1) * roulette.aps + roulette.sa;
			
			var flag = (a2 - a1) > 180;
            var clr = (a2 - a1) / 360;
            
            a1 = a1 * Math.PI / 180;
            a2 = a2 * Math.PI / 180;
            
            var rgb = seg.rgb;
			
            var attr = {
				path: [["M", x, y],
				       ["l", r * Math.cos(a1), r * Math.sin(a1)],
				       ["A", r, r, 0, +flag, 1, x + r * Math.cos(a2), y + r * Math.sin(a2)],
				       ["z"]],
				fill: "rgb(" + rgb.r + "," + rgb.g + "," + rgb.b + ")",
				stroke: "#fff"
			};
			paper.path().attr(attr);
		}

		// render wheel numbers
		for (var segIndex = 0; segIndex < roulette.seg.length; segIndex++) {
			var seg = this.seg[segIndex];
		
		 	var a1 = segIndex * roulette.aps + roulette.sa;
		 	var a2 = (segIndex + 1) * roulette.aps + roulette.sa;
			
			var flag = (a2 - a1) > 180;
            var clr = (a2 - a1) / 360;
            
            a1 = a1 * Math.PI / 180;
            a2 = a2 * Math.PI / 180;
            
            // text goes at midpoint
        	var number = seg.number;
			var a3 = (a1 + a2) / 2;
			
			var tr = r - 10;
			var tx = x + tr * Math.cos(a3);
			var ty = y + tr * Math.sin(a3);
			var trot = a3 * 180 / Math.PI - 90;
			
			paper.text(tx, ty, number).attr({
				font: '100 7.5px "Helvetica Neue", Helvetica, "Arial Unicode MS", Arial, sans-serif',
				fill: "#fff",
				rotation: trot
				});
		}
		
		var d2 = d0;
		var m2 = d0 * 0.1375;
		var r2 = d2 / 2 - m2;
		var innerWheel2 = paper.circle(x, y, r2);
		innerWheel2.attr("stroke", "#ffffff");
		innerWheel2.attr("stroke-width", "1");
		
		var d4 = d0;
		var m4 = d0 * 0.2;
		var r4 = d4 / 2 - m4;
		var pocketWheel4 = paper.circle(x, y, r4);
		pocketWheel4.attr("fill", "#000000");
		pocketWheel4.attr("stroke", "#ffffff");
		pocketWheel4.attr("stroke-width", "1");
		
		var wra = 45;
		var wr = d0 * 0.1;
		for (var i=0; i < 4; i++) {
			var aw = i / 4 * 360 + wra + roulette.sa;
			aw = aw * Math.PI / 180;
            var attr = {
				path: [["M", x, y],
					   ["l", wr * Math.cos(aw), wr * Math.sin(aw)]
				],
				stroke: "#ffffff",
				"stroke-width": "2"
			};
			paper.path().attr(attr);
		}

		var d5 = d0;
		var m5 = d0 * 0.45;
		var r5 = d5 / 2 - m5;
		var pocketWheel5 = paper.circle(x, y, r5);
		pocketWheel5.attr("stroke", "#ffffff");
		pocketWheel5.attr("stroke-width", "1");
		
		var d7 = d0;
		var m7 = d0 * 0.475;
		var r7 = d7 / 2 - m7;
		var handleWheel2 = paper.circle(x, y, r7);
		handleWheel2.attr("fill", "#000000");
		handleWheel2.attr("stroke", "#ffffff");
		handleWheel2.attr("stroke-width", "2");
		
		ball.renderRouletteWheelBall();
	},
	/**
	 * Determines the center of the segment containing the provided angle.
	 */
	roundAngle: function (at) {
		for (var segIndex = 0; segIndex < roulette.seg.length; segIndex++) {
			var a1 = segIndex * roulette.aps + roulette.sa;
			var a2 = (segIndex + 1) * roulette.aps + roulette.sa;
			while (a1 > 360.0) {
				a1 -= 360.0;
			}
			while (a2 > 360.0) {
				a2 -= 360.0;
			}
			while (at > 360.0) {
				at -= 360.0;
			}
			if (a1 - 180.0 > 0 && a2 - 180.0 < 0) {
				a1 += 360.0;
				a2 += 360.0;
				at += 360.0;
			}
			if (at >= a1 && at <= a2) {
				return (a1 + a2) / 2.0;
			}
		}
		return at;
	},
	renderBallWheel: function() {
		// roulette wheel
		var paper = this.ballWheelPaper;
		paper.clear();
		
		if (!ball.render) {
			return;
		}
		
		var minAngle = this.roundAngle(ball.sa);
		
		// outer path
		var d0 = 900;
		var m0 = d0 * 0.01;
		var x0 = 50;
		var y0 = -150;
		var r0 = d0 / 2 - 2 * m0;
		var outerWheel0 = paper.circle(x0, y0, r0);
		outerWheel0.attr("fill", "#c0c0c0");
		outerWheel0.attr("stroke", "#666666");
		outerWheel0.attr("stroke-width", "1");

		var d = d0;
		var m = d0 * 0.075;
		var x = x0;
		var y = y0;
		var r = d / 2 - m;
				
		// render segments
		for (var segIndex = 0; segIndex < roulette.seg.length; segIndex++) {
			var seg = this.seg[segIndex];
		
		 	var a1 = segIndex * roulette.aps + roulette.sa - minAngle + 90;
		 	var a2 = (segIndex + 1) * roulette.aps + roulette.sa - minAngle + 90;
			
			var flag = (a2 - a1) > 180;
            var clr = (a2 - a1) / 360;
            
            a1 = a1 * Math.PI / 180;
            a2 = a2 * Math.PI / 180;
            
            var rgb = seg.rgb;
			
            var attr = {
				path: [["M", x, y],
				       ["l", r * Math.cos(a1), r * Math.sin(a1)],
				       ["A", r, r, 0, +flag, 1, x + r * Math.cos(a2), y + r * Math.sin(a2)],
				       ["z"]],
				fill: "rgb(" + rgb.r + "," + rgb.g + "," + rgb.b + ")",
				stroke: "#fff"
			};
			paper.path().attr(attr);
		}

		// render wheel numbers
		for (var segIndex = 0; segIndex < roulette.seg.length; segIndex++) {
			var seg = this.seg[segIndex];
		
		 	var a1 = segIndex * roulette.aps + roulette.sa - minAngle + 90;
		 	var a2 = (segIndex + 1) * roulette.aps + roulette.sa - minAngle + 90;
			
			var flag = (a2 - a1) > 180;
            var clr = (a2 - a1) / 360;
            
            a1 = a1 * Math.PI / 180;
            a2 = a2 * Math.PI / 180;
            
            // text goes at midpoint
        	var number = seg.number;
			var a3 = (a1 + a2) / 2;
			
			var tr = r - 30;
			var tx = x + tr * Math.cos(a3);
			var ty = y + tr * Math.sin(a3);
			var trot = a3 * 180 / Math.PI - 90;
			
			paper.text(tx, ty, number).attr({
				font: '100 22.5px "Helvetica Neue", Helvetica, "Arial Unicode MS", Arial, sans-serif',
				fill: "#fff",
				rotation: trot
				});
		}
		
		var d2 = d0;
		var m2 = d0 * 0.1375;
		var r2 = d2 / 2 - m2;
		var innerWheel2 = paper.circle(x, y, r2);
		innerWheel2.attr("stroke", "#ffffff");
		innerWheel2.attr("stroke-width", "1");
		
		var d4 = d0;
		var m4 = d0 * 0.2;
		var r4 = d4 / 2 - m4;
		var pocketWheel4 = paper.circle(x, y, r4);
		pocketWheel4.attr("fill", "#000000");
		pocketWheel4.attr("stroke", "#ffffff");
		pocketWheel4.attr("stroke-width", "1");
		
		var wra = 45;
		var wr = d0 * 0.1;
		for (var i=0; i < 4; i++) {
			var aw = i / 4 * 360 + wra + roulette.sa - minAngle + 90;
			aw = aw * Math.PI / 180;
            var attr = {
				path: [["M", x, y],
					   ["l", wr * Math.cos(aw), wr * Math.sin(aw)]
				],
				stroke: "#ffffff",
				"stroke-width": "2"
			};
			paper.path().attr(attr);
		}

		var d5 = d0;
		var m5 = d0 * 0.45;
		var r5 = d5 / 2 - m5;
		var pocketWheel5 = paper.circle(x, y, r5);
		pocketWheel5.attr("stroke", "#ffffff");
		pocketWheel5.attr("stroke-width", "1");
		
		var d7 = d0;
		var m7 = d0 * 0.475;
		var r7 = d7 / 2 - m7;
		var handleWheel2 = paper.circle(x, y, r7);
		handleWheel2.attr("fill", "#000000");
		handleWheel2.attr("stroke", "#ffffff");
		handleWheel2.attr("stroke-width", "2");
		
		if (ball.stopped) {
			ball.renderBallWheelBall(minAngle);
		}
	}
};

var ball = {
	rouletteWheelPaper: null,
	ballWheelPaper: null,
	sa: 0,
	r: 0,
	stopped: true,
	roulette: null,
	render: false,
	
	init: function(rouletteWheelPaper, ballWheelPaper, roulette) {
		this.rouletteWheelPaper = rouletteWheelPaper;
		this.ballWheelPaper = ballWheelPaper;
		this.roulette = roulette;
		this.reset();
	},
	reset: function() {
		this.sa = Math.random()*360.0;
		this.r = 2.0;
		this.stopped = false;
		this.render = false;
	},
	getR: function(jumping) {
		var r = Math.max(Math.min(this.r, 1.0), 0.0);		
		return r;
	},
	/**
	 * Random jumping of ball as it hits the barriers close to the middle.
	 */
	jumpBall: function() {
		var r = this.getR();
		if (r == 0.0) {
			this.stop();
		} else if (r > 0.0 && r <= 0.28) {
			var deltaR = Math.random() * 0.10 - 0.05;
			this.r += deltaR;
			r += deltaR;
			
			var deltaA = Math.random() * 20 - 10;
			this.sa += deltaA;
		}
	},
	renderRouletteWheelBall: function() {
		if (!this.render) {
			return;
		}
		
		// roulette wheel
		var paper = this.rouletteWheelPaper;
		
		var d = 300;
		var x = d / 2;
		var y = d / 2;
		
		// margin
		var r1 = 0.080;
		var r2 = 0.36;
		
		var r = this.getR();
		var m = d * (r * (r1 - r2) + r2);
		var tr = x - m / 2.0;
		
		// radius of ball
		var trm = d * 0.015;
		
		var a = (this.sa) * Math.PI / 180;
		var tx = x + tr * Math.cos(a);
		var ty = y + tr * Math.sin(a);
		
		var ball0 = paper.circle(tx, ty, trm);
		ball0.attr("fill", "#ffffff");
		ball0.attr("stroke", "#666666");
		ball0.attr("stroke-width", "1");
	},
	renderBallWheelBall: function(minAngle) {
		if (!this.render) {
			return;
		}
		
		// roulette wheel
		var paper = this.ballWheelPaper;
		
		var d = 900;
		var x = d / 2.0;
		var y = -150;
		
		// margin
		var r1 = 0.080;
		var r2 = 0.36;
		
		var r = this.getR();
		var m = d * (r * (r1 - r2) + r2);
		var tr = x - m / 2.0;
		
		// radius of ball
		var trm = d * 0.015;
		var tx = 50;
		var ty = y + tr;
		
		var ball0 = paper.circle(tx, ty, trm);
		ball0.attr("fill", "#ffffff");
		ball0.attr("stroke", "#666666");
		ball0.attr("stroke-width", "1");
	},
	stop: function() {
		this.stopped = true;
		this.sa = this.roulette.roundAngle(this.sa);
	}
}

var rouletteSpinner = {
	intervalMs: 10,
	intervalAngle: 6,
	ballAngle: 10,
	ballRadius: 0.025, // ratio of ball position to wheel, > 1. represents sufficient velocity
	rouletteWheelPaper: null,
	ballWheelPaper: null,
	lastId: null,
	paused: false,
	
	init: function() {
		var rouletteWheelPaper = Raphael("rouletteWheel", 300, 300);
		this.rouletteWheelPaper = rouletteWheelPaper;
		
		var ballWheelPaper = Raphael("ballWheel", 100, 300);
		this.ballWheelPaper = ballWheelPaper;
		
		roulette.init(rouletteWheelPaper, ballWheelPaper);
		ball.init(rouletteWheelPaper, ballWheelPaper, roulette);
		
		this.next();
	},
	
	doRollBall: function() {
		ball.render = true;
	},
	
	doTakeBall: function() {
		ball.reset();
		window.setTimeout("ball.reset();", this.intervalMs);
	},
	
	next: function() {
		window.setTimeout("rouletteSpinner.spin();", this.intervalMs);
	},
	
	doTogglePause: function() {
		this.paused = !this.paused;
	},
	
	spin: function() {
		if (!this.paused) {
			this.spinWheel();
			this.spinBall();
		}
		this.render();
		this.next();
	},
	
	render: function() {
		roulette.renderRouletteWheel();
		roulette.renderBallWheel();
	},
	
	spinWheel: function() {
		roulette.sa += this.intervalAngle;
		while (roulette.sa < 0.0) {
			roulette.sa += 360.0;
		}
		while (roulette.sa >= 360.0) {
			roulette.sa -= 360.0;
		}
	},
	
	spinBall: function() {
		if (ball.render) {
			if (!ball.stopped) {
				ball.sa -= this.ballAngle;
				ball.r -= this.ballRadius;
			}
			else {
				ball.sa += this.intervalAngle
			}
			
			while (ball.sa < 0.0) {
				ball.sa += 360.0;
			}
			while (ball.sa >= 360.0) {
				ball.sa -= 360.0;
			}

			if (!ball.stopped) {
				ball.jumpBall();
			}
			
			while (ball.sa < 0.0) {
				ball.sa += 360.0;
			}
			while (ball.sa >= 360.0) {
				ball.sa -= 360.0;
			}
		}
	}
};

window.setTimeout("rouletteSpinner.init();",1000);
