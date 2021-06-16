NodeJs/Express Petition Demo Program

Note - This project is an experimental test looking at the use of Vue.js/Matterialize and NodeJS with various open data sources (UK Gov Petitions/BBC news content) with a view to looking at how Vue, Matterialize and custom designs can be used for rendering information and data processing.

There is a mix of techniques in this project as it's an iterative approach to design/coding/assembly.

Petition Summary - This currently includes:
1, A summary of the popular words which are currently for active 'open' items
2, An overview summary and detail options for a given selection
3, The data source uses is https://petition.parliament.uk/
4, On the right handside is a link for looking at a common word used in the action, description field. This word can then be used as part of a calcuation to see possible underlying trends across different regions

News Summary - This currently includes:
1, An overview of the current news for the UK from the BBC RSS feeds for the UK.
2, Headline items, description and published date

Setup:
npm install express
npm install body-parser

Open port required: 9080
Start: node ./webServer.js

Dependances:
This project uses a mixture of Backbone.js, Tensorflow.js, Matterialize CSS, Vue.js and Vuetify for the GUI rendering and data processing.
