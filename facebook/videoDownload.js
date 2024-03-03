const fs = require('fs');
const Axios = require('axios');

const folder = 'themech';
const path = './urls/facebook-video.json';

let linksData = fs.readFileSync(path);
let links = JSON.parse(linksData);

async function downloadVideo(url, outputPath) {
    try {
        const response = await Axios({ method: 'GET', url: url, responseType: 'stream' });
        if (response.status !== 200) {
            throw new Error(`HTTP error ${response.status}`);
        }
        const fileStream = fs.createWriteStream(outputPath);
        response.data.pipe(fileStream);
        return new Promise((resolve, reject) => {
            fileStream.on('finish', resolve);
            fileStream.on('error', reject);
        });
    } catch (error) {
        throw new Error(`Error downloading video: ${error.message}`);
    }
}

async function main() {
    let videoList = [];
    const videoFolderPath = `./videos/facebook/${folder}`
    if (!fs.existsSync(videoFolderPath)) {
        fs.mkdirSync(videoFolderPath);
    }

    for (const [i, link] of links.entries()) {
        let index = 1100 + i
        try {
            await downloadVideo(link, `${videoFolderPath}/${folder + `_` + index}.mp4`)
        } catch (error) {
            console.log(error);
            videoList.push(link);
        }
    }
    let data = JSON.stringify(videoList, null, 4);
    fs.writeFileSync(path, data);
};

main()
