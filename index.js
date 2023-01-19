const fs = require('fs');
const client = require('https');
const puppeteer = require("puppeteer");
//사용자정의: 검색어 수정
var search_title = "bmw"

async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            const timeout = 60000; // 60 seconds
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

            //사용자정의: 이부분의 시간을 조종하여 더 많은 이미지를 다운받을수 있음.
            setTimeout(() => {
                clearInterval(timer)
                resolve();
            }, timeout * 3);
        });
    });
}

const outTime = 10000; // 10 seconds
const options = {
    outTime
};

function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        client.get(url, options, (res) => {
            if (res.statusCode === 200) {
                res.pipe(fs.createWriteStream(filepath))
                    .on('error', reject)
                    .once('close', () => resolve(filepath));
            } else {
                res.resume();
                reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`));
            }
        });
    });
}

async function main() {

    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(`https://www.pexels.com/search/${search_title}/`);
    await page.setViewport({ width: 1960, height: 1080 });

    await autoScroll(page);

    const imageLists = await page.evaluate(async () => {
        var imgList = []
        const images = document.querySelectorAll(".spacing_noMargin__Q_PsJ.MediaCard_image__ljFAl");
        images.forEach((element) => {
            var src = element.getAttribute("src")
            const myArray = src.split("&");

            //사용자정의: w=1200을 수정하여(900, 800 등) 다운 받을수 있음.
            imgList.push(myArray[0] + "&cs=tinysrgb&w=1200")
        })
        return imgList
    });

    await browser.close();

    var dir = `./images/${search_title}`;

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }

    for (let i = 0; i < imageLists.length; i++) {
        const element = imageLists[i];
        downloadImage(element, `./images/${search_title}/${search_title + i}.jpg`)
    }
};

main()
