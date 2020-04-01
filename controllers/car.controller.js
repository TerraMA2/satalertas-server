const axios = require('axios');
const Result = require(__dirname + '/../utils/result');


exports.getAllSimplified = async (req, res) => {

    try {
        res.json(Result.ok('OK'));
    } catch (e) {
        res.json(Result.err(e));
    }
};

exports.getAll = async (req, res) => {

    try {
        res.json(Result.ok('OK'));
    } catch (e) {
        res.json(Result.err(e));
    }
};

exports.getByCpf = async (req, res) => {

    try {
        res.json(Result.ok('OK'));
    } catch (e) {
        res.json(Result.err(e));
    }
};
