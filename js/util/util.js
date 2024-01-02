// 蛤蟆旋转的角度
import { isStopAPI } from '../api'

let rotateAngle = 0

// 改变角度
export function setAngle (angle) {
  rotateAngle = angle
}

// 获取角度
export function getAngle () {
  return rotateAngle
}

// 全屏canvas,创建ctx然后返回
export function createCtx (id) {
  const canvas = document.getElementById(id)
  const x = document.documentElement.clientWidth
  const y = document.documentElement.clientHeight
  // const x = 1200
  // const y = 800
  canvas.width = x
  canvas.height = y
  return canvas.getContext('2d')
}

// API节流
export const throttleIsStopAPI = throttle(isStopAPI, 8)


// 节流
export function throttle(func, delay) {
  let lastCall = 0;
  let lastValue;
  let timeoutId;

  return function(...args) {
    const context = this;
    const callNow = !timeoutId;

    if (callNow) {
      lastValue = func.apply(context, args);
      lastCall = Date.now();
    } else {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(function() {
      if (Date.now() - lastCall >= delay) {
        lastValue = func.apply(context, args);
        lastCall = Date.now();
      }
    }, delay - (Date.now() - lastCall));

    return lastValue;
  };
}

