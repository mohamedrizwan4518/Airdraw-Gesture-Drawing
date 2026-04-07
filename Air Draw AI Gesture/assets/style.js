// 🔥 AI SHAPE DETECTION
function detectShape(points) {
  if (points.length < 15) return "free";

  let start = points[0];
  let end = points[points.length - 1];

  let dist = Math.hypot(start.x - end.x, start.y - end.y);

  // 🔵 Circle detection (closed shape)
  if (dist < 25) {
    return "circle";
  }

  // 📏 Line detection
  let totalDeviation = 0;
  for (let i = 1; i < points.length; i++) {
    totalDeviation += Math.abs(points[i].y - points[0].y);
  }

  if (totalDeviation / points.length < 10) {
    return "line";
  }

  // 🟨 Rectangle detection (check corners)
  let minX = Math.min(...points.map(p => p.x));
  let maxX = Math.max(...points.map(p => p.x));
  let minY = Math.min(...points.map(p => p.y));
  let maxY = Math.max(...points.map(p => p.y));

  let boxArea = (maxX - minX) * (maxY - minY);
  let pathLength = points.length;

  // Only rectangle if it looks box-like
  if (boxArea > 5000 && pathLength > 40 && dist < 40) {
    return "rectangle";
  }

  return "free";
}

// 🔥 SHAPE CORRECTION
function correctShape(stroke) {
  const shape = detectShape(stroke.points);

  // 🔥 Only correct if HIGH confidence shapes
  if (shape === "circle") {
    return makeCircle(stroke);
  }

  if (shape === "line") {
    return makeLine(stroke);
  }

  if (shape === "rectangle") {
    return makeRectangle(stroke);
  }

  // ✍️ For letters/numbers → only smooth
  return smoothStroke(stroke);
}

function makeCircle(stroke) {
  const pts = stroke.points;

  let cx = 0, cy = 0;

  pts.forEach(p => {
    cx += p.x;
    cy += p.y;
  });

  cx /= pts.length;
  cy /= pts.length;

  let radius = 0;
  pts.forEach(p => {
    radius += Math.hypot(p.x - cx, p.y - cy);
  });

  radius /= pts.length;

  let newPoints = [];

  for (let i = 0; i < 50; i++) {
    let angle = (i / 50) * Math.PI * 2;
    newPoints.push({
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle)
    });
  }

  return { ...stroke, points: newPoints };
}

function makeLine(stroke) {
  const start = stroke.points[0];
  const end = stroke.points[stroke.points.length - 1];

  return {
    ...stroke,
    points: [start, end]
  };
}

function makeRectangle(stroke) {
  const pts = stroke.points;

  let minX = Math.min(...pts.map(p => p.x));
  let maxX = Math.max(...pts.map(p => p.x));
  let minY = Math.min(...pts.map(p => p.y));
  let maxY = Math.max(...pts.map(p => p.y));

  return {
    ...stroke,
    points: [
      { x: minX, y: minY },
      { x: maxX, y: minY },
      { x: maxX, y: maxY },
      { x: minX, y: maxY },
      { x: minX, y: minY }
    ]
  };
}

function smoothStroke(stroke) {
  const pts = stroke.points;
  let smooth = [];

  for (let i = 1; i < pts.length - 1; i++) {
    let prev = pts[i - 1];
    let curr = pts[i];
    let next = pts[i + 1];

    smooth.push({
      x: (prev.x + curr.x + next.x) / 3,
      y: (prev.y + curr.y + next.y) / 3
    });
  }

  return { ...stroke, points: smooth };
}

(function() {
    const n = document.createElement("link").relList;
    if (n && n.supports && n.supports("modulepreload")) return;
    for (const s of document.querySelectorAll('link[rel="modulepreload"]')) o(s);
    new MutationObserver(s => {
        for (const a of s)
            if (a.type === "childList")
                for (const i of a.addedNodes) i.tagName === "LINK" && i.rel === "modulepreload" && o(i)
    }).observe(document, {
        childList: !0,
        subtree: !0
    });

    function r(s) {
        const a = {};
        return s.integrity && (a.integrity = s.integrity), s.referrerPolicy && (a.referrerPolicy = s.referrerPolicy), s.crossOrigin === "use-credentials" ? a.credentials = "include" : s.crossOrigin === "anonymous" ? a.credentials = "omit" : a.credentials = "same-origin", a
    }

    function o(s) {
        if (s.ep) return;
        s.ep = !0;
        const a = r(s);
        fetch(s.href, a)
    }
})();
const z = "modulepreload",
    j = function(e) {
        return "/" + e
    },
    M = {},
    J = function(n, r, o) {
        let s = Promise.resolve();
        if (r && r.length > 0) {
            document.getElementsByTagName("link");
            const i = document.querySelector("meta[property=csp-nonce]"),
                c = (i == null ? void 0 : i.nonce) || (i == null ? void 0 : i.getAttribute("nonce"));
            s = Promise.allSettled(r.map(l => {
                if (l = j(l), l in M) return;
                M[l] = !0;
                const h = l.endsWith(".css"),
                    g = h ? '[rel="stylesheet"]' : "";
                if (document.querySelector(`link[href="${l}"]${g}`)) return;
                const u = document.createElement("link");
                if (u.rel = h ? "stylesheet" : z, h || (u.as = "script"), u.crossOrigin = "", u.href = l, c && u.setAttribute("nonce", c), document.head.appendChild(u), h) return new Promise((p, w) => {
                    u.addEventListener("load", p), u.addEventListener("error", () => w(new Error(`Unable to preload CSS for ${l}`)))
                })
            }))
        }

        function a(i) {
            const c = new Event("vite:preloadError", {
                cancelable: !0
            });
            if (c.payload = i, window.dispatchEvent(c), !c.defaultPrevented) throw i
        }
        return s.then(i => {
            for (const c of i || []) c.status === "rejected" && a(c.reason);
            return n().catch(a)
        })
    },
    t = {
        handLandmarker: null,
        webcamStream: null,
        isReady: !1,
        strokes: [],
        currentStroke: null,
        activeColor: "#00f0ff",
        thickness: 6,
        glowIntensity: 60,
        currentGesture: "idle",
        previousGesture: "idle",
        gestureStableFrames: 0,
        gestureStartTime: 0,
        isModalOpen: !0,
        isGrabbing: !1,
        grabStartPos: null,
        grabOffset: {
            x: 0,
            y: 0
        },
        totalOffset: {
            x: 0,
            y: 0
        },
        nearestStrokeIdx: -1,
        eraserRadius: 28,
        showCamera: !0,
        cameraOpacity: .35,
        particles: [],
        smoothPos: {
            x: 0,
            y: 0
        },
        smoothFactor: .35,
        width: 0,
        height: 0,
        audioCtx: null
    },
    f = e => document.getElementById(e),
    O = f("loading-screen"),
    K = f("app"),
    S = f("webcam"),
    R = f("camera-canvas"),
    E = f("drawing-canvas"),
    q = f("ui-canvas"),
    b = R.getContext("2d"),
    I = E.getContext("2d"),
    d = q.getContext("2d"),
    Q = f("gesture-hud"),
    X = f("gesture-icon"),
    Y = f("gesture-label"),
    A = f("thickness-slider"),
    Z = f("thickness-value"),
    G = f("glow-slider"),
    ee = f("glow-value"),
    L = f("camera-mode-text"),
    v = f("camera-mode-indicator"),
    H = f("onboarding-modal"),
    te = f("btn-start");

function ne() {
    return t.audioCtx || (t.audioCtx = new(window.AudioContext || window.webkitAudioContext)), t.audioCtx
}

function m(e, n, r = "sine", o = .06) {
    try {
        const s = ne(),
            a = s.createOscillator(),
            i = s.createGain();
        a.type = r, a.frequency.setValueAtTime(e, s.currentTime), i.gain.setValueAtTime(o, s.currentTime), i.gain.exponentialRampToValueAtTime(.001, s.currentTime + n), a.connect(i), i.connect(s.destination), a.start(), a.stop(s.currentTime + n)
    } catch {}
}

function oe() {
    m(880, .08, "sine", .04)
}

function re() {
    m(440, .1, "sine", .03)
}

function se() {
    m(200, .06, "triangle", .03)
}

function ie() {
    m(660, .1, "sine", .05)
}

function ae() {
    m(330, .15, "sine", .04)
}

function U() {
    m(1200, .05, "sine", .03)
}

function W() {
    const e = window.innerWidth,
        n = window.innerHeight;
    t.width = e, t.height = n, [R, E, q].forEach(r => {
        r.width = e, r.height = n
    })
}
window.addEventListener("resize", () => {
    W(), y()
});
async function le() {
    const {
        FilesetResolver: e,
        HandLandmarker: n
    } = await J(async () => {
        const {
            FilesetResolver: o,
            HandLandmarker: s
        } = await
        import ("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/vision_bundle.mjs");
        return {
            FilesetResolver: o,
            HandLandmarker: s
        }
    }, []), r = await e.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm");
    return t.handLandmarker = await n.createFromOptions(r, {
        baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU"
        },
        runningMode: "VIDEO",
        numHands: 1,
        minHandDetectionConfidence: .6,
        minHandPresenceConfidence: .6,
        minTrackingConfidence: .5
    }), !0
}
async function ce() {
    const e = await navigator.mediaDevices.getUserMedia({
        video: {
            width: {
                ideal: 1280
            },
            height: {
                ideal: 720
            },
            facingMode: "user"
        }
    });
    return S.srcObject = e, t.webcamStream = e, new Promise(n => {
        S.onloadedmetadata = () => {
            S.play(), n()
        }
    })
}

function de(e) {
    if (!e || e.length === 0) return "none";
    const n = e,
        r = n[4],
        o = n[3],
        s = n[8],
        a = n[6];
    n[5];
    const i = n[12],
        c = n[10],
        l = n[16],
        h = n[14],
        g = n[20],
        u = n[18],
        p = s.y < a.y - .02,
        w = i.y > c.y,
        D = l.y > h.y,
        B = g.y > u.y,
        C = i.y < c.y,
        P = l.y < h.y,
        x = g.y < u.y,
        N = Math.abs(r.x - o.x) > .03 || r.y < o.y;
    return Math.hypot(r.x - s.x, r.y - s.y) < .06 && !C && !P && !x ? "pinch" : p && C && P && x && N ? "open_palm" : p && w && D && B ? "index_finger" : !p && !C && !P && !x ? "fist" : "idle"
}

function ue(e) {
    if (e === t.currentGesture) return t.previousGesture = e, t.gestureStableFrames = 0, t.currentGesture;
    e === t.previousGesture ? t.gestureStableFrames++ : (t.previousGesture = e, t.gestureStableFrames = 1);
    const n = e === "pinch" ? 3 : 4;
    if (t.gestureStableFrames >= n) {
        const r = t.currentGesture;
        return t.currentGesture = e, t.gestureStableFrames = 0, t.gestureStartTime = Date.now(), r !== e && V(r, e), e
    }
    return t.currentGesture
}

function V(e, n) {

    if (n === "index_finger") {
        oe();
    } else if (n === "open_palm") {
        U();
    } else if (n === "pinch") {
        ie();
    } else if (e === "index_finger") {
        re();
    }

    // 🔥 APPLY AI SHAPE CORRECTION SAFELY
    if (e === "index_finger" && t.currentStroke) {
        if (t.currentStroke.points.length > 1) {
            const corrected = correctShape(t.currentStroke);
            t.strokes.push(corrected);
        }
        t.currentStroke = null;
    }

    if (e === "pinch") {
        pe();
    }

    $(n);
}

function $(e) {
    const n = {
            index_finger: {
                icon: "☝️",
                label: "Drawing",
                cls: "drawing"
            },
            open_palm: {
                icon: "✋",
                label: "Erasing",
                cls: "erasing"
            },
            pinch: {
                icon: "🤏",
                label: "Grab",
                cls: "grabbing"
            },
            fist: {
                icon: "✊",
                label: "Idle",
                cls: ""
            },
            idle: {
                icon: "🖐️",
                label: "Ready",
                cls: ""
            },
            none: {
                icon: "👋",
                label: "Show hand",
                cls: ""
            }
        },
        r = n[e] || n.idle;
    X.textContent = r.icon, Y.textContent = r.label, Q.className = r.cls
}

function k(e) {
    return {
        x: (1 - e.x) * t.width,
        y: e.y * t.height
    }
}

function he(e) {
    return t.smoothPos.x += (e.x - t.smoothPos.x) * t.smoothFactor, t.smoothPos.y += (e.y - t.smoothPos.y) * t.smoothFactor, {
        x: t.smoothPos.x,
        y: t.smoothPos.y
    }
}

function fe(e) {
    const n = e[8],
        r = k(n),
        o = he(r);
    if (Date.now() - t.gestureStartTime < 300) {
        t.smoothPos = { ...r
        };
        return
    }
    t.currentStroke ? t.currentStroke.points.push({ ...o
    }) : (t.currentStroke = {
        points: [o],
        color: t.activeColor,
        thickness: t.thickness,
        glow: t.glowIntensity
    }, t.smoothPos = { ...r
    }), ke(o.x, o.y, t.activeColor), y()
}

function ge(e) {
    const n = e[0],
        r = e[9],
        o = {
            x: (1 - (n.x + r.x) / 2) * t.width,
            y: (n.y + r.y) / 2 * t.height
        },
        s = t.eraserRadius;
    let a = !1;
    const i = [];
    for (let c = 0; c < t.strokes.length; c++) {
        const l = t.strokes[c],
            h = [];
        let g = [];
        for (const u of l.points) {
            const p = u.x - o.x,
                w = u.y - o.y;
            Math.sqrt(p * p + w * w) >= s ? g.push(u) : (a = !0, g.length >= 2 && h.push(g), g = [])
        }
        if (g.length >= 2 && h.push(g), !(h.length === 0 && l.points.length > 0))
            if (h.length === 1 && h[0].length === l.points.length) i.push(l);
            else
                for (const u of h) i.push({
                    points: u,
                    color: l.color,
                    thickness: l.thickness,
                    glow: l.glow
                })
    }
    t.strokes = i, a && se(), d.beginPath(), d.arc(o.x, o.y, s, 0, Math.PI * 2), d.strokeStyle = "rgba(255, 45, 107, 0.5)", d.lineWidth = 1.5, d.setLineDash([5, 5]), d.stroke(), d.setLineDash([]), d.fillStyle = "rgba(255, 45, 107, 0.05)", d.fill(), y()
}

function me(e) {
    const n = e[4],
        r = e[8],
        o = {
            x: (1 - (n.x + r.x) / 2) * t.width,
            y: (n.y + r.y) / 2 * t.height
        };
    if (!t.isGrabbing) t.isGrabbing = !0, t.grabStartPos = { ...o
    }, t.nearestStrokeIdx = ye(o);
    else {
        const s = o.x - t.grabStartPos.x,
            a = o.y - t.grabStartPos.y;
        if (t.nearestStrokeIdx >= 0 && t.nearestStrokeIdx < t.strokes.length) {
            const i = t.strokes[t.nearestStrokeIdx],
                c = t.grabOffset.x,
                l = t.grabOffset.y,
                h = s - c,
                g = a - l;
            for (let u = 0; u < i.points.length; u++) i.points[u].x += h, i.points[u].y += g
        }
        t.grabOffset = {
            x: s,
            y: a
        }
    }
    d.beginPath(), d.arc(o.x, o.y, 18, 0, Math.PI * 2), d.strokeStyle = "rgba(255, 215, 0, 0.7)", d.lineWidth = 2, d.stroke(), d.fillStyle = "rgba(255, 215, 0, 0.1)", d.fill(), t.nearestStrokeIdx >= 0 && t.nearestStrokeIdx < t.strokes.length && be(t.strokes[t.nearestStrokeIdx]), y()
}

function pe() {
    t.isGrabbing && t.nearestStrokeIdx >= 0 && ae(), t.isGrabbing = !1, t.grabStartPos = null, t.grabOffset = {
        x: 0,
        y: 0
    }, t.nearestStrokeIdx = -1, y()
}

function ye(e) {
    let n = 1 / 0,
        r = -1;
    for (let o = 0; o < t.strokes.length; o++) {
        const s = t.strokes[o];
        for (const a of s.points) {
            const i = Math.hypot(a.x - e.x, a.y - e.y);
            i < n && (n = i, r = o)
        }
    }
    return n < 80 ? r : -1
}

function be(e) {
    if (!(!e || e.points.length < 2)) {
        d.save(), d.beginPath(), d.moveTo(e.points[0].x, e.points[0].y);
        for (let n = 1; n < e.points.length; n++) d.lineTo(e.points[n].x, e.points[n].y);
        d.strokeStyle = "rgba(255, 215, 0, 0.3)", d.lineWidth = e.thickness + 12, d.lineCap = "round", d.lineJoin = "round", d.setLineDash([8, 8]), d.stroke(), d.setLineDash([]), d.restore()
    }
}

function _(e, n, r = !1) {
    if (!n || n.points.length < 2) return;
    const o = n.points,
        s = n.color,
        a = n.thickness,
        i = n.glow / 100;
    if (e.save(), e.lineCap = "round", e.lineJoin = "round", i > 0) {
        e.beginPath(), e.moveTo(o[0].x, o[0].y);
        for (let c = 1; c < o.length; c++) {
            const l = o[c - 1],
                h = o[c],
                g = (l.x + h.x) / 2,
                u = (l.y + h.y) / 2;
            e.quadraticCurveTo(l.x, l.y, g, u)
        }
        e.lineTo(o[o.length - 1].x, o[o.length - 1].y), e.strokeStyle = s, e.lineWidth = a * 3, e.globalAlpha = .1 * i, e.shadowColor = s, e.shadowBlur = 35 * i, e.stroke()
    }
    if (i > 0) {
        e.beginPath(), e.moveTo(o[0].x, o[0].y);
        for (let c = 1; c < o.length; c++) {
            const l = o[c - 1],
                h = o[c],
                g = (l.x + h.x) / 2,
                u = (l.y + h.y) / 2;
            e.quadraticCurveTo(l.x, l.y, g, u)
        }
        e.lineTo(o[o.length - 1].x, o[o.length - 1].y), e.strokeStyle = s, e.lineWidth = a * 1.6, e.globalAlpha = .35 * i, e.shadowBlur = 15 * i, e.stroke()
    }
    e.beginPath(), e.moveTo(o[0].x, o[0].y);
    for (let c = 1; c < o.length; c++) {
        const l = o[c - 1],
            h = o[c],
            g = (l.x + h.x) / 2,
            u = (l.y + h.y) / 2;
        e.quadraticCurveTo(l.x, l.y, g, u)
    }
    e.lineTo(o[o.length - 1].x, o[o.length - 1].y), e.strokeStyle = we(s, .5), e.lineWidth = a, e.globalAlpha = 1, e.shadowBlur = 6 * i, e.shadowColor = s, e.stroke(), e.restore()
}

function we(e, n) {
    const r = parseInt(e.slice(1, 3), 16),
        o = parseInt(e.slice(3, 5), 16),
        s = parseInt(e.slice(5, 7), 16),
        a = Math.min(255, Math.round(r + (255 - r) * n)),
        i = Math.min(255, Math.round(o + (255 - o) * n)),
        c = Math.min(255, Math.round(s + (255 - s) * n));
    return `rgb(${a}, ${i}, ${c})`
}

function y() {
    I.clearRect(0, 0, t.width, t.height);
    for (const e of t.strokes) _(I, e);
    t.currentStroke && t.currentStroke.points.length > 1 && _(I, t.currentStroke, !0)
}

function ke(e, n, r) {
    for (let o = 0; o < 2; o++) t.particles.push({
        x: e,
        y: n,
        vx: (Math.random() - .5) * 3,
        vy: (Math.random() - .5) * 3,
        life: 1,
        decay: .02 + Math.random() * .03,
        size: 2 + Math.random() * 3,
        color: r
    })
}

function Se(e) {
    for (let n = t.particles.length - 1; n >= 0; n--) {
        const r = t.particles[n];
        if (r.x += r.vx, r.y += r.vy, r.life -= r.decay, r.size *= .97, r.life <= 0) {
            t.particles.splice(n, 1);
            continue
        }
        e.save(), e.globalAlpha = r.life * .7, e.fillStyle = r.color, e.shadowColor = r.color, e.shadowBlur = 10, e.beginPath(), e.arc(r.x, r.y, r.size, 0, Math.PI * 2), e.fill(), e.restore()
    }
}
const ve = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [0, 5],
    [5, 6],
    [6, 7],
    [7, 8],
    [0, 9],
    [9, 10],
    [10, 11],
    [11, 12],
    [0, 13],
    [13, 14],
    [14, 15],
    [15, 16],
    [0, 17],
    [17, 18],
    [18, 19],
    [19, 20],
    [5, 9],
    [9, 13],
    [13, 17]
];

function Ce(e, n) {
    if (!n) return;
    e.save(), e.globalAlpha = .3;
    for (const [o, s] of ve) {
        const a = k(n[o]),
            i = k(n[s]);
        e.beginPath(), e.moveTo(a.x, a.y), e.lineTo(i.x, i.y), e.strokeStyle = "rgba(255, 255, 255, 0.3)", e.lineWidth = 1.5, e.stroke()
    }
    for (let o = 0; o < n.length; o++) {
        const s = k(n[o]);
        e.beginPath(), e.arc(s.x, s.y, 3, 0, Math.PI * 2), e.fillStyle = "rgba(255, 255, 255, 0.5)", e.fill()
    }
    const r = [4, 8, 12, 16, 20];
    for (const o of r) {
        const s = k(n[o]);
        e.beginPath(), e.arc(s.x, s.y, 5, 0, Math.PI * 2), e.fillStyle = "rgba(255, 255, 255, 0.6)", e.shadowColor = "#ffffff", e.shadowBlur = 10, e.fill(), e.shadowBlur = 0
    }
    e.restore()
}

function Pe(e, n, r) {
    if (r === "index_finger") {
        const o = k(n[8]);
        e.save(), e.beginPath(), e.arc(o.x, o.y, t.thickness / 2 + 6, 0, Math.PI * 2), e.strokeStyle = t.activeColor, e.lineWidth = 1.5, e.globalAlpha = .5, e.shadowColor = t.activeColor, e.shadowBlur = 8, e.stroke(), e.beginPath(), e.arc(o.x, o.y, 3, 0, Math.PI * 2), e.fillStyle = t.activeColor, e.globalAlpha = .9, e.fill(), e.restore()
    }
}
let F = -1;

function T() {
    if (!t.handLandmarker || !t.isReady) {
        requestAnimationFrame(T);
        return;
    }

    const e = S;
    const n = performance.now();

    // Clear canvases
    b.clearRect(0, 0, t.width, t.height);

    // Draw camera
    if (t.showCamera) {
        b.save();
        b.globalAlpha = t.cameraOpacity;
        b.translate(t.width, 0);
        b.scale(-1, 1);
        b.drawImage(e, 0, 0, t.width, t.height);
        b.restore();
    }

    d.clearRect(0, 0, t.width, t.height);

    if (e.readyState >= 2 && e.currentTime !== F) {
        F = e.currentTime;

        const r = t.handLandmarker.detectForVideo(e, n);

        if (r.landmarks && r.landmarks.length > 0) {
            const o = r.landmarks[0];
            const s = de(o);
            const a = ue(s);

            if (!t.isModalOpen) {

                if (a === "index_finger") {
                    fe(o);
                } else if (a === "open_palm") {
                    ge(o);
                } else if (a === "pinch") {
                    me(o);
                } else {
                    // 🔥 APPLY AI SHAPE CORRECTION
                    if (t.currentStroke && t.currentStroke.points.length > 1) {
                        const corrected = correctShape(t.currentStroke);
                        t.strokes.push(corrected);
                    }
                    t.currentStroke = null;
                }
            }

            Ce(d, o);
            Pe(d, o, a);

        } else {
            // No hand detected

            if (t.currentGesture !== "none") {
                V(t.currentGesture, "none");
                t.currentGesture = "none";
            }

            // 🔥 APPLY AI SHAPE CORRECTION
            if (t.currentStroke && t.currentStroke.points.length > 1) {
                const corrected = correctShape(t.currentStroke);
                t.strokes.push(corrected);
                t.currentStroke = null;
                y();
            }
        }
    }

    Se(d);
    requestAnimationFrame(T);
}
document.querySelectorAll(".color-swatch").forEach(e => {
    e.addEventListener("click", () => {
        document.querySelectorAll(".color-swatch").forEach(n => n.classList.remove("active")), e.classList.add("active"), t.activeColor = e.dataset.color, m(1e3, .05, "sine", .03)
    })
});
A.addEventListener("input", () => {
    t.thickness = parseInt(A.value), Z.textContent = `${t.thickness}px`
});
G.addEventListener("input", () => {
    t.glowIntensity = parseInt(G.value), ee.textContent = `${t.glowIntensity}%`
});
f("btn-undo").addEventListener("click", () => {
    t.strokes.length > 0 && (t.strokes.pop(), y(), m(500, .08, "sine", .03))
});
f("btn-clear").addEventListener("click", () => {
    t.strokes = [], t.currentStroke = null, t.particles = [], y(), m(300, .15, "triangle", .04)
});
f("btn-camera-toggle").addEventListener("click", () => {
    t.showCamera && t.cameraOpacity > .2 ? (t.cameraOpacity = .15, L.textContent = "Camera DIM", v.classList.remove("dark-mode")) : t.showCamera && t.cameraOpacity <= .2 ? (t.showCamera = !1, t.cameraOpacity = 0, L.textContent = "Dark Canvas", v.classList.add("dark-mode"), f("btn-camera-toggle").classList.remove("active")) : (t.showCamera = !0, t.cameraOpacity = .35, L.textContent = "Camera ON", v.classList.remove("dark-mode"), f("btn-camera-toggle").classList.add("active")), U()
});
v.addEventListener("click", () => {
    f("btn-camera-toggle").click()
});
f("btn-save").addEventListener("click", () => {
    const e = document.createElement("canvas");
    e.width = t.width, e.height = t.height;
    const n = e.getContext("2d");
    n.fillStyle = "#07070d", n.fillRect(0, 0, t.width, t.height), n.drawImage(E, 0, 0);
    const r = document.createElement("a");
    r.download = `air-draw-${Date.now()}.png`, r.href = e.toDataURL("image/png"), r.click(), m(800, .1, "sine", .04)
});
te.addEventListener("click", () => {
    H.classList.add("hidden"), t.isModalOpen = !1, m(800, .1, "sine", .04), $("idle")
});
async function xe() {
    W();
    try {
        const [e] = await Promise.all([le(), ce()]);
        t.isReady = !0;
        const n = document.querySelector(".loader-bar-fill");
        n.style.animation = "none", n.style.width = "100%", n.style.transition = "width 0.4s ease", setTimeout(() => {
            O.classList.add("fade-out"), K.classList.remove("hidden"), H.classList.remove("hidden")
        }, 600), setTimeout(() => {
            O.style.display = "none"
        }, 1200), T()
    } catch (e) {
        console.error("Failed to initialize Air Draw:", e), document.querySelector(".loader-subtitle").textContent = "Error: Camera access required. Please allow camera permissions and reload.", document.querySelector(".loader-subtitle").style.color = "#ff2d6b", document.querySelector(".loader-bar").style.display = "none"
    }
}
xe();