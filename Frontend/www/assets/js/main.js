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

    $('.parse-comp').click(function (){
        $('#_id').val($(this).attr('id'));
    });

    // set id of competitor to be parsed
    $('.parse-comp').click(function (){
        $('#_id').val($(this).attr('id'));
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

    /*filter modal window*/
    $(".open-filter-modal").click(function () {
        $(".modal-filter").removeClass("disp-none");
    });

    $(".modal-filter-background").click(function () {
        $(".modal-filter").addClass("disp-none");
        $(".modal-filter-choose-item").removeClass("link-active");
        $(".modal-filter-select-all").removeClass("link-active");
    });

    let prev = $(".link-active");
    $(".modal-filter-choose-item").click(function () {
        prev.removeClass("link-active");
        $(this).addClass("link-active");
        prev=$(this);
    });

    $(".modal-filter-select-all").click(function () {
        prev.removeClass("link-active");
        $(this).addClass("link-active");
        prev=$(this);
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
            r += "<td><button class=\"tool-btn round-btn-sm disabled-hover glyphicon glyphicon-ban-circle\" disabled></button>";
        }else if(!url.active){
            r += "<td><button class=\"tool-btn round-btn-sm disabled glyphicon glyphicon-ban-circle\" ></button>";
        }else{
            r += "<td><button class=\"tool-btn round-btn-sm glyphicon glyphicon-ok\" ></button>";
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
        table_header += "<th colspan='"+num_competitors+"'>"+date.date+"</th>";
    });
    table_header += "</tr>";
    return table_header;
}

function getATableSubHeader(info){
    let subHeader = "<tr>";
    subHeader += "<th class=\"analysis-snd-header\">ID</th>";
    subHeader += "<th class=\"analysis-snd-header\">Name</th>";
    subHeader += "<th class=\"analysis-snd-header\">Your Price</th>";
    info.forEach(comp => {
        subHeader += "<th class='analysis-snd-header'>"+comp+"</th>";
    });
    subHeader += "</tr>";
    return subHeader;
}

function displayAnalysis(info){
    let table = document.getElementById("employee_table");
    table.innerHTML = getATableHeader(info[0].date.length, info);
    table.innerHTML += getATableSubHeader(info[0].date);
    let data = "<tr>";
    info.forEach(i => {
        data += "<td>"+i.id+"</td>";
        data += "<td>"+i.name+"</td>";
        data += "<td>"+i.price+"</td>";
        i.date.forEach(price => {
            data += "<td>"+price.comp_price+"</td>";
        });
    });
    data += "</tr>";
    table.innerHTML += data;
}