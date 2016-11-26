'use strict';

var players = require('./players');

var height = 20;
var width = 20;

var map = [];
var gameEnd;

init();

function init() {
    map = [];
    for (let i = 0; i < height; i++) {
        map.push([]);
        for (let j = 0; j < width; j++) {
            map[i].push('');
        }
    }
    gameEnd = false;
}

function isWin() {
    let symbol = players.getCurrentPlayer().symbol;

    function thereIsWinRow(i, j) {
        for (let k = 0; k < 5; k++) {
            if (j + k >= width || map[i][j + k] != symbol) {
                return;
            }
        }
        return true;
    }

    function thereIsWinColumn(i, j) {
        for (let k = 0; k < 5; k++) {
            if (i + k >= height || map[i + k][j] != symbol) {
                return;
            }
        }
        return true;
    }

    function thereIsWinFallingDiagonal(i, j) {
        for (let k = 0; k < 5; k++) {
            if (i + k >= height || j + k >= width || map[i + k][j + k] != symbol) {
                return;
            }
        }
        return true;
    }

    function thereIsWinRisingDiagonal(i, j) {
        for (let k = 0; k < 5; k++) {
            if (i + k >= height || j - k < 0 || map[i + k][j - k] != symbol) {
                return;
            }
        }
        return true;
    }

    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            if (thereIsWinRow(i, j)
                || thereIsWinColumn(i, j)
                || thereIsWinFallingDiagonal(i, j)
                || thereIsWinRisingDiagonal(i, j)) {
                return true;
            }
        }
    }
}

module.exports = {

    getMapSize: function () {
        return [height, width];
    },

    getMap: function () {
        return map;
    },

    tryHit(playerId, row, column){
        if (playerId != players.getCurrentPlayer().id) {
            return;
        }

        if (map[row][column] != '') {
            return;
        }

        map[row][column] = players.getCurrentPlayer().symbol;
        let hitResult = {row: row, column: column, symbol: map[row][column]};

        if (isWin()) {
            gameEnd = true;
            return {
                win: players.getCurrentPlayer(),
                hit: hitResult
            }
        }

        players.nextPlayer();

        return {
            next: players.getCurrentPlayer(),
            hit: hitResult
        };
    },

    reset(){
        init();
    },

    isGameEnd(){
        return gameEnd;
    }
};