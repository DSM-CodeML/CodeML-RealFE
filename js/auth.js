// 회원가입 직후 로그인 화면으로 오면 성공 배너를 보여준다. (백엔드 연결 전에는 ?signup=done 으로 확인)
if (new URLSearchParams(location.search).get('signup') === 'done') {
  document.getElementById('signup-banner').hidden = false
}
