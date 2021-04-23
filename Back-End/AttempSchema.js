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

// Export Attemp Schema
export default AttempSchema; 