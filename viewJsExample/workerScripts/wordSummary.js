importScripts('https://cdn.jsdelivr.net/npm/setimmediate@1.0.5/setImmediate.min.js')
importScripts("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@0.10.3")
tf.setBackend('cpu')

class ItemListSummary{

	constructor(inputList){
		// ----------------------------------------------------
		// Create a model to process the result input data.
		//
		//	A modal can be used to figure out the groupings for
		//		the various input items.
		// ----------------------------------------------------
		var model = tf.sequential({
			layers: [tf.layers.dense({units: 1, inputShape: [1,]})]});
		
		model.add(
			tf.layers.dense({
				units: 1, inputShape: [1,], 
				activation: 'relu'}));
		model.add(tf.layers.dense(
			{units: 1, 
			inputShape: [1,],
			activation: 'sigmoid'}));
		
		model.compile({optimizer: 'sgd', loss: 'meanSquaredError'});
		this.model = model
		
		
		// Result summary listings
		this.result = this.listSummaryItems(inputList)
	}
	
	async listSummaryItems(list){
		
		var labelList = Array()
		var totalSummary = Array()
		var totalModelFitItems = Array()
	
		// Append an extra item to the rounding list
		var roundList = Math.round(list.length * 0.10)
		if (roundList == 0){
			roundList++
		}
	
		if (list instanceof Array){
			// Ensure the listing is in order.
			list = list.sort(function(input1,input2){
				if (input1.signature_count > input2.signature_count){
					return -1
				}
				return 1
			})
			
			// Counter for the 'fit' and then model testing.
			var listCount = 0
			
			// Summary listing for the item grouping.
			var summaryListing = Array()
		
			for (var listKey in list){
				var listItem = list[listKey]
				
				if (labelList.indexOf(listItem.action)==-1){
					labelList.push(listItem.action)
				}
				var listIndex = labelList.indexOf(listItem.action)
				
				try{
					var petitionFetch = await fetch("/petitionItem?petition="+listItem.id)
					var data = await petitionFetch.json()
					
					
					
				}
				catch(error){	
					return null;
				}
				
				
				if (data instanceof Object &&
					data.data instanceof Object &&
					data.data.attributes instanceof Object &&
					data.data.attributes.signatures_by_region instanceof Array){
					var regionCounts = data.data.attributes.signatures_by_region
					
					var selectionSummary = new SummaryForGroupSelection(regionCounts,listItem.action)
					summaryListing.push(Array(listItem.action,await selectionSummary.groupSummary))
					
					// Based on the current counts - either fit or train the model to the
					//	desired numbers.
					if (listCount > roundList){
						var resultSummary = await this.regionCountsTestModel(regionCounts)
						totalSummary.push({summary:resultSummary,name:listItem.action})
						//break
					}else{
						
					
						var modelFitResult = await this.regionCounts(regionCounts)
						totalModelFitItems.push({summary:null,name:listItem.action})
					}
					
				}
				
				
				listCount++
				
				//if (listCount > 5){
				//	break
				//}
				
			}
		}
		// Sort the options into number order, so the most likely shortly following up to
		//	least
		totalSummary = totalSummary.sort((input1, input2)=>{
			if (input1.summary > input2.summary){
				return -1
				
			}
			return 1
		})
		var avgSummaryObjUnder = Object()
		var avgSummaryObjOver = Object()
		
		var avgSummaryObjUnderDetail = Object()
		var avgSummaryObjOverDetail = Object()
		
		if (summaryListing.length > 0){
			
		
			// Loop around the listing options - count those areas - above/below average
			//	for the given data set (slice of the area which are popular everytime)
			//	down to those popular sometimes.
			for (var listingKey in summaryListing){
				var listingItem = summaryListing[listingKey]
				
				for (var underKey in listingItem[1].underAvg){
					// Loop up the under object - index a count for the reference item.
					var underItem = listingItem[1].underAvg[underKey]
					
					if (underItem.selectionItem instanceof Object &&
						typeof underItem.selectionItem.name == "string"){
						if (avgSummaryObjUnder[underItem.selectionItem.name]==undefined){
							avgSummaryObjUnder[underItem.selectionItem.name] = 0
							avgSummaryObjUnderDetail[underItem.selectionItem.name] = Array()
						}
						avgSummaryObjUnder[underItem.selectionItem.name]++
						avgSummaryObjUnderDetail[underItem.selectionItem.name].push(underItem.selectionItem)
						
						// Sort the selection
						avgSummaryObjUnderDetail[underItem.selectionItem.name] = 
							avgSummaryObjUnderDetail[underItem.selectionItem.name].sort((input1,input2)=>{
							if (input1.signature_count > input2.signature_count){
								return 1
							}
							return -1
						})
					}
				}
				
				for (var overKey in listingItem[1].overAvg){
					// Loop up the over object - index a count for the reference item.
					var overItem = listingItem[1].overAvg[overKey]
					if (overItem.selectionItem instanceof Object &&
						typeof overItem.selectionItem.name == "string"){
						if (avgSummaryObjOver[overItem.selectionItem.name]==undefined){
							avgSummaryObjOver[overItem.selectionItem.name] = 0
							avgSummaryObjOverDetail[overItem.selectionItem.name] = Array()
						}
						avgSummaryObjOver[overItem.selectionItem.name]++
						avgSummaryObjOverDetail[overItem.selectionItem.name].push(overItem.selectionItem)
						
						// Sort the selection
						avgSummaryObjOverDetail[overItem.selectionItem.name] = 
							avgSummaryObjOverDetail[overItem.selectionItem.name].sort((input1,input2)=>{
							if (input1.signature_count > input2.signature_count){
								return -1
							}
							return 1
						})
					}
				}
			}
		}
		
		// Loop around the summary objects - format with an array/object for display
		var underlist = Array()
		var overlist = Array()
		for (var overKey in avgSummaryObjUnderDetail){
			underlist.push({key:overKey,detail:avgSummaryObjUnderDetail[overKey]})
		}
		for (var underKey in avgSummaryObjOverDetail){
			overlist.push({key:underKey,detail:avgSummaryObjOverDetail[underKey]})
		}
		
		
		
		
		// Now sort the listing - By least/most. So area which are pushing for change,
		//	not pushing for change and sometimes like change.
		
		return {test:totalSummary,
				fit:totalModelFitItems,
				underAvg:underlist,
				overAvg:overlist,
				underDetail:avgSummaryObjUnderDetail,
				overDetail: avgSummaryObjOverDetail}
	}
	// Train the model for the regional counts label - (overall counts)
	//	for the regions.
	async regionCounts(inputList){
		// Create a list for the corresponding labels
		var labelList = Array()
		
		// Index the values for the index and count values.
		var indexList = Array()
		var countList = Array()
		
		// Calculate the maximum value for the data set.
		var maxValue = 0
		for (var countKey in inputList){
			var listItem = inputList[countKey]
			if (listItem.signature_count > maxValue){
				maxValue = listItem.signature_count
			}
		}
		
		// Loop around the dataset - for the labels calculate 
		//	the values relative to there max allowed.
		for (var countKey in inputList){
			var listItem = inputList[countKey]
			if (labelList.indexOf(listItem.name)==-1){
				labelList.push(listItem.name)
			}
			var listIndex = labelList.indexOf(listItem.name)
			var count = listItem.signature_count
			
			indexList.push(listIndex)
			countList.push(count/maxValue)
		}
		
		if (indexList.length > 0 && countList.length > 0){
			var indexTensor = tf.tensor1d(indexList).reshape([indexList.length,1])
			var countTensor = tf.tensor1d(countList).reshape([countList.length,1])
			
			const history = await this.model.fit(
									countTensor, indexTensor, {
									batchSize: 4,epochs: 10});
			if (history instanceof Object){
				return history
			}
		}
		
		return null
	}
	// Run a test for the corresponding item/region values.
	async regionCountsTestModel(inputList){
		// Create a list for the corresponding labels
		var labelList = Array()
		
		// Index the values for the index and count values.
		var indexList = Array()
		var countList = Array()
		
		// Calculate the maximum value for the data set.
		var maxValue = 0
		for (var countKey in inputList){
			var listItem = inputList[countKey]
			if (listItem.signature_count > maxValue){
				maxValue = listItem.signature_count
			}
		}
		
		for (var countKey in inputList){
			var listItem = inputList[countKey]
			var count = listItem.signature_count
			countList.push(count/maxValue)
		}
		
		if (countList.length > 0){
			var countTensor = tf.tensor1d(countList).
				reshape([countList.length,1])
			var predictionResultTensor = this.model.predict(countTensor)
			if (predictionResultTensor instanceof Object){
				// Fetch the mean value for the test result
				var mean = tf.tidy(()=>{
					var mean = predictionResultTensor.mean().dataSync()[0]
					
					if (!isNaN(mean) && isFinite(mean)){
						return mean
					}
					else{
						return null
					}
				})
				return mean
			}
		}
		return null
	}

}
/*********************************
	Summary for group selection - items.
**********************************/
class SummaryForGroupSelection{

	constructor(selectionSummary,action){
		this.action = action
		// ----------------------------------------------------
		// Create a model to process the result input data.
		//
		//	A modal can be used to figure out the groupings for
		//		the various input items.
		// ----------------------------------------------------
		var model = tf.sequential({
			layers: [tf.layers.dense({units: 1, inputShape: [1,]})]});
		
		model.add(
			tf.layers.dense({
				units: 1, inputShape: [1,], 
				activation: 'relu'}));
		model.add(tf.layers.dense(
			{units: 1, 
			inputShape: [1,],
			activation: 'sigmoid'}));
		
		model.compile({optimizer: 'sgd', loss: 'meanSquaredError'});
		this.model = model
	
		var summaryOverview = this.summaryGrouping(selectionSummary)
		this.groupSummary = this.summaryByGroup(summaryOverview)
		
	}
	
	
	
	
	// -------------------------------------------------
	//	Grouping Summary - Summarize the items relative to position.
	// -------------------------------------------------
	async summaryGrouping(selectionSummary){
		// -------------------------------------------------
		// Firstly figure out the range - top/bottom for the
		//	listing
		// -------------------------------------------------
		var countListing = Array()
		var summaryListing = Array()
		if (selectionSummary instanceof Array){
			for (var selectionKey in selectionSummary){
				var selectionItem = selectionSummary[selectionKey]
				if (typeof selectionItem.signature_count == "number"){
					var count = selectionItem.signature_count
					countListing.push(count)
				}
			}
		}
		
		
		if (countListing.length > 0){
			var counter = tf.tensor1d(countListing)
			var summary = 
			tf.tidy(()=>{
				var max = counter.max().dataSync()[0]
				var min = counter.min().dataSync()[0]
				var mean = counter.mean().dataSync()[0]
				var sum = counter.sum().dataSync()[0]
				return {max,min,mean,sum}
			})
			
			if (summary instanceof Object &&
				!isNaN(summary.max) && isFinite(summary.max)&&
				!isNaN(summary.min) && isFinite(summary.min)&&
				!isNaN(summary.mean) && isFinite(summary.mean) ){
				var max = summary.max;
				var min = summary.min;
				var range = max-min
				// Loop around the summary data - mapping the labels
				//	For the corresponding values.
				for (var selectionKey in selectionSummary){
					var selectionItem = selectionSummary[selectionKey]
					if (typeof selectionItem.signature_count == "number"){
						var count = selectionItem.signature_count
						
						// Deduce where the value is relative to the range, 
						//	removing the minumum from the data.
						var rangeAdjusted = count - min
						var offset = rangeAdjusted/range
						// Store the range / overlay for the data
						summaryListing.push({offset,selectionItem})
					}
				}
			}
		}
		
		// Summarize the overall listing items.		
		if (summaryListing.length > 0){
			summaryListing.sort((input1,input2)=>{
				if (input1.offset > input2.offset){
					return -1
				}
				return 1
			})
		}
		return summaryListing
		
	}
	
	async summaryByGroup(inputList){
		var list = await inputList
		var totalList = Array()
		if (list instanceof Array){
			for (var inputKey in list){
				var inputItem = list[inputKey]
				totalList.push(inputItem.offset)
			}
		}
		
		var underAvg = Array()
		var overAvg = Array()
		
		if (totalList.length > 0){
			var totalTensor = tf.tensor1d(totalList)
			var summary = 
			tf.tidy(()=>{
				var max = totalTensor.max().dataSync()[0]
				var min = totalTensor.min().dataSync()[0]
				var mean = totalTensor.mean().dataSync()[0]
				var sum = totalTensor.sum().dataSync()[0]
				return {max,min,mean,sum}
			})
			
			if (summary instanceof Object &&
				!isNaN(summary.sum) && isFinite(summary.sum) ){
				// Based on the summary, find those above and below 
				//	average
				for (var overallKey in list){
					var inputItem = list[overallKey]
					
					if (inputItem.selectionItem instanceof Object){
						inputItem.selectionItem.action = this.action
					}
					
					if (inputItem.offset < summary.mean){
						underAvg.push(inputItem)
					}else{
						overAvg.push(inputItem)
					}
				}
			}
		}
		return {underAvg,overAvg}
	}
	

}

onmessage = async function(data){

	if (data.data instanceof Array){
		var summary = new ItemListSummary(data.data)
		var result = await summary.result
		postMessage(result)
	}else{
		postMessage(null)
	}

	
}
