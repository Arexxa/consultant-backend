// get user list
const consultantService = require('../services/consultantService');

function getUserList(req, res) {
    consultantService.getUserList((error, results) => {
        if (error) {
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }
        res.json(results);
    });
}

function addOrUpdateNote(req, res) {
    const userId = req.body.userId;
    const noteId = req.body.noteId;  // Optional: can be null
    const { title, description } = req.body;

    if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
    }

    consultantService.addOrUpdateNote(userId, noteId, { title, description }, (error, result) => {
        if (error) {
            console.error(`Error in addOrUpdateNote service: ${error.error}`);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.status(200).json(result);
    });
}

const updateUserStatus = (req, res) => {
    const { userId, status } = req.body;
  
    if (!userId || !status) {
      return res.status(400).json({ error: 'userId and status are required' });
    }
  
    consultantService.updateUserStatus(userId, status, (error, result) => {
      if (error) {
        console.error(`Error in updateUserStatus service: ${error.error}`);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      res.status(200).json(result);
    });
  };

module.exports = { getUserList, addOrUpdateNote, updateUserStatus };
