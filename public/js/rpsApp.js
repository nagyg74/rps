(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

AppController.$inject = ['rpsService'];
function AppController(rpsService) {

    var vm = this;

    vm.server = true;

    vm.selections = rpsService.getSelections();

    vm.toggleServer = function () {
        vm.server = !vm.server;
    };

    vm.roll = function () {
        if (rpsService.getValidity()) {
            rpsService.getWinner();
        }
    };
}

module.exports = AppController;
},{}],2:[function(require,module,exports){
'use strict';

BetComputerController.$inject = ['$scope', 'rpsService'];
function BetComputerController($scope, rpsService) {

    $scope.betSelecion = null;

    $scope.$watch(function () {
        return rpsService.getSelection($scope.side);
    }, function (newVal) {
        if (newVal !== null) {
            $scope.betSelecion = rpsService.getOption(newVal);
        } else {
            $scope.betSelecion = null;
            select();
        }
    });

    function select() {
        rpsService.getRandomBet($scope.server).then(function (bet) {
            rpsService.setSelection(bet.value, $scope.side);
        });
    }

}

module.exports = BetComputerController;
},{}],3:[function(require,module,exports){
'use strict';

function BetComputerDirective() {
    return {
        resctrict: 'EAC',
        replace: true,
        controller: 'BetComputerController',
        controllerAs: 'betVM',
        scope: {
            side: '@',
            server: '='
        },
        templateUrl: 'tpl/betComputerView'
    };
}

module.exports = BetComputerDirective;
},{}],4:[function(require,module,exports){
'use strict';

BetController.$inject = ['$scope', 'rpsService'];
function BetController($scope, rpsService) {

    $scope.betSelecion = rpsService.getOption($scope.selectedIndex);

    $scope.select = function (idx) {
        rpsService.setSelection(idx, $scope.side);
    };

    $scope.$watch(function () {
        return rpsService.getSelection($scope.side);
    }, function (newVal) {
        if (newVal !== null) {
            $scope.betSelecion = rpsService.getOption(newVal);
        } else {
           $scope.betSelecion = null; 
        }
    });
}

module.exports = BetController;
},{}],5:[function(require,module,exports){
'use strict';

function BetUserDirective() {
    return {
        resctrict: 'EAC',
        replace: true,
        controller: 'BetUserController',
        controllerAs: 'betVM',
        scope: {
            side: '@'
        },
        templateUrl: 'tpl/betUserView'
    };
}

module.exports = BetUserDirective;
},{}],6:[function(require,module,exports){
'use strict';

HistoryController.$inject = ['rpsService'];
function HistoryController(rpsService) {

    var vm = this;

    vm.resetHistory = rpsService.resetGames;
    vm.history = [];

    vm.score = null;

    vm.$onInit = function () {
        vm.history = rpsService.getGames();
        vm.score = rpsService.getScores();
    };

}

module.exports = HistoryController;
},{}],7:[function(require,module,exports){
'use strict';

function historyDirective() {
    return {
        resctrict: 'EA',
        replace: true,
        controller: 'HistoryController',
        controllerAs: 'HistoryVM',
        templateUrl: 'tpl/gameHistoryView'
    };
}

module.exports = historyDirective;
},{}],8:[function(require,module,exports){
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
},{}],9:[function(require,module,exports){
angular.module('rpsApp', [])
        .factory('rpsService', require('./rps.service'))
        .controller('AppController', require('./app.controller'))
        .directive('userBet', require('./bet.user.directive'))
        .controller('BetUserController', require('./bet.user.controller'))
        .directive('computerBet', require('./bet.computer.directive'))
        .controller('BetComputerController', require('./bet.computer.controller'))
        .directive('gameHistory', require('./history.directive'))
        .controller('HistoryController', require('./history.controller'))
        ;

angular.element(document).ready(function () {
    angular.bootstrap(document, ['rpsApp']);
});
},{"./app.controller":1,"./bet.computer.controller":2,"./bet.computer.directive":3,"./bet.user.controller":4,"./bet.user.directive":5,"./history.controller":6,"./history.directive":7,"./rps.service":8}]},{},[9])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYXBwLmNvbnRyb2xsZXIuanMiLCJzcmMvYmV0LmNvbXB1dGVyLmNvbnRyb2xsZXIuanMiLCJzcmMvYmV0LmNvbXB1dGVyLmRpcmVjdGl2ZS5qcyIsInNyYy9iZXQudXNlci5jb250cm9sbGVyLmpzIiwic3JjL2JldC51c2VyLmRpcmVjdGl2ZS5qcyIsInNyYy9oaXN0b3J5LmNvbnRyb2xsZXIuanMiLCJzcmMvaGlzdG9yeS5kaXJlY3RpdmUuanMiLCJzcmMvcnBzLnNlcnZpY2UuanMiLCJzcmMvcnBzQXBwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxuQXBwQ29udHJvbGxlci4kaW5qZWN0ID0gWydycHNTZXJ2aWNlJ107XG5mdW5jdGlvbiBBcHBDb250cm9sbGVyKHJwc1NlcnZpY2UpIHtcblxuICAgIHZhciB2bSA9IHRoaXM7XG5cbiAgICB2bS5zZXJ2ZXIgPSB0cnVlO1xuXG4gICAgdm0uc2VsZWN0aW9ucyA9IHJwc1NlcnZpY2UuZ2V0U2VsZWN0aW9ucygpO1xuXG4gICAgdm0udG9nZ2xlU2VydmVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2bS5zZXJ2ZXIgPSAhdm0uc2VydmVyO1xuICAgIH07XG5cbiAgICB2bS5yb2xsID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAocnBzU2VydmljZS5nZXRWYWxpZGl0eSgpKSB7XG4gICAgICAgICAgICBycHNTZXJ2aWNlLmdldFdpbm5lcigpO1xuICAgICAgICB9XG4gICAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBBcHBDb250cm9sbGVyOyIsIid1c2Ugc3RyaWN0JztcblxuQmV0Q29tcHV0ZXJDb250cm9sbGVyLiRpbmplY3QgPSBbJyRzY29wZScsICdycHNTZXJ2aWNlJ107XG5mdW5jdGlvbiBCZXRDb21wdXRlckNvbnRyb2xsZXIoJHNjb3BlLCBycHNTZXJ2aWNlKSB7XG5cbiAgICAkc2NvcGUuYmV0U2VsZWNpb24gPSBudWxsO1xuXG4gICAgJHNjb3BlLiR3YXRjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBycHNTZXJ2aWNlLmdldFNlbGVjdGlvbigkc2NvcGUuc2lkZSk7XG4gICAgfSwgZnVuY3Rpb24gKG5ld1ZhbCkge1xuICAgICAgICBpZiAobmV3VmFsICE9PSBudWxsKSB7XG4gICAgICAgICAgICAkc2NvcGUuYmV0U2VsZWNpb24gPSBycHNTZXJ2aWNlLmdldE9wdGlvbihuZXdWYWwpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJHNjb3BlLmJldFNlbGVjaW9uID0gbnVsbDtcbiAgICAgICAgICAgIHNlbGVjdCgpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBmdW5jdGlvbiBzZWxlY3QoKSB7XG4gICAgICAgIHJwc1NlcnZpY2UuZ2V0UmFuZG9tQmV0KCRzY29wZS5zZXJ2ZXIpLnRoZW4oZnVuY3Rpb24gKGJldCkge1xuICAgICAgICAgICAgcnBzU2VydmljZS5zZXRTZWxlY3Rpb24oYmV0LnZhbHVlLCAkc2NvcGUuc2lkZSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJldENvbXB1dGVyQ29udHJvbGxlcjsiLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIEJldENvbXB1dGVyRGlyZWN0aXZlKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlc2N0cmljdDogJ0VBQycsXG4gICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdCZXRDb21wdXRlckNvbnRyb2xsZXInLFxuICAgICAgICBjb250cm9sbGVyQXM6ICdiZXRWTScsXG4gICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICBzaWRlOiAnQCcsXG4gICAgICAgICAgICBzZXJ2ZXI6ICc9J1xuICAgICAgICB9LFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ3RwbC9iZXRDb21wdXRlclZpZXcnXG4gICAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBCZXRDb21wdXRlckRpcmVjdGl2ZTsiLCIndXNlIHN0cmljdCc7XG5cbkJldENvbnRyb2xsZXIuJGluamVjdCA9IFsnJHNjb3BlJywgJ3Jwc1NlcnZpY2UnXTtcbmZ1bmN0aW9uIEJldENvbnRyb2xsZXIoJHNjb3BlLCBycHNTZXJ2aWNlKSB7XG5cbiAgICAkc2NvcGUuYmV0U2VsZWNpb24gPSBycHNTZXJ2aWNlLmdldE9wdGlvbigkc2NvcGUuc2VsZWN0ZWRJbmRleCk7XG5cbiAgICAkc2NvcGUuc2VsZWN0ID0gZnVuY3Rpb24gKGlkeCkge1xuICAgICAgICBycHNTZXJ2aWNlLnNldFNlbGVjdGlvbihpZHgsICRzY29wZS5zaWRlKTtcbiAgICB9O1xuXG4gICAgJHNjb3BlLiR3YXRjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBycHNTZXJ2aWNlLmdldFNlbGVjdGlvbigkc2NvcGUuc2lkZSk7XG4gICAgfSwgZnVuY3Rpb24gKG5ld1ZhbCkge1xuICAgICAgICBpZiAobmV3VmFsICE9PSBudWxsKSB7XG4gICAgICAgICAgICAkc2NvcGUuYmV0U2VsZWNpb24gPSBycHNTZXJ2aWNlLmdldE9wdGlvbihuZXdWYWwpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAkc2NvcGUuYmV0U2VsZWNpb24gPSBudWxsOyBcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJldENvbnRyb2xsZXI7IiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBCZXRVc2VyRGlyZWN0aXZlKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlc2N0cmljdDogJ0VBQycsXG4gICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdCZXRVc2VyQ29udHJvbGxlcicsXG4gICAgICAgIGNvbnRyb2xsZXJBczogJ2JldFZNJyxcbiAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgIHNpZGU6ICdAJ1xuICAgICAgICB9LFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ3RwbC9iZXRVc2VyVmlldydcbiAgICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJldFVzZXJEaXJlY3RpdmU7IiwiJ3VzZSBzdHJpY3QnO1xuXG5IaXN0b3J5Q29udHJvbGxlci4kaW5qZWN0ID0gWydycHNTZXJ2aWNlJ107XG5mdW5jdGlvbiBIaXN0b3J5Q29udHJvbGxlcihycHNTZXJ2aWNlKSB7XG5cbiAgICB2YXIgdm0gPSB0aGlzO1xuXG4gICAgdm0ucmVzZXRIaXN0b3J5ID0gcnBzU2VydmljZS5yZXNldEdhbWVzO1xuICAgIHZtLmhpc3RvcnkgPSBbXTtcblxuICAgIHZtLnNjb3JlID0gbnVsbDtcblxuICAgIHZtLiRvbkluaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZtLmhpc3RvcnkgPSBycHNTZXJ2aWNlLmdldEdhbWVzKCk7XG4gICAgICAgIHZtLnNjb3JlID0gcnBzU2VydmljZS5nZXRTY29yZXMoKTtcbiAgICB9O1xuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gSGlzdG9yeUNvbnRyb2xsZXI7IiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBoaXN0b3J5RGlyZWN0aXZlKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlc2N0cmljdDogJ0VBJyxcbiAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgY29udHJvbGxlcjogJ0hpc3RvcnlDb250cm9sbGVyJyxcbiAgICAgICAgY29udHJvbGxlckFzOiAnSGlzdG9yeVZNJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICd0cGwvZ2FtZUhpc3RvcnlWaWV3J1xuICAgIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaGlzdG9yeURpcmVjdGl2ZTsiLCIndXNlIHN0cmljdCc7XG5cbnJwc1NlcnZpY2UuJGluamVjdCA9IFsnJHEnLCAnJGh0dHAnLCAnJHRpbWVvdXQnXTtcbmZ1bmN0aW9uIHJwc1NlcnZpY2UoJHEsICRodHRwLCAkdGltZW91dCkge1xuXG4gICAgdmFyIHNlbGVjdExhdGVuY3kgPSA1MDA7XG5cbiAgICB2YXIgcmVzdWx0cyA9IHtcbiAgICAgICAgJzAwJzogJ2RlYWwnLFxuICAgICAgICAnMDEnOiAncmlnaHQnLFxuICAgICAgICAnMDInOiAnbGVmdCcsXG4gICAgICAgICcxMCc6ICdsZWZ0JyxcbiAgICAgICAgJzExJzogJ2RlYWwnLFxuICAgICAgICAnMTInOiAncmlnaHQnLFxuICAgICAgICAnMjAnOiAncmlnaHQnLFxuICAgICAgICAnMjEnOiAnbGVmdCcsXG4gICAgICAgICcyMic6ICdkZWFsJ1xuICAgIH07XG5cbiAgICB2YXIgcnBzT3B0aW9ucyA9IFtcbiAgICAgICAge1xuICAgICAgICAgICAgdmFsdWU6IDAsXG4gICAgICAgICAgICBuYW1lOiAnUm9jaycsXG4gICAgICAgICAgICBhbGlhczogJ3JvY2snXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIHZhbHVlOiAxLFxuICAgICAgICAgICAgbmFtZTogJ1BhcGVyJyxcbiAgICAgICAgICAgIGFsaWFzOiAncGFwZXInXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIHZhbHVlOiAyLFxuICAgICAgICAgICAgbmFtZTogJ1NjaXNzb3JzJyxcbiAgICAgICAgICAgIGFsaWFzOiAnc2Npc3NvcnMnXG4gICAgICAgIH1cbiAgICBdO1xuXG4gICAgdmFyIGdhbWVzID0gW107XG5cbiAgICB2YXIgc2NvcmUgPSB7XG4gICAgICAgIGxlZnQ6IDAsXG4gICAgICAgIHJpZ2h0OiAwXG4gICAgfTtcblxuICAgIHZhciBzZWxlY3RlZEJldHMgPSB7XG4gICAgICAgIHZhbGlkOiBmYWxzZSxcbiAgICAgICAgbGVmdDogbnVsbCxcbiAgICAgICAgcmlnaHQ6IG51bGxcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gZ2V0UmFuZG9tSW5kZXgoKSB7XG4gICAgICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAzKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRPcHRpb24oaW5kZXgpIHtcbiAgICAgICAgcmV0dXJuIHJwc09wdGlvbnNbaW5kZXhdO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldFJhbmRvbUJldChzZXJ2ZXIpIHtcbiAgICAgICAgaWYgKHNlcnZlcikge1xuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHJwc09wdGlvbnNbZ2V0UmFuZG9tSW5kZXgoKV0pO1xuICAgICAgICAgICAgfSwgc2VsZWN0TGF0ZW5jeSk7XG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAxMC9hcGkvcnBzJykudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0U2VsZWN0aW9ucygpIHtcbiAgICAgICAgcmV0dXJuIHNlbGVjdGVkQmV0cztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRTZWxlY3Rpb24oc2lkZSkge1xuICAgICAgICByZXR1cm4gc2VsZWN0ZWRCZXRzW3NpZGVdO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlc2V0U2VsZWN0aW9ucygpIHtcbiAgICAgICAgc2VsZWN0ZWRCZXRzLmxlZnQgPSBudWxsO1xuICAgICAgICBzZWxlY3RlZEJldHMucmlnaHQgPSBudWxsO1xuICAgICAgICBzZXRWYWxpZGl0eShmYWxzZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc2V0U2VsZWN0aW9uKHZhbHVlLCBzaWRlKSB7XG4gICAgICAgIHNlbGVjdGVkQmV0c1tzaWRlXSA9IHZhbHVlO1xuICAgICAgICBzZXRWYWxpZGl0eShjaGVja1ZhbGlkaXR5KCkpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldFZhbGlkaXR5KCkge1xuICAgICAgICByZXR1cm4gc2VsZWN0ZWRCZXRzLnZhbGlkO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNldFZhbGlkaXR5KHZhbHVlKSB7XG4gICAgICAgIHNlbGVjdGVkQmV0cy52YWxpZCA9IHZhbHVlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNoZWNrVmFsaWRpdHkoKSB7XG4gICAgICAgIGlmIChzZWxlY3RlZEJldHMubGVmdCA9PT0gbnVsbCB8fCBzZWxlY3RlZEJldHMucmlnaHQgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRXaW5uZXIoKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSBmYWxzZTtcbiAgICAgICAgaWYgKGNoZWNrVmFsaWRpdHkoKSkge1xuICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0c1snJyArIHNlbGVjdGVkQmV0cy5sZWZ0ICsgc2VsZWN0ZWRCZXRzLnJpZ2h0XTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQgPT09ICdsZWZ0Jykge1xuICAgICAgICAgICAgICAgIHNjb3JlLmxlZnQgKz0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChyZXN1bHQgPT09ICdyaWdodCcpIHtcbiAgICAgICAgICAgICAgICBzY29yZS5yaWdodCArPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZ2FtZXMucHVzaCh7cmVzdWx0OiByZXN1bHQsIGxlZnQ6IHJwc09wdGlvbnNbc2VsZWN0ZWRCZXRzLmxlZnRdLCByaWdodDogcnBzT3B0aW9uc1tzZWxlY3RlZEJldHMucmlnaHRdfSk7XG4gICAgICAgICAgICByZXNldFNlbGVjdGlvbnMoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldEdhbWVzKCkge1xuICAgICAgICByZXR1cm4gZ2FtZXM7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGdldFNjb3JlcygpIHtcbiAgICAgICAgcmV0dXJuIHNjb3JlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlc2V0R2FtZXMoKSB7XG4gICAgICAgIGdhbWVzLmxlbmd0aCA9IDA7XG4gICAgICAgIHNjb3JlLmxlZnQgPSAwO1xuICAgICAgICBzY29yZS5yaWdodCA9IDA7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZ2V0T3B0aW9uOiBnZXRPcHRpb24sXG4gICAgICAgIGdldFJhbmRvbUluZGV4OiBnZXRSYW5kb21JbmRleCxcbiAgICAgICAgZ2V0UmFuZG9tQmV0OiBnZXRSYW5kb21CZXQsXG4gICAgICAgIGdldFNlbGVjdGlvbnM6IGdldFNlbGVjdGlvbnMsXG4gICAgICAgIGdldFNlbGVjdGlvbjogZ2V0U2VsZWN0aW9uLFxuICAgICAgICBzZXRTZWxlY3Rpb246IHNldFNlbGVjdGlvbixcbiAgICAgICAgZ2V0VmFsaWRpdHk6IGdldFZhbGlkaXR5LFxuICAgICAgICBnZXRXaW5uZXI6IGdldFdpbm5lcixcbiAgICAgICAgZ2V0R2FtZXM6IGdldEdhbWVzLFxuICAgICAgICBnZXRTY29yZXM6IGdldFNjb3JlcyxcbiAgICAgICAgcmVzZXRHYW1lczogcmVzZXRHYW1lc1xuICAgIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gcnBzU2VydmljZTsiLCJhbmd1bGFyLm1vZHVsZSgncnBzQXBwJywgW10pXG4gICAgICAgIC5mYWN0b3J5KCdycHNTZXJ2aWNlJywgcmVxdWlyZSgnLi9ycHMuc2VydmljZScpKVxuICAgICAgICAuY29udHJvbGxlcignQXBwQ29udHJvbGxlcicsIHJlcXVpcmUoJy4vYXBwLmNvbnRyb2xsZXInKSlcbiAgICAgICAgLmRpcmVjdGl2ZSgndXNlckJldCcsIHJlcXVpcmUoJy4vYmV0LnVzZXIuZGlyZWN0aXZlJykpXG4gICAgICAgIC5jb250cm9sbGVyKCdCZXRVc2VyQ29udHJvbGxlcicsIHJlcXVpcmUoJy4vYmV0LnVzZXIuY29udHJvbGxlcicpKVxuICAgICAgICAuZGlyZWN0aXZlKCdjb21wdXRlckJldCcsIHJlcXVpcmUoJy4vYmV0LmNvbXB1dGVyLmRpcmVjdGl2ZScpKVxuICAgICAgICAuY29udHJvbGxlcignQmV0Q29tcHV0ZXJDb250cm9sbGVyJywgcmVxdWlyZSgnLi9iZXQuY29tcHV0ZXIuY29udHJvbGxlcicpKVxuICAgICAgICAuZGlyZWN0aXZlKCdnYW1lSGlzdG9yeScsIHJlcXVpcmUoJy4vaGlzdG9yeS5kaXJlY3RpdmUnKSlcbiAgICAgICAgLmNvbnRyb2xsZXIoJ0hpc3RvcnlDb250cm9sbGVyJywgcmVxdWlyZSgnLi9oaXN0b3J5LmNvbnRyb2xsZXInKSlcbiAgICAgICAgO1xuXG5hbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcbiAgICBhbmd1bGFyLmJvb3RzdHJhcChkb2N1bWVudCwgWydycHNBcHAnXSk7XG59KTsiXX0=
