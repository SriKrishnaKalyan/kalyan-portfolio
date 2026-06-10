'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import VideoIntro from '@/components/VideoIntro/VideoIntro';
import ScrollNavigator from '@/components/ScrollNavigator/ScrollNavigator';
import styles from './page.module.css';

const SECTIONS_IDS = ['hero','about','skills','experience','projects','education','contact'];

const EXPERIENCE = [
  {
    dates:'Feb 2025 — Aug 2025', company:'Auto-ID Lab, University of Adelaide', location:'Adelaide, Australia',
    title:'Research Assistant — Autonomous Systems & Computer Vision',
    bullets:[
      'Designed and evaluated YOLO architectures (YOLOv5s, YOLOv12s) on VisDrone datasets — best mAP50 of 0.642 for aerial person/vehicle detection in complex scenes',
      'Replaced default feature tracking with SuperPoint neural extraction, increasing visual features from 5 to ~2,000 per frame',
      'Containerised AI workloads onto NVIDIA Jetson Nano/Orin; managed full stack from dev environment to live drone deployment',
      'Migrated complete EGO-Planner UAV framework from ROS1 to ROS2 (Ubuntu 22.04) with integration testing throughout',
      'Configured VINS-Fusion visual-inertial odometry; built Gazebo indoor warehouse simulation for trajectory evaluation and navigation testing',
      'Documented technical findings, calibration procedures, and migration processes for future hardware deployment',
    ],
    stack:['ROS2 (Humble)','Gazebo','MAVROS','ArduPilot SITL','YOLOv12s','YOLOv5s','VINS-Fusion','SuperPoint','EGO-Planner','Kalibr','NVIDIA Jetson Orin','Python','Git','Linux'],
  },
  {
    dates:'Aug 2024 — Feb 2025', company:'Proto Corp Pvt Ltd', location:'Remote from Australia',
    title:'ML Engineer Intern — Computer Vision & MLOps',
    bullets:[
      'Collected, cleaned, and annotated 3,500+ construction defect images across 5 categories using pixel-level polygon segmentation in Roboflow',
      'Trained and comparatively evaluated YOLOv8m-seg, YOLOv9c-seg, YOLOv11m-seg, and Detectron2 Mask R-CNN; selected YOLOv8m-seg for production',
      'Built FastAPI inference services exposing REST endpoints for prediction, segmentation coordinate extraction, and JSON/ZIP outputs',
      'Developed Streamlit application for batch uploads, real-time segmentation visualisation, and multi-model selection by non-technical stakeholders',
      'Converted complex 3D construction analysis into scalable 2D patch-based CV workflows improving tractability and performance',
      'Maintained continuous dataset versioning, annotation pipelines, and retraining workflows across the full ML lifecycle',
    ],
    stack:['Python','PyTorch','YOLOv8m-seg','YOLOv9c-seg','YOLOv11m-seg','Detectron2','Mask R-CNN','Roboflow','FastAPI','Streamlit','Open3D','Trimesh','NVIDIA GPUs'],
  },
  {
    dates:'May 2018 — Sep 2019', company:'Wipro Technologies', location:'India',
    title:'Project Engineer — IT Operations & SAP PM Support',
    bullets:[
      'Monitored SAP Plant Maintenance dashboards identifying equipment failures, notification issues, and maintenance backlogs across UK industrial plants',
      'Triaged support tickets by severity and escalation pathways; led four-member team to consistently meet SLA targets',
      'Resolved SAP PM incidents involving maintenance notifications, equipment master records, and work order updates',
      'Coordinated with onsite UK engineers and SAP teams for advanced troubleshooting and root cause resolution',
      'Maintained documentation including root cause analyses and knowledge base materials reducing repeated escalations',
    ],
    stack:['SAP PM','Ticketing Systems','Root Cause Analysis','SLA Management','Enterprise Operations Support'],
  },
];

const PROJECTS = [
  {
    n:'01', title:'Autonomous UAV Object Detection', sub:'Disaster Response Navigation System',
    desc:'Built an autonomous drone navigation system combining EGO-Planner obstacle avoidance with YOLO-based real-time object detection — full end-to-end from design to deployment. Integrated ArduPilot SITL flight controller with Gazebo for hardware-in-the-loop testing and validation. Developed modular ROS2 architecture connecting perception, planning, and control. Replaced default feature tracking with SuperPoint achieving ~2,000 features per frame vs the original 5.',
    highlight:'mAP50: 0.642 on VisDrone · ~2,000 features/frame with SuperPoint · Full HIL via ArduPilot SITL + Gazebo',
    stack:['ROS2','EGO-Planner','VINS-Fusion','SuperPoint','YOLOv12s','YOLOv5s','MAVROS','ArduPilot SITL','Gazebo','Kalibr','Python','Linux'],
  },
  {
    n:'02', title:'Construction Defect Segmentation & 3D Overlay', sub:'Infrastructure Inspection CV Pipeline',
    desc:'Developed complete CV segmentation pipeline for identifying construction defects from high-resolution site imagery. Implemented FastAPI and Streamlit deployment architecture for scalable inference and downstream 3D overlay. Annotated 3,500+ images at pixel-level precision across 5 defect categories. Comparative evaluation across YOLO variants and Mask R-CNN determined optimal production model. Maintained continuous retraining and dataset versioning workflows.',
    highlight:'YOLOv8m-seg selected over YOLOv9c, YOLOv11m & Detectron2 Mask R-CNN · Production deployed · 3,500+ images',
    stack:['Python','PyTorch','YOLOv8m-seg','YOLOv9c-seg','YOLOv11m-seg','Detectron2','FastAPI','Streamlit','Roboflow','Open3D','Trimesh','NVIDIA GPUs'],
  },
  {
    n:'03', title:'Embedded Neural Network on STM32', sub:'On-Device AI — No Cloud Required',
    desc:'Deployed a deep learning food classification model directly onto STM32H747I-DISCO microcontroller achieving 97% accuracy across 18 categories — fully on-device with no cloud dependency. Applied model compression and weight quantisation using STM32CubeMX and X-CUBE-AI to fit within hardware memory constraints (~3× compression). Validated with onboard camera (B-CAMS-OMV) in real-time at ~11.2 FPS.',
    highlight:'97% accuracy · 18 food classes · 81ms inference (~11.2 FPS) · ~3× weight compression · Fully on-device',
    stack:['STM32H747I-DISCO','STM32CubeMX','X-CUBE-AI','C/C++','Keras','IAR Embedded Workbench','STM32CubeProgrammer'],
  },
  {
    n:'04', title:"Alzheimer's Disease Progression Prediction", sub:'MEG Neurological Signal Classification',
    desc:"Built an end-to-end deep learning pipeline for predicting Alzheimer's progression from multi-channel MEG time-series data. Applied transfer learning with AlexNet, ResNet, and GoogLeNet achieving 81% accuracy. Engineered feature extraction converting MEG signals into 2D representations for SVM and LDA classification. Used leave-one-patient-out cross-validation to prevent data leakage. Achieved AUC of 0.74 for early-stage diagnosis.",
    highlight:'81% accuracy · AUC 0.74 early-stage detection · Transfer learning: AlexNet, ResNet, GoogLeNet · LOOCV',
    stack:['Python','PyTorch','TensorFlow','AlexNet','ResNet','GoogLeNet','Scikit-learn','SVM','LDA','NumPy','Pandas','Matplotlib'],
  },
  {
    n:'05', title:'Emotion-Responsive Autonomous Robot', sub:'Edge–Cloud CV System · 30/30 Cum Laude',
    desc:'Designed and built a 4-wheel autonomous robot from scratch: Arduino hardware, custom PCB, and firmware. Developed hybrid edge–cloud architecture with real-time facial emotion recognition (TensorFlow CNN on PC) controlling the robot via Bluetooth (HC-06). Trained CNN (4.47M parameters) on FER-2013 achieving 61–62% accuracy across 7 emotion classes. Implemented dual-mode autonomy: light-following and emotion-driven interaction with speech synthesis.',
    highlight:'61–62% accuracy · 7 emotion classes · 4.47M parameters · FER-2013 · Graded 30/30 Cum Laude — MSc Mechatronics',
    stack:['Python','TensorFlow/Keras','OpenCV','Arduino C++','Bluetooth HC-06','pyserial','pyttsx3','L298N','Custom PCB'],
  },
];

const EDUCATION = [
  { year:'2025', degree:'Master of Artificial Intelligence & Machine Learning', school:'University of Adelaide, Australia', detail:'GPA 6.1 · Computer Vision · Deep Learning · NLP · MLOps · Autonomous Systems · Reinforcement Learning' },
  { year:'2022', degree:'Master of Science in Mechatronics Engineering',       school:'Tor Vergata University of Rome, Italy', detail:'Grade: 106/110 · Control Systems · MATLAB/Simulink · Embedded Systems · Autonomous Robotics · Signal Processing' },
  { year:'2018', degree:'Bachelor of Technology in Mechanical Engineering',    school:'KL University, India', detail:'First Class with Distinction · Mechanical Design · Engineering Fundamentals · C Programming · Java · Data Structures' },
];

const SKILLS = [
  { cat:'Computer Vision',       tags:['YOLO v5–v12','Mask R-CNN','Detectron2','OpenCV','Instance Segmentation','Object Detection','Transfer Learning','VisDrone','Roboflow'] },
  { cat:'ML Frameworks',         tags:['PyTorch','TensorFlow/Keras','Scikit-learn','Hugging Face','BERT','Ultralytics','AlexNet','ResNet','GoogLeNet'] },
  { cat:'Deployment & APIs',     tags:['FastAPI','Docker','REST APIs','CI/CD Pipelines','Streamlit','Azure','AWS','Linux','Git'] },
  { cat:'Robotics & Autonomous', tags:['ROS2 (Humble)','Gazebo','ArduPilot SITL','MAVROS','VINS-Fusion','EGO-Planner','SuperPoint','Kalibr'] },
  { cat:'Edge & Embedded AI',    tags:['NVIDIA Jetson Nano/Orin','STM32','X-CUBE-AI','STM32CubeMX','Model Quantisation','On-Device Inference','A100/P100 GPU'] },
  { cat:'Languages & Data',      tags:['Python','C/C++','Java','SQL','MATLAB/Simulink','Pandas','NumPy','Matplotlib','Tableau','SAP PM'] },
];

// ── Horizontal Carousel Section ───────────────────────────────────────────────
function CarouselSection({ id, eyebrow, heading, headingSpan, cards, renderCard }) {
  const [active, setActive]     = useState(0);
  const viewportRef             = useRef(null);
  const cardWidth               = useRef(0);
  const gapWidth                = useRef(0);

  const updateTranslate = useCallback((idx) => {
    const vp = viewportRef.current;
    if (!vp) return;
    const card = vp.children[0];
    if (!card) return;
    // cards are 100% of track width, no gap — simple 100% * idx offset
    const offset = idx * card.offsetWidth;
    vp.style.transform = `translateX(-${offset}px)`;
  }, []);

  useEffect(() => { updateTranslate(active); }, [active, updateTranslate]);

  // recalc on resize
  useEffect(() => {
    const onResize = () => updateTranslate(active);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [active, updateTranslate]);

  const goTo = (idx) => {
    const clamped = Math.max(0, Math.min(cards.length - 1, idx));
    setActive(clamped);
  };

  return (
    <div className={styles.snapSlot} id={id}>
    <section className={styles.snapSection}>
      <div className={styles.carouselLayout}>

        {/* header row */}
        <div className={styles.carouselHeader}>
          <div className={styles.carouselHeaderLeft}>
            <span className={styles.eyebrow}>{eyebrow}</span>
            <h2 className={styles.heading}>{heading}<br /><span>{headingSpan}</span></h2>
          </div>
          <div className={styles.carouselControls}>
            {/* dots */}
            <div className={styles.carouselDots}>
              {cards.map((_,i) => (
                <button key={i}
                  className={styles.carouselDot}
                  style={{ width: i === active ? 32 : 18 }}
                  onClick={() => goTo(i)}
                  aria-label={`Go to ${i+1}`}
                />
              ))}
            </div>
            <button className={styles.arrowBtn} onClick={() => goTo(active-1)} disabled={active===0} aria-label="Previous">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M10 3L5 8l5 5"/></svg>
            </button>
            <span className={styles.carouselCount}>{active+1} / {cards.length}</span>
            <button className={styles.arrowBtn} onClick={() => goTo(active+1)} disabled={active===cards.length-1} aria-label="Next">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 3l5 5-5 5"/></svg>
            </button>
          </div>
        </div>

        {/* carousel track */}
        <div className={styles.carouselTrack}>
          <div ref={viewportRef} className={styles.carouselViewport}>
            {cards.map((card, i) => (
              <div key={i} className={styles.carouselCard}>
                {renderCard(card, i)}
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Home() {
  const containerRef = useRef(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const isScrolling  = useRef(false);

  // snap scroll
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let touchY = 0;

    const snapTo = (idx) => {
      const target = Math.max(0, Math.min(SECTIONS_IDS.length - 1, idx));
      if (target === currentIdx || isScrolling.current) return;
      isScrolling.current = true;
      setCurrentIdx(target);
      document.getElementById(SECTIONS_IDS[target])
        ?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => { isScrolling.current = false; }, 900);
    };

    const onWheel = (e) => {
      e.preventDefault();
      if (!isScrolling.current) snapTo(currentIdx + (e.deltaY > 0 ? 1 : -1));
    };
    const onTouchStart = (e) => { touchY = e.touches[0].clientY; };
    const onTouchEnd   = (e) => {
      const diff = touchY - e.changedTouches[0].clientY;
      if (Math.abs(diff) > 40) snapTo(currentIdx + (diff > 0 ? 1 : -1));
    };

    el.addEventListener('wheel',      onWheel,      { passive: false });
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend',   onTouchEnd,   { passive: true });
    return () => {
      el.removeEventListener('wheel',      onWheel);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend',   onTouchEnd);
    };
  }, [currentIdx]);

  // cinematic focus — target the inner snapSection for blur/border
  useEffect(() => {
    SECTIONS_IDS.forEach((id, i) => {
      const slot = document.getElementById(id);
      if (!slot) return;
      // inner section is first child for slots; hero slot IS the section
      const panel = slot.querySelector(`.${styles.snapSection}`) || slot;
      const active = i === currentIdx;
      gsap.to(panel, {
        filter:   active ? 'blur(0px) brightness(1)' : 'blur(5px) brightness(0.35)',
        scale:    active ? 1 : 0.97,
        duration: 0.65, ease: 'power2.out',
      });
      if (active) panel.classList.add(styles.active);
      else        panel.classList.remove(styles.active);
    });
  }, [currentIdx]);

  const navigateTo = useCallback((idx) => {
    if (isScrolling.current) return;
    isScrolling.current = true;
    setCurrentIdx(idx);
    document.getElementById(SECTIONS_IDS[idx])
      ?.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => { isScrolling.current = false; }, 900);
  }, []);

  return (
    <div ref={containerRef} className={styles.container}>

      {/* HERO — full bleed, no trim */}
      <div className={styles.heroSlot} id="hero">
        <VideoIntro />
      </div>

      {/* ABOUT */}
      <div className={styles.snapSlot} id="about">
      <section className={styles.snapSection}>
        <div className={styles.sectionInner}>
          <div className={styles.aboutGrid}>
            <div className={styles.aboutLeft}>
              <span className={styles.eyebrow}>About</span>
              <h2 className={styles.heading}>Building things that<br /><span>actually work.</span></h2>
              <div className={styles.aboutBody}>
                <p>I'm Sri Krishna Kalyan Bandaru — ML Engineer with a Master of Artificial Intelligence &amp; Machine Learning from the University of Adelaide (GPA 6.1, 2025) and a prior Master's in Mechatronics Engineering from Tor Vergata, Rome (106/110).</p>
                <p>My background spans the full AI pipeline: dataset collection and annotation, model training and rigorous evaluation, production API deployment, and edge hardware integration. I've shipped CV systems for infrastructure inspection, autonomous UAV navigation, and on-device inference on microcontrollers.</p>
                <p>Full Australian working rights (Subclass 485). Open to ML Engineer, Data Scientist, Computer Vision, and Robotics/Autonomous Systems roles — anywhere in Australia.</p>
              </div>
            </div>
            <div className={styles.statsGrid}>
              {[
                { num:'6.1',   label:'GPA — Master of AI & ML, University of Adelaide 2025' },
                { num:'3.5K+', label:'Images annotated in production CV pipeline (Proto Corp)' },
                { num:'0.642', label:'mAP50 on VisDrone aerial detection with YOLOv12s' },
                { num:'97%',   label:'On-device accuracy — STM32 neural net, 18 classes' },
              ].map(s=>(
                <div key={s.num} className={styles.statCard}>
                  <div className={styles.statNum}>{s.num}</div>
                  <div className={styles.statLabel}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      </div>

      {/* SKILLS */}
      <div className={styles.snapSlot} id="skills">
      <section className={styles.snapSection}>
        <div className={styles.sectionInner}>
          <span className={styles.eyebrow}>Technical Skills</span>
          <h2 className={styles.heading}>The stack<br /><span>I ship with.</span></h2>
          <div className={styles.skillsGrid}>
            {SKILLS.map(({cat,tags})=>(
              <div key={cat} className={styles.skillCard}>
                <div className={styles.skillCat}>{cat}</div>
                <div className={styles.skillTags}>
                  {tags.map(t=><span key={t} className={styles.skillTag}>{t}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      </div>

      {/* EXPERIENCE — horizontal carousel */}
      <CarouselSection
        id="experience" eyebrow="Experience" heading="Where I've" headingSpan="shipped it."
        cards={EXPERIENCE}
        renderCard={(item) => (
          <>
            <div className={styles.expCardMeta}>
              <span className={styles.expDates}>{item.dates}</span>
              <span className={styles.expCompany}>{item.company}</span>
              <span className={styles.expLocation}>{item.location}</span>
            </div>
            <div className={styles.expTitle}>{item.title}</div>
            <ul className={styles.expBullets}>
              {item.bullets.map((b,i)=><li key={i}>{b}</li>)}
            </ul>
            <div className={styles.expTech}>
              {item.stack.map(t=><span key={t} className={styles.techTag}>{t}</span>)}
            </div>
          </>
        )}
      />

      {/* PROJECTS — horizontal carousel */}
      <CarouselSection
        id="projects" eyebrow="Projects" heading="What I've" headingSpan="built."
        cards={PROJECTS}
        renderCard={(item) => (
          <>
            <div className={styles.projNum}>{item.n}</div>
            <h3 className={styles.projTitle}>{item.title}</h3>
            <div className={styles.projSub}>{item.sub}</div>
            <p className={styles.projDesc}>{item.desc}</p>
            <p className={styles.projHighlight}>{item.highlight}</p>
            <div className={styles.projStack}>
              {item.stack.map(t=><span key={t} className={styles.projTag}>{t}</span>)}
            </div>
          </>
        )}
      />

      {/* EDUCATION — horizontal carousel */}
      <CarouselSection
        id="education" eyebrow="Education" heading="The" headingSpan="foundations."
        cards={EDUCATION}
        renderCard={(item) => (
          <div className={styles.eduCard}>
            <div className={styles.eduYear}>{item.year}</div>
            <div className={styles.eduDegree}>{item.degree}</div>
            <div className={styles.eduSchool}>{item.school}</div>
            <div className={styles.eduDetail}>{item.detail}</div>
          </div>
        )}
      />

      {/* CONTACT */}
      <div className={styles.snapSlot} id="contact">
      <section className={styles.snapSection}>
        <div className={`${styles.sectionInner} ${styles.contactInner}`}>
          <span className={styles.eyebrow}>Get in Touch</span>
          <h2 className={styles.contactHeading}>Let's build<br /><span>something.</span></h2>
          <p className={styles.contactSub}>
            Open to ML Engineer, Data Scientist, Computer Vision, and Robotics/Autonomous Systems roles — anywhere in Australia. Full working rights (Subclass 485).
          </p>
          <div className={styles.contactLinks}>
            <a href="mailto:srikrishnakalyan5@gmail.com" className={styles.contactLink}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3h12a1 1 0 011 1v8a1 1 0 01-1 1H2a1 1 0 01-1-1V4a1 1 0 011-1zm6 5l5-3.5H3L8 8zm0 1.5L3 6v6h10V6L8 9.5z"/></svg>
              srikrishnakalyan5@gmail.com
            </a>
            <a href="tel:0430037548" className={styles.contactLink}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M3.5 1A1.5 1.5 0 002 2.5v1C2 9.9 7.1 15 13.5 15h1a1.5 1.5 0 001.5-1.5v-2a1.5 1.5 0 00-1.5-1.5h-2a1.5 1.5 0 00-1.5 1.5v.25A7.25 7.25 0 014.75 5.5H5A1.5 1.5 0 006.5 4V2A1.5 1.5 0 005 .5H3.5z"/></svg>
              0430 037 548
            </a>
            <a href="https://www.linkedin.com/in/sri-krishna-kalyan-bandaru-766bb112a"
              target="_blank" rel="noopener noreferrer" className={styles.contactLink}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M0 1.5A1.5 1.5 0 011.5 0h13A1.5 1.5 0 0116 1.5v13a1.5 1.5 0 01-1.5 1.5h-13A1.5 1.5 0 010 14.5v-13zM5 4.5a1 1 0 10-2 0 1 1 0 002 0zm-.25 2h-1.5v6h1.5v-6zm2.25 0h-1.5v6h1.5V8.5c0-1 .75-1.5 1.5-1.5s1.5.5 1.5 1.5V12.5h1.5V8.25C10.5 6.75 9.5 6 8.25 6c-.75 0-1.25.25-1.25.25V6.5z"/></svg>
              LinkedIn
            </a>
            <a href="https://github.com/SriKrishnaKalyan"
              target="_blank" rel="noopener noreferrer" className={styles.contactLink}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
              GitHub
            </a>
            <a href="/SriKrishnaKalyan_Resume.pdf"
              download="SriKrishnaKalyan_Resume.pdf"
              className={styles.contactLinkAccent}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M.5 9.9a.5.5 0 01.5.5v2.5a1 1 0 001 1h12a1 1 0 001-1v-2.5a.5.5 0 011 0v2.5a2 2 0 01-2 2H2a2 2 0 01-2-2v-2.5a.5.5 0 01.5-.5z"/>
                <path d="M7.646 11.854a.5.5 0 00.708 0l3-3a.5.5 0 00-.708-.708L8.5 10.293V1.5a.5.5 0 00-1 0v8.793L5.354 8.146a.5.5 0 10-.708.708l3 3z"/>
              </svg>
              Download Resume
            </a>
            <span className={styles.contactBadge}>📍 Adelaide, SA · Full Working Rights (485)</span>
          </div>
        </div>
      </section>
      </div>

      <ScrollNavigator
        currentIdx={currentIdx}
        total={SECTIONS_IDS.length}
        onNavigate={navigateTo}
      />
    </div>
  );
}
