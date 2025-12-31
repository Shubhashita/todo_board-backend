const adminService = require('../services/admin.service');

const adminController = {}

adminController.getStats = async (req, res) => {
    try {
        const stats = await adminService.getStats();
        res.json(stats);
    } catch (error) {
        console.error("Error fetching stats:", error);
        res.status(500).json({ error: "Failed to fetch stats" });
    }
};

adminController.getAllUsers = async (req, res) => {
    try {
        const users = await adminService.getAllUsers();
        res.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Failed to fetch users" });
    }
};

adminController.toggleUserStatus = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await adminService.toggleUserStatus(userId);
        res.json(user);
    } catch (error) {
        console.error("Error toggling user status:", error);
        res.status(500).json({ error: "Failed to toggle user status" });
    }
};

adminController.changeUserRole = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await adminService.changeUserRole(userId);
        res.json(user);
    } catch (error) {
        console.error("Error changing user role:", error);
        res.status(500).json({ error: "Failed to change user role" });
    }
};

adminController.deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await adminService.deleteUser(userId);
        res.json(user);
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ error: "Failed to delete user" });
    }
};

adminController.getAllTodos = async (req, res) => {
    try {
        const todos = await adminService.getAllTodos();
        res.json(todos);
    } catch (error) {
        console.error("Error fetching todos:", error);
        res.status(500).json({ error: "Failed to fetch todos" });
    }
};

adminController.getTodosByUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        const todos = await adminService.getTodosByUser(userId);
        res.json(todos);
    } catch (error) {
        console.error("Error fetching todos by user:", error);
        res.status(500).json({ error: "Failed to fetch todos by user" });
    }
};

adminController.updateTodo = async (req, res) => {
    try {
        const todoId = req.params.todoId;
        const todo = await adminService.updateTodo(todoId);
        res.json(todo);
    } catch (error) {
        console.error("Error updating todo:", error);
        res.status(500).json({ error: "Failed to update todo" });
    }
};

adminController.deleteTodo = async (req, res) => {
    try {
        const todoId = req.params.todoId;
        const todo = await adminService.deleteTodo(todoId);
        res.json(todo);
    } catch (error) {
        console.error("Error deleting todo:", error);
        res.status(500).json({ error: "Failed to delete todo" });
    }
};

module.exports = adminController;