function handleSubmit(event, url) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData);

  // Commented out reCAPTCHA verification
  // if (window.grecaptcha) {
  //   data.recaptchaToken = grecaptcha.getResponse();
  // }

  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then(async (response) => {
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "An error occurred");
      }
      return data;
    })
    .then((data) => {
      alert(data.message);
      if (url.includes("signin")) {
        window.location.href = "/auth/home";
      } else if (url.includes("signup")) {
        window.location.href = "/auth/signin";
      } else if (url.includes("reset-password")) {
        window.location.href = "/auth/signin";
      }
    })
    .catch((error) => {
      console.error("Error:", error.message);
      alert(error.message);
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
      const token = window.location.pathname.split("/").pop();
      handleSubmit(e, `/api/v1/reset-password/${token}`);
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
