"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[883],{1150:(e,t,r)=>{Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"default",{enumerable:!0,get:function(){return l}});let o=r(5155),i=r(2115),n=r(4437);function a(e){return{default:e&&"default"in e?e.default:e}}r(6552);let s={loader:()=>Promise.resolve(a(()=>null)),loading:null,ssr:!0},l=function(e){let t={...s,...e},r=(0,i.lazy)(()=>t.loader().then(a)),l=t.loading;function u(e){let a=l?(0,o.jsx)(l,{isLoading:!0,pastDelay:!0,error:null}):null,s=!t.ssr||!!t.loading,u=s?i.Suspense:i.Fragment,h=t.ssr?(0,o.jsxs)(o.Fragment,{children:[null,(0,o.jsx)(r,{...e})]}):(0,o.jsx)(n.BailoutToCSR,{reason:"next/dynamic",children:(0,o.jsx)(r,{...e})});return(0,o.jsx)(u,{...s?{fallback:a}:{},children:h})}return u.displayName="LoadableComponent",u}},2049:(e,t,r)=>{r.d(t,{Z:()=>o});let o={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`}},3617:(e,t,r)=>{r.d(t,{F:()=>l,o:()=>i});var o=r(5339);class i{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}}let n=new o.qUd(-1,1,1,-1,0,1);class a extends o.LoY{constructor(){super(),this.setAttribute("position",new o.qtW([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new o.qtW([0,2,0,0,2,0],2))}}let s=new a;class l{constructor(e){this._mesh=new o.eaF(s,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,n)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}}},4054:(e,t)=>{Object.defineProperty(t,"__esModule",{value:!0}),!function(e,t){for(var r in t)Object.defineProperty(e,r,{enumerable:!0,get:t[r]})}(t,{bindSnapshot:function(){return a},createAsyncLocalStorage:function(){return n},createSnapshot:function(){return s}});let r=Object.defineProperty(Error("Invariant: AsyncLocalStorage accessed in runtime where it is not available"),"__NEXT_ERROR_CODE",{value:"E504",enumerable:!1,configurable:!0});class o{disable(){throw r}getStore(){}run(){throw r}exit(){throw r}enterWith(){throw r}static bind(e){return e}}let i="undefined"!=typeof globalThis&&globalThis.AsyncLocalStorage;function n(){return i?new i:new o}function a(e){return i?i.bind(e):o.bind(e)}function s(){return i?i.snapshot():function(e,...t){return e(...t)}}},4437:(e,t,r)=>{function o(e){let{reason:t,children:r}=e;return r}Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"BailoutToCSR",{enumerable:!0,get:function(){return o}}),r(4553)},6278:(e,t,r)=>{Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"default",{enumerable:!0,get:function(){return i}});let o=r(8140)._(r(1150));function i(e,t){var r;let i={};"function"==typeof e&&(i.loader=e);let n={...i,...t};return(0,o.default)({...n,modules:null==(r=n.loadableGenerated)?void 0:r.modules})}("function"==typeof t.default||"object"==typeof t.default&&null!==t.default)&&void 0===t.default.__esModule&&(Object.defineProperty(t.default,"__esModule",{value:!0}),Object.assign(t.default,t),e.exports=t.default)},6451:(e,t,r)=>{r.d(t,{C:()=>s});var o=r(5339),i=r(3617),n=r(2049);let a={name:"LuminosityHighPassShader",uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new o.Q1f(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`};class s extends i.o{constructor(e,t=1,r,s){super(),this.strength=t,this.radius=r,this.threshold=s,this.resolution=void 0!==e?new o.I9Y(e.x,e.y):new o.I9Y(256,256),this.clearColor=new o.Q1f(0,0,0),this.needsSwap=!1,this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let l=Math.round(this.resolution.x/2),u=Math.round(this.resolution.y/2);this.renderTargetBright=new o.nWS(l,u,{type:o.ix0}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let e=0;e<this.nMips;e++){let t=new o.nWS(l,u,{type:o.ix0});t.texture.name="UnrealBloomPass.h"+e,t.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(t);let r=new o.nWS(l,u,{type:o.ix0});r.texture.name="UnrealBloomPass.v"+e,r.texture.generateMipmaps=!1,this.renderTargetsVertical.push(r),l=Math.round(l/2),u=Math.round(u/2)}this.highPassUniforms=o.LlO.clone(a.uniforms),this.highPassUniforms.luminosityThreshold.value=s,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new o.BKk({uniforms:this.highPassUniforms,vertexShader:a.vertexShader,fragmentShader:a.fragmentShader}),this.separableBlurMaterials=[];let h=[6,10,14,18,22];l=Math.round(this.resolution.x/2),u=Math.round(this.resolution.y/2);for(let e=0;e<this.nMips;e++)this.separableBlurMaterials.push(this._getSeparableBlurMaterial(h[e])),this.separableBlurMaterials[e].uniforms.invSize.value=new o.I9Y(1/l,1/u),l=Math.round(l/2),u=Math.round(u/2);this.compositeMaterial=this._getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=t,this.compositeMaterial.uniforms.bloomRadius.value=.1,this.compositeMaterial.uniforms.bloomFactors.value=[1,.8,.6,.4,.2],this.bloomTintColors=[new o.Pq0(1,1,1),new o.Pq0(1,1,1),new o.Pq0(1,1,1),new o.Pq0(1,1,1),new o.Pq0(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,this.copyUniforms=o.LlO.clone(n.Z.uniforms),this.blendMaterial=new o.BKk({uniforms:this.copyUniforms,vertexShader:n.Z.vertexShader,fragmentShader:n.Z.fragmentShader,premultipliedAlpha:!0,blending:o.EZo,depthTest:!1,depthWrite:!1,transparent:!0}),this._oldClearColor=new o.Q1f,this._oldClearAlpha=1,this._basic=new o.V9B,this._fsQuad=new i.F(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this._basic.dispose(),this._fsQuad.dispose()}setSize(e,t){let r=Math.round(e/2),i=Math.round(t/2);this.renderTargetBright.setSize(r,i);for(let e=0;e<this.nMips;e++)this.renderTargetsHorizontal[e].setSize(r,i),this.renderTargetsVertical[e].setSize(r,i),this.separableBlurMaterials[e].uniforms.invSize.value=new o.I9Y(1/r,1/i),r=Math.round(r/2),i=Math.round(i/2)}render(e,t,r,o,i){e.getClearColor(this._oldClearColor),this._oldClearAlpha=e.getClearAlpha();let n=e.autoClear;e.autoClear=!1,e.setClearColor(this.clearColor,0),i&&e.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this._fsQuad.material=this._basic,this._basic.map=r.texture,e.setRenderTarget(null),e.clear(),this._fsQuad.render(e)),this.highPassUniforms.tDiffuse.value=r.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this._fsQuad.material=this.materialHighPassFilter,e.setRenderTarget(this.renderTargetBright),e.clear(),this._fsQuad.render(e);let a=this.renderTargetBright;for(let t=0;t<this.nMips;t++)this._fsQuad.material=this.separableBlurMaterials[t],this.separableBlurMaterials[t].uniforms.colorTexture.value=a.texture,this.separableBlurMaterials[t].uniforms.direction.value=s.BlurDirectionX,e.setRenderTarget(this.renderTargetsHorizontal[t]),e.clear(),this._fsQuad.render(e),this.separableBlurMaterials[t].uniforms.colorTexture.value=this.renderTargetsHorizontal[t].texture,this.separableBlurMaterials[t].uniforms.direction.value=s.BlurDirectionY,e.setRenderTarget(this.renderTargetsVertical[t]),e.clear(),this._fsQuad.render(e),a=this.renderTargetsVertical[t];this._fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,e.setRenderTarget(this.renderTargetsHorizontal[0]),e.clear(),this._fsQuad.render(e),this._fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,i&&e.state.buffers.stencil.setTest(!0),this.renderToScreen?e.setRenderTarget(null):e.setRenderTarget(r),this._fsQuad.render(e),e.setClearColor(this._oldClearColor,this._oldClearAlpha),e.autoClear=n}_getSeparableBlurMaterial(e){let t=[],r=e/3;for(let o=0;o<e;o++)t.push(.39894*Math.exp(-.5*o*o/(r*r))/r);return new o.BKk({defines:{KERNEL_RADIUS:e},uniforms:{colorTexture:{value:null},invSize:{value:new o.I9Y(.5,.5)},direction:{value:new o.I9Y(.5,.5)},gaussianCoefficients:{value:t}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				#include <common>

				varying vec2 vUv;

				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float gaussianCoefficients[KERNEL_RADIUS];

				void main() {

					float weightSum = gaussianCoefficients[0];
					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * weightSum;

					for ( int i = 1; i < KERNEL_RADIUS; i ++ ) {

						float x = float( i );
						float w = gaussianCoefficients[i];
						vec2 uvOffset = direction * invSize * x;
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += ( sample1 + sample2 ) * w;

					}

					gl_FragColor = vec4( diffuseSum, 1.0 );

				}`})}_getCompositeMaterial(e){return new o.BKk({defines:{NUM_MIPS:e},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				varying vec2 vUv;

				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor( const in float factor ) {

					float mirrorFactor = 1.2 - factor;
					return mix( factor, mirrorFactor, bloomRadius );

				}

				void main() {

					// 3.0 for backwards compatibility with previous alpha-based intensity
					vec3 bloom = 3.0 * bloomStrength * (
						lerpBloomFactor( bloomFactors[ 0 ] ) * bloomTintColors[ 0 ] * texture2D( blurTexture1, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 1 ] ) * bloomTintColors[ 1 ] * texture2D( blurTexture2, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 2 ] ) * bloomTintColors[ 2 ] * texture2D( blurTexture3, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 3 ] ) * bloomTintColors[ 3 ] * texture2D( blurTexture4, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 4 ] ) * bloomTintColors[ 4 ] * texture2D( blurTexture5, vUv ).rgb
					);

					float bloomAlpha = max( bloom.r, max( bloom.g, bloom.b ) );
					gl_FragColor = vec4( bloom, bloomAlpha );

				}`})}}s.BlurDirectionX=new o.I9Y(1,0),s.BlurDirectionY=new o.I9Y(0,1)},6552:(e,t,r)=>{function o(e){let{moduleIds:t}=e;return null}Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"PreloadChunks",{enumerable:!0,get:function(){return o}}),r(5155),r(7650),r(8567),r(7278)},7828:(e,t,r)=>{Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"workAsyncStorageInstance",{enumerable:!0,get:function(){return o}});let o=(0,r(4054).createAsyncLocalStorage)()},7909:(e,t,r)=>{r.d(t,{default:()=>i.a});var o=r(6278),i=r.n(o)},8567:(e,t,r)=>{Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"workAsyncStorage",{enumerable:!0,get:function(){return o.workAsyncStorageInstance}});let o=r(7828)},9821:(e,t,r)=>{r.d(t,{A:()=>c});var o=r(5339);function i(e,t){(null==t||t>e.length)&&(t=e.length);for(var r=0,o=Array(t);r<t;r++)o[r]=e[r];return o}function n(e){return(n=Object.setPrototypeOf?Object.getPrototypeOf.bind():function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function a(){try{var e=!Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){}))}catch(e){}return(a=function(){return!!e})()}function s(e,t){return(s=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(e,t){return e.__proto__=t,e})(e,t)}function l(e,t){return function(e){if(Array.isArray(e))return e}(e)||function(e,t){var r=null==e?null:"undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(null!=r){var o,i,n,a,s=[],l=!0,u=!1;try{if(n=(r=r.call(e)).next,0===t){if(Object(r)!==r)return;l=!1}else for(;!(l=(o=n.call(r)).done)&&(s.push(o.value),s.length!==t);l=!0);}catch(e){u=!0,i=e}finally{try{if(!l&&null!=r.return&&(a=r.return(),Object(a)!==a))return}finally{if(u)throw i}}return s}}(e,t)||h(e,t)||function(){throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function u(e){return function(e){if(Array.isArray(e))return i(e)}(e)||function(e){if("undefined"!=typeof Symbol&&null!=e[Symbol.iterator]||null!=e["@@iterator"])return Array.from(e)}(e)||h(e)||function(){throw TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function h(e,t){if(e){if("string"==typeof e)return i(e,t);var r=({}).toString.call(e).slice(8,-1);return"Object"===r&&e.constructor&&(r=e.constructor.name),"Map"===r||"Set"===r?Array.from(e):"Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)?i(e,t):void 0}}var f="undefined"!=typeof window&&window.THREE?window.THREE:{CanvasTexture:o.GOR,Sprite:o.kxk,SpriteMaterial:o.RoJ,SRGBColorSpace:o.er$},c=function(e){var t;function r(){var e,t,o,i=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"",s=arguments.length>1&&void 0!==arguments[1]?arguments[1]:10,l=arguments.length>2&&void 0!==arguments[2]?arguments[2]:"rgba(255, 255, 255, 1)";if(!(this instanceof r))throw TypeError("Cannot call a class as a function");return e=r,t=[new f.SpriteMaterial],e=n(e),(o=function(e,t){if(t&&("object"==typeof t||"function"==typeof t))return t;if(void 0!==t)throw TypeError("Derived constructors may only return object or undefined");if(void 0===e)throw ReferenceError("this hasn't been initialised - super() hasn't been called");return e}(this,a()?Reflect.construct(e,t||[],n(this).constructor):e.apply(this,t)))._text="".concat(i),o._textHeight=s,o._color=l,o._backgroundColor=!1,o._padding=0,o._borderWidth=0,o._borderRadius=0,o._borderColor="white",o._offsetX=0,o._offsetY=0,o._strokeWidth=0,o._strokeColor="white",o._fontFace="system-ui",o._fontSize=90,o._fontWeight="normal",o._canvas=document.createElement("canvas"),o._genCanvas(),o}if("function"!=typeof e&&null!==e)throw TypeError("Super expression must either be null or a function");return r.prototype=Object.create(e&&e.prototype,{constructor:{value:r,writable:!0,configurable:!0}}),Object.defineProperty(r,"prototype",{writable:!1}),e&&s(r,e),t=[{key:"text",get:function(){return this._text},set:function(e){this._text=e,this._genCanvas()}},{key:"textHeight",get:function(){return this._textHeight},set:function(e){this._textHeight=e,this._genCanvas()}},{key:"color",get:function(){return this._color},set:function(e){this._color=e,this._genCanvas()}},{key:"backgroundColor",get:function(){return this._backgroundColor},set:function(e){this._backgroundColor=e,this._genCanvas()}},{key:"padding",get:function(){return this._padding},set:function(e){this._padding=e,this._genCanvas()}},{key:"borderWidth",get:function(){return this._borderWidth},set:function(e){this._borderWidth=e,this._genCanvas()}},{key:"borderRadius",get:function(){return this._borderRadius},set:function(e){this._borderRadius=e,this._genCanvas()}},{key:"borderColor",get:function(){return this._borderColor},set:function(e){this._borderColor=e,this._genCanvas()}},{key:"offsetX",get:function(){return this._offsetX},set:function(e){this._offsetX=e,this._genCanvas()}},{key:"offsetY",get:function(){return this._offsetY},set:function(e){this._offsetY=e,this._genCanvas()}},{key:"fontFace",get:function(){return this._fontFace},set:function(e){this._fontFace=e,this._genCanvas()}},{key:"fontSize",get:function(){return this._fontSize},set:function(e){this._fontSize=e,this._genCanvas()}},{key:"fontWeight",get:function(){return this._fontWeight},set:function(e){this._fontWeight=e,this._genCanvas()}},{key:"strokeWidth",get:function(){return this._strokeWidth},set:function(e){this._strokeWidth=e,this._genCanvas()}},{key:"strokeColor",get:function(){return this._strokeColor},set:function(e){this._strokeColor=e,this._genCanvas()}},{key:"_genCanvas",value:function(){var e=this,t=this._canvas,r=t.getContext("2d"),o=1/this.textHeight,i=Array.isArray(this.borderWidth)?this.borderWidth:[this.borderWidth,this.borderWidth],n=i.map(function(t){return t*e.fontSize*o}),a=(Array.isArray(this.borderRadius)?this.borderRadius:[this.borderRadius,this.borderRadius,this.borderRadius,this.borderRadius]).map(function(t){return t*e.fontSize*o}),s=Array.isArray(this.padding)?this.padding:[this.padding,this.padding],h=s.map(function(t){return t*e.fontSize*o}),c=[this.offsetX,this.offsetY].map(function(t){return t*e.fontSize*o}),d=this.text.split("\n"),m="".concat(this.fontWeight," ").concat(this.fontSize,"px ").concat(this.fontFace);r.font=m;var v=Math.max.apply(Math,u(d.map(function(e){return r.measureText(e).width}))),p=this.fontSize*d.length,g=v+2*n[0]+2*h[0],b=p+2*n[1]+2*h[1];if(t.width=g+Math.abs(c[0]),t.height=b+Math.abs(c[1]),r.translate.apply(r,u(c.map(function(e){return Math.max(0,e)}))),this.borderWidth){if(r.strokeStyle=this.borderColor,n[0]){var y=n[0]/2;r.lineWidth=n[0],r.beginPath(),r.moveTo(y,a[0]),r.lineTo(y,b-a[3]),r.moveTo(g-y,a[1]),r.lineTo(g-y,b-a[2]),r.stroke()}if(n[1]){var _=n[1]/2;r.lineWidth=n[1],r.beginPath(),r.moveTo(Math.max(n[0],a[0]),_),r.lineTo(g-Math.max(n[0],a[1]),_),r.moveTo(Math.max(n[0],a[3]),b-_),r.lineTo(g-Math.max(n[0],a[2]),b-_),r.stroke()}if(this.borderRadius){var x=Math.max.apply(Math,u(n)),T=x/2;r.lineWidth=x,r.beginPath(),[!!a[0]&&[a[0],T,T,a[0]],!!a[1]&&[g-a[1],g-T,T,a[1]],!!a[2]&&[g-a[2],g-T,b-T,b-a[2]],!!a[3]&&[a[3],T,b-T,b-a[3]]].filter(function(e){return e}).forEach(function(e){var t=l(e,4),o=t[0],i=t[1],n=t[2],a=t[3];r.moveTo(o,n),r.quadraticCurveTo(i,n,i,a)}),r.stroke()}}this.backgroundColor&&(r.fillStyle=this.backgroundColor,this.borderRadius?(r.beginPath(),r.moveTo(n[0],a[0]),[[n[0],a[0],g-a[1],n[1],n[1],n[1]],[g-n[0],g-n[0],g-n[0],n[1],a[1],b-a[2]],[g-n[0],g-a[2],a[3],b-n[1],b-n[1],b-n[1]],[n[0],n[0],n[0],b-n[1],b-a[3],a[0]]].forEach(function(e){var t=l(e,6),o=t[0],i=t[1],n=t[2],a=t[3],s=t[4],u=t[5];r.quadraticCurveTo(o,a,i,s),r.lineTo(n,u)}),r.closePath(),r.fill()):r.fillRect(n[0],n[1],g-2*n[0],b-2*n[1])),r.translate.apply(r,u(n)),r.translate.apply(r,u(h)),r.font=m,r.fillStyle=this.color,r.textBaseline="bottom";var S=this.strokeWidth>0;S&&(r.lineWidth=this.strokeWidth*this.fontSize/10,r.strokeStyle=this.strokeColor),d.forEach(function(t,o){var i=(v-r.measureText(t).width)/2,n=(o+1)*e.fontSize;S&&r.strokeText(t,i,n),r.fillText(t,i,n)}),this.material.map&&this.material.map.dispose(),(this.material.map=new f.CanvasTexture(t)).colorSpace=f.SRGBColorSpace;var C=this.textHeight*d.length+2*i[1]+2*s[1]+Math.abs(this.offsetY);this.scale.set(C*t.width/t.height,C,0)}},{key:"clone",value:function(){return new this.constructor(this.text,this.textHeight,this.color).copy(this)}},{key:"copy",value:function(e){return f.Sprite.prototype.copy.call(this,e),this.color=e.color,this.backgroundColor=e.backgroundColor,this.padding=e.padding,this.borderWidth=e.borderWidth,this.borderColor=e.borderColor,this.offsetX=e.offsetX,this.offsetY=e.offsetY,this.fontFace=e.fontFace,this.fontSize=e.fontSize,this.fontWeight=e.fontWeight,this.strokeWidth=e.strokeWidth,this.strokeColor=e.strokeColor,this}}],function(e,t){for(var r=0;r<t.length;r++){var o=t[r];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,function(e){var t=function(e,t){if("object"!=typeof e||!e)return e;var r=e[Symbol.toPrimitive];if(void 0!==r){var o=r.call(e,t);if("object"!=typeof o)return o;throw TypeError("@@toPrimitive must return a primitive value.")}return String(e)}(e,"string");return"symbol"==typeof t?t:t+""}(o.key),o)}}(r.prototype,t),Object.defineProperty(r,"prototype",{writable:!1}),r}(f.Sprite)}}]);