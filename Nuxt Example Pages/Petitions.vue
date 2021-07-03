<template>
	<client-only>
	<div>
		<div class="petitionHeading">Open UK Gov Petitions</div>
		<div class="petitionModel" 
			v-if="show_id != null"
			v-bind:id="show_id">
			<Modal 
			v-on:closeEvent="closeAction"
			v-bind:id="show_id_comp"/>
		</div>
		<div class="petitionHeadingSummary">
			<div>Summary Item</div>
			<div><input type="text" class="inputTextSearch"></div>
		</div>
		
		<div class="petitionContent">
		
			<div>
				<div 
					class="petitionListingsSection"
					v-for="(item,index) in data"
						v-bind:id="item.id" 
						@click="show_id=item.id; show_id_comp=item.id;" >
					
					<div>{{item.action}}</div>
					<div>{{item.background}}</div>
					<div>{{item.additional_details}}</div>
					<div v-if="item.government_response instanceof Object">
						{{item.government_response.summary}}
					</div>
					
					
				</div>
			</div>
			
		</div>
	</div>
	</client-only>
</template>
<script>
export default{
	data(){
		return {
			modal_action:null,
			modal_additional_details:null,
			modal_background:null,
			modal_government_response:null,
			modal_signature_count:null,
			show_modal:false,
			show_id:null,
			show_id_comp:null,
			data:[]
		}
	},
	
	methods:{
		clickAction: function(eventData){
			if (eventData instanceof Object){
				var eventId = eventData.currentTarget.getAttribute("id")
				if (isFinite(eventId)){
					var eventId = parseInt(eventId)
					
					this.modal_id = eventId						
					// Show the modal window now - After populating the display
					//	properties for the component.
					this.show_modal = true
					
					
				}
			}
		},
		
		closeAction:function(eventData){
			this.show_id = null
		}
	},
	
	head:()=>{
		return {title:"Open Petitions to the UK Goverment"}
	},
		
	async fetch(){
		console.log("Fetched..")
		console.log(this.$route)
		/*
		var content = await fetch("http://localhost:9080/petitionFormat")
		var data = await content.json()
		
		*/
		
		var data = await this.$axios.$get('http://localhost:9080/petitionFormat')
		//console.log("Data")
		//console.log(data)
		this.data = data
	}

}
</script>