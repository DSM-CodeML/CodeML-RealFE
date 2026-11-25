const $ = (id) => document.getElementById(id)
const store = {
  get(k) { try { return localStorage.getItem(k) } catch { return null } },
  set(k, v) { try { localStorage.setItem(k, v) } catch { /* 저장 불가 환경은 무시 */ } },
}

/* ---------- 사이드바 접기/펼치기 (상태는 trail 과 공유) ---------- */
const sidebar = $('sidebar')
function setCollapsed(collapsed) {
  sidebar.classList.toggle('collapsed', collapsed)
  $('sb-toggle').setAttribute('aria-expanded', String(!collapsed))
  $('sb-toggle').setAttribute('aria-label', collapsed ? 'Expand sidebar' : 'Collapse sidebar')
  store.set('cm-sidebar', collapsed ? 'collapsed' : 'expanded')
}
$('sb-toggle').addEventListener('click', () => setCollapsed(!sidebar.classList.contains('collapsed')))
setCollapsed(store.get('cm-sidebar') === 'collapsed')

/* ---------- 레벨: 총 XP 에서 계산 (레벨당 50XP) ---------- */
const XP_PER_LEVEL = 50
function showXp(totalXp) {
  $('level-n').textContent = 'Level ' + (Math.floor(totalXp / XP_PER_LEVEL) + 1)
  $('xp-count').textContent = (totalXp % XP_PER_LEVEL) + ' / ' + XP_PER_LEVEL + ' XP'
  $('xp-fill').style.width = ((totalXp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100 + '%'
}

/* ---------- 계정: 이메일/아이디/XP 는 서버 값, 아이디는 PATCH 로 저장 ---------- */
const username = $('username')
const saveBtn = $('save')
const help = $('username-help')
let saved = ''
ME.then((user) => {
  if (!user) return // 비로그인은 common.js 가 로그인 페이지로 보낸다
  $('email').value = user.email
  username.value = saved = user.nickname
  showXp(user.xp)
})
username.addEventListener('input', () => {
  const v = username.value.trim()
  saveBtn.disabled = v === '' || v === saved
  saveBtn.classList.remove('saved')
  saveBtn.textContent = 'Save changes'
  help.hidden = true
})
$('account-form').addEventListener('submit', async (e) => {
  e.preventDefault()
  if (saveBtn.disabled) return
  saveBtn.disabled = true
  try {
    const res = await authFetch('/api/auth/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname: username.value.trim() }),
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(res.status === 400 ? body.message : 'Could not save. Try again.')
    saved = username.value = body.user.nickname
    document.querySelector('.sb-account .sb-label').textContent = saved
    document.querySelector('.sb-account .avatar').textContent = saved[0].toUpperCase()
    saveBtn.classList.add('saved')
    saveBtn.textContent = 'Saved'
    setTimeout(() => {
      saveBtn.classList.remove('saved')
      saveBtn.textContent = 'Save changes'
    }, 2000)
  } catch (err) {
    help.textContent = err.message
    help.hidden = false
    saveBtn.disabled = false
  }
})

/* ---------- Activity 잔디: GET /api/grass/me (최근 365일, level 0~4 는 서버 계산) ---------- */
const WEEKS = 38
const grid = $('heat-grid')
ME.then((user) => {
  if (!user) return
  authFetch('/api/grass/me').then((r) => (r.ok ? r.json() : null), () => null).then((g) => {
    if (!g) return
    // 세로 7칸(일~토)씩 열로 채우므로 첫 날의 요일만큼 앞을 비우고, 최근 WEEKS 주만 남긴다
    const first = new Date(g.days[0].date + 'T00:00:00Z').getUTCDay()
    const lv = [...Array(first).fill(0), ...g.days.map((d) => d.level)].slice(-WEEKS * 7)
    grid.replaceChildren(...lv.map((n) => { const c = document.createElement('span'); c.className = 'cell l' + n; return c }))
  })
})

/* ---------- Submissions: GET /api/submissions/me (내 최근 제출 10건) ---------- */
const DOT = { Accepted: 'success', 'Wrong Answer': 'wrong', 'Compile Error': 'compile' }
const subBody = $('sub-body')
ME.then((user) => {
  if (!user) return
  authFetch('/api/submissions/me').then((r) => (r.ok ? r.json() : null), () => null).then((data) => {
    if (!data) return
    data.items.forEach((s) => {
      const row = document.createElement('div')
      row.className = 'sub-row'
      const at = new Date(s.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })
      const cells = [s.id, s.problemTitle, null, s.language, at].map((t, i) => {
        const c = document.createElement('span')
        if (i === 2) {
          c.className = 'res'
          const img = document.createElement('img')
          img.src = 'assets/dot-' + DOT[s.result] + '.svg'
          img.alt = ''
          c.append(img, s.result)
        } else c.textContent = t
        if (i === 4) c.className = 'r'
        return c
      })
      row.append(...cells)
      subBody.appendChild(row)
    })
  })
})

/* Change password / Delete account 는 TODO: 확인 모달 시안과 동작이 아직 정해지지 않았다 */
