const { required } = require('joi');
const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: [String],
    },
    status: {
        type: String,
        default: 'open',
        enum: ['open', 'in-progress', 'completed', 'bin']
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    dueDate: { type: Date },
    isDeleted: {
        type: Boolean,
        default: false
    },
    isArchived: {
        type: Boolean,
        default: false
    },
    isPinned: {
        type: Boolean,
        default: false
    },
    labels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Label' }],
    attachments: [{
        url: String,
        filename: String
    }],
    attachmentUrl: { type: String }, // Deprecated
    attachmentFilename: { type: String }, // Deprecated
},
    { timestamps: true }
);

const TodoModel = mongoose.model('Todo', todoSchema);

module.exports = TodoModel;