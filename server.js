//-------------------------------
//-------  Dependencies  --------
//-------------------------------
import express from 'express'; 
import mongodb from 'mongodb'; 
import mongoose from 'mongoose'; 
import bodyParser from 'body-parser'; 


//-------------------------------
//------  Server configs  -------
//-------------------------------
const PORT = process.env.PORT || 3001; 
const app = express(); 
app.set('view engine', 'ejs'); 
app.use('/Public', express.static('Public')); // Tells the server where the static files are (css, plain html, images, etc)


//-------------------------------
//--------  End points  ---------
//-------------------------------
//  In this cases, we use res.render instead of res.send 
//  in order to load the EJS file 

// Index -> Log in 
app.get('/', (req, res) => {
    res.render('pages/Index', { page: 'Log-in' }); 
});

app.get('/sign-up', (req, res) => {
    res.render('pages/Index', { page: 'Sign-up'})
});

// Admin 
app.get('/admin', (req, res) => {
    res.render('pages/Admin'); 
}); 

// Attemp  ----> I think this should pass thru the auth 
app.get('/attemp', (req, res) => {
    res.render('pages/Attemp');
}); 

// Past results
const user = {name: 'Juan Diego Campos', score: '100'}; 
const resultsHistory = [{date: { year: '2020', period: '1' }, podium: [user, user, user]}, 
                        {date: { year: '2020', period: '2' }, podium: [user, user, user]}, 
                        {date: { year: '2020', period: '3' }, podium: [user, user, user]}]; 
const dates = [{year: 2020, period: 1}, {year: 2020, period: 2}, {year: 2020, period: 3}]
// Every podium shoul be in asended sorted 
app.get('/past-results', (req, res) => {
    res.render('pages/PastResults', { resultsHistory: resultsHistory, dates: dates }); 
});

//Ranking 
let contestants = [user, user, user]; 
app.get('/ranking', (req, res) => {
    res.render('pages/Ranking', { contestants: contestants }); 
}); 

// If no other route was matched -----> TO DO : Make it in ejs 
app.get('*', (req, res) => {
    res.send('<h1 style="background-color: aqua; font-weight:300; width: 100%; text-align:center; margin-top: 20rem"> Page not found <br> :(</h1>  '); 
}); 


//-------------------------------
//-----  Listening port  -------
//-------------------------------
app.listen(PORT, () => console.log(`Server listening on :${PORT}`)); 