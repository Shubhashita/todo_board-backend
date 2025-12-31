const express = require('express');
const router = express.Router();

const userRoutes = require('./user.routes');
const todoRoutes = require('./todo.routes');
const labelRoutes = require('./label.routes');
const uploadRoutes = require('./upload.routes');
const adminRoutes = require('./admin.routes');

router.use('/user', userRoutes);

router.use('/todo', todoRoutes);

router.use('/label', labelRoutes);

router.use('/upload', uploadRoutes);

router.use('/admin', adminRoutes);

module.exports = router;
