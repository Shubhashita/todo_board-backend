const express = require('express');
const todoController = require('../controllers/todo.controller');
const { authorization } = require('../middlewares/authorize');
const { validate } = require('../validators/validate');
const { uploadV1, handleUpload } = require('../middlewares/upload.middleware');
const {
    createTodoSchema,
    listTodoSchema,
    updateTodoSchema,
    deleteTodoSchema,
    addLabelSchema,
    removeLabelSchema,
    filterTodosByLabelSchema
} = require('../validators/todo.schema');
const todoRoutes = express.Router();

todoRoutes.post('/create', authorization, handleUpload(uploadV1.array('files', 5)), validate(createTodoSchema), todoController.create);
todoRoutes.get('/list', authorization, validate(listTodoSchema), todoController.list);
todoRoutes.put('/update/:id', authorization, handleUpload(uploadV1.array('files', 5)), validate(updateTodoSchema), todoController.update);
todoRoutes.delete('/delete/:id', authorization, validate(deleteTodoSchema), todoController.delete);
todoRoutes.post('/add-label/:id', authorization, validate(addLabelSchema), todoController.addLabelToTodo);
todoRoutes.delete('/remove-label/:id', authorization, validate(removeLabelSchema), todoController.removeLabelFromTodo);
todoRoutes.get('/filter-todo-by-label/:id', authorization, validate(filterTodosByLabelSchema), todoController.filterTodosByLabel);

module.exports = todoRoutes;
