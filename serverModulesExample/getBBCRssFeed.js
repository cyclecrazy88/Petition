
var https  = require("https")
var fs = require("fs")
const xml2js = require('xml2js');

class GetBBCRsFeed{

	constructor(feedName,fileName){
		this.rssData = this.processData(feedName,fileName)
	}
	
	async processData(feedName,fileName){
		// Check if the cache is available from file - do we have a
		//	currently active reference for the given item
		var cache = this.getRequestFromCache(fileName)
		if (typeof cache == "string"){
			return {data:cache,cached:true}
		}
	
		var data = await this.getFeed(feedName)
		
		if (!fs.existsSync("./rssFeedCache")){
			fs.mkdirSync("./rssFeedCache")
		}
		
		if (typeof data == "string"){
			if (!fs.existsSync("./rssFeedCache/feed_"+fileName)){
				fs.mkdirSync("./rssFeedCache/feed_"+fileName)
			}
			
			fs.writeFileSync(
				"./rssFeedCache/feed_"+fileName+"/data.rss",data)
				
			var updateTime = new Date()
			fs.writeFileSync(
				"./rssFeedCache/feed_"+fileName+"/updateEpoc.txt",
				updateTime.getTime())
		}
		return {data:data,cached:false}
	}
	// Fetch the respose data from cache if available
	getRequestFromCache(fileName){
		if (fs.existsSync("./rssFeedCache/feed_"+fileName+"/updateEpoc.txt")){
			var updateEpoc =
			fs.readFileSync(
				"./rssFeedCache/feed_"+fileName+"/updateEpoc.txt",
				{encoding:"utf8"})
				
			const hour = (1000*60)*60
			const currentTime = new Date()
			
			// Verify if the date range provided is valid - then compare the distance
			// 	from now
			if (isFinite(updateEpoc)){
				var pastEpoc = parseInt(updateEpoc)
				var date = new Date(pastEpoc)
				// Check if the request has been made in the last hour - if true,
				//	simply return the value for the item from the cache.
				if (currentTime.getTime()-hour < pastEpoc){
					var rssData =
						fs.readFileSync(
						"./rssFeedCache/feed_"+fileName+"/data.rss",
						{encoding:"utf8"})
					return rssData
				}
			}
		}
		return null
	}
	
	getFeed(feedName){
		var options = {
			host:"feeds.bbci.co.uk",
			path:feedName,
			rejectUnauthorized:false,
		}
		return new Promise((result)=>{
			function makeRequest(response){
				var resultStr = ""
				response.on('data', function (data) {
   					 resultStr += data;
  				});

  				response.on('end', function () {
  					//var resultObj = JSON.parse(resultStr)
  					result(resultStr)
  				});
			
			}
		
			https.request(options, makeRequest).end();
		})
	
	}
}
// http://news.bbc.co.uk/rss/newsonline_uk_edition/feeds.opml

// http://feeds.bbci.co.uk/news/england/hampshire/rss.xml

class ParseRssFeed extends GetBBCRsFeed{
	constructor(feedName,fileName){
		super(feedName,fileName)
		this.items = this.procssItems()
	
	}
	
	async procssItems(){
		var dataFeed = await this.parseFeed()
		var resultItems = Array()
		
		// Check to see if the feed has some input items.
		if (dataFeed instanceof Object &&
			dataFeed.item instanceof Array){
			for (var itemKey in dataFeed.item){
				var inputItem = dataFeed.item[itemKey];
				
				if (inputItem.description instanceof Array &&
					inputItem.description.length > 0 &&
					inputItem.title instanceof Array &&
					inputItem.title.length > 0 &&
					inputItem.pubDate instanceof Array &&
					inputItem.pubDate.length > 0 &&
					inputItem.link instanceof Array &&
					inputItem.link.length > 0){
					var desc = inputItem.description[0]
					var title = inputItem.title[0]
					var pubDate = inputItem.pubDate[0]
					var link = inputItem.link[0]
					resultItems.push({desc,title,pubDate,link})
				}
			}
		}
		return resultItems
	}
	
	async parseFeed(){
		var data = await this.rssData
		
		return new Promise((resultOutput)=>{
			xml2js.parseString(data.data, function (err, result) {
   				 //console.dir(result);
   				 if (result instanceof Object &&
   				 	result.rss instanceof Object &&
   				 	result.rss.channel instanceof Array &&
   				 	result.rss.channel.length > 0){
   				 	var channel = result.rss.channel[0]
   				 	resultOutput(channel)
   				 }
   				 else{
   				 	resultOutput(null)
   				 }
			});
		})
		
	}
}

//new ParseRssFeed("/rss/newsonline_uk_edition/england/rss.xml","england")

module.exports = ParseRssFeed
