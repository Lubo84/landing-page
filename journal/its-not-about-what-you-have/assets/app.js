const mode=document.querySelector('#mode'),motion=document.querySelector('#motion'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
let quiet=false,paused=reduced.matches;
function syncMotion(){motion.setAttribute('aria-pressed',String(paused));motion.querySelector('.motion-label').textContent=paused?'Resume motion':'Pause motion';motion.querySelector('.motion-icon').textContent=paused?'▷':'Ⅱ';motion.setAttribute('aria-label',paused?'Resume visual motion':'Pause visual motion');}
syncMotion();
const reveals=[...document.querySelectorAll('.reveal')];
const observer=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');observer.unobserve(e.target);}});},{threshold:.12});
reveals.forEach(el=>observer.observe(el));
function animationMode(){document.body.classList.toggle('motion-enabled',!quiet&&!paused);}
animationMode();
mode.addEventListener('click',()=>{quiet=!quiet;document.body.classList.toggle('reading',quiet);mode.setAttribute('aria-pressed',String(quiet));mode.textContent=quiet?'Cinematic view':'Reading mode';animationMode();dispatchEvent(new CustomEvent('northline-reading',{detail:quiet}));update();});
motion.addEventListener('click',()=>{paused=!paused;syncMotion();animationMode();dispatchEvent(new CustomEvent('northline-motion',{detail:paused}));});
reduced.addEventListener('change',e=>{paused=e.matches;syncMotion();animationMode();});
const chapters=[...document.querySelectorAll('.chapter')],nav=[...document.querySelectorAll('.contents nav a')],progress=document.querySelector('.progress');
function update(){let current=0;chapters.forEach((s,i)=>{if(s.getBoundingClientRect().top<innerHeight*.4)current=i;});nav.forEach((a,i)=>{a.classList.toggle('active',i===current);if(i===current)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});const start=document.querySelector('#essay').offsetTop,end=document.querySelector('.closing').offsetTop+document.querySelector('.closing').offsetHeight;progress.style.width=`${Math.max(0,Math.min(100,(scrollY-start)/Math.max(1,end-innerHeight-start)*100))}%`;}
let ticking=false;addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(()=>{update();ticking=false;});ticking=true;}},{passive:true});addEventListener('resize',update);update();
const words=document.querySelector('.story').innerText.trim().split(/\s+/).length+document.querySelector('.closing').innerText.trim().split(/\s+/).length;document.querySelector('#readtime').textContent=`${Math.max(1,Math.ceil(words/200))} min read`;
document.querySelector('#share').addEventListener('click',async()=>{const data={title:'It’s not about what you have',text:'Money is the tool. Life is the outcome.',url:location.href.split('#')[0]};const status=document.querySelector('#share-status');try{if(navigator.share){await navigator.share(data);status.textContent='';}else{await navigator.clipboard.writeText(data.url);status.textContent='Link copied. Share a little perspective.';}}catch(e){if(e.name!=='AbortError')status.textContent='Copy the page address to share this essay.';}});
