require('dotenv').config();
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const wait = require('util').promisify(setTimeout);
//document.getElementsByClassName('ReactVirtualized__Grid__innerScrollContainer')[0].children[3].children[0].click()
(async () => {
    let recordImages = false;
    const browser = await puppeteer.launch({ headless: false, args: ['--no-sandbox', '--disable-setuid-sandbox']});
    const page = await browser.newPage();
    page.on('response', async response => {
        const url = response.url();
        if (response.request().resourceType() === 'image' && recordImages && url.startsWith('blob:')) {
            response.buffer().then(file => {
                console.log(url, url.startsWith('blob:'))
                // do not give ext, use script to give it 
                const fileName = url.split('/').pop();
                const filePath = path.resolve(__dirname, 'assets', fileName);
                if(fs.readdirSync(path.join(__dirname, 'assets')).some(e => e.startsWith(fileName))) return console.log("File already exists")
                const writeStream = fs.createWriteStream(filePath);
                writeStream.write(file);
            });
        }
    });
    await page.goto('https://web.snapchat.com');
    // await page.waitForSelector('ConsumerNavItem_link__r7__Z');
    // await page.waitForNetworkIdle();
await wait(1500);
    await page.evaluate(() => {
        document.getElementsByClassName('ConsumerNavItem_link__r7__Z')[2].target = ""
        document.getElementsByClassName('ConsumerNavItem_link__r7__Z')[2].click()
    })
    page.setDefaultNavigationTimeout(0);
    if(fs.existsSync('cookies.json')) {
        require('./cookies.json').forEach(async cookie => await page.setCookie(cookie))
        await wait(4_500)
    } else {
        await page.waitForNavigation();
        await page.waitForSelector('[type="text"]')
        await page.type('[type="text"]', process.env.SNAPCHAT_USERNAME);
        await wait(750);
        await page.click('button[type="submit"]');
        await page.waitForNavigation();
        await page.waitForSelector('[type="password"]')
        await page.type('[type="password"]', process.env.SNAPCHAT_PASSWORD);
        await wait(750);
        await page.click('button[type="submit"]');
        await page.waitForNavigation();
        // await page.waitForSelector('') 
fs.writeFileSync('cookies.json', JSON.stringify(await page.cookies()))    
    }
       await wait(2200);
    await page.evaluate(() => {
      if( document.getElementsByClassName('NRgbw eKaL7 Bnaur')[0])  document.getElementsByClassName('NRgbw eKaL7 Bnaur')[0].click()
    })
await wait(700);
// theres a second one lmao
await page.evaluate(() => {
    if( document.getElementsByClassName('NRgbw eKaL7 Bnaur')[0])  document.getElementsByClassName('NRgbw eKaL7 Bnaur')[0].click()
  })
    await page.waitForSelector('.ReactVirtualized__Grid__innerScrollContainer')
    await wait(5500);
    await page.evaluate((index) => {
        const els = Array.from(document.getElementsByClassName('ReactVirtualized__Grid__innerScrollContainer')[0].children)
       return  els.find(e => {
            const propName = Object.keys(e).find(key => key.startsWith('__reactFiber$'))
            return e[propName].key === index
        }).children[0].click()
        //.find(el => el.__reactFiber$kkvo4eqc6kn.key === index).click()
    }, process.env.SNAPCHAT_CHAT_INDEX);
    recordImages = true;

    console.log("Now recording images ../")
    // await browser.close();
})();
process.on('uncaughtException', console.error)