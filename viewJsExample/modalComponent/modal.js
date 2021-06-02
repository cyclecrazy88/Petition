
class displayModalComponent{

	constructor(inputData,summary){
		this.result = this.displayModal(inputData,summary)
	}
	
	async displayModal(inputData,summary){
		var template = await this.getTemplate()
		
		
		var divElement = document.createElement("div")
		// Append the modal area if currently not rendered
		divElement.className="modalArea"			
		// Lookup to see if the item is already rendered - if true remove it.
		if (document.querySelector(".modalArea") != null){
			document.removeChild(document.querySelector(".modalArea"))
		}		
		// Append the modal area to the background area.
		document.getElementsByTagName("body")[0].appendChild(divElement)
		
		var thresholdReached = ""
		var contentCreated = ""
		var dateRegex = new RegExp(/^([0-9]{4,4})-([0-9]{2,2})-([0-9]{2,2})/)
		var timeRegex = new RegExp(/^([0-9]{2,2}):([0-9]{2,2}):([0-9]{2,2})./)
		if (typeof inputData.debate_threshold_reached_at == "string"){
		
			var dateTime = inputData.debate_threshold_reached_at.split("T")
			if (dateRegex.test(dateTime[0]) && timeRegex.test(dateTime[1]) ){
				var dateParse = dateRegex.exec(dateTime[0])
				var timeParse = timeRegex.exec(dateTime[1])
			
				var parseDate = new Date(
					parseInt(dateParse[1]),
					parseInt(dateParse[2])-1,
					parseInt(dateParse[3]),
					parseInt(timeParse[1]),
					parseInt(timeParse[2]),
					parseInt(timeParse[3]),0)
				
				thresholdReached = parseDate.toLocaleString()
			}
		}
		
		if (typeof inputData.created_at == "string"){
			var createdDateTime = inputData.created_at.split("T")
			if (dateRegex.test(createdDateTime[0]) && timeRegex.test(createdDateTime[1]) ){
				var dateParse = dateRegex.exec(createdDateTime[0])
				var timeParse = timeRegex.exec(createdDateTime[1])
			
				var parseDate = new Date(
					parseInt(dateParse[1]),
					parseInt(dateParse[2])-1,
					parseInt(dateParse[3]),
					parseInt(timeParse[1]),
					parseInt(timeParse[2]),
					parseInt(timeParse[3]),0)
				contentCreated = parseDate.toLocaleString()
			}
		}
		
		
		var vueModal = new Vue({
			el:divElement,
			template:template,
			vuetify: new Vuetify(),
			data:{
				dialog:true,
				content:inputData,
				summary:summary,
				thresholdReached:thresholdReached,
				contentCreated:contentCreated,
				// Data table headings
				dataHeadings:[
					 {	text: 'Constituency Name',
        				align: 'start',
       					sortable: false,
       					value: 'name',	},
 		       		{ text: 'Count', value: 'count' },
				],
				dataContent:summary.constituencySummary.summaryListings,
				
				
				
			}
		})
	}

	async getTemplate(){
		var request = await fetch("./modalComponent/modal.html")
		var data = await request.text()
		return data
	}

}

