import { Camera, lerpCamera, panCameraByScreenDelta } from './camera';

export interface AnimationState {
  cameraAnim: {
    active: boolean;
    from: Camera;
    to: Camera;
    startTime: number;
    duration: number;
  } | null;
}

export function createCameraAnimation(from: Camera, to: Camera, duration = 600): AnimationState['cameraAnim'] {
  return {
    active: true,
    from: { ...from },
    to: { ...to },
    startTime: performance.now(),
    duration,
  };
}

export function tickCameraAnimation(
  anim: AnimationState['cameraAnim'],
  now: number,
): { cam: Camera; done: boolean } | null {
  if (!anim || !anim.active) return null;

  const t = Math.min(1, (now - anim.startTime) / anim.duration);
  const cam = lerpCamera(anim.from, anim.to, t);
  return { cam, done: t >= 1 };
}

export function tickMomentum(
  cam: Camera,
  momentum: { vx: number; vy: number },
  isDragging: boolean,
): { cam: Camera; moved: boolean } {
  if (isDragging || (Math.abs(momentum.vx) <= 0.001 && Math.abs(momentum.vy) <= 0.001)) {
    return { cam, moved: false };
  }

  const newCam = panCameraByScreenDelta(cam, momentum.vx, momentum.vy);
  momentum.vx *= 0.92;
  momentum.vy *= 0.92;
  return { cam: newCam, moved: true };
}
