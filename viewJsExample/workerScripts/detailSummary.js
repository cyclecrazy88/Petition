
importScripts('https://cdn.jsdelivr.net/npm/setimmediate@1.0.5/setImmediate.min.js')
importScripts("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@0.10.3")
tf.setBackend('cpu')

class dataSummary{

	constructor(data){
		this.attributeSummary(data.attributes)
	}

	async attributeSummary(attributes){
		if (attributes instanceof Object){
			this.constituencySummary = this.groupingSummary(attributes.signatures_by_constituency)
		}
	}
	
	groupingSummary(groupSummary){
		var summary = Object()
		var summaryListings = Array()
		if (groupSummary instanceof Array){
			var summaryArray = Array()
			
			for (var groupKey in groupSummary){
				var groupItem = groupSummary[groupKey]
				
				if (typeof groupItem.name == "string" &&
					typeof groupItem.signature_count == "number"){
					var name = groupItem.name;
					var count = groupItem.signature_count
					summaryArray.push(count)
					summaryListings.push({name,count})
				}
			}
			summaryListings = summaryListings.sort(function(input1,input2){
				if (input1.count > input2.count){
					return 1
				}
				return -1
			}).reverse()
			
			if (summaryArray.length > 0){
				var summaryTensor = tf.tensor1d(summaryArray)
				var summary = 
				tf.tidy(()=>{
					var mean = summaryTensor.mean().dataSync()[0]
					var sum = summaryTensor.sum().dataSync()[0]
					var min = summaryTensor.min().dataSync()[0]
					var max = summaryTensor.max().dataSync()[0]
					return {mean,sum,min,max}
				})
			}
		}
		return {summary,summaryListings}
	}

}


onmessage = async function(data){
	if (data instanceof Object &&
		data.data instanceof Object &&
		data.data.data instanceof Object){
		var summary = new dataSummary(data.data.data)
		var constituencySummary = summary.constituencySummary
		postMessage({constituencySummary})
	}
}
