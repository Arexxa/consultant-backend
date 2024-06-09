const companyService = require('../services/companyService');

function getCompany(req, res) {
    const userId = req.query.userId;
    companyService.getCompany(userId, (error, results) => {
        if (error) {
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }
        res.json(results);
    });
}

function insertCompany(req, res) {
    const { userId, company, jobTitle, description } = req.body;

    companyService.insertCompany(userId, { company, jobTitle, description }, (error, result) => {
        if (error) {
            if (error.status === 400) {
                return res.status(400).json({ transaction: error.transaction });
            } else {
                return res.status(500).json({ transaction: error.transaction });
            }
        }
        res.status(200).json(result);
    });
}

function updateCompany(req, res) {
    const { userId, companyId } = req.query;
    const { company, jobTitle, description } = req.body;

    companyService.updateCompany(userId, companyId, { company, jobTitle, description }, (error, result) => {
      if (error) {
        return res.status(500).json({ transaction: error.transaction });
      }
      res.status(200).json(result);
    });
}

module.exports = { getCompany, insertCompany, updateCompany };
