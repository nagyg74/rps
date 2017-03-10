'use strict';

rpsService.$inject = ['$q', '$http', '$timeout'];
function rpsService($q, $http, $timeout) {

    var selectLatency = 500;

    var results = {
        '00': 'deal',
        '01': 'right',
        '02': 'left',
        '10': 'left',
        '11': 'deal',
        '12': 'right',
        '20': 'right',
        '21': 'left',
        '22': 'deal'
    };

    var rpsOptions = [
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

    var games = [];

    var score = {
        left: 0,
        right: 0
    };

    var selectedBets = {
        valid: false,
        left: null,
        right: null
    };

    function getRandomIndex() {
        return Math.floor(Math.random() * 3);
    }

    function getOption(index) {
        return rpsOptions[index];
    }

    function getRandomBet(server) {
        if (server) {
            var deferred = $q.defer();
            $timeout(function () {
                deferred.resolve(rpsOptions[getRandomIndex()]);
            }, selectLatency);
            return deferred.promise;
        } else {
            return $http.get('http://localhost:3010/api/rps').then(function (response) {
                return response.data;
            }, function (err) {
                console.log(err);
                return false;
            });
        }
    }

    function getSelections() {
        return selectedBets;
    }

    function getSelection(side) {
        return selectedBets[side];
    }

    function resetSelections() {
        selectedBets.left = null;
        selectedBets.right = null;
        setValidity(false);
    }

    function setSelection(value, side) {
        selectedBets[side] = value;
        setValidity(checkValidity());
    }

    function getValidity() {
        return selectedBets.valid;
    }

    function setValidity(value) {
        selectedBets.valid = value;
    }

    function checkValidity() {
        if (selectedBets.left === null || selectedBets.right === null) {
            return false;
        }
        return true;
    }

    function getWinner() {
        var result = false;
        if (checkValidity()) {
            result = results['' + selectedBets.left + selectedBets.right];
            if (result === 'left') {
                score.left += 1;
            }
            if (result === 'right') {
                score.right += 1;
            }
            games.push({result: result, left: rpsOptions[selectedBets.left], right: rpsOptions[selectedBets.right]});
            resetSelections();
        }
        return result;
    }

    function getGames() {
        return games;
    }
    function getScores() {
        return score;
    }

    function resetGames() {
        games.length = 0;
        score.left = 0;
        score.right = 0;
    }

    return {
        getOption: getOption,
        getRandomIndex: getRandomIndex,
        getRandomBet: getRandomBet,
        getSelections: getSelections,
        getSelection: getSelection,
        setSelection: setSelection,
        getValidity: getValidity,
        getWinner: getWinner,
        getGames: getGames,
        getScores: getScores,
        resetGames: resetGames
    };
}

module.exports = rpsService;