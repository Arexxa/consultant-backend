// pdfRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// Route to serve PDF files
router.get('/:documentId', (req, res) => {
    const documentId = req.params.documentId;
    const sql = 'SELECT fileData FROM cons_application WHERE documentID = ?';

    db.query(sql, [documentId], (error, results) => {
        if (error) {
            console.error('Error querying database:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'File not found' });
        }

        // Retrieve the file data from the database
        const fileData = results[0].fileData;

        // Send the file data as response
        res.status(200).send(fileData);
    });
});

module.exports = router;