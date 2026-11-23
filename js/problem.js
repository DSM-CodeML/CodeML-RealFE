const $ = (id) => document.getElementById(id)
const store = {
  get(k, d) { try { return localStorage.getItem(k) ?? d } catch { return d } },
  set(k, v) { try { localStorage.setItem(k, v) } catch { /* 저장 불가 환경은 무시 */ } },
}

/* ---------- 왼쪽 탭 (파일철) ---------- */
document.querySelectorAll('.ptab').forEach((tab) => tab.addEventListener('click', () => selectTab(tab.dataset.tab)))
function selectTab(name) {
  document.querySelectorAll('.ptab').forEach((t) => t.classList.toggle('selected', t.dataset.tab === name))
  document.querySelectorAll('.ppanel').forEach((p) => { p.hidden = p.id !== 'panel-' + name })
}

/* ---------- 코드 에디터 ---------- */
const STARTER = [
  'def mse(y_true, y_pred):',
  '    # Return the mean squared error',
  '    n = len(y_true)',
  '    total = 0',
  '    for a, b in zip(y_true, y_pred):',
  '        total += (a - b) ** 2',
  '    return total / n',
  '',
].join('\n')

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
// 케이스 1은 시안 값, 케이스 2·3은 임의 더미
const CASES = [
  { t: '[1.0, 2.0, 3.0]', p: '[1.0, 2.0, 4.0]' },
  { t: '[2.0, 4.0]', p: '[3.0, 5.0]' },
  { t: '[0.0, 0.0, 0.0]', p: '[1.0, 1.0, 1.0]' },
]
function selectCase(i) {
  $('cases').querySelectorAll('.case').forEach((c, n) => c.classList.toggle('selected', n === i))
  $('case-true').textContent = CASES[i].t
  $('case-pred').textContent = CASES[i].p
}
CASES.forEach((_, i) => {
  const b = document.createElement('button')
  b.className = 'case'
  b.textContent = 'Case ' + (i + 1)
  b.addEventListener('click', () => selectCase(i))
  $('cases').appendChild(b)
})
selectCase(0)

function selectConsoleTab(name) {
  document.querySelectorAll('.ctab').forEach((t) => t.classList.toggle('selected', t.dataset.ctab === name))
  $('ctab-testcase').hidden = name !== 'testcase'
  $('ctab-result').hidden = name !== 'result'
}
document.querySelectorAll('.ctab').forEach((t) => t.addEventListener('click', () => selectConsoleTab(t.dataset.ctab)))
$('console-toggle').addEventListener('click', () => { $('console').hidden = !$('console').hidden })

/* ---------- 제출 결과 (백엔드 연결 후 showResult 를 호출) ---------- */
const RESULTS = {
  accepted: { pass: true, label: 'Passed', meta: '3 / 3 cases · 38 ms', output: '0.3333', expected: '0.3333', dot: 'assets/dot-easy.svg' },
  wrong: { pass: false, label: 'Wrong answer', meta: '1 / 3 cases · Case 3 failed', output: '0.5', expected: '0.3333', dot: 'assets/dot-wrong.svg' },
}

function showResult(kind) {
  const r = RESULTS[kind]
  $('console').hidden = false
  selectConsoleTab('result')
  $('result-empty').hidden = true
  $('result-view').hidden = false
  $('result-view').querySelector('.status').className = 'status ' + (r.pass ? 'pass' : 'fail')
  $('result-dot').src = r.dot
  $('result-label').textContent = r.label
  $('result-meta').textContent = r.meta
  $('result-output').textContent = r.output
  $('result-expected').textContent = r.expected
  openResultModal(kind)
}

function openResultModal(kind) {
  const ok = kind === 'accepted'
  const scrim = document.createElement('div')
  scrim.className = 'scrim'
  scrim.innerHTML = ok
    ? `<div class="result-modal" role="dialog" aria-modal="true">
         <div class="tag"><img src="assets/dot-easy.svg" alt="" />Accepted</div>
         <div class="result-copy"><h2>Correct!</h2><p class="body-m secondary">Your solution passed every test case. Nice work.</p></div>
         <div class="result-xp"><span class="xp-chip"><img src="assets/icon-zap.svg" alt="" />+10 XP</span><span class="meta-text">Experience earned</span></div>
         <div class="result-actions"><button class="btn btn-primary btn-l" data-act="close">Close</button></div>
       </div>`
    : `<div class="result-modal" role="dialog" aria-modal="true">
         <div class="tag"><img src="assets/dot-wrong.svg" alt="" />Wrong Answer</div>
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
window.showResult = showResult

// 백엔드 연결 전 화면 확인용: problem.html?result=accepted | wrong
const demo = new URLSearchParams(location.search).get('result')
if (demo in RESULTS) showResult(demo)

/* ---------- 제출 목록 + 페이지네이션 ---------- */
const PER_PAGE = 8
const TOTAL = 4812
const PAGES = Math.ceil(TOTAL / PER_PAGE)
// 모든 페이지에서 같은 8행을 쓰는 더미 (id 만 페이지마다 달라짐)
const ROWS = [
  ['coder_ml', 'Accepted', 'Nov 11, 14:32'], ['neural_nina', 'Wrong Answer', 'Nov 11, 13:05'],
  ['byte_bear', 'Compile Error', 'Nov 11, 11:47'], ['tensor_tom', 'Accepted', 'Nov 10, 22:18'],
  ['gradient_gus', 'Accepted', 'Nov 10, 19:40'], ['loss_lee', 'Wrong Answer', 'Nov 10, 16:12'],
  ['relu_rae', 'Accepted', 'Nov 10, 09:55'], ['epoch_ed', 'Compile Error', 'Nov 9, 21:03'],
]
const DOT = { Accepted: 'dot-easy', 'Wrong Answer': 'dot-wrong', 'Compile Error': 'dot-compile' }
let page = 1

function renderSubmissions() {
  $('sub-rows').innerHTML = ROWS.map(([user, result, time], i) => `
    <div class="srow">
      <span class="c-n">${1048 - ((page - 1) * PER_PAGE + i)}</span>
      <span class="c-user"><span class="avatar">${user[0].toUpperCase()}</span>${user}</span>
      <span class="c-result"><img src="assets/${DOT[result]}.svg" alt="" /><span>${result}</span></span>
      <span class="c-lang">Python 3</span>
      <span class="c-time">${time}</span>
    </div>`).join('')

  // 10개씩 묶음: 양옆 화살표는 이전/다음 묶음(예: 10 → 11)으로 이동
  const start = Math.floor((page - 1) / 10) * 10 + 1
  const end = Math.min(start + 9, PAGES)
  let html = `<button class="pg arrow" data-page="${start - 1}" aria-label="Previous pages" ${start === 1 ? 'disabled' : ''}><img src="assets/chevron-left.svg" alt="" /></button>`
  for (let n = start; n <= end; n++) html += `<button class="pg${n === page ? ' active' : ''}" data-page="${n}">${n}</button>`
  html += `<button class="pg arrow" data-page="${end + 1}" aria-label="Next pages" ${end >= PAGES ? 'disabled' : ''}><img src="assets/chevron-right.svg" alt="" /></button>`
  $('pagination').innerHTML = html
}
$('pagination').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-page]')
  if (!b || b.disabled) return
  page = Number(b.dataset.page)
  renderSubmissions()
})
renderSubmissions()
