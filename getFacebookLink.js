const fs = require('fs');
const puppeteer = require("puppeteer");
require('dotenv').config()

const timeout = 60000 * 60

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
    await page.goto("https://www.facebook.com/media/set/?set=a.463390225809082&type=3");
    await page.setViewport({ width: 1960, height: 1080 });

    await autoScroll(page);
    
    const imageLists = await page.evaluate(async () => {
        var imgList = []
        const links = document.querySelectorAll("div.x78zum5.x1n2onr6.xh8yej3 > div > div > div > a");
        links.forEach((element) => {
            var src = element.getAttribute("href")
            imgList.push("https://www.facebook.com"+src)
        })
        return imgList
    });

    await browser.close();

    let data = JSON.stringify(imageLists, null, 4);
    fs.writeFileSync(`./urls/facebook-link.json`, data);
};

main()
