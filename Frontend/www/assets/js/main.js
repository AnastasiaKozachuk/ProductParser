$(document).ready(function(){
    // enable tooltips
    $('[data-toggle="tooltip"]').tooltip();

    // hide tooltip on focus
    $('.withTooltip').on('focus', function () {
        $(this).blur()
    });

    $('.add-url').click(function(){
        $('#website-add-url').val($('.side-panel-competitors-center>div.selected-competitor>div.competitor-site').text().trim());
        $('#website-add-url-show').val($('.side-panel-competitors-center>div.selected-competitor>div.competitor-site').text().trim());
    });

    $('.editUrlCompetitor').click(function(){
        $('#comp_id').val($(this).data('comp_id'));
        $('#item_id').val($(this).data('item_id'));
        $('#editUrl').val($(this).data('url'));
        console.log("Hi");
        console.log($(this).data('comp_id') + $(this).data('item_id') + $(this).data('url'));
    });

    $('.editItemUrl').click(function(){
        $('#comp_id').val($(this).data('competitor'));
        $('#editUrl').val($(this).data('url'));
    });

    $('.delete-item-items').click(function(){
        $('#delete-form-itemid').val($(this).data('itemid'));
    });

    // set selected competitor active
    $('.competitor-item').click(function(){
        $('.side-panel-competitors-center>div.selected-competitor').removeClass("selected-competitor");
        $(this).addClass('selected-competitor');
        let id = $(this).attr('id');
        window.localStorage.setItem("selected_competitor_id", id);
        getUrls(id);
    });


    // change active/disabled item icon on hover
    $('.setActive').on('mouseover', function(){
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
    });

    $('.deleteItemUrl').click(function(){
        $('#delete-url').val($(this).data('url'));
    });
    // set id of competitor to be deleted
    $('.delete-competitor-btn').click(function (){
        $('#delete-form-site').val($('.side-panel-competitors-center>div.selected-competitor').attr('id'));
    });

    // set edit competitor input fields values
    $('.edit-competitor-btn').click(function(){
        $('#editcompetitorname').val($('.side-panel-competitors-center>div.selected-competitor>div.competitor-name').text().trim());
        $('#editcompetitorsite').val($('.side-panel-competitors-center>div.selected-competitor>div.competitor-site').text().trim());
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
        /*let date = new Date($('#dateFrom').val());
        let day = date.getDate();
        let month = date.getMonth() + 1;
        let year = date.getFullYear();*/
        $(".loading-msg").show();
        getAnalysis($('#byPrice-filter').attr('value'),$('#byBrand').attr('value'),$('#byComp').attr('value'),$('#dateFrom').val(),$('#timeFrom').val(),$('#dateTill').val(), $('#timeTill').val());
    });

    //export to Excel
    $(".download-button").click(function(){
    var tab_text = '<html xmlns:x="urn:schemas-microsoft-com:office:excel">';
    tab_text = tab_text + '<head><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>';
    tab_text = tab_text + '<x:Name>Test Sheet</x:Name>';
    tab_text = tab_text + '<x:WorksheetOptions><x:Panes></x:Panes></x:WorksheetOptions></x:ExcelWorksheet>';
    tab_text = tab_text + '</x:ExcelWorksheets></x:ExcelWorkbook></xml></head><body>';
    tab_text = tab_text + "<table border='1px'>";
    
   //get table HTML code

    tab_text = tab_text + $('#employee_table').html();
    tab_text = tab_text + '</table></body></html>';

    var data_type = 'data:application/vnd.ms-excel';
    
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE ");
    //For IE
    if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
         if (window.navigator.msSaveBlob) {
         var blob = new Blob([tab_text], {type: "application/csv;charset=utf-8;"});
         navigator.msSaveBlob(blob, 'Analysis.xls');
         }
    } 
   //for Chrome and Firefox 
   else {
    $(".download-button").attr('href', data_type + ', ' + encodeURIComponent(tab_text));
    $(".download-button").attr('download', 'Analysis.xls');
   }
});

    //filter modal window

    let prev = $(".link-active");
    $(".modal-filter-choose-item").click(function () {
        prev.removeClass("link-active");
        $(this).addClass("link-active");
        prev=$(this);
        $('#byPrice-filter').attr('value', ($(this).attr('id')));
    });

    $('#item-select').change(function () {
        let selectedText = $(this).find("option:selected").text();
        $('#itemid').attr('value', selectedText);
    });

    $('#brand-select').change(function () {
        let selectedText = $(this).find("option:selected").text();
        $('#byBrand').attr('value', selectedText);
    });

    $('#competitor-select-filter').change(function () {
        let selectedText = $(this).find("option:selected").text();
        $('#byComp').attr('value', selectedText);
    });

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

    function getAnalysis(price, brand, comp, datef, timef, datet, timet){
        let url = "/analysis/show";
        console.log(datef + " " + timef + " " + datet + " " + timet);
        const data = {
            byPrice: (price)?price:"any",
            byBrand: (brand)?brand:"all",
            byComp: (comp)?comp:"all",
            dateFrom: (datef !== "" && timef !== "")?toDateTime(datef, timef):"all",
            dateTill: (datet !== "" && timet !== "")?toDateTime(datet, timet):"all"
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
        return (date + " " + time);
    }

// display urls of competitor in html table
    function displayUrls(urls){
        let table = document.getElementById("employee_table");
        table.innerHTML = getUrlTableHeader();
        urls.forEach(url => {
            let tr = document.createElement('tr');

            let td1 = document.createElement('td');
            td1.className = 'comp-item-td'; // Class name
            td1.innerText = url.id; // Text inside
            tr.appendChild(td1); // Append it

            let td2 = document.createElement('td');
            td2.className = 'comp-item-td'; // Class name
            td2.innerText = url.vendorCode; // Text inside
            tr.appendChild(td2); // Append it

            let td3 = document.createElement('td');
            td3.className = 'comp-item-td'; // Class name
            td3.innerText = url.name; // Text inside
            tr.appendChild(td3); // Append it

            let td4 = document.createElement('td');
            td4.className = (!url.active_item || url.url === "" || !url.active)?"comp-url-nactive-td":"comp-url-active-td"; // Class name
            td4.innerHTML = "<a href='"+url.url+"' target='_blank'>"+url.url+"</a>";
            tr.appendChild(td4); // Append it

            let tdtools = document.createElement('td');
            tdtools.className = 'comp-item-td'; // Class name
            let active_btn = document.createElement('button');
            if(!url.active_item){
                active_btn.className = "withTooltip tool-btn round-btn-sm disabled disabled-hover glyphicon glyphicon-ban-circle";
                active_btn.setAttribute('data-toggle', 'tooltip');
                active_btn.setAttribute('data-placement', 'top');
                active_btn.setAttribute('title', 'Item excluded');
                active_btn.setAttribute('disabled', 'true');
            }else if(!url.active){
                active_btn.className = "withTooltip tool-btn round-btn-sm disabled glyphicon glyphicon-ban-circle";
                active_btn.setAttribute('data-toggle', 'tooltip');
                active_btn.setAttribute('data-placement', 'top');
                active_btn.setAttribute('title', 'Include in parsing');
            }else{
                active_btn.className = "tool-btn round-btn-sm glyphicon glyphicon-ok";
                active_btn.setAttribute('data-toggle', 'tooltip');
                active_btn.setAttribute('data-placement', 'top');
                active_btn.setAttribute('title', 'Exclude from parsing');
            }
            tdtools.appendChild(active_btn); // Append it
            active_btn.onclick = function(){
                let data = {
                    url: url.url,
                    active: url.active
                };
                $.post('/active-disable-url', data);
                getUrls(localStorage.getItem("selected_competitor_id"));
            };
            active_btn.onmouseover = function(){
                if (active_btn.className.match(/\bglyphicon-ok\b/)) {
                    active_btn.classList.remove('glyphicon-ok');
                    active_btn.classList.add('glyphicon-ban-circle');
                }
                else if(active_btn.className.match(/\bglyphicon-ban-circle\b/)){
                    active_btn.classList.remove('glyphicon-ban-circle');
                    active_btn.classList.add('glyphicon-ok');
                }
            };
            active_btn.onmouseout = function(){
                if (active_btn.className.match(/\bglyphicon-ok\b/)) {
                    active_btn.classList.remove('glyphicon-ok');
                    active_btn.classList.add('glyphicon-ban-circle');
                }
                else if(active_btn.className.match(/\bglyphicon-ban-circle\b/)){
                    active_btn.classList.remove('glyphicon-ban-circle');
                    active_btn.classList.add('glyphicon-ok');
                }
            };

            let span1 = document.createElement('span');
            span1.className = 'withTooltip'; // Class name
            span1.setAttribute('data-toggle', 'tooltip');
            span1.setAttribute('data-placement', 'top');
            span1.setAttribute('title', 'Edit url');

            let edit_btn = document.createElement('button');
            edit_btn.setAttribute('data-toggle', 'modal');
            edit_btn.setAttribute('data-target', '#editformModal');
            edit_btn.className = "tool-btn round-btn-sm glyphicon glyphicon-pencil";
            span1.appendChild(edit_btn);
            edit_btn.onclick = function(){
                document.getElementById('comp_id').value = url.competitor;
                document.getElementById('item_id').value = url.item;
                document.getElementById('editUrl').value = url.url;
                document.getElementById('active-item-url').value = url.active_item;
                console.log("Hi");
            };
            tdtools.appendChild(span1);

            let span2 = document.createElement('span');
            span2.className = 'withTooltip'; // Class name
            span2.setAttribute('data-toggle', 'tooltip');
            span2.setAttribute('data-placement', 'top');
            span2.setAttribute('title', 'Delete url');

            let delete_btn = document.createElement('button');
            delete_btn.setAttribute('data-toggle', 'modal');
            delete_btn.setAttribute('data-target', '#deleteUrlConfirmationModal');
            delete_btn.className = "tool-btn round-btn-sm glyphicon glyphicon-remove";
            span2.appendChild(delete_btn);
            delete_btn.onclick = function(){
                document.getElementById('deleteUrl').value = url.url;
            };
            tdtools.appendChild(span2);
            tr.appendChild(tdtools); // Append it
            table.appendChild(tr);
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
                        if(Object.keys(i[d]).includes(c) && i[d][c].price === ""){
                            data += "<td data-toggle='tooltip' data-placement='top' title='Item Id: " +i.id+ "\nItem Name: "+i.name+ "\nItem Price: "+i.defprice+"\nCompetitor: "+ c + "\nDate: " + d + "' style='background-color: #a8a8a8; border-color: white'>No Price<a href='"+i[d][c].url+"' target='_blank'>\n" + "<span class='glyphicon glyphicon-link'></span></a></td>";
                        }
                        else if(Object.keys(i[d]).includes(c)){
                            if(Number((i[d][c].price).replace(/\s/g, '')) > Number((i.defprice).replace(/\s/g, ''))){
                                data += "<td data-toggle='tooltip' data-placement='top' title='Item Id: " +i.id+ "\nItem Name: "+i.name+ "\nItem Price: "+i.defprice+"\nCompetitor: "+ c + "\nDate: " + d + "' style='background-color: #a5d57d; border-color: white'>"+i[d][c].price+" <a href='"+i[d][c].url+"' target='_blank'><span class='glyphicon glyphicon-link'></span></a></td>";
                            }
                            else if(Number((i[d][c].price).replace(/\s/g, '')) < Number((i.defprice).replace(/\s/g, ''))){
                                data += "<td data-toggle='tooltip' data-placement='top' title='Item Id: " +i.id+ "\nItem Name: "+i.name+ "\nItem Price: "+i.defprice+"\nCompetitor: "+ c + "\nDate: " + d + "' style='background-color: #ff8d55; border-color: white'>"+i[d][c].price+" <a href='"+i[d][c].url+"' target='_blank'><span class='glyphicon glyphicon-link'></span></a></td>";
                            }
                            else{
                                data += "<td data-toggle='tooltip' data-placement='top' title='Item Id: " +i.id+ "\nItem Name: "+i.name+ "\nItem Price: "+i.defprice+"\nCompetitor: "+ c + "\nDate: " + d + "' style='background-color: #feffb4; border-color: white'>"+i[d][c].price+" <a href='"+i[d][c].url+"' target='_blank'><span class='glyphicon glyphicon-link'></span></a></td>";
                            }

                        }
                        else{
                            data += "<td data-toggle='tooltip' data-placement='top' title='Item Id: " +i.id+ "\nItem Name: "+i.name+ "\nItem Price: "+i.defprice+"\nCompetitor: "+ c + "\nDate: " + d + "' style='background-color: #a8a8a8; border-color: white'></td>";
                        }
                    }
                }
                else{
                    for(let c of comp_set){
                        data += "<td data-toggle='tooltip' data-placement='top' title='Item Id: " +i.id+ "\nItem Name: "+i.name+ "\nItem Price: "+i.defprice+"\nCompetitor: "+ c + "\nDate: " + d + "' style='background-color: #a8a8a8; border-color: white'></td>";
                    }
                }
            }
            data += "<td style='visibility: hidden'>End Of Table Row</td>";
            data += "</tr>";
        });
        $(".loading-msg").hide();
        table.innerHTML += data;
    }

});