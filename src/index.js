const puppetter = require("puppeteer");
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
var HTMLParser = require('node-html-parser');

(async() => {

    const browser = await puppetter.launch({
		headless: true,
		ignoreHTTPSErrors: true,
		slowMo: 0,
		args: ['--window-size=1400,900',
		'--remote-debugging-port=9222',
		"--remote-debugging-address=0.0.0.0", 
		'--disable-gpu', "--disable-features=IsolateOrigins,site-per-process", '--blink-settings=imagesEnabled=true'
		]});

        module.exports.browser = browser;

        app.set("view engine", "ejs")
        app.use(express.static("public"));

        app.use(express.urlencoded({
            extended: true
        }))
        
        app.get("/", (req, res) => {
            res.render('main', {
                title: "Tiktok sound puller | By Ramok",
       
            });
        });

        app.post("/", async(req, res) => {
            if(!req.body.link || !new URL(req.body.link).hostname.includes("tiktok")) {
                return res.render('main', {
                    title: "Error sound puller | By Ramok",
                    error: "Invalid link"
                })
            }

            const page = await browser.newPage();
            await page.goto(req.body.link, {waitUntil: "load"});
            
            const title = await page.title();
            if(title == "" || !title) {
                await page.close();
                return res.render('main', {
                    title: "Error sound puller | By Ramok",
                    error: "Cannot find the song"
                })
            }
            const html = await page.content();
            var root = HTMLParser.parse(html);
            var element = root.getElementsByTagName("video")[0];
            
            if(element === null || element === undefined || element.getAttribute("src").includes("blob")) {
                await page.close();
                return res.render('main', {
                    title: "Error sound puller | By Ramok",
                    error: "Internal server error, cannot pull the sound"
                })
            }

            var linkzgeg = element.getAttribute("src");
            if(linkzgeg === null || linkzgeg === undefined) {
                await page.close();
                console.log("zgeg")
                return res.render('main', {
                    title: "Error sound puller | By Ramok",
                    error: "Internal server error, cannot pull the sound"
                })
            }

            await page.close();
            return res.render('main', {
                title: "Sound found.",
                soundtitle: title,
                soundlink: linkzgeg
                
            })
 


        });

    app.listen(port, () => {
        console.log(`Listening on port ${port}`);
    });
})();