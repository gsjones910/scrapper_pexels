const fs = require('fs');
const Axios = require('axios')

const folder = '';

const path = './urls/pinterest-link.json';
let linksData = fs.readFileSync(path);
let links = JSON.parse(linksData);

async function downloadImage(url, fileName) {
    try {
        const response = await Axios({
            method: 'GET',
            url: url,
            responseType: 'stream'
        });
        return new Promise((resolve, reject) => {
            response.data.pipe(fs.createWriteStream(fileName))
                .on('error', reject)
                .once('close', () => resolve(fileName));
        });
    } catch (err) {
        console.error(err);
    }
}

async function main() {
    let imageList = [];
    const imageFolderPath = `./images/pinterest/${folder}`
    if (!fs.existsSync(imageFolderPath)) {
        fs.mkdirSync(imageFolderPath);
    }

    for (const [i, link] of links.entries()) {
        let index = 1 + i
        try {
            await downloadImage(link, `${imageFolderPath}/${folder + `_` + index}.jpg`)
        } catch (error) {
            console.log(error);
            imageList.push(link);
        }
    }
    let data = JSON.stringify(imageList, null, 4);
    fs.writeFileSync(path, data);
};

main()
