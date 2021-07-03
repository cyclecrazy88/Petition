<template>
	<div class="modalViewDisplay" v-if="show" v-bind:id="id">
		<div class="modalViewBackground" v-on:click="hideContent"></div>
		<div class="modalViewContent"v-on:click="showContent">
			<!-- Content Area for the Grid items -->
			<div class="contentArea">
				<div class="action">
					<div class="subheadingText">Action</div>
					<div v-if="action != null">{{action}}</div>
				</div>
				<div class="additional_details">
					<div class="subheadingText">Details</div>
					<div v-if="additional_details != null">{{additional_details}}</div>
				</div>
				<div class="background">
					<div class="subheadingText">Background</div>
					<div v-if="background != null">{{background}}</div>
				</div>
				<div class="created_at">
					<div class="subheadingText">Created At</div>
					<div v-if="created_at != null">{{created_at}}</div>
				</div>
				<div class="creator_name">
					<div class="subheadingText">Created By</div>
					<div v-if="creator_name != null">{{creator_name}}</div>
				</div>
				<div class="debate">
					<div class="subheadingText">Debated</div>
					<div v-if="dateDate != null">{{dateDate}}</div>
				</div>
				<div class="government_response">
					<div class="subheadingText">Goverment Response</div>
					<div v-if="government_response != null">
						<div>{{responseSummary}}</div><br/>
						<div>{{responseDetails}}</div>
					</div>
				</div>
				<div class="government_response_at">
					<div class="subheadingText">Goverment Response At</div>
					<div v-if="government_response_at != null">{{government_response_at}}</div>
				</div>
			</div>
		
			
		</div>
	</div>

</template>
<script>
export default{
	props:["id"],
	data(){
		return {
			action:null,
			additional_details:null,
			background:null,
			created_at:null,
			creator_name:null,
			debate:null,
			dateDate:null,
			government_response:null,
			government_response_at:null,
			responseSummary:null,
			responseDetails:null,
			show:false,
			data:null,
		}
	},
	methods:{
		showContent: function(eventData){
			var windowItem = window
			
			var action = this.data.action
			var additional_details = this.data.additional_details
			var background = this.data.background
			var created_at = this.data.created_at
			
			var createdDate = this.parseDate(created_at)
			if (createdDate instanceof Date){
				this.created_at = createdDate.toDateString()
			}
			
			var creator_name = this.data.creator_name
			
			var debate = this.data.debate
			if (debate instanceof Object){
				var debateDate = debate.debated_on
				var debateDate2 = this.parseDate2(debateDate)
				if (debateDate2 instanceof Date){
					var thisRef = this
					this.$nextTick(function(){
						thisRef.dateDate = debateDate2.toDateString()
					})
					
				}
			}
			
			var government_response = this.data.government_response
			
			var responseSummary = government_response.summary
			var responseDetails = government_response.details
			this.responseSummary = responseSummary
			this.responseDetails = responseDetails
			
			var government_response_at = this.data.government_response_at
			var govResponse = this.parseDate(government_response_at)
			if (govResponse instanceof Date){
				this.government_response_at = govResponse.toDateString()
			}
			
			var signature_count = this.data.signature_count
		},
		// Handler function for parsing the input date.
		parseDate:(inputDate)=>{
			var regexDateIso = new RegExp(/^([0-9]{4,4})[-]([0-9]{2,2})[-]([0-9]{2,2})$/)
			var regexTimeIso = new RegExp(/^([0-9]{2,2}):([0-9]{2,2}):([0-9]{2,2}).([0-9]{1,})[Z]$/)
			
			if (typeof inputDate == "string"){
				var dateSplit = inputDate.split("T")
				if (regexDateIso.test(dateSplit[0]) &&
					regexTimeIso.test(dateSplit[1])){
					var dateParse = regexDateIso.exec(dateSplit[0])
					var timeParse = regexTimeIso.exec(dateSplit[1])
					
					var dateOutput = new Date(
						parseInt(dateParse[1]),
						parseInt(dateParse[2])-1,
						parseInt(dateParse[3]),
						parseInt(timeParse[1]),
						parseInt(timeParse[2]),
						parseInt(timeParse[3]),
						parseInt(timeParse[4]),)
					return dateOutput
				}
			}
			return null
		},
		parseDate2:(inputDate)=>{
			var regexDateIso = new RegExp(/^([0-9]{4,4})[-]([0-9]{2,2})[-]([0-9]{2,2})$/)
			if (typeof inputDate == "string"){
				if (regexDateIso.test(inputDate)){
					var dateParse = regexDateIso.exec(inputDate)
					var dateOutput = new Date(
						parseInt(dateParse[1]),
						parseInt(dateParse[2])-1,
						parseInt(dateParse[3]),
						1,0,0,0)
					return dateOutput
				}
			}
			return null
		},
		
		hideContent:function(eventData){
			this.$emit("closeEvent")
		}
	},
	async fetch(){
		this.show = true
		console.log("Fetch ID: "+this.id)
		var data = await this.$axios.$get('http://localhost:9080/petitionItemOverview?petition='+this.id)
		this.data = data
		this.action = data.action
		this.additional_details = data.additional_details
		this.background = data.background
		this.created_at = data.created_at
		this.creator_name = data.creator_name
		this.debate = data.debate
		this.government_response = data.government_response
		this.government_response_at = data.government_response_at
		this.signature_count = data.signature_count
		this.showContent()
	}
}
</script>