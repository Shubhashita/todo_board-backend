const todoService = {}
const todoRepo = require('../repositories/todo.repo');
const labelRepo = require('../repositories/label.repo');
const fileUploadService = require('./fileUpload.service');

todoService.create = async (data, userId, files) => {
    try {
        let attachments = [];
        if (files && files.length > 0) {
            const uploadPromises = files.map(file => fileUploadService.uploadFileToMinIO(file));
            const results = await Promise.all(uploadPromises);
            attachments = results.map(result => ({
                url: result.url,
                filename: result.filename
            }));
        }

        const savedTodo = await todoRepo.createTodo(
            {
                ...data,
                attachments: attachments,
                userId: userId
            }
        );
        return {
            id: savedTodo._id,
            status: savedTodo.status,
            attachments: savedTodo.attachments
        }

    } catch (error) {
        console.log("error in create", error);
        throw error;
    }
}

todoService.list = async (query, userId) => {
    try {
        const { status, title, from, to, label } = query;
        // const filter = { userId: userId }; // Commented out to fetch ALL todos from DB as requested
        const filter = {};

        // filter for status 
        if (status) {
            filter.status = status;
        }
        // Removed default exclusion of 'bin' to show everything
        // else {
        //    filter.status = { $ne: 'bin' }; 
        // }

        // filter for title
        if (title) {
            filter.title = { $regex: title, $options: 'i' }; // case-insensitive search
        }

        // filter for date range
        if (from || to) {
            filter.createdAt = {};
            if (from) {
                filter.createdAt.$gte = new Date(from);
            }
            if (to) {
                filter.createdAt.$lte = new Date(to);
            }
        }

        // filter for label
        if (label) {
            filter.labels = label;
        }

        // default do ont return deleted todos
        filter.isDeleted = { $ne: true };

        const todoList = await todoRepo.listTodos(filter);
        return todoList;
    } catch (error) {
        console.log("error in list", error);
        throw error;
    }
}

todoService.update = async (id, data, files) => {
    try {
        // Fetch current todo
        const currentTodo = await todoRepo.getTodo(id);
        if (!currentTodo) throw new Error('Todo not found!');

        let currentAttachments = currentTodo.attachments || [];

        // Handle legacy single attachment migration if necessary (optional - mostly new todos will use array)
        if (currentAttachments.length === 0 && currentTodo.attachmentFilename) {
            currentAttachments.push({
                url: currentTodo.attachmentUrl,
                filename: currentTodo.attachmentFilename
            });
        }

        // Handle deletion of specific attachments
        if (data.deletedAttachmentFilenames) {
            const filenamesToDelete = Array.isArray(data.deletedAttachmentFilenames)
                ? data.deletedAttachmentFilenames
                : [data.deletedAttachmentFilenames]; // Ensure array if single string passed

            for (const filename of filenamesToDelete) {
                await fileUploadService.deleteFileFromMinIO(filename);
                currentAttachments = currentAttachments.filter(att => att.filename !== filename);
            }
        }

        // Also handle legacy deleteAttachment flag for backward compatibility
        if (data.deleteAttachment && currentTodo.attachmentFilename) {
            await fileUploadService.deleteFileFromMinIO(currentTodo.attachmentFilename);
            // Remove from currentAttachments if it was migrated above
            currentAttachments = currentAttachments.filter(att => att.filename !== currentTodo.attachmentFilename);
        }


        // Handle new file uploads
        if (files && files.length > 0) {
            const uploadPromises = files.map(file => fileUploadService.uploadFileToMinIO(file));
            const results = await Promise.all(uploadPromises);
            const newAttachments = results.map(result => ({
                url: result.url,
                filename: result.filename
            }));
            currentAttachments = [...currentAttachments, ...newAttachments];
        }

        const { deleteAttachment, deletedAttachmentFilenames, ...updateData } = data;

        const updatedTodo = await todoRepo.updateTodo(id, {
            ...updateData,
            attachments: currentAttachments,
            // Clear legacy fields to avoid confusion if we are fully migrating
            attachmentUrl: null,
            attachmentFilename: null
        });

        if (!updatedTodo) {
            throw new Error('Todo not found!');
        }
        return {
            id: updatedTodo._id,
            status: updatedTodo.status,
            attachments: updatedTodo.attachments
        };


    } catch (error) {
        console.log("error in update", error);
        throw error;
    }
}

todoService.delete = async (id, action = 'bin') => {
    try {
        // 1️⃣ Fetch the todo first
        const todo = await todoRepo.updateTodo(id);
        if (!todo) {
            throw new Error('Todo not found!');
        }

        // 2️⃣ Handle actions
        if (action === 'bin') {
            if (todo.status === 'bin') {
                // already in bin → permanently delete
                const deletedTodo = await todoRepo.deleteTodo(id);
                if (!deletedTodo) {
                    throw new Error('Failed to permanently delete!');
                }
                return { message: 'Todo permanently deleted' };
            } else {
                // move to bin
                const updatedTodo = await todoRepo.updateTodo(id, { status: 'bin' });
                return { message: 'Todo moved to bin', id: updatedTodo._id, status: updatedTodo.status };
            }
        } else if (action === 'restore') {
            if (todo.status !== 'bin') {
                throw new Error('Only todos in bin can be restored!');
            }
            const restoredTodo = await todoRepo.updateTodo(id, { status: 'open' });
            return { message: 'Todo restored from bin', id: restoredTodo._id, status: restoredTodo.status };
        } else if (action === 'permanent') {
            if (todo.status !== 'bin') {
                throw new Error('Todo not in bin!');
            }
            await todoRepo.deleteTodo(id);
            return { message: 'Todo permanently deleted' };
        } else {
            throw new Error('Invalid action specified!');
        }

    } catch (error) {
        console.log("error in delete", error);
        throw error;
    }
};

todoService.addLabelToTodo = async (todoId, labelId, userId) => {
    try {
        const todo = await todoRepo.updateTodo(todoId);
        if (!todo) {
            throw new Error('Todo not found!');
        }
        const label = await labelRepo.getLabel(labelId, userId);
        if (!label) {
            throw new Error('Label not found!');
        }
        const updatedTodo = await todoRepo.addLabelToTodo(todoId, labelId);
        return {
            id: updatedTodo._id,
            labels: updatedTodo.labels
        };
    } catch (error) {
        console.log("error in addLabelToTodo", error);
        throw error;
    }
};

todoService.removeLabelFromTodo = async (todoId, labelId, userId) => {
    try {
        const todo = await todoRepo.updateTodo(todoId);
        if (!todo) {
            throw new Error('Todo not found!');
        }
        const label = await labelRepo.getLabel(labelId, userId);
        if (!label) {
            throw new Error('Label not found!');
        }
        const updatedTodo = await todoRepo.removeLabelFromTodo(todoId, labelId);
        return {
            id: updatedTodo._id,
            labels: updatedTodo.labels
        };
    } catch (error) {
        console.log("error in removeLabelFromTodo", error);
        throw error;
    }
};

todoService.filterTodosByLabel = async (labelId, userId) => {
    try {
        const todos = await todoRepo.filterTodosByLabel(labelId, userId);
        return todos;
    } catch (error) {
        console.log("error in filterTodosByLabel", error);
        throw error;
    }
};


module.exports = todoService;
