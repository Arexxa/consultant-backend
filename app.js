// app.js
const express = require('express');
const cors = require('cors');

const registerRoutes = require('./src/routes/registerRoutes');
const loginRoutes = require('./src/routes/loginRoutes');
const adminRegisterRoutes = require('./src/routes/adminRegisterRoutes');
const workExperienceRoutes = require('./src/routes/workExperienceRoutes');
const educationRoutes = require('./src/routes/educationRoutes');
const applicationRoutes = require('./src/routes/applicationRoutes');
const profileRoutes = require('./src/routes/profileRoutes');
const companyRoutes = require('./src/routes/companyRoutes');
const registerConsultantRoute = require('./src/routes/registerConsultantRoute');
const consultantRoutes = require('./src/routes/consultantRoutes');
const pdfRoutes = require('./src/routes/pdfRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const logger = require('./src/utils/logger');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

app.use('/register', registerRoutes);
app.use('/login', loginRoutes);

app.use('/list', adminRegisterRoutes);
app.use('/admin', adminRegisterRoutes);

app.use('/experience/detail', workExperienceRoutes);

app.use('/education/detail', educationRoutes);

app.use('/application/detail', applicationRoutes);

app.use('/user/profile', profileRoutes);

app.use('/company/detail', companyRoutes);
app.use('/register/consultant', registerConsultantRoute);

app.use('/consultant/detail', consultantRoutes);

app.use('/pdf', pdfRoutes);

app.use('/admin/detail', adminRoutes);


app.get('/', (req, res) => {
  res.send('Hello from Express.js!');
});

// Middleware to log all requests
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

app.use((err, req, res, next) => {
  logger.error(`Unhandled error: ${err.message}`);
  res.status(500).json({ error: 'Internal Server Error' });
});

// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

app.listen(PORT, '192.168.1.23', () => {
  console.log(`Server is running on port ${PORT}`);
});
