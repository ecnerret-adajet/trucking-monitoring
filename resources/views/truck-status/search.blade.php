
<hr/>
<div id="app">

<div class="container">
<tracks></tracks>
</div>


<template id="tasks-template">
    <h4> All Hauler Trip </h4>
    <ul class="list-group">
        <li class="list-group-item" v-for="track in list">
                @{{ track.in_plant }}<br/>
                @{{track.id}}
        </li>
    </ul>

    <table>
        
    </table>
</template>


vue
</div>

