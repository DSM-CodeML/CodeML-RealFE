// 커리큘럼 + 내 진행 상황 (home, curriculum 공용). { weeks, last, streak } 또는, 비로그인이면 null.
// 비로그인이면 common.js 가 로그인 화면으로 보낸다.
const CURRICULUM = ME.then((user) => (user ? authFetch('/api/curriculum') : null))
  .then((r) => (r && r.ok ? r.json() : null), () => null)

const pad2 = (n) => String(n).padStart(2, '0')
