// 회원가입 직후 로그인 화면으로 오면 성공 배너를 보여준다. (백엔드 연결 전에는 ?signup=done 으로 확인)
const params = new URLSearchParams(location.search)
const banner = document.getElementById('signup-banner')
if (params.get('signup') === 'done') banner.hidden = false
if (params.get('need') === 'login') {
  banner.querySelector('span').textContent = '로그인이 필요합니다.'
  banner.hidden = false
}
