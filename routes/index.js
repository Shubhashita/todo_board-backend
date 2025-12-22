const express = require('express');
const router = express.Router();

// all the routes are imported here
const userRoutes = require('./user.routes');
const todoRoutes = require('./todo.routes');
const labelRoutes = require('./label.routes');
const uploadRoutes = require('./upload.routes');

// all the routes are imported here
router.use('/user', userRoutes);

router.use('/todo', todoRoutes);

router.use('/label', labelRoutes);

router.use('/upload', uploadRoutes);

module.exports = router;
