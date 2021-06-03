
const express = require("express")
const app = express()
const port = 9080

var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 


const getPetitionOpen = require("./serverModulesExample/getPetitionOpen.js")
const getPetitionDetail = require("./serverModulesExample/getPetitionDetail.js")
const getBBCRssFeed = require("./serverModulesExample/getBBCRssFeed.js")

const config = require("./config.json")

app.use(express.static('viewJsExample'))

app.get("/openPetitions",async (req,res)=>{
	var pageRegExp = new RegExp(/^(?:page)[=]([0-9]{1,})$/)
	
	var requestData = req.url.split("?")[1]
	var resultData = {}
	if (pageRegExp.test(requestData)){
		var parsePage = pageRegExp.exec(requestData)
		
		var pageNumber = parseInt(parsePage[1])
		var webRequestOpenPetitions = new getPetitionOpen(pageNumber)
		resultData = await webRequestOpenPetitions.result
	}
	res.setHeader('Content-Type', 'application/json');
	res.send(resultData)
	res.end()

})

app.get("/petitionItem", async (req,res)=>{
	var pageRegExp = new RegExp(/^(?:petition)[=]([0-9]{1,})$/)
	var requestData = req.url.split("?")[1]
	var resultData = {}
	
	if (pageRegExp.test(requestData)){
		var parsePage = pageRegExp.exec(requestData)
		
		var pageNumber = parseInt(parsePage[1])
		var petitionDetail = new getPetitionDetail(pageNumber)
		resultData = await petitionDetail.result
	}
	res.setHeader('Content-Type', 'application/json');
	res.send(resultData)
	res.end()
})

app.get("/getNewsFeed", async (req,res)=>{
	var pageRegExp = new RegExp(/^(?:feed)[=]([0-9a-zA-Z]{1,})$/)
	var requestData = req.url.split("?")[1]
	var resultData = {}
	
	if (pageRegExp.test(requestData)){
		var parsePage = pageRegExp.exec(requestData)
		
		// Loop around the config to find the url/path
		//	configured for the request
		for (var configKey in config){
			var configItem = config[configKey]
			if (configItem.key == parsePage[1]){
				var feed = new getBBCRssFeed(configItem.url,configItem.key)
				resultData = await feed.items
				break
			}
		}
	}
	res.setHeader('Content-Type', 'application/json');
	res.send(resultData)
	res.end()
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
