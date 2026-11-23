// 사이드바 접기/펼치기. 상태는 trail, mypage 와 같은 키(cm-sidebar)를 공유한다.
;(() => {
  const sidebar = document.getElementById('sidebar')
  const btn = document.getElementById('sb-toggle')
  const get = () => { try { return localStorage.getItem('cm-sidebar') } catch { return null } }
  const set = (v) => { try { localStorage.setItem('cm-sidebar', v) } catch { /* 저장 불가 환경은 무시 */ } }
  function setCollapsed(collapsed) {
    sidebar.classList.toggle('collapsed', collapsed)
    btn.setAttribute('aria-expanded', String(!collapsed))
    btn.setAttribute('aria-label', collapsed ? 'Expand sidebar' : 'Collapse sidebar')
    set(collapsed ? 'collapsed' : 'expanded')
  }
  btn.addEventListener('click', () => setCollapsed(!sidebar.classList.contains('collapsed')))
  setCollapsed(get() === 'collapsed')
})()
