//-------------------------------
//-------  Dependencies  --------
//-------------------------------
import express from 'express'; 
import mongoose from 'mongoose'; 
import bodyParser from 'body-parser'; 
//---- DB ------
import { CompetitionModel } from './Back-End/CompetitionShemaModel.js'; 


//-------------------------------
//------  Server configs  -------
//-------------------------------
const PORT = process.env.PORT || 3001; 
const app = express(); 
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 
app.set('view engine', 'ejs'); 
app.use('/Public', express.static('Public')); // Tells the server where the static files are (css, plain html, images, etc)


//-------------------------------
//-----  Database configs  ------
//-------------------------------
const uri = 'mongodb+srv://admin:ACM-rules@cluster0.zw2of.mongodb.net/HashCat?retryWrites=true&w=majority';
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
        .then( () => console.log('Connection with DB succssesful'))
        .catch( (err) => console.log(err) ); 

        
//-------------------------------
//------  GET endpoints  --------
//-------------------------------
//  In this cases, we use res.render instead of res.send 
//  in order to load the EJS file 

// Index -> Log in 
app.get('/', (req, res) => {
    // Render index page, passing the name of the access form 
    res.render('pages/Index', { page: 'Log-in' }); 
});

app.get('/sign-up', (req, res) => {
    // Render index page, passing the name of the access form
    res.render('pages/Index', { page: 'Sign-up'})
});

// Admin 
app.get('/admin', (req, res) => {
    // Render admin page
    res.render('pages/Admin'); 
}); 

// Attemp
app.get('/attemp', (req, res) => {
    // Render Attemp page
    /**
     * The idea is that when the contestant make a new attemp 
     * the post route ( .post('/new-attemp') ) will redirect to 
     * this get route ( .get('/attemp') ) and will pass the score
     * information. 
     * 
     * HOW TO DO IT : 
     *              - Constructing the URL in the post route
     *              - Using functions with the 'next()' middleware 
     */
    res.render('pages/Attemp', { type: '', attempScore: 0 }); 
}); 

// Past results -------> Every podium must need to be sorted in asended order 
app.get('/past-results', async (req, res) => {
    // This data shoul be from DB
    const user = {name: 'Juan Diego Campos', score: '100'}; 
    const competition = {
        startDate: new Date('2021-04-05'), 
        endDate: new Date('2021-05-06'), 
        yearDeveloped: 2021, 
        periodDeveloped: 2, 
        contestants: [user, user, user], 
        ranking: [user, user, user]
    };
    // Get past competitions form db
    const pastCompetitions = [competition, competition, competition]; // = await ... query 
    pastCompetitions.forEach( (comp) => console.log(comp)) ;
    // Render pastResults page
    res.render('pages/PastResults', { pastCompetitions: pastCompetitions }); 
});

//Ranking 
app.get('/ranking', async (req, res) => {
    // Get the current competition 
    const currentCompetition = await CompetitionModel.find({}); 
    // Get the ranking of the current compeition from the DB 
    const podium = currentCompetition.ranking || null; 
    // Render view with ranking information 
    res.render('pages/Ranking', { contestants: podium }); 
}); 


//-------------------------------
//------  POST endpoints  --------
//-------------------------------
app.post('/log-in', (req, res) => {
    // Check if the user is in the database
    // If constestant is in the DB, Redirect to attemp
    res.redirect('/attemp'); 
    // Otherwise redirect to login and show error message
    res.redirect('/'); 
}); 

app.post('/sign-up', async (req, res) => {
    // Create contestant object
    const newContestant = { 
        email: req.body.email,
        password: req.body.password, 
        firstName: req.body.firstName, 
        secondName: req.body.secondName, 
        attemps: [], 
        ammountOfAttemps: 0, 
        maxScore: 0
                          };
    // Get current competition 
    const competition = await CompetitionModel.find({}); // The query parameter could bw empty because there will be only one competition running 
    // Add new contestant to the competition contestants
    // Redirect to attemp
    res.redirect('/attemp'); 
});

// To make new attemp 
app.post('/new-attemp', (req, res) => {
    // Get the contestant that is making the attemp
    // Check how many correct hashes does the attemp have 
    // Compare the maxResult and update it if necessary 
    // Increment the number of attemps by one 
    // Save the attemp into the contestanst history 
    
    // Update the ranking

    // Redirect to attemp showing the results of the attemp
    res.redirect('/attemp'); 
}); 

//-----------   Admin POST requests   ------------------
// Start a new competition
app.post('/start-competition', async (req, res) => {
    // Create object competition
    const competitionObject = {
                                developedYear: req.body.developedYear,    
                                developedPeriod: req.body.developedPeriod, 
                                contestants: [], 
                                ranking: []
                              };
    // Create current competition
    const newCompetition = new CompetitionModel(competitionObject);
    // Create the new competition
    await newCompetition.save((err, dataSaved) => {
        if (err) console.log(err); 
        else console.log(dataSaved); 
    }); 
    // Redirect to the admin page
    res.redirect('/admin'); 
});

// End current competition 
app.post('/end-current-competition', async (req, res) => {
    // Get current competition
    // Save current competition into past competitions
    // Redirect to admin page
    res.redirect('/admin'); 
}); 

// Modify current competition
app.post('/modify-current-competition', async (req, res) => {
    /**
     * This section is a little bit ambiguous right now 
     * this request should be able to change all attributes of 
     * the current competition.
     * TODO : 
     *        - A competition shuld have an start date and an end date.
     */

    // Redirect to admin page
    res.redirect('/admin'); 
}); 


// If no other route was matched -----> TO DO : Make it in ejs 
app.get('*', (req, res) => {
    res.send('<h1 style="background-color: aqua; font-weight:300; width: 100%; text-align:center; margin-top: 20rem"> Page not found <br> :(</h1>  '); 
}); 


//-------------------------------
//-----  Listening port  -------
//-------------------------------
app.listen(PORT, () => console.log(`Server listening on :${PORT}`)); 