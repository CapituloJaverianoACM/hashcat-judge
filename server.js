//-------------------------------
//-------  Dependencies  --------
//-------------------------------
import express from 'express'; 


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

// Index
app.get('/', (req, res) => {
    res.render('pages/Index'); 
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
app.get('/past-results', (req, res) => {
    res.render('pages/PastResults'); 
});

//Ranking 
app.get('/ranking', (req, res) => {
    res.render('pages/Ranking'); 
}); 


//-------------------------------
//-----  Listening port  -------
//-------------------------------
app.listen(PORT, () => console.log(`Server listening on :${PORT}`)); 