const UserModel = require("../models/users.model");

const userRepo = {}

userRepo.createUser = async (data) => {
    const user = new UserModel(data);
    return await user.save({ new: true, runValidators: true });
}

userRepo.findUserByEmail = async (email) => {
    return await UserModel.findOne({ email });
}

userRepo.findUserById = async (id) => {
    return await UserModel.findById(id);
}

userRepo.findAllUsers = async () => {
    return await UserModel.find();
}

userRepo.updateUser = async (id, data) => {
    return await UserModel.findByIdAndUpdate(id, data, { new: true });
}

module.exports = userRepo;
