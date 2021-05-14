//----------------------------------------------------
//--------------  Dependencies  ----------------------
//----------------------------------------------------
import passport from 'passport'; 
import { Strategy as LocalStrategy} from 'passport-local'; 
import session from 'express-session'; 
import flash from 'connect-flash'; 

//-------------- Database --------------
import { CurrentContestantsModel as CurrentContestants } from '../DataBase/ContestantSchemaModel.js'; 
import { CompetitionModel } from '../DataBase/CompetitionShemaModel.js'; 
import AdminModel from '../DataBase/AdminModel.js';


//----------------------------------------------------
//-----------  Authentication methods  ---------------
//----------------------------------------------------

/**
 * TODO : 
 * 
 *      - Make a function to get the current competition that 
 *        returns a contestant if found or null if not
 */

//------ Serialize ------
passport.serializeUser((user, done) => {
    done(null, user._id);
});

//------ Deserialize ------
passport.deserializeUser(async (id, done) => {
    // Get current competition 
    const currentCompetition = await CompetitionModel.findOne(); 
    // Get the contestant 
    currentCompetition.contestants.forEach( (contestant) => {
        // When the contestant is found, return it
        if (contestant._id == id) done(null, contestant); 
    }); 
}); 

//-----------------  Sign up  -----------------
passport.use('local-signup', new LocalStrategy({
    usernameField: 'email', 
    passwordField: 'password', 
    passReqToCallback: true
}, async (req, username, password, done) => {
    // Check input parameters to be valid 
    //---------   TODO -------------- 

    // Create new contestant
    const newContestant = new CurrentContestants(); 
    newContestant.email = username; 
    newContestant.password = newContestant.encryptPassword(password);  
    newContestant.firstName = req.body['first-name'];
    newContestant.secondName = req.body['second-name']; 
    newContestant.attemps = []; 
    newContestant.ammountOfAttemps = 0; 
    newContestant.maxScore = 0; 

    console.log('NEW USER', newContestant); 

    // Validate that the contestant isn't registered yet 
    let currentCompetition = await CompetitionModel.findOne(); // Get current competition
    for (let contestant of currentCompetition.contestants) {
        // If the contestant is already registered
        if (contestant.email === username) {
            console.log('Contestant already registered'); 
            // Exit without contestant
            return done(null, false); 
        }
    }

    // If is a new contestant, save it into the DB 
    currentCompetition.contestants.push( newContestant ); 
    await currentCompetition.save( (err, savedCompetition) => { 
        // If an error occurs, deny request 
        if(err) { 
            console.log('ERROR SIGN-UP : ', err); 
            done(err) 
        }
        // Otherwhise, show contestant in console
        else console.log('New competition : ', savedCompetition); 
    });

    // Return new contestant 
    return done(null, newContestant); 
})); 

//-----------------  Log in  -----------------
passport.use('local-login', new LocalStrategy({
    usernameField: 'email', 
    passwordField: 'password', 
    passReqToCallback: true
}, async (req, username, password, done) => {
    // Check invalid input parameters
    //----- TODO --------

    // Variables to verify if is a contestant or a admin
    let isAdmin = false, isContestant = false; 

    // Search contestant in DB
    // const contestant = await CurrentContestants.findOne({ email: username }); 
    
    // Get currentCompetition
    const currentCompetition = await CompetitionModel.findOne(); 
    // Search contestant
    let contestant = null;    
    for (let _contestant of currentCompetition.contestants) {
        if (_contestant.email === username) contestant = _contestant
    }

    // If contestant is not in DB, return done with no contestant
    if (!contestant) {
        return done(null, false, req.flash('sign-in-email-error', 'No contestant with that email')); 
    }

    // If the user is a contestant 
    if (contestant) {
        //------  Validate password  --------
        if (!contestant.validatePassword(password)) {
            console.log('Invalid password'); 
            console.log(contestant); 
            // If password doesn't match, return false and the error message 
            return done(null, false, req.flash('sign-in-password-error', 'Incorrect Password')); 
        }
        // Otherwise return the user
        return done(null, contestant); 
    }

    // // Search if the user is admin 
    // const admin = await AdminModel.findOne({ email: username }); 
    // // If the user is the admin  
    // if (admin) {
    //     //------  Validate password  --------
    //     if (!admin.validatePassword(password)) {
    //         // If password doesn't match, return false and the error message 
    //         return done(null, false, req.flash('admin-sign-in-error', 'Incorrect Password')); 
    //     }
    //     // Otherwise return the user
    //     res.setHeader('isAdmin', 'true'); 
    //     return done(null, admin); 
    // }

    // At this point, the contestant exists in the DB and the password matches
    done(null, contestant); 
})); 