const fs = require('fs');
const puppeteer = require("puppeteer");
require('dotenv').config()

const search_title = process.env.SEARCH_TITLE
const image_size = process.env.IMAGE_SIGE
const timeout = process.env.TIMEOUT

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
    await page.goto(`https://www.pexels.com/search/${search_title}/`);
    await page.setViewport({ width: 1960, height: 1080 });

    await autoScroll(page);

    const imageLists = await page.evaluate(async (image_size) => {
        var imgList = []
        const images = document.querySelectorAll(".spacing_noMargin__Q_PsJ.MediaCard_image__ljFAl");
        images.forEach((element) => {
            var src = element.getAttribute("src")
            if (src && src != "") {
                const myArray = src.split("&");
                imgList.push(myArray[0] + "&cs=tinysrgb&w=" + image_size)
            }
        })
        return imgList
    }, image_size);

    await browser.close();

    let data = JSON.stringify(imageLists, null, 4);
    fs.writeFileSync(`./urls/${search_title}.json`, data);
};

main()
