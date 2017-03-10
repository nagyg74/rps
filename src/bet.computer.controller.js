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