require('dotenv').config();
const puppeteer = require('puppeteer');
const nodeCron = require("node-cron");

async function run(){
    // First, we must launch a browser instance
    const browser = await puppeteer.launch({
        // Headless option allows us to disable visible GUI, so the browser runs in the "background"
        // for development lets keep this to true so we can see what's going on but in
        // on a server we must set this to true
        //headless: false,
        // This setting allows us to scrape non-https websites easier
        ignoreHTTPSErrors: true,
    })
    // then we need to start a browser tab
    let page = await browser.newPage();

    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36");
    // and tell it to go to some URL
    await page.goto(process.env.URL_COMP, {
        waitUntil: 'domcontentloaded',
    });
    // print html content of the website

    let res = new Array();
    const linksProps = await page.$$eval('.sc-i1odl-0 ', el => el.map(e => e.dataset.toPosting));
    const dataProps = await page.$$eval('.sc-i1odl-0 ', el => el.map(e => e.textContent));

    if(linksProps.length === 0 && dataProps.length === 0){
        console.log("No hay propiedades nuevas");
    }else{
        console.log("Hay propiedades nuevas")
        for(let i=0; i<linksProps.length; i++){
            let obj = new Object();
            obj.data = dataProps[i];
            obj.link = process.env.URL_BASE+linksProps[i];
            res.push(obj)
        }
        console.log(res);
    }

    // close everything
    await page.close();
    await browser.close();
}

const job = nodeCron.schedule("*/15 * * * * *", () => {
    run();
});