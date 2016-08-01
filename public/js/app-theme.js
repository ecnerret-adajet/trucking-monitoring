






$(function () {

      
     
    //select 2 for form truck 
    $(".select").select2({
        placeholder: "Select a plate number",
        allowClear: true,
    });
    //end select 2 form truck
 //end function js   
});



function startTime() {
    var today = new Date();
    var h = today.getHours();
    var m = today.getMinutes();
    var s = today.getSeconds();
    m = checkTime(m);
    s = checkTime(s);
    document.getElementById('txt').innerHTML =
    h + ":" + m + ":" + s;
    var t = setTimeout(startTime, 500);
}
function checkTime(i) {
    if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
    return i;
}
