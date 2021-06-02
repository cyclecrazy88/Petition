
class ItemText{
	
	constructor(){
		this.itemTextRender()
		
	}
	async itemTextRender(){
		const template = await this.getTemplateData()
		var thisRef = this
		var displayView = new Vue({
			el:".itemSelectionContainer",
			vuetify:new Vuetify(),
			template:template,
			methods:{
				changeText:function(eventData){
					getPetitionDataForDateRange()
					return
					var divElement = document.createElement("div")
					
					// Append the modal area if currently not rendered
					divElement.className="modalArea"
					
					// Lookup to see if the item is already rendered - if true remove it.
					if (document.querySelector(".modalArea") != null){
						document.removeChild(document.querySelector(".modalArea"))
					}
					
					// Append the modal area to the background area.
					document.getElementsByTagName("body")[0].appendChild(divElement)
				}
				
			}
		})
		
	}
	async getTemplateData(){
		var data = await fetch("./textSelectComponent/itemText.template")
		var text = await data.text()
		return text
	}
	
}


async function getPetitionDataForDateRange(){
	var dateRegExp = new RegExp(/^([0-9]{2,2})[\/]([0-9]{2,2})[\/]([0-9]{4,4})$/)
	var start = $(".dateInputStart").val()
	var end = $(".dateInputEnd").val()
	if (dateRegExp.test(start) && dateRegExp.test(end) ){
		var startSplit = dateRegExp.exec(start)
		var endSplit = dateRegExp.exec(end)
				
		var parseStart = new Date(
			parseInt(startSplit[3]),
			parseInt(startSplit[2])-1,
			parseInt(startSplit[1]),
			1,0,0,0,)
			
		var parseEnd = new Date(
			parseInt(endSplit[3]),
			parseInt(endSplit[2])-1,
			parseInt(endSplit[1]),
			1,0,0,0,)
			
		var filter = new PetitionsFilter(parseStart,parseEnd)
		var result = await filter.result
		var tableView = new TableView(result)
		
		return result
	}
}
