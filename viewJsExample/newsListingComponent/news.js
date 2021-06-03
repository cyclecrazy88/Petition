
class NewsContent{

	constructor(){
		this.result = this.loadNewsContent()
	}
	
	async loadNewsContent(){
		var template = await this.getNewsItem()
		var layout = await this.getNewsLayout()
		var jsonData = await this.getNewsData()
		var thisRef = this
		Vue.component("news-content-item",{
			template:template,
			props:["title","desc","link","pubDate"],
			data: function () {
   				return {showDesc:false,}
    		},
			methods:{
				// Click to show additional details/show
				//	display for the item
				clickAction(eventData){
					thisRef.showModalDetail(this.link,this.title,this.desc,this.pubDate)
				},
				// Show expanded detail - show additional
				//	item contents information
				mouseEnter(eventData){
					console.log("Mouse Enter")
					this.showDesc = true
				},
				mouseLeave(eventData){
					console.log("Mouse Leave")
					this.showDesc = false
				},
			}
		})
		
		
		if (jsonData instanceof Array){
			var viewPort = new Vue({
				template:layout,
				el:".newsContentItem",
				data:{
					newsList:jsonData,
				}
			})
		}
	}
	
	async getNewsLayout(){
		var content = await fetch("./newsListingComponent/news.html")
		var data = await content.text()
		return data
	}
	
	async getNewsItem(){
		var content = await fetch("./newsListingComponent/newsItem.html")
		var data = await content.text()
		return data
	}
	async getNewsData(){
		var content = await fetch("/getNewsFeed?feed=uk")
		var data = await content.json()
		return data
	}
	
	async getNewsModal(){
		var content = await fetch("./newsListingComponent/newsModal.html")
		var data = await content.text()
		return data
	}
	
	async showModalDetail(link,title,desc,pubDate){
		var modalItem = document.querySelector(".modalItem")
		// Check to see if the modal item is loaded yet, if true remove it
		if (modalItem instanceof Object){
			modalItem.remove()
		}
		
		var modalItem = document.createElement("div")
		modalItem.className = "modalItem"
		
		document.getElementsByTagName("body")[0].appendChild(modalItem)
		
		var template = await this.getNewsModal()
		
		var viewPort = new Vue({
			el:modalItem,
			template:template,
			data:{
				link,title,desc,pubDate
			},
			methods:{
				// Remove the modal from the view/dom to close
				closeModal:function(){
					this.$el.remove()
				}
			}
		})
	}

}

