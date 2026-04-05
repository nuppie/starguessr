import { Camera, panCamera, zoomCamera } from './camera';

export interface InputCallbacks {
  getCamera(): Camera;
  setCamera(cam: Camera): void;
  onTap(x: number, y: number): void;
  onRender(): void;
}

export function setupInputHandlers(canvas: HTMLCanvasElement, cb: InputCallbacks) {
  let isDragging = false;
  let lastPointer = { x: 0, y: 0 };
  let pinchDist = 0;
  let lastDragTime = 0;

  // Exported so animation loop can read/decay
  const momentum = { vx: 0, vy: 0 };

  function onPointerDown(x: number, y: number) {
    isDragging = true;
    lastPointer = { x, y };
    momentum.vx = 0;
    momentum.vy = 0;
    lastDragTime = performance.now();
  }

  function onPointerMove(x: number, y: number) {
    if (!isDragging) return;
    const dx = x - lastPointer.x;
    const dy = y - lastPointer.y;

    cb.setCamera(panCamera(cb.getCamera(), dx, dy));

    const now = performance.now();
    const dt = now - lastDragTime;
    if (dt > 0) {
      momentum.vx = dx / dt * 16;
      momentum.vy = dy / dt * 16;
    }
    lastDragTime = now;
    lastPointer = { x, y };
    cb.onRender();
  }

  function onPointerUp(x: number, y: number, startX: number, startY: number) {
    isDragging = false;
    const dist = Math.sqrt((x - startX) ** 2 + (y - startY) ** 2);
    if (dist < 10) cb.onTap(x, y);
  }

  // Mouse
  let mouseStart = { x: 0, y: 0 };
  canvas.addEventListener('mousedown', (e) => {
    mouseStart = { x: e.clientX, y: e.clientY };
    onPointerDown(e.clientX, e.clientY);
  });
  canvas.addEventListener('mousemove', (e) => onPointerMove(e.clientX, e.clientY));
  canvas.addEventListener('mouseup', (e) => onPointerUp(e.clientX, e.clientY, mouseStart.x, mouseStart.y));

  // Touch
  let touchStart = { x: 0, y: 0 };
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (e.touches.length === 1) {
      touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      onPointerDown(e.touches[0].clientX, e.touches[0].clientY);
    } else if (e.touches.length === 2) {
      pinchDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    }
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (e.touches.length === 1) {
      onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
    } else if (e.touches.length === 2) {
      const newDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      cb.setCamera(zoomCamera(cb.getCamera(), newDist / pinchDist));
      pinchDist = newDist;
      cb.onRender();
    }
  }, { passive: false });

  canvas.addEventListener('touchend', (e) => {
    if (e.changedTouches.length === 1) {
      onPointerUp(e.changedTouches[0].clientX, e.changedTouches[0].clientY, touchStart.x, touchStart.y);
    }
  });

  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    cb.setCamera(zoomCamera(cb.getCamera(), e.deltaY > 0 ? 0.9 : 1.1));
    cb.onRender();
  }, { passive: false });

  return {
    momentum,
    isDragging: () => isDragging,
  };
}
