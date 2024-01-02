import { loginAPI } from './api'
import { initBackground } from './DrawBackground.js'
import { init } from './index.js'
import { bindLeftButton, bindPluginClickEvent } from './OtherFeatures.js'

document.querySelector('.game-start .cover-form').onclick = async function (e) {
  e.preventDefault()
  const target = e.target
  if (target.tagName !== 'BUTTON') return
  const name = this.querySelector('input').value.trim()
  if (!name) {
    alert('昵称不能为空')
    return
  }
  const newGame = target.value === '0'
  await loginAPI({ name, newGame })

  await start(name, newGame)
  showGameUI(name)
}

export async function start (name) {
  await initBackground()
  await init(name)
  await bindPluginClickEvent(name)
}

function showGameUI (name) {
  bindLeftButton(name)
  document.querySelector('.game-start').style.display = 'none'
  document.getElementById('bc-canvas').style.display = 'block'
  document.getElementById('main-canvas').style.display = 'block'
  document.querySelector('.show-info').style.display = 'flex'
  document.querySelector('.plugin').style.display = 'flex'
}
