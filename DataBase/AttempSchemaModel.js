import mongoose from 'mongoose'; 

const Schema = mongoose.Schema; 

// Create Attemp Schema
const AttempSchema = new Schema({
    hashes: [String], 
    score: Number, 
    createdAt:  {
                    type: Date, 
                    default: Date.now()
                }
}); 

// Create Attemp model 
const AttempModel = mongoose.model('Attemp', AttempSchema); 

// Export Attemp Schema and Attemp Model 
export { AttempSchema, AttempModel }; 