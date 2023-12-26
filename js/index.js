import { createCtx, getAngle } from './util/util.js'
import { getNewShotCircleAPI, hitAPI, initCircleArrAPI, initTracksAPI } from './api'

// 直线轨道
let initLine
// 所有圆形轨道的数组
let circleTrackArr = []
// 轨道上所有球
let circleArr = []
// 在蛤蟆嘴里的圆,这个坐标是相对于蛤蟆中心的坐标
let shotCircle
// ctx对象
let ctx
// 计算所有轨道的长度
let totalLength
// 圆弧上运动的平均速度
let speed

// 球在圆弧轨道运动需要的时间
const totalTime = 15
// 是否失败
let isFail = false
// Δt
let dt = 0.015
// 判断是否已经碰撞,防止不断发送请求
let isHitFlag = false

// 初始化
init()

async function init () {
  // 获取所有轨道数据
  const data = (await initTracksAPI()).data
  initLine = data[0]
  circleTrackArr = data[1]
  // 获取小球数组初始数据
  circleArr = (await initCircleArrAPI()).data
  // 获取蛤蟆嘴里的球
  shotCircle = (await getNewShotCircleAPI()).data

  ctx = createCtx('main-canvas')
  totalLength = getCircleLength()
  speed = totalLength / totalTime

  render()
}

// 渲染
function render () {
  if (isFail) {
    console.log('游戏结束,你输了')
    return
  }

  // 清空画布
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  // 没有处于发射状态的球,跟随鼠标移动
  if (!shotCircle.isShoot) {
    drawCircleInMouse(shotCircle)
  }
  circleArr.forEach(async (circle, indexInCircleArr) => {
    if (!isHitFlag && isHit(circle, shotCircle)) {
      isHitFlag = true
      // 发送请求
      // console.log(circleArr)

      circleArr = (await hitAPI(circleArr,circle,shotCircle,indexInCircleArr)).data

      // console.log(circleArr)

      // 获取新的蛤蟆嘴里的球
      shotCircle = (await getNewShotCircleAPI()).data
      isHitFlag = false
    }
    updateCircleMovingOnTrack(circle)
  })
  requestAnimationFrame(render)
}

//=====================================================

// 计算所有圆弧轨道长度,
function getCircleLength () {
  let totalLength = 0
  circleTrackArr.forEach(circle => {
    totalLength += Math.PI * circle.radius
  })
  return totalLength
}

// =====================================================

// 点击事件,发射球
document.getElementById('main-canvas').addEventListener('click', () => {
  shootingCircle()
})

// 发射球
function shootingCircle () {
  // 处于发射状态,不再发射
  if (shotCircle.isShoot) {
    return
  }

  shotCircle.cos = Math.cos(getAngle())
  shotCircle.sin = Math.sin(getAngle())
  shotCircle.x = 920 + 70 * shotCircle.cos
  shotCircle.y = 380 + 70 * shotCircle.sin
  shotCircle.isShoot = true

  // 发射球的动画
  updateShootingCircle()
}

// 发射的球的动画
async function updateShootingCircle () {
  if (!shotCircle.isShoot) {
    return
  }
  // 判断球是否出界
  if (shotCircle.x < 0 || shotCircle.x > ctx.canvas.width || shotCircle.y < 0 || shotCircle.y > ctx.canvas.height) {
    await (shotCircle = (await getNewShotCircleAPI()).data)
    return
  }
  drawFillCircle(ctx, shotCircle.x, shotCircle.y, 40, 0, Math.PI * 2, true, shotCircle.color)
  shotCircle.x += shotCircle.cos * 6
  shotCircle.y += shotCircle.sin * 6
  requestAnimationFrame(updateShootingCircle)
}

// promise链的写法?
// function updateShootingCircle() {
//   return new Promise((resolve, reject) => {
//     if (!shotCircle.isShoot) {
//       resolve();
//     } else if (shotCircle.x < 0 || shotCircle.x > ctx.canvas.width || shotCircle.y < 0 || shotCircle.y > ctx.canvas.height) {
//       axios.get('http://localhost:8080/newShotCircle')
//         .then(res => {
//           shotCircle = res.data;
//           resolve();
//         })
//     } else {
//       drawFillCircle(ctx, shotCircle.x, shotCircle.y, 40, 0, Math.PI * 2, true, shotCircle.color);
//       shotCircle.x += shotCircle.cos * 6;
//       shotCircle.y += shotCircle.sin * 6;
//       requestAnimationFrame(() => updateShootingCircle());
//       resolve();
//     }
//   });
// }

// 画最在蛤蟆嘴里的圆
function drawCircleInMouse (circle) {
  ctx.save()
  ctx.translate(920, 380)
  ctx.rotate(getAngle())
  drawFillCircle(ctx, circle.x, circle.y, 40, 0, Math.PI * 2, true, circle.color)
  ctx.restore()
}

// 填充圆的函数,带全参数
function drawFillCircle (ctx, x, y, radius, startAngle, endAngle, anticlockwise, color) {
  ctx.save()
  // console.log(shotCircle)
  // 创建渐变色
  const gradient = ctx.createRadialGradient(x - 15, y - 15, 5, x, y, radius)
  gradient.addColorStop(0, `#ffffff80`)
  gradient.addColorStop(0.4, `${color}90`)
  gradient.addColorStop(1, color)
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(x, y, radius, startAngle, endAngle, anticlockwise)
  ctx.fill()
  ctx.restore()
}

// =====================================================

// 碰撞判断
function isHit (trackCircle, shotCircle) {
  // 先判断该轨道上的球,是否在画布之外
  if (trackCircle.y < 0) {
    return false
  }
  // 判断是否碰撞
  return Math.sqrt(Math.pow(trackCircle.x - shotCircle.x, 2) + Math.pow(trackCircle.y - shotCircle.y, 2)) <= 80
}

// 在轨道内运动的球的动画
function updateCircleMovingOnTrack (circle) {
  const index = circle.index
  if (index > 3) {
    isFail = true
    return
  }
  // 在直线上
  if (index === 0) {
    // 减速
    setTimeout(() => dt = 0.002, 600)

    // 每次增加的距离
    const diffY = dt * speed
    circle.y = circle.y + diffY

    // 如果使用`circle.y`判断会有明显卡顿,使用`circle.y + diffY`没有很明显
    if (circle.y >= initLine.y2) {
      circle.index = index + 1
    }
  } else {
    // 在圆形轨道上
    const { radius, x, y, loop } = circleTrackArr[index - 1]

    // 应该在该段轨道运动的时间
    const trackTime = Math.PI * radius / totalLength * totalTime

    // 算出在该段时间内,每一次角度变化多少(Δt=0.002)
    const diffAngle = Math.PI / trackTime / 500.0
    const diffX = radius * Math.cos(circle.angle)
    const diffY = radius * Math.sin(circle.angle) * -1
    circle.angle += diffAngle

    // 从右到左还是从左到右
    if (loop) {
      // true说明:球从左到右
      circle.x = x + diffX
      circle.y = y + diffY
    } else {
      // false说明:球从右到左
      circle.x = x - diffX
      circle.y = y - diffY
    }

    if (circle.angle >= Math.PI * 2) {
      circle.index = index + 1
      circle.t = 0
      circle.angle = Math.PI
    }
  }
  // 重绘圆
  drawFillCircle(ctx, circle.x, circle.y, 40, 0, Math.PI * 2, true, circle.color)
}


