import { uiLabels } from './i18n';

export function createAppHTML(): string {
  const l = uiLabels;
  return `
    <canvas id="sky"></canvas>
    <div id="ui-overlay">
      <div id="top-bar">
        <div id="stats">
          <span id="streak-display">0</span>
          <span class="stat-label">${l.streak}</span>
          <span class="stat-divider">|</span>
          <span id="score-display">0/0</span>
          <span class="stat-label">${l.score}</span>
        </div>
        <button id="menu-btn" aria-label="${l.menu}">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      </div>
      <div id="question-card">
        <div id="question-label">${l.findConstellation}</div>
        <div id="question-name"></div>
        <div id="question-name-en"></div>
        <div id="question-hint"></div>
      </div>
      <div id="feedback-card" class="hidden">
        <div id="feedback-icon"></div>
        <div id="feedback-text"></div>
        <button id="info-btn">${l.info}</button>
        <button id="next-btn">${l.next}</button>
      </div>
      <div id="zoom-controls">
        <button id="zoom-in" aria-label="Zoom in">+</button>
        <button id="zoom-out" aria-label="Zoom out">&minus;</button>
      </div>
    </div>

    <!-- Info Panel -->
    <div id="info-panel" class="hidden">
      <div id="info-content">
        <h2 id="info-title"></h2>
        <div class="info-section">
          <h3>${l.mythology}</h3>
          <p id="info-mythology"></p>
        </div>
        <div class="info-section">
          <h3>${l.howToRemember}</h3>
          <p id="info-remember"></p>
        </div>
        <div class="info-section">
          <h3>${l.neighbors}</h3>
          <p id="info-neighbors"></p>
        </div>
        <div class="info-section">
          <h3>シーズン</h3>
          <p id="info-season"></p>
        </div>
        <button id="close-info">${l.close}</button>
      </div>
    </div>

    <!-- Menu Panel -->
    <div id="menu-panel" class="hidden">
      <div id="menu-content">
        <h2>StarGuessr</h2>

        <div class="menu-section">
          <h3>${l.difficulty}</h3>
          <div id="diff-buttons">
            <button data-diff="all" class="active">${l.all}</button>
            <button data-diff="easy">${l.easy}</button>
            <button data-diff="medium">${l.medium}</button>
            <button data-diff="hard">${l.hard}</button>
          </div>
        </div>

        <div class="menu-section">
          <h3>${l.settings}</h3>
          <div class="toggle-list">
            <label class="toggle-row">
              <span>${l.showNames}</span>
              <input type="checkbox" id="toggle-names" />
              <span class="toggle-switch"></span>
            </label>
            <label class="toggle-row">
              <span>${l.showLines}</span>
              <input type="checkbox" id="toggle-lines" checked />
              <span class="toggle-switch"></span>
            </label>
            <label class="toggle-row">
              <span>${l.showStarNames}</span>
              <input type="checkbox" id="toggle-star-names" />
              <span class="toggle-switch"></span>
            </label>
            <label class="toggle-row">
              <span>${l.showEcliptic}</span>
              <input type="checkbox" id="toggle-ecliptic" />
              <span class="toggle-switch"></span>
            </label>
            <label class="toggle-row">
              <span>${l.showEquator}</span>
              <input type="checkbox" id="toggle-equator" />
              <span class="toggle-switch"></span>
            </label>
            <label class="toggle-row">
              <span>${l.showPoles}</span>
              <input type="checkbox" id="toggle-poles" />
              <span class="toggle-switch"></span>
            </label>
          </div>
        </div>

        <div class="menu-section">
          <h3>${l.stats}</h3>
          <div id="full-stats"></div>
        </div>

        <div class="menu-section">
          <button id="reset-btn">${l.resetProgress}</button>
        </div>
        <button id="close-menu">${l.close}</button>
      </div>
    </div>
  `;
}

export interface DomElements {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  streakDisplay: HTMLElement;
  scoreDisplay: HTMLElement;
  questionName: HTMLElement;
  questionNameEn: HTMLElement;
  questionHint: HTMLElement;
  feedbackCard: HTMLElement;
  feedbackIcon: HTMLElement;
  feedbackText: HTMLElement;
  questionCard: HTMLElement;
  nextBtn: HTMLElement;
  infoBtn: HTMLElement;
  menuBtn: HTMLElement;
  menuPanel: HTMLElement;
  closeMenuBtn: HTMLElement;
  zoomInBtn: HTMLElement;
  zoomOutBtn: HTMLElement;
  fullStats: HTMLElement;
  resetBtn: HTMLElement;
  infoPanel: HTMLElement;
  infoTitle: HTMLElement;
  infoMythology: HTMLElement;
  infoRemember: HTMLElement;
  infoNeighbors: HTMLElement;
  infoSeason: HTMLElement;
  closeInfoBtn: HTMLElement;
  toggleNames: HTMLInputElement;
  toggleLines: HTMLInputElement;
  toggleStarNames: HTMLInputElement;
  toggleEcliptic: HTMLInputElement;
  toggleEquator: HTMLInputElement;
  togglePoles: HTMLInputElement;
}

export function queryElements(): DomElements {
  const canvas = document.getElementById('sky') as HTMLCanvasElement;
  return {
    canvas,
    ctx: canvas.getContext('2d')!,
    streakDisplay: document.getElementById('streak-display')!,
    scoreDisplay: document.getElementById('score-display')!,
    questionName: document.getElementById('question-name')!,
    questionNameEn: document.getElementById('question-name-en')!,
    questionHint: document.getElementById('question-hint')!,
    feedbackCard: document.getElementById('feedback-card')!,
    feedbackIcon: document.getElementById('feedback-icon')!,
    feedbackText: document.getElementById('feedback-text')!,
    questionCard: document.getElementById('question-card')!,
    nextBtn: document.getElementById('next-btn')!,
    infoBtn: document.getElementById('info-btn')!,
    menuBtn: document.getElementById('menu-btn')!,
    menuPanel: document.getElementById('menu-panel')!,
    closeMenuBtn: document.getElementById('close-menu')!,
    zoomInBtn: document.getElementById('zoom-in')!,
    zoomOutBtn: document.getElementById('zoom-out')!,
    fullStats: document.getElementById('full-stats')!,
    resetBtn: document.getElementById('reset-btn')!,
    infoPanel: document.getElementById('info-panel')!,
    infoTitle: document.getElementById('info-title')!,
    infoMythology: document.getElementById('info-mythology')!,
    infoRemember: document.getElementById('info-remember')!,
    infoNeighbors: document.getElementById('info-neighbors')!,
    infoSeason: document.getElementById('info-season')!,
    closeInfoBtn: document.getElementById('close-info')!,
    toggleNames: document.getElementById('toggle-names') as HTMLInputElement,
    toggleLines: document.getElementById('toggle-lines') as HTMLInputElement,
    toggleStarNames: document.getElementById('toggle-star-names') as HTMLInputElement,
    toggleEcliptic: document.getElementById('toggle-ecliptic') as HTMLInputElement,
    toggleEquator: document.getElementById('toggle-equator') as HTMLInputElement,
    togglePoles: document.getElementById('toggle-poles') as HTMLInputElement,
  };
}
