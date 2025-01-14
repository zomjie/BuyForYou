const express = require('express');
const cors = require('cors');
const dishRoutes = require('./routes/dishRoutes');
const userRoutes = require('./routes/userRoutes');
const merchantRoutes = require('./routes/merchantRoutes');
const diningHallRoutes = require('./routes/diningHallRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/dishes', dishRoutes);
app.use('/api/users', userRoutes);
app.use('/api/merchants', merchantRoutes);
app.use('/api/dining-halls', diningHallRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 