(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
$(document).ready(function(){
    $('.competitor-item').click(function(){
        $('.side-panel-competitors-center>div.selected-competitor').removeClass("selected-competitor");
        $(this).addClass('selected-competitor');
    });

    $('#load_data').click(function(){
        var input_csv = document.getElementById('csv-file');
        var file = input_csv.files[0];
        var reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = function (evt) {
            var csv_data = evt.target.result.split(/\r?\n|\r/);
            displayData(csv_data);
        }
    });
});

function displayData(csv_data){
    var table_data = '';
    var wasHeader, wasData;
    for(var count = 0; count<csv_data.length; count++)
    {
        var cell_data = csv_data[count].split(";");
        table_data += '<tr>';
        for(var cell_count=0; cell_count<cell_data.length; cell_count++)
        {
            if(count === 0)
            {
                table_data += '<th>'+cell_data[cell_count]+'</th>';
                wasHeader = true;
                wasData = false;
            }
            else
            {
                if(cell_data[cell_count] !== ""){
                    table_data += '<td>'+cell_data[cell_count]+'</td>';
                    wasData = true;
                }else{
                    wasData = false;
                }
                wasHeader = false;
            }
        }
        if(wasHeader){
            table_data += '<th>Інструменти</th>';
        }
        if(wasData){
            table_data += '<td><a href="/item"><button class="tool-btn round-btn-sm" >+</button></a>\n';
            table_data += '<button class="tool-btn round-btn-sm" >V</button>';
            table_data += '<button class="tool-btn round-btn-sm" data-toggle="modal" data-target="#editformModal">/</button>';
            table_data += '<button class="tool-btn round-btn-sm" data-toggle="modal" data-target="#deleteConfirmationModal">X</button></td>';
        }
        table_data += '</tr>';
    }
    $('#employee_table').append(table_data);
}

function csvJSON(csv){
    var csv_data=csv.split("\n");
    var result = [];
    var csv_headers=csv_data[0].split(";");
    for(var i=1;i<csv_data.length;i++){
        var obj = {};
        var cell_data=csv_data[i].split(";");
        for(var j=0;j<csv_headers.length;j++){
            obj[csv_headers[j]] = cell_data[j];
        }
        result.push(obj);
    }
    return JSON.stringify(result);
}


},{}]},{},[1]);
