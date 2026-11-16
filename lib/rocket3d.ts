import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { PARTS, OFFSETS, EXPLODED_BOX, type Part } from "@/components/Rocket";

/*
  The story rocket in 3D. Built in the same units as the flat drawing (x 0 to 200,
  y 0 down to 491, centre line x = 100), so it fills the same exploded box, comes apart
  by the same offsets and lines up with every dock and part label.

  The canvas is drawn at the size of the rocket's box only, and the page moves and
  rotates it with CSS like the flat drawing, so WebGL never paints the whole screen.
*/

export type Rocket3D = {
  setExplode(e: number): void;
  setActive(i: number | null): void;
  setFlying(on: boolean): void;
  setVisible(on: boolean): void;
  resize(width: number, height: number): void;
  destroy(): void;
};

const R = 42; // body radius, half the drawing's 84 width

const MIDY = EXPLODED_BOX.y + EXPLODED_BOX.h / 2;

// Drawing units to 3D: x right, y up, centred on the exploded box.
const Y = (svgY: number) => -(svgY - MIDY);

function accentColour() {
  const v = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
  return new THREE.Color(v || "#1c8696");
}

/* Label around the payload: white with two accent bands and the 1% mark, wrapped round the body. */
function payloadTexture(accent: THREE.Color) {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 512;
  const g = c.getContext("2d")!;
  g.fillStyle = "#f6f8f5";
  g.fillRect(0, 0, c.width, c.height);
  g.fillStyle = `#${accent.getHexString()}`;
  // Bands at the drawing's y 248 to 258 and 332 to 337, of a part 230 to 350 tall.
  g.fillRect(0, ((248 - 230) / 120) * 512, c.width, (10 / 120) * 512);
  g.fillRect(0, ((332 - 230) / 120) * 512, c.width, (5 / 120) * 512);
  g.fillStyle = "#0f1c16";
  g.font = "300 150px Georgia, serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  // Mark on the front, which faces the camera at u = 0.25 on a three.js cylinder.
  g.fillText("1%", c.width * 0.25, ((300 - 230) / 120) * 512);
  g.fillText("1%", c.width * 0.75, ((300 - 230) / 120) * 512);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/* Fuel tank: light grey with three dashed seams. */
function tankTexture() {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = "#dfe6e0";
  g.fillRect(0, 0, c.width, c.height);
  g.strokeStyle = "rgba(15,28,22,0.32)";
  g.lineWidth = 3;
  g.setLineDash([10, 12]);
  for (const y of [370, 394, 418]) {
    const py = ((y - 348) / 92) * 256;
    g.beginPath();
    g.moveTo(0, py);
    g.lineTo(c.width, py);
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* Flame: a soft cone from pale yellow to orange, fading out at the tip. */
function flameTexture() {
  const c = document.createElement("canvas");
  c.width = 16;
  c.height = 256;
  const g = c.getContext("2d")!;
  const grad = g.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, "rgba(255,246,214,1)");
  grad.addColorStop(0.3, "rgba(255,181,71,0.95)");
  grad.addColorStop(1, "rgba(255,90,42,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 16, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* A cylinder between two drawing y values, standing on the centre line. */
function band(top: number, bottom: number, rTop: number, rBottom: number, mat: THREE.Material, seg = 64) {
  const h = bottom - top;
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBottom, h, seg, 1, true), mat);
  m.position.y = Y(top + h / 2);
  return m;
}

export function createRocket3D(canvas: HTMLCanvasElement, opts: { reduce: boolean }): Rocket3D | null {
  const phone = window.matchMedia("(max-width: 720px)").matches;
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !phone, powerPreference: "low-power" });
  } catch {
    return null;
  }
  // Phones draw at a lower resolution; the rocket is small there and the CPU is the limit.
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, phone ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  // Neutral tone mapping keeps the brand colours true.
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1;

  const scene = new THREE.Scene();
  // Soft studio reflections without loading any files.
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();

  const half = { w: EXPLODED_BOX.w / 2, h: EXPLODED_BOX.h / 2 };
  const camera = new THREE.OrthographicCamera(-half.w, half.w, half.h, -half.h, -1000, 1000);
  camera.position.set(0, 0, 500);

  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(-220, 260, 320);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xcfe9ec, 0.9);
  rim.position.set(260, -80, -200);
  scene.add(rim);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a9a92, 0.5));

  let accent = accentColour();
  const deep = () => accent.clone().multiplyScalar(0.45);

  // Materials. Each part has its own copies so one part can dim while the others stay lit.
  const make = {
    body: () => new THREE.MeshStandardMaterial({ color: 0xf4f7f3, roughness: 0.32, metalness: 0.15 }),
    accent: () => new THREE.MeshStandardMaterial({ color: accent, roughness: 0.35, metalness: 0.25 }),
    dark: () => new THREE.MeshStandardMaterial({ color: 0x232c28, roughness: 0.45, metalness: 0.7 }),
    glass: () => new THREE.MeshPhysicalMaterial({ color: 0x0b1612, roughness: 0.05, metalness: 0.2, clearcoat: 1, clearcoatRoughness: 0.05 }),
  };
  const accentMats: THREE.MeshStandardMaterial[] = [];
  const trackAccent = <M extends THREE.MeshStandardMaterial>(m: M) => {
    accentMats.push(m);
    return m;
  };

  const root = new THREE.Group();
  const spin = new THREE.Group();
  root.add(spin);
  scene.add(root);
  // A three-quarter look from slightly above, so the body reads as round.
  root.rotation.x = 0.16;

  const parts = new Map<Part, THREE.Group>();
  const partMats = new Map<Part, THREE.Material[]>();
  const add = (part: Part, ...meshes: THREE.Object3D[]) => {
    const g = new THREE.Group();
    meshes.forEach((m) => g.add(m));
    spin.add(g);
    parts.set(part, g);
    const mats: THREE.Material[] = [];
    g.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh) mats.push(...(Array.isArray(mesh.material) ? mesh.material : [mesh.material]));
    });
    mats.forEach((m) => (m.transparent = true));
    partMats.set(part, mats);
  };

  // Nose: an ogive from the body's edge to a point, with an accent tip.
  {
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= 24; i++) {
      const t = i / 24;
      const y = 130 - t * 124; // 130 up to 6
      const r = R * Math.sqrt(1 - Math.pow(t, 1.6));
      pts.push(new THREE.Vector2(Math.max(0.01, r), Y(y)));
    }
    const nose = new THREE.Mesh(new THREE.LatheGeometry(pts, 64), make.body());
    const tipPts: THREE.Vector2[] = [];
    for (let i = 0; i <= 12; i++) {
      const t = i / 12;
      const y = 44 - t * 38;
      const r = R * Math.sqrt(1 - Math.pow((130 - y) / 124, 1.6)) + 0.6;
      tipPts.push(new THREE.Vector2(Math.max(0.01, r), Y(y)));
    }
    const tip = new THREE.Mesh(new THREE.LatheGeometry(tipPts, 64), trackAccent(make.accent()));
    add("nose", nose, tip);
  }

  // Crew capsule: body with a glass porthole in an accent ring, and rivets.
  {
    const body = band(128, 232, R, R, make.body());
    const ring = new THREE.Mesh(new THREE.TorusGeometry(27, 4.5, 20, 64), trackAccent(make.accent()));
    ring.position.set(0, Y(180), R - 1);
    const glass = new THREE.Mesh(new THREE.SphereGeometry(25, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), make.glass());
    glass.rotation.x = Math.PI / 2;
    glass.scale.set(1, 0.35, 1);
    glass.position.set(0, Y(180), R - 4);
    const rivets = new THREE.Group();
    const rivetMat = make.dark();
    for (const y of [140, 220]) {
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2;
        const r = new THREE.Mesh(new THREE.SphereGeometry(1.8, 8, 6), rivetMat);
        r.position.set(Math.sin(a) * R, Y(y), Math.cos(a) * R);
        rivets.add(r);
      }
    }
    add("capsule", body, ring, glass, rivets);
  }

  // Payload: the labelled section with the 1% mark.
  const payloadMat = new THREE.MeshStandardMaterial({ map: payloadTexture(accent), roughness: 0.35, metalness: 0.1 });
  add("payload", band(230, 350, R, R, payloadMat));

  // Fuel tank: brushed grey with seams.
  add("tank", band(348, 440, R - 0.5, R - 0.5, new THREE.MeshStandardMaterial({ map: tankTexture(), roughness: 0.55, metalness: 0.45 })));

  // Fins: four, all the way round. Each moves straight out from the body when the rocket opens.
  const fins: THREE.Mesh[] = [];
  {
    const shape = new THREE.Shape();
    // Drawing's fin, as distance from the body (x) and height (y): body edge 388 to 452, tip 466 to 494.
    shape.moveTo(0, Y(388));
    shape.lineTo(44, Y(466));
    shape.lineTo(44, Y(494));
    shape.lineTo(0, Y(452));
    shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 5, bevelEnabled: true, bevelSize: 1.2, bevelThickness: 1.2, bevelSegments: 2 });
    geo.translate(0, 0, -2.5);
    const finMat = trackAccent(make.accent());
    const group: THREE.Object3D[] = [];
    for (let k = 0; k < 4; k++) {
      const holder = new THREE.Group();
      holder.rotation.y = (k / 4) * Math.PI * 2 + Math.PI / 4;
      const fin = new THREE.Mesh(geo, finMat);
      fin.position.x = R - 2;
      holder.add(fin);
      fins.push(fin);
      group.push(holder);
    }
    const rod = band(426, 492, 5, 5, new THREE.MeshStandardMaterial({ color: deep(), roughness: 0.4 }), 16);
    add("fins", ...group, rod);
  }

  // Engine: a flared metal nozzle with a dark ring.
  {
    const bell = band(438, 486, 30, R, make.dark());
    const lip = band(484, 491, R + 2, R + 2, make.dark());
    const cap = new THREE.Mesh(new THREE.CircleGeometry(R + 2, 48), make.dark());
    cap.rotation.x = Math.PI / 2;
    cap.position.y = Y(491);
    add("engine", bell, lip, cap);
  }

  // Close the open cylinder ends that would show when the rocket comes apart.
  for (const [part, y, r] of [
    ["capsule", 128, R],
    ["capsule", 232, R],
    ["payload", 230, R],
    ["payload", 350, R],
    ["tank", 348, R - 0.5],
    ["tank", 440, R - 0.5],
  ] as [Part, number, number][]) {
    const disc = new THREE.Mesh(new THREE.CircleGeometry(r, 48), new THREE.MeshStandardMaterial({ color: 0xcfd8d2, roughness: 0.6, transparent: true }));
    disc.rotation.x = y === 128 || y === 230 || y === 348 ? -Math.PI / 2 : Math.PI / 2;
    disc.position.y = Y(y);
    parts.get(part)!.add(disc);
    partMats.get(part)!.push(disc.material as THREE.Material);
  }

  // Flame below the engine, glowing, not lit.
  const flameMat = new THREE.MeshBasicMaterial({ map: flameTexture(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const flame = new THREE.Mesh(new THREE.ConeGeometry(34, 150, 32, 1, true), flameMat);
  flame.rotation.x = Math.PI; // point down
  flame.position.y = Y(490 + 75);
  const inner = new THREE.Mesh(new THREE.ConeGeometry(18, 90, 24, 1, true), flameMat);
  inner.rotation.x = Math.PI;
  inner.position.y = Y(490 + 45);
  const flameGroup = new THREE.Group();
  flameGroup.add(flame, inner);
  spin.add(flameGroup);

  // Follow the Health and Wealth colour when the side changes.
  const mo = new MutationObserver(() => {
    accent = accentColour();
    accentMats.forEach((m) => m.color.copy(accent));
    const old = payloadMat.map;
    payloadMat.map = payloadTexture(accent);
    payloadMat.needsUpdate = true;
    old?.dispose();
    dirty = true;
  });
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-mode"] });

  // State from the page.
  let explode = 0;
  let active: number | null = null;
  let flying = false;
  let visible = true;
  let dirty = true;
  let raf = 0;
  let last = performance.now();
  let flameLevel = 0.25;
  let lastDraw = 0;

  const apply = () => {
    PARTS.forEach((part) => {
      parts.get(part)!.position.y = -OFFSETS[part] * explode;
      const dim = active !== null && PARTS[active] !== part;
      partMats.get(part)!.forEach((m) => (m.opacity = dim ? 0.4 : 1));
    });
    fins.forEach((f) => (f.position.x = R - 2 + 34 * explode));
  };

  const loop = (now: number) => {
    raf = 0;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!visible || document.hidden) return;

    // Turn slowly on its own axis; faster in flight. Still under reduced motion.
    if (!opts.reduce) spin.rotation.y += dt * (flying ? 0.9 : 0.35);
    else spin.rotation.y = 0.5;

    // Flame: full in flight, a low idle glow on the pad, gone while the rocket is apart.
    const target = (flying ? 1 : 0.25) * Math.max(0, 1 - explode / 0.4);
    flameLevel += (target - flameLevel) * (1 - Math.exp(-8 * dt));
    const flicker = opts.reduce ? 1 : 0.92 + Math.sin(now / 60) * 0.05 + Math.sin(now / 23) * 0.03;
    flameGroup.visible = flameLevel > 0.02;
    flameMat.opacity = flameLevel;
    flameGroup.scale.set(1, flicker * (0.7 + 0.3 * flameLevel), 1);
    flameGroup.position.y = -OFFSETS.engine * explode;

    // At rest the slow turn is drawn at about 30 frames a second, leaving the rest for scrolling.
    const idle = !flying && !dirty;
    if (idle && now - lastDraw < 32) {
      raf = requestAnimationFrame(loop);
      return;
    }
    lastDraw = now;
    if (dirty) {
      apply();
      dirty = false;
    }
    renderer.render(scene, camera);
    if (!opts.reduce || flameLevel > 0.02) raf = requestAnimationFrame(loop);
  };
  const kick = () => {
    if (!raf) {
      last = performance.now();
      raf = requestAnimationFrame(loop);
    }
  };
  const onVis = () => !document.hidden && kick();
  document.addEventListener("visibilitychange", onVis);

  return {
    setExplode(e) {
      if (Math.abs(e - explode) < 0.0005) return;
      explode = e;
      dirty = true;
      kick();
    },
    setActive(i) {
      if (i === active) return;
      active = i;
      dirty = true;
      kick();
    },
    setFlying(on) {
      flying = on;
      kick();
    },
    setVisible(on) {
      if (on === visible) return;
      visible = on;
      if (on) kick();
    },
    resize(width, height) {
      renderer.setSize(width, height, false);
      dirty = true;
      kick();
    },
    destroy() {
      cancelAnimationFrame(raf);
      mo.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.isMesh) {
          m.geometry.dispose();
          (Array.isArray(m.material) ? m.material : [m.material]).forEach((mt) => {
            (mt as THREE.MeshStandardMaterial).map?.dispose();
            mt.dispose();
          });
        }
      });
      renderer.dispose();
    },
  };
}


