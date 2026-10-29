const BASELINES4 = ["SCARF", "Gaussian Garments", "Gaussian Wardrobe", "Ours"];
const BASELINES3 = ["Gaussian Garments", "Gaussian Wardrobe", "Ours"];

const M = {
  viou: { name: "V-IoU", dir: 1, digits: 4 },
  f1: { name: "F1", dir: 1, digits: 4 },
  ccd: { name: "2D C-CD", dir: -1, digits: 4 },
  hd95: { name: "HD95", dir: -1, digits: 4 },
  p2s: { name: "P2S", dir: -1, digits: 4 },
  cdl1: { name: "CD-L1", dir: -1, digits: 4 },
  nc: { name: "NC", dir: 1, digits: 4 },
  pen: { name: "Pen.Ratio (%)", dir: -1, digits: 4 },
  l1: { name: "L1 ×10⁻³", dir: -1, digits: 4 },
  psnr: { name: "PSNR (dB)", dir: 1, digits: 4 },
  ssim: { name: "SSIM", dir: 1, digits: 4 },
  lpips: { name: "LPIPS", dir: -1, digits: 4 },
};

const WARDROBE_NOTE = [
  "About Gaussian Wardrobe. ",
  "Gaussian Wardrobe represents garments with 3D Gaussians, and its released code outputs each frame only as a Gaussian point cloud without surface connectivity. For every geometric comparison on this page, each of its frames is converted into a triangle mesh with the same pipeline: statistical outlier removal, normal estimation, Poisson surface reconstruction and trimming of low-density vertices.",
];

const RESULTS = [
  {
    id: "alignment",
    tab: "ActorsHQ · 2D alignment",
    caption: "Projected garment alignment on the held-out ActorsHQ views (Table I). Best results are bold and second-best underlined.",
    note: WARDROBE_NOTE,
    methods: BASELINES4,
    metrics: ["viou", "f1", "ccd", "hd95"],
    selectors: [{ label: "Subject", values: ["Mean", "A01", "A02", "A04", "A05"] }],
    data: {
      A01: [[0.8759, 0.9551, 0.9476, 0.9576], [0.9314, 0.9767, 0.9727, 0.9783], [9.5259, 2.9699, 3.6657, 2.728], [48.1264, 14.8132, 16.4543, 12.1179]],
      A02: [[0.8692, 0.9253, 0.9725, 0.972], [0.9255, 0.9583, 0.985, 0.9848], [9.9483, 6.3113, 2.4919, 2.436], [46.9065, 29.2106, 11.5863, 10.3521]],
      A04: [[0.8651, 0.8821, 0.9596, 0.9498], [0.9263, 0.9362, 0.9792, 0.9739], [8.1464, 7.6637, 2.9286, 3.0897], [54.5764, 47.0967, 19.6213, 15.4317]],
      A05: [[0.8066, 0.8797, 0.911, 0.9134], [0.8718, 0.9198, 0.9374, 0.9395], [14.2319, 14.5148, 12.3735, 11.7325], [61.3293, 65.7721, 55.6419, 52.8342]],
      Mean: [[0.8542, 0.9106, 0.9477, 0.9482], [0.9138, 0.9478, 0.9686, 0.9691], [10.4631, 7.8649, 5.3649, 4.9966], [52.7347, 39.2232, 25.826, 22.684]],
    },
  },
  {
    id: "geometry",
    tab: "4D-DRESS · 3D geometry",
    caption: "3D lower-garment reconstruction under the controlled synthetic 4D-DRESS protocol (Table II). SCARF is template-free and is not evaluated here.",
    note: WARDROBE_NOTE,
    methods: BASELINES3,
    metrics: ["p2s", "cdl1", "nc", "pen"],
    selectors: [{ label: "Sequence", values: ["Mean", "Trousers", "Shorts", "Short Skirt", "Long Skirt"] }],
    data: {
      Trousers: [[6.1696, 5.6705, 1.0915], [6.5653, 6.0287, 1.9527], [0.9496, 0.9105, 0.9726], [0.006, 18.0067, 0.01]],
      Shorts: [[42.8667, 29.7099, 11.6408], [43.3044, 29.9185, 12.1323], [0.8198, 0.709, 0.8848], [0.946, 18.2277, 0.516]],
      "Short Skirt": [[84.8901, 8.9901, 10.1443], [85.2735, 9.2524, 10.4766], [0.717, 0.7458, 0.797], [0.284, 6.5983, 0.05]],
      "Long Skirt": [[17.314, 40.4525, 5.826], [17.6221, 40.7003, 6.521], [0.8546, 0.6452, 0.8981], [0.018, 8.3817, 0.01]],
      Mean: [[36.6025, 21.2908, 7.1004], [36.9849, 21.5606, 7.7024], [0.8388, 0.7546, 0.8909], [0.3193, 13.0795, 0.1519]],
    },
  },
  {
    id: "rendering-actorshq",
    tab: "ActorsHQ · rendering",
    caption: "Subject-level novel-view rendering on ActorsHQ with 500 and 1,000 training frames (Table III). The same ground-truth garment mask is applied to predictions and references before the metrics are computed.",
    methods: BASELINES4,
    metrics: ["l1", "psnr", "ssim", "lpips"],
    selectors: [
      { label: "Training frames", values: ["500", "1000"] },
      { label: "Subject", values: ["Mean", "A01", "A02", "A04", "A05"] },
    ],
    data: {
      "500|A01": [[11.251, 3.507, 4.967, 3.474], [24.3283, 36.6, 34.0544, 36.8462], [0.9508, 0.9733, 0.9561, 0.9727], [0.0757, 0.0489, 0.0369, 0.0509]],
      "500|A02": [[10.036, 6.313, 6.517, 4.47], [26.2505, 30.6788, 29.4915, 33.855], [0.9524, 0.9595, 0.9565, 0.9731], [0.1013, 0.1019, 0.0733, 0.0727]],
      "500|A04": [[9.061, 10.299, 8.477, 7.321], [27.8239, 26.9844, 29.9014, 31.0248], [0.9292, 0.8975, 0.8979, 0.9077], [0.0738, 0.0987, 0.0525, 0.0827]],
      "500|A05": [[16.847, 6.614, 5.867, 4.813], [24.4511, 30.6935, 33.3678, 34.4027], [0.9417, 0.9497, 0.945, 0.9577], [0.1006, 0.1068, 0.065, 0.0915]],
      "500|Mean": [[11.7988, 6.6833, 6.457, 5.0195], [25.7135, 31.2392, 31.7038, 34.0322], [0.9435, 0.945, 0.9389, 0.9528], [0.0878, 0.0891, 0.0569, 0.0744]],
      "1000|A01": [[11.618, 3.631, 5.362, 3.348], [24.1586, 36.1247, 33.0247, 36.8412], [0.9512, 0.9705, 0.9555, 0.9716], [0.0756, 0.0519, 0.0377, 0.0517]],
      "1000|A02": [[10.211, 5.587, 6.283, 4.32], [26.0654, 31.5374, 29.7707, 34.2334], [0.9523, 0.9635, 0.9575, 0.9745], [0.1, 0.0957, 0.0718, 0.0699]],
      "1000|A04": [[9.456, 9.78, 8.209, 7.493], [27.5302, 27.3459, 30.0639, 30.4946], [0.931, 0.9033, 0.9032, 0.9109], [0.0728, 0.0925, 0.05, 0.0801]],
      "1000|A05": [[16.799, 6.102, 5.858, 4.665], [24.3909, 30.9907, 33.1891, 34.1936], [0.9419, 0.9514, 0.946, 0.9585], [0.0989, 0.1072, 0.064, 0.0894]],
      "1000|Mean": [[12.021, 6.275, 6.428, 4.9565], [25.5363, 31.4997, 31.5121, 33.9407], [0.9441, 0.9472, 0.9406, 0.9539], [0.0868, 0.0868, 0.0559, 0.0728]],
    },
  },
  {
    id: "rendering-4ddress",
    tab: "4D-DRESS · rendering",
    caption: "Novel-view rendering under the controlled synthetic 4D-DRESS protocol (Table IV).",
    note: [
      "About the 4D-DRESS rendering scores. ",
      "4D-DRESS provides only four captured views, so the reference images of the training views and of the disjoint held-out views are rendered from the dataset's textured ground-truth scans with calibrated cameras at the same timestamps. For every method, the same ground-truth garment mask is applied to the prediction and to the reference, and L1, PSNR, SSIM and LPIPS are computed over the full masked image, where pixels outside the garment are identical and add no error. Absolute values are therefore higher than on captured footage such as ActorsHQ and are meant for comparing methods under this protocol.",
    ],
    methods: BASELINES4,
    metrics: ["l1", "psnr", "ssim", "lpips"],
    selectors: [{ label: "Sequence", values: ["Mean", "Trousers", "Shorts", "Short Skirt", "Long Skirt"] }],
    data: {
      Trousers: [[0.631, 0.238, 0.431, 0.18], [39.0383, 46.1155, 39.7899, 47.3453], [0.9966, 0.9971, 0.995, 0.9982], [0.0103, 0.0077, 0.0067, 0.0046]],
      Shorts: [[1.525, 0.9, 0.845, 0.525], [35.4254, 39.3155, 39.0031, 42.5602], [0.9929, 0.9942, 0.9946, 0.9965], [0.0118, 0.0085, 0.0037, 0.0057]],
      "Short Skirt": [[0.311, 0.203, 0.351, 0.149], [37.9708, 43.1788, 38.3417, 43.4368], [0.9918, 0.9976, 0.9976, 0.9981], [0.0079, 0.0079, 0.005, 0.0067]],
      "Long Skirt": [[2.894, 0.808, 1.37, 0.542], [35.7846, 41.0606, 36.5165, 43.4768], [0.9897, 0.9897, 0.9876, 0.9955], [0.0131, 0.0128, 0.0073, 0.0062]],
      Mean: [[1.3403, 0.5373, 0.7493, 0.349], [37.0548, 42.4176, 38.4128, 44.2048], [0.9928, 0.9947, 0.9937, 0.9971], [0.0108, 0.0092, 0.0057, 0.0058]],
    },
  },
];

const ABLATIONS = [
  {
    id: "dimensions",
    tab: "Spectral dimensions",
    caption: "Varying the low-frequency basis dimension with the higher-order dimension fixed at 20, and the higher-order coordinate dimension with the low-frequency dimension fixed at 30, on ActorsHQ A01 (Table V). † marks the default.",
    metrics: ["viou", "f1", "ccd", "hd95"],
    groups: [
      { label: "K_L\\;(K_H = 20)", rows: [["10", [0.9562, 0.9764, 2.8812, 13.4689]], ["30", [0.9576, 0.9783, 2.728, 12.1179], true], ["50", [0.9569, 0.9779, 2.7498, 12.2171]], ["80", [0.9574, 0.9781, 2.7286, 12.1382]]] },
      { label: "K_H\\;(K_L = 30)", rows: [["10", [0.9569, 0.9777, 2.7589, 12.2388]], ["20", [0.9576, 0.9783, 2.728, 12.1179], true], ["30", [0.9568, 0.9776, 2.7315, 12.2453]], ["60", [0.9573, 0.9778, 2.7297, 12.1896]]] },
    ],
  },
  {
    id: "representation-2d",
    tab: "Representation · 2D",
    caption: "Deformation representations and prediction branches with 2D projection metrics on ActorsHQ A01 (Table VI).",
    metrics: ["viou", "f1", "ccd", "hd95"],
    groups: [{ rows: [["Pure Mesh", [0.9375, 0.9673, 3.9463, 18.1349]], ["w/o LF Branch", [0.9479, 0.9718, 3.4116, 15.0784]], ["w/o Residual Branch", [0.9512, 0.9749, 3.315, 13.5077]], ["PCA", [0.9572, 0.9781, 2.7303, 12.137]], ["Full Model", [0.9576, 0.9783, 2.728, 12.1179], true]] }],
  },
  {
    id: "representation-3d",
    tab: "Representation · 3D",
    caption: "The same variants with 3D surface metrics on the 4D-DRESS Trousers sequence (Table VII).",
    metrics: ["p2s", "cdl1", "nc", "hd95"],
    groups: [{ rows: [["Pure Mesh", [1.1403, 2.0011, 0.9732, 4.2862]], ["w/o LF Branch", [1.1114, 1.9703, 0.9723, 4.0223]], ["w/o Residual Branch", [1.9728, 2.6957, 0.9479, 7.7454]], ["PCA", [1.1341, 1.9851, 0.9721, 4.2709]], ["Full Model", [1.0915, 1.9527, 0.9726, 3.903], true]] }],
  },
  {
    id: "coordinates",
    tab: "Coordinate encoding",
    caption: "Coordinate-encoding ablation with 2D and penetration metrics on ActorsHQ A01 (Table VIII).",
    metrics: ["viou", "ccd", "hd95", "pen"],
    groups: [{ rows: [["w/o Spectral Coord.", [0.9552, 2.9141, 13.829, 0.0482]], ["Canonical XYZ", [0.957, 2.7599, 12.1352, 0.0499]], ["Full Model", [0.9576, 2.728, 12.1179, 0.0374], true]] }],
  },
  {
    id: "losses",
    tab: "Loss terms",
    caption: "Loss-term ablation with 2D and penetration metrics on ActorsHQ A01 (Table IX).",
    metrics: ["viou", "ccd", "hd95", "pen"],
    groups: [{ rows: [["w/o Body Loss", [0.9561, 2.8098, 13.7064, 0.0426]], ["w/o Cloth Loss", [0.9568, 2.7635, 12.1957, 0.0487]], ["w/o Collision Loss", [0.9533, 3.0667, 12.2704, 18.4062]], ["w/o Leakage Loss", [0.9575, 2.7476, 12.1627, 0.0587]], ["Full Model", [0.9576, 2.728, 12.1179, 0.0374], true]] }],
  },
];

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === "class") node.className = value;
    else if (key === "text") node.textContent = value;
    else node.setAttribute(key, value);
  }
  for (const child of [].concat(children)) node.append(child);
  return node;
}

function metricHead(key) {
  const metric = M[key];
  return `${metric.name} ${metric.dir > 0 ? "↑" : "↓"}`;
}

function ranks(values, dir) {
  const order = [...new Set(values)].sort((a, b) => (b - a) * dir);
  return values.map((value) => order.indexOf(value));
}

function tabBar(container, items, onSelect, active = 0) {
  container.replaceChildren();
  const buttons = items.map((label, index) => {
    const button = el("button", { type: "button", role: "tab", text: label });
    button.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.toggle("is-active", b === button));
      buttons.forEach((b) => b.setAttribute("aria-selected", b === button ? "true" : "false"));
      onSelect(index);
    });
    return button;
  });
  container.append(...buttons);
  buttons[active].classList.add("is-active");
  buttons[active].setAttribute("aria-selected", "true");
  return buttons;
}

function renderResults(root) {
  const tabs = root.querySelector('[data-role="tables"]');
  const selectors = root.querySelector('[data-role="selectors"]');
  const wrap = root.querySelector('[data-role="table"]');
  const caption = root.querySelector('[data-role="caption"]');
  const note = root.querySelector('[data-role="note"]');
  let spec = RESULTS[0];
  let choice = [];

  function draw() {
    const values = spec.data[choice.join("|")];
    const table = el("table", { class: "results" });
    table.append(el("thead", {}, el("tr", {}, [el("th", { text: "Method" }), ...spec.metrics.map((key) => el("th", { text: metricHead(key) }))])));
    const columnRanks = spec.metrics.map((key, column) => ranks(values[column], M[key].dir));
    const body = el("tbody");
    spec.methods.forEach((method, row) => {
      const tr = el("tr", { class: method === "Ours" ? "is-ours" : "" });
      tr.append(el("td", { text: method === "Ours" ? "LSVR (Ours)" : method }));
      spec.metrics.forEach((key, column) => {
        const rank = columnRanks[column][row];
        tr.append(el("td", { class: rank === 0 ? "best" : rank === 1 ? "second" : "", text: values[column][row].toFixed(M[key].digits) }));
      });
      body.append(tr);
    });
    table.append(body);
    wrap.replaceChildren(table);
    caption.textContent = spec.caption;
    note.replaceChildren(...(spec.note ? [el("b", { text: spec.note[0] }), spec.note[1]] : []));
    note.hidden = !spec.note;
  }

  function select(index) {
    spec = RESULTS[index];
    choice = spec.selectors.map((s) => s.values[0]);
    selectors.replaceChildren();
    spec.selectors.forEach((selector, position) => {
      const bar = el("div", { class: "tabs small", role: "group", "aria-label": selector.label });
      tabBar(bar, selector.values.map((v) => (selector.label === "Training frames" ? `${v} frames` : v)), (i) => {
        choice[position] = selector.values[i];
        draw();
      });
      selectors.append(el("div", { class: "selector" }, [el("span", { text: selector.label }), bar]));
    });
    draw();
  }

  tabBar(tabs, RESULTS.map((r) => r.tab), select);
  select(0);
}

function renderAblations(root) {
  const tabs = root.querySelector('[data-role="tables"]');
  const wrap = root.querySelector('[data-role="table"]');
  const caption = root.querySelector('[data-role="caption"]');

  function select(index) {
    const spec = ABLATIONS[index];
    const table = el("table", { class: "results" });
    table.append(el("thead", {}, el("tr", {}, [el("th", { text: "Configuration" }), ...spec.metrics.map((key) => el("th", { text: metricHead(key) }))])));
    const body = el("tbody");
    for (const group of spec.groups) {
      if (group.label) {
        const cell = el("td", { colspan: String(spec.metrics.length + 1) });
        tex(cell, group.label);
        body.append(el("tr", { class: "group" }, cell));
      }
      const columnRanks = spec.metrics.map((key, column) => ranks(group.rows.map((row) => row[1][column]), M[key].dir));
      group.rows.forEach(([label, values, isDefault], row) => {
        const tr = el("tr", { class: isDefault && !group.label ? "is-ours" : "" });
        const name = el("td", { text: label });
        if (isDefault && group.label) name.append(el("span", { class: "dagger", text: "†" }));
        tr.append(name);
        spec.metrics.forEach((key, column) => {
          tr.append(el("td", { class: columnRanks[column][row] === 0 ? "best" : "", text: values[column].toFixed(M[key].digits) }));
        });
        body.append(tr);
      });
    }
    table.append(body);
    wrap.replaceChildren(table);
    caption.textContent = spec.caption;
  }

  tabBar(tabs, ABLATIONS.map((a) => a.tab), select);
  select(0);
}

function tex(node, source) {
  if (window.katex) window.katex.render(source, node, { throwOnError: false });
  else node.textContent = source.replace(/\\[;,]/g, " ").replace(/\\/g, "");
}

function setupNav() {
  const bar = document.querySelector(".anchor-nav .container");
  const links = [...bar.querySelectorAll(".nav-link")];
  const sections = links.map((link) => document.querySelector(link.getAttribute("href")));
  bar.querySelectorAll(".nav-item").forEach((item) => {
    item.querySelectorAll(".nav-menu a").forEach((link) => link.addEventListener("click", () => {
      item.classList.add("is-closed");
      link.blur();
    }));
    item.addEventListener("mouseleave", () => item.classList.remove("is-closed"));
  });
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const index = sections.indexOf(entry.target);
        links.forEach((link, i) => link.classList.toggle("is-active", i === index));
        if (bar.scrollWidth > bar.clientWidth) {
          const link = links[index].getBoundingClientRect();
          const frame = bar.getBoundingClientRect();
          bar.scrollTo({ left: bar.scrollLeft + link.left - frame.left - (frame.width - link.width) / 2, behavior: "smooth" });
        }
      }
    },
    { rootMargin: "-45% 0px -50% 0px" },
  );
  sections.forEach((section) => section && observer.observe(section));
}

function setupLightbox() {
  const box = document.querySelector(".lightbox");
  const image = box.querySelector("img");
  const close = () => {
    box.hidden = true;
    image.removeAttribute("src");
  };
  document.querySelectorAll(".zoomable img").forEach((img) => {
    img.addEventListener("click", () => {
      image.src = img.currentSrc || img.src;
      image.alt = img.alt;
      box.hidden = false;
    });
  });
  box.addEventListener("click", close);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !box.hidden) close();
  });
}

function setupTeaser() {
  const buttons = [...document.querySelectorAll("#teaser-mode button")];
  const videos = [...document.querySelectorAll(".teaser video")];
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      if (button.classList.contains("is-active")) return;
      buttons.forEach((b) => b.classList.toggle("is-active", b === button));
      const time = videos[0].currentTime;
      videos.forEach((video) => {
        video.src = video.dataset[button.dataset.mode];
        video.addEventListener("loadedmetadata", () => {
          video.currentTime = time;
          video.play().catch(() => {});
        }, { once: true });
      });
    });
  });
}

setupTeaser();
renderResults(document.getElementById("results-tables"));
renderAblations(document.getElementById("ablation-tables"));
setupNav();
setupLightbox();
