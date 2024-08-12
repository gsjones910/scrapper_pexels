const fs = require('fs');
const puppeteer = require("puppeteer");
require('dotenv').config();
const Axios = require('axios')

const path = './urls/pinterest-video.json';

const scrapURLs = [
    // "https://www.pinterest.jp/pin//",
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

            const tempLinks = await page.evaluate(async () => {
                var imgList = []                
                const links = document.querySelectorAll("div > div > div > div > div > div > div > div > div > div > div > a");
                links.forEach(async (element) => {
                    var src = "https://www.pinterest.jp" + element.getAttribute("href")
                    imgList.push(src)
                })
                return imgList
            });

            let videoLinks = []
            for (const [i, link] of tempLinks.entries()) {
                try {
                    const response = await Axios({ method: 'GET', url: link, responseType: 'text' });
                    if (!response.status === 200) {
                        throw new Error(`HTTP error ${response.status}`);
                    }
                    const body = response.data;
                    const match = body.match(/<video.*?src=["'](.*?)["']/i);
                    if (match && match[1]) {
                        const videoUrl = match[1];
                        const outUrl = videoUrl.replace("/hls/", "/720p/").replace(".m3u8", ".mp4");
                        videoLinks.push(outUrl);
                    }
                } catch (error) {
                    
                }
            }

            const lists = [...preLists, ...videoLinks];
            let videoList = lists.filter((item, index) => lists.indexOf(item) === index);

            let data = JSON.stringify(videoList, null, 4);
            fs.writeFileSync(path, data);
        } catch (error) {
            console.log(scrapURL);
        }
    }

    await browser.close();
};

main()
