// routes/applicationRoutes.js
const express = require('express');
const router = express.Router();
const { getApplication, insertApplication, updateApplication, deleteApplication  } = require('../controllers/applicationController');

router.get('/list', getApplication);
router.post('/add', insertApplication);
router.put('/update', updateApplication);
router.delete('/delete', deleteApplication);

module.exports = router;
