Vue.component('customers', {
    template: '#customers-template',

    data: function(){
        return {
            list: []
        };
    },

    created: function() {
        $.getJSON('api/customers', function(customers) {
        this.list = customers;
        }.bind(this));
    }

});

new Vue({
    el: '#customer-main'
});