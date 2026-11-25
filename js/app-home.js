const $ = (id) => document.getElementById(id)
const el = (tag, cls, text) => {
  const e = document.createElement(tag)
  if (cls) e.className = cls
  if (text !== undefined) e.textContent = text
  return e
}
const badge = (dot, label) => {
  const b = el('span', 'badge')
  const img = el('img'); img.src = 'assets/dot-' + dot + '.svg'; img.alt = ''
  b.append(img, label)
  return b
}

const XP_PER_LEVEL = 50 // mypage.js 의 레벨 계산과 같은 값

Promise.all([ME, CURRICULUM]).then(([user, data]) => {
  if (!user || !data) return
  const { weeks: WEEKS, last, streak } = data

  $('welcome').textContent = 'Welcome back, ' + user.nickname

  /* ---------- Continue 카드: 가장 최근에 제출한 문제. 제출 이력이 없으면 Week 1 의 1번 ---------- */
  const week = WEEKS.find((w) => w.n === (last ? last.week : '1'))
  const target = last ? week.problems.find((p) => p.id === last.id) : week.problems[0]
  $('c-eyebrow').textContent = 'CONTINUE · WEEK ' + week.n + ' · ' + week.course.toUpperCase()
  $('c-title').textContent = pad2(target.id) + ' · ' + target.title
  $('c-resume').href = 'problem.html?id=' + target.id
  const meta = $('c-meta')
  meta.append(badge(target.level.toLowerCase(), target.level))
  if (last) {
    const at = new Date(last.at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })
    meta.append(badge(last.result === 'Accepted' ? 'success' : 'wrong', last.result), el('span', 'meta', 'Last submitted ' + at))
  } else {
    $('c-resume').textContent = 'Start learning'
  }
  $('c-count').textContent = week.solved + ' / ' + week.total + ' solved'
  $('c-fill').style.width = (week.solved / week.total) * 100 + '%'

  /* ---------- 통계 ---------- */
  const xp = user.xp % XP_PER_LEVEL
  $('s-streak').textContent = streak
  $('s-xp').textContent = xp + ' / ' + XP_PER_LEVEL + ' XP'
  $('s-xp-fill').style.width = (xp / XP_PER_LEVEL) * 100 + '%'
  $('s-solved').textContent = WEEKS.reduce((n, w) => n + w.solved, 0)

  /* ---------- 로드맵 ---------- */
  WEEKS.forEach((w) => {
    const row = el('a', 'roadmap-row'); row.href = 'curriculum.html'
    const text = el('div', 'roadmap-text')
    const sub = w.solved + ' of ' + w.total + ' problems solved'
    text.append(el('span', 'roadmap-title', w.course), el('span', 'meta', w.optional ? 'Optional · ' + sub : sub))
    const chev = el('img'); chev.src = 'assets/chevron-down.svg'; chev.alt = ''
    row.append(el('span', 'roadmap-n', 'W' + w.n), text, chev)
    $('roadmap').appendChild(row)
  })
})
