const fs = require('fs');
const puppeteer = require("puppeteer");
require('dotenv').config();
const Axios = require('axios')

const path = './urls/facebook-video.json';
const path1 = './urls/facebook-video1.json';
const path2 = './urls/facebook-video2.json';
const url = "https://www.facebook.com/Themech.mind/videos_by"
const timeout = 3600000;

async function autoScroll(page) {
    await page.evaluate(async (timeout) => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 50;
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
    await page.setViewport({ width: 1960, height: 1080 });

    let login = async () => {
        // login
        await page.goto('https://facebook.com', {
          waitUntil: 'networkidle2'
        });
        await page.waitForSelector("#email");
        await page.type("#email", "jact6313@gmail.com");
        await page.type("#pass", "Jack94129!@#");
        await page.waitForTimeout(500)
    
        await page.click('button[name="login"]')
        console.log("login done");
        await page.waitForNavigation();
    }
    try {
        await login();
        await page.goto(url);
        await page.waitForTimeout(1000)
        // await page.click("div.x92rtbv.x10l6tqk.x1tk7jg1.x1vjfegm");
        await autoScroll(page);

        const tempLinks = await page.evaluate(async () => {
            var imgList = []
            const links = document.querySelectorAll("div.x78zum5.xdt5ytf.x1t2pt76.x1n2onr6.x1ja2u2z.x10cihs4 > div.x78zum5.xdt5ytf.x1t2pt76 > div > div > div.x6s0dn4.x78zum5.xdt5ytf.x193iq5w > div > div.x78zum5.x1n2onr6.xh8yej3 > div > div > div > div.x1mh8g0r > div > div > div > div > div > div > div > div > div:nth-child(1) > a");
            links.forEach(async (element) => {
                imgList.push(element.getAttribute("href"))

            })
            return imgList
        });

        let tempData = JSON.stringify(tempLinks, null, 4);
        fs.writeFileSync(path1, tempData);

        let videoLinks = []
        let errorLinks = []
        for (const [i, link] of tempLinks.entries()) {
            const formData = new FormData()
            formData.append('url', link);
            const response = await Axios({
                method: 'post',
                url: 'https://www.getfvid.com/downloader',
                data: formData
            })
            const body = response.data;
            const match = body.match(/<a href="(.+?)" target="_blank" class="btn btn-download"(.+?)>(.+?)<\/a>/i);
            if (match && match[1]) {
                const videoUrl = match[1];
                videoLinks.push(videoUrl);
            }else{
                errorLinks.push(link);
            }
        }

        let errorData = JSON.stringify(errorLinks, null, 4);
        fs.writeFileSync(path2, errorData);
        let data = JSON.stringify(videoLinks, null, 4);
        fs.writeFileSync(path, data);
    } catch (error) {
        console.log(error);
    }

    await browser.close();
};

main()
