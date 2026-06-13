/* THREE.JS WIREFRAME BACKGROUND — matching reference image */
(function(){
  const canvas = document.getElementById('bg-canvas');
  if(!canvas) return;
  const renderer = new THREE.WebGLRenderer({canvas, alpha:true, antialias:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0d1220, 0.045);
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 200);
  camera.position.set(0, 0, 10);

  function resize(){
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);
  let scrollY = 0;
  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
    canvas.style.opacity = Math.max(0.32, 1 - (scrollY / (window.innerHeight * 0.6)));
  });

  /* Color palette from reference */
  const C = {
    powder: 0xAFD2FA,
    deep:   0x182350,
    teal:   0x2dd4bf,
    purple: 0x8b5cf6,
    brown:  0xd4ab7a,
  };

  function wireMat(col, op){
    return new THREE.LineBasicMaterial({color:col, transparent:true, opacity:op});
  }

  const shapes = [];

  function addWire(geo, mat, x, y, z, rx, ry, rz){
    const edges = new THREE.EdgesGeometry(geo);
    const mesh = new THREE.LineSegments(edges, mat);
    mesh.position.set(x, y, z);
    mesh.rotation.set(rx||0, ry||0, rz||0);
    mesh.userData = {
      vx: (Math.random()-0.5)*0.004,
      vy: (Math.random()-0.5)*0.003,
      rx: (0.004 + Math.random()*0.003) * (Math.random() < 0.5 ? -1 : 1),
      ry: (0.004 + Math.random()*0.003) * (Math.random() < 0.5 ? -1 : 1),
      t: Math.random()*Math.PI*2,
      initY: y
    };
    scene.add(mesh);
    shapes.push(mesh);
    return mesh;
  }

  /* Icosahedron — teal, top-left — matching reference */
  addWire(new THREE.IcosahedronGeometry(0.9, 0), wireMat(C.teal, 0.55), -3.5, 2.5, -2, 0.3, 0.5, 0);
  /* Octahedron cluster — purple, center */
  addWire(new THREE.OctahedronGeometry(0.8, 0), wireMat(C.purple, 0.5), 0.4, 0.8, -3, 0.2, 0.8, 0);
  addWire(new THREE.TetrahedronGeometry(0.6, 0), wireMat(C.purple, 0.4), 1.0, -0.5, -2.5, 0.5, 0.3, 0);
  /* Torus — blue, center — matching reference */
  addWire(new THREE.TorusGeometry(1.0, 0.25, 12, 32), wireMat(C.powder, 0.35), 0.2, -0.2, -3.5, Math.PI*0.1, 0.2, 0);
  /* Small tetrahedron — teal, bottom */
  addWire(new THREE.TetrahedronGeometry(0.5, 0), wireMat(C.teal, 0.45), -0.5, -2.2, -2, 0.2, 0.6, 0);
  /* Extra shapes far back */
  addWire(new THREE.IcosahedronGeometry(0.55, 0), wireMat(C.powder, 0.2), 4.0, 1.5, -5, 0, 0, 0);
  addWire(new THREE.OctahedronGeometry(0.4, 0), wireMat(C.brown, 0.25), -4.5, -1.5, -4, 0, 0, 0);
  addWire(new THREE.TetrahedronGeometry(0.35, 0), wireMat(C.teal, 0.2), 3.5, -2.5, -4, 0, 0, 0);

  /* Spreading wireframe shapes vertically down the page */
  /* Near Skills Section (y = -4.0 to -6.0) */
  addWire(new THREE.OctahedronGeometry(0.7, 0), wireMat(C.teal, 0.4), -4.0, -4.5, -3, 0.1, 0.4, 0);
  addWire(new THREE.TetrahedronGeometry(0.5, 0), wireMat(C.purple, 0.35), 3.5, -5.5, -2, 0.4, 0.2, 0);
  
  /* Near Projects Section (y = -7.0 to -10.0) */
  addWire(new THREE.TorusGeometry(0.9, 0.2, 10, 24), wireMat(C.powder, 0.3), -3.0, -8.0, -3.5, Math.PI*0.2, 0.1, 0);
  addWire(new THREE.IcosahedronGeometry(0.75, 0), wireMat(C.brown, 0.35), 4.0, -9.5, -2, 0.2, 0.5, 0);
  
  /* Near Experience & Contact Sections (y = -11.0 to -14.0) */
  addWire(new THREE.TetrahedronGeometry(0.6, 0), wireMat(C.teal, 0.35), -4.0, -12.0, -2.5, 0.3, 0.6, 0);
  addWire(new THREE.OctahedronGeometry(0.55, 0), wireMat(C.purple, 0.3), 3.0, -13.5, -3, 0.2, 0.7, 0);

  /* Mobile capability detection */
  const isMobile = window.innerWidth < 768;

  /* Particles — small dots like reference */
  const pCount = isMobile ? 40 : 160;
  const pPos = new Float32Array(pCount * 3);
  for(let i=0; i<pCount; i++){
    pPos[i*3]   = (Math.random()-0.5) * 24;
    pPos[i*3+1] = (Math.random() - 0.7) * 38;
    pPos[i*3+2] = (Math.random()-0.5) * 8 - 4;
  }
  const pg = new THREE.BufferGeometry();
  pg.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  scene.add(new THREE.Points(pg, new THREE.PointsMaterial({
    color: C.powder, size: 0.04, transparent: true, opacity: 0.35, sizeAttenuation: true
  })));

  /* Connecting lines between nearest particles — desktop only */
  if(!isMobile){
    const linePositions = [];
    const maxDistance = 2.5; // Represents the 110px screen threshold in world scale
    for(let i=0; i<pCount; i++){
      const x1 = pPos[i*3];
      const y1 = pPos[i*3+1];
      const z1 = pPos[i*3+2];
      for(let j=i+1; j<pCount; j++){
        const x2 = pPos[j*3];
        const y2 = pPos[j*3+1];
        const z2 = pPos[j*3+2];
        const dx = x1 - x2;
        const dy = y1 - y2;
        const dz = z1 - z2;
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
        if(dist < maxDistance){
          linePositions.push(x1, y1, z1);
          linePositions.push(x2, y2, z2);
        }
      }
    }
    const connGeo = new THREE.BufferGeometry();
    connGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linePositions), 3));
    const connMat = new THREE.LineBasicMaterial({
      color: C.powder,
      transparent: true,
      opacity: 0.15,
      depthWrite: false
    });
    scene.add(new THREE.LineSegments(connGeo, connMat));
  }

  /* Grid lines — very subtle, like reference background grid */
  const gridMat = new THREE.LineBasicMaterial({color: 0x182350, transparent: true, opacity: 0.4});
  const gridGeo = new THREE.BufferGeometry();
  const gridVerts = [];
  for(let i=-8; i<=8; i++){
    gridVerts.push(i*1.5, -8, -6,  i*1.5, 8, -6);  /* vertical */
    gridVerts.push(-12, i*1.5, -6,  12, i*1.5, -6); /* horizontal */
  }
  gridGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(gridVerts), 3));
  scene.add(new THREE.LineSegments(gridGeo, gridMat));

  /* Long diagonal lines like reference */
  const diagMat = new THREE.LineBasicMaterial({color: 0x1e3a6e, transparent: true, opacity: 0.3});
  const diagGeo = new THREE.BufferGeometry();
  const diagVerts = [];
  for(let i=0; i<8; i++){
    const x1=(Math.random()-0.5)*20, y1=(Math.random()-0.5)*12;
    const x2=(Math.random()-0.5)*20, y2=(Math.random()-0.5)*12;
    diagVerts.push(x1,y1,-5, x2,y2,-5);
  }
  diagGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(diagVerts), 3));
  scene.add(new THREE.LineSegments(diagGeo, diagMat));

  /* Square particles — matching reference blue squares */
  const sqCount = isMobile ? 10 : 30;
  const sqMat = new THREE.PointsMaterial({color: 0x3b82f6, size: 0.12, transparent: true, opacity: 0.45});
  const sqPos = new Float32Array(sqCount*3);
  for(let i=0; i<sqCount; i++){
    sqPos[i*3]   = (Math.random()-0.5)*22;
    sqPos[i*3+1] = (Math.random()-0.5)*13;
    sqPos[i*3+2] = (Math.random()-0.5)*6 - 3;
  }
  const sqGeo = new THREE.BufferGeometry();
  sqGeo.setAttribute('position', new THREE.BufferAttribute(sqPos, 3));
  scene.add(new THREE.Points(sqGeo, sqMat));

  let mouseX = 0, mouseY = 0;
  if(!isMobile){
    document.addEventListener('mousemove', e => {
      mouseX = (e.clientX / window.innerWidth - 0.5);
      mouseY = -(e.clientY / window.innerHeight - 0.5);
    });
  }

  let t = 0;
  function animate(){
    requestAnimationFrame(animate);
    t += isMobile ? 0.006 : 0.012;
    shapes.forEach(s => {
      s.rotation.x += s.userData.rx * (isMobile ? 0.6 : 1.25);
      s.rotation.y += s.userData.ry * (isMobile ? 0.6 : 1.25);
      s.position.y = s.userData.initY + Math.sin(t + s.userData.t) * (isMobile ? 0.05 : 0.12);
      s.position.x += Math.cos(t + s.userData.t) * (isMobile ? 0.0003 : 0.001);
    });
    scene.rotation.y = t * 0.025;
    const targetZ = 10 + (scrollY * 0.0045);
    camera.position.z += (targetZ - camera.position.z) * 0.03;
    camera.position.x += ((isMobile ? 0 : mouseX * 0.8) - camera.position.x) * 0.03;
    camera.position.y += ((isMobile ? 0 : mouseY * 0.5) - (scrollY * (isMobile ? 0.0008 : 0.0018)) - camera.position.y) * 0.03;
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
  }
  animate();
})();

/* TYPED TEXT */
(function(){
  const el = document.getElementById('typed-out');
  if(!el) return;
  const lines = [
    'FastAPI · Python · MongoDB Atlas',
    'React.js · Flutter · Tailwind CSS',
    'BERT · DeepFace · scikit-learn',
    'Backend Systems · AI Pipelines · Full-Stack'
  ];
  let li=0, ci=0, del=false;
  function tick(){
    const cur = lines[li];
    if(!del){ el.innerHTML=cur.slice(0,ci)+'<span class="typed-cur">_</span>'; ci++; if(ci>cur.length){del=true;setTimeout(tick,2200);return;} }
    else{ el.innerHTML=cur.slice(0,ci)+'<span class="typed-cur">_</span>'; ci--; if(ci<0){del=false;li=(li+1)%lines.length;ci=0;} }
    setTimeout(tick, del?28:65);
  }
  tick();
})();

/* SCROLL REVEAL */
(function(){
  const els = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver(entries => {
    entries.forEach((e,i) => {
      if(e.isIntersecting){ setTimeout(()=>e.target.classList.add('in'), i*55); io.unobserve(e.target); }
    });
  }, {threshold:0.01});
  els.forEach(el => io.observe(el));
})();

/* HERO ENTRANCE */
(function(){
  const h = document.getElementById('hero');
  if(!h) return;
  h.style.opacity='0';
  setTimeout(()=>{ h.style.transition='opacity 0.8s ease'; h.style.opacity='1'; }, 120);
})();

/* PARALLAX ON GHOST TEXT */
(function(){
  const ghost = document.getElementById('hero-ghost');
  if(!ghost) return;
  document.addEventListener('mousemove', e => {
    const x = (e.clientX/window.innerWidth - 0.5) * 20;
    const y = (e.clientY/window.innerHeight - 0.5) * 10;
    ghost.style.transform = `translate(calc(-0% + ${x}px), calc(-50% + ${y}px))`;
    ghost.style.bottom = ''; ghost.style.top='50%';
  });
})();

/* ACTIVE NAVBAR HIGHLIGHT */
(function(){
  const navLinks = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('section[id]');
  const options = {
    root: null,
    rootMargin: '-30% 0px -60% 0px',
    threshold: 0
  };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if(id !== 'hero' && link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, options);
  sections.forEach(section => observer.observe(section));
})();

/* Scroll to top on reload */
if('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.addEventListener('beforeunload', () => { window.scrollTo(0,0); });

/* Scroll-to-top button */
(function(){
  const btn = document.getElementById('scroll-top-btn');
  if(!btn) return;
  window.addEventListener('scroll', () => {
    if(window.scrollY > 400) btn.classList.add('visible');
    else btn.classList.remove('visible');
  }, {passive:true});
  btn.addEventListener('click', () => {
    window.scrollTo({top:0, behavior:'smooth'});
  });
})();

/* Mobile menu toggle */
(function(){
  const burger = document.getElementById('nav-hamburger');
  const overlay = document.getElementById('mobile-overlay');
  if(!burger || !overlay) return;
  
  function toggleMenu(){
    burger.classList.toggle('active');
    overlay.classList.toggle('open');
    document.body.style.overflow = overlay.classList.contains('open') ? 'hidden' : '';
  }
  
  burger.addEventListener('click', toggleMenu);
  
  overlay.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      burger.classList.remove('active');
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
})();

/* Contact form — async Formspree submission */
(function(){
  const form = document.getElementById('contact-form');
  const btn = document.getElementById('form-submit-btn');
  if(!form || !btn) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    btn.textContent = 'Sending...';
    btn.disabled = true;
    btn.style.opacity = '0.6';
    
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });
      
      if(res.ok) {
        btn.textContent = 'Sent ✓';
        btn.style.background = 'rgba(212,171,122,0.15)';
        btn.style.color = '#e8c48a';
        btn.style.opacity = '1';
        form.reset();
        setTimeout(() => {
          btn.textContent = 'Send Message';
          btn.style.background = '';
          btn.style.color = '';
          btn.disabled = false;
        }, 4000);
      } else {
        btn.textContent = 'Error — try again';
        btn.style.opacity = '1';
        btn.disabled = false;
        setTimeout(() => { btn.textContent = 'Send Message'; }, 3000);
      }
    } catch(err) {
      btn.textContent = 'Error — try again';
      btn.style.opacity = '1';
      btn.disabled = false;
      setTimeout(() => { btn.textContent = 'Send Message'; }, 3000);
    }
  });
})();
