// app.js
const express = require('express');
const cors = require('cors');
const registerRoutes = require('./src/routes/registerRoutes');
const loginRoutes = require('./src/routes/loginRoutes');
const adminRegisterRoutes = require('./src/routes/adminRegisterRoutes');
const workExperienceRoutes = require('./src/routes/workExperienceRoutes');
const educationRoutes = require('./src/routes/educationRoutes');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use('/register', registerRoutes);
app.use('/login', loginRoutes);

app.use('/list', adminRegisterRoutes);
app.use('/admin', adminRegisterRoutes);

app.use('/experience/detail', workExperienceRoutes);
app.use('/experience/detail', workExperienceRoutes);

app.use('/education/detail', educationRoutes);
app.use('/education/detail', educationRoutes);

app.get('/', (req, res) => {
  res.send('Hello from Express.js!');
});

// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

app.listen(PORT, '192.168.1.23', () => {
  console.log(`Server is running on port ${PORT}`);
});
