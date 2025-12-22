const Label = require("../models/label.model");

const labelRepo = {
    createLabel: (data, userId) =>
        Label.create({ ...data, userId }),

    getLabel: (id, userId) =>
        Label.findOne({ _id: id, userId, isDeleted: false }),

    listLabels: (userId) =>
        Label.find({ userId, isDeleted: false }),

    updateLabel: (id, userId, data) =>
        Label.findOneAndUpdate({ _id: id, userId }, data, { new: true }),

    deleteLabel: (id, userId) =>
        Label.findOneAndUpdate({ _id: id, userId }, { isDeleted: true }, { new: true }),

    findOneWithDeleted: (name, userId) =>
        Label.findOne({ name, userId }),
};

module.exports = labelRepo;
