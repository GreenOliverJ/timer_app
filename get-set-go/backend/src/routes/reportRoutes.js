const express = require('express');
const { exportPdf } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/export', protect, exportPdf);

module.exports = router;
