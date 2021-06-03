
class HeadingComponent{

	constructor(headingText){
		this.result = this.displayTemplate(headingText)
	
	}
	// ---------------------------------------------------------------
	//	Display the template content in Vue.
	// ---------------------------------------------------------------
	async displayTemplate(headingText){
		// If a heading is not provided - default to petition
		//	activity item for the selection
		if (headingText == undefined){
			headingText = "Petition Activity"
		}
	
		var template = await this.getTemplate()
		
		var displayView = new Vue({
			template:template,
			el:".headingContainer",
			data:{
				headingText:headingText,
			}
		})
	}
	
	async getTemplate(){
		var template = await fetch("./headingComponent/heading.html")
		var data = await template.text()
		return data
	}
}

