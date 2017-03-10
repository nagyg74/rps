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