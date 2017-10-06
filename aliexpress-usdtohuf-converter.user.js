// ==UserScript==
// @name         Aliexpress USD to HUF Converter
// @version      0.2
// @description   Aliexpress USD to HUF Converter
// @match        *://*.aliexpress.com/*
// @require      https://code.jquery.com/jquery-3.1.1.slim.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/babel-polyfill/6.20.0/polyfill.min.js
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @namespace    https://github.com/morpheus133/Aliexpress-USDtoHUF-Converter/
// @downloadURL  https://github.com/morpheus133/Aliexpress-USDtoHUF-Converter/raw/master/aliexpress-usdtohuf-converter.user.js
// @@updateURL   https://github.com/morpheus133/Aliexpress-USDtoHUF-Converter/raw/master/aliexpress-usdtohuf-converter.user.js
// @grant        none
// @run-at       document-end
// @author       Morpheus133 <morpheus1333@gmail.com>
// ==/UserScript==
/* global jQuery */



currencyapi = "https://api.fixer.io/latest?symbols=HUF&base=USD";
xmlhttp=new XMLHttpRequest();
xmlhttp.open("GET", currencyapi, false);
xmlhttp.send();
var data = JSON.parse(xmlhttp.responseText);
convRate = data.rates.HUF;



mainfunc();

window.addEventListener ("load", mainfunc);

waitForKeyElements ("#personalized-recommendation-p4p", get_span_content);
waitForKeyElements ("#p4p-ul-content", get_span_content);
waitForKeyElements ("#j-total-price-value", get_span_content);
waitForKeyElements ("#j-sku-discount-price", get_span_content);
waitForKeyElements ("#j-rpbk-from-thisseller", get_span_content);
waitForKeyElements ("#j-shopcart-recommend-product", get_span_content);
waitForKeyElements ("#j-top-selling-products", get_span_content);
waitForKeyElements ("#j-bestsellling-slide", get_span_content);
waitForKeyElements ("#div.pro-price", get_span_content);
waitForKeyElements ("#hs-below-list-items", get_span_content);
waitForKeyElements ("#j-product-operate-wrap", get_span_content);



function get_span_content (jNode) {
    var spanText   = $.trim (jNode.text () );
    var lastText   = jNode.data ("lastText")  ||  "";

    if (spanText != lastText) {

        mainfunc();

        if (/\$/.test (jNode.text ()) ) {
            var totalprice= document.getElementsByClassName('total-price-show');

            if ( totalprice.length >0 && totalprice[0].childNodes.length >0)
            {
                changeDollarsToHuf(totalprice[0].childNodes[0],convRate);
            }
        }

        jNode.data ("lastText", spanText);
    }

    return true;
}


function convert (node, convRate) {
    var dolVal = parseFloat (node.nodeValue);
    var plnVal =  ((dolVal * convRate).toFixed (0)).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " Ft";
    node.nodeValue = plnVal;
}

function convert2 (node, convRate) {
    var dolVal = parseFloat (node);
    var plnVal =  ((dolVal * convRate).toFixed (0)).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " Ft";
    return plnVal;
}

function changeDollarsToHuf (node, convRate) {

    if (node.nodeType === Node.TEXT_NODE && /\./.test (node.nodeValue) ) {

        // format US $32.00 or US $32.00 - 42.00
        if (/\$/.test (node.nodeValue) ) {

            processTextNode (node, convRate);
        }

        else if (node.nodeValue.length >3)
        {
            // format 76.36
            if (!/\-/.test (node.nodeValue) )
            {
                convert(node, convRate);
            }
            // format: 76.36 - 147.81
            else
            {
                var low =node.nodeValue.split(' - ')[0];
                var high =node.nodeValue.split(' - ')[1];
                node.nodeValue = convert2(low.trim(), convRate) + " - " + convert2(high.trim(), convRate);
            }
        }
    }
    else if (node.nodeType === Node.ELEMENT_NODE) {
        for (var K = 0, numNodes = node.childNodes.length;  K < numNodes;  ++K) {
            changeDollarsToHuf (node.childNodes[K], convRate);
        }
    }
    return node;
}

function processTextNode (node, convRate) {


    var moneySplit  = node.nodeValue.split (/US\s?((?:\+|\-)?\$[0-9.,]+)/);

    if (moneySplit  &&  moneySplit.length > 2) {

        for (var J = 1, L = moneySplit.length;  J < L;  J += 2) {

            var dolVal = parseFloat (moneySplit[J].replace (/\$|,|([.,]$)/g, "") );
            var plnVal = moneySplit[J] + " *Err*";
            var dolVal2 = parseFloat (moneySplit[J+1].replace(' - ',''));


            if (typeof dolVal === "number") {
                plnVal = ((dolVal * convRate).toFixed (0)).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " Ft";
            }
            moneySplit[J] = plnVal;
            if (!isNaN(dolVal2)) {
                var plnVal2 = " - " + ((dolVal2 * convRate).toFixed (0)).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " Ft";
                moneySplit[J+1] = plnVal2;
            }
        }
        //-- Rebuild and replace the text node with the changed value (s).
        var newTxt      = moneySplit.join ("");
        newTxt.replace(/US\s?((?:\+|\-)?\$+)/,"" );
        node.nodeValue  = newTxt;
    }
}

function modifyelements(element) {
    var elementlist= document.getElementsByClassName(element);
    for (var J = 0, numNodes = elementlist.length;  J < numNodes;  ++J)
    {
        changeDollarsToHuf (elementlist[J], convRate);
    }
}

function mainfunc() {

    modifyelements('g-price');
    modifyelements('p-price');
    modifyelements('pricebox');
    modifyelements('p4p-price-list');
    modifyelements('pro-price');
    modifyelements('pricebox');
    modifyelements('pricebox');
    modifyelements('price price-m');
    modifyelements('value notranslate');
    modifyelements('notranslate');
    modifyelements('ui-slidebox-item-row ui-cost');

/*    var ccc= document.getElementsByClassName('price price-m');
    for (var K = 0, numNodes1 = ccc.length;  K < numNodes1;  ++K)
    {
      //  #hs-below-list-items > li:nth-child(1) > div > div.info > span > span.value.notranslate
        //*[@id="hs-below-list-items"]/li[1]/div/div[2]/span/span[1]
        console.log('aaaaaaaaaaaaaaa '+ ccc[K].childNodes[1]);
        changeDollarsToHuf (ccc[K].childNodes[1].childNodes[0], convRate);
    }


    var notranslate= document.getElementsByClassName('value notranslate');
    if ( notranslate.length >0){
        for (var L = 0, numNodes2 = notranslate.length;  L < numNodes2;  ++L)
        {
            if (/US \$/.test (notranslate[L].childNodes[0].nodeValue) )
                changeDollarsToHuf(notranslate[L].childNodes[0],convRate);
        }
    }

    var notranslate= document.getElementsByClassName('notranslate');
    if ( notranslate.length >0){
        for (var L = 0, numNodes2 = notranslate.length;  L < numNodes2;  ++L)
        {
            console.log('aaaaaaaaaaaaaaa '+ notranslate[L].childNodes[0].nodeValue);
            if (/US \$/.test (notranslate[L].childNodes[0].nodeValue) )
                changeDollarsToHuf(notranslate[L].childNodes[0],convRate);
        }
    }

    var premiumrelated2= document.getElementsByClassName('ui-slidebox-item-row ui-cost');
    if ( premiumrelated2.length >0){

        for (var L = 0, numNodes4 = premiumrelated2.length;  L < numNodes4;  ++L)
        {
            if (/US \$/.test (premiumrelated2[L].childNodes[0].childNodes[0].nodeValue) ){
                changeDollarsToHuf(premiumrelated2[L].childNodes[0].childNodes[0],convRate);}
        }
    }

*/
    /*
          Delete US $ string from text
     */
    var dollar= document.getElementsByClassName('p-symbol');
    if ( dollar.length >0){
        for (var L = 0, numNodes2 = dollar.length;  L < numNodes2;  ++L)
        {
            dollar[L].childNodes[0].nodeValue="";
        }
    }


}

