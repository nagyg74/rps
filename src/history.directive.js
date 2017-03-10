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