import * as THREE from './three.module.js';
const canvas=document.querySelector('#world');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let renderer;
try {
 renderer=new THREE.WebGLRenderer({canvas,antialias:false,powerPreference:'low-power',alpha:true});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
 const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
 const uniforms={uTime:{value:0},uRes:{value:new THREE.Vector2()},uPointer:{value:new THREE.Vector2()},uScroll:{value:0}};
 const material=new THREE.ShaderMaterial({uniforms,depthTest:false,vertexShader:`varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position,1.);}`,fragmentShader:`
 precision highp float; varying vec2 vUv; uniform float uTime; uniform vec2 uRes; uniform vec2 uPointer; uniform float uScroll;
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float noise(vec2 p){vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
 float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<5;i++){s+=a*noise(p);p=p*2.03+14.7;a*=.5;}return s;}
 void main(){
 vec2 uv=vUv; float aspect=uRes.x/uRes.y; vec2 p=(uv-.5)*vec2(aspect,1.);p+=uPointer*.008;
 float horizon=.40; float sunX=.77; vec2 sun=vec2(sunX,.48+uScroll*.025);
 vec3 deep=vec3(.045,.11,.14),warm=vec3(.72,.53,.32),mist=vec3(.34,.46,.40);
 float glow=exp(-length((uv-sun)*vec2(aspect,.95))*3.6);
 vec3 col=mix(deep,mist,pow(1.-uv.y,.7)*.55);col=mix(col,warm,glow*.78);
 float clouds=fbm(vec2(p.x*2.5+uTime*.006,p.y*4.));col+=vec3(.16,.12,.075)*clouds*glow;
 float r=length((uv-sun)*vec2(aspect,1.));
 col+=vec3(.5,.31,.12)*exp(-r*17.);col=mix(col,vec3(.98,.85,.61),1.-smoothstep(.038,.041,r));
 // Layered distant headlands around an open horizon.
 float m1=horizon+.013+.045*fbm(vec2(uv.x*8.,3.));float m2=horizon-.01+.035*fbm(vec2(uv.x*12.,9.));
 float edge=pow(abs(uv.x-.65)*1.4,2.);
 m1+=edge*.10;m2+=edge*.05;
 col=mix(col,vec3(.19,.29,.27),1.-smoothstep(m1-.002,m1+.002,uv.y));
 col=mix(col,vec3(.10,.22,.21),1.-smoothstep(m2-.002,m2+.002,uv.y));
 if(uv.y<horizon){
 float d=(horizon-uv.y)/horizon;float perspective=1./(d+.045);float drift=uTime*.13;
 float waves=sin(uv.y*150.+fbm(vec2(uv.x*8.,uv.y*27.-drift))*(4.+d*5.)+drift*1.2);
 float fine=sin(uv.y*420.+noise(vec2(uv.x*90.,uv.y*70.+drift))*5.);
 vec3 sea=mix(vec3(.18,.31,.29),vec3(.035,.13,.15),pow(d,.5));
 float reflection=exp(-pow((uv.x-sunX)*aspect/(.04+d*.23),2.));
 float sparkle=pow(max(0.,waves*.6+fine*.35),4.);
 sea+=vec3(.70,.49,.24)*reflection*(sparkle*.7+.14)*(1.-d*.5);
 sea+=vec3(.07,.12,.10)*smoothstep(.65,1.,waves)*d;
 col=sea;
 }
 // Film grain and a soft lens vignette, kept below the text.
 float grain=(hash(gl_FragCoord.xy+fract(uTime)*31.)-.5)*.025;
 col+=grain;col*=1.-.32*pow(length((uv-.5)*vec2(1.1,1.)),1.5);
 gl_FragColor=vec4(col,1.);
 }`});
 scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),material));
 let paused=reduced.matches,reading=false,visible=true,frame=0,last=0,time=0;
 function render(){renderer.render(scene,camera);}
 function resize(){const b=canvas.getBoundingClientRect();renderer.setSize(b.width,b.height,false);uniforms.uRes.value.set(b.width,b.height);render();}resize();
 const observer=new IntersectionObserver(([e])=>{visible=e.isIntersecting;restart();});observer.observe(canvas);
 function animate(now){frame=0;if(paused||reading||!visible||document.hidden)return;if(now-last>32){time+=Math.min((now-last)/1000,.06);last=now;uniforms.uTime.value=time;uniforms.uScroll.value=Math.min(scrollY/innerHeight,1);render();}frame=requestAnimationFrame(animate);}
 function restart(){if(frame)cancelAnimationFrame(frame);frame=0;last=performance.now();if(!paused&&!reading&&visible&&!document.hidden)frame=requestAnimationFrame(animate);else render();}
 addEventListener('resize',resize);addEventListener('pointermove',e=>{uniforms.uPointer.value.set(e.clientX/innerWidth-.5,e.clientY/innerHeight-.5);},{passive:true});
 addEventListener('northline-motion',e=>{paused=e.detail;restart();});addEventListener('northline-reading',e=>{reading=e.detail;restart();});document.addEventListener('visibilitychange',restart);reduced.addEventListener('change',e=>{paused=e.matches;restart();});
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();canvas.style.display='none';if(frame)cancelAnimationFrame(frame);});restart();
 document.documentElement.dataset.scene='ready';
} catch(error){canvas.style.display='none';document.documentElement.dataset.scene='fallback';}
