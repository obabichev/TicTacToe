var express = require('express');
var router = express.Router();

var logic = require('../interactor/logic');

/* GET home page. */
router.get('/', function (req, res, next) {
    console.log(JSON.stringify(logic.getMap()));
    res.render('index', {title: 'Express', map: logic.getMap()});
});

module.exports = router;
