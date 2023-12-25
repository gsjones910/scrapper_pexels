const fs = require('fs');
const puppeteer = require("puppeteer");
require('dotenv').config()

const path = './urls/pinterest-link.json';

const scrapURLs = [
    // "https://www.pinterest.jp/pin/132856257748973662/",
];

const timeout = 60000;

async function autoScroll(page) {
    await page.evaluate(async (timeout) => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 80;
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

    for (const [i, scrapURL] of scrapURLs.entries()) {
        let preListsData = fs.readFileSync(path);
        let preLists = JSON.parse(preListsData);
        try {
            await page.goto(scrapURL);
            await page.waitForTimeout(6000)
            await page.setViewport({ width: 1960, height: 1080 });

            await autoScroll(page);

            const imageLists = await page.evaluate(async () => {
                var imgList = []
                const links = document.querySelectorAll("div.XiG.zI7.iyn.Hsu > img");
                links.forEach((element) => {
                    var src = element.getAttribute("src")
                    if (src.includes("/736x/") || src.includes("/236x/")) {
                        if (src.includes("/236x/")) {
                            src = src.replace("/236x/", "/736x/")
                        }
                        if (imgList.indexOf(src) < 0) {
                            imgList.push(src)
                        }
                    }
                })
                return imgList
            });

            const lists = [...preLists, ...imageLists];
            let imageList = lists.filter((item, index) => lists.indexOf(item) === index);
            
            let data = JSON.stringify(imageList, null, 4);
            fs.writeFileSync(path, data);
        } catch (error) {
            console.log(scrapURL);
        }
    }

    await browser.close();
};

main()
