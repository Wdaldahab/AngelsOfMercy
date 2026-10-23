const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
(async () => {
 const browser = await chromium.launch({headless:true, channel:"chrome"});
 const page = await browser.newPage({viewport:{width:1440,height:1000}});
 const errors=[];page.on('pageerror', e=>errors.push(e.message));
 await page.goto('http://localhost:8765');
 await page.screenshot({path:process.env.OUTPUT_DIR+'/desktop.png',fullPage:true});
 await page.locator('#search').fill('nonexistent');assert.equal(await page.locator('#empty').isVisible(),true);
 await page.locator('#search').fill('');await page.locator('.card button').first().click();
 assert.equal(await page.locator('[name=specialty]').inputValue(),'Critical care');
 await page.locator('#hospitalTab').click();
 assert.equal(await page.locator('[name=license]').isDisabled(),true);
 assert.equal(await page.locator('[name=organization]').isVisible(),true);
 await page.locator('[name=name]').fill('Test Person');await page.locator('[name=email]').fill('test@example.com');
 await page.locator('[name=location]').fill('Chicago, IL');await page.locator('[name=organization]').fill('Test hospital');
 await page.locator('[name=consent]').check();
 assert.equal(await page.evaluate(()=>form.checkValidity()),true);
 assert.equal(await page.evaluate(()=>Object.hasOwn(inquiryData(),'authorization')),false);
 const source=fs.readFileSync('app.js','utf8').replace('const ONLINE_INTAKE_ENABLED = false','const ONLINE_INTAKE_ENABLED = true');
 for (const scenario of ['rejected','malformed','network','accepted']) {
   await page.route('**/app.js',route=>route.fulfill({body:source,contentType:'text/javascript'}));
   await page.reload();
   await page.route('https://formsubmit.co/**',route=> scenario==='network' ? route.abort() : route.fulfill({status:200,contentType:'application/json',body:scenario==='malformed'?'invalid':JSON.stringify({success:scenario==='accepted'?'true':'false'})}));
   await page.locator('[name=name]').fill('Test Person');await page.locator('[name=email]').fill('test@example.com');await page.locator('[name=location]').fill('Chicago');await page.locator('[name=specialty]').selectOption('Critical care');await page.locator('[name=license]').selectOption('Registered Nurse (RN)');await page.locator('[name=authorization]').selectOption('Prefer to discuss');await page.locator('[name=consent]').check();
   await page.locator('#submit').click();
   await page.waitForFunction(()=>!document.getElementById('submit').disabled);
   assert.match(await page.locator('#status').innerText(),scenario==='accepted'?/service accepted/:/could not be confirmed/);
   assert.equal(await page.locator('[name=name]').inputValue(),scenario==='accepted'?'':'Test Person');
   await page.unroute('https://formsubmit.co/**');
 }
 await page.unroute('**/app.js');await page.reload();
 for (const width of [320,375,768]) {
   await page.setViewportSize({width,height:900});
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'overflow at '+width);
 }
 await page.setViewportSize({width:375,height:812});await page.locator('.menu-toggle').click();
 assert.equal(await page.locator('#navigation').isVisible(),true);await page.locator('#navigation a').first().click();
 assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'false');
 await page.screenshot({path:process.env.OUTPUT_DIR+'/mobile.png',fullPage:true});
 assert.deepEqual(errors,[]);
 await browser.close();console.log('PASS: filtering, role selection, separate form payloads, mocked delivery failures/success, responsive widths, mobile navigation, no browser errors. No inquiries sent.');
})().catch(e=>{console.error(e);process.exit(1)});
