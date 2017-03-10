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