

class WordSummaryModal{

	constructor(summaryData,overallData,word){
		
		// Put a modal item summary onto the page.	
		var documentElement =
			document.querySelector(".modalItemWordSummary")
		if (documentElement != null){
			documentElement.remove()
		}
		
		// Append an item summary modal the screen.
		var modalItemWordSummary = document.createElement("div")
		modalItemWordSummary.className = "modalItemWordSummary"
		document.querySelector("body").appendChild(modalItemWordSummary)
		
		this.displayContent(summaryData,overallData,word)
	}
	
	async displayContent(summaryData,overallData,word){
		var template = await this.modalTemplate()
		var itemTemplate = await this.modalCompareTemplate()
		
		var templateView = Vue.component("word-modal-fit-item",{
			props:["name"],
			template:itemTemplate,
			data:function(){
				return {}
			},
			methods:{},
		})
		
		var modalView = new Vue({
			el:".modalItemWordSummary",
			template:template,
			data:{
				fit:summaryData.fit,
				test:summaryData.test,
				underAvg:summaryData.underAvg,
				overAvg:summaryData.overAvg,
				underDetail:summaryData.underDetail,
				overDetail: summaryData.overDetail,
				word:word,
			},
			methods:{
				closeWindow:function(eventData){
					this.$el.remove()
				}
			},
			
		})
	}
	
	
	async modalTemplate(){
		var template = await fetch("./wordSummaryModalComponent/modal.html")
		var data = await template.text()
		return data
	}
	
	async modalCompareTemplate(){
		var template = await fetch("./wordSummaryModalComponent/modalCompareItem.html")
		var data = await template.text()
		return data
	}
}

