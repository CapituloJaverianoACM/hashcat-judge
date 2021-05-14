const mongoose = require('mongoose'); 
const CompetitionSchema = require('./CompetitionSchemaModel.js').CompetitionSchema; 
// import mongoose from 'mongoose'; 
// import { CompetitionSchema } from './CompetitionShemaModel.js'; 

const Schema = mongoose.Schema; 

const PastCompetitionsSchema = new Schema({
    record: [ CompetitionSchema ] 
}); 

const PastCompetitionsModel = mongoose.model('PastCompetitions', PastCompetitionsSchema, 'PastCompetitions'); 

export default PastCompetitionsModel; 