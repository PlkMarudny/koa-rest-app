const git = require("git-last-commit");
const fs = require("fs");
const path = require('path');

try {
    git.getLastCommit(function (err, commit) {
        const dirPath = path.join(__dirname, 'config/version.json');
        console.log(dirPath);
        fs.writeFileSync(dirPath, JSON.stringify(commit));
    });
    
} catch (err) {
    console.log(err);
}
