
class DateComponent{

	constructor(){
		this.dataPickerLoaded = false
		this.result = this.loadDateComp()
	}
	async loadDateComp(){
		var htmlDate = await fetch("./dateSelectionComponent/date.template")
		var html = await htmlDate.text()
		
		const day = (24*((1000*60)*60))
		
		var startDate = new Date(new Date().getTime()-(day*90))
		var endDate = new Date(new Date().getTime()-(day*1))
		
		var startDateIso = startDate.toISOString().split("T")[0]
		var endDateIso =  endDate.toISOString().split("T")[0]
		
		var thisRef = this
		
		var startRegex = new RegExp(/^([0-9]{4,4})[-]([0-9]{2,2})[-]([0-9]{2,2})$/)
		if (startRegex.test(startDateIso) &&
			startRegex.test(endDateIso)){
			var startSplit = startRegex.exec(startDateIso)
			var endSplit = startRegex.exec(endDateIso)
			var display = new Vue(
				{el:".dateContainer",
				template:html,
				data:{ 
						"start":startSplit[3]+"/"+startSplit[2]+"/"+startSplit[1],
						"end":endSplit[3]+"/"+endSplit[2]+"/"+endSplit[1]} ,
				methods:{
					startAction:function(eventObj){
						console.log("Start Change")
						thisRef.changeDate(eventObj)
					},
					endAction:function(eventObj){
						console.log("End Change")
						thisRef.changeDate(eventObj)
					}
				},
				updated:function(){
				
				},
				mounted:function(){
					
					
				},
			
			})
			
			Vue.nextTick(function(){
				console.log("Component Loaded")
					$(".dateInputStart").datepicker(
						{format:"dd/mm/yyyy",
						setDefaultDate:true,
						maxDate:endDate,
						defaultDate:startDate})
					$(".dateInputEnd").datepicker(
						{format:"dd/mm/yyyy",
						setDefaultDate:true,
						maxDate:endDate,
						defaultDate:endDate})
					console.log("Date Picker Loaded")
					thisRef.dataPickerLoaded = true
					// Initialize the date event now - load up the content data.
					thisRef.changeDate()
			})
		}
		
					
		
		
		
	}
	
	async changeDate(eventData){
		
		var dateRegExp = new RegExp(/^([0-9]{2,2})[\/]([0-9]{2,2})[\/]([0-9]{4,4})$/)
		
		// Only process if the event is a user click action
		if (this.dataPickerLoaded){
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
			}
			
			
		}
		
	}

}

