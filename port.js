const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function copyFolderSync(source, destination, excludeDirs) {
    if (!fs.existsSync(destination)) {
        fs.mkdirSync(destination, { recursive: true });
    }

    const items = fs.readdirSync(source, { withFileTypes: true });

    items.forEach((item) => {
        const srcPath = path.join(source, item.name);
        const destPath = path.join(destination, item.name);

        if (item.isDirectory()) {
            if (!excludeDirs.includes(item.name)) {
                copyFolderSync(srcPath, destPath, excludeDirs);
            }
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    });
}

function initializeGitBranch(directory, branchName) {
    try {
        execSync(`git -C ${directory} reset --hard`, { stdio: 'inherit' });
        execSync(`git -C ${directory} pull`, { stdio: 'inherit' });
        execSync(`git -C ${directory} checkout -b ${branchName}`, { stdio: 'inherit' });
        console.log(`Git branch '${branchName}' created in ${directory}`);
    } catch (error) {
        console.error(`Failed to create git branch: ${error.message}`);
    }
}

function updateGradleProperties(template, destination) {
    const gradlePropertiesPath = path.join(destination, 'gradle.properties');
    if (!fs.existsSync(gradlePropertiesPath)) {
        console.log('gradle.properties file not found.');
        return;
    }

    const gradlePropertiesContent = fs.readFileSync(gradlePropertiesPath, 'utf-8');
    const updatedPropertiesContent = mergeProperties(gradlePropertiesContent, template.properties);
    fs.writeFileSync(gradlePropertiesPath, updatedPropertiesContent, 'utf-8');
    console.log('gradle.properties updated successfully.');
}

function mergeProperties(gradleContent, templateProperties) {
    const lines = gradleContent.split('\n');
    const unusedProperties = { ...templateProperties };
    const mergedLines = lines.map((line) => {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#') && trimmedLine.includes('=')) {
            const [key] = trimmedLine.split('=').map((part) => part.trim());
            if (templateProperties[key] !== undefined) {
                delete unusedProperties[key];
                return `${key} = ${templateProperties[key]}`;
            }
        }
        return line;
    });

    Object.keys(unusedProperties).forEach((key) => {
        mergedLines.push(`${key} = ${unusedProperties[key]}`);
    });

    return mergedLines.join('\n');
}

function bumpModVersion(destination, newVersion) {
    const gradlePropertiesPath = path.join(destination, 'gradle.properties');
    if (fs.existsSync(gradlePropertiesPath)) {
        let gradlePropertiesContent = fs.readFileSync(gradlePropertiesPath, 'utf-8');
        const versionRegex = /\bversion\s*=\s*(\d+)\.(\d+)\.(\d+)/;
        const newModVersion = newVersion.substring(2) + '.0';
        gradlePropertiesContent = gradlePropertiesContent.replace(versionRegex, `version = ${newModVersion}`);
        fs.writeFileSync(gradlePropertiesPath, gradlePropertiesContent, 'utf-8');
        console.log(`gradle.properties version bumped to ${newModVersion}`);
    } else {
        console.log('gradle.properties file not found.');
    }
}

function writeChangelog(destination, newVersion) {
    const changelogPath = path.join(destination, 'CHANGELOG.md');
    const changelogEntry = `- Updated to Minecraft ${newVersion}`;

    fs.writeFileSync(changelogPath, changelogEntry, 'utf-8');
    console.log('CHANGELOG.md updated successfully.');
}

function renameFiles(template, destination) {
    const filesToRename = template.rename;
    if (filesToRename) {
        Object.keys(filesToRename).forEach((oldFile) => {
            const newFile = filesToRename[oldFile];
            const oldPath = path.join(destination, oldFile);
            const newPath = path.join(destination, newFile);

            if (fs.existsSync(oldPath)) {
                fs.renameSync(oldPath, newPath);
                console.log(`Renamed ${oldFile} to ${newFile}`);
            } else {
                console.log(`File ${oldFile} not found.`);
            }
        });
    }
}

function copyTemplateFiles(templateDir, destination) {
    if (!fs.existsSync(templateDir)) {
        return;
    }

    const items = fs.readdirSync(templateDir, { withFileTypes: true });

    items.forEach((item) => {
        const srcPath = path.join(templateDir, item.name);
        const destPath = path.join(destination, item.name);

        if (item.isDirectory()) {
            if (!fs.existsSync(destPath)) {
                fs.mkdirSync(destPath, { recursive: true });
            }
            if (item.name !== '.git') {
                copyTemplateFiles(srcPath, destPath);
            }
        } else {
            if (!fs.existsSync(path.dirname(destPath))) {
                fs.mkdirSync(path.dirname(destPath), { recursive: true });
            }
            fs.copyFileSync(srcPath, destPath);
        }
    });
}

function updateSettingsGradle(template, destination) {
    const settingsGradlePath = path.join(destination, 'settings.gradle');
    if (!fs.existsSync(settingsGradlePath)) {
        console.log('settings.gradle file not found.');
        return;
    }

    let settingsContent = fs.readFileSync(settingsGradlePath, 'utf-8');
    const includeRegex = /include\([^)]*\)/g;
    
    if (template.loaders && Array.isArray(template.loaders)) {
        const newIncludes = template.loaders.map(loader => `'${loader}'`).join(', ');
        settingsContent = settingsContent.replace(includeRegex, `include(${newIncludes})`);
        fs.writeFileSync(settingsGradlePath, settingsContent, 'utf-8');
        console.log('settings.gradle updated successfully.');
    }
}

function initializeGradle(destination) {
    try {
        execSync(`gradlew`, { stdio: 'inherit', cwd: destination});
        console.log(`Gradle initialized in ${destination}`);
    } catch (error) {
        console.error(`Failed to initialize gradle: ${error.message}`);
    }
}

function main() {
    if (process.argv.length < 5) {
        console.log('Usage: node port.js <oldVersion> <newVersion> <folder>');
        process.exit(1);
    }

    const folder = process.argv[4].replace(/[<>:"\/\\|?*]/g, '').replace(/\.$/, '');
    const oldVersion = process.argv[2].replace(/[<>:"\/\\|?*]/g, '').replace(/\.$/, '');
    const newVersion = process.argv[3].replace(/[<>:"\/\\|?*]/g, '').replace(/\.$/, '');
    const excludeDirs = ['.idea', '.gradle'];

    const source = path.join(oldVersion, folder);
    const destination = path.join(newVersion, folder);

    if (!fs.existsSync(source)) {
        console.log(`Source folder ${source} does not exist.`);
        process.exit(1);
    }

    const templateJsonPath = path.join(newVersion, 'template.json');
    if (!fs.existsSync(templateJsonPath)) {
        console.log('template.json file not found.');
        return;
    }

    const template = JSON.parse(fs.readFileSync(templateJsonPath, 'utf-8'));

    // Copy the folder
    copyFolderSync(source, destination, excludeDirs);

    // Initialize git in the new version folder
    initializeGitBranch(destination, newVersion);

    renameFiles(template, destination);
    copyTemplateFiles(path.join(newVersion, 'template'), destination);

    // Update gradle.properties
    updateGradleProperties(template, destination);
    updateSettingsGradle(template, destination);

    bumpModVersion(destination, newVersion);
    writeChangelog(destination, newVersion);

    initializeGradle(destination);

    console.log(`Folder copied successfully from ${source} to ${destination}.`);
}

main();