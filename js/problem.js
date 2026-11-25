const $ = (id) => document.getElementById(id)
const store = {
  get(k, d) { try { return localStorage.getItem(k) ?? d } catch { return d } },
  set(k, v) { try { localStorage.setItem(k, v) } catch { /* 저장 불가 환경은 무시 */ } },
}

const problemId = new URLSearchParams(location.search).get('id') // problem.html?id=N

/* ---------- 왼쪽 탭 (파일철) ---------- */
document.querySelectorAll('.ptab').forEach((tab) => tab.addEventListener('click', () => selectTab(tab.dataset.tab)))
function selectTab(name) {
  document.querySelectorAll('.ptab').forEach((t) => t.classList.toggle('selected', t.dataset.tab === name))
  document.querySelectorAll('.ppanel').forEach((p) => { p.hidden = p.id !== 'panel-' + name })
}

/* ---------- 코드 에디터 ---------- */
let STARTER = '' // 문제 데이터가 도착하면 채운다 (맨 아래 PROBLEM 처리)

const KEYWORDS = 'def|for|in|return|if|elif|else|while|import|from|as|class|and|or|not|is|None|True|False|with|try|except|lambda|pass|break|continue'
const BUILTINS = 'len|zip|range|print|sum|min|max|abs|int|float|str|list|enumerate'
const TOKEN = new RegExp(`(#.*)|\\b(${KEYWORDS})\\b|\\b(${BUILTINS})\\b|\\b(\\d+(?:\\.\\d+)?)\\b`, 'g')

// shortcut: 문자열 리터럴은 색칠하지 않음, 필요해지면 토큰 규칙 추가
function highlight(src) {
  const esc = src.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return esc.replace(TOKEN, (m, cm, kw, fn) =>
    `<span class="${cm ? 'tk-cm' : kw ? 'tk-kw' : fn ? 'tk-fn' : 'tk-num'}">${m}</span>`)
}

const code = $('code')
function refreshEditor() {
  $('highlight').innerHTML = highlight(code.value) + '\n'
  $('gutter').textContent = Array.from({ length: code.value.split('\n').length }, (_, i) => i + 1).join('\n')
}
code.value = STARTER
code.addEventListener('input', refreshEditor)
code.addEventListener('keydown', (e) => {
  if (e.key !== 'Tab') return
  e.preventDefault()
  code.setRangeText('    ', code.selectionStart, code.selectionEnd, 'end')
  refreshEditor()
})
$('reset').addEventListener('click', () => { code.value = STARTER; refreshEditor() })
refreshEditor()

/* ---------- 설정 팝업 ---------- */
const settings = $('settings')
let fontSize = Number(store.get('cm-font-size', '14'))
let isPrivate = store.get('cm-private', '0') === '1'

function applySettings() {
  document.documentElement.style.setProperty('--code-size', fontSize + 'px')
  $('font-value').textContent = fontSize + ' px'
  $('private-toggle').setAttribute('aria-checked', String(isPrivate))
  $('private-toggle').firstElementChild.src = isPrivate ? 'assets/toggle-on.svg' : 'assets/toggle-off.svg'
}
function setFont(n) { fontSize = Math.min(24, Math.max(10, n)); store.set('cm-font-size', fontSize); applySettings() }

$('settings-btn').addEventListener('click', (e) => { e.stopPropagation(); settings.hidden = !settings.hidden })
$('settings-close').addEventListener('click', () => { settings.hidden = true })
$('font-minus').addEventListener('click', () => setFont(fontSize - 1))
$('font-plus').addEventListener('click', () => setFont(fontSize + 1))
$('private-toggle').addEventListener('click', () => { isPrivate = !isPrivate; store.set('cm-private', isPrivate ? '1' : '0'); applySettings() })
document.addEventListener('click', (e) => { if (!settings.hidden && !settings.contains(e.target)) settings.hidden = true })
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') settings.hidden = true })
applySettings()

/* ---------- 콘솔: 테스트케이스 / 결과 ---------- */
let CASES = [] // [{ fields: [{ label, value }] }] — 문제 데이터에서 채운다
function selectCase(i) {
  $('cases').querySelectorAll('.case').forEach((c, n) => c.classList.toggle('selected', n === i))
  $('case-fields').replaceChildren(...CASES[i].fields.map((f) => {
    const box = document.createElement('div'); box.className = 'box mono'; box.textContent = f.value
    const label = document.createElement('span'); label.className = 'field-label'; label.textContent = f.label
    const field = document.createElement('div'); field.className = 'field'; field.append(label, box)
    return field
  }))
}
function setCases(cases) {
  CASES = cases
  $('cases').replaceChildren(...CASES.map((_, i) => {
    const b = document.createElement('button')
    b.className = 'case'
    b.textContent = 'Case ' + (i + 1)
    b.addEventListener('click', () => selectCase(i))
    return b
  }))
  selectCase(0)
}

function selectConsoleTab(name) {
  document.querySelectorAll('.ctab').forEach((t) => t.classList.toggle('selected', t.dataset.ctab === name))
  $('ctab-testcase').hidden = name !== 'testcase'
  $('ctab-result').hidden = name !== 'result'
}
document.querySelectorAll('.ctab').forEach((t) => t.addEventListener('click', () => selectConsoleTab(t.dataset.ctab)))
$('console-toggle').addEventListener('click', () => { $('console').hidden = !$('console').hidden })

/* ---------- 실행 / 제출 결과: POST /api/problems/:id/run | submit ---------- */
function showResult(r, submitted) {
  const pass = r.result === 'Accepted'
  const dot = pass ? 'easy' : r.result === 'Compile Error' ? 'compile' : 'wrong'
  $('console').hidden = false
  selectConsoleTab('result')
  $('result-empty').hidden = true
  $('result-view').hidden = false
  $('result-view').querySelector('.status').className = 'status ' + (pass ? 'pass' : 'fail')
  $('result-dot').src = 'assets/dot-' + dot + '.svg'
  $('result-label').textContent = pass ? 'Passed' : r.result
  $('result-meta').textContent = r.passed + ' / ' + r.total + ' cases · ' + r.timeMs + ' ms' + (pass ? '' : ' · Case ' + r.failed.caseNumber + ' failed')
  // 숨김 케이스에서 틀리면 서버가 output/expected 를 주지 않는다
  $('result-output').textContent = pass ? '' : r.failed.output ?? '(hidden case)'
  $('result-expected').textContent = pass ? '' : r.failed.expected ?? '(hidden case)'
  if (submitted) openResultModal(r)
}

function openResultModal(r) {
  const ok = r.result === 'Accepted'
  const scrim = document.createElement('div')
  scrim.className = 'scrim'
  scrim.innerHTML = ok
    ? `<div class="result-modal" role="dialog" aria-modal="true">
         <div class="tag"><img src="assets/dot-easy.svg" alt="" />Accepted</div>
         <div class="result-copy"><h2>Correct!</h2><p class="body-m secondary">Your solution passed every test case. Nice work.</p></div>
         ${r.xpGained ? `<div class="result-xp"><span class="xp-chip"><img src="assets/icon-zap.svg" alt="" />+${r.xpGained} XP</span><span class="meta-text">Experience earned</span></div>` : ''}
         <div class="result-actions"><button class="btn btn-primary btn-l" data-act="close">Close</button></div>
       </div>`
    : `<div class="result-modal" role="dialog" aria-modal="true">
         <div class="tag"><img src="assets/dot-${r.result === 'Compile Error' ? 'compile' : 'wrong'}.svg" alt="" />${r.result}</div>
         <div class="result-copy"><h2>Not quite.</h2><p class="body-m secondary">Your output did not match the expected result on some test cases. Review the solution or try again.</p></div>
         <div class="result-actions">
           <button class="btn btn-outline btn-l" data-act="close">Close</button>
           <button class="btn btn-primary btn-l" data-act="solution">View solution</button>
         </div>
       </div>`
  scrim.addEventListener('click', (e) => {
    const act = e.target.dataset.act
    if (!act && !(e.target === scrim && !ok)) return
    scrim.remove()
    if (ok && act === 'close') location.href = 'curriculum.html' // 정답 후 닫기: 커리큘럼으로
    if (act === 'solution') selectTab('solution')
  })
  document.body.appendChild(scrim)
}

// 실행 중에는 두 버튼을 잠가 중복 제출을 막는다
async function runOrSubmit(kind) {
  const btns = [$('run-btn'), $('submit-btn')]
  btns.forEach((b) => { b.disabled = true })
  try {
    const res = await authFetch('/api/problems/' + encodeURIComponent(problemId) + '/' + kind, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code.value }),
    })
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message ?? 'Request failed')
    const r = await res.json()
    showResult(r, kind === 'submit')
    if (kind === 'submit') loadSubmissions(1)
  } catch (err) {
    alert(err.message)
  } finally {
    btns.forEach((b) => { b.disabled = false })
  }
}
$('run-btn').addEventListener('click', () => runOrSubmit('run'))
$('submit-btn').addEventListener('click', () => runOrSubmit('submit'))

/* ---------- 제출 목록 + 페이지네이션: GET /api/problems/:id/submissions?page=N (모든 회원) ---------- */
const DOT = { Accepted: 'dot-easy', 'Wrong Answer': 'dot-wrong', 'Compile Error': 'dot-compile' }
let page = 1

function renderSubmissions({ items, total, perPage }) {
  $('sub-rows').replaceChildren(...items.map((s) => {
    const row = document.createElement('div')
    row.className = 'srow'
    const at = new Date(s.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })
    row.innerHTML = `
      <span class="c-n"></span>
      <span class="c-user"><span class="avatar"></span></span>
      <span class="c-result"><img src="assets/${DOT[s.result]}.svg" alt="" /><span>${s.result}</span></span>
      <span class="c-lang"></span>
      <span class="c-time"></span>`
    // 닉네임은 사용자 입력이라 innerHTML 로 넣지 않는다
    row.querySelector('.c-n').textContent = s.id
    row.querySelector('.avatar').textContent = [...s.nickname][0].toUpperCase()
    row.querySelector('.c-user').append(s.nickname)
    row.querySelector('.c-lang').textContent = s.language
    row.querySelector('.c-time').textContent = at
    return row
  }))

  // 10개씩 묶음: 양옆 화살표는 이전/다음 묶음(예: 10 → 11)으로 이동
  const pages = Math.max(1, Math.ceil(total / perPage))
  const start = Math.floor((page - 1) / 10) * 10 + 1
  const end = Math.min(start + 9, pages)
  let html = `<button class="pg arrow" data-page="${start - 1}" aria-label="Previous pages" ${start === 1 ? 'disabled' : ''}><img src="assets/chevron-left.svg" alt="" /></button>`
  for (let n = start; n <= end; n++) html += `<button class="pg${n === page ? ' active' : ''}" data-page="${n}">${n}</button>`
  html += `<button class="pg arrow" data-page="${end + 1}" aria-label="Next pages" ${end >= pages ? 'disabled' : ''}><img src="assets/chevron-right.svg" alt="" /></button>`
  $('pagination').innerHTML = html
}
function loadSubmissions(n) {
  page = n
  authFetch('/api/problems/' + encodeURIComponent(problemId) + '/submissions?page=' + n)
    .then((r) => (r.ok ? r.json() : null), () => null)
    .then((data) => data && renderSubmissions(data))
}
$('pagination').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-page]')
  if (!b || b.disabled) return
  loadSubmissions(Number(b.dataset.page))
})

/* ---------- 문제 데이터: problem.html?id=N 을 API 에서 받아 화면을 채운다 ---------- */
if (!problemId) location.replace('curriculum.html')
else {
  ME.then((user) => (user ? authFetch('/api/problems/' + encodeURIComponent(problemId)) : null))
    .then((r) => (r && r.ok ? r.json() : null), () => null)
    .then((p) => {
      if (!p) return location.replace('curriculum.html') // 없는 문제. 비로그인은 common.js 가 로그인으로 보낸다
      document.title = p.title + ' · CodeML'
      $('p-title').textContent = p.title
      const dot = document.createElement('img'); dot.src = 'assets/dot-' + p.level.toLowerCase() + '.svg'; dot.alt = ''
      $('p-badge').replaceChildren(dot, p.level)
      $('p-xp').textContent = '+' + p.xp + ' XP'
      $('p-chapter').textContent = p.chapter
      // 서버가 직접 관리하는 HTML (problems.*_html). 사용자 입력이 아니다
      $('p-statement').innerHTML = p.statement
      $('p-solution').innerHTML = p.solution
      $('p-concept').innerHTML = p.concept
      STARTER = p.starter
      code.value = STARTER
      refreshEditor()
      setCases(p.cases)
      loadSubmissions(1)
    })
}
