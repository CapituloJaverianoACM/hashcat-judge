import mongoose from 'mongoose'; 
import AttempSchema from './AttempSchema.js'; 

// Create Mongoose Schema
const Schema = mongoose.Schema; 

// Create User Schema 
const ContestantSchema = new Schema({
    email: String, 
    password: String, 
    firstName: String, 
    secondName: String, 
    attemps: [ {attempNumber: Number, attemp: AttempSchema} ],  // Array containing all past attemps the user has made 
    ammountOfAattemps: Number, // Number of total Attemps the user has made (use it to increment the 'attempNumber') 
    maxScore: Number // The max score obtained in all the attemps the user made 
}); 

// Export User Schema 
export default ContestantSchema; 