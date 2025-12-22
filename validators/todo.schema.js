const Joi = require('joi');

const createTodoSchema = Joi.object({
    title: Joi.string().min(3).max(500).required().messages({
        "string.base": "Title must be a string",
        "string.empty": "Title cannot be empty",
        "any.required": "Title is required"
    }),

    description: Joi.alternatives()
        .try(Joi.string().max(300), Joi.number(), Joi.boolean(), Joi.object(), Joi.array())
        .optional(),

    status: Joi.string()
        .valid("open", "in-progress", "completed")
        .default("open")
        .messages({
            "any.only": "Status must be open, in-progress, or completed"
        }),

    label: Joi.string().min(1).max(50).optional().messages({
        "string.base": "Label must be a string",
        "string.max": "Label cannot exceed 50 characters"
    }),

    isPinned: Joi.boolean().optional(),
    isArchived: Joi.boolean().optional()
});

const listTodoSchema = Joi.object({
    status: Joi.string()
        .valid("open", "in-progress", "completed", "bin")
        .optional(),

    label: Joi.string().optional()
});

const updateTodoSchema = Joi.object({
    id: Joi.string().hex().length(24).required().messages({
        "string.base": "ID must be a string",
        "string.length": "ID must be 24 characters long",
        "any.required": "ID is required"
    }),

    title: Joi.string().min(3).max(500).optional().messages({
        "string.base": "Title must be a string",
        "string.empty": "Title cannot be empty"
    }),

    label: Joi.string().min(1).max(50).allow(null, '').optional().messages({
        "string.base": "Label must be a string",
        "string.max": "Label cannot exceed 50 characters"
    }),

    description: Joi.alternatives()
        .try(Joi.string().max(300), Joi.number(), Joi.boolean(), Joi.object(), Joi.array())
        .optional(),

    labels: Joi.array().items(Joi.string().hex().length(24)).single().optional(),

    status: Joi.string()
        .valid("open", "in-progress", "completed", "bin")
        .optional()
        .messages({
            "any.only": "Status must be open, in-progress, completed, or bin"
        }),

    isPinned: Joi.boolean().optional(),
    isArchived: Joi.boolean().optional(),
    deleteAttachment: Joi.boolean().optional()
});

const deleteTodoSchema = Joi.object({
    id: Joi.string().hex().length(24).required().messages({
        "string.base": "ID must be a string",
        "string.length": "ID must be 24 characters long",
        "any.required": "ID is required"
    }),
    action: Joi.string().valid('bin', 'restore', 'permanent').optional()
});


const addLabelSchema = Joi.object({
    id: Joi.string().hex().length(24).required().messages({
        "string.length": "Todo ID must be 24 characters long"
    }),
    labelId: Joi.string().hex().length(24).required().messages({
        "string.length": "Label ID must be 24 characters long",
        "any.required": "Label ID is required"
    })
});

const removeLabelSchema = Joi.object({
    id: Joi.string().hex().length(24).required().messages({
        "string.length": "Todo ID must be 24 characters long"
    }),
    labelId: Joi.string().hex().length(24).required().messages({
        "string.length": "Label ID must be 24 characters long",
        "any.required": "Label ID is required"
    })
});

const filterTodosByLabelSchema = Joi.object({
    id: Joi.string().hex().length(24).required().messages({
        "string.length": "Label ID must be 24 characters long"
    })
});


module.exports = {
    createTodoSchema,
    listTodoSchema,
    updateTodoSchema,
    deleteTodoSchema,
    addLabelSchema,
    removeLabelSchema,
    filterTodosByLabelSchema
};