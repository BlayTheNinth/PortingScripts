const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');


function pushChanges(directory) {
    try {
        execSync(`git -C ${directory} add .`, { stdio: 'inherit' });
        execSync(`git -C ${directory} commit -m "chore: Bump dependencies"`, { stdio: 'inherit' });
        execSync(`git -C ${directory} push`, { stdio: 'inherit' });
        console.log(`Changes pushed to Git`);
    } catch (error) {
        console.error(`Failed to push changes: ${error.message}`);
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


function initializeGradle(destination) {
    try {
        execSync(`gradlew`, { stdio: 'inherit', cwd: destination});
        console.log(`Gradle initialized in ${destination}`);
    } catch (error) {
        console.error(`Failed to initialize gradle: ${error.message}`);
    }
}

function main() {
    if (process.argv.length < 4) {
        console.log('Usage: node update.js <version> <mod>');
        process.exit(1);
    }

    const version = process.argv[2].replace(/[<>:"\/\\|?*]/g, '').replace(/\.$/, '');
    const folder = process.argv[3].replace(/[<>:"\/\\|?*]/g, '').replace(/\.$/, '');

    const destination = path.join(version, folder);

    if (!fs.existsSync(destination)) {
        console.log(`Destination folder ${destination} does not exist.`);
        process.exit(1);
    }

    const templateJsonPath = path.join(version, 'template.json');
    if (!fs.existsSync(templateJsonPath)) {
        console.log('template.json file not found.');
        return;
    }

    const template = JSON.parse(fs.readFileSync(templateJsonPath, 'utf-8'));

    // Update gradle.properties
    updateGradleProperties(template, destination);
    updateSettingsGradle(template, destination);
    pushChanges(destination);
    // initializeGradle(destination);

    console.log(`Updated gradle properties in ${destination}.`);
}

main();
