// FOR SESSION ONLY
// COOKIES ONLY

function isUser() {
    return (req, res, next) => {
        if(req.session.user){
            next();
        } else {
            res.redirect('/login');
        }
    }
}


function isGuest() {
    return (req, res, next) => {
        if(req.session.user){
            res.redirect('/');  // TODO check assignment for correct redirect
        } else {
            next();
        }
    }
}


function isOwner() {
    return function(req, res, next) {
        const userId = req.session.user?._id;
        // we type it 'user?' -> optional chaining
        // if user doesn't exist 'userId' will be undefined

        // TODO change property name to match collection
        if(res.locals.crypto.owner == userId) {       // trip.owner coming from models --> Trip
            next();
        } else {
            res.redirect('/login');
        }
    };
}

module.exports = {
    isUser,
    isGuest,
    isOwner
};