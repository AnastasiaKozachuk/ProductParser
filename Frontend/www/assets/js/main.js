$(document).ready(function(){

    // set selected competitor active
    $('.competitor-item').click(function(){
        $('.side-panel-competitors-center>div.selected-competitor').removeClass("selected-competitor");
        $(this).addClass('selected-competitor');
    });

    $('.delete-item').click(function (){
        $('#delete-form-itemid').val($(this).data('itemid'));
    });

    $('.edit-item').on('click', function(){
        $('#edit-form-name').val($(this).data('name'));
        $('#edit-form-brand').val($(this).data('brand'));
        $('#edit-form-price').val($(this).data('price'));
        $('#edit-form-itemid').val($(this).data('id'));
    });

    $('[data-toggle="tooltip"]').tooltip();

    //load csv data about customer's goods
    //send csv data as JSON to server (server.js)
    // display csv data in html table

    $('#load_data_goods').click(function(){
        let input_csv = document.getElementById('csv-file');
        let file = input_csv.files[0];
        let reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = function (evt) {
            let csv_data1 = evt.target.result;
            sendCSVDataItem(csv_data1);
            //let csv_data = csv_data1.split(/\r?\n|\r/);
            //displayDataGoods(csv_data);
        }
    });

    //load csv data about customer's competitors
    //send csv data as JSON to server (server.js)
    // display csv data in html table

    $('#load_data_competitors').click(function(){
        let input_csv = document.getElementById('csv-file');
        let file = input_csv.files[0];
        let reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = function (evt) {
            let csv_data1 = evt.target.result;
            sendCSVDataComp(csv_data1);
            //let csv_data = csv_data1.split(/\r?\n|\r/);
            //displayDataCompetitors(csv_data);
        }
    });
});

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


function sendCSVDataComp(csv_data){
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.open('POST', '/competitors/data');
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    console.log(csvJSON(csv_data));
    xmlhttp.send(csvJSON(csv_data));
}

function sendCSVDataItem(csv_data){
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.open('POST', '/items/data');
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.send(csvJSON(csv_data));
}

/*
function createToolsGoods(){
    let button_tool1 = '<a href="/item"><button class="tool-btn round-btn-sm" >+</button></a>';
    let button_tool2 = '<button class="tool-btn round-btn-sm" >V</button>';
    let button_tool3 = '<button class="tool-btn round-btn-sm" data-toggle="modal" data-target="#editformModal">/</button>';
    let button_tool4 = '<button class="tool-btn round-btn-sm" data-toggle="modal" data-target="#deleteConfirmationModal">X</button>';
    return '<td>' + button_tool1 + button_tool2 + button_tool3 + button_tool4 + '</td>';
}
function createToolsCompetitors(){
    let button_tool1 = '<button class="tool-btn round-btn-sm" >V</button>';
    let button_tool2 = '<button class="tool-btn round-btn-sm" data-toggle="modal" data-target="#editformModal">/</button>';
    let button_tool3 = '<button class="tool-btn round-btn-sm" data-toggle="modal" data-target="#deleteConfirmationModal">X</button>';
    return '<td>' + button_tool1 + button_tool2 + button_tool3 + '</td>';
}
function displayDataGoods(csv_data){
    let table_data = '';
    let wasHeader = false;
    let wasData = false;
    for(let count = 0; count<csv_data.length; count++)
    {
        let cell_data = csv_data[count].split(";");
        table_data += '<tr>';
        for(let cell_count=0; cell_count<cell_data.length; cell_count++)
        {
            if(count === 0)
            {
                if(cell_data[cell_count] !== "") {
                    table_data += '<th>' + cell_data[cell_count] + '</th>';
                    wasHeader = true;
                    wasData = false;
                }
                wasData = false;
            }
            else
            {
                if(cell_data[cell_count] !== "") {
                    table_data += '<td>' + cell_data[cell_count] + '</td>';
                    wasData = true;
                }
                wasHeader = false;
            }
        }
        if(wasHeader){
            table_data += '<th>Інструменти</th>';
        }
        if(wasData && (count !== (csv_data.length-1))){
            table_data += createToolsGoods();
        }
        table_data += '</tr>';
    }
    $('#employee_table').append(table_data);
}
function displayDataCompetitors(csv_data){
    let table_data = '';
    let wasHeader = false;
    let wasData = false;
    for(let count = 0; count<csv_data.length; count++)
    {
        let cell_data = csv_data[count].split(";");
        table_data += '<tr>';
        for(let cell_count=0; cell_count<cell_data.length; cell_count++)
        {
            if(count === 0)
            {
                if(cell_data[cell_count] !== "") {
                    table_data += '<th>' + cell_data[cell_count] + '</th>';
                    wasHeader = true;
                    wasData = false;
                }
                wasData = false;
            }
            else
            {
                if(cell_data[cell_count] !== "") {
                    table_data += '<td>' + cell_data[cell_count] + '</td>';
                    wasData = true;
                }
                wasHeader = false;
            }
        }
        if(wasHeader){
            table_data += '<th>Інструменти</th>';
        }
        if(wasData && (count !== (csv_data.length-1))){
            table_data += createToolsCompetitors();
        }
        table_data += '</tr>';
    }
    $('#employee_table').append(table_data);
}*/