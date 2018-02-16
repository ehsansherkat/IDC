/**************************
 * Author: Ehsan Sherkat  *
 * Copyright: 2016		*
 **************************/

 var csvFile; //csv file
 var userID = "";//user ID
 var userDirectory = "";// user director
 var TXT_Documents = new Array();//list of documnets text
 var userExists = false;

/**
 * Get user ID
 */
 function getUserID() { 	 

 	var input = prompt("Please enter your userId","");

 	if ((input != null) && (input.trim() != "")) {
 		//check if the user exists
 		userID = input;
 		userDirectory= "../users/"+input+"/";
 		checkUserExists()
 	}
 }

/**
 * Check if the user exists
 */
 function checkUserExists() {
 	$.ajax({
		type: "POST",
		url: "./cgi-bin/checkUser.py",
		data: { userDirectory:JSON.stringify(userDirectory)}, 
		async: true,			  
		success: function( msg ) {
	  
		var status = msg['status'];

		if (status == "yes") { 
	   		$("#userWelcome").html("You are logged in as: "+userID);
	   		userExists = true
 			processUserComands();
		}
		if(status == "no") {
		  alert("No such user exists!");
		}
		if (status == "error") {
		  alert("Error1 finding the user!");
		}	 
	  },
	  error: function(msg){			
		alert("Error2 finding the user!");
	  }
  });
 }

/**
 * Process user commands: Upload file of show the list of files to user
 */
function processUserComands() {
	init_tsne_perplexity()
	CSV_Upload();
	pdf_Upload();
	txt_Upload();
}

/**
 * Initialize tsne select bar
 */
function init_tsne_perplexity() {

	for (var i = 5; i <= 50; i++) {
		$("#tsnePerplexitySelect").append("<option value=\""+i+"\">"+i+"</option>")
	}

	//set default to 18
	$('#tsnePerplexitySelect option[value="18"]').attr("selected",true);
}

/**
 * Upload File
 * @param file_content: content of file in base64 format
 * @param file_name
 * @param file_type: type of the file
 */
function uploadFile(file_content, file_name, file_type) {
 	$.ajax({
		type: "POST",
		url: "./cgi-bin/FileCheck.py",
		data: { userDirectory:JSON.stringify(userDirectory), file_name:JSON.stringify(file_name)}, 
		success: function( msg ) {

		var status = msg['status'];	   

		if (status == "yes") { 
	   		$.ajax({
				type: "POST",
				url: "./cgi-bin/Upload.py",
				cache: false,
				async: false,
				data: { userDirectory:JSON.stringify(userDirectory), file_content:JSON.stringify(file_content), file_name:JSON.stringify(file_name), file_type:JSON.stringify(file_type)},
				success: function( msg ) {

				var status = msg['status'];

				if (status == "yes") {
					if ($("#file_list_output").html("") != "") {
						$("#file_list_output").html("");
					}
						
					$("#upload_output").append("<tr><th align='left'style='width:80%;'>"+file_name + "</th><th align='left' style='color:green;width:20%;'> Uploaded successfully!</th></tr>")
					$('#upload_output').scrollTop($('#upload_output').height());
				}			
				else if (status == "error"){
					errorMessage = msg['except']
					$("#upload_output").append("<tr><th align='left'style='width:80%;'>"+file_name + "</th><th align='left' style='color:red;width:20%;'>"+ errorMessage +"</th></tr>")
					$('#upload_output').scrollTop($('#upload_output').height());
				}			
				},
				error: function(msg){			
					$("#upload_output").append("<tr><th align='left'style='width:80%;'>"+file_name + "</th><th align='left' style='color:red;width:20%;'Error Saving file!</th></tr>")
					$('#upload_output').scrollTop($('#upload_output').height());
				}
			});			
		}
		if (status == "fileExists") {
			errorMessage = msg['except']
			$("#upload_output").append("<tr><th align='left'style='width:80%;'>"+file_name + "</th><th align='left' style='color:red;width:20%;'>"+ errorMessage +"</th></tr>")
			$('#upload_output').scrollTop($('#upload_output').height());
		}
		else if (status == "noDirect"){
			errorMessage = msg['except']
			$("#upload_output").append("<tr><th align='left'style='width:80%;'>"+file_name + "</th><th align='left' style='color:red;width:20%;'>"+ errorMessage +"</th></tr>")
			$('#upload_output').scrollTop($('#upload_output').height());
		}
		else if (status == "error"){
			errorMessage = msg['except']
			$("#upload_output").append("<tr><th align='left'style='width:80%;'>"+file_name + "</th><th align='left' style='color:red;width:20%;'>"+ errorMessage +"</th></tr>")
			$('#upload_output').scrollTop($('#upload_output').height());
		}			
	  },
	  error: function(msg){			
		$("#upload_output").append("<tr><th align='left'style='width:80%;'>"+file_name + "</th><th align='left' style='color:red;width:20%;'>Error Uploading!</th></tr>")
		$('#upload_output').scrollTop($('#upload_output').height());
	  }
  });
 }

/**
 * Progress bar update
 * @param progress
 */
 function progressBar(progress) {
 	if (progress == 100) {
 		$("#UploadprogressBar").html("")
 		document.body.style.cursor = "auto";
 	} else {
 		document.body.style.cursor = "progress";
 		 	$("#UploadprogressBar").html("<div  class=\"progress\">"+
	  "<div class=\"progress-bar progress-bar-striped active\" role=\"progressbar\""+
	  "aria-valuenow=\""+progress+"\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width:"+progress+"%;font-size: 100%;\">"+
	  "Please Wait!</div> </div>")
 	}		
 }

/**
 * Get the PDF file from the user and process it
 */
function pdf_Upload() {
	$("#button_pdf").change(function(e) {		
		progressBar(100);
		document.body.style.cursor = "progress";

		files = document.getElementById("button_pdf").files;
		var total = files.length; 

		if (total > 0) {
			$("#upload_output").html("");
		}

		var loaded = 0;
		for (var i = 0; i < files.length; i++) {
			//check the extension

			if (files[i].type == "application/pdf") {
				if (files[i].size > 52428800) {
					$("#upload_output").append("<tr><th align='left'style='width:80%;'>"+files[i].name + "</th><th align='left' style='color:red;width:20%;'> Large file (>50MB)!</th></tr>")
					$('#upload_output').scrollTop($('#upload_output').height());
					loaded++;
				}
				else {
					var reader = new FileReader();
					reader.readAsDataURL(files[i]);
					reader.fileName = files[i].name;				
					
					reader.onload = function (evt) {	
						document.body.style.cursor = "progress";				
						uploadFile(evt.target.result, evt.target.fileName, "PDF")
						loaded++;

						if (loaded == total) {
							document.body.style.cursor = "auto";
						}
						var progress = parseInt( ((loaded / total) * 100), 10 );
						progressBar(progress);
					}
					// reader.onloadend  = function (evt) { 
					// 	reader.abort();
					// }
				}
			}
			else {
				$("#upload_output").append("<tr><th align='left'style='width:80%;'>"+files[i].name + "</th><th align='left' style='color:red;width:20%;'> Not supported format!</th></tr>")
				$('#upload_output').scrollTop($('#upload_output').height());
				loaded++;
			}
		};	
	})
}

/**
 * Get the TXT file from the user and process it
 */
function txt_Upload() {
	$("#button_txt").change(function(e) {		
		progressBar(100);	

		files = document.getElementById("button_txt").files;
		var total = files.length; 

		if (total > 0) {
			$("#upload_output").html("");
		}

		var loaded = 0;
		for (var i = 0; i < files.length; i++) {
			//check the extension
			if (files[i].type == "text/plain") {
				if (files[i].size > 52428800) {
					$("#upload_output").append("<tr><th align='left'style='width:80%;'>"+files[i].name + "</th><th align='left' style='color:red;width:20%;'> Large file (>50MB)!</th></tr>")
					$('#upload_output').scrollTop($('#upload_output').height());
					loaded++;
				}
				else {
					var reader = new FileReader();
					reader.readAsDataURL(files[i]);
					reader.fileName = files[i].name;

					reader.onload = function (evt) {	
						document.body.style.cursor = "progress";				
						uploadFile(evt.target.result, evt.target.fileName, "TXT")
						loaded++;

						if (loaded == total) {
							document.body.style.cursor = "auto";
						}
						var progress = parseInt( ((loaded / total) * 100), 10 );
						progressBar(progress);
					}
				}
			}
			else {
				$("#upload_output").append("<tr><th align='left'style='width:80%;'>"+files[i].name + "</th><th align='left' style='color:red;width:20%;'> Not supported format!</th></tr>")
				$('#upload_output').scrollTop($('#upload_output').height());
				loaded++;
			}
		};	
	})
}

/**
 * Get the CSV file from the user and process it
 */
function CSV_Upload() {
	$("#button_csv").change(function(e) {

		//check the extension
		var ext = $("input#button_csv").val().split(".").pop().toLowerCase();

		if($.inArray(ext, ["csv"]) == -1) {
			alert('Please upload CSV file only!');
			return false;
		}

		//read and store CSV file in a variable		
		var fileToLoad = document.getElementById("button_csv").files[0];

		if( document.getElementById("button_csv").files.length > 0) {
			//clear previous results
			$("#upload_output").html("");
			$("#file_list_output").html("");
		}

		var fileReader = new FileReader();
		fileReader.onload = function(fileLoadedEvent) 
		{
			csvFile = d3.csv.parse(fileLoadedEvent.target.result);

			//show the columns to the user
  			var columns = Object.keys(csvFile[0]);

  			$("#upload_output").append("<p><strong>Please select columns that should be in final PDF files and then press 'Submit'.</strong></p>");

  			for (var i = 0; i < columns.length; i++) {
  				if(columns[i].length > 0) {
  					$("#upload_output").append("<input type='checkbox' class='column' value='"+columns[i]+"'>" + columns[i] + '<br>');
  				}
  			}

  			$("#upload_output").append("<br><input id='CSVsubmit' title='Submit' type='button' value='Submit' onmousedown='converToPDF()' />");
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
				$("#upload_output").append("<p id='r1'><strong>The documents extracted and saved successfully. You can also download the PDF files by pressing the 'Download' button.</strong></p>");
				$("#upload_output").append("<input id='downloadPDF' title='Download' type='button' value='Download' onclick='downloadPDF()'/>");
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
	window.open("./users/" + userID + "/result.zip",'_blank');
}

/**
 * Delete all files in user directory
 */
function deleteAll() {
	if (userID == "") {
		getUserID()
	}
	else {
		deleteConfirm = confirm("Are you sure about removing all files in your directory?");

	 	if(deleteConfirm) {
	 		$("#file_list_output").html("")
	 		$.ajax({
				type: "POST",
				url: "./cgi-bin/FilesRemove.py",
				traditional: true,
				data: { userDirectory:JSON.stringify(userDirectory)}, 
				async: false,			  
				success: function( msg ) {

					var status = msg['status'];

					if (status == "yes") {	
					$("#numberOfFiles").html("Number of documents: 0")			
						alert("All files removed successfully!");
					}
					else {
						var except = msg['except'];		 
						alert(except);						
					}			
				},
				error: function(msg){
					alert("Error in removing files!");
				}
			});
	 	}
	}
}

/**
 * Delete selected files in user directory
 */
function deleteSelectedFiles() {
	if (!userExists) {
		alert("No user name inserted (refresh page to insert your name).")
		return
	}
	//get selected files list
	var selectedFiles = []
	var atLeastOne = false;

	var columnsResult = document.getElementsByClassName("fileListCheckBox");
	var counter = 0;

	for (var i = 0; i < columnsResult.length; i++) {
		if($(columnsResult[i]).is(':checked')) {
			selectedFiles[counter] = $(columnsResult[i]).val();
			counter = counter + 1;
			atLeastOne = true;			
		}
	}

	if(!atLeastOne) {
		alert("You should select at least one column!");
		document.body.style.cursor = "auto";

		return false;
	}
	else {
		for (var i = 0; i < selectedFiles.length; i++) {
			deleteFile(selectedFiles[i])
		}

		showFiles()
	}
}

/**
 * delete selected file
 * @param: fileName
 */
function deleteFile(fileName) {
	$.ajax({
		type: "POST",
		url: "./cgi-bin/FileDelete.py",
		traditional: true,
		data: { userDirectory:JSON.stringify(userDirectory), fileName:JSON.stringify(fileName)}, 
		async: false,			  
		success: function( msg ) {

			var status = msg['status'];
			if (status == "error"){
				var except = msg['except'];		 
				alert(except);						
			}
			else if (status == "no") {
				$("#file_list_output").html("")
				alert("No file to Delete!")
			}		
		},
		error: function(msg){			
			alert("Error in removing file!");
		}
	});
}

/**
 * Show list of files to the user.
 */
function showFiles() {
	if (!userExists) {
		alert("No user name inserted (refresh page to insert your name).")
		return
	}
	$.ajax({
		type: "POST",
		url: "./cgi-bin/FilesList.py",
		traditional: true,
		data: { userDirectory:JSON.stringify(userDirectory)}, 
		async: false,			  
		success: function( msg ) {

			var status = msg['status'];

			if (status == "yes") {
				files = []			
				files = msg['files'];
				$("#numberOfFiles").html("Number of documents: " + files.length)
				generateFilesList(files)				
			}
			else if (status == "error"){
				var except = msg['except'];		 
				alert(except);						
			}
			else if (status == "no") {
				$("#file_list_output").html("")
				alert("No file to show!")
			}		
		},
		error: function(msg){			
			alert("Error in showing files!");
		}
	});
}

/**
 * Generate HTML code for the user files list
 * @files: the list of users file names.
 */
function generateFilesList(files) {
	$("#file_list_output").html("")
	for (var i = 0; i < files.length; i++) {
		$("#file_list_output").append("<input style='margin-left:1%;' type='checkbox' class='fileListCheckBox' value='"+files[i]+"'>" 
			+ "<a style='margin-left:1%;' href='.//"+userDirectory+files[i] +"' target='_blank'>"+files[i]+"</a>" + 
			'<br>');
	}
}

/**
 * Preprocess documents
 */
function preprocess() {
	if (!userExists) {
		alert("No user name inserted (refresh page to insert your name).")
		return
	}
	onlyEnglish = "no"
	numbers = "no"
	lematizer = "no"
	bigram = "no"

	if($("#onlyEnglish").is(':checked')) {
		onlyEnglish = "yes"
	}
	if($("#numbers").is(':checked')) {
		numbers = "yes"
	}
	if($("#lematizer").is(':checked')) {
		lematizer = "yes"
	}
	if($("#bigram").is(':checked')) {
		bigram = "yes"
	}
	//get perplexity amount
	perplexityNew = $('#tsnePerplexitySelect').val()
	//get clustering method
	clusteringMethod = $('#Clustering_algo_select').val()

	document.body.style.cursor = "progress";
	$("#UploadprogressBar").html("<p>Please Wait while the dataset is processing!</p>")

	$.ajax({
		url: "./cgi-bin/preprocess.py",
		type: "GET",
		async: true,
		// timeout: 10 * 60 * 60 * 1000, //10 hours
		data: { userDirectory:JSON.stringify(userDirectory), 
			userID:JSON.stringify(userID), 
			onlyEnglish:JSON.stringify(onlyEnglish), 
			numbers:JSON.stringify(numbers),
			lematizer:JSON.stringify(lematizer),
			bigram:JSON.stringify(bigram),
			clusteringMethod:JSON.stringify(clusteringMethod),
			perplexityNew:JSON.stringify(perplexityNew)}, 
		success: function( msg ) {
			var status = msg['status'];			

			if (status == "finish") {				
				alert("Preprocessing of documents finished successfully.")
				document.body.style.cursor = "auto";
				$("#UploadprogressBar").html("")
			}
			if (status == "error"){
				var except = msg['except'];		 
				alert(except);
				document.body.style.cursor = "auto";
				$("#UploadprogressBar").html("")
			}	
		},
		error: function(a){
			if (a.status == 504) {
				alert("Time out (error 504), Preprocessing of documents is not finnished. Check the files from the server.")
				document.body.style.cursor = "auto";
				$("#UploadprogressBar").html("")
			}
			else {
				console.log(a)									
				alert("Error in preprocessing files!");
				document.body.style.cursor = "auto";
				$("#UploadprogressBar").html("")
			}

		}
	});
}

//****** buttons help tooltips
$(function () {
	$('#csv_pannel_title').qtip({ 
	  content: {
		  text: 'The first line is the title of each column of the text (each part of the document) and each document should be in a single line.'
	  },

	  position: {
		my: 'bottom center',
		at: 'top center'
	  },

	  style: {
		classes: 'qtip-rounded qtip-shadow'
	  }
  })
	$('#pdf_pannel_title').qtip({ 
	  content: {
		  text: 'Each document should be a single PDF file.'
	  },

	  position: {
		my: 'bottom center',
		at: 'top center'
	  },

	  style: {
		classes: 'qtip-rounded qtip-shadow'
	  }
  })
	$('#txt_pannel_title').qtip({ 
	  content: {
		  text: 'Each document should be a single TXT file.'
	  },

	  position: {
		my: 'bottom center',
		at: 'top center'
	  },

	  style: {
		classes: 'qtip-rounded qtip-shadow'
	  }
  })
	$('#buttonPreprocess').qtip({ 
	  content: {
		  text: 'After any changes you need to preprocess documents.'
	  },

	  position: {
		my: 'bottom center',
		at: 'top center'
	  },

	  style: {
		classes: 'qtip-rounded qtip-shadow'
	  }
  })
	$('#buttonDeleteSelected').qtip({ 
	  content: {
		  text: 'Delete selected documents.'
	  },

	  position: {
		my: 'bottom center',
		at: 'top center'
	  },

	  style: {
		classes: 'qtip-rounded qtip-shadow'
	  }
  })
	$('#buttonDeleteAll').qtip({ 
	  content: {
		  text: 'Delete all documents.'
	  },

	  position: {
		my: 'bottom center',
		at: 'top center'
	  },

	  style: {
		classes: 'qtip-rounded qtip-shadow'
	  }
  })
	$('#buttonShowFiles').qtip({ 
	  content: {
		  text: 'Show list of all documents.'
	  },

	  position: {
		my: 'bottom center',
		at: 'top center'
	  },

	  style: {
		classes: 'qtip-rounded qtip-shadow'
	  }
  })
});//end of buttons help tooltips