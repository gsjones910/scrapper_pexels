const fs = require('fs');
const Axios = require('axios')
const puppeteer = require("puppeteer");
require('dotenv').config()
let linksData = fs.readFileSync('./urls/facebook-link.json');
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
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.setViewport({ width: 1960, height: 1080 });
    let imageList = [];
    for (const [i, link] of links.entries()) {
        try {
            await page.goto(link);
            await page.waitForTimeout(500)
            const imageSrc = await page.evaluate(async () => {
                const image = document.querySelectorAll("div.x6s0dn4.x78zum5.xdt5ytf.xl56j7k.x1n2onr6 > img");
                var src = image[0].getAttribute("src")
                return src
            });
            await downloadImage(imageSrc, `./images/facebook/${5777+i}.jpg`)
        } catch (error) {
            imageList.push(link);
        }
    }
    await browser.close();

    let data = JSON.stringify(imageList, null, 4);
    fs.writeFileSync(`./urls/facebook-link.json`, data);
};

main()
