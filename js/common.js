// 백엔드 미연결 버튼: data-not-connected 가 붙은 요소를 누르면 모달을 띄운다.
function showNotConnected() {
  const scrim = document.createElement("div");
  scrim.className = "scrim";
  scrim.innerHTML =
    '<div class="modal" role="dialog" aria-modal="true">' +
    "<p>아직 백엔드 연결이 되지 않았어요.</p>" +
    '<button class="btn btn-primary btn-m">확인</button></div>';
  const close = () => scrim.remove();
  scrim.addEventListener("click", (e) => {
    if (e.target === scrim || e.target.tagName === "BUTTON") close();
  });
  document.body.appendChild(scrim);
  scrim.querySelector("button").focus();
}

// 백엔드 주소. 배포 시 이 값만 바꾼다.
const API_BASE = "http://localhost:3000";

// 구글 웹 클라이언트 ID (백엔드 GOOGLE_CLIENT_ID 와 같은 값. 공개값이라 코드에 둬도 된다)
const GOOGLE_CLIENT_ID = "8934764773-7m9svqcviocodvtoo8rksjgoopgtbemq.apps.googleusercontent.com";

// 액세스 토큰은 메모리에만 둔다. 페이지가 열릴 때마다 refresh 쿠키로 새로 받는다.
// refresh 는 회전식이라 페이지당 한 번만 호출해야 한다(동시 호출 시 재사용 감지로 세션이 폐기됨).
let ACCESS_TOKEN = null;
const authFetch = (path, opts = {}) =>
  fetch(API_BASE + path, {
    ...opts,
    credentials: "include",
    headers: { ...opts.headers, Authorization: "Bearer " + ACCESS_TOKEN },
  });

// 로그인한 사용자 { id, nickname, email } (없으면 null). 페이지 스크립트는 ME.then(user => ...) 로 쓴다.
const ME = fetch(API_BASE + "/api/auth/refresh", {
  method: "POST",
  credentials: "include",
})
  .then(
    (r) => (r.ok ? r.json() : null),
    () => null,
  )
  .then((t) => {
    if (!t) return null;
    ACCESS_TOKEN = t.accessToken;
    return authFetch("/api/auth/me").then(
      (r) => (r.ok ? r.json().then((b) => b.user) : null),
      () => null,
    );
  });

// 구글 ID 토큰을 백엔드로 보내 로그인(없으면 자동 가입)한다. 로그인/회원가입 버튼이 같은 흐름이다.
function googleLogin({ credential }) {
  fetch(API_BASE + "/api/auth/google", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken: credential }),
  })
    .then((r) => {
      if (!r.ok) throw new Error(r.status);
      location.replace("home.html");
    })
    .catch(() => alert("로그인에 실패했어요. 잠시 후 다시 시도해 주세요."));
}
window.addEventListener("load", () => {
  const btns = document.querySelectorAll("[data-google]");
  if (!btns.length || !GOOGLE_CLIENT_ID || !window.google) return;
  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: googleLogin,
  });
  btns.forEach((b) => {
    // 구글 공식 버튼으로 교체 (ID 토큰은 이 버튼으로만 받을 수 있다)
    const slot = document.createElement("div");
    b.replaceWith(slot);
    google.accounts.id.renderButton(slot, {
      theme: "outline",
      size: "large",
      width: 320,
      text: b.dataset.google === "signup" ? "signup_with" : "continue_with",
    });
  });
});

ME.then((user) => {
  if (!user) {
    if (document.body.dataset.auth === "required")
      location.replace("login.html?need=login");
    return;
  }
  // 헤더: 로그인 → My page, 학습하기 → 커리큘럼
  document.querySelectorAll('.header a[href="login.html"]').forEach((a) => {
    if (a.classList.contains("navlink")) {
      a.textContent = "My page";
      a.href = "mypage.html";
    } else a.href = "curriculum.html";
  });
  // 사이드바 계정 버튼
  const avatar = document.querySelector(".sb-account .avatar");
  if (avatar) {
    avatar.textContent = user.nickname[0].toUpperCase();
    document.querySelector(".sb-account .sb-label").textContent = user.nickname;
  }
});

document.addEventListener("click", (e) => {
  if (e.target.closest("[data-logout]")) {
    fetch(API_BASE + "/api/auth/logout", {
      method: "POST",
      credentials: "include",
    }).finally(() => location.replace("index.html"));
  }
  if (e.target.closest("[data-not-connected]")) showNotConnected();
});
