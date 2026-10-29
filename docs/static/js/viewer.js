import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";

const MESH_ROOT = "static/meshes/";
const BODY_COLOR = new THREE.Color().setRGB(222 / 255, 224 / 255, 228 / 255, THREE.SRGBColorSpace);
const SEQUENCES = {
  dress00123: { tab: "4D-DRESS · trousers", title: "4D-DRESS 00123, trousers.", desc: "Six frames evenly spaced between 15 and 155, first seen from Cam013." },
  actor04: { tab: "Actor04 · shirt", title: "ActorsHQ Actor04, shirt.", desc: "Six frames between 160 and 760, first seen from Cam107." },
};
const PLAY_DELAY = 900;
const SHELL = 0.001;

const draco = new DRACOLoader();
draco.setDecoderPath("https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/libs/draco/");
const geometries = new Map();

function loadGeometry(path, shell = 0) {
  if (!geometries.has(path)) {
    const pending = draco.loadAsync(MESH_ROOT + path).then((geometry) => {
      geometry.computeVertexNormals();
      if (shell) {
        const position = geometry.attributes.position;
        const normal = geometry.attributes.normal;
        for (let i = 0; i < position.count; i++) {
          position.setXYZ(i, position.getX(i) + normal.getX(i) * shell, position.getY(i) + normal.getY(i) * shell, position.getZ(i) + normal.getZ(i) * shell);
        }
      }
      geometry.computeBoundingSphere();
      return geometry;
    });
    pending.catch(() => geometries.delete(path));
    geometries.set(path, pending);
  }
  return geometries.get(path);
}

let manifestPromise;
function loadManifest() {
  manifestPromise ??= fetch(MESH_ROOT + "manifest.json", { cache: "no-cache" }).then((response) => {
    if (!response.ok) throw new Error(`manifest ${response.status}`);
    return response.json();
  });
  return manifestPromise;
}

function srgb([r, g, b]) {
  return new THREE.Color().setRGB(r / 255, g / 255, b / 255, THREE.SRGBColorSpace);
}

function tabBar(container, labels, onSelect, active) {
  container.replaceChildren();
  const buttons = labels.map((label, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("role", "tab");
    button.textContent = label;
    button.addEventListener("click", () => {
      buttons.forEach((b) => {
        b.classList.toggle("is-active", b === button);
        b.setAttribute("aria-selected", b === button ? "true" : "false");
      });
      onSelect(index);
    });
    return button;
  });
  container.append(...buttons);
  buttons[active].classList.add("is-active");
  buttons[active].setAttribute("aria-selected", "true");
}

class MultiView {
  constructor(card) {
    this.card = card;
    this.stage = card.querySelector(".mv-stage");
    this.grid = card.querySelector(".mv-grid");
    this.canvas = card.querySelector(".mv-canvas");
    this.message = card.querySelector(".mv-message");
    this.cells = [];
    this.pending = false;
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);
    this.camera = new THREE.PerspectiveCamera(28, 0.75, 0.01, 50);
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.12;
    this.controls.addEventListener("change", () => this.requestRender());
    this.garmentMaterial = new THREE.MeshStandardMaterial({ roughness: 0.62, metalness: 0, side: THREE.DoubleSide });
    this.bodyMaterial = new THREE.MeshStandardMaterial({ color: BODY_COLOR, roughness: 0.8, metalness: 0 });
    this.home = null;
    this.engaged = false;
    this.stage.addEventListener("pointerdown", () => {
      this.engaged = true;
      card.classList.add("is-engaged");
    });
    this.stage.addEventListener("pointerleave", () => (this.engaged = false));
    this.stage.addEventListener("wheel", (event) => (this.controls.enableZoom = this.engaged || event.ctrlKey || event.metaKey), { capture: true, passive: true });
    new ResizeObserver(() => this.requestRender()).observe(this.stage);
    card.querySelectorAll('[data-role="body"] button').forEach((button) => {
      button.addEventListener("click", () => {
        card.querySelectorAll('[data-role="body"] button').forEach((b) => b.classList.toggle("is-active", b === button));
        this.setBodyMode(button.dataset.mode);
      });
    });
    card.querySelector('[data-role="reset"]').addEventListener("click", () => this.resetView());
    this.setBodyMode("solid");
  }

  setPanels(panels) {
    for (const cell of this.cells) cell.element.remove();
    this.cells = panels.map((panel) => {
      const element = document.createElement("div");
      element.className = "mv-cell" + (panel.ours ? " is-ours" : "");
      const label = document.createElement("span");
      label.className = "mv-label";
      label.textContent = panel.label;
      element.append(label);
      this.grid.append(element);
      const scene = new THREE.Scene();
      scene.add(new THREE.HemisphereLight(0xffffff, 0xa9aebb, 1.7));
      const key = new THREE.DirectionalLight(0xffffff, 1.9);
      scene.add(key, key.target);
      const garment = new THREE.Mesh(new THREE.BufferGeometry(), this.garmentMaterial);
      const body = new THREE.Mesh(new THREE.BufferGeometry(), this.bodyMaterial);
      body.renderOrder = 1;
      scene.add(garment, body);
      return { element, label, scene, key, garment, body };
    });
    this.applyBodyMode();
  }

  setColor(rgb) {
    this.garmentMaterial.color.copy(srgb(rgb));
    this.requestRender();
  }

  setBodyMode(mode) {
    this.bodyMode = mode;
    this.applyBodyMode();
  }

  applyBodyMode() {
    const xray = this.bodyMode === "xray";
    this.bodyMaterial.transparent = xray;
    this.bodyMaterial.opacity = xray ? 0.32 : 1;
    this.bodyMaterial.depthWrite = !xray;
    this.bodyMaterial.needsUpdate = true;
    for (const cell of this.cells) cell.body.visible = this.bodyMode !== "hidden";
    this.requestRender();
  }

  setLoading(loading) {
    for (const cell of this.cells) cell.element.classList.toggle("is-loading", loading);
  }

  showMessage(text) {
    this.message.textContent = text;
    this.message.hidden = !text;
  }

  cellAspect() {
    const rect = this.cells[0]?.element.getBoundingClientRect();
    return rect && rect.height > 0 ? rect.width / rect.height : 0.75;
  }

  fit(sphere, view) {
    const direction = new THREE.Vector3().fromArray(view.target).sub(new THREE.Vector3().fromArray(view.position)).normalize();
    const aspect = this.cellAspect();
    const vertical = THREE.MathUtils.degToRad(this.camera.fov);
    const horizontal = 2 * Math.atan(Math.tan(vertical / 2) * aspect);
    const distance = (sphere.radius * 1.12) / Math.sin(Math.min(vertical, horizontal) / 2);
    this.home = {
      target: sphere.center.clone(),
      position: sphere.center.clone().addScaledVector(direction, -distance),
      distance,
    };
    this.resetView();
  }

  resetView() {
    if (!this.home) return;
    this.camera.position.copy(this.home.position);
    this.camera.near = this.home.distance / 40;
    this.camera.far = this.home.distance * 40;
    this.controls.target.copy(this.home.target);
    this.controls.minDistance = this.home.distance * 0.2;
    this.controls.maxDistance = this.home.distance * 4;
    this.controls.update();
    this.requestRender();
  }

  requestRender() {
    if (this.pending) return;
    this.pending = true;
    requestAnimationFrame(() => {
      this.pending = false;
      this.controls.update();
      this.draw();
    });
  }

  draw() {
    const width = this.stage.clientWidth;
    const height = this.stage.clientHeight;
    if (!width || !height) return;
    const size = this.renderer.getSize(new THREE.Vector2());
    if (size.x !== width || size.y !== height) this.renderer.setSize(width, height, false);
    const frame = this.canvas.getBoundingClientRect();
    this.renderer.setScissorTest(false);
    this.renderer.clear();
    this.renderer.setScissorTest(true);
    const right = new THREE.Vector3().crossVectors(this.camera.getWorldDirection(new THREE.Vector3()), this.camera.up).normalize();
    const reach = this.camera.position.distanceTo(this.controls.target);
    for (const cell of this.cells) {
      const rect = cell.element.getBoundingClientRect();
      const left = rect.left - frame.left;
      const bottom = frame.bottom - rect.bottom;
      this.camera.aspect = rect.width / rect.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setViewport(left, bottom, rect.width, rect.height);
      this.renderer.setScissor(left, bottom, rect.width, rect.height);
      cell.key.position.copy(this.camera.position).addScaledVector(this.camera.up, reach * 0.6).addScaledVector(right, -reach * 0.35);
      cell.key.target.position.copy(this.controls.target);
      cell.key.target.updateMatrixWorld();
      this.renderer.render(cell.scene, this.camera);
    }
  }
}

class CompareViewer extends MultiView {
  constructor(card, manifest) {
    super(card);
    this.sequences = manifest.sequences;
    this.ribbon = card.querySelector('[data-role="ribbon"]');
    this.playButton = card.querySelector('[data-role="play"]');
    this.title = card.querySelector('[data-role="title"]');
    this.desc = card.querySelector('[data-role="desc"]');
    this.token = 0;
    this.playing = false;
    this.timer = null;
    tabBar(card.querySelector('[data-role="sequences"]'), this.sequences.map((s) => SEQUENCES[s.id]?.tab ?? s.label), (i) => this.selectSequence(i), 0);
    this.playButton.addEventListener("click", () => this.togglePlay());
    this.ribbon.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      this.step(event.key === "ArrowLeft" ? -1 : 1);
      this.segments[this.current].focus();
    });
    this.selectSequence(0);
  }

  selectSequence(index) {
    this.stop();
    this.sequence = this.sequences[index];
    const info = SEQUENCES[this.sequence.id] ?? { title: this.sequence.label, desc: "" };
    this.title.textContent = info.title;
    this.desc.textContent = info.desc;
    this.setPanels(this.sequence.methods.map((m) => ({ label: m.label, ours: m.id === "ours" })));
    this.setColor(this.sequence.color);
    this.buildRibbon();
    this.home = null;
    this.showFrame(0);
  }

  buildRibbon() {
    const count = this.sequence.frames.length;
    this.segments = this.sequence.frames.map((frame, i) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "seg";
      button.setAttribute("role", "tab");
      button.setAttribute("aria-label", `Frame ${frame.frame}`);
      button.style.setProperty("--i", i);
      button.style.setProperty("--n", count);
      button.style.setProperty("--dur", `${PLAY_DELAY}ms`);
      const track = document.createElement("span");
      track.className = "seg-track";
      const fill = document.createElement("span");
      fill.className = "seg-fill";
      track.append(fill);
      const label = document.createElement("span");
      label.className = "seg-label";
      label.textContent = frame.frame;
      button.append(track, label);
      button.addEventListener("click", () => {
        this.stop();
        this.showFrame(i);
      });
      return button;
    });
    this.ribbon.replaceChildren(...this.segments);
  }

  markRibbon(index) {
    this.current = index;
    this.segments.forEach((segment, i) => {
      segment.classList.toggle("is-past", i < index);
      segment.classList.toggle("is-current", i === index);
      segment.classList.toggle("is-waiting", i === index && this.playing);
      segment.classList.remove("is-running");
      segment.setAttribute("aria-selected", i === index ? "true" : "false");
      segment.tabIndex = i === index ? 0 : -1;
    });
  }

  async showFrame(index) {
    const token = ++this.token;
    const sequence = this.sequence;
    const frame = sequence.frames[index];
    this.markRibbon(index);
    this.setLoading(true);
    try {
      const loaded = await Promise.all(
        sequence.methods.map((m) => Promise.all([loadGeometry(frame.meshes[m.id].garment, SHELL), loadGeometry(frame.meshes[m.id].body)])),
      );
      if (token !== this.token) return;
      loaded.forEach(([garment, body], i) => {
        this.cells[i].garment.geometry = garment;
        this.cells[i].body.geometry = body;
      });
      this.index = index;
      this.setLoading(false);
      this.showMessage("");
      if (!this.home) {
        const ours = sequence.methods.findIndex((m) => m.id === "ours");
        this.fit(loaded[ours][0].boundingSphere, sequence.camera);
      }
      this.requestRender();
      this.prefetch(index + 1);
      if (this.playing) this.run();
    } catch (error) {
      if (token !== this.token) return;
      this.setLoading(false);
      this.showMessage("The meshes could not be loaded. Serve this page over HTTP to view them.");
    }
  }

  prefetch(index) {
    const frame = this.sequence.frames[index % this.sequence.frames.length];
    for (const m of this.sequence.methods) {
      loadGeometry(frame.meshes[m.id].garment, SHELL);
      loadGeometry(frame.meshes[m.id].body);
    }
  }

  step(delta) {
    this.stop();
    const count = this.sequence.frames.length;
    this.showFrame((((this.current ?? 0) + delta) % count + count) % count);
  }

  run() {
    const segment = this.segments[this.index];
    segment.classList.remove("is-waiting", "is-running");
    void segment.offsetWidth;
    segment.classList.add("is-running");
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      if (this.playing) this.showFrame((this.index + 1) % this.sequence.frames.length);
    }, PLAY_DELAY);
  }

  togglePlay() {
    if (this.playing) {
      this.stop();
      return;
    }
    this.playing = true;
    this.playButton.classList.add("is-playing");
    this.playButton.setAttribute("aria-label", "Pause");
    if (this.index === this.current) this.run();
  }

  stop() {
    this.playing = false;
    clearTimeout(this.timer);
    this.segments?.forEach((segment) => segment.classList.remove("is-waiting", "is-running"));
    this.playButton.classList.remove("is-playing");
    this.playButton.setAttribute("aria-label", "Play");
  }
}

class AblationViewer extends MultiView {
  constructor(card, manifest) {
    super(card);
    this.ablation = manifest.ablation;
    this.full = this.ablation.variants.find((v) => v.id === "full");
    this.variants = this.ablation.variants.filter((v) => v.id !== "full");
    this.token = 0;
    this.setPanels([{ label: "" }, { label: this.full.label, ours: true }]);
    this.setColor(this.ablation.color);
    card.querySelector('[data-role="label"]').textContent = `ActorsHQ A01, frame ${this.ablation.frame}, first seen from ${this.ablation.camera_name}.`;
    const start = Math.max(0, this.variants.findIndex((v) => v.id === "wo_collision"));
    tabBar(card.querySelector('[data-role="variants"]'), this.variants.map((v) => v.label), (i) => this.select(i), start);
    this.select(start);
  }

  async select(index) {
    const token = ++this.token;
    const variant = this.variants[index];
    this.cells[0].label.textContent = variant.label;
    this.setLoading(true);
    try {
      const loaded = await Promise.all([variant, this.full].map((v) => Promise.all([loadGeometry(v.garment, SHELL), loadGeometry(v.body)])));
      if (token !== this.token) return;
      loaded.forEach(([garment, body], i) => {
        this.cells[i].garment.geometry = garment;
        this.cells[i].body.geometry = body;
      });
      this.setLoading(false);
      this.showMessage("");
      if (!this.home) this.fit(loaded[1][0].boundingSphere, this.ablation.camera);
      this.requestRender();
    } catch (error) {
      if (token !== this.token) return;
      this.setLoading(false);
      this.showMessage("The meshes could not be loaded. Serve this page over HTTP to view them.");
    }
  }
}

function whenNear(element, start) {
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        observer.disconnect();
        start();
      }
    },
    { rootMargin: "800px 0px" },
  );
  observer.observe(element);
}

function boot(id, View) {
  const card = document.getElementById(id);
  if (!card) return;
  whenNear(card, async () => {
    const message = card.querySelector(".mv-message");
    try {
      const manifest = await loadManifest();
      new View(card, manifest);
    } catch (error) {
      message.textContent = error instanceof Error && /WebGL/i.test(error.message)
        ? "This viewer needs WebGL, which is not available in this browser."
        : "The meshes could not be loaded. Serve this page over HTTP to view them.";
      message.hidden = false;
    }
  });
}

boot("compare-viewer", CompareViewer);
boot("ablation-viewer", AblationViewer);
