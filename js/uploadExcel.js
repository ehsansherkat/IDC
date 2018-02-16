/**************************
 * Author: Ehsan Sherkat  *
 * Copyright: 2015        *
 **************************/

 var csvFile; //csv file
 var userID = "";//user ID
 var userDirectory = "";// user director
 var TXT_Documents = new Array();//list of documnets text

/**
 * Get user ID
 */
 function getUserID() {
 	var input = prompt("Please enter your userId","");

 	if ((input != null) && (input.trim() != "")) {
 		userID = input;
 		userDirectory= "../users/"+input+"/";
 		processCSV();
 	}
 }

/**
 * Get the CSV file from the user and process it
 */
function processCSV() {
	$("#CSV_Input").change(function(e) {
		//clear previous results
		$("#output").html("");

		//check the extension
		var ext = $("input#CSV_Input").val().split(".").pop().toLowerCase();

		if($.inArray(ext, ["csv"]) == -1) {
			alert('Please upload CSV file only!');
			return false;
		}

		//read and store CSV file in a variable		
		var fileToLoad = document.getElementById("CSV_Input").files[0];

		var fileReader = new FileReader();
		fileReader.onload = function(fileLoadedEvent) 
		{
			csvFile = d3.csv.parse(fileLoadedEvent.target.result);

			//show the columns to the user
  			var columns = Object.keys(csvFile[0]);

  			$("#output").append("<p><strong>Please select columns that should be in final PDF files and then press 'Submit'.</strong></p>");

  			for (var i = 0; i < columns.length; i++) {
  				if(columns[i].length > 0) {
  					$("#output").append("<input type='checkbox' class='column' value='"+columns[i]+"'>" + columns[i] + '<br>');
  				}
  			}

  			$("#output").append("<br><input id='CSVsubmit' title='Submit' type='button' value='Submit' onmousedown='converToPDF()' />");	
		}

		fileReader.readAsText(fileToLoad, "UTF-8");
	})
}

/**
 * Convert each row of the CSV to a pdf based on the selected columns
 */
function converToPDF() {
	//sent appropriate singals to the user in order to wait
	alert("It will takes a while, Please be patient!");
	$("#CSVsubmit").hide();
	document.body.style.cursor = "progress";

	//remove download button
	$("#r1").remove();
	$("#downloadPDF").remove();

	//get selected columns list
	var selectedColumns = new Array();
	var atLeastOne = false;

	var columnsResult = document.getElementsByClassName("column");

	for (var i = 0; i < columnsResult.length; i++) {
		if($(columnsResult[i]).is(':checked')) {
			selectedColumns[$(columnsResult[i]).val()] = true;
			atLeastOne = true;
		}
		else {
			selectedColumns[$(columnsResult[i]).val()] = false;
		}
	}

	//For empty columns
	selectedColumns[""] = false;

	if(!atLeastOne) {
		alert("You should select at least one column!");
		document.body.style.cursor = "auto";
		$("#CSVsubmit").show();

		return false;
	}

	//create text of each file	
	var counter = 0;

	for (var i = 0; i < csvFile.length ; i++) {
		var keys = Object.keys(csvFile[i]);
		TXT_Documents[counter] = "";
		
		for (var j = 0; j < keys.length; j++) {//for each row selec only content of the selected columns
			if(selectedColumns[keys[j]]) {				
				TXT_Documents[counter] += (csvFile[i][keys[j]] + " ");
			}
		}

		counter++;	
	}

	//convert to pdf
	createPDF();		

	document.body.style.cursor = "auto";
	$("#CSVsubmit").show();
}

/**
 * Send the text to the server and convert them to PDF
 */
function createPDF() {
	$.ajax({
		type: "POST",
		url: "./cgi-bin/converToPDF.py",
		traditional: true,
		data: { userDirectory:JSON.stringify(userDirectory), TXT_Documents:JSON.stringify(TXT_Documents)}, 
		async: false,              
		success: function( msg ) {

			var status = msg['status'];

			if (status == "yes") {				
				$("#output").append("<p id='r1'><strong>Download the PDF files by pressing the 'Download' button.</strong></p>");
				$("#output").append("<input id='downloadPDF' title='Download' type='button' value='Download' onclick='downloadPDF()'/>");
			}
			else {
				alert("Error2 in creating PDF files!");
			}			
		},
		error: function(msg){            
			alert("Error1 in creating PDF files!");
		}
	});
}

/**
 * Show download link of all PDF files in one Zip file to the user.
 */
function downloadPDF() {
	window.open("./" + userID + "/result.zip",'_blank');
}