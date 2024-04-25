const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware to handle json and urlencoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Endpoint to list files in a directory
app.get('/browse', (req, res) => {
    const directoryPath = req.query.path || '/'; // Default path is root, can be customized by query parameter

    fs.readdir(directoryPath, { withFileTypes: true }, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to read directory' });
        }

        const fileList = files.map(file => ({
            name: file.name,
            isDirectory: file.isDirectory(),
            path: path.join(directoryPath, file.name)
        }));

        res.json({ files: fileList });
    });
});

// Endpoint to preview files (images and videos)
app.get('/preview', (req, res) => {
    const filePath = req.query.path;

    if (!filePath) {
        return res.status(400).json({ error: 'File path is required' });
    }

    const fileExtension = path.extname(filePath).toLowerCase();
    const allowedExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.mp4', '.mov'];

    if (!allowedExtensions.includes(fileExtension)) {
        return res.status(400).json({ error: 'File format not supported for preview' });
    }

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            return res.status(404).json({ error: 'File not found' });
        }

        res.sendFile(filePath, { root: path.dirname(filePath) });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
