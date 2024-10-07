import { Element } from '@angular/compiler';
import { Component, ElementRef, HostListener } from '@angular/core';
declare let $: any
declare let TweenMax: any
@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent {
	/**
	 * 			<span (click)="goTo('#services')">SERVICIOS</span>
			<span (click)="goTo('#how-it-works')">CÓMO FUNCIONA</span>
			<span (click)="goTo('#benefits')">BENEFICIOS</span>
			<span (click)="goTo('#interface')">INTERFAZ</span>
			<span (click)="goTo('#verticals')">VERTICALES DE SERVICIO</span>
	 */
	sections: any[] = [
		{
			name: 'INICIO',
			id: '#home'
		},
		{
			name: 'SERVICIOS',
			id: '#services'
		},
		{
			name: 'CÓMO FUNCIONA',
			id: '#how-it-works'
		},
		{
			name: 'BENEFICIOS',
			id: '#benefits'
		},
		{
			name: 'INTERFAZ',
			id: '#interface'
		},
		{
			name: 'VERTICALES DE SERVICIO',
			id: '#verticals'
		}
	]
	images: any[] = [
		{
			name: 'image-ver-1',
			source: 1,
			src: 'assets/cards/front/ven.png',
			hover: 'assets/cards/back/ven.png'
		},
		{
			name: 'image-ver-2',
			source: 1,
			src: 'assets/cards/front/mk.png',
			hover: 'assets/cards/back/mk.png'
		},
		{
			name: 'image-ver-3',
			source: 1,
			src: 'assets/cards/front/docs.png',
			hover: 'assets/cards/back/docs.png'
		},
		{ 
			space: 1,
			name: 'image-ver-3',
			source: 1,
			src: 'assets/cards/front/docs.png',
			hover: 'assets/cards/back/docs.png'
		},
		{
			name: 'image-ver-4',
			source: 1,
			src: 'assets/cards/front/rec.png',
			hover: 'assets/cards/back/rec.png'
		},
		{
			name: 'image-ver-5',
			source: 1,
			src: 'assets/cards/front/atencion.png',
			hover: 'assets/cards/back/atencion.png'
		},
	]
	currentSectionIndex: number = 0
	scrollAnimation: string = 'assets/scroll.json'
	ngOnInit() {
		let stars: any;
		function createStars(i: any) {
			for (var i; i; i--) {
				drawStars();
			}
		}

		function drawStars() {
			var tmpStar = document.createElement('figure')
			tmpStar.className = "star";
			tmpStar.style.top = 100 * Math.random() + '%';
			tmpStar.style.left = 100 * Math.random() + '%';
			(<any>document).getElementById('stars').appendChild(tmpStar);
		}

		function selectStars() {
			stars = document.querySelectorAll(".star");
			console.log(stars)
		}

		function animateStars() {
			Array.prototype.forEach.call(stars, function (el, i) {
				TweenMax.to(el, Math.random() * 0.5 + 0.5, { opacity: Math.random(), onComplete: animateStars });
			});
		}

		createStars(200);
		selectStars();
		animateStars();

		this.goTo(this.sections[0].id)

		//Script settings
		//Calculate settings to fit window scale
		var dotCount = Math.round(window.innerWidth * 0.05); //default 100

		var distanceToDrawLine = Math.round(window.innerWidth * 0.045); //default 90
		distanceToDrawLine = distanceToDrawLine < 60 ? 60 : distanceToDrawLine; //min 60 for wanted effect

		var speedMultiplier = Math.round(window.innerWidth * 0.002); //default 4

		var fps = 360; //frames per second

		var minDir = 0.25; //between 0-1

		var pointRadius = 8;
		var lineWidth = 2;

		//Set color of each channel
		var colorR = 255;
		var colorG = 255;
		var colorB = 255;

		var dynamicLinesAlpha = true;

		var minAlpha = 0; //(min alpha value 0-1)
		var maxAlpha = 1; //(max alpha value 0-1)

		var refreshScreenEveryFrame = true;


		//Script Variables
		var canvas: any = document.getElementById("canvas");
		var ctx: any;

		//Array of all dots
		var dots: any = [];
		/* 
			HOW TO USE THIS ARRAY:
		
			SET ID: dots.push([x,y,dirX,dirY,speed]); - ID is next place in array
		
			GET ID: dots[ID];
			GET X of ID: dots[ID][0]; 
			GET Y of ID: dots[ID][1]; 
			GET dirX of ID: dots[ID][2]; 
			GET dirY of ID: dots[ID][3];
			GET speed of ID: dots[ID][4];
		*/

		//Script
		//Get context
		ctx = canvas.getContext("2d");

		//Prepare canvas
		UpdateCanvas();

		//Generate dots in their starting positions and add every dot to the array
		GenerateDots();

		//Generate movement
		var interval = setInterval(function () {
			RenderFrame();
		}, 1000 / fps);

		//When window is resized
		window.onresize = function () {
			//Refresh canvas
			UpdateCanvas();

			//Re-render frame
			RenderFrame();

			//Move dot to the screen if out of bounds
			FixDotsPosition();
		};

		function UpdateCanvas() {
			//Resize canvas to fit window
			canvas.setAttribute("width", window.innerWidth);
			canvas.setAttribute("height", window.innerHeight);

			//Dots and Lines color
			ctx.fillStyle = 'rgba(' + colorR + ',' + colorG + ',' + colorB + ',' + maxAlpha + ')';
			ctx.strokeStyle = 'rgba(' + colorR + ',' + colorG + ',' + colorB + ',' + maxAlpha + ')';
			ctx.lineWidth = lineWidth;
		}

		//Place dots for their starting positions
		function GenerateDots() {
			for (var i = 0; i < dotCount; i++) {
				//Get random position on screen
				const x = GetRandomInt(pointRadius, (window.innerWidth - pointRadius));

				const y = GetRandomInt(pointRadius, (window.innerHeight - pointRadius));

				//Calculate random direction between 0 and 1
				//X
				let dirX = GetRandomFloat(-1, 1);
				dirX = (dirX < minDir && dirX > -minDir) ? minDir : dirX; //if direction is too close to 0 point is too slow, so clamp direction

				//Y
				let dirY = GetRandomFloat(-1, 1);
				dirY = (dirY < minDir && dirY > -minDir) ? -minDir : dirY;

				//Random speed per dot
				const speed = GetRandomInt(10, 20);

				//Draw dots at random positions
				DrawDot(x, y);

				//Add dot to the array
				dots.push([x, y, dirX, dirY, speed]);
			}
		}

		//Call it every frame and update rendered image
		function RenderFrame() {
			if (refreshScreenEveryFrame) {
				//Clear canvas
				ctx.clearRect(0, 0, canvas.width, canvas.height);
			}

			for (var i = 0; i < dotCount; i++) {
				//Get dot values
				let x = dots[i][0];
				let y = dots[i][1];

				let dirX = dots[i][2];
				let dirY = dots[i][3];

				const speed = (dots[i][4] * speedMultiplier) / fps; //divide by fps so it's frame independent

				//Move dot
				x += (dirX * speed);
				y += (dirY * speed);

				//Update X and Y
				dots[i][0] = x;
				dots[i][1] = y;

				//Draw lines to each close point
				for (var j = 0; j < dotCount; j++) {
					if (j != i) //don't draw line to the same point
					{
						//Calculate distance between points
						let distX = Math.abs(dots[i][0] - dots[j][0]);
						let distY = Math.abs(dots[i][1] - dots[j][1]);
						let dist = (distX + distY) / 2;

						//if applicable to draw the line
						if (dist <= distanceToDrawLine) {
							if (dynamicLinesAlpha) {
								//Set line alpha (longer line = darker line)
								//let alpha = newMin + (val - minVal) * (newMax - newMin) / (maxVal - minVal);
								let alpha = minAlpha + (dist - distanceToDrawLine) * (maxAlpha - minAlpha) / (0 - distanceToDrawLine);
								ctx.strokeStyle = 'rgba(' + colorR + ',' + colorG + ',' + colorB + ',' + alpha + ')';
							}

							//Draw line to the point
							DrawLine(x, y, dots[j][0], dots[j][1]);

							//Redraw dots so they are always on top of lines
							DrawDot(x, y);
							DrawDot(dots[j][0], dots[j][1]);
						}
					}
					else //if same point 
					{
						//Draw dot
						DrawDot(x, y);
					}
				}

				//If near wall change direction
				//X
				if ((window.innerWidth - pointRadius) - x <= 2 || (x - pointRadius) <= 2) {
					dirX *= -1;
					dots[i][2] = dirX;
				}

				//Y
				if ((window.innerHeight - pointRadius) - y <= 2 || (y - pointRadius) <= 2) {
					dirY *= -1;
					dots[i][3] = dirY;
				}
			}
		}

		//Draw dot
		function DrawDot(x: any, y: any) {
			ctx.beginPath();

			//Draw circle
			ctx.arc(x, y, pointRadius, 0, 2 * Math.PI, true);

			//Fill dot
			ctx.fill();
		}

		//Draw line between two dots
		function DrawLine(x: any, y: any, ToX: any, ToY: any) {
			ctx.beginPath();
			ctx.moveTo(x, y);
			ctx.lineTo(ToX, ToY);
			ctx.stroke();
		}

		function FixDotsPosition() {
			//Move dot to the screen if out of bounds
			for (var i = 0; i < dotCount; i++) {
				if (dots[i][0] > (window.innerWidth - pointRadius)) {
					dots[i][0] = GetRandomInt(pointRadius, (window.innerWidth - pointRadius));
				}

				if (dots[i][1] > (window.innerHeight - pointRadius)) {
					dots[i][1] = GetRandomInt(pointRadius, (window.innerHeight - pointRadius));
				}
			}
		}

		//Randomizing functions
		function GetRandomFloat(min: any, max: any) {
			return Math.random() * (max - min) + min;
		}

		function GetRandomInt(min: any, max: any) {
			min = Math.ceil(min);
			max = Math.floor(max);
			return Math.floor(Math.random() * (max - min + 1)) + min;
		}

		//Convert hex color to rgb
		function hexToRgb(hex: any) {
			let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
			return result ?
				{
					r: parseInt(result[1], 16),
					g: parseInt(result[2], 16),
					b: parseInt(result[3], 16)
				} : null;
		}

		this.hideImagesInterface()



		window.addEventListener('scroll', () => {
			console.log('scrolling')
			// if is in #how-it-works section play video
			console.log(window.scrollY, ($('#how-it-works').offset().top - 100))
			if (window.scrollY >= ($('#how-it-works').offset().top - 100) && window.scrollY < $('#benefits').offset().top) {
				this.playHowItWorksVideo()
			}
			// if is in interface section play video
			if (window.scrollY >= $('#interface').offset().top && window.scrollY < $('#verticals').offset().top) {
				this.showImagesInterface()
			}
		})

	}

	goTo(id: string) {
		$('#menu').removeClass('active')
		$('html, body').animate({
			scrollTop: $(id).offset().top
		}, 100);

		if (id == '#how-it-works') {
			//#video-esquema restart
			this.playHowItWorksVideo()
		}
	}

	showImagesInterface() {
		// Set opacity to 1 with a transition
		setTimeout(() => {
			$('#im-1').css({ opacity: 1, transition: 'opacity 0.5s' });

			setTimeout(() => {
				$('#im-2').css({ opacity: 1, transition: 'opacity 0.5s' });

				setTimeout(() => {
					$('#im-3').css({ opacity: 1, transition: 'opacity 0.5s' });
				}, 500);
			}, 500);
		}, 500);
	}

	onHoverImage(image: string) {
		console.log(image)
		let im: any = this.images.findIndex((im: any) => im.name == image)
		console.log(im)
		if (im != -1) {
			console.log($('#' + image))
			$('#' + image).addClass('hover')
			setTimeout(() => {
				if (this.images[im].source == 1) {
					this.images[im].source = 2
				} else {
					this.images[im].source = 1
				}
				$('#' + image).removeClass('hover')
			}, 500)
		}
	}

	hideImagesInterface() {
		$('#im-1').css({ opacity: 0, transition: 'opacity 0.5s' });
		$('#im-2').css({ opacity: 0, transition: 'opacity 0.5s' });
		$('#im-3').css({ opacity: 0, transition: 'opacity 0.5s' });
	}

	playHowItWorksVideo() {
		const videoElement = <HTMLVideoElement>document.getElementById('video-esquema');
		if (videoElement.ended) {
			console.log('Video has already ended, not replaying.');
			return;
		}
		videoElement.play().catch(error => {
			console.error('Error attempting to play video:', error);
		});
	}

	stopHowItWorksVideo() {
		(<any>document).getElementById('video-esquema').pause();
	}

	toggleMenu() {
		$('#menu').toggleClass('active')
	}

	openLink(link: string) {
		window.open(link, '_blank')
	}
}
