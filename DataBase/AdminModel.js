import mongoose from 'mongoose'; 
import bcrypt from 'bcrypt'; 

// Create Mongoose Schema
const Schema = mongoose.Schema; 

// Create Admin Schema 
const AdminSchema = new Schema({
    email: String, 
    password: String, 
    isAdmin: { type: Boolean, default: true } 
}); 

// Method to encrypt admin password 
AdminSchema.methods.encryptPassword = (password) => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10)); 
};

// Method to decrypt admin password --------- In this case, the 'function' notation is mandatory to get the right scope of 'this'  
AdminSchema.methods.validatePassword = function (password) {
    return bcrypt.compareSync(password, this.password); 
}; 

// Create Admin model
const AdminModel = mongoose.model('Admin', AdminSchema, 'Administrators');

// Export Admin model 
export default AdminModel; 