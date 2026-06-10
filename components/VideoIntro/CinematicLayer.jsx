'use client';

import { useEffect, useRef } from 'react';
import styles from './VideoIntro.module.css';

export default function CinematicLayer() {
  const canvasRef = useRef(null);

  useEffect(() => {
    let renderer, scene, camera, points, animId;
    let W = window.innerWidth, H = window.innerHeight;
    let mx = 0, my = 0, t = 0;

    async function init() {
      const THREE = (await import('three')).default ?? await import('three');

      renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true, antialias: false });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
      renderer.setSize(W, H);
      renderer.setClearColor(0x000000, 0);

      scene  = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000);
      camera.position.z = 80;

      // bokeh disc texture
      const sc = document.createElement('canvas');
      sc.width = sc.height = 64;
      const ctx = sc.getContext('2d');
      const g = ctx.createRadialGradient(32,32,0,32,32,32);
      g.addColorStop(0,   'rgba(255,255,255,1)');
      g.addColorStop(0.3, 'rgba(255,200,120,0.85)');
      g.addColorStop(0.7, 'rgba(255,130,50,0.2)');
      g.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0,0,64,64);

      const N = 200;
      const pos  = new Float32Array(N*3);
      const col  = new Float32Array(N*3);
      const orig = new Float32Array(N*3);
      const ph   = new Float32Array(N);
      const sp   = new Float32Array(N);
      const pal  = [[1,.55,.2],[1,.72,.35],[1,.87,.6],[.85,.9,1],[1,1,.96]];

      for (let i=0; i<N; i++) {
        const x=(Math.random()-.5)*170, y=(Math.random()-.5)*95, z=(Math.random()-.5)*65;
        pos[i*3]=x; pos[i*3+1]=y; pos[i*3+2]=z;
        orig[i*3]=x; orig[i*3+1]=y; orig[i*3+2]=z;
        ph[i]=Math.random()*Math.PI*2;
        sp[i]=0.09+Math.random()*0.22;
        const c=pal[Math.floor(Math.random()*pal.length)];
        col[i*3]=c[0]; col[i*3+1]=c[1]; col[i*3+2]=c[2];
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos,3));
      geo.setAttribute('color',    new THREE.BufferAttribute(col,3));

      const mat = new THREE.PointsMaterial({
        size:4, map: new THREE.CanvasTexture(sc),
        vertexColors:true,
        blending: THREE.AdditiveBlending,
        depthWrite:false, transparent:true, opacity:0.5, sizeAttenuation:true,
      });

      points = new THREE.Points(geo, mat);
      points.userData = { orig, ph, sp, N };
      scene.add(points);
    }

    function tick() {
      animId = requestAnimationFrame(tick);
      t += 0.006;
      if (points) {
        const pa = points.geometry.attributes.position.array;
        const { orig, ph, sp, N } = points.userData;
        for (let i=0; i<N; i++) {
          const tt = t*sp[i]+ph[i];
          pa[i*3]   = orig[i*3]   + Math.sin(tt*.7)*2.6;
          pa[i*3+1] = orig[i*3+1] + Math.sin(tt*.5+1.3)*2.1;
          pa[i*3+2] = orig[i*3+2] + Math.cos(tt*.38)*1.6;
        }
        points.geometry.attributes.position.needsUpdate = true;
      }
      camera.position.x += (mx*6 - camera.position.x)*0.024;
      camera.position.y += (my*3 - camera.position.y)*0.024;
      camera.lookAt(0,0,0);
      renderer?.render(scene, camera);
    }

    const onMouse = (e) => { mx=(e.clientX/W-.5)*2; my=(e.clientY/H-.5)*-2; };
    const onResize = () => {
      W=window.innerWidth; H=window.innerHeight;
      renderer?.setSize(W,H);
      if (camera) { camera.aspect=W/H; camera.updateProjectionMatrix(); }
    };

    init().then(() => {
      tick();
      window.addEventListener('mousemove', onMouse, { passive:true });
      window.addEventListener('resize', onResize);
    });

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('resize', onResize);
      points?.geometry.dispose();
      points?.material.dispose();
      renderer?.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.cinematicCanvas} aria-hidden="true" />;
}
