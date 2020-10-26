$("#theme_falls").click(function(){
    // GetContent("xxx");
    console.log('Alert');
    changeFalls();

});
function changeFalls()
{
    //debugger;
    console.log('Falls clicked')
    var obj_element = $('#falls_attr')
    if ($('#falls_attr').css('visibility') == 'hidden')
        $('#falls_attr').css('visibility','visible'); // = 'visible';
    else
        $('#falls_attr').css('visibility','hidden');
        //$('#falls_attr').style.visibility = 'hidden';

}

let diab_values = [80, 60, 95];
let diab_percents = [diab_values[0] + "%"];

let falls_values = [80, 30, 45];
let falls_percents = [falls_values[0] + "%"];

let ae_values = [20, 40, 45];
let ae_percents = [ae_values[0] + "%"];

/* Setting values for Diabetes */

for (i = 1; i < diab_values.length; i++) {
    diab_percents.push(diab_values[i] + "%");
}

for (i = 0; i < diab_values.length; i++) {
    var mcolor = 'w3-green';
    var j = i+1;
    if(diab_values[i] < 30){
        mcolor = 'w3-red';
    }
    else if(diab_values[i] < 60){
        mcolor = 'w3-purple';
    }
    document.getElementById('diab_attr_'+j).style.width = diab_percents[i];
    document.getElementById('diab_attr_'+j).innerHTML = diab_percents[i];
    document.getElementById("diab_attr_"+j).classList.add(mcolor);
}

/* Setting values for Falls */

for (i = 1; i < falls_values.length; i++) {
    falls_percents.push(falls_values[i] + "%");
}

for (i = 0; i < falls_values.length; i++) {
    var mcolor = 'w3-green';
    var j = i+1;

    if(falls_values[i] < 30){
        mcolor = 'w3-red';
    }
    else if(falls_values[i] < 60){
        mcolor = 'w3-purple';
    }
    document.getElementById('falls_attr_'+j).style.width = falls_percents[i];
    document.getElementById('falls_attr_'+j).innerHTML = falls_percents[i];
    document.getElementById("falls_attr_"+j).classList.add(mcolor);
}

/* Setting values for A&E */

for (i = 1; i < ae_values.length; i++) {
    ae_percents.push(ae_values[i] + "%");
}

for (i = 0; i < ae_values.length; i++) {
    var mcolor = 'w3-green';
    var j = i+1;
    if(ae_values[i] < 30){
        mcolor = 'w3-red';
    }
    else if(ae_values[i] < 60){
        mcolor = 'w3-purple';
    }
    document.getElementById('ae_attr_'+j).style.width = ae_percents[i];
    document.getElementById('ae_attr_'+j).innerHTML = ae_percents[i];
    document.getElementById("ae_attr_"+j).classList.add(mcolor);
}



