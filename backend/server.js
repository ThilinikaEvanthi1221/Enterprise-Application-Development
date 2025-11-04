const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, {
    body: req.body,
    params: req.params,
    query: req.query,
    headers: {
      authorization: req.headers.authorization ? 'Bearer [token]' : 'No token',
      'content-type': req.headers['content-type']
    }
  });
  next();
});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/inventory", require("./inventory-management").routes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
