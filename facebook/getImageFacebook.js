const fs = require('fs');
const puppeteer = require("puppeteer");
const Axios = require('axios')
require('dotenv').config()

const url = "https://www.facebook.com/architecturematter/photos"
const fileName = "interior"
const amount = 2000

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
    await page.goto(url);
    //close modal event
    await page.waitForTimeout(1000)
    await page.click("div.x92rtbv.x10l6tqk.x1tk7jg1.x1vjfegm");
    //change viewport size
    await page.setViewport({ width: 1960, height: 1080 });
    //click first item
    const aSelector = `div.x78zum5.x1q0g3np.x1a02dak > div:nth-child(1) > div > div > div > div > a`;
    await page.waitForSelector(aSelector);
    await page.click(aSelector);
    await page.waitForTimeout(500);

    for (const i of Array.from({ length: amount }, (_, index) => index + 1)) {
        try {
            const imageSrc = await page.evaluate(() => {
                const image = document.querySelectorAll("div.x6s0dn4.x78zum5.x1n2onr6.x1rmlpev > div > div > div > img");
                if(image[0]){
                    var src = image[0].getAttribute("src");
                    return src;
                }
            });
            if(imageSrc){
                await downloadImage(imageSrc, `./images/facebook/${fileName+"_"+i}.jpg`);
            }
        } catch (error) {
            console.log(error)
        }
        
        const nextSelector = "div.x6s0dn4.x1ey2m1c.x78zum5.xds687c.x1qughib.x10l6tqk.x17qophe.x13vifvy > div:nth-child(3)";
        await page.waitForSelector(nextSelector);
        await page.hover(nextSelector);
        await page.click(nextSelector);
    }

    await browser.close();
};

main()
