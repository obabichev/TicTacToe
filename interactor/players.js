'use strict';

var nextAvailableIndex = 0;
var players = [];
var currentPlayer = '';

function playerSymbol(index) {
    switch (index) {
        case 0:
            return 'X';
        case 1:
            return 'O';
        default:
            return index - 1;
    }
}

function createName(playerId) {
    return 'Player' + playerSymbol(playerId);
}

function indexOfPlayer(playerId) {
    for (let i in players) {
        if (players[i].id == playerId) {
            return parseInt(i);
        }
    }
    return -1;
}

module.exports = {

    getCurrentPlayer(){
        return currentPlayer;
    },

    getPlayer(playerId){
        for (let i in players) {
            let player = players[i];
            if (playerId == player.id) {
                return player;
            }
        }
    },

    nextPlayer() {

        let index = this.indexOfCurrentPlayer();
        index += 1;
        if (index >= players.length) {
            index = 0;
        }
        currentPlayer = players[index];
    },

    indexOfCurrentPlayer() {
        return indexOfPlayer(currentPlayer.id)
    },

    addPlayer(playerId){
        players.push({
            id: playerId,
            symbol: playerSymbol(nextAvailableIndex),
            name: createName(nextAvailableIndex),
        });
        if (players.length == 1) {
            currentPlayer = players[0];
        }
        nextAvailableIndex += 1;
        console.log("Player " + playerId + " added");
        return currentPlayer;
    },

    deletePlayer(playerId){
        if (playerId == currentPlayer.id) {
            this.nextPlayer();
        }
        let index = indexOfPlayer(playerId);
        players.splice(index, index + 1);
        console.log("Players after delete " + JSON.stringify(players));
        return currentPlayer;
    },
};