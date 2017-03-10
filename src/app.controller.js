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