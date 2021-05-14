import mongoose from 'mongoose'; 
import { ContestantSchema } from './ContestantSchemaModel.js'; 

const Schema = mongoose.Schema; 

const CompetitionSchema = new Schema({
    startDate: Date, 
    endDate: Date, 
    yearDeveloped: Number, 
    periodDeveloped: Number, // This will contain the period of the year the competitions tooke place (1, 2 or 3)
    contestants: [ ContestantSchema ], 
    ranking: [ ContestantSchema ]
}); 

// --------------  vvvvvvvvvvvvvvvvvvvvvv     I think that the first parameter could be ommited
// mongoose.model(<name_of_the_collecion>, <Schema>, <Name_to_be_stored_in_MongoDB>)
const CompetitionModel = mongoose.model('Competition', CompetitionSchema, 'Competition'); 

// Export Competition MODEL 
export { CompetitionModel }; // To store contestants and ranking of current competition

// Export Competition Schema 
export { CompetitionSchema }; // To store competition results in 'past competitions'