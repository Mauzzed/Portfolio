const fs = require('fs');
const path = require('path');

const jsFiles = fs.readdirSync(__dirname).filter(f => f.endsWith('.js') && f !== 'app.js' && f !== 'script.js' && f !== 'extract_assets.js');

jsFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    
    const regex = /(?:const|let|var)\s+([a-zA-Z0-9_]+)\s*=\s*['"]data:(image\/[^;]+|model\/gltf-binary|application\/octet-stream);base64,([^'"]+)['"]/g;
    
    let match;
    while ((match = regex.exec(content)) !== null) {
        const varName = match[1];
        const mimeType = match[2];
        const base64Data = match[3];
        
        let ext = '.bin';
        if (mimeType === 'image/jpeg') ext = '.jpg';
        else if (mimeType === 'image/png') ext = '.png';
        else if (mimeType === 'image/webp') ext = '.webp';
        else if (mimeType.includes('gltf') || file.includes('glb')) ext = '.glb';
        else if (varName.toLowerCase().includes('tex') || varName.toLowerCase().includes('wp')) ext = '.jpg';
        
        let filename = varName + ext;
        
        fs.writeFileSync(filename, Buffer.from(base64Data, 'base64'));
        console.log(`Extracted ${filename} from ${file}`);
    }
});
