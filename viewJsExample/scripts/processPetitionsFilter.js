

class PetitionsFilter{
	
	constructor(start,end){
		if (start instanceof Date &&
			end instanceof Date){
			this.result = this.requestPetitionsData(start,end)
		}
		
		
	}
	
	async requestPetitionsData(start,end){
		var petitions = new RequestPetitions()
		var data = await petitions.result
		var list = new PetitionList()
	
		var isoRegex = new RegExp(/^([0-9]{4,4})-([0-9]{2,2})-([0-9]{2,2})$/)
		
		var searchText = ""
		if (document.querySelector(".itemSelectionContainer input") != null){
			searchText = document.querySelector(".itemSelectionContainer input").value
		} 
		

		
		var dataList = data.sortBy("action")
		for (var dataKey in dataList){
			var dataItem = dataList[dataKey]
			var itemParts = dataItem.get("created_at").split("T")
			
			// Fetch the action info - attempt to 'subset' the desc info.
			var actionText = dataItem.get("action")
			var additional_details = dataItem.get("additional_details")
			var background = dataItem.get("background")
			
			if (typeof actionText == "string" &&
				typeof searchText == "string"){
				if (searchText.length > 0 &&
					actionText.toLowerCase().indexOf(searchText.toLowerCase())==-1 &&
					additional_details.toLowerCase().indexOf(searchText.toLowerCase())==-1 &&
					background.toLowerCase().indexOf(searchText.toLowerCase())==-1 ){
					continue
				}
					
			}
			
			
			if (isoRegex.test(itemParts[0])){
				var dataSplit = isoRegex.exec(itemParts[0])
				var dateParse = new Date(
					parseInt(dataSplit[1]),
					parseInt(dataSplit[2])-1,
					parseInt(dataSplit[3]),
					1,0,0,0,)
					
				if (start.getTime() <= dateParse.getTime() &&
					end.getTime() > dateParse.getTime() ){
					list.add(dataItem)	
				}
			}
		}
		return list
	}
	
}
