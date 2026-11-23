// 백엔드 미연결 버튼: data-not-connected 가 붙은 요소를 누르면 모달을 띄운다.
function showNotConnected() {
  const scrim = document.createElement('div')
  scrim.className = 'scrim'
  scrim.innerHTML =
    '<div class="modal" role="dialog" aria-modal="true">' +
    '<p>아직 백엔드 연결이 되지 않았어요.</p>' +
    '<button class="btn btn-primary btn-m">확인</button></div>'
  const close = () => scrim.remove()
  scrim.addEventListener('click', (e) => { if (e.target === scrim || e.target.tagName === 'BUTTON') close() })
  document.body.appendChild(scrim)
  scrim.querySelector('button').focus()
}

document.addEventListener('click', (e) => {
  if (e.target.closest('[data-not-connected]')) showNotConnected()
})
