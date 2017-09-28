// ==UserScript==
// @name         Aliexpress USD to HUF Converter
// @version      0.1
// @description   Aliexpress USD to HUF Converter
// @match        *://*.aliexpress.com/*
// @require      https://code.jquery.com/jquery-3.1.1.slim.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/babel-polyfill/6.20.0/polyfill.min.js
// @namespace    https://github.com/morpheus133/Aliexpress-USDtoHUF-Converter/
// @downloadURL  https://github.com/morpheus133/Aliexpress-USDtoHUF-Converter/raw/master/aliexpress-usdtohuf-converter.user.js
// @@updateURL   https://github.com/morpheus133/Aliexpress-USDtoHUF-Converter/raw/master/aliexpress-usdtohuf-converter.user.js
// @grant        none
// @author       Morpheus133 <morpheus1333@gmail.com>
// ==/UserScript==
/* global jQuery */



currencyapi = "https://api.fixer.io/latest?symbols=HUF&base=USD";
xmlhttp=new XMLHttpRequest();
xmlhttp.open("GET", currencyapi, false);
xmlhttp.send();
var data = JSON.parse(xmlhttp.responseText);
convRate = data.rates.HUF;


window.addEventListener ("click", mainfunc);



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


    var moneySplit  = node.nodeValue.split (/US ((?:\+|\-)?\$[0-9.,]+)/);

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
        node.nodeValue  = newTxt;
    }
}



function mainfunc() {

    /*
       Change currency in single item page
     */

    var bbb= document.getElementsByClassName('p-price');
    for (var J = 0, numNodes = bbb.length;  J < numNodes;  ++J)
    {
        changeDollarsToHuf (bbb[J], convRate);
    }

    /*
          Change currency in main page
    */
    var ccc= document.getElementsByClassName('price price-m');

    for (var K = 0, numNodes1 = ccc.length;  K < numNodes1;  ++K)
    {

        changeDollarsToHuf (ccc[K].childNodes[1].childNodes[0], convRate);
    }

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

    // Parse Total Price in case of multiselect
    // Total Price: US $32.00
    var totalprice= document.getElementsByClassName('total-price-show');
    if ( totalprice.length >0 && totalprice[0].childNodes.length >0)
    {
        changeDollarsToHuf(totalprice[0].childNodes[0],convRate);
    }

}

Promise.resolve(jQuery.ready).then(() => {
    mainfunc();

});
