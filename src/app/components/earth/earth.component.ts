import {
	Component,
	ElementRef,
	OnInit,
	AfterViewInit,
	HostListener,
	ViewChild
} from '@angular/core';
import {
	Vector2,
	Math as math,
	Vector3,
	Quaternion,
	WebGLRenderer,
	WebGLRenderTarget,
	Scene,
	Group,
	PerspectiveCamera,
	OrthographicCamera,
	Mesh,
	RawShaderMaterial,
	TextureLoader,
	Color,
	IcosahedronGeometry,
	Points,
	Float32BufferAttribute,
	PointsMaterial,
	BufferGeometry,
	BufferAttribute,
	Fog,
	CurvePath,
	CubicBezierCurve3,
	Raycaster
} from "../../../assets/scripts/three.module"

@Component({
	selector: 'app-earth',
	templateUrl: './earth.component.html',
	styleUrls: ['./earth.component.scss']
})
export class EarthComponent implements AfterViewInit {

	ngAfterViewInit() {

		const d = 220, R = 160, roAtmDeg = -52, T_earth = '../../assets/map.png',
			obliquity = 23 / 180 * 3.14, roV1 = .00025, roV2 = 0.0005, posZ = 1700,
			canvasId = '#earth', color = '#0084ff', fogC = '#722779';
		Object.assign(Math, math);
		var positions: any = [], particles: any, particle: any, count: any = 0, dpr: any, lastW: any,
			W = 1, H = 1, aspect = 1,
			roAtm: any = -(<any>Math).degToRad(roAtmDeg);

		var mouseX = 0, mouseY = 0, x0, y0;
		var vec2: any = (x: any, y: any) => new Vector2(x, y),
			vec3: any = (x: any, y: any, z: any) => new Vector3(x, y, z),
			quat: any = new Quaternion(),
			lookAt: any = vec3(), PI = Math.PI, wX = vec3(1, 0, 0), wY = vec3(0, 1, 0),
			canvas: any = document.querySelector(canvasId), container = document.querySelector('.animation');

		var renderer: any = new WebGLRenderer({ alpha: true, antialias: true, canvas: canvas });//
		var rTargets: any = [new WebGLRenderTarget(W, H, { depthBuffer: false, stencilBuffer: false })];
		rTargets[1] = rTargets[0].clone();

		var scene: any = new Scene(), scene2 = new Scene(), planet: any = new Group(),
			camera: any = new PerspectiveCamera(18, aspect, 1, 10000);
		// 	pCamera = new OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
		camera.position.z = posZ;
		camera.updateMatrixWorld();

		planet.rotateY(PI / 5).rotateZ(obliquity)//.updateMatrixWorld();
		var pAxis = vec3(0, 1, 0).applyQuaternion(planet.quaternion);

		scene2.background = rTargets[0].texture;

		var bloom = new Mesh(0, new RawShaderMaterial({
			uniforms: {
				map: { value: rTargets[0].texture }
			},
			vertexShader: `
			precision mediump float;
			attribute vec3 position;
			attribute vec2 uv;
			varying vec2 vUv;
			void main(){
				gl_Position =vec4(position, 1.);
				vUv=uv;
			}
		`,
			fragmentShader: `
			precision mediump float;
			uniform sampler2D map;
			varying vec2 vUv;
			void main(){
				gl_FragColor = texture2D(map, vUv);
				if (gl_FragColor.a<0.0039) discard;
			}
		`
		}))
		var vVPort = window.visualViewport || { scale: 1 }, rect0 = {};
		function resize() {
			let rect = canvas.getBoundingClientRect();
			if (W != rect.width || H != rect.height || dpr != (dpr = devicePixelRatio * vVPort.scale)) {
				W = rect.width; H = rect.height;
				let w = W * dpr, h = H * dpr, j = 0;

				renderer.setDrawingBufferSize(W, H, dpr);
				rTargets[0].setSize(w, h);
				rTargets[1].setSize(w, h);

				camera.aspect = W / H;
				camera.updateProjectionMatrix();
				let l = camera.position.length(),
					r = vec3(0, l * Math.tan(Math.asin(R / l)), 0).project(camera).y * H;
				(<any>container).style.opacity = 1;
				camera.zoom *= W / 1.3 / r;
				camera.updateProjectionMatrix();
			}
			let { clientWidth: w0, clientHeight: h0 } = document.documentElement
			if (rect.left < 0 || rect.top < 0 || rect.right > w0 || rect.top > h0) {
				//render.setScissor
			}
		};

		var Emap = (<any>new TextureLoader()).load(T_earth, function (t: any) {
			var testCanvas: any = document.createElement('canvas'), tCtx: any = testCanvas.getContext('2d'), Ew: any, Eh: any;
			var img = t.image;
			Ew = testCanvas.width = img.width; Eh = testCanvas.height = img.height;
			tCtx.scale(1, -1);
			tCtx.drawImage(img, 0, -Eh);
			var idata = tCtx.getImageData(0, 0, Ew, Eh);
			(<any>Egeometry).vertices.forEach((p: any, i: any) => {
				var u = .5 - Math.atan2(-p.z, -p.x) / 2 / PI,
					v = .5 + Math.asin(p.y / R) / PI,
					color = idata.data[(Math.floor(u % 1 * Ew) + Math.floor(v * Eh) * Ew) * 4];
				if (!color) points0.push(p);
				//if (!(i%1000)) console.log(i);
			})
		});

		var matScale = {
			set value(val) { (<any>this).val = val * camera.zoom },
			get value() { return (<any>this).val }
		}
		var Ematerial = new PointsMaterial({
			map: Emap,
			transparent: true,
			alphaTest: 0.004,
			size: R * .06,
			color: new (<any>Color)(color).multiplyScalar(.8),
			blending: 2,
			depthTest: false,
			onBeforeCompile: (sh: any) => {
				console.log(sh)
				sh.uniforms.scale = matScale;
				sh.fragmentShader = sh.fragmentShader.replace('#include <map_particle_fragment>', `
		    vec2 cxy = 2.0 * gl_PointCoord - 1.0;
		    float r = length(cxy), delta = fwidth(r)*.5;
		    diffuseColor.a *= 1.-smoothstep(1. - delta, 1.+delta, r);
			  diffuseColor.a *= smoothstep( ${(R * .3).toFixed(1)},  ${(-R).toFixed(1)}, fogDepth-${(posZ).toFixed(1)} );
			`);
				sh.vertexShader = `
				uniform sampler2D map;
				uniform mat3 uvTransform;
			`+ sh.vertexShader.replace('}', `
				vec2 vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
				if (texture2D( map, vUv ).r >.9) fogDepth=5000.;
			}`)

			}
		});//, opacity: 0
		(<any>Ematerial).extensions = { derivatives: 1 };
		var Egeometry = new IcosahedronGeometry(R, 6);
		var Earth = new (<any>Points)(new (<any>BufferGeometry)().setFromPoints((<any>Egeometry).vertices), Ematerial);
		(<any>Egeometry).uv = [];
		(<any>Egeometry).vertices.forEach((v: any) => {
			(<any>Egeometry).uv.push(.5 - Math.atan2(-v.z, -v.x) / 2 / PI);
			(<any>Egeometry).uv.push(.5 + Math.asin(v.y / R) / PI)
		})
		Earth.geometry.addAttribute('uv', new Float32BufferAttribute((<any>Egeometry).uv, 2));

		var Pmaterial = new PointsMaterial({
			size: d * 1.2,
			transparent: true,
			alphaTest: 0.004,
			depthTest: false,
			blending: 5,
			//opacity: .85,
			color: color,//.multiplyScalar(2),
			onBeforeCompile: function (sh: any) {
				sh.uniforms.scale = matScale;
				sh.vertexShader = '\
attribute float flash;\n\
varying float vSize;\n\
'			+ sh.vertexShader.replace(/}\s*$/, '\
  vSize=max(flash, 0.0);\n\
  gl_PointSize*=vSize;\n\
}			');
				sh.fragmentShader = '\
varying float vSize;\n\
'			+ sh.fragmentShader.replace("#include <map_particle_fragment>", `
	vec2 cxy = 2.0 * gl_PointCoord - 1.0;
  float r = length(cxy), delta = fwidth(r), size=1.-vSize;
	size=1.-size*size;
	#ifdef T_POINT
	 diffuseColor.a =1.0 - smoothstep(1. - delta, 1. + delta, r);
	 //diffuseColor.a = (1.+delta -r)/delta;
	#else
	 //float r=sqrt(r2);
	 diffuseColor.rgb =mix(vec3(1.1), diffuse, min(r*2.3, 1.));
	 diffuseColor.a=cos(min(r*r,1.)*PI)*.5+.5;
	#endif
 diffuseColor.a *= smoothstep( ${(R * .2).toFixed(1)},  ${(-R * .4).toFixed(1)}, fogDepth-${(posZ).toFixed(1)} )*size;
      `);
				// console.log(sh, sh.vertexShader, sh.fragmentShader);
			}
		});//, opacity: 0  ///  
		(<any>Pmaterial).extensions = { derivatives: 1 };

		var pCount = 50, points: any = []
		var flashes = new Float32Array(pCount);
		var points32 = new Float32Array(pCount * 3);
		var Pgeometry: any = new BufferGeometry();
		Pgeometry.addAttribute('position', new BufferAttribute(points32, 3));
		Pgeometry.addAttribute('flash', new BufferAttribute(flashes, 1));

		var Flashes = new Points(Pgeometry, Pmaterial);
		planet.add(Flashes, Earth)
		scene.add(planet);
		planet.position.z = -R

		scene.fog = new Fog(color, posZ - R / 2, posZ + R);
		var t0: any = performance.now(), dMax = 1000 / 15, dMin = 1000 / 45, dT = 1000 / 61, af, Pactive = [],
			axis = vec3(0, 1, 0).applyAxisAngle(vec3(0, 0, 1), obliquity), points0: any = [],
			pUp = 0, pDn = [], flTimer: any = [], vecTest = new Vector3(), transStart, pLast, transactions: any = [],
			Tmaterial = (<any>Pmaterial).clone();
		Tmaterial.__proto__ = Pmaterial;
		Tmaterial.defines = { T_POINT: 1 };
		Tmaterial.blending = 2;
		Tmaterial.size = .047 * d; Tmaterial.opacity = .75;
		Tmaterial.color.multiplyScalar(.8);

		function addTransaction(a: any, b: any, i: any) {
			//console.log (pUp, a, b); //return
			var an = a.angleTo(b), l = R * 1.13 + an * 5.5, center = a.clone().add(b).setLength(l),
				ab = b.clone().sub(a).multiplyScalar(.25), cn = center.clone().setLength((l - R) * .7), n;//=an*160+16;
			var curve: any = new CurvePath();
			curve.add(new CubicBezierCurve3(a, a.clone().add(cn), center.clone().sub(ab), center));
			curve.add(new CubicBezierCurve3(center, center.clone().add(ab), b.clone().add(cn), b));
			n = curve.getLength() / R * 200;

			var tFlashes = new Float32Array(n + 1);
			//tFlashes.forEach(function(f,i){if (i) tFlashes[i]=tFlashes[i-1]+1/n});
			var tGeometry = new (<any>BufferGeometry)().setFromPoints(curve.getSpacedPoints(n));
			tGeometry.addAttribute('flash', new BufferAttribute(tFlashes, 1));
			transactions[i] = new Points(tGeometry, Tmaterial);
			transactions[i].timer = 0;
			transactions[i].n = n;
			planet.add(transactions[i]);
		}

		function addPoint(i0?: any, i?: any, c: any = 0): any {
			if ((c += 1) > 1500) return console.log(c);
			if (i0) delete flTimer[i0];
			if (!i) {
				if (!points[0]) i = 0
				else points.every(function (p: any, j: any) { return points[i = j + 1 + ''] });
				if (i >= pCount && (!i0 || points[i0].isNew)) return false
			}
			var fi = Math.random() * 1.8, dTest;
			var point = points0[Math.floor(Math.random() * points0.length)].clone();
			var dLast, pointW = Earth.localToWorld(point.clone()).applyAxisAngle(axis, roV1 * 150);
			if (pointW.angleTo(camera.position) + pointW.x / R > 1.9) return addPoint(i0, i, c);
			if (i0 && points[i0].distanceTo(point) > R * 1.84) return addPoint(i0, i, c);
			if (points.some((v: any, i: any) => (v.up > -1 || flashes[i] > .05) && v.distanceTo(point) < R * (v.pInd == i0 ? .18 : .4))) return addPoint(i0, i, c);
			point.pInd = i;
			points[i] = point;
			point.isNew = !i0;
			point.up = point.new = +!i0;
			points32[i * 3] = point.x;
			points32[i * 3 + 1] = point.y;
			points32[i * 3 + 2] = point.z;
			Pgeometry.attributes.position.needsUpdate = true;
			if (i0) addTransaction(points[i0], point, i)
			if (i0 && pUp < 6 && Math.random() > .65) {  //fork
				flTimer[i0] = Math.random() < .5 ? Math.random() * 200 + 230 : Math.random() * 100;
				points[i0].up = 1
			}
			return true
		}

		// interactions
		var dx = 0, dy = 0, ready: any, pointers: any = {},
			raycaster = new Raycaster();

		(<any>container).addEventListener('pointerdown', (e: any) => {
			pointers[e.pointerId] = {
				x0: e.clientX,
				y0: e.clientY
			}
			e.preventDefault();
		});
		window.addEventListener('pointermove', e => {
			if (!ready || !pointers[e.pointerId]) return;
			e.preventDefault();
			let p = pointers[e.pointerId];
			dx = (<any>Math).lerp(dx, p.x0 - (p.x0 = e.clientX), .3);
			dy = (<any>Math).lerp(dy, p.y0 - (p.y0 = e.clientY), .3);
			//console.log(e.type, active.identifier, dx, x0)
			ready = 0;
			pointers.touch = (e.pointerType == 'touch');
		});
		window.addEventListener('pointercancel', e => delete pointers[e.pointerId]);
		window.addEventListener('pointerup', e => delete pointers[e.pointerId]);
		window.addEventListener('pointerdown', e => { delete pointers.touch; })

		var animComplite, animA = [], animT;
		requestAnimationFrame(function animate() {
			requestAnimationFrame(animate);
			resize();
			var t = performance.now(), dt = t - t0;
			if (!Emap.image) return;// || dt<dMin
			dt = Math.min(dt, dMax);
			t0 = t;
			planet.position.z -= planet.position.z * .08;
			//pAxis.applyAxisAngle(wY, roV2*dt);
			planet.rotateOnWorldAxis(pAxis, roV1 * dt);

			var ax = vec3(0, 1, 0).applyQuaternion(planet.quaternion);
			dx *= 1 - .0015 * dt;
			dy *= 1 - .0015 * dt;
			if (pointers.touch) (<any>document).scrollingElement.scrollTop += Math.round(dy * .3);
			planet.rotateOnWorldAxis(wX, -dy * .005);
			planet.rotateOnWorldAxis(wY, -dx * .005);
			var aCorr = Math.sqrt(1 - ax.angleTo(pAxis) / 3.15);
			planet.applyQuaternion(quat.clone().setFromUnitVectors(ax, pAxis).slerp(quat, 1 - .0008 * dt * aCorr));

			var count = 0, newTr, newP, pAdded = 0, maxDn = Math.random() * .6;
			pUp = 0;
			if (!points.length) addPoint();
			points.forEach(function (p: any, i: any) {
				if ((flTimer[i] -= dt) < 0) pAdded = 1, addPoint(i + ''), p.up = 1
				count++;
				if (p.up > 0) {
					if ((flashes[i] += (1.005 - flashes[i]) * .005 * dt) > .95) {
						p.up = -1;
					}
					if (!transactions[i] && ++pUp && flashes[i] > .15) newTr = i + '';
				}
				if (p.up < 0) {
					if ((flashes[i] -= (1.11 - flashes[i]) * flashes[i] * .006 * dt) < 0.005) {
						delete points[i];
					}
					if (flashes[i] < maxDn) newP = 1;
				}
				if (transactions[i]) {
					var arr = transactions[i].geometry.attributes.flash.array, n = arr.length,
						t = transactions[i].timer += dt / Math.pow(transactions[i].n, .3) * .008;//, tt=t*t;
					arr.forEach(function (v: any, j: any) {
						var df = j / n - t, dj = n - j;
						arr[j] = (df < 0) ? 1 + df : +(df < .2) * (1 - df * df * 8);

						if (!(dj % 6) && dj < 31) arr[j] *= Math.pow(1.14, 6 - dj / 6)
					});
					if (t > 1 && arr[n - 1] < -0.4) {
						transactions[i].geometry.dispose();
						planet.remove(transactions[i]);
						delete transactions[i];
						if (!p.up) delete points[i]
					} else {
						if (t < 1 || p.up > 0) pUp++;
						if (t < 1.4 && t > .8) newTr = i + '';
						transactions[i].geometry.attributes.flash.needsUpdate = true
					}
					if (!p.up) flashes[i] = t > 1 ? .3 + arr[n - 1] * .7 : (<any>Math).smoothstep(t, .6, .95);
				}
			})
			if (points.length && !points[points.length - 1]) points.length--;
			if (newTr) {
				var p = points[newTr];
				if (!p.startTr && (p.new || pUp < 7 && Math.random() > .4) && !pAdded++) {
					p.startTr = addPoint(newTr);
					if (p.startTr && transactions[newTr] && transactions[newTr].timer > 1.2) p.up = 1;
				}
			}
			if (newP && pUp < 2 && Math.random() < .2 && !pAdded++) addPoint();
			Pgeometry.attributes.flash.needsUpdate = true;
			renderer.render(scene, camera)//, rTargets[0] );
			//renderer.render( bloom, pCamera );
			ready = 1;
		});
	}

}
