export function createAppHTML(): string {
  return `
    <canvas id="sky"></canvas>
    <div id="ui-overlay">
      <div id="top-bar">
        <div id="stats">
          <span id="streak-display">0</span>
          <span class="stat-label">streak</span>
          <span class="stat-divider">|</span>
          <span id="score-display">0/0</span>
          <span class="stat-label">score</span>
        </div>
        <button id="menu-btn" aria-label="Menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      </div>
      <div id="question-card">
        <div id="question-label">Find this constellation:</div>
        <div id="question-name"></div>
        <div id="question-hint"></div>
      </div>
      <div id="feedback-card" class="hidden">
        <div id="feedback-icon"></div>
        <div id="feedback-text"></div>
        <button id="next-btn">Next</button>
      </div>
      <div id="zoom-controls">
        <button id="zoom-in" aria-label="Zoom in">+</button>
        <button id="zoom-out" aria-label="Zoom out">&minus;</button>
      </div>
    </div>
    <div id="menu-panel" class="hidden">
      <div id="menu-content">
        <h2>StarGuessr</h2>
        <div class="menu-section">
          <h3>Difficulty</h3>
          <div id="diff-buttons">
            <button data-diff="all" class="active">All</button>
            <button data-diff="easy">Easy</button>
            <button data-diff="medium">Medium</button>
            <button data-diff="hard">Hard</button>
          </div>
        </div>
        <div class="menu-section">
          <h3>Stats</h3>
          <div id="full-stats"></div>
        </div>
        <div class="menu-section">
          <button id="reset-btn">Reset Progress</button>
        </div>
        <button id="close-menu">Close</button>
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
  questionHint: HTMLElement;
  feedbackCard: HTMLElement;
  feedbackIcon: HTMLElement;
  feedbackText: HTMLElement;
  questionCard: HTMLElement;
  nextBtn: HTMLElement;
  menuBtn: HTMLElement;
  menuPanel: HTMLElement;
  closeMenuBtn: HTMLElement;
  zoomInBtn: HTMLElement;
  zoomOutBtn: HTMLElement;
  fullStats: HTMLElement;
  resetBtn: HTMLElement;
}

export function queryElements(): DomElements {
  const canvas = document.getElementById('sky') as HTMLCanvasElement;
  return {
    canvas,
    ctx: canvas.getContext('2d')!,
    streakDisplay: document.getElementById('streak-display')!,
    scoreDisplay: document.getElementById('score-display')!,
    questionName: document.getElementById('question-name')!,
    questionHint: document.getElementById('question-hint')!,
    feedbackCard: document.getElementById('feedback-card')!,
    feedbackIcon: document.getElementById('feedback-icon')!,
    feedbackText: document.getElementById('feedback-text')!,
    questionCard: document.getElementById('question-card')!,
    nextBtn: document.getElementById('next-btn')!,
    menuBtn: document.getElementById('menu-btn')!,
    menuPanel: document.getElementById('menu-panel')!,
    closeMenuBtn: document.getElementById('close-menu')!,
    zoomInBtn: document.getElementById('zoom-in')!,
    zoomOutBtn: document.getElementById('zoom-out')!,
    fullStats: document.getElementById('full-stats')!,
    resetBtn: document.getElementById('reset-btn')!,
  };
}
