new Vue({
	el: '#form-app',
	data: {
		list: []
	},

	created: function(){
		this.fetchTaskList();
	},
	
	methods: {
		fetchTaskList: function(){
			this.$http.get('/api/trucks', function(trucks) {
				this.$set('list',trucks);
			}.bind(this));

		}
	}


});