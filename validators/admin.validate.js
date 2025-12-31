const Joi = require('joi');
const updateUserRoleValidatorSchema = Joi.object({
    id: Joi.string().required(),
    role: Joi.string().required().valid('admin', 'user'),
});

const toggleUserStatusValidatorSchema = Joi.object({
    id: Joi.string().required(),
});

const updateTodoValidatorSchema = Joi.object({
    id: Joi.string().required(),
    title: Joi.string().optional(),
    status: Joi.string().optional().valid('pending', 'completed'),
});

module.exports = { updateUserRoleValidatorSchema, toggleUserStatusValidatorSchema, updateTodoValidatorSchema };
