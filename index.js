require('dotenv').config();
const puppeteer = require('puppeteer');
const fs = require('fs');
const fetch = require('node-fetch')
const path = require('path');
const wait = require('util').promisify(setTimeout);
const FormData = require('form-data')                                                                             
function awaitInput() {
return new Promise((res) => {
process.stdin.on('data', res)
})
}
async function uploadDiscord(file, fileName) {
    // if(file === null) {

    // }
 if(file)  fileName = `SPOILER_`+fileName
    const form = new FormData();
    // form.append('content', "New Snapchat Image")
    form.append("payload_json", `{\"content\":\"New Snapchat Image ${file ? "" : fileName}\"${file ? `,\"files\":[{\"id\":0,\"fileName\":\"${fileName}\",\"description\":\"Snapchat Image\"}]}` : ""}`);
 if (file)  form.append("files[0]", file, fileName);    
    // console.log(form.getBoundary())

fetch(process.env.WEBHOOK_URL,  {
    method: 'POST',
    body: form,
    redirect: 'follow'
  })
  .then(response => response.text())
  .then(result => {})
  .catch(error => console.log('error', error));
}
//document.getElementsByClassName('ReactVirtualized__Grid__innerScrollContainer')[0].children[3].children[0].click()
(async () => {
const getFileType = (await import('file-type')).fileTypeFromBuffer;

    let recordImages = false;
    console.log(Boolean(process.env.HEADLESS), process.env.HEADLESS)
    const browser = await puppeteer.launch({ headless: (process.env.HEADLESS  !== "false"), args: ['--no-sandbox', '--disable-setuid-sandbox']});
    const page = await browser.newPage();
    page.on('response', async response => {
        const url = response.url();
        // console.log(response.request().resourceType())
        if ((response.request().resourceType() === 'image'  || response.request().resourceType() == "media") && recordImages && url.startsWith('blob:')) {
            console.log(url,response.request().resourceType())
            try {
            await response.buffer().then(async file => {
                console.log("got buffer")
                // do not give ext, use script to give it
                const { ext } = await getFileType(file); 
                if(file.length < 15_000) return console.log("Buffer too small");

                if(fs.readdirSync(path.join(__dirname, 'assets')).some(e => fs.readFileSync(path.join(__dirname, 'assets', e)).length === file.length)) return console.log("File already exists")
                const fileName = url.split('/').pop() + `.${ext}`;
                const filePath = path.resolve(__dirname, 'assets', fileName);
                // if(fs.readdirSync(path.join(__dirname, 'assets')).some(e => e.startsWith(fileName))) return console.log("File already exists")
                if(process.env.SAVE_FILE !== "false") {
                    const writeStream = fs.createWriteStream(filePath);
                writeStream.write(file);
                }
                uploadDiscord(file, fileName)
            });
           } catch (e) {
            console.log(e.message)
            // just try sending the url
            // uploadDiscord(null, url)
            const newPage = await browser.newPage();
            newPage.on('response', async response => {
                const url = response.url();
                // console.log(response.request().resourceType())
                if ((response.request().resourceType() === 'image'  || response.request().resourceType() == "media") && recordImages && url.startsWith('blob:')) {
                    console.log(url,response.request().resourceType())
                    try {
                    await response.buffer().then(async file => {
                        console.log("got buffer")
                        if(file.length < 35_000) return console.log("Buffer too small");

                        if(fs.readdirSync(path.join(__dirname, 'assets')).some(e => fs.readFileSync(path.join(__dirname, 'assets', e)).length === file.length)) return console.log("File already exists")
                        // do not give ext, use script to give it
                        const { ext } = await getFileType(file); 
                        const fileName = url.split('/').pop() + `.${ext}`;
                        const filePath = path.resolve(__dirname, 'assets', fileName);
                        // if(fs.readdirSync(path.join(__dirname, 'assets')).some(e => e.startsWith(fileName))) return console.log("File already exists")
                        if(process.env.SAVE_FILE !== "false") {
                            const writeStream = fs.createWriteStream(filePath);
                        writeStream.write(file);
                        }
                        uploadDiscord(file, fileName)
                    });
                   } catch (e) {
                    console.log(e.message)
                    // just try sending the url
                    // uploadDiscord(null, url)
                   } finally {
                    await newPage.close()
                   }
                }
            });
            await newPage.goto(url)
           }
        }
    });
    await page.goto('https://web.snapchat.com');
    // await page.waitForSelector('ConsumerNavItem_link__r7__Z');
    // await page.waitForNetworkIdle();
await wait(2500);
   
    page.setDefaultNavigationTimeout(0);
    // if(fs.existsSync('cookies.json')) {
    //     await page.evaluate(() => {
    //         document.getElementsByClassName('ConsumerNavItem_link__r7__Z')[2].target = ""
    //         document.getElementsByClassName('ConsumerNavItem_link__r7__Z')[2].click()
    //     })
    //     await wait(1500)
     
    //     require('./cookies.json').forEach(async cookie => await page.setCookie(cookie))
     
    //     await wait(4_500)
    //     await page.reload()
    // } else {
try {
        await page.waitForNavigation({ timeout: 5000 });
} catch (e){}
        await page.evaluate(() => {
            document.getElementsByClassName('ConsumerNavItem_link__r7__Z')[2].target = ""
            document.getElementsByClassName('ConsumerNavItem_link__r7__Z')[2].click()
        })
        await page.waitForNavigation();
        await wait(4750)
        // check for cookie agreement
        await page.evaluate(() => {
            if(document.getElementsByClassName('sdsm-button') && document.getElementsByClassName('sdsm-button')[1]) document.getElementsByClassName('sdsm-button')[1].click()
        })
        await page.waitForSelector('[type="text"]')
        await page.type('[type="text"]', process.env.SNAPCHAT_USERNAME);
        await wait(1750);
        // captcha
       if(process.env.RUN_CAPTCHA_CHECK === "true") {
        console.log("Please solve the captcha and press enter")
        await  awaitInput()
       } else {
        await page.click('button[type="submit"]');
        await page.waitForNavigation();
       }
       // after captch it sends u to next page
    
        await page.waitForSelector('[type="password"]')
        await page.type('[type="password"]', process.env.SNAPCHAT_PASSWORD);
        await wait(1750);
        if(process.env.RUN_CAPTCHA_CHECK === "true") {
        console.log("Captcha 2")
       await  awaitInput();
        }
        await page.click('button[type="submit"]');
        await page.waitForNavigation();
        // await page.waitForSelector('') 
// fs.writeFileSync('cookies.json', JSON.stringify(await page.cookies()))    
    // }
       await wait(3200);
       //temp
    await page.goto('https://'+new URL(await page.url()).hostname +"/"+process.env.SNAPCHAT_CHAT_INDEX)
    await page.evaluate(() => {
      if( document.getElementsByClassName('NRgbw eKaL7 Bnaur')[0])  document.getElementsByClassName('NRgbw eKaL7 Bnaur')[0].click()
    })
await wait(1700);
// theres a second one lmao
await page.evaluate(() => {
    if( document.getElementsByClassName('NRgbw eKaL7 Bnaur')[0])  document.getElementsByClassName('NRgbw eKaL7 Bnaur')[0].click()
  })
    await page.waitForSelector('.ReactVirtualized__Grid__innerScrollContainer')
    await page.evaluate(() => {
        document.getElementsByClassName('ReactVirtualized__Grid__innerScrollContainer')[0].remove()
    })
    await wait(6500);
    
    // await page.evaluate((index) => {
    //     const els = Array.from(document.getElementsByClassName('ReactVirtualized__Grid__innerScrollContainer')[0].children)
    //    return  els.find(e => {
    //         const propName = Object.keys(e).find(key => key.startsWith('__reactFiber$'))
    //         return e[propName].key === index
    //     }).children[0].click()
    //     //.find(el => el.__reactFiber$kkvo4eqc6kn.key === index).click()
    // }, process.env.SNAPCHAT_CHAT_INDEX);
    // directly linked to chat
   if (process.env.AUTO_SCROLL !== "false") {
    setInterval(async () => {
        await  page.mouse.wheel({ deltaY: -50 })
      }, 1000)
   } else {
    setInterval(async () => {
        await  page.mouse.wheel({ deltaY: 10 })
      }, 1000)
      setInterval(() => {
        page.reload()
      }, 1000 * 60 * 60)
   }
    recordImages = true;

    console.log("Now recording images ../")
    // await browser.close();
})();
process.on('uncaughtException', console.error)
