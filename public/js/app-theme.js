$(function () {

      
     
    //select 2 for form truck 
    $(".truck").select2({
        placeholder: "Select a plate number",
        allowClear: true,
    });
    //end select 2 form truck


    //select 2 for form customer
      $(".customer").select2({
        placeholder: "Select a customer",
        allowClear: true
    });
      //end select 2 form customer
    







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
