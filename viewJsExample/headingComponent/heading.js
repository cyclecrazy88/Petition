
class HeadingComponent{

	constructor(){
		this.result = this.displayTemplate()
	
	}
	// ---------------------------------------------------------------
	//	Display the template content in Vue.
	// ---------------------------------------------------------------
	async displayTemplate(){
		var template = await this.getTemplate()
		
		var displayView = new Vue({
			template:template,
			el:".headingContainer",
			data:{
				headingText:"Petition Activity",
			}
		})
	}
	
	async getTemplate(){
		var template = await fetch("./headingComponent/heading.html")
		var data = await template.text()
		return data
	}
}

