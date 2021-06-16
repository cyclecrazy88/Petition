
var summaryWorker = new Worker("./workerScripts/textSummary.js")
var detailSummary = new Worker("./workerScripts/detailSummary.js")
var wordSummaryGrouping = new Worker("./workerScripts/wordSummary.js")

class TableView{

	constructor(listData){
		if (listData instanceof PetitionList){
			this.processViewList(listData)
		}
	}
	// ---------------------------------------------
	//	Process the result listings for the data being displayed.
	// ---------------------------------------------
	async processViewList(listData){
		if (listData instanceof PetitionList){
			var signatureList = listData.sortBy("signature_count").reverse()
			var tableContainer = Array()
			var displayList = new PetitionList()
			for (var signatureKey in signatureList){
				var signatureItem = signatureList[signatureKey]
				
				var displayItem = {
					action:signatureItem.get("action"),
					additional_details:signatureItem.get("additional_details"),
					background:signatureItem.get("background"),
					signature_count:signatureItem.get("signature_count"),
					id:signatureItem.get("id"),}
				tableContainer.push(displayItem)
				displayList.add(signatureItem)
			}
			
			var resultList = displayList.toJSON()
			var summary = await this.calculateStats(resultList)
			
			var template = await fetch("./petitionListComponent/tableView.template")
			var summaryTemplate = await fetch("./petitionListComponent/summaryView.template")
			var html = await template.text()
			var summaryHtml = await summaryTemplate.text()
			var thisRef = this
			
			var activity = new Vue({
				el:".activityContainer",
				template:html,
				data:{
					id:1,
					tableContainer:tableContainer
				},
				methods:{
					tableViewClickItem:async function(itemCell){
						if ( isFinite(itemCell.currentTarget.id) ){
							var itemId = parseInt(itemCell.currentTarget.id)
							
							
							// 
							for (var itemKey in signatureList){
								var displayItem = signatureList[itemKey]
								// Lookup to see if the item searched for matches the 
								//	selected input item.
								if (displayItem.get("id") == itemId){
									var itemJsonObj = JSON.parse(JSON.stringify(displayItem))
									
									var peitionDetail = new RequestPetitionDetail(itemId)
									var detailData = await peitionDetail.result
									
									var summary = await thisRef.constituencySummary(detailData)
									
									thisRef.displayModalItem(itemJsonObj,summary)
									break
								}
							}
						}
					},
				}
			})
			
			var summary = new Vue({
				el:".itemSummaryContainer",
				template:summaryHtml,
				data:{
					words:summary.topList,
				},
				methods:{
					rowClick:function(itemCell){
						// Get the selected word for the selection
						var selectedWord = itemCell.currentTarget.getAttribute("word")
						if (typeof selectedWord == "string"){
							thisRef.summaryForWord(selectedWord,tableContainer)
						}
					},
				}
			})
			
			
		}
	}
	
	async summaryForWord(word,listing){
		var summaryList = Array()
		if (listing instanceof Array){
			for (var listingKey in listing){
				var listingItem = listing[listingKey]
				
				if (typeof listingItem.action == "string" &&
					listingItem.action.toLowerCase().indexOf(
					word.toLowerCase())>-1 ){
					summaryList.push(listingItem)
				}
				else if (typeof listingItem.additional_details == "string" &&
					listingItem.additional_details.toLowerCase().indexOf(
					word.toLowerCase())>-1 ){
					summaryList.push(listingItem)
				}else if(typeof listingItem.background == "string" &&
					listingItem.background.toLowerCase().indexOf(
					word.toLowerCase())>-1){
					summaryList.push(listingItem)
				}
				
			}
		}
		var loading = new LoadingModal()
		var thisRef = this
		Vue.nextTick(async function(){
			var data = await thisRef.calculateWordSummary(summaryList)
			loading.closeModal()
			var summaryModal = new WordSummaryModal(data,summaryList,word)
		})
		
		
		
		return summaryList
	}
	
	displayModalItem(inputData,summary){
		var modal = new displayModalComponent(inputData,summary)
	}
	// ------------------------------------------------------
	// Calculate the overall stats numbers for the input data
	// ------------------------------------------------------
	calculateStats(inputList){
		summaryWorker.postMessage(inputList)
		
		return new Promise((result)=>{
			summaryWorker.onmessage = function(resultData){
				result(resultData.data)
			}
		})
	}
	// ------------------------------------------------------
	//	Calculate summary for the individual data summary
	// ------------------------------------------------------
	constituencySummary(inputList){
		detailSummary.postMessage(inputList)
		return new Promise((result)=>{
			detailSummary.onmessage = function(resultData){
				result(resultData.data)
			}
		})
	}
	
	calculateWordSummary(inputList){
		wordSummaryGrouping.postMessage(inputList)
		return new Promise((result)=>{
			wordSummaryGrouping.onmessage = function(resultData){
				result(resultData.data)
			}
		})
	}
	
	
	
}

