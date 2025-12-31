
const userModal = require('../models/users.model');
const todoModal = require('../models/todo.model');

const adminService = {}

//dashboard status
adminService.getStats = async () => {
    const totalUsers = await userModal.countDocuments();
    const totalTodos = await todoModal.countDocuments();
    const completedTodos = await todoModal.countDocuments({ status: 'completed' });
    const pendingTodos = totalTodos - completedTodos;

    return { totalUsers, totalTodos, completedTodos, pendingTodos };
}

adminService.getAllUsers = async () => {
    try {
        const users = await userModal.find();
        return users;
    } catch (error) {
        console.error("Error fetching users:", error);
        throw error;
    }
};

adminService.toggleUserStatus = async (userId) => {
    try {
        const user = await userModal.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        user.isActive = !user.isActive;
        await user.save();
        return user;
    } catch (error) {
        console.error("Error toggling user status:", error);
        throw error;
    }
};

adminService.changeUserRole = async (userId) => {
    try {
        const user = await userModal.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        user.role = "admin";
        await user.save();
        return user;
    } catch (error) {
        console.error("Error changing user role:", error);
        throw error;
    }
};

adminService.deleteUser = async (userId) => {
    try {
        const user = await userModal.findByIdAndDelete(userId);
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    } catch (error) {
        console.error("Error deleting user:", error);
        throw error;
    }
};

adminService.getAllTodos = async () => {
    try {
        const todos = await todoModal.find();
        return todos;
    } catch (error) {
        console.error("Error fetching todos:", error);
        throw error;
    }
};

adminService.getTodosByUser = async (userId) => {
    try {
        const todos = await todoModal.find({ userId });
        return todos;
    } catch (error) {
        console.error("Error fetching todos by user id:", error);
        throw error;
    }
};

adminService.updateTodo = async (todoId) => {
    try {
        const todo = await todoModal.findById(todoId);
        if (!todo) {
            throw new Error("Todo not found");
        }
        todo.completed = !todo.completed;
        await todo.save();
        return todo;
    } catch (error) {
        console.error("Error updating todo:", error);
        throw error;
    }
};

adminService.deleteTodo = async (todoId) => {
    try {
        const todo = await todoModal.findByIdAndDelete(todoId);
        if (!todo) {
            throw new Error("Todo not found");
        }
        return todo;
    } catch (error) {
        console.error("Error deleting todo:", error);
        throw error;
    }
};

module.exports = adminService;