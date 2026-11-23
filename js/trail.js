const $ = (id) => document.getElementById(id)
const store = {
  get(k) { try { return localStorage.getItem(k) } catch { return null } },
  set(k, v) { try { localStorage.setItem(k, v) } catch { /* 저장 불가 환경은 무시 */ } },
}

/* ---------- 사이드바 접기/펼치기 ---------- */
const sidebar = $('sidebar')
function setCollapsed(collapsed) {
  sidebar.classList.toggle('collapsed', collapsed)
  $('sb-toggle').setAttribute('aria-expanded', String(!collapsed))
  $('sb-toggle').setAttribute('aria-label', collapsed ? 'Expand sidebar' : 'Collapse sidebar')
  store.set('cm-sidebar', collapsed ? 'collapsed' : 'expanded')
  drawLink()
}
$('sb-toggle').addEventListener('click', () => setCollapsed(!sidebar.classList.contains('collapsed')))

/* ---------- 현재 노드 → 오른쪽 패널 점선 ---------- */
function drawLink() {
  const body = $('trail-body').getBoundingClientRect()
  const hex = $('current-hex').getBoundingClientRect()
  const panel = $('side-panel').getBoundingClientRect()
  const link = $('link')
  link.style.left = hex.right - body.left + 1 + 'px'
  link.style.top = hex.top - body.top + hex.height / 2 + 'px'
  link.style.width = Math.max(0, panel.left - hex.right - 1) + 'px'
}
window.addEventListener('resize', drawLink)

/* ---------- 챕터 드롭다운 ---------- */
// 챕터 1 외의 레슨 데이터는 백엔드에서 오므로, 지금은 미연결 모달을 띄운다
const menu = $('chapter-menu')
function toggleMenu(open) {
  menu.hidden = !open
  $('chapter-btn').setAttribute('aria-expanded', String(open))
}
$('chapter-btn').addEventListener('click', (e) => { e.stopPropagation(); toggleMenu(menu.hidden) })
menu.addEventListener('click', (e) => {
  const li = e.target.closest('li[data-ch]')
  if (!li) return
  toggleMenu(false)
  if (li.dataset.ch !== '1') showNotConnected()
})
document.addEventListener('click', () => toggleMenu(false))
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') toggleMenu(false) })

/* ---------- 트레일 선택 배너 ---------- */
$('banner').addEventListener('click', showNotConnected)

/* ---------- 안내 말풍선 ---------- */
// shortcut: 안내 문구가 1개뿐이라 Next 도 닫기로 처리, 문구가 늘면 순서 이동으로 교체
function dismissTip() { $('tip').hidden = true; store.set('cm-trail-tip', 'closed') }
$('tip-close').addEventListener('click', dismissTip)
$('tip-next').addEventListener('click', dismissTip)
$('tip-prev').addEventListener('click', () => {})
if (store.get('cm-trail-tip') === 'closed') $('tip').hidden = true

setCollapsed(store.get('cm-sidebar') === 'collapsed')
document.fonts?.ready.then(drawLink)
drawLink()
