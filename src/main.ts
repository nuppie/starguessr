import { Constellation } from './constellations';
import { Camera, clampCamera, zoomCamera, screenToRaDec } from './camera';
import { render, RenderState } from './renderer';
import { getFilteredConstellations, pickNextConstellation, checkTap } from './quiz';
import { loadState, saveState, recordAnswer, UserState } from './storage';
import { createAppHTML, queryElements, DomElements } from './dom';
import { setupInputHandlers } from './input';
import { createCameraAnimation, tickCameraAnimation, tickMomentum, AnimationState } from './animation';
import './style.css';

// --- App State ---
let userState: UserState = loadState();
let cam: Camera = { centerRa: 6, centerDec: 10, zoom: 8 };
let current: Constellation | null = null;
let rs: RenderState = {
  currentConstellation: null,
  highlightConstellation: null,
  showAnswer: false,
  tapResult: null,
  tapAnim: 0,
};
let camAnim: AnimationState['cameraAnim'] = null;

// --- Init DOM ---
const app = document.getElementById('app')!;
app.innerHTML = createAppHTML();
const el: DomElements = queryElements();

// --- Resize ---
function resize() {
  const dpr = window.devicePixelRatio || 1;
  el.canvas.width = window.innerWidth * dpr;
  el.canvas.height = window.innerHeight * dpr;
  el.canvas.style.width = window.innerWidth + 'px';
  el.canvas.style.height = window.innerHeight + 'px';
  el.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  renderFrame();
}
window.addEventListener('resize', resize);

// --- Input ---
const input = setupInputHandlers(el.canvas, {
  getCamera: () => cam,
  setCamera: (c) => { cam = c; },
  onTap: handleTap,
  onRender: renderFrame,
});

// --- Quiz ---
function nextQuestion() {
  const pool = getFilteredConstellations(userState.difficulty);
  if (pool.length === 0) return;

  current = pickNextConstellation(pool, userState.constellationStats, current?.id ?? null);
  rs = { currentConstellation: current, highlightConstellation: null, showAnswer: false, tapResult: null, tapAnim: 0 };
  camAnim = null;

  el.feedbackCard.classList.add('hidden');
  el.questionCard.classList.remove('hidden');
  updateStats();

  cam = clampCamera({ centerRa: Math.random() * 24, centerDec: Math.random() * 140 - 70, zoom: 6 + Math.random() * 4 });
  renderFrame();
}

function handleTap(x: number, y: number) {
  if (rs.showAnswer || !current) return;

  const { ra, dec } = screenToRaDec(x, y, cam, window.innerWidth, window.innerHeight);
  const result = checkTap(ra, dec, current, cam.zoom);

  rs = { ...rs, tapResult: { x, y, correct: result.correct }, tapAnim: 1, showAnswer: true, highlightConstellation: current };
  userState = recordAnswer(userState, current.id, result.correct);

  el.questionCard.classList.add('hidden');
  el.feedbackCard.classList.remove('hidden');
  el.feedbackIcon.textContent = result.correct ? '✓' : '✗';
  el.feedbackIcon.className = result.correct ? 'correct' : 'wrong';
  el.feedbackText.textContent = result.correct ? `That's ${current.name}!` : `That was ${current.name}`;

  camAnim = createCameraAnimation(cam, { centerRa: current.centerRa, centerDec: current.centerDec, zoom: 8 });
  updateStats();
}

function updateStats() {
  el.streakDisplay.textContent = String(userState.streak);
  el.scoreDisplay.textContent = `${userState.totalCorrect}/${userState.totalAttempts}`;
  if (current) {
    el.questionName.textContent = current.name;
    const d = current.difficulty;
    el.questionHint.textContent = d.charAt(0).toUpperCase() + d.slice(1);
    el.questionHint.className = `diff-${d}`;
  }
}

function updateFullStats() {
  const cons = getFilteredConstellations(userState.difficulty);
  let html = '<div class="stats-grid">';
  for (const c of cons) {
    const s = userState.constellationStats[c.id];
    const acc = s && s.attempts > 0 ? Math.round((s.correct / s.attempts) * 100) : 0;
    html += `<div class="stat-row">
      <span class="stat-name">${c.name}</span>
      <span class="stat-bar"><span class="stat-fill" style="width:${acc}%"></span></span>
      <span class="stat-pct">${acc}%</span>
      <span class="stat-count">(${s?.attempts ?? 0})</span>
    </div>`;
  }
  html += `</div><div class="stats-summary">Best streak: ${userState.bestStreak}</div>`;
  el.fullStats.innerHTML = html;
}

// --- Render ---
function renderFrame() {
  render(el.ctx, cam, window.innerWidth, window.innerHeight, rs);
}

function animLoop() {
  let needsRender = false;

  // Camera animation
  if (camAnim) {
    const result = tickCameraAnimation(camAnim, performance.now());
    if (result) {
      cam = result.cam;
      needsRender = true;
      if (result.done) camAnim = null;
    }
  }

  // Tap animation
  if (rs.tapAnim > 0) {
    rs = { ...rs, tapAnim: Math.max(0, rs.tapAnim - 0.02) };
    needsRender = true;
  }

  // Momentum
  const mom = tickMomentum(cam, input.momentum, input.isDragging());
  if (mom.moved) {
    cam = mom.cam;
    needsRender = true;
  }

  if (needsRender) renderFrame();
  requestAnimationFrame(animLoop);
}

// --- Button Events ---
el.zoomInBtn.addEventListener('click', () => { cam = zoomCamera(cam, 1.3); renderFrame(); });
el.zoomOutBtn.addEventListener('click', () => { cam = zoomCamera(cam, 1 / 1.3); renderFrame(); });
el.nextBtn.addEventListener('click', nextQuestion);
el.menuBtn.addEventListener('click', () => { updateFullStats(); el.menuPanel.classList.toggle('hidden'); });
el.closeMenuBtn.addEventListener('click', () => el.menuPanel.classList.add('hidden'));

document.querySelectorAll('#diff-buttons button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#diff-buttons button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    userState.difficulty = (btn as HTMLElement).dataset.diff as UserState['difficulty'];
    saveState(userState);
    nextQuestion();
  });
});

el.resetBtn.addEventListener('click', () => {
  if (confirm('Reset all progress?')) {
    userState = { totalCorrect: 0, totalAttempts: 0, streak: 0, bestStreak: 0, history: [], constellationStats: {}, difficulty: userState.difficulty };
    saveState(userState);
    updateStats();
    updateFullStats();
    nextQuestion();
  }
});

// --- Start ---
resize();
animLoop();
nextQuestion();

document.querySelectorAll('#diff-buttons button').forEach(btn => {
  (btn as HTMLElement).dataset.diff === userState.difficulty
    ? btn.classList.add('active')
    : btn.classList.remove('active');
});
