
var https  = require("https")
var fs = require("fs")

// https://petition.parliament.uk/petitions.json?page=1&state=open


class RequestPetitionOpen{

	constructor(pageNumber){
		this.result = this.processRequest(pageNumber)
	}
	// ---------------------------------------------------------------
	// Attempt to make the request and fetch the corresponding data
	//	for a given page number.
	// ---------------------------------------------------------------
	async processRequest(pageNumber){
		// if the data is available from cache return this.
		var cacheData = this.getRequestFromCache(pageNumber)
		if (cacheData instanceof Object){
			cacheData.cached = true
			return cacheData
		}
	
		// Looks like the data isn't available from cache -
		//	So attempt to make a webrequest and save the 
		//	data to cache
		var data = await this.getData(pageNumber)
		
		if (!fs.existsSync("./openPetitionCache")){
			fs.mkdirSync("./openPetitionCache")
		}
		
		if (data instanceof Object){
			// Check to see if the petition cache directory
			//	for available updates is available, if not create it.
			if (!fs.existsSync("./openPetitionCache/page_"+pageNumber)){
				fs.mkdirSync("./openPetitionCache/page_"+pageNumber)
			}
			
			fs.writeFileSync(
				"./openPetitionCache/page_"+pageNumber+"/data.json",
				JSON.stringify(data))
				
			var updateTime = new Date()
			fs.writeFileSync(
				"./openPetitionCache/page_"+pageNumber+"/updateEpoc.txt",
				updateTime.getTime())
		}
		data.cached = false
		return data
	}
	
	getRequestFromCache(pageNumber){
	
		if (fs.existsSync("./openPetitionCache/page_"+pageNumber+"/updateEpoc.txt")){
			var updateEpoc =
			fs.readFileSync(
				"./openPetitionCache/page_"+pageNumber+"/updateEpoc.txt",
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
					var jsonData = 
					fs.readFileSync(
						"./openPetitionCache/page_"+pageNumber+"/data.json",
						{encoding:"utf8"})
					return JSON.parse(jsonData)
				}
			}
		}
		return null
	}
	
	async getData(pageNumber){
		var options = {
			host:"petition.parliament.uk",
			path:"/petitions.json?page="+pageNumber+"&state=open",
		}
		
		return new Promise((result)=>{
			function makeRequest(response){
				var resultStr = ""
				response.on('data', function (data) {
   					 resultStr += data;
  				});

  				response.on('end', function () {
  					var resultObj = JSON.parse(resultStr)
  					result(resultObj)
  				});
			
			}
		
			https.request(options, makeRequest).end();
		})
		
		
		
	}

	

	
}

//new RequestPetitionOpen(1)
module.exports = RequestPetitionOpen



