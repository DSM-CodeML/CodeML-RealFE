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

/* ---------- 레벨: 더미 총 XP 에서 계산 (레벨당 50XP) ---------- */
const XP_PER_LEVEL = 50
const totalXp = 120
$('level-n').textContent = 'Level ' + (Math.floor(totalXp / XP_PER_LEVEL) + 1)
$('xp-count').textContent = (totalXp % XP_PER_LEVEL) + ' / ' + XP_PER_LEVEL + ' XP'
$('xp-fill').style.width = ((totalXp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100 + '%'

/* ---------- 아이디 수정: 저장은 로컬 상태만 바꾼다 (서버 저장은 백엔드 담당) ---------- */
const username = $('username')
const saveBtn = $('save')
let saved = username.value
username.addEventListener('input', () => {
  const v = username.value.trim()
  saveBtn.disabled = v === '' || v === saved
  saveBtn.classList.remove('saved')
  saveBtn.textContent = 'Save changes'
})
$('account-form').addEventListener('submit', (e) => {
  e.preventDefault()
  if (saveBtn.disabled) return
  saved = username.value.trim()
  saveBtn.disabled = true
  saveBtn.classList.add('saved')
  saveBtn.textContent = 'Saved'
  setTimeout(() => {
    saveBtn.classList.remove('saved')
    saveBtn.textContent = 'Save changes'
  }, 2000)
})

/* ---------- Activity 잔디: levels[주][요일] (0~4) ---------- */
const WEEKS = 38
const LEVEL_STEPS = [1, 3, 5, 7] // 하루 푼 문제 수 → 1~4단계 하한 (기준 미정, 여기만 고치면 된다)
const levelOf = (n) => LEVEL_STEPS.filter((s) => n >= s).length
let seed = 7 // 시안용 더미 데이터: 시드 고정이라 새로고침해도 같은 모양
const rand = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648
const levels = Array.from({ length: WEEKS }, () =>
  Array.from({ length: 7 }, () => levelOf(rand() < 0.45 ? 0 : Math.floor(rand() * 9))))
const grid = $('heat-grid')
levels.forEach((week) => week.forEach((lv) => {
  const c = document.createElement('span')
  c.className = 'cell l' + lv
  grid.appendChild(c)
}))

/* ---------- Submissions: 더미 데이터 ---------- */
const DOT = { Accepted: 'success', 'Wrong Answer': 'wrong', 'Compile Error': 'compile' }
const submissions = [
  [1048, 'Print a word', 'Accepted', 'Python 3', 'Nov 21, 14:32'],
  [1047, 'Print a sentence', 'Accepted', 'Python 3', 'Nov 21, 14:10'],
  [1042, 'Print with quotes', 'Wrong Answer', 'Python 3', 'Nov 20, 21:05'],
  [1039, 'Input & output', 'Compile Error', 'Python 3', 'Nov 20, 20:48'],
  [1031, 'Hello, World', 'Accepted', 'Python 3', 'Nov 19, 09:12'],
]
const subBody = $('sub-body')
submissions.forEach(([id, problem, result, lang, at]) => {
  const row = document.createElement('div')
  row.className = 'sub-row'
  const cells = [id, problem, null, lang, at].map((t, i) => {
    const s = document.createElement('span')
    if (i === 2) {
      s.className = 'res'
      const img = document.createElement('img')
      img.src = 'assets/dot-' + DOT[result] + '.svg'
      img.alt = ''
      s.append(img, result)
    } else s.textContent = t
    if (i === 4) s.className = 'r'
    return s
  })
  row.append(...cells)
  subBody.appendChild(row)
})

/* Change password / Delete account 는 TODO: 확인 모달 시안과 동작이 아직 정해지지 않았다 */
