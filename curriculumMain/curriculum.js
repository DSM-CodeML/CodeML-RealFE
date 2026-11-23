// 챕터 아코디언: 챕터 행을 누르면 문제 목록을 접고 편다.
document.querySelectorAll('.chapter-row').forEach((row) => {
  row.addEventListener('click', () => {
    const open = row.getAttribute('aria-expanded') === 'true'
    row.setAttribute('aria-expanded', String(!open))
    row.nextElementSibling.hidden = open
  })
})
