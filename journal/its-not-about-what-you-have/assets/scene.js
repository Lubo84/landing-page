import * as THREE from './three.module.js';
const canvas=document.querySelector('#world'),stage=document.querySelector('.hero-stage'),still=stage.querySelector('img');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
try{
 const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.setClearColor(0xf5f5f7,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(29,1,.1,60);camera.position.set(3.1,1.4,8.6);camera.lookAt(0,0,0);
 // Build a neutral photographic studio for real glass reflections.
 const studio=new THREE.Scene();studio.background=new THREE.Color(0xc7c8cc);
 const walls=new THREE.Mesh(new THREE.BoxGeometry(16,12,16),new THREE.MeshBasicMaterial({color:0xe9ebef,side:THREE.BackSide}));studio.add(walls);
 function softbox(x,y,z,w,h,color,intensity){const p=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:new THREE.Color(color).multiplyScalar(intensity),side:THREE.DoubleSide}));p.position.set(x,y,z);p.lookAt(0,0,0);studio.add(p);}
 softbox(-4,3,3,3,6,0xffffff,2.2);softbox(4,1,2,2,5,0xcbdfff,1.5);softbox(0,5,-2,6,3,0xffffff,2);softbox(-2,0,-5,1,5,0xffe9cd,1.3);
 const pmrem=new THREE.PMREMGenerator(renderer);const env=pmrem.fromScene(studio,.04);scene.environment=env.texture;pmrem.dispose();
 scene.add(new THREE.HemisphereLight(0xffffff,0x93929b,2));const key=new THREE.DirectionalLight(0xffffff,3);key.position.set(-3,5,4);scene.add(key);const fill=new THREE.DirectionalLight(0xb4cdff,1.5);fill.position.set(4,0,3);scene.add(fill);
 const object=new THREE.Group();object.rotation.z=-.035;object.rotation.y=-.2;scene.add(object);
 const glass=new THREE.MeshPhysicalMaterial({color:0xf1f8ff,metalness:0,roughness:.045,transmission:1,thickness:.13,ior:1.46,envMapIntensity:1.5,transparent:true,opacity:1,side:THREE.DoubleSide});
 const profile=[[.53,-1.22],[.61,-1.20],[.67,-1.10],[.69,-.92],[.65,-.70],[.53,-.43],[.31,-.19],[.12,-.055],[.065,0],[.12,.055],[.31,.19],[.53,.43],[.65,.70],[.69,.92],[.67,1.10],[.61,1.20],[.53,1.22]];
 const curve=new THREE.SplineCurve(profile.map(([x,y])=>new THREE.Vector2(x,y)));const shape=curve.getPoints(100);object.add(new THREE.Mesh(new THREE.LatheGeometry(shape,96),glass));
 const metal=new THREE.MeshStandardMaterial({color:0xcbd0d8,metalness:1,roughness:.19,envMapIntensity:1.35});
 for(const y of [-1.26,1.26]){const rim=new THREE.Mesh(new THREE.CylinderGeometry(.65,.65,.09,96),metal);rim.position.y=y;object.add(rim);const edge=new THREE.Mesh(new THREE.TorusGeometry(.615,.025,12,96),metal);edge.rotation.x=Math.PI/2;edge.position.y=y+(y>0?.055:-.055);object.add(edge);}
 const sand=new THREE.MeshStandardMaterial({color:0xc99a57,roughness:.85,metalness:.13});
 const low=[[0,-1.18],[.54,-1.18],[.58,-1.13],[.59,-1.03],[.52,-.94],[.38,-.81],[.22,-.64],[0,-.48]];
 const high=[[0,.04],[.07,.04],[.20,.14],[.36,.30],[.48,.46],[.57,.64],[.59,.72],[0,.72]];
 for(const points of [low,high])object.add(new THREE.Mesh(new THREE.LatheGeometry(points.map(([x,y])=>new THREE.Vector2(x,y)),80),sand));
 const stream=new THREE.Mesh(new THREE.CylinderGeometry(.009,.012,.54,12),sand);stream.position.y=-.24;object.add(stream);
 const particleCount=90,positions=new Float32Array(particleCount*3);for(let i=0;i<particleCount;i++){positions[i*3]=(Math.random()-.5)*.025;positions[i*3+1]=-Math.random()*.53;positions[i*3+2]=(Math.random()-.5)*.025;}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(positions,3));object.add(new THREE.Points(geo,new THREE.PointsMaterial({color:0xf8d9a5,size:.012,transparent:true,opacity:.8})));
 let paused=reduced.matches,reading=document.body.classList.contains('reading'),visible=true,frame=0,last=0,time=0,pointer=0;
 function draw(){renderer.render(scene,camera);}
 function resize(){const r=stage.getBoundingClientRect();if(!r.width||!r.height)return;renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.position.z=r.width<500?9.9:8.6;camera.updateProjectionMatrix();draw();}
 resize();still.style.opacity='0';document.documentElement.dataset.scene='ready';
 function animate(now){frame=0;if(paused||reading||!visible||document.hidden)return;if(now-last>32){const dt=Math.min((now-last)/1000,.06);time+=dt;last=now;object.rotation.y=-.2+Math.sin(time*.22)*.13+pointer*.09;object.position.y=Math.sin(time*.65)*.035;for(let i=0;i<particleCount;i++){positions[i*3+1]-=dt*.4;if(positions[i*3+1]<-.53)positions[i*3+1]=0;}geo.attributes.position.needsUpdate=true;draw();}frame=requestAnimationFrame(animate);}
 function restart(){if(frame)cancelAnimationFrame(frame);frame=0;last=performance.now();if(!paused&&!reading&&visible&&!document.hidden)frame=requestAnimationFrame(animate);else draw();}
 new IntersectionObserver(([e])=>{visible=e.isIntersecting;restart();}).observe(stage);
 addEventListener('resize',resize);addEventListener('pointermove',e=>{pointer=e.clientX/innerWidth-.5;},{passive:true});addEventListener('northline-motion',e=>{paused=e.detail;restart();});addEventListener('northline-reading',e=>{reading=e.detail;if(!reading)resize();restart();});reduced.addEventListener('change',e=>{paused=e.matches;restart();});document.addEventListener('visibilitychange',restart);
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();still.style.opacity='1';canvas.style.display='none';document.documentElement.dataset.scene='fallback';if(frame)cancelAnimationFrame(frame);});restart();
}catch(error){canvas.style.display='none';still.style.opacity='1';document.documentElement.dataset.scene='fallback';}
