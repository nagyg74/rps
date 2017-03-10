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