const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (token == null) return res.sendStatus(401);
    jwt.verify(token.split(" ")[1], process.env.ACCESS_TOKEN_SECRET, (err, data) => {
        if (err) {
            console.log(err)
            return res.sendStatus(403);
        }
        req.user = data.user;
        next();
    });
}

const checkForValidDate = (date) => {
    
    const validTimestamp = new Date(date).getTime();
    if (isNaN(validTimestamp) || validTimestamp < 0) {
        return false;
    }
    return true;
}

const getUserFromRequest = (req) => {
    let userId = null
    if (req?.user?.user?._id ){
        const {
            user : {
                _id
            }
        } = req?.user || {};
        userId = _id
    }
    return userId;
}

module.exports = {
    authenticateToken,
    checkForValidDate,
    getUserFromRequest
}