Vue.component('trucks', {
    template: '#trucks-template',

    data: function(){
        return {
            list: []
        };
    },

    created: function() {
        $.getJSON('api/trucks', function(trucks) {
        this.list = trucks;
        }.bind(this));
    }

});

new Vue({
    el: '#truck-main'
});