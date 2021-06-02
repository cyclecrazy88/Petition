importScripts('https://cdn.jsdelivr.net/npm/setimmediate@1.0.5/setImmediate.min.js')
importScripts("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@0.10.3")
tf.setBackend('cpu')


class TextSummary{
	
	constructor(inputList){
		this.result = this.itemSummary(inputList)
		
	}
	
	itemSummary(inputList){
		var resultOverall = Object()
		
		for (var inputKey in inputList){
			var inputItem = inputList[inputKey]
			var itemSummary = this.summaryObject(inputItem)
			if (itemSummary instanceof Object){
				for (var summaryKey in itemSummary){
					if (resultOverall[summaryKey]==undefined){
						resultOverall[summaryKey] = 0
					}
					// Append the values to the overall totoal for the item.
					resultOverall[summaryKey] += itemSummary[summaryKey]
				}
				
			}
		}
		// Put the result data into a list so it can be more easily
		//	sorted.
		var averageList = Array()
		var resultList = Array()
		for (var formatKey in resultOverall){
			resultList.push(Array(formatKey,resultOverall[formatKey]))
			averageList.push(resultOverall[formatKey])
		}
		resultList =
		resultList.sort(function(input1, input2){
			if (input1[1] > input2[1]){
				return 1
			}
			return -1
		}).reverse()
		var summary = {}
		if (averageList.length > 0){
			var averageTensor = tf.tensor1d(averageList)
			summary= 
			tf.tidy(()=>{
				var max = averageTensor.max().dataSync()[0]
				var min = averageTensor.min().dataSync()[0]
				var mean = Math.round( averageTensor.mean().dataSync()[0])
				var sum = averageTensor.sum().dataSync()[0]
				return {max,min,mean,sum}
			})
			averageTensor
		}
		
		// Filter the top list to just the items above average
		var topList = Array()
		var repeatWords = Array()
		if (typeof summary.mean == "number" && 
				!isNaN(summary.mean) &&
				isFinite(summary.mean)){
			for (var formatKey in resultOverall){
				
				if (resultOverall[formatKey] > summary.mean){
					topList.push({word:formatKey,count:resultOverall[formatKey]})
				}
				
			}	
		}
		// Sort the top list top down.
		topList = topList.sort(function(input1, input2){
			if (input1.count > input2.count){
				return 1
			}
			return -1
		}).reverse()
		
		
		
		
		return {tutal:resultOverall,summary:summary,topList:topList}
	}
	
	summaryObject(inputItem){
		
		var itemListAction = inputItem.action.replace(".","").split(" ")
		var additional_details = inputItem.additional_details.replace(".","").split(" ")
		
		var summaryObj = Object()
		
		function textItemSummary(summaryList){
			for (var itemKey in summaryList){
				if (typeof summaryList[itemKey] == "string"){
					var summaryItem = summaryList[itemKey].toLowerCase()
					
					if (summaryObj[summaryItem]==undefined){
						summaryObj[summaryItem] = 0
					}
					summaryObj[summaryItem]++
				}
				
			}
			return summaryObj
		}
		textItemSummary(itemListAction)
		textItemSummary(additional_details)
		
		
		return summaryObj
	}
	
	
	
}

onmessage = async function(data){
	
	if (data instanceof Object &&
		data.data instanceof Array){
		var summary = new TextSummary(data.data)
		postMessage(summary.result)
	}
	
}
