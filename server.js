// server.js
import dotenv from "dotenv";
import connectDB from "./src/config/database.js";
import app from "./src/app.js";

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Set the port for the server
const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
