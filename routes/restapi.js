var express = require('express');
var router = express.Router();

/**
 * Valid response array
 */
var rpsResults = [
    {
        value: 0,
        name: 'Rock',
        alias: 'rock'
    }, {
        value: 1,
        name: 'Paper',
        alias: 'paper'
    }, {
        value: 2,
        name: 'Scissors',
        alias: 'scissors'
    }
];

/**
 * Get random integer between 0 and 2
 * 
 * @returns {Number}
 */
function getRandomIndex() {
    return Math.floor(Math.random() * 3);
}

/**
 * Set server response latency
 * 
 * @type Number
 */
var serverLatency = 500;

router.get('/', function (req, res, next) {
    res.render('index');
});

router.get('/rps', function (req, res, next) {
    setTimeout(function () {
        res.status(200).json(rpsResults[getRandomIndex()]);
    }, serverLatency);
});

module.exports = router;
