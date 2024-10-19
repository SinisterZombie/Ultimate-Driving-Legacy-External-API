const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
app.use(bodyParser.json());

const GITHUB_TOKEN = 'your_github_token';
const REPO_OWNER = 'your-username';
const REPO_NAME = 'your-repo';
const FILE_PATH = 'data.json';

app.post('/update-points', async (req, res) => {
    const { userId, points } = req.body;

    try {
        // Get the current file content from GitHub
        const { data } = await axios.get(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
            headers: { Authorization: `token ${GITHUB_TOKEN}` }
        });

        const content = Buffer.from(data.content, 'base64').toString('utf-8');
        const json = JSON.parse(content);
        json[userId] = { Points: points };

        const updatedContent = Buffer.from(JSON.stringify(json, null, 2)).toString('base64');

        // Update the file on GitHub
        await axios.put(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
            message: `Update points for user ${userId}`,
            content: updatedContent,
            sha: data.sha, // The "sha" is required to update a file on GitHub
        }, {
            headers: { Authorization: `token ${GITHUB_TOKEN}` }
        });

        res.status(200).send('Points updated successfully');
    } catch (error) {
        console.error('Error updating points:', error);
        res.status(500).send('Failed to update points');
    }
});

app.listen(3000, () => console.log('Proxy server running on port 3000'));
