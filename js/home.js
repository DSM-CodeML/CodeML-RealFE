// 슬라이드 2, 3 문구는 시안에 없어 임의 더미 (시안은 1번만 존재)
const slides = [
  { title: 'Introducing the AI Fundamentals track', body: 'Twelve new problems on tensors, gradients, and model evaluation, each with step-by-step hints.', art: 'assets/art-ai.svg' },
  { title: 'Python Basics, now with hints', body: 'Every problem in the first chapter ships with a step-by-step walkthrough.', art: 'assets/art-python.svg' },
  { title: 'Earn XP with every accepted solution', body: 'Level up as you solve. Track your progress across the whole curriculum.', art: 'assets/art-algorithms.svg' },
]

const $ = (id) => document.getElementById(id)
const dots = $('dots')
let current = 0

slides.forEach((_, n) => {
  const d = document.createElement('button')
  d.className = 'dot'
  d.setAttribute('aria-label', 'Slide ' + (n + 1))
  d.addEventListener('click', () => show(n))
  dots.appendChild(d)
})

function show(n) {
  current = (n + slides.length) % slides.length
  const s = slides[current]
  $('slide-title').textContent = s.title
  $('slide-body').textContent = s.body
  $('slide-art').src = s.art
  ;[...dots.children].forEach((d, i) => d.classList.toggle('active', i === current))
}

$('prev').addEventListener('click', () => show(current - 1))
$('next').addEventListener('click', () => show(current + 1))
show(0)
