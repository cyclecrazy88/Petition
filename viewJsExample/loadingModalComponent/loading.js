
class LoadingModal{

	constructor(){
		this.viewDisplay = this.displayLoadingModal()
	}
	// Display the loading modal container.
	async displayLoadingModal(){
		var template = await this.getTemplate()
		
		if (document.querySelector(".loadingModalContainer") != null){
			document.querySelector(".loadingModalContainer").remove()
		}
		
		var loadingModalContainer = document.createElement("div")
		loadingModalContainer.className = "loadingModalContainer"
		document.querySelector("body").appendChild(loadingModalContainer)
		
		var viewPort = new Vue({
			el:loadingModalContainer,
			data:{},
			methods:{},
			template:template,
			vuetify: new Vuetify(),
		})
		return viewPort
	}
	
	async closeModal(){
		var viewPort = await this.viewDisplay
		viewPort.$el.remove()
	}
	
	// --------------------------------------
	// Fetch the corresponding template item.
	// --------------------------------------
	async getTemplate(){
		var template = await fetch("./loadingModalComponent/loading.html")
		var data = await template.text()
		return data
	}
}


