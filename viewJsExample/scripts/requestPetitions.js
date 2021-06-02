
class PetitionModel extends Backbone.Model{

	preinitialize(){
		this.defaults = {
			action: null,
			additional_details: null,
			background: null,
			closed_at: null,
			committee_note: null,
			created_at: null,
			creator_name: null,
			debate: null,
			debate_outcome_at: null,
			debate_threshold_reached_at: null,
			departments: null,
			government_response: null,
			government_response_at: null,
			moderation_threshold_reached_at: null,
			opened_at: null,
			rejected_at: null,
			rejection: null,
			response_threshold_reached_at: null,
			scheduled_debate_date: null,
			signature_count: null,
			state: null,
			topics: null,
			updated_at: null,
		}
	}
	initialize(inputData){
	
	}
}

class PetitionList extends Backbone.Collection{
	preinitialize(){
		this.model = PetitionModel
	}
}

class RequestPetitions{
	constructor(){
		this.result = this.processData()
	}
	
	async processData(){
		var list = new PetitionList()
	
		var itemFound = true
		for (var count = 1 ; count < 6 ; count++ ){
			var data = await this.getData(count)
			if (data instanceof Object &&
				data.data instanceof Array){
			
				if (data.data.length == 0){
					itemFound = false
				}
			
				for (var dataKey in data.data){
					var dataItem = data.data[dataKey]
					var model = new PetitionModel(dataItem.attributes)
					model.set("id",dataItem.id)
					list.add(model)
				}
			
				if (itemFound == false){
					break
				}
			}
		}
		
		
		return list
	}
	
	async getData(pageNumber){
		try{
			var data = await fetch("/openPetitions?page="+pageNumber)
			var json = await data.json()
			return json
		}catch(error){
			return null
		}
		
	}
}

class RequestPetitionDetail{

	constructor(petitionDetailId){
		this.result = this.getPetitionDetail(petitionDetailId)
	}
	
	async getPetitionDetail(petitionId){
		var data = await this.getData(petitionId)
		return data
	}

	async getData(petitionId){
		var requestData = await fetch("/petitionItem?petition="+petitionId)
		var data = await requestData.json()
		return data
	}

}


