const fs = require('fs');
const puppeteer = require("puppeteer");
const Axios = require('axios')
require('dotenv').config()

const url = "https://www.facebook.com/sheldydservin/photos"
const fileName = "sheldydservin"
const timeout = 60000 * 10

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

async function autoScroll(page) {
    await page.evaluate(async (timeout) => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 150;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight - window.innerHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 1000);

            setTimeout(() => {
                clearInterval(timer)
                resolve();
            }, timeout);
        });
    }, timeout);
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
    //scroll down
    await autoScroll(page);
    //get all images list
    const imageLists = await page.evaluate(async () => {
        var imgList = []
        const links = document.querySelectorAll("div.x78zum5.x1q0g3np.x1a02dak > div > div > div > a");
        links.forEach((element) => {
            var src = element.getAttribute("href")
            imgList.push(src)
        })
        return imgList
    });
    //click first item
    const aSelector = `div.x78zum5.x1q0g3np.x1a02dak > div:nth-child(1) > div > div > a`;
    await page.waitForSelector(aSelector);
    await page.click(aSelector);
    await page.waitForTimeout(500);

    for (const [i, link] of imageLists.entries()) {
        try {
            const imageSrc = await page.evaluate(() => {
                const image = document.querySelectorAll("div.x6s0dn4.x78zum5.x1n2onr6.x1rmlpev > div > div > div > img");
                var src = image[0].getAttribute("src");
                return src;
            });
            await downloadImage(imageSrc, `./images/facebook/${fileName+"_"+i}.jpg`);
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
