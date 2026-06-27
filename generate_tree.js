const fs = require('fs');
const path = require('path');

function generateTree(dirPath, indent = '', isLast = true) {
    let result = '';
    
    // Get all files and directories
    let files = [];
    try {
        files = fs.readdirSync(dirPath);
    } catch (err) {
        return result;
    }

    // Filter out node_modules and .git
    files = files.filter(file => !['node_modules', '.git', '.next', 'dist', 'build', '.kimchi', '.codex', '.agents'].includes(file));
    
    // Sort directories first, then files
    files.sort((a, b) => {
        const aIsDir = fs.statSync(path.join(dirPath, a)).isDirectory();
        const bIsDir = fs.statSync(path.join(dirPath, b)).isDirectory();
        if (aIsDir && !bIsDir) return -1;
        if (!aIsDir && bIsDir) return 1;
        return a.localeCompare(b);
    });

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const filePath = path.join(dirPath, file);
        let isDir = false;
        
        try {
            isDir = fs.statSync(filePath).isDirectory();
        } catch (e) {
            continue;
        }

        const isLastItem = i === files.length - 1;
        const branch = isLastItem ? '└── ' : '├── ';
        
        result += indent + branch + file + '\n';
        
        if (isDir) {
            const nextIndent = indent + (isLastItem ? '    ' : '│   ');
            result += generateTree(filePath, nextIndent, isLastItem);
        }
    }
    
    return result;
}

const rootDir = __dirname;
const treeOutput = 'Kambuja-POS\n' + generateTree(rootDir);

fs.writeFileSync(path.join(rootDir, 'project_tree.txt'), treeOutput);
console.log('Project tree generated in project_tree.txt');
