var express = require('express');
var router = express.Router();

var logic = require('../interactor/logic');
var players = require('../interactor/players');


router.get('/', function (req, res, next) {

    if (players.getNumberOfPlayers() < 1){
        logic.reset();
    }

    res.render('index', {title: 'Express', map: logic.getMap()});
});

module.exports = router;
