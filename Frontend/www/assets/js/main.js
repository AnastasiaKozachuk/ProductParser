$(document).ready(function(){

    // enable tooltips
    $('[data-toggle="tooltip"]').tooltip();

    // hide tooltip on focus
    $('.withTooltip').on('focus', function () {
        $(this).blur()
    });

    // set selected competitor active
    $('.competitor-item').click(function(){
        $('.side-panel-competitors-center>div.selected-competitor').removeClass("selected-competitor");
        $(this).addClass('selected-competitor');
        let id = $(this).attr('id');
        getUrls(id);
    });


    // change active/disabled item icon on hover
    $('.setActive').hover(function(){
        if($(this).hasClass('glyphicon-ok')){
            $(this).removeClass('glyphicon-ok');
            $(this).addClass('glyphicon-ban-circle');
        }else if($(this).hasClass('glyphicon-ban-circle')){
            $(this).removeClass('glyphicon-ban-circle');
            $(this).addClass('glyphicon-ok');
        }
    });

    // set id of competitor to be parsed
    $('.parseOneCompBtn').click(function (){
        $('#IDparseOne').attr('value', ($(this).attr('id')));
        console.log( $('#IDparseOne').attr('value'));
    });

    // set id of item to be deleted
    $('.delete-item').click(function (){
        $('#delete-form-itemid').val($(this).data('itemid'));
    });

    // set id of competitor to be deleted
    $('.delete-competitor-btn').click(function (){
        $('#delete-form-site').val($('.side-panel-competitors-center>div.selected-competitor').attr('id'));
    });

    // set edit competitor input fields values
    $('.edit-competitor-btn').click(function(){
        $('#editcompetitorname').val($('.side-panel-competitors-center>div.selected-competitor>div.competitor-name').text());
        $('#editcompetitorsite').val($('.side-panel-competitors-center>div.selected-competitor>div.competitor-site').text());
    });

    // set edit item input fields values
    $('.edit-item').on('click', function(){
        $('#edit-form-name').val($(this).data('name'));
        $('#edit-form-brand').val($(this).data('brand'));
        $('#edit-form-price').val($(this).data('price'));
        $('#edit-form-itemid').val($(this).data('id'));
    });

    $('#load_data_goods').click(function(){
        let url = "/items/data";
        readCSVFile(url);
    });

    $('#load_data_competitors').click(function(){
        let url = "/competitors/data";
        readCSVFile(url);
    });

    //show analysis
    $(".submit-button").click(function(){
        let table = document.getElementById("employee_table");
        table.innerHTML = "";
        $(".loading-msg").show();

        getAnalysis($('#byPrice-filter').attr('value'),$('#byBrand').attr('value'),$('#byComp').attr('value'),$('#dateFrom').val(),$('#timeFrom').val(),$('#dateTill').val(), $('#timeTill').val());
    });

    //filter modal window

    let prev = $(".link-active");
    $(".modal-filter-choose-item").click(function () {
        prev.removeClass("link-active");
        $(this).addClass("link-active");
        prev=$(this);
        $('#byPrice-filter').attr('value', ($(this).attr('id')));
        alert( $('#byPrice-filter').attr('value'));
    });

    $(".modal-filter-select-all").click(function () {
        $(this).toggleClass("link-active");
    });

    $('#brand-select').change(function () {
        let selectedText = $(this).find("option:selected").text();
        alert(selectedText);
        $('#byBrand').attr('value', selectedText);
        alert( $('#byBrand').attr('value'));
    });

    $('#allBrands').click(function(){
        $('#byBrand').attr('value', ($(this).attr('id')));
        alert( $('#byBrand').attr('value'));
    });

    $('#allComp').click(function(){
        $('#byComp').attr('value', ($(this).attr('id')));
        alert( $('#byComp').attr('value'));
    });

    $('#competitor-select-filter').change(function () {
        let selectedText = $(this).find("option:selected").text();
        $('#byComp').attr('value', selectedText);
        alert( $('#byComp').attr('value'));
    });

});

// load csv data
function readCSVFile(url){
    let input_csv = document.getElementById('csv-file');
    let file = input_csv.files[0];
    let reader = new FileReader();
    reader.readAsText(file, "UTF-8");
    reader.onload = function (evt) {
        let csv_data = evt.target.result;
        sendCSVData(csv_data, url);
    }
}

// send csv data as JSON to server (server.js)
function sendCSVData(csv_data, url){
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.open('POST', url);
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.send(csvJSON(csv_data));
}

// parse csv to JSON
function csvJSON(csv){
    let csv_data=csv.split("\r\n");
    let result = [];
    let csv_headers=csv_data[0].split(";");
    for(let i=1;i<csv_data.length;i++){
        let obj = {};
        let cell_data=csv_data[i].split(";");
        for(let j=0;j<csv_headers.length;j++){
            if(cell_data[j] !== ""){
                obj[csv_headers[j]] = cell_data[j];
            }
        }
        result.push(obj);
    }
    return JSON.stringify(result);
}

// get urls of competitor
function getUrls(id){
    const data = {
        _id: id
    };
    $.post("/urls", data, function(data){
        console.log(data);
        displayUrls(data);
    });
}

function getAnalysis(price, brand, comp, datef, timef, datet, timet){
    let url = "/analysis/show";
    console.log(datef + " " + timef + " " + datet + " " + timet);
    const data = {
        byPrice: (price)?price:"any",
        byBrand: (brand)?brand:"all",
        byComp: (comp)?comp:"all",
        dateFrom: (datef && timef)?toDateTime(datef, timef):"all",
        dateTill: (datet && timet)?toDateTime(datet, timet):"all"
    };
    console.log(data.byPrice);
    console.log(data.byBrand);
    console.log(data.byComp);
    console.log(data.dateFrom);
    console.log(data.dateTill);
    $.post(url, data, function(data){
        console.log(data);
        displayAnalysis(data);
    });
}

function toDateTime(date, time){
    let dt = to24time(time.trim());
    return (date.trim() + " " + dt);
}

function to24time(time){
    let hours = Number(time.match(/^(\d+)/)[1]);
    let minutes = Number(time.match(/:(\d+)/)[1]);
    let AMPM = time.match(/\s(.*)$/)[1];
    if(AMPM === "PM" && hours<12) hours = hours+12;
    if(AMPM === "AM" && hours===12) hours = hours-12;
    let sHours = hours.toString();
    let sMinutes = minutes.toString();
    if(hours<10) sHours = "0" + sHours;
    if(minutes<10) sMinutes = "0" + sMinutes;
    return sHours + ":" + sMinutes + ":00";
}

// display urls of competitor in html table
function displayUrls(urls){
    let table = document.getElementById("employee_table");
    table.innerHTML = getUrlTableHeader();
    urls.forEach(url => {
        let r = "<tr>";
        if(!url.active_item) {
            r += "<td style=\"background-color: #a8a8a8\">"+url.id+"</td>";
            r += "<td style=\"background-color: #a8a8a8\">"+url.vendorCode+"</td>";
            r += "<td style=\"background-color: #a8a8a8\">"+url.name+"</td>";
            r += "<td style=\"background-color: #a8a8a8\"><a href='"+url.url+"' target='_blank'>"+url.url+"</a></td>";
        }else if(!url.active){
            r += "<td style=\"background-color: #a8a8a8\">"+url.id+"</td>";
            r += "<td style=\"background-color: #a8a8a8\">"+url.vendorCode+"</td>";
            r += "<td style=\"background-color: #a8a8a8\">"+url.name+"</td>";
            r += "<td style=\"background-color: #a8a8a8\"><a href='"+url.url+"' target='_blank'>"+url.url+"</a></td>";
        }else{
            r += "<td>" + url.id + "</td>";
            r += "<td>" + url.vendorCode + "</td>";
            r += "<td>" + url.name + "</td>";
            r += "<td><a href='" + url.url + "' target='_blank'>" + url.url + "</a></td>";
        }
        if(!url.active_item){
            r += "<td style='color: white; background-color: #5D5D5D; border-color: #a8a8a8'><button class=\"tool-btn round-btn-sm disabled-hover glyphicon glyphicon-ban-circle\" disabled></button>";
        }else if(!url.active){
            r += "<td style='color: white; background-color: #5D5D5D; border-color: #a8a8a8'><button class=\"tool-btn round-btn-sm disabled glyphicon glyphicon-ban-circle\" ></button>";
        }else{
            r += "<td style='color: white; background-color: #5D5D5D; border-color: #a8a8a8'><button class=\"tool-btn round-btn-sm glyphicon glyphicon-ok\" ></button>";
        }
        r += "<button class=\"tool-btn round-btn-sm glyphicon glyphicon-pencil\" data-toggle=\"modal\" data-target=\"#editformModal\"></button>";
        r += "<button class=\"tool-btn round-btn-sm glyphicon glyphicon-remove\" data-toggle=\"modal\" data-target=\"#deleteConfirmationModal\"></button></td></tr>";

        table.innerHTML += r;
    });

}

function getUrlTableHeader(){
    let table_header = "<tr id=\"myHeader\">";
    table_header += "<th>Id</th>";
    table_header += "<th>Article</th>";
    table_header += "<th>Name</th>";
    table_header += "<th>URL</th>";
    table_header += "<th>Tools</th></tr>";
    return table_header;
}

function getATableHeader(num_competitors, info){
    let table_header = "<tr id=\"myHeader\">";
    table_header += "<th colspan='3'>Items</th>";
    info.forEach(date =>{
        table_header += "<th colspan='"+num_competitors+"'>"+date+"</th>";
    });
    table_header += "</tr>";
    return table_header;
}

function getATableSubHeader(info, dates){
    let subHeader = "<tr>";
    subHeader += "<th class=\"analysis-snd-header\">ID</th>";
    subHeader += "<th class=\"analysis-snd-header\">Name</th>";
    subHeader += "<th class=\"analysis-snd-header\">Your Price</th>";
    for(let i = 0; i < dates.size; i++){
        info.forEach(comp => {
            subHeader += "<th class='analysis-snd-header'>"+comp+"</th>";
        });
    }
    subHeader += "</tr>";
    return subHeader;
}

function displayAnalysis(info){
    let table = document.getElementById("employee_table");
    let dates = new Set([]);
    let competitors = [];
    for(let o of info){
        const keys = Object.keys(o);
        for(let k of keys){
            if(k ==="id" || k ==="name" || k ==="defprice"){}
            else{
                dates.add(k);
                competitors = competitors.concat(Object.keys(o[k]));
            }
        }
    }
    const comp_set = new Set(competitors);
    console.log(comp_set);
    table.innerHTML = getATableHeader(comp_set.size, dates);
    table.innerHTML += getATableSubHeader(comp_set, dates);
    let data = "";
    info.forEach(i => {
        data += "<tr> <td style='color: white; background-color: #5D5D5D; border-color: #a8a8a8'>"+i.id+"</td>";
        data += "<td  style='color: white; background-color: #5D5D5D; border-color: #a8a8a8'>"+i.name+"</td>";
        data += "<td  style='color: white; background-color: #5D5D5D; border-color: #a8a8a8'>"+i.defprice+"</td>";
        for(let d of dates){
            if(i.hasOwnProperty(d)){
                for(let c of comp_set){
                    if(Object.keys(i[d]).includes(c) && i[d][c] === ""){
                        data += "<td style='background-color: #a8a8a8; border-color: white'></td>";
                    }
                    else if(Object.keys(i[d]).includes(c)){
                        if(Number((i[d][c]).replace(/\s/g, '')) > Number((i.defprice).replace(/\s/g, ''))){
                            data += "<td style='background-color: #a5d57d; border-color: white'>"+i[d][c]+"</td>";
                        }
                        else if(Number((i[d][c]).replace(/\s/g, '')) < Number((i.defprice).replace(/\s/g, ''))){
                            data += "<td style='background-color: #ff8d55; border-color: white'>"+i[d][c]+"</td>";
                        }
                        else{
                            data += "<td style='background-color: #feffb4; border-color: white'>"+i[d][c]+"</td>";
                        }

                    }
                    else{
                        data += "<td style='background-color: #a8a8a8; border-color: white'></td>";
                    }
                }
            }
            else{
                for(let c of comp_set){
                    data += "<td style='background-color: #a8a8a8; border-color: white'></td>";
                }
            }
        }
        data += "<td style='visibility: hidden'>End Of Table Row</td>";
        data += "</tr>";
    });
    $(".loading-msg").hide();
    table.innerHTML += data;
}

function isEmptyObject(obj) {
    for (let key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            return false;
        }
    }
    return true;
}