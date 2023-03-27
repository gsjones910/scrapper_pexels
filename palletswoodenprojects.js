const fs = require('fs');
const puppeteer = require("puppeteer");
require('dotenv').config()

let dateList = [
    {
        year: "2016",
        month: ["02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"]
    },
    {
        year: "2017",
        month: ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"]
    },
    {
        year: "2018",
        month: ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"]
    },
    {
        year: "2019",
        month: ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"]
    },
    {
        year: "2020",
        month: ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"]
    },
    {
        year: "2021",
        month: ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"]
    },
    {
        year: "2022",
        month: ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"]
    },
    {
        year: "2023",
        month: ["01", "02"]
    },
]

async function main() {
    for (let date of dateList) {
        var year = date.year
        var months = date.month
        for (let month of months) {
            let browser = await puppeteer.launch({ headless: false });
            let page = await browser.newPage();
            await page.goto(`https://www.palletswoodenprojects.com/wp-content/uploads/${year}/${month}/`);
            await page.setViewport({ width: 1960, height: 1080 });
            await page.waitForTimeout(1000)

            let imageLists = await page.evaluate(async () => {
                let imgList = []
                let images = document.querySelectorAll("#table-content > tbody > tr > td:nth-child(1) > a");
                images.forEach((element) => {
                    var src = element.getAttribute("href")
                    if (src && !src.includes("x") && src.includes(".jpg") ) {
                        imgList.push("https://www.palletswoodenprojects.com/" + src)
                    }
                })
                return imgList
            });

            await browser.close();

            let data = JSON.stringify(imageLists, null, 4);
            fs.writeFileSync(`./urls/${year}_${month}.json`, data);
        }
    }
};

main()
