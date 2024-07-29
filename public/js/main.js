function handleSubmit(event, url) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData);

  if (window.grecaptcha) {
    data.recaptchaToken = grecaptcha.getResponse();
  }

  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message) {
        alert(data.message);
        if (url.includes("signin") || url.includes("signup")) {
          window.location.href = "/auth/home";
        }
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    });
}

document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById("signup-form");
  const signinForm = document.getElementById("signin-form");
  const resetPasswordForm = document.getElementById("reset-password-form");
  const forgotPasswordForm = document.getElementById("forgot-password-form");
  const signoutBtn = document.getElementById("signout-btn");
  const googleSignInBtn = document.getElementById("google-signin-btn");

  // Check for token in URL (for Google Sign-In)
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");
  if (token) {
    localStorage.setItem("token", token);
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  if (signupForm) {
    signupForm.addEventListener("submit", (e) =>
      handleSubmit(e, "/api/v1/signup")
    );
  }

  if (signinForm) {
    signinForm.addEventListener("submit", (e) =>
      handleSubmit(e, "/api/v1/signin")
    );
  }

  if (resetPasswordForm) {
    resetPasswordForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const newPassword = e.target.newPassword.value;
      const confirmPassword = e.target.confirmPassword.value;
      if (newPassword !== confirmPassword) {
        alert("Passwords do not match");
        return;
      }
      handleSubmit(e, "/api/v1/reset-password");
    });
  }

  if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener("submit", (e) =>
      handleSubmit(e, "/api/v1/forgot-password")
    );
  }

  if (signoutBtn) {
    signoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("token");
      fetch("/api/v1/signout", { method: "POST" })
        .then((response) => response.json())
        .then((data) => {
          alert(data.message);
          window.location.href = "/auth/signin";
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("An error occurred during sign out. Please try again.");
        });
    });
  }

  if (googleSignInBtn) {
    googleSignInBtn.addEventListener("click", () => {
      window.location.href = "/auth/google";
    });
  }
});
