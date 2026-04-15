// ===== IMMERSIVE PARTY + SPACE BACKGROUND =====
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let W, H;

function resizeCanvas() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

let time = 0;

// --- Stars ---
const stars = [];
for (let i = 0; i < 250; i++) {
  stars.push({
    x: Math.random() * 3000 - 500,
    y: Math.random() * 3000 - 500,
    z: Math.random() * 1500,
    size: Math.random() * 1.5 + 0.3
  });
}

// --- Nebula clouds ---
const nebulae = [];
for (let i = 0; i < 8; i++) {
  nebulae.push({
    x: Math.random() * 2 - 0.5,
    y: Math.random() * 2 - 0.5,
    radius: Math.random() * 0.3 + 0.15,
    r: Math.floor(Math.random() * 80 + 100),
    g: Math.floor(Math.random() * 30 + 20),
    b: Math.floor(Math.random() * 100 + 150),
    phase: Math.random() * Math.PI * 2,
    driftX: (Math.random() - 0.5) * 0.00015,
    driftY: (Math.random() - 0.5) * 0.0001
  });
}

// --- Shooting stars ---
const shootingStars = [];
function maybeSpawnShootingStar() {
  if (Math.random() < 0.008 && shootingStars.length < 3) {
    const startX = Math.random() * W;
    const startY = Math.random() * H * 0.5;
    const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.5;
    shootingStars.push({
      x: startX, y: startY,
      vx: Math.cos(angle) * (8 + Math.random() * 6),
      vy: Math.sin(angle) * (8 + Math.random() * 6),
      life: 1.0,
      decay: 0.015 + Math.random() * 0.01,
      tail: []
    });
  }
}

// --- Floating party orbs ---
const orbs = [];
const orbPalette = [
  [220, 50, 180], [180, 60, 220], [140, 40, 255],
  [255, 80, 160], [100, 50, 220], [200, 100, 255],
  [255, 50, 120], [80, 40, 200]
];
for (let i = 0; i < 10; i++) {
  orbs.push({
    x: Math.random() * W,
    y: Math.random() * H,
    r: Math.random() * 180 + 80,
    color: orbPalette[i % orbPalette.length],
    vx: (Math.random() - 0.5) * 0.6,
    vy: (Math.random() - 0.5) * 0.5,
    phase: Math.random() * Math.PI * 2
  });
}

// --- Pulsing rings ---
const rings = [];
function maybeSpawnRing() {
  if (Math.random() < 0.005 && rings.length < 4) {
    rings.push({
      x: Math.random() * W,
      y: Math.random() * H,
      radius: 0,
      maxRadius: 150 + Math.random() * 200,
      life: 1.0,
      color: orbPalette[Math.floor(Math.random() * orbPalette.length)]
    });
  }
}

// --- Light beams (club spotlights) ---
const spotlights = [
  { x: 0.2, angle: 0, speed: 0.006, color: [180, 60, 220] },
  { x: 0.5, angle: Math.PI / 3, speed: -0.004, color: [220, 50, 180] },
  { x: 0.8, angle: Math.PI, speed: 0.005, color: [140, 40, 255] }
];

// ===== MAIN RENDER =====
function render() {
  time += 0.016;
  ctx.fillStyle = '#08081a';
  ctx.fillRect(0, 0, W, H);

  // --- Nebula clouds ---
  for (const n of nebulae) {
    n.x += n.driftX;
    n.y += n.driftY;
    if (n.x > 1.5) n.x = -0.5;
    if (n.x < -0.5) n.x = 1.5;
    if (n.y > 1.5) n.y = -0.5;
    if (n.y < -0.5) n.y = 1.5;

    const pulse = Math.sin(time * 0.5 + n.phase) * 0.3 + 0.7;
    const cx = n.x * W;
    const cy = n.y * H;
    const r = n.radius * Math.max(W, H);

    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    const alpha = 0.06 * pulse;
    grad.addColorStop(0, `rgba(${n.r}, ${n.g}, ${n.b}, ${alpha})`);
    grad.addColorStop(0.5, `rgba(${n.r}, ${n.g}, ${n.b}, ${alpha * 0.4})`);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  }

  // --- Spotlights ---
  for (const sp of spotlights) {
    sp.angle += sp.speed;
    const bx = sp.x * W;
    const by = H;
    const len = H * 1.2;
    const spread = 0.15;

    const a1 = sp.angle - spread;
    const a2 = sp.angle + spread;
    const tipX = bx + Math.sin(sp.angle) * len * 0.3;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + Math.sin(a1) * len, by - Math.cos(a1) * len);
    ctx.lineTo(bx + Math.sin(a2) * len, by - Math.cos(a2) * len);
    ctx.closePath();

    const grad = ctx.createLinearGradient(bx, by, tipX, by - len);
    const pulse = Math.sin(time * 1.5 + sp.angle) * 0.3 + 0.7;
    grad.addColorStop(0, `rgba(${sp.color[0]}, ${sp.color[1]}, ${sp.color[2]}, ${0.07 * pulse})`);
    grad.addColorStop(0.7, `rgba(${sp.color[0]}, ${sp.color[1]}, ${sp.color[2]}, ${0.02 * pulse})`);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();
  }

  // --- Floating orbs ---
  for (const o of orbs) {
    o.x += o.vx;
    o.y += o.vy;
    o.phase += 0.008;

    if (o.x < -o.r) o.x = W + o.r;
    if (o.x > W + o.r) o.x = -o.r;
    if (o.y < -o.r) o.y = H + o.r;
    if (o.y > H + o.r) o.y = -o.r;

    const pulse = Math.sin(o.phase) * 0.4 + 0.6;
    const alpha = 0.07 * pulse;
    const grad = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
    grad.addColorStop(0, `rgba(${o.color[0]}, ${o.color[1]}, ${o.color[2]}, ${alpha})`);
    grad.addColorStop(0.6, `rgba(${o.color[0]}, ${o.color[1]}, ${o.color[2]}, ${alpha * 0.3})`);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- 3D Stars (parallax depth) ---
  const cx = W / 2;
  const cy = H / 2;
  for (const s of stars) {
    s.z -= 0.5;
    if (s.z <= 0) {
      s.z = 1500;
      s.x = Math.random() * 3000 - 500;
      s.y = Math.random() * 3000 - 500;
    }

    const px = (s.x - 1000) / s.z * 500 + cx;
    const py = (s.y - 1000) / s.z * 500 + cy;
    const sz = (1 - s.z / 1500) * s.size * 2.5;
    const alpha = (1 - s.z / 1500) * 0.9;

    if (px < -10 || px > W + 10 || py < -10 || py > H + 10) continue;

    // Star glow
    if (sz > 1) {
      ctx.beginPath();
      ctx.arc(px, py, sz * 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(180, 160, 255, ${alpha * 0.1})`;
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(px, py, Math.max(sz, 0.3), 0, Math.PI * 2);
    ctx.fillStyle = `rgba(220, 210, 255, ${alpha})`;
    ctx.fill();

    // Streak line for close stars
    if (s.z < 200) {
      const streak = (200 - s.z) / 200 * 8;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px - (s.x - 1000) / s.z * 0.5 * streak, py - (s.y - 1000) / s.z * 0.5 * streak);
      ctx.strokeStyle = `rgba(200, 190, 255, ${alpha * 0.4})`;
      ctx.lineWidth = Math.max(sz * 0.5, 0.5);
      ctx.stroke();
    }
  }

  // --- Shooting stars ---
  maybeSpawnShootingStar();
  for (let i = shootingStars.length - 1; i >= 0; i--) {
    const ss = shootingStars[i];
    ss.tail.push({ x: ss.x, y: ss.y, a: ss.life });
    if (ss.tail.length > 20) ss.tail.shift();

    ss.x += ss.vx;
    ss.y += ss.vy;
    ss.life -= ss.decay;

    if (ss.life <= 0 || ss.x > W + 50 || ss.y > H + 50) {
      shootingStars.splice(i, 1);
      continue;
    }

    // Draw tail
    for (let t = 0; t < ss.tail.length; t++) {
      const pt = ss.tail[t];
      const ta = (t / ss.tail.length) * ss.life * 0.6;
      const ts = (t / ss.tail.length) * 2;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, ts, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 220, 255, ${ta})`;
      ctx.fill();
    }

    // Head
    ctx.beginPath();
    ctx.arc(ss.x, ss.y, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${ss.life})`;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(ss.x, ss.y, 8, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(200, 150, 255, ${ss.life * 0.3})`;
    ctx.fill();
  }

  // --- Pulsing rings ---
  maybeSpawnRing();
  for (let i = rings.length - 1; i >= 0; i--) {
    const ring = rings[i];
    ring.radius += 1.5;
    ring.life -= 0.008;

    if (ring.life <= 0) {
      rings.splice(i, 1);
      continue;
    }

    ctx.beginPath();
    ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${ring.color[0]}, ${ring.color[1]}, ${ring.color[2]}, ${ring.life * 0.25})`;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${ring.color[0]}, ${ring.color[1]}, ${ring.color[2]}, ${ring.life * 0.08})`;
    ctx.lineWidth = 15;
    ctx.stroke();
  }

  // --- Color wave overlay ---
  const waveAlpha = Math.sin(time * 0.3) * 0.015 + 0.02;
  const hue = (time * 15) % 360;
  ctx.fillStyle = `hsla(${hue}, 80%, 30%, ${waveAlpha})`;
  ctx.fillRect(0, 0, W, H);

  requestAnimationFrame(render);
}

render();

// ===== GOOGLE SHEETS INTEGRATION =====
const SHEET_URL = 'https://script.google.com/macros/s/AKfycbx6QyRdu3aYViTrMYxSpgxHKMmqf7fMeAmHdMMfe54K06om0tnJTJaGupYKKPbnJcoS/exec';

function getDeviceInfo() {
  const ua = navigator.userAgent;
  let device = 'Desktop';
  if (/Mobi|Android/i.test(ua)) device = 'Mobile';
  else if (/Tablet|iPad/i.test(ua)) device = 'Tablet';

  let os = 'Unknown';
  if (/Windows/i.test(ua)) os = 'Windows';
  else if (/Mac/i.test(ua)) os = 'MacOS';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/iPhone|iPad/i.test(ua)) os = 'iOS';
  else if (/Linux/i.test(ua)) os = 'Linux';

  let browser = 'Unknown';
  if (/Chrome/i.test(ua) && !/Edg/i.test(ua)) browser = 'Chrome';
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
  else if (/Firefox/i.test(ua)) browser = 'Firefox';
  else if (/Edg/i.test(ua)) browser = 'Edge';
  else if (/Opera|OPR/i.test(ua)) browser = 'Opera';

  return {
    device: device,
    os: os,
    browser: browser,
    screen: window.innerWidth + 'x' + window.innerHeight,
    referrer: document.referrer || 'direct',
    language: navigator.language || 'unknown'
  };
}

function sendToSheet(data) {
  fetch(SHEET_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).catch(() => {});
}

// ===== PAGE NAVIGATION =====
function showPage(pageId) {
  // Track "I WANT IN" clicks
  if (pageId === 'page-briefing') {
    const info = getDeviceInfo();
    sendToSheet({
      type: 'click',
      ...info
    });
  }

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById(pageId);
  if (target) {
    target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
}

// ===== LIVE VIEWER COUNT =====
function updateViewerCount() {
  const el = document.getElementById('viewer-count');
  if (!el) return;
  el.textContent = 180 + Math.floor(Math.random() * 40) - 20;
}
setInterval(updateViewerCount, 3000);

// ===== AUTO-INCREMENT APPLICATION COUNT =====
let appCount = 247;
function updateAppCount() {
  const el = document.getElementById('app-count');
  if (!el) return;
  if (Math.random() < 0.4) {
    appCount += Math.floor(Math.random() * 3) + 1;
    el.textContent = appCount;
  }
}
setInterval(updateAppCount, 8000);

// ===== COUNTDOWN TIMER =====
function updateCountdown() {
  const now = new Date();
  const deadline = new Date();
  deadline.setDate(now.getDate() + 7);
  deadline.setHours(23, 59, 59, 0);
  const diff = deadline - now;

  if (diff <= 0) {
    document.getElementById('cd-hrs').textContent = '00';
    document.getElementById('cd-min').textContent = '00';
    document.getElementById('cd-sec').textContent = '00';
    return;
  }

  document.getElementById('cd-hrs').textContent = String(Math.floor(diff / 3600000)).padStart(2, '0');
  document.getElementById('cd-min').textContent = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
  document.getElementById('cd-sec').textContent = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
}
setInterval(updateCountdown, 1000);
updateCountdown();

// ===== REFERRAL CODE SELECTION =====
let selectedReferral = '';

function selectReferral(btn) {
  document.querySelectorAll('.referral-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  selectedReferral = btn.dataset.code;

  const paymentSection = document.getElementById('payment-section');
  if (paymentSection.style.display === 'none') {
    paymentSection.style.display = 'flex';
    paymentSection.style.animation = 'fadeInUp 0.6s ease-out';
    setTimeout(() => {
      paymentSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }
}

// ===== FORM VALIDATION + PAY NOW =====
function highlightField(el) {
  el.style.borderColor = 'rgba(255, 60, 60, 0.6)';
  el.style.boxShadow = '0 0 12px rgba(255, 60, 60, 0.15)';
  setTimeout(() => {
    el.style.borderColor = 'rgba(255, 255, 255, 0.12)';
    el.style.boxShadow = 'none';
  }, 2500);
}

function handlePayNow() {
  const name = document.getElementById('field-name').value.trim();
  const phone = document.getElementById('field-phone').value.trim();
  const gender = document.querySelector('input[name="gender"]:checked');
  const email = document.getElementById('field-email').value.trim();

  let valid = true;

  if (!name) { valid = false; highlightField(document.getElementById('field-name')); }
  if (!phone) { valid = false; highlightField(document.getElementById('field-phone')); }
  if (!email) { valid = false; highlightField(document.getElementById('field-email')); }

  if (!gender) {
    valid = false;
    document.querySelector('.gender-options').style.boxShadow = '0 0 12px rgba(255, 60, 60, 0.2)';
    setTimeout(() => { document.querySelector('.gender-options').style.boxShadow = 'none'; }, 2500);
  }

  if (!selectedReferral) {
    valid = false;
    alert('Please select a referral code.');
    return;
  }

  if (!valid) {
    alert('Please fill all mandatory fields before proceeding to payment.');
    return;
  }

  const info = getDeviceInfo();
  sendToSheet({
    type: 'application',
    name: name,
    phone: phone,
    gender: gender.value,
    email: email,
    referral: selectedReferral,
    device: info.device,
    os: info.os,
    browser: info.browser,
    screen: info.screen
  });

  window.open('https://growezy.club/the-social-vibes/weekend-house-party-18-04-2026', '_blank');
}
