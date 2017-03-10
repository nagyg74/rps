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