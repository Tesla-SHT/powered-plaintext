const requiredMajor = 18;
const currentVersion = process.versions.node;
const currentMajor = Number(currentVersion.split('.')[0]);

if (Number.isNaN(currentMajor) || currentMajor < requiredMajor) {
    console.error(
        [
            `Node.js ${requiredMajor}+ is required for this project.`,
            `Current version: ${currentVersion}`,
            'If you installed Node.js with apt, install a newer LTS release from NodeSource or the official Node.js distribution, then run npm install again.'
        ].join('\n')
    );
    process.exit(1);
}