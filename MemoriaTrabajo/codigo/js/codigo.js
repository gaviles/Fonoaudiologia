

window.steps = [2,2,3,4,5,5,6,6,7,7];
window.aColores = ["Rojo","Verde","Amarillo","Azul"];
window.iStepTimer = 1000;

var aResults = {}

window.aCurrentInput = [];
window.aPatients = [];
window.aCurrentTest = [];
window.aCurrentSecuence = [];
window.iPatient = 0;

function initialize(){
	if(typeof(Storage) !== "undefined") {
		if (!localStorage.patients) {
        	save();
    	} else {
    		window.aPatients = JSON.parse(localStorage.patients);
    	}
    	setPatientsSelectable();
        $('#patientsModal').modal();
		$('#patientsModal').modal({ keyboard: false });
		$(".alert-button").hide();
		$('#patientsModal').modal('show');
    } else {
    	alert("Lo siento tu navegador no soporta la aplicación");
    }
}

var bStarting = false;

function start() {
	console.log("starting");
	if (bStarting) {
		return;
	}
	desableClick();
	$(".start-button").show();
	$('#patientsModal').modal('hide');
	bStarting = true;
	$(".start-button input").val("3");
	window.setTimeout(function () {
		$(".start-button input").val("2");
	}, 1000);
	window.setTimeout(function () {
		$(".start-button input").val("1");
	}, 2000);
	window.setTimeout(function () {
		$(".start-button input").val("Comenzar");
		$(".start-button").hide();
	}, 3000);

	window.setTimeout(function () {
		bStarting = false;
		execute();
	}, 4000);
}

function setPatientsSelectable(){
	var sHtml = "";
	for(var i in aPatients){
		sHtml +=  "<option value='" + aPatients[i].id + "'>" + aPatients[i].patientName + ", " + aPatients[i].patientAge + "</option>";
	}
	$("#selected-patient").html(sHtml);
}

function cratePatient(){
	var newPatient = {
		id: (new Date()).getTime(),
		patientName : $("#patient-name").val(),
		patientAge : $("#patient-age").val(),
		bIsControl : $("#patient-control:checked").length > 0 ? true: false,
		aTests : []
	}
	window.aPatients.push(newPatient);
	save();
	console.log(newPatient);
	$(".create-patient-panel").hide();
	setPatientsSelectable();
}

function save(){
	localStorage.patients = JSON.stringify(window.aPatients);
}

function execute() {

	$('#patientsModal').modal('hide');

	if(window.aCurrentTest.length == 0){
		var id = $("#selected-patient").val();
		for (var i in window.aPatients){
			if( window.aPatients[i].id == id ) { 
				window.iPatient = i;
				break;
			}
		}
	}

	if(window.steps[window.aCurrentTest.length] == undefined) {

		var oTest = {
			date: (new Date()).toISOString(),
			correct: "",
			incorrect: "",
			points: 0
		};

		for( var i in window.aCurrentTest ){

            var sPrefix = " - ";

			if(window.aCurrentTest[i].correct){

                if(oTest.correct == ""){
                    sPrefix = "";
                }

				oTest.correct += sPrefix + window.aCurrentTest[i].secuence.length;
				oTest.points += window.aCurrentTest[i].secuence.length;
			} else {
                if(oTest.incorrect == ""){
                    sPrefix = "";
                }
                oTest.incorrect += sPrefix + window.aCurrentTest[i].secuence.length;
			}
		}

		window.aPatients[window.iPatient].aTests.push(oTest);
		save();
		window.aCurrentTest = [];
		window.iPatient = 0;
		$('#patientsModal').modal('show');
		return;
	}
	window.aCurrentSecuence = getSecuence(window.steps[window.aCurrentTest.length], 4);
	showSecuence(
		JSON.parse(JSON.stringify(window.aCurrentSecuence)),
		aColores);
}

function onClick(sColor){

	if (!isEnableClick()) { return; }

	var iColor;
	for (iColor = 0; iColor  < aColores.length; iColor++) {
		if (aColores[iColor] == sColor) {
			break;
		}
	}

	// Check if is not a double input
	if( window.aCurrentInput[window.aCurrentInput.length-1] == iColor) {
		return;
	}

	window.aCurrentInput.push(iColor);

	if ( window.aCurrentInput.length == window.aCurrentSecuence.length ){

		var bIsCorrent = true;
		for( var i in window.aCurrentInput){
			if (window.aCurrentInput[i] !== window.aCurrentSecuence[i]) {
				bIsCorrent = false;
				break;
			}
		}

		var oLevel = {
			correct: bIsCorrent,
			secuence: window.aCurrentSecuence,
			response: window.aCurrentInput
		};
		window.aCurrentTest.push(oLevel);
		window.aCurrentSecuence = [];
		window.aCurrentInput = [];
		$(".continue-button").show();
		desableClick();
	}
}

function isEnableClick () {
	return $(".row.cuatroColores").hasClass("Clickable");
}

function enableClick () {
	$(".row.cuatroColores").addClass("Clickable");
}

function desableClick () {
	$(".row.cuatroColores").removeClass("Clickable");
}

function showSecuence(aSecuence, aTranslator) {
	desableClick();
	var iColor = aSecuence.shift();
	$(".Color." + aTranslator[iColor] ).addClass("light");
	window.setTimeout(function () {
		$(".Color." + aTranslator[iColor] ).removeClass("light");
		if (aSecuence.length > 0) {
			showSecuence(aSecuence, aTranslator);
		} else {
			$(".answer-button").show();
			$('#patientsModal').modal('hide');
		}
	}, iStepTimer);
}

function answer () {
	$(".answer-button").hide();
	enableClick();
}

function Continue() {
	$(".continue-button").hide();
	window.setTimeout(function () {
		execute();
	}, 1000);
}


function getSecuence (iSteps, iColors) {

	var aSeceunce = [];
	var iColor = 0;
	for (var i = 0; i < iSteps ; i++ ) {
		iColor = aleatorio(0, iColors-1, iColor);
		aSeceunce.push(iColor);
	}
	return aSeceunce;
}

function aleatorio(inferior, superior, anterior) {
   	var numPosibilidades = superior - inferior;
   	var aleat = Math.random() * numPosibilidades;
   	aleat = Math.round(aleat);
   	var iReturn = parseInt(inferior) + aleat;
   	if ( iReturn == anterior ) {
   		return aleatorio(inferior, superior, anterior);
   	}
   	return iReturn;
}

function downloadData(){
	csvData = '"Nombre";"Edad";"Fecha";"Buenas";"Malas";"Puntaje"\n';

	for(var i in aPatients ){

		for( var j in aPatients[i].aTests ){
			csvData += '"' + aPatients[i].patientName + '";"' + 
						aPatients[i].patientAge + '";"' + 
						aPatients[i].aTests[j].date + '";"'+ 
						aPatients[i].aTests[j].correct + '";"' + 
						aPatients[i].aTests[j].incorrect + '";"' + 
						aPatients[i].aTests[j].points + '"\n';
		}
	}

	var encodedUri = encodeURI(csvData);
	var link = document.createElement("a");
	link.setAttribute("href", "data:text/csv;charset=utf-8," + encodedUri);
	link.setAttribute("download", "resultados.csv");

	link.click();
}

$(function() {
	initialize();
});