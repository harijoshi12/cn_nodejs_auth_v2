# Node.js Authentication System

## Description

This project is a Node.js authentication system that includes user registration, login, password reset, and Google OAuth integration. It uses Express.js for the server, MongoDB for the database, and EJS for templating.

## Features

- User registration with email verification
- User login
- Password reset via email
- Google OAuth integration
- JWT-based authentication
- reCAPTCHA verification (commented out for now)
- Responsive UI with EJS templates

## Technologies Used

- Node.js
- Express.js
- Passport.js
- MongoDB
- Mongoose ODM
- EJS for templating

## Prerequisites

- Node.js (v14 or later)
- MongoDB

## Installation

1. Clone the repository:

```bash
https://github.com/harijoshi12/cn_nodejs_auth_v2.git
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:
   Create a `.env` file in the root directory and add the following:

```bash
PORT=3000
NODE_ENV=development

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret_key

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password

RECAPTCHA_SITE_KEY=your_recaptcha_site_key
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key
```

4. Start the server:

```bash
npm run dev
```

## API Endpoints

| Method | Endpoint                      | Description               |
| ------ | ----------------------------- | ------------------------- |
| POST   | /api/v1/signup                | Register a new user       |
| POST   | /api/v1/signin                | Log in a user             |
| POST   | /api/v1/signout               | Log out a user            |
| POST   | /api/v1/reset-password        | Reset user password       |
| POST   | /api/v1/forgot-password       | Send password reset email |
| POST   | /api/v1/reset-password/:token | Reset password with token |

## Project Structure

```bash
nodejs-auth/
│
├── src/
│   ├── config/
│   │   ├── database.js
│   │   ├── passport-setup.js
│   │   └── mailer.js
│   │
│   ├── controllers/
│   │   └── authController.js
│   │
│   ├── middlewares/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── validators.js
│   │
│   ├── models/
│   │   └── User.js
│   │
│   ├── routes/
│   │   ├── api.js
│   │   └── pages.js
│   │
│   ├── services/
│   │   ├── emailService.js
│   │   └── jwtService.js
│   │   └── recaptchaService.js
│   │
│   ├── utils/
│   │   ├── AppError.js
│   │   ├── catchAsync.js
│   │   └── responseHandler.js
│   │
│   ├── workers/
│   │   └── emailWorker.js
│   │
│   └── app.js
│
├── public/
│   ├── css/
│   │   └── styles.css
│   │
│   └── js/
│       └── main.js
│
├── views/
│   ├── signup.ejs
│   ├── signin.ejs
│   ├── home.ejs
│   ├── forgot.ejs
│   ├── reset-password.ejs
│   └── resetPassword.ejs
│
├── .env
├── .gitignore
├── package.json
├── README.md
└── server.js

```
