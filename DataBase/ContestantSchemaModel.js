import mongoose from 'mongoose'; 
import { AttempSchema } from './AttempSchemaModel.js'; 
import bcrypt from 'bcrypt'; 

// Create Mongoose Schema
const Schema = mongoose.Schema; 

// Create User Schema 
const ContestantSchema = new Schema({
    email: String, 
    password: String, 
    firstName: String, 
    secondName: String, 
    attemps: [ { attempNumber: Number, attemp: AttempSchema } ],  // Array containing all past attemps the user has made 
    ammountOfAttemps: Number, // Number of total Attemps the user has made (use it to increment the 'attempNumber') 
    maxScore: Number // The max score obtained in all the attemps the user made 
}); 

// Method to encrypt user's password 
ContestantSchema.methods.encryptPassword = (password) => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10)); 
};

// Method to decrypt user's password --------- In this case, the 'function' notation is mandatory to get the right scope of 'this'  
ContestantSchema.methods.validatePassword = function (password) {
    return bcrypt.compareSync(password, this.password); 
}; 

// Create Contesntants model
const CurrentContestantsModel = mongoose.model('CurrentContestants', ContestantSchema, 'CurrentCompetitionContestants');

// Export Contestant model
export { CurrentContestantsModel }; // To store contestants of the current competition

// Export Contestant Schema 
export { ContestantSchema }; // To store array of contestants in Current competition   