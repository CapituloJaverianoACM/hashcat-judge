//----------------------------------------------------
//--                 Dependencies                   --
//----------------------------------------------------
import express from 'express'; 
import mongoose from 'mongoose'; 
//---- Read files ----
import reader from 'buffered-reader'; 
import fs from 'fs'; 
//---- Passport -----
import './Passport/LocalAuth.js'; 
import passport from 'passport'; 
import session from 'express-session'; 
import flash from 'connect-flash'; 
import methodOverride from 'method-override'; 
//---- DB ------
import { CompetitionModel } from './DataBase/CompetitionShemaModel.js'; 
import { CurrentContestantsModel as CurrentContestants } from './DataBase/ContestantSchemaModel.js'; 
import AdminModel from './DataBase/AdminModel.js';
import { AttempSchema, AttempModel } from './DataBase/AttempSchemaModel.js';


//----------------------------------------------------
//--                Server configs                  --
//----------------------------------------------------
const PORT = process.env.PORT || 3001; 
const app = express(); 
app.set('view engine', 'ejs'); 
app.use('/Public', express.static('Public')); // Tells the server where the static files are (css, plain html, images, etc)

// Function to read the file with hashes
let hashesArray = []; 
let hasTextFileChanged = false; 
const BufferedReader = reader.DataReader; 
const readHashesFromFile = async (fileName) => {

    const file = './HashFiles/' + fileName; 

    // Clear array containing hashes
    hashesArray = []; 

    // Read HashesFile ----> Async 
    const DataReader = new BufferedReader(file, { encoding: 'utf-8' }); 
    await DataReader.on('error', (error) => {
                        console.log ('error: ' + error);
                    })
                    .on('line', (line) => {
                        hashesArray.push(line.trim()); 
                    })
                    .on('end', () => {
                        console.log('File of hashes readed');
                    })
                    .read();
};
// Call function that reads hashes from text file to 
// fill array that will contain hashes
readHashesFromFile('Hashes_2021_3.txt'); 

//----------------------------------------------------
//--                  Middlewares                   --
//----------------------------------------------------
app.use(express.json()); 
app.use(express.urlencoded({ extended: false })); // False, because we aren't recieving big files
//---- Passport ----
// Configure session
app.use(session({
    secret: 'ACM-HASHCAT-JUDGE', 
    resave: false, 
    saveUninitialized: false
}));
app.use(passport.initialize()); // Initialize passport
app.use(passport.session()); // Initialize passport session  
app.use(flash()); // Flash messages
app.use(methodOverride('_method')); 

//----------------------------------------------------
//--              Database configs                  --
//----------------------------------------------------
const uri = 'mongodb+srv://admin:ACM-rules@cluster0.zw2of.mongodb.net/HashCat?retryWrites=true&w=majority';
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
        .then( () => console.log('Connection with DB succssesful'))
        .catch( (err) => console.log(err) ); 


//----------------------------------------------------
//--                   Passport                     --
//----------------------------------------------------
// The request object have a function that validates if the request is authenticated or not
const authenticateContestantRequest = (req, res, next) => {
    if (req.isAuthenticated()) return next(); 
    else res.redirect('/'); 
}; 

const isContestantAlreadyLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) return res.redirect('/attemp'); 
    else return next(); 
}; 

        
// NOTE: 
//  In this cases, we use res.render instead of res.send 
//  in order to load the EJS file 

//----------------------------------------------------
//--               Logout endpoint                  --
//----------------------------------------------------
// .delete isn't supported by default, so the library 'method-override' 
// is required
app.delete('/logout', (req, res) => {
    req.logOut(); 
    res.redirect('/'); 
}); 

//----------------------------------------------------
//--               Login endpoints                  --
//----------------------------------------------------
app.get('/', isContestantAlreadyLoggedIn, (req, res) => {
    // Render index page, passing the name of the access form 
    res.render('pages/Index', { page: 'Log-in' }); 
});

app.post('/', passport.authenticate('local-login', {
    successRedirect: '/attemp', 
    failureRedirect: '/', 
    passReqToCallback: true
})); 

//----------------------------------------------------
//--                Signup endpoints                --
//----------------------------------------------------
app.get('/sign-up', isContestantAlreadyLoggedIn, (req, res) => {
    // Render index page, passing the name of the access form
    res.render('pages/Index', { page: 'Sign-up'})
});

app.post('/sign-up', passport.authenticate('local-signup', {
    successRedirect: '/attemp', 
    failureRedirect: '/',
    passReqToCallback: true
}));

//----------------------------------------------------
//--              Attemp endpoints                  --
//----------------------------------------------------
app.get('/attemp', authenticateContestantRequest, (req, res) => {
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

    // Calculate score 
    // console.log(req); 

    res.render('pages/Attemp', { type: '', attempScore: 0 }); 
}); 

app.post('/attemp', authenticateContestantRequest, async (req, res) => {
    // Validate user input 
    // TODO : 
    //      - input > 0 
    //      - input.length === hashesArray.length

    // Get contestant _id 
    // console.log('REQ.USER ', req.user); 
    const contestantId = req.user._id;
    // Find contestant in DB
    const currentCompetition = await CompetitionModel.findOne();
    
    // const contestant = await CurrentContestants.findById(contestantId); 

    //---------   Calculate score   ---------- 
    let totalScore = 0;
    let userHashes = req.body.hashes.split('\r\n');
    // In case, the last character is '\n' 
    // (The last position will be an empty string '' beacuse of the split)
    if (userHashes[userHashes.length - 1] === '') {
        userHashes = userHashes.slice(0, userHashes.length - 1); 
    }
    // Compare hashes and calculate score
    hashesArray.forEach( (hash, index) => { totalScore += (hash === userHashes[index]) ? 10 : 0; } ); 

    //-------- Update constestant fields ---------- 
    let contestant = null; 
    currentCompetition.contestants.forEach( (_contestant) => {
        if (contestantId.toString() === _contestant._id.toString()) {
            // Max score and ammount of attemps
            _contestant.maxScore = Math.max(_contestant.maxScore, totalScore); // Update maxScore if necessary 
            _contestant.ammountOfAttemps++; // Increment the number of attemps by one 
            // Attemps 
            let attemp = new AttempModel(); // Create new Attemp
            attemp.hashes = userHashes; // Assign hashes  
            attemp.score = totalScore; // Assing score
            const attempObject = { attempNumber: _contestant.ammountOfAttemps, attemp: attemp }; 
            _contestant.attemps.push( attempObject ); // Save new attemp into attemps array
            // Save contestant
            contestant = _contestant; 
        }
    }); 

    //----------- Update competition's ranking ---------
    let ranking = currentCompetition.ranking;
    let isInRanking = false; 
    let index = 0; 
    // Check wether the contestant is in the ranking or not  
    ranking.forEach( (contestant, i) => { 
        if (contestant._id.toString() === contestantId.toString()) {
            isInRanking = true; 
            index = i; 
        }
    }); 
    // If the contestant isn't part of the ranking yet, add it 
    if (!isInRanking && contestant != null) ranking.push(contestant); 
    else {
        console.log('Contestant already in ranking'); 
        ranking[index] = (ranking[index].maxScore > contestant.maxScore) ? ranking[index] : contestant; 
    }
    // Sort ranking in asendant order3
    ranking.sort( (contestant_1, contestant_2) => { return contestant_2.maxScore - contestant_1.maxScore } );
    // Update current competition ranking 
    currentCompetition.ranking = ranking;  

    //------ Save Competition -------
    await currentCompetition.save((err, savedCompetition) => { 
        if (err) console.log(err); 
        else console.log('Competition saved : ', savedCompetition); 
    });     

    // Redirect to attemp showing the results of the attemp
    res.render('pages/Attemp', { type: '', attempScore: totalScore.toString() }); 
}); 

//----------------------------------------------------
//---            PastResults endpoints             --
//----------------------------------------------------
// Past results -------> Every podium must need to be sorted in asended order 
app.get('/past-results', authenticateContestantRequest, async (req, res) => {
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
    pastCompetitions.forEach( (comp) => console.log(comp) );
    // Render pastResults page
    res.render('pages/PastResults', { pastCompetitions: pastCompetitions }); 
});

//----------------------------------------------------
//--               Ranking endpoints                --
//----------------------------------------------------
app.get('/ranking', authenticateContestantRequest, async (req, res) => {
    // Get the current competition 
    const currentCompetition = await CompetitionModel.findOne({}); 
    console.log(currentCompetition.ranking); 
    // Get the ranking of the current compeition from the DB 
    const podium = currentCompetition.ranking.map( contestant => { return {name: contestant.firstName + ' ' + contestant.secondName, score: contestant.maxScore } }); 
    // const podium = [{name: 'Name', score: '200'}, {name: 'Name', score: '200'}, {name: 'Name', score: '200'}, {name: 'Name', score: '200'}]
    
    // Render view with ranking information 
    res.render('pages/Ranking', { contestants: podium }); 
}); 


//----------------------------------------------------
//--                About us endpoints                 --
//----------------------------------------------------
app.get('/developers', (req, res) => {
    // Render developers page
    res.render('pages/Developers', { type: '' });
});

//----------------------------------------------------
//--                Admin endpoints                 --
//----------------------------------------------------
app.get('/admin', (req, res) => {
    // Render admin page
    res.render('pages/Admin'); 
}); 


//----------------------------------------------------
//--               Default endpoint                 --
//----------------------------------------------------
// If no other route was matched -----> TO DO : Make it in ejs 
app.get('*', (req, res) => {
    res.send('<h1 style="background-color: aqua; font-weight:300; width: 100%; text-align:center; margin-top: 20rem"> Page not found <br> :(</h1>  '); 
}); 


//----------------------------------------------------
//--                Listening port                  --
//----------------------------------------------------
app.listen(PORT, () => console.log(`Server listening on :${PORT}`)); 

















/*
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

// End current competition -----> This shouldn't be a route, just some logic when the user cliks on a button 
app.post('/end-current-competition', async (req, res) => {
    // Get current competition
    // Save current competition into past competitions
    // Redirect to admin page
    res.redirect('/admin'); 
}); 

// Modify current competition --------> This shouldn't be a route, just some logic when the user cliks on a button
app.post('/modify-current-competition', async (req, res) => {
    /**
     * This section is a little bit ambiguous right now 
     * this request should be able to change all attributes of 
     * the current competition.
     * TODO : 
     *        - A competition shuld have an start date and an end date.
     *

    // Redirect to admin page
    res.redirect('/admin'); 
}); */


