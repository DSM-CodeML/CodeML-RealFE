const $ = (id) => document.getElementById(id)
const el = (tag, cls, text) => {
  const e = document.createElement(tag)
  if (cls) e.className = cls
  if (text !== undefined) e.textContent = text
  return e
}

/* ---------- 전체 진행률 ---------- */
const totalAll = WEEKS.reduce((n, w) => n + w.total, 0)
const solvedAll = WEEKS.reduce((n, w) => n + w.solved, 0)
$('o-count').textContent = solvedAll + ' / ' + totalAll + ' problems solved'
$('o-fill').style.width = (solvedAll / totalAll) * 100 + '%'
$('w-meta').textContent = WEEKS.length + ' weeks · ' + totalAll + ' problems'

/* ---------- 주차별 아코디언: 기본으로 펼칠 주차는 지금 풀고 있는 주차 ---------- */
const currentWeek = String(PROGRESS.last ? PROGRESS.last.week : 1)

function problemRow(p) {
  const row = el('a', 'problem-row'); row.href = 'problem.html' // 문제 풀이 화면으로 바로 이동
  const dot = el('img'); dot.src = 'assets/dot-' + p.level.toLowerCase() + '.svg'; dot.alt = ''
  const badge = el('span', 'badge'); badge.append(dot, p.level)
  let status
  if (p.done) { status = el('img', 'status'); status.src = 'assets/check.svg'; status.alt = 'Solved' }
  else status = el('span', 'open-circle')
  row.append(el('span', 'row-n', pad2(p.id)), el('span', 'problem-title', p.title), badge, status)
  return row
}

WEEKS.forEach((w) => {
  const item = el('div', 'week')
  const head = el('button', 'week-main')
  head.setAttribute('aria-expanded', 'false')
  const chev = el('img'); chev.src = 'assets/chevron-down.svg'; chev.alt = ''
  head.append(
    el('span', 'week-n', 'Week ' + w.n),
    el('span', 'week-course', w.course + (w.optional ? ' (optional)' : '')),
    el('span', 'week-libs', w.libs),
    el('span', 'week-project', w.project),
    el('span', 'week-progress', w.solved + ' / ' + w.total + ' solved'),
    chev,
  )
  const body = el('div', 'week-body'); body.hidden = true
  if (w.problems.length) {
    body.append(...w.problems.map(problemRow))
    // TODO: 전체 문제 목록 펼치기는 문제 데이터가 정해지면 연결한다
    body.append(el('button', 'link-m', 'Show all ' + w.total + ' problems'))
  } else {
    body.append(el('p', 'meta', 'Problems for this week are coming soon.'))
  }
  const toggle = (open) => {
    item.classList.toggle('open', open)
    head.setAttribute('aria-expanded', String(open))
    body.hidden = !open
  }
  head.addEventListener('click', () => toggle(body.hidden))
  item.append(head, body)
  $('weeks').appendChild(item)
  if (w.n === currentWeek) toggle(true)
})
