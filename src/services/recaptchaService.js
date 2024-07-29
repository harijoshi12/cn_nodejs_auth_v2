import axios from "axios";

export const verifyRecaptcha = async (token, action) => {
  try {
    const { data } = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
      {},
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
        },
      }
    );
    console.log(`reCAPTCHA verification response: ${data}`);
    return data.success && data.score >= 0.5 && data.action === action;
  } catch (error) {
    console.error("reCAPTCHA verification error: ", error);
    return false;
  }
};
