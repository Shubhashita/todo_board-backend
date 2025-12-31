const express = require('express');
const router = express.Router();
const { authorization } = require('../middlewares/authorize');
const { permit } = require('../middlewares/admin.middleware');
const adminController = require('../controllers/admin.controller');
const { updateUserRoleValidatorSchema, toggleUserStatusValidatorSchema, updateTodoValidatorSchema } = require('../validators/admin.validate');
const { validate } = require('../validators/validate');

router.get('/stats', authorization, permit('admin'), adminController.getStats);

router.get('/users', authorization, permit('admin'), adminController.getAllUsers);

router.patch('/users/:id/status', authorization, permit('admin'), validate(toggleUserStatusValidatorSchema), adminController.toggleUserStatus);

router.patch('/users/:id/role', authorization, permit('admin'), validate(updateUserRoleValidatorSchema), adminController.changeUserRole);

router.delete('/users/:id', authorization, permit('admin'), validate(toggleUserStatusValidatorSchema), adminController.deleteUser);

router.get('/todos', authorization, permit('admin'), adminController.getAllTodos);

router.get('/users/:userId/todos', authorization, permit('admin'), adminController.getTodosByUser);

router.patch('/todos/:id', authorization, permit('admin'), validate(updateTodoValidatorSchema), adminController.updateTodo);

router.delete('/todos/:id', authorization, permit('admin'), validate(updateTodoValidatorSchema), adminController.deleteTodo);

module.exports = router;
