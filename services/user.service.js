const userService = {}
const userRepo = require('../repositories/user.repo');
const { comparePassword } = require('../utilities/common.utility');
const { generateToken } = require('../utilities/jwt.utility');

userService.onboard = async (data) => {
    try {

        // check if email is already in use
        const existingUser = await userRepo.findUserByEmail(data.email);

        if (existingUser) {
            throw new Error('Email already in use');
        }

        // saving document
        const savedUser = await userRepo.createUser(data);
        return savedUser;
    } catch (error) {
        console.log("error in onboard", error);
        throw error;
    }
}

userService.login = async (data) => {
    try {
        // check if email is already in use
        const existingUser = await userRepo.findUserByEmail(data.email);
        if (!existingUser) {
            throw new Error('User not found!');
        }

        if (existingUser.isDeleted) {
            throw new Error('Account has been deleted!');
        }

        if (existingUser.status === 'inactive') {
            throw new Error('Account is inactive!');
        }

        // compare password
        const isMatch = await comparePassword(data.password, existingUser.password);
        if (!isMatch) {
            throw new Error('Invalid password!');
        }

        const token = generateToken({ id: existingUser._id });
        return {
            token,
            name: existingUser.name,
            email: existingUser.email,
            id: existingUser._id
        };
    } catch (error) {
        console.log("error in login", error);
        throw error;
    }
}

userService.getProfile = async (userId) => {
    try {
        const user = await userRepo.findUserById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        return {
            id: user._id,
            name: user.name,
            email: user.email,
            status: user.status
        };
    } catch (error) {
        console.log("error in getProfile", error);
        throw error;
    }
}

userService.updateProfile = async (userId, data) => {
    try {
        // limit fields that can be updated
        const updateData = {};
        if (data.name) updateData.name = data.name;
        // if (data.email) updateData.email = data.email; 

        const updatedUser = await userRepo.updateUser(userId, updateData);
        if (!updatedUser) {
            throw new Error('User not found');
        }
        return {
            id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email
        };
    } catch (error) {
        console.log("error in updateProfile", error);
        throw error;
    }
}

userService.updateAccount = async (userId, status) => {
    try {
        // check if account is already deactivated
        const isExists = await userRepo.findUserById(userId);
        if (!isExists) {
            throw new Error('User not found!');
        }
        // check if status is same as existing
        if (isExists.status === status) {
            throw new Error(`Account account is already ${status}!`);
        }
        const data = { status: status };
        const response = await userRepo.updateUser(userId, data);
        return { id: response._id, status: response.status };
    } catch (error) {
        console.log("error in updateAccount", error);
        throw error;
    }
}

userService.removeAccount = async (userId) => {
    try {
        //check if account is deleted already
        const isExists = await userRepo.findUserById(userId);
        if (!isExists) {
            throw new Error('Account already deleted');
        }

        if (isExists.isDeleted) {
            throw new Error('Account already deleted');
        }

        const data = { isDeleted: true };
        const response = await userRepo.updateUser(userId, data);
        return { id: response._id, isDeleted: response.isDeleted };

    } catch (error) {
        console.log("error in removeAccount", error);
        throw error;
    }
}
module.exports = userService;