"use strict";

///////////////////////////////////////
// Variables

var base_url = "https://stargate.qly.site2.sibs.pt";
var bearer_tkn = "eyJhbGciOiJIUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJlNzYyMzE3Yi03N2IxLTQ0ZWItYTUzYy0zMjY1ZDY5NTllZGIifQ.eyJpYXQiOjE2MzY1ODI0MzIsImp0aSI6IjYyYzg0MDdkLWZlNDEtNDJiZC1iOWNmLTYzODQxMDZmMWMwMCIsImlzcyI6Imh0dHBzOi8vcWx5LnNpdGUxLnNzby5zeXMuc2licy5wdC9hdXRoL3JlYWxtcy9RTFkuU1BHLkFQSSIsImF1ZCI6Imh0dHBzOi8vcWx5LnNpdGUxLnNzby5zeXMuc2licy5wdC9hdXRoL3JlYWxtcy9RTFkuU1BHLkFQSSIsInN1YiI6IjFlNjAwZWFjLTZjMTctNDUzYS1iM2Y1LTcyZTQyNGJlMjU3YyIsInR5cCI6Ik9mZmxpbmUiLCJhenAiOiJRTFkuU1BHLkFQSS1DTEkiLCJzZXNzaW9uX3N0YXRlIjoiNTcxYTJmYzktZTZkNC00NDk5LTkxOTctOTlmNWYyYjVmNTc3Iiwic2NvcGUiOiJvcGVuaWQgb2ZmbGluZV9hY2Nlc3MifQ.-NNkeRanOPSkUf_D98AkEB3xrEER-3a5EvIVzyKVtF4.eyJtYyI6Ijk5OTk5OTkiLCJ0YyI6IjUyMjIxIn0=.C943757DA9E1C8D9D1722DAC79691079621FE4AD7FD1AD332BC6B86EED968C58";
var client_id = "8247e05b-e64d-4948-843d-6e8b30224e39";
var terminal_id = 52221;

var entity_pag = "24000";
var amount = 5.50;
var expiration_days = 2;

var paymentType = "PURS";
var paymentMethods = ["REFERENCE", "CARD", "MBWAY"];

var url_checkout;

var url_mb;
var url_mbway = base_url + '/api/v1/payments/' + transactionID + "/mbway-id/purchase";;
var url_card;

var url_id_status;
var url_mtt_status;

var request_body = createBody();

var backoffice_request_body = createBackOfficeBody();

var mtt = "";
var transactionTime;

var mbway_alias = "351#919999999"


////////////////////////////////
////// Variables helpers

function setMbwayAlias(x) {
    if (Boolean(x))
    mbway_alias = "351#" + x;
    else
    mbway_alias = "351#919999999";
}

function createMTT() {
    return "Order Id: " + Math.random().toString(36).substr(2, 10);
}

function createBody() {

    mtt = createMTT();

    var date_now = new Date();
    var date_aux = new Date();
    var date_expiration = new Date(date_aux.setDate(date_aux.getDate() + expiration_days));

    //transactionTime = date_now.toISOString();

    console.log(mtt);

    var body = {
        "merchant": {
                "terminalId": terminal_id,
                "channel": "web",
                "merchantTransactionId": mtt
            },
            "transaction": {
                "transactionTimestamp": date_now.toISOString(),
                "description": "Transaction test by David",
                "moto": false,
                "paymentType": paymentType,
                "amount": {
                    "value": amount,
                    "currency": "EUR"
                },
        "paymentMethod": selectedPaymentMethods(),
                "paymentReference": {
                    "initialDatetime": date_now.toISOString(),
                    "finalDatetime": date_expiration.toISOString(),
                    "maxAmount": {
                        "value": amount,
                        "currency": "EUR"
                    },
                    "minAmount": {
                        "value": amount,
                        "currency": "EUR"
                    },
                    "entity": entity_pag
                }
            }
        };
    return body;
}


var transactionSignature = "";
var scripts;
var transactionID = "";
var formContext = "";


const mbwayIDPurchaseRequest = () => { return {"customerPhone": mbway_alias} };

const GENERATE_REFERENCE_REQUEST_EXAMPLE = {};
const QRCODE_PURCHASE_REQUEST_EXAMPLE = { qrcodeToken: '[Copy qrcodeToken here]' };
//const CARD_PURCHASE_REQUEST_EXAMPLE = { "cardInfo": { "PAN": "12312312", "secureCode": "123", "validationDate": "2031-12-31T00:00:00.000Z", "cardholderName": "Test", "createToken": false } };

///////////////////////////////////////
// Create Checkout

async function prepareCheckout(element) {
    const body = element.getElementsByClassName("request")[0].value;
    const msg = await sendPost(element, base_url + "/api/v1/payments", body);
    if (msg.transactionID) {
    transactionID = msg.transactionID;
    }
    if (msg.formContext) {
    formContext = msg.formContext;
    }
    if (msg.transactionSignature) {
    transactionSignature = msg.transactionSignature;
    }
    if (msg.execution.startTime) {
    transactionTime = msg.execution.startTime;
    }
    
    
    console.log(transactionID);
    console.log(formContext);
    console.log(transactionSignature);

    writeTransactionId();
    writeformContext();
    showIfNotVisible('buildFormWithData');
    updateBORequestBody();

    //transactionTime = transactionTime;
}

///////////////////////////////////////
// Pay with Form

const FORM_CONFIG_EXAMPLE = {
    "paymentMethodList": [],
    "amount": { "value": 2, "currency": "EUR" },
    "language": "en",
    "redirectUrl": "https://www.pay.sibs.com/documentacao/sibs-gateway",
    "customerData": null
};
const FORM_STYLE_EXAMPLE = {
    "layout": 'default',
    "theme": 'default',
    "color": {
    "primary": "",
    "secondary": "",
    "border": "",
    "surface": "",
    "header": {
        "text": "",
        "background": ""
    },
    "body": {
        "text": "",
        "background": ""
    }
    },
    "font": ""
};

async function buildFormAux() {
    cleanScripts()
    removeFormFromDOM();
    addFormToDOM();
    addScript();
}

async function buildForm(){
    await buildFormAux()
    removeAmount();
}

async function removeAmount() {
    
    //var divAmount = document.getElementsByClassName('text-center title');
    
    //var ele = document.getElementsByClassName("payment-value")[0];
    
    //$('#spgframe').contents().find('payment-value').hide();

    console.log( $('#spgframe').contents().find('payment-value').hide());

}

function cleanScripts() {
    if (!scripts) {
    scripts = new Array();
    };
    scripts.forEach(script => {
    document.head.removeChild(script);
    });
    scripts = new Array();
}

function removeFormFromDOM() {
    const container = document.getElementById("form-container");
    if (container.childNodes[0]) {
    container.removeChild(container.childNodes[0]);
    }
}

function addFormToDOM() {
    const form = document.createElement("form");
    const ta_ConfigValue = JSON.stringify(FORM_CONFIG_EXAMPLE, undefined, 4);
    const ta_StyleValue = JSON.stringify(FORM_STYLE_EXAMPLE, undefined, 4);
    form.classList.add("paymentSPG");
    form.setAttribute('spg-context', formContext);
    if (isValidJSON(ta_ConfigValue)) {
    const configParams = JSON.parse(ta_ConfigValue);
    form.setAttribute('spg-config', JSON.stringify(configParams));
    } else {
    alert("Invalid Form Configuration json!")
    }
    if (isValidJSON(ta_StyleValue)) {
    const styleParams = JSON.parse(ta_StyleValue);
    form.setAttribute('spg-style', JSON.stringify(styleParams));
    } else {
    alert("Invalid Form Style json!");
    }
    document.getElementById("form-container").appendChild(form);
}

function addScript() {
    var s = document.createElement('script');
    s.id = 'spgWidget';
    s.type = 'text/javascript';
    s.src = base_url + '/assets/js/widget.js?id=' + transactionID;
    document.head.appendChild(s);
    scripts.push(s);
    
}

////////////////////////////////////////
//Configuracoes

const updateTId = () => {terminal_id = parseInt(document.getElementById("idTerminalId").value); setConfigs() }
const updateCId = () => {client_id = document.getElementById("idClientId").value; setConfigs()}
const updateBTk = () => {bearer_tkn = document.getElementById("idBearer").value; setConfigs() }
const updateBU = () => {base_url = document.getElementById("idRootUrl").value; setConfigs() }
const updatePT = () => {paymentType = document.getElementById("auth").checked ? document.getElementById("auth").value : document.getElementById("purs").value; setConfigs() }
const updatePE = () => {entity_pag = document.getElementById("idEntity").value; setConfigs() }
const updateED = () => {expiration_days = parseInt(document.getElementById("idRefExpiration").value); setConfigs() }
const updateAm = () => {amount = parseInt(document.getElementById("idAmount").value); setConfigs() }
const updatePM = () => {setConfigs(); }

function updateConfigs(){
    updateTId();
    updateCId();
    updateBTk();
    //updateBU(); 
    updatePT(); 
    updatePE(); 
    //updateED(); 
    updateAm(); 
    updatePM(); 

    setConfigs()

    showIfNotVisible('oportunities');

    var date = new Date();
    console.log(date.toISOString() + " - Configurations Saved 💾");
}


function setConfigs() {
    mtt = createMTT();
    //document.getElementById("request_capture").value = JSON.stringify(backoffice_request_body, undefined, 4);
    //document.getElementById("request_mbwayid_purchase").value = JSON.stringify(mbwayIDPurchaseRequest, undefined, 4);
    document.getElementById("checkoutRequestFI").value = JSON.stringify(createBody(), undefined, 4);
    document.getElementById("checkoutRequestSTS").value = JSON.stringify(createBody(), undefined, 4);
    
    setRootUrl();
    setRequestHeaders();

    updateBORequestBody();

    var date = new Date();
    console.log(date.toISOString() + " - Configurations Updated 💾");
    console.log(paymentType);

    showIfNotVisible('oportunities');;
    //showOportunities()
}

//
const updateBORequestBody = () =>{
    document.getElementById("request_capture").value = JSON.stringify(createBackOfficeBody(), undefined, 4);
    document.getElementById("request_refund").value = JSON.stringify(createBackOfficeBody(), undefined, 4)
    document.getElementById("request_cancellation").value = JSON.stringify(createBackOfficeBody(), undefined, 4)
}

/// Função que seleciona os metodos de pagemnto 
function selectedPaymentMethods() {

    /*var markedCheckbox = document.getElementsByName('paymentMethods');
    var len = markedCheckbox.length;

    var methods = [];

    for (var i = 0; i < len; i++) {
    if (markedCheckbox[i].checked) { methods.push(paymentMethods[markedCheckbox[i].value].toString()) };
    }*/
    
    var methods = ["CARD","MBWAY","REFERENCE"];

    return methods;
}

//Populate
window.onload = () => {

    //var ele = document.getElementById("defaultActive");
    //ele.classList.add("active");
    //On return from form redirect move to getstarts and do get 
    if(window.location.href.indexOf("?id=") > -1) // This doesn't work, any suggestions?
    {
    var id = window.location.href;
    window.location.href+="#getStatusForm";
    transactionID = id.split('=')[1];
    console.log("Benvindo de volta Tid = " + transactionID);
    getTransactionStatus(document.getElementById("getStatusParent").parentElement);

    }

    //on moving between docs load and active correct tab 
    else if(window.location.href.indexOf("#") > -1){
        var id = window.location.href;
        
        var whereTogo = id.split('#')[1];
        
       
        var hrefToGo = '#' + whereTogo;

        var ele_aux = 'a[href*='+ whereTogo +']';
        var ele = $(ele_aux)[0];
        ele.classList.add("active");

        console.log("has href scrolling to " + whereTogo + "🔃");
        
        document.getElementById(whereTogo).scrollIntoView();       
    }
    else{
        var ele = document.getElementById("defaultActive");
        ele.classList.add("active");
        console.log("Default menu selected");
    }
 

    document.getElementById("checkoutRequestFI").value = JSON.stringify(request_body, undefined, 4);
    document.getElementById("checkoutRequestSTS").value = JSON.stringify(request_body, undefined, 4);
    
    //document.getElementById("idTerminalId").value = terminal_id;
    //document.getElementById("idBearer").value = bearer_tkn;
    //document.getElementById("idClientId").value = client_id;

    //document.getElementById("idEntity").value = entity_pag;
    //document.getElementById("idAmount").value = amount;

    updateBORequestBody();

    mtt = createMTT();

    setRootUrl();
    setRequestHeaders();

    writeMBWayRequestBody()

    var date = new Date();
    console.log(date.toISOString() + " - Populate 🎲");      

}


///////////////////////////////////////
// Server-to-Server
function payMB(k) {

    k.getElementsByClassName('payMBHeader')[0].classList.remove('d-none');
    k.getElementsByClassName('payMBHeader')[0].classList.add('d-flex');

    const url = base_url + '/api/v1/payments/' + transactionID + "/service-reference/generate"
    sendPost(k, url, '{}', transactionSignature);
}

function isEmpty(str) {
    return (!str || str.length === 0 );
}

const changeMBWAYAlias = (k) => {
    console.log('value -> ' + k.value);
    !isEmpty(k.value) ? setMbwayAlias(k.value) : false ;
    console.log('Alias -> ' + mbway_alias );
    writeMBWayRequestBody()
}

function payMBWAY(k) {

    k.getElementsByClassName('payMBWayHeader')[0].classList.remove('d-none');
    k.getElementsByClassName('payMBWayHeader')[0].classList.add('d-flex');

    setMbwayAlias(document.getElementById("mbway_id").value);

    console.log('#### MBWAY Server-to-Server ###');

    console.log('Body ' + JSON.stringify(mbwayIDPurchaseRequest(), undefined, 4) );
    console.log('#### MBWAY Server-to-Server ###');
    console.log('#### MBWAY Server-to-Server ###');

    const url = base_url + '/api/v1/payments/' + transactionID + "/mbway-id/purchase";
    console.log(url);
    console.log(mbwayIDPurchaseRequest());
    //console.log(MBWAY_ID_PURCHASE_REQUEST_EXAMPLE.toString());
    sendPost(k, url, JSON.stringify(mbwayIDPurchaseRequest(), undefined, 4), transactionSignature);

    var date = new Date();
    console.log(date.toISOString() + " - MBWAY Server-to-Server 📲");

}

function payCard() {}

///////////////////////////////////////
// Get PayemntStatus

async function getTransactionStatus(k) {
    console.log(transactionID);
    console.log(k);
    console.log(k.getElementsByClassName('getstatusUrl')[0]);
    k.getElementsByClassName('getstatusUrl')[0].classList.remove('d-none');
    k.getElementsByClassName('getstatusUrl')[0].classList.add('d-flex');
    const url = base_url + '/api/v1/payments/' + transactionID + "/status"
    const msg = await sendGet(k, url);

    if (msg.transactionID) {
    transactionID = msg.transactionID;
    }
    if (msg.formContext) {
    formContext = msg.formContext;
    }
    if (msg.transactionSignature) {
    transactionSignature = msg.transactionSignature;
    }
    if (msg.execution.startTime) {
    transactionTime = msg.execution.startTime;
    }
    
    
    //console.log(transactionID);
    //console.log(formContext);
    //console.log(transactionSignature);

    writeTransactionId();
    writeformContext();
    updateBORequestBody();
}


//////////////////////////////////////
// Backoffice

function createBackOfficeBody() {

    var date_now = new Date();

    var mtt_bo = 'BO_' + createMTT();

    var body = {
    "merchant": {
        "terminalId": terminal_id,
        "channel": "web",
        "merchantTransactionId": mtt_bo
    },
    "transaction": {
        "transactionTimestamp": date_now.toISOString(),
        "description": "Transaction short description",
        "amount": {
        "value": amount,
        "currency": "EUR"
        },
        "originalTransaction": {
        "id": transactionID,
        "datetime": transactionTime
        }
    }
    };

    return body;
}

async function doRecurring(k) { sendBackOfficePOST(k, "recurring");}

async function doCapture(k) { 
    if (isEmpty(transactionTime) && isEmpty(transactionID)){
    var response = k.getElementsByClassName("response")[0];

    response.classList.remove("d-none");
    response.classList.add("d-flex");

    //response.style.height="100px";

    response.innerHTML ="Ocurred an error sending GET...\n\n" + "Make sure you create a sucessful transaction before trying the capture.";
    }else {
    sendBackOfficePOST(k, "capture");
    }
}
async function doRefund(k) {
    if (isEmpty(transactionTime) && isEmpty(transactionID)){
    var response = k.getElementsByClassName("response")[0];
    
    response.classList.remove("d-none");
    response.classList.add("d-flex");

    //response.style.height="100px";

    response.innerHTML = "Ocurred an error sending GET...\n\n" + "Make sure you create a sucessful transaction before trying the refund.";
    }else {
    sendBackOfficePOST(k, "refund");
    }
}
async function doCancellation(k) {
    if (isEmpty(transactionTime) && isEmpty(transactionID)){
    var response = k.getElementsByClassName("response")[0];
    
    response.classList.remove("d-none");
    response.classList.add("d-flex");

    //response.style.height="100px";

    response.innerHTML ="Ocurred an error sending GET...\n\n" + "Make sure you create a sucessful transaction before trying the cancellation.";
    }else {
    sendBackOfficePOST(k, "cancellation"); 
    }
}

async function sendBackOfficePOST(k, type) {
    const url = base_url + '/api/v1/payments/' + transactionID + "/" + type;
    const body = k.getElementsByClassName("request")[0].value;
    sendPost(k, url, body);
}

// HELPERS
//Function that changes teh active nav-link in the sidebar/aside
function changeActivePoint(k, t){
    var activeEle = k.getElementsByClassName("active")[0];
    //var ele = 
    console.log(activeEle);
    activeEle.classList.remove("active");

    t.classList.add("active");
}

//Function that changes display of element
const showIfNotVisible = name => { document.getElementsByClassName(name)[0].classList.contains('d-none')? setVisible(name) : false ; }

//Function that changes/updates MBWAY Request Body
function writeMBWayRequestBody(){
    const aux = document.getElementsByClassName("requetsMBWAYBody");
    for (var i = 0; i < aux.length; i++) {
        aux[i].innerText =  JSON.stringify(mbwayIDPurchaseRequest(), undefined, 4) ;
        console.log(mbwayIDPurchaseRequest())
    }
}

//Function that writes the transction iD in all elemetns with "writeTransacId" class
function writeTransactionId(){
    const transactionsIds = document.getElementsByClassName("writeTransacId");
    for (var i = 0; i < transactionsIds.length; i++) {
        transactionsIds[i].innerText = transactionID ;
    }
}

//Function that writes the formContext in all elemetns with "writeform-Context" class
function writeformContext(){
    const form_context = document.getElementsByClassName("writeform-Context");
    for (var i = 0; i < form_context.length; i++) {
        form_context[i].innerText = 'form-context : ' + formContext ;
    }
}

//Function that writes all header field for teh requests
function setRequestHeaders() {
    var request_tk = "Autorization: Bearer "+ bearer_tkn;
    var request_ci = "X-IBM-Client-Id: " + client_id;
    var request_ct = 'Content-Type: application/json';
    const requestbts = document.getElementsByClassName("requestbt");
    const requestcis = document.getElementsByClassName("requestci");
    const requestcts = document.getElementsByClassName("requestct");
    for (var i = 0; i < requestbts.length; i++) {
        requestbts[i].innerHTML = request_tk.slice(0,70) + ' (...)';
    }
    for (var i = 0; i < requestcis.length; i++) {
        requestcis[i].innerText = request_ci ;
    }
    for (var i = 0; i < requestcts.length; i++) {
        requestcts[i].innerText = request_ct;
    }
    
}

//Function that writes the base_url in all elemetns with "baseUrl" class
function setRootUrl() {
    //base_url = document.getElementById("idRootUrl").value;
    
    const baseUrls = document.getElementsByClassName("baseUrl");
    for (var i = 0; i < baseUrls.length; i++) {
        baseUrls[i].innerText = base_url;
    }
}

// Show and Hide after clicking on RUN Local Button
const setVisible = (name) => {                  
    var ele = document.getElementsByClassName(name)[0];
    console.log(ele.classList.contains("d-none"));
    console.log(name);

    if(ele.classList.contains("d-none")){
    ele.classList.remove("d-none");
    ele.classList.add("d-flex");
    }
    else {
    ele.classList.remove("d-flex");
    ele.classList.add("d-none");
    } 
}

///////////////////////////////////////////////////////////////////////
/////// HTTP REQUESTS

async function sendPost(k, url, body, transactionSignature) {
    console.log(body);
    const response = k.getElementsByClassName("response")[0];
    response.classList.remove("d-none");
    response.classList.add("d-flex");
    const timestamp = "[" + new Date() + "]\n\n";
    response.value = "";

    const body2 = body;

    if (!isValidJSON(body2)) {
        response.value = timestamp + "Invalid Request body JSON format";
        return;
    } else {
        response.value = "loading...";
    }
    const jsonParams = JSON.parse(body);

    return $.ajax({
        type: 'POST',
        url: url,
        data: JSON.stringify(jsonParams),
        beforeSend: function(xhr) {
            if (transactionSignature) {
            xhr.setRequestHeader("Authorization", "Digest " + transactionSignature);
            xhr.setRequestHeader("X-IBM-Client-Id", client_id);
            } else {
            xhr.setRequestHeader("Authorization", "Bearer " + bearer_tkn);
            xhr.setRequestHeader("X-IBM-Client-Id", client_id);
            xhr.setRequestHeader("Content-Type", 'application/json');
            //xhr.setRequestHeader("Accept", '*/*');
            //xhr.setRequestHeader("Access-Control-Allow-Headers", '*'); 
            }
        },
        success: function(msg) {
            response.value = JSON.stringify(msg, undefined, 4);
            beautify(k, 'response');
            return msg;

        },
        error: function(xhr) { // if error occurred
            //console.log(xhr.response);
            response.value = timestamp + "Ocurred an error sending post to\n" + url;
        },
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        })
        .fail(function(error) {
        response.value = "Ocurred an error sending post to\n" + url + '\n\nResponse Body:\n' + JSON.stringify(error.responseJSON, undefined, 4);
        });
    }

    async function sendGet(k, url, transactionSignature) {
    const response = k.getElementsByClassName("response")[0];
    const timestamp = "[" + new Date() + "]\n\n";

    response.classList.remove("d-none");
    response.classList.add("d-flex");
    
    response.value = "loading...";

    return $.ajax({
        type: 'GET',
        url: url,
        beforeSend: function(xhr) {
            if (transactionSignature) {
            xhr.setRequestHeader("Authorization", "Digest " + transactionSignature);
            } else {
            xhr.setRequestHeader("Authorization", "Bearer " + bearer_tkn);
            xhr.setRequestHeader("X-IBM-Client-Id", client_id);
            }
        },
        success: function(msg) {
            response.value = JSON.stringify(msg, undefined, 4);
            beautify(k, 'response');
            return msg;

        },
        error: function(xhr) { // if error occured
            //console.log(xhr.responseJSON);
            response.value = timestamp + "Ocurred an error sending GET to\n" + url + '\n\n' + xhr.responseJSON;
        },
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        })
        .fail(function(error) {
        //console.log(error);
        response.value = "Ocurred an error on the GET request to\n" + url + '\n\nResponse Body:\n' + JSON.stringify(error.responseJSON, undefined, 4);
        });
    }

    function isValidJSON(text) {
    console.log("text - " + text);
    if (/^[\],:{}\s]*$/.test(text.replace(/\\["\\\/bfnrtu]/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
        return true;
    } else {
        return false;
    }
    }

    function beautify(k, className) {
    var ugly = k.getElementsByClassName(className)[0].value;
    var obj = JSON.parse(ugly);
    var pretty = JSON.stringify(obj, undefined, 4);
    k.getElementsByClassName(className)[0].value = pretty;
    }
