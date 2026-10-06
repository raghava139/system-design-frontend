const puppeteer = require('puppeteer');

(async function(){
    const browser = await puppeteer.launch({
        headless:false,
        slowMo:100,
        args: ["--window-size=1720,1080"]
    })

    const page = await browser.newPage();
    await page.goto('https://flipkart.com');
    // console.log("webpage Loaded")
    await page.setViewport({
        width:1500,
        height:1080
    });

    // const courseLink = '.items-center > li:nth-child(2) > a';

    // await page.waitForSelector(courseLink);

    // await page.click(courseLink)
    // await browser.close();

})();

// =====>  task  <=========
// Automate Whole use Journey
// Run this Script Every Day at 8:00AM
// collect the all logs and errors send it to email;