import { createCtx, getAngle, throttleIsStopAPI } from './util/util.js'
import {
  getLevelIdAPI,
  getNewShotCircleAPI,
  hitAPI,
  initCircleArrAPI,
  initTracksAPI,
  isClearAgainAPI,
  nextLevelAPI
} from './api'
import { handleRotateImg, bindImgRotateEvent } from './DrawBackground.js'
import { start } from './Init.js'
import { showLevel } from './OtherFeatures.js'

let userName
let initLength
let startTime
let endTime
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
let isFail
// 是否结束
let isGameOver
// Δt
let dt
// 判断是否已经碰撞,防止不断发送请求
let isHitFlag
// 正在回滚中
let isRollingBack
// 从哪个索引开始回滚
let rollingBackIndex
// 暂停游戏
let isPause

export async function init (name) {
  const leveId = (await getLevelIdAPI(name)).data
  if (leveId >= 6) {
    alert('恭喜你已经全部通关！')
    return
  }
  showLevel(leveId)
  // 获取所有轨道数据
  const trackData = (await initTracksAPI()).data
  initLine = trackData[0]
  circleTrackArr = trackData[1]
  // 初始化小球数组和运动速度
  const circlesAndDtDate = (await initCircleArrAPI(name)).data
  circleArr = circlesAndDtDate[0]
  dt = circlesAndDtDate[1]
  // 获取蛤蟆嘴里的球
  shotCircle = (await getNewShotCircleAPI()).data
  // 绑定事件
  bindEvent()
  // 初始化全局变量
  resetGlobalVariable(name)
  // 减速
  setTimeout(() => dt = 0.002, dt * 20 * 1000)
  render()
}

// 渲染
function render () {
  if (isPause) return
  // 清空画布
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  // 判输
  if (!isGameOver && isFail) {
    unBindEvent()
    dt = 0.05
    console.log('游戏结束,你输了')
    isGameOver = true
    fail()
  }
  // 判赢
  if (!isGameOver && circleArr.length === 0) {
    unBindEvent()
    console.log('游戏结束,你赢了')
    // 清空画布
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    isGameOver = true
    success()
    return
  }

  if (circleArr.length === 0) return

  // 没有处于发射状态的球,跟随鼠标移动
  if (!shotCircle.isShoot) {
    drawCircleInMouse(shotCircle)
  }

  circleArr.forEach(async (circle, indexInCircleArr) => {
    // 是否有球应该回滚
    if (!isRollingBack && indexInCircleArr !== circleArr.length - 1
      && Math.sqrt(Math.pow(circle.x - circleArr[indexInCircleArr + 1].x, 2) +
        Math.pow(circleArr[indexInCircleArr + 1].y - circle.y, 2)) > 200) {

      isRollingBack = true
      rollingBackIndex = indexInCircleArr
      // 让这个球之前的球都回滚
      circleArr.forEach((circle, index) => {
        if (index <= rollingBackIndex) {
          circle.rollback = true
        }
      })
    }

    if (!isHitFlag && isHit(circle, shotCircle)) {
      isHitFlag = true
      // 发送撞击请求
      circleArr = (await hitAPI(circleArr, circle, shotCircle, indexInCircleArr)).data
      // console.log(circleArr)
      // 获取新的蛤蟆嘴里的球
      shotCircle = (await getNewShotCircleAPI()).data
      isHitFlag = false
    }

    // 判断进行哪一个动画
    if (circle.rollback) {
      updateRollbackMoving(circle, indexInCircleArr)
    } else {
      updateCircleMovingOnTrack(circle)
    }
  })
  requestAnimationFrame(render)
}

// 计算所有圆弧轨道长度,
function getCircleLength () {
  let totalLength = 0
  circleTrackArr.forEach(circle => {
    totalLength += Math.PI * circle.radius
  })
  return totalLength
}

function handleShootingCircle () {
  if (!isRollingBack && !isPause) {
    shootingCircle()
  }
}

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
  if (isPause) return
  if (circleArr.length === 0) return
  if (!shotCircle.isShoot) {
    return
  }
  // 判断球是否出界
  if (shotCircle.x < 0 || shotCircle.x > ctx.canvas.width || shotCircle.y < 0 || shotCircle.y > ctx.canvas.height) {
    shotCircle = (await getNewShotCircleAPI()).data
    return
  }
  drawFillCircle(ctx, shotCircle.x, shotCircle.y, 40, 0, Math.PI * 2, true, shotCircle.color)
  shotCircle.x += shotCircle.cos * 11
  shotCircle.y += shotCircle.sin * 11
  requestAnimationFrame(updateShootingCircle)
}

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
  if (isPause) return
  if (circleArr.length === 0) return
  const index = circle.index
  if (index > 3) {
    circleArr.shift()
    isFail = true
    return
  }
  if (isRollingBack) {
    // 重绘圆,但是不改变圆的位置
    drawFillCircle(ctx, circle.x, circle.y, 40, 0, Math.PI * 2, true, circle.color)
    return
  }

  // 在直线上
  if (index === 0) {
    // 每次增加的距离
    const diffY = dt * speed
    circle.y = circle.y + diffY

    // 如果只使用`circle.y >= diffY`的话,在刚开始加速运动时会有细微重叠,原因不知
    // 如果没有加速阶段就不会有问题
    if (circle.y + diffY >= initLine.y2) {
      circle.index = index + 1
    }
  } else {
    // 在圆形轨道上
    const { radius, x, y, loop } = circleTrackArr[index - 1]

    // 应该在该段轨道运动的时间
    const trackTime = Math.PI * radius / totalLength * totalTime

    // 算出在该段时间内,每一次角度变化多少 (数学问题,令上面直线上运动距离diffY与ΔS相等,并取这边 angle=wt中的t=1)
    const diffAngle = Math.PI * dt / trackTime
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
      circle.angle = Math.PI
    }
  }
  // 重绘圆
  drawFillCircle(ctx, circle.x, circle.y, 40, 0, Math.PI * 2, true, circle.color)
}

// 回滚动画
async function updateRollbackMoving (circle, indexInCircleArr) {
  if (isPause) return
  if (circleArr.length === 0) return
  if (!isRollingBack) {
    return
  }

  const index = circle.index
  if (index > 3) {
    isFail = true
    return
  }

  if (index !== 0) {
    // 缩小到一定范围才发请求
    const flag = indexInCircleArr === rollingBackIndex && Math.sqrt(Math.pow(circleArr[rollingBackIndex].x - circleArr[rollingBackIndex + 1].x, 2) +
      Math.pow(circleArr[rollingBackIndex].y - circleArr[rollingBackIndex + 1].y, 2)) <= 86
    // 如果在圆弧轨道已经连上了
    if (flag) {
      const stop = (await throttleIsStopAPI(circleArr[rollingBackIndex], circleArr[rollingBackIndex + 1])).data
      console.log('请求')
      if (stop) {
        circleArr.forEach((circle, i) => {
          if (i < rollingBackIndex) {
            circle.rollback = false
          }
        })
        isRollingBack = false
        circle.rollback = false
        // 能否再次清除
        circleArr = (await isClearAgainAPI(circleArr, rollingBackIndex)).data
      }
      rollbackRenderOnTrack()
    }
    if (!flag) {
      queueMicrotask(rollbackRenderOnTrack)
    }
  } else {
    rollbackRenderOnLine()
  }

  function rollbackRenderOnTrack () {
    // 在圆形轨道上
    const { radius, x, y, loop } = circleTrackArr[index - 1]

    const trackTime = Math.PI * radius / totalLength * totalTime
    const diffAngle = Math.PI * 0.01 / trackTime
    const diffX = radius * Math.cos(circle.angle)
    const diffY = radius * Math.sin(circle.angle) * -1
    circle.angle -= diffAngle

    if (loop) {
      circle.x = x + diffX
      circle.y = y + diffY
    } else {
      circle.x = x - diffX
      circle.y = y - diffY
    }

    if (circle.angle - diffAngle <= Math.PI) {
      // 如果是退入直线,不能设置为2π,否则之后前进时会出问题
      circle.angle = index === 1 ? Math.PI : Math.PI * 2
      circle.index = index - 1
    }
    // 重绘圆
    drawFillCircle(ctx, circle.x, circle.y, 40, 0, Math.PI * 2, true, circle.color)
  }

  async function rollbackRenderOnLine () {
    // 如果在直线上已经连上了
    const flag = Math.abs(circleArr[rollingBackIndex].y - circleArr[rollingBackIndex + 1].y) <= 82
    if (flag) {
      circleArr.forEach((circle, i) => {
        if (i < rollingBackIndex) {
          circle.rollback = false
        }
      })
      isRollingBack = false
      circle.rollback = false
      // 能否再次清除
      circleArr = (await isClearAgainAPI(circleArr, rollingBackIndex)).data
    }
    render()

    function render () {
      // 每次增加的距离
      const diffY = speed * 0.01
      circle.y = circle.y - diffY

      if (circle.y <= 0) {
        // isRollingBack = false
        return
      }
      // 重绘圆
      drawFillCircle(ctx, circle.x, circle.y, 40, 0, Math.PI * 2, true, circle.color)
    }
  }
}

function showGameOverUI (className, loop) {
  const divStyle = document.querySelector('.game-over').style
  const formStyle = document.querySelector(className).style
  if (loop) {
    divStyle.display = 'block'
    formStyle.display = 'block'
  } else {
    divStyle.display = 'none'
    formStyle.display = 'none'
  }
}

// 绑定事件
function bindEvent () {
  document.getElementById('main-canvas').addEventListener('click', handleShootingCircle)
  // 绑定蛤蟆随鼠标旋转
  bindImgRotateEvent(handleRotateImg)
}

function unBindEvent () {
  endTime = Date.now()
  document.getElementById('main-canvas').removeEventListener('mousemove', handleRotateImg)
  document.getElementById('main-canvas').removeEventListener('click', handleShootingCircle)
}

function resetGlobalVariable (name) {
  isFail = false
  isGameOver = false
  isHitFlag = false
  isRollingBack = false
  rollingBackIndex = -1
  isPause = false
  totalLength = getCircleLength()
  speed = totalLength / totalTime
  ctx = createCtx('main-canvas')
  initLength = circleArr.length
  startTime = Date.now()
  userName = name
}

function success () {
  setTimeout(() => {
    showGameOverUI('.success', true)
  }, 500)
  document.querySelector('.success .score').innerText = `${Math.floor(1 / ((endTime - startTime) / 1000)
    * initLength * 300)}`
  document.querySelector('.success button').onclick = async function () {
    showGameOverUI('.success', false)
    await nextLevelAPI(userName)
    await start(userName)
  }
}

function fail () {
  setTimeout(() => {
    showGameOverUI('.fail', true)
  }, 500)
  const lastCircleArrLength = circleArr.length + 1 >= initLength ? initLength : circleArr.length + 1
  console.log((endTime - startTime) / 1000, (initLength - circleArr.length) * 300)
  document.querySelector('.fail .score').innerText = `${Math.floor(1 / ((endTime - startTime) / 1000)
    * (initLength - lastCircleArrLength) * 300)}`
  document.querySelector('.fail button').onclick = async function () {
    showGameOverUI('.fail', false)
    await start(userName)
  }
}

export function setIsPause (flag) {
  isPause = flag
  if (!isPause) {
    render()
  }
}

export function useMoneyPlugin () {
  circleArr.forEach(circle => {
    circle.color = '#ff0000'
  })
  shotCircle.color = '#ff0000'
}

export function useCommonPlugin () {
  for (let i = 0; i < circleArr.length/2; i++) {
    circleArr[i].color = '#ff0000'
  }
  shotCircle.color = '#ff0000'
}

