const TodoModel = require('../models/todo.model');

const todoRepo = {}

todoRepo.createTodo = async (data) => {

    const todo = new TodoModel(data);
    return await todo.save({ new: true, runValidators: true });
}

todoRepo.getTodo = async (id) => {
    return await TodoModel.findById(id).populate('labels');
}

todoRepo.listTodos = async (filter) => {

    return (await TodoModel.find(filter).sort({ createdAt: -1 }).populate('labels'));
}

todoRepo.updateTodo = async (id, data) => {

    return await TodoModel.findByIdAndUpdate(id, data, { new: true });
}

todoRepo.deleteTodo = async (id) => {

    return await TodoModel.findByIdAndDelete(id);
}

todoRepo.addLabelToTodo = async (todoId, labelId) => {
    return await TodoModel.findByIdAndUpdate(todoId, { $push: { labels: labelId } }, { new: true });
}

todoRepo.removeLabelFromTodo = async (todoId, labelId) => {
    return await TodoModel.findByIdAndUpdate(todoId, { $pull: { labels: labelId } }, { new: true });
}

todoRepo.filterTodosByLabel = async (labelId, userId) => {
    return await TodoModel.find({ userId, labels: labelId, isDeleted: { $eq: false } }).populate('labels');
}

const mongoose = require('mongoose');

todoRepo.trashTodosByLabel = async (labelId, userId) => {
    return await TodoModel.updateMany(
        { userId, labels: new mongoose.Types.ObjectId(labelId) },
        { status: 'bin' }
    );
}

todoRepo.removeLabelFromTodos = async (labelId, userId) => {
    // Attempt to remove both the ObjectId and the string version to handle potential data inconsistencies
    const output = await TodoModel.updateMany(
        { userId },
        { $pull: { labels: { $in: [new mongoose.Types.ObjectId(labelId), labelId] } } }
    );
    console.log(`removeLabelFromTodos: labelId=${labelId}, matched=${output.matchedCount}, modified=${output.modifiedCount}`);
    return output;
}


module.exports = todoRepo;