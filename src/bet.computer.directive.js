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