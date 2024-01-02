import { getAllCountAPI, getLevelIdAPI, getPluginCountAPI, getRankingListAPI, updatePluginCountAPI } from './api'
import { setIsPause, useCommonPlugin, useMoneyPlugin } from './index.js'

// 左边两个按钮绑定事件
export function bindLeftButton (name) {
  document.querySelector('.show-info').onclick = function (e) {
    const target = e.target
    if (target.tagName !== 'BUTTON') return
    if (target.className.includes('achievement')) {
      showAchievement(name)
    } else {
      showRankingList(1, 0, true)
    }
  }
}

// 显示成就
async function showAchievement (name) {
  setIsPause(true)
  const achievement = document.querySelector('.show-achievement')
  achievement.style.display = 'block'
  const isGetArr = achievement.querySelectorAll('tr>td:last-child')
  const level = (await getLevelIdAPI(name)).data
  for (let i = 0; i < 5; i++) {
    if (level > i + 1) {
      isGetArr[i].innerText = '已获得'
      isGetArr[i].style.color = '#00ff00'
    } else {
      isGetArr[i].innerText = '未获得'
      isGetArr[i].style.color = 'red'
    }
  }
  bindHiddenAchievement(achievement)
}

// 隐藏成就
function bindHiddenAchievement (achievement) {
  document.querySelector('.show-achievement button').onclick = function () {
    setIsPause(false)
    achievement.style.display = 'none'
  }
}

// 显示排行榜
async function showRankingList (page, totalCount, isFirst) {
  setIsPause(true)
  if (!isFirst) {
    resetRankingList()
  }

  let coverDiv
  if (isFirst) {
    coverDiv = document.querySelector('.show-ranking')
    document.querySelector('.show-ranking button:nth-of-type(1)').onclick = previousPage
    document.querySelector('.show-ranking button:nth-of-type(2)').onclick = nextPage
    document.querySelector('.show-ranking button:nth-of-type(3)').onclick = confirm
    coverDiv.style.display = 'block'
    totalCount = (await getAllCountAPI()).data
  }

  const data = (await getRankingListAPI(page)).data
  const trs = document.querySelectorAll('.show-ranking tbody tr')
  for (let i = 0; i < data.length; i++) {
    trs[i].cells[0].innerText = ((page - 1) * 10 + i + 1).toString()
    trs[i].cells[1].innerText = data[i].name
    trs[i].cells[2].innerText = ((data[i].levelId - 1) * 100).toString()
  }

  function previousPage () {
    if (page === 1) {
      alert('已经是第一页了')
      return
    }
    showRankingList(--page, totalCount)
  }

  function nextPage () {
    if (data.length * page >= totalCount) {
      alert('已经是最后一页了')
      return
    }
    showRankingList(++page, totalCount)
  }

  function confirm () {
    coverDiv.style.display = 'none'
    setIsPause(false)
  }
}

// 重置表格内上一次数据
function resetRankingList () {
  const trs = document.querySelectorAll('.show-ranking tbody tr')
  for (let i = 0; i < 10; i++) {
    trs[i].cells[0].innerText = ''
    trs[i].cells[1].innerText = ''
    trs[i].cells[2].innerText = ''
  }
}

// 右边两个图片绑定事件
export async function bindPluginClickEvent (name) {

  const plugin = (await getPluginCountAPI(name)).data

  const moneySpanElement = document.querySelector('.plugin-top span:nth-of-type(2)')
  const commonSpanElement = document.querySelector('.plugin-bottom span:nth-of-type(2)')
  updateSpan(moneySpanElement, commonSpanElement, plugin.moneyPlugin, plugin.commonPlugin)

  // 点击事件
  document.querySelector('.plugin').onclick = async function (e) {
    const target = e.target
    if (target.tagName !== 'IMG') return
    if (target.dataset.type === '1') {
      if (plugin.moneyPlugin === 0) {
        alert('道具数量不足')
        return
      }
      useMoneyPlugin()
      plugin.moneyPlugin--
    } else {
      if (plugin.commonPlugin === 0) {
        alert('道具数量不足')
        return
      }
      useCommonPlugin()
      plugin.commonPlugin--
    }

    await updatePluginCountAPI(name, plugin.moneyPlugin, plugin.commonPlugin)
    updateSpan(moneySpanElement, commonSpanElement, plugin.moneyPlugin, plugin.commonPlugin)
  }
}

function updateSpan (moneySpanElement, commonSpanElement, moneyPlugin, commonPlugin) {
  moneySpanElement.innerText = moneyPlugin.toString()
  commonSpanElement.innerText = commonPlugin.toString()
}

export function showLevel(level){
  document.querySelector('.show-level').style.display = 'block'
  document.querySelector('.show-level .level').innerText = level.toString()
}
