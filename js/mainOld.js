/**************************
 * Author: Ehsan Sherkat  *
 * Copyright: 2015        *
 **************************/

var clusterWords = "";//the name and the key terms of clusters
var clusterKeyTerms = "";//the key terms of clusters are here
var clusterDocuments = "";//the list of documents of cluster
var clusterCloud = "";//the cloud terms of cluster
var termClusterData = "";//the term cluster data
var termClusterDataString = "";//the string of the term cluster data (for changing it later)
var documentClusterData = "";//the document cluster data
var documentClusterDataString = "";//the string of the document cluster data (for changing it later)
var allWords = "";//all words
var sessions = []; //list of sessions name
var sessionsDescription = []; //list of sessions description
var documentsName = [];//list of documents name
var documentsNameString = "";//list of documents name string
var documentDocumentSimilarity = new Array();//document document similarity
var documentDocumentSimilarityString = "";//document document similarity string
var termDocumentSimilarity = new Array();// term document similarity
var termDocumentSimilarityString = new Array();// term document similarity string
var generalViewGraph = "";//general view graph
var generalViewGraph2 = "";//general view graph
var removedDocuments = [];//show the list of documents that have been removed (becuase of removing the cluster)
var sessionDescription = "";
var silhouette = 0;
var TsneSilhouette = 0;
var tsneResult = new Array();

// var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

var clusterKeytermsOriginal;
var clusterDocs;
var fileName = "";
var termsFileName = "";
var specFileName = "";
var fileListName = "";
var userDirectory = "";
var userID = "";
var userU = -1;
var serverData = new Array();
var serverClusetrName = [];
var termClusters = [];
var docClusters = [];
var clusterNumber = -1;

/**
 * Load the system and clusters
 */
function pageLoad() {

  $( "#slider1" ).slider( "disable" );
  $( "#slider2" ).slider( "disable" );
  $( "#slider3" ).slider( "disable" );
  $("#slider1_Textbox").attr("disabled","disabled");
  $("#slider2_Textbox").attr("disabled","disabled");
  $("#slider3_Textbox").attr("disabled","disabled");

  //promt for the user guide
  // var userGuide = confirm("Would you like to see the userguide page first?");
  // if (userGuide)
  // {
  //   window.open("./userguide.html", '_self');
  // }

  // //get the user id
  // else 
  {
    var input = prompt("Please enter your userId",""); 
    var loadSessionConfirmed = false;   

    if ((input != null) && (input.trim() != ""))
    {      
      userID = input;

      fileName = "../"+input+"/out"+input+".Matrix";
      termsFileName = "../"+input+"/out"+input+".Terms";
      specFileName = "../"+input+"/out"+input+".Spec";
      fileListName = "../"+input+"/fileList";
      userDirectory= "../"+input+"/";

      $("#userName").html("Welcome " + userID + "!");

      $.ajax({
              type: "POST",
              url: "./cgi-bin/pp.py",
              data: { userDirectory:JSON.stringify(userDirectory), status:JSON.stringify("0")},                
              success: function( msg ) {

              var status = msg['status'];

              if (status == "yes")
              {
                alert("You need to pre-process your collection! Click on 'Upload Document' on the top left hand side!");
              }
              else if (status == "no")
              {              
                getListOfSessions("first");
                if(sessions.length > 0) {
                  loadSessionConfirmed = confirm("You have saved sessions. Do you want to load the latest one?");

                  if(loadSessionConfirmed) {

                    var sessionName = sessions[sessions.length - 1].substring(sessions[sessions.length - 1].indexOf("#$")
                     + 2, sessions[sessions.length - 1].indexOf(".session")).replace("_", ":").replace("_", ":"); 

                    var name = sessionName.substring(sessionName.indexOf(" @ ") + 3);
                    var date = sessionName.substring(0, sessionName.indexOf(" @ "));
                    var sessionValue = name + " @ " + date;

                    loadSession(sessionName);
                    getListOfSessions(sessionValue);                    
                  }
                }
                if (!loadSessionConfirmed) {
                  input = prompt("Please enter your initial number of clusters","");

                  if ((input != null) && (input.trim() != "") && (IsNumeric(input) != false))
                  {
                    clusterNumber = Number(input);
                    callServer();                                
                  }
                  else if ((input != null) && ((input.trim() == "") || (IsNumeric(input) == false)))
                  {
                    alert("Your number of clusters is not valid!")
                  }
                } 
              } 
            },
            error: function(msg){
              document.body.style.cursor = "auto";
              alert("Error in retrieving the last status of your collection!");
            }
      });
    }
    else if ((input != null) && (input.trim() == ""))
    {
      alert("Your userID is not valid!")
    }
  }  
}

/**
 * Checks if the data is numeric or not
 * @param data = input data
 * @return true if it is numeric.
 */
function IsNumeric(data){
  return parseFloat(data)==data;
}

/**
 * Remove all zip files in the user directory
 */
function removeZip() { 
  $.ajax({
    type: "POST",
    url: "./cgi-bin/deleteZip.py",
    data: { userDirectory:JSON.stringify(userDirectory)}, 
    async: false,              
    success: function( msg ) { 
    },
    error: function(msg){            
      alert("Error1 in removing zip files!");
    }
  });
}

/*
 * Run the clustering algorithm and get the results
 */
function callServer(){
    saveLog("callServer");

    $("body").css("cursor", "wait");
    //remove zip files
    removeZip();

    var date01 = new Date();
    var n01 = date01.getTime(); 

    $.ajax({
        url: "./cgi-bin/main.py",
        type: "POST",
        cache: false,
        traditional: true,
        data: {clusterNumber : clusterNumber, fileName:fileName, specFileName: specFileName, fileListName:fileListName, 
          termsFileName: termsFileName, userU:userU, userDirectory:userDirectory, serverData:JSON.stringify(serverData), 
          serverClusetrName:JSON.stringify(serverClusetrName)},

        success: function (msg) {   
            $("body").css("cursor", "auto"); 

            var date02 = new Date();
            var n02 = date02.getTime();  
            var time = (n02-n01)/1000;
            console.log("Time to clustering: " + time);      

            clusterKeytermsOriginal = eval(msg['termClusters']);
            clusterDocs = eval(msg['docClusters']);
            silhouette = eval(msg['silhouette']);
            
            if(silhouette == null) {
              silhouette = "Error!"
            }
            else {
              silhouette = silhouette.toFixed(4);
            }

            $("#silhouette").append("Silhouette: " + silhouette);

            if ((clusterKeytermsOriginal == null) || (clusterDocs == null) || (clusterDocs[0].length == 2) || (clusterDocs[1].length == 2))
            {
                alert("Internal server error in clustering your data collection! Please re-try with a different number of clusters.");
                document.body.style.cursor = "auto";
            }
            else
            {  
                //get the cluster info from the server
                //for cluster names and words (top 5)
                clusterWords = getClusterWords();

                // create request object
                var asyncRequest = new XMLHttpRequest();

                //for documet cluster data
                asyncRequest.open( 'POST', "./"+userID+"/documentMembs", false );
                asyncRequest.send(); // send the request                      
                documentClusterData = d3.csv.parse(asyncRequest.responseText);
                documentClusterDataString = asyncRequest.responseText;

                //for list of documents of cluster
                clusterDocuments = getClusterDocuments();

                //for term cluster data
                asyncRequest.open( 'POST', "./"+userID+"/termMembs", false );
                asyncRequest.send(); // send the request                      
                termClusterData = d3.csv.parse(asyncRequest.responseText);
                termClusterDataString = asyncRequest.responseText; 

                //for the cloud terms of cluster      
                clusterCloud = getClusterCloud();

                //for list of clusters key terms                                    
                clusterKeyTerms = getClusterKeyTerms();                                      

                //for list of all terms of the collocation 
                asyncRequest.open( 'POST', "./"+userID+"/" + "out" + userID + ".Terms", false );
                asyncRequest.send(); // send the request
                // allWords = d3.csv.parse(asyncRequest.responseText);
                allWords = asyncRequest.responseText.split("\n"); // .split("\r\n")                

                //load clusters
                for (var i = 0; i < clusterWords.length; i++) { 
                  //create cluster 
                  createCluster(clusterWords[i].cluster);

                  //add terms to the cluster
                  for (var j = 0; j < clusterWords[i].words.length; j++) {        

                    x = document.getElementById(clusterWords[i].cluster);

                    $(x.getElementsByClassName("sortable")).append(
                    "<li class='ui-state-default ui-sortable-handle' onmousedown=\"wordMouseDown(event)\"><span class='terms'>"+
                    clusterWords[i].words[j].word+"</span></li>");
                  }
                }

                //get the list of documents name
                asyncRequest.open( 'POST', "./"+userID+"/fileList", false );
                asyncRequest.send(); // send the request
                documentsNameString =  asyncRequest.responseText;
                documentsName = documentsNameString.split("\n"); // .split("\r\n")

                //get document-document similarity matrix
                asyncRequest.open( 'POST', "./"+userID+"/documentDistance", false );
                asyncRequest.send(); // send the request
                documentDocumentSimilarityString = asyncRequest.responseText;
                var temp = documentDocumentSimilarityString.split("\n"); // .split("\r\n")
                for (var i = 0; i < temp.length; i++) {
                  if(temp[i].length > 0 ) {
                    documentDocumentSimilarity[i] = temp[i].split(",");
                  }
                }

                //get term-document matrix
                asyncRequest.open( 'POST', "./"+userID+"/" + "out" + userID + ".Matrix", false );
                asyncRequest.send(); // send the request
                termDocumentSimilarityString = asyncRequest.responseText; 
                var temp = termDocumentSimilarityString.split("\n");// .split("\r\n")
                for (var i = 0; i < temp.length; i++) {
                  if(temp[i].length > 0 ) {
                    termDocumentSimilarity[i] = temp[i].split(",");
                  }
                }

                //set the remove status of documents
                for (var i = 0; i < documentDocumentSimilarity.length; i++) {
                  removedDocuments[i] = false;
                }

                var date2 = new Date();
                var n2 = date2.getTime();

                // get general view graph
                generalViewGraph = getGeneralViewGraph(0.97);

                var date3 = new Date();
                var n3 = date3.getTime();

                //load General View
                generalViewLoader(0.70);

                var date4 = new Date();
                var n4 = date4.getTime();  
                time = (n4-n3)/1000;
                console.log("Time to depict graph: " + time);

                //refresh tree view
                refreshTreeView();

                //select the first cloud
                clusterClicked(clusterWords[0].cluster);               

                $( "#slider1" ).slider( "enable" );
                $( "#slider2" ).slider( "enable" );
                $( "#slider3" ).slider( "enable" );
                $("#slider1_Textbox").removeAttr("disabled");
                $("#slider2_Textbox").removeAttr("disabled");
                $("#slider3_Textbox").removeAttr("disabled");

                //selecte the first session (empty one)
                getListOfSessions("first");

                 //change the mouse icon
                document.body.style.cursor = "auto";               

                var date03 = new Date();
                var n03 = date03.getTime();
                var time1 = (n03-n4)/1000;
                var time2 = (n2-n02)/1000 + time1;
                console.log("Other running time: " + time2); 
                time = (n03-n01)/1000;
                console.log("Total running time: " + time);
            }

        },
        error: function(msg){
            document.body.style.cursor = "auto";
            
            alert("Internal Server Error: unsuccessful load data from server");
        }
    });
}

/**
 * Open Upload Page.
 */
function openUploadPage()
{
    saveLog("openUploadPage");
    window.open("./upload.php",'_blank');
}

/**
 * Open Help Page. 
 */
function openHelpPage()
{
  saveLog("openHelpPage");
  window.open("./userguide.html",'_blank');
}

/**
 * Convert the input data to appropriate format.
 * @return the cloud of the cluster (top 30)
 */
function getClusterCloud() {
  saveLog("getClusterCloud");
  var tempClusterCloud = '[';

    for (var i = 0; i < clusterKeytermsOriginal.length; i++) {

    var temp = eval(clusterKeytermsOriginal[i]);
    tempClusterCloud += '{"cluster":"cluster' + i + '", "cloud": "'

    for (var j = 0; j < temp.length; j++) {
      
      if(j ==0) {
        tempClusterCloud += temp[j] + '|' + Math.floor(getValueOfTerm("cluster"+i, temp[j])/10);
      } else {
        tempClusterCloud += '|' + temp[j] + '|' + Math.floor(getValueOfTerm("cluster"+i, temp[j])/10);
      }  

      if(j == 30) {//only top 30
        break;
      }
    }

    tempClusterCloud += '"}';
    if((i+1) < clusterKeytermsOriginal.length) {
      tempClusterCloud += ",";
    }
  }

  tempClusterCloud += ']';

  return JSON.parse(tempClusterCloud);
}

/**
 * Convert the input data to appropriate format.
 * @return the sorted list of documents of each cluster
 */
function getClusterDocuments() {
  saveLog("getClusterDocuments");
  var tempClusterDocuments = '[';

  for (var i = 0; i < clusterDocs.length; i++) {

    var temp = eval(clusterDocs[i]);
    sortDocumentByScore(temp, "cluster"+i);//sort documents by score

    tempClusterDocuments += '{"cluster":"cluster' + i + '", "docs": ['

    for (var j = 0; j < temp.length; j++) {
      
      tempClusterDocuments += '{"ID":"' + temp[j] + '"}';
      
      if( (j+1) < temp.length) {
        tempClusterDocuments += ',';
      }      
    }

    tempClusterDocuments += ']}';
    if((i+1) < clusterDocs.length) {
      tempClusterDocuments += ",";
    }
  }

  tempClusterDocuments += ']';

  return JSON.parse(tempClusterDocuments);
}

/**
 * Sort the docuemnts by its score related to each cluster
 * @param documents = list of documents
 * @param clusterName = the name of cluster
 */
function sortDocumentByScore(documents, clusterName) {

  for (var i = 0; i < documents.length; i++) {

    var data_i;
    documentClusterData.filter(function(d) { if(d.name == documents[i]) { data_i = d[clusterName];}});

    for (var j = i + 1; j < documents.length; j++) {

      var data_j;
      documentClusterData.filter(function(d) { if(d.name == documents[j]) { data_j = d[clusterName];}});

      if( parseFloat(data_i) < parseFloat(data_j)) {
        var t = documents[i];
        documents[i] = documents[j];
        documents[j] = t;
        data_i = data_j;
      }
    } 

  }
}

/**
 * Convert the input data to appropriate format.
 * @return the top all key terms of each cluster.
 */
function getClusterKeyTerms() {
  saveLog("getClusterKeyTerms");

  var tempClusterKeyTerms = '[';

  for (var i = 0; i < clusterKeytermsOriginal.length; i++) {

    var temp = eval(clusterKeytermsOriginal[i]);
    tempClusterKeyTerms += '{"cluster":"cluster' + i + '", "words": ['

    for (var j = 0; j < temp.length; j++) {
      
      tempClusterKeyTerms += '{"word":"' + temp[j] + '", "v1":'+getValueOfTerm("cluster"+i, temp[j])+'}';
      
      if( (j+1) < temp.length) {
        tempClusterKeyTerms += ',';
      }      
    }

    tempClusterKeyTerms += ']}';
    if((i+1) < clusterKeytermsOriginal.length) {
      tempClusterKeyTerms += ",";
    }
  }

  tempClusterKeyTerms += ']';

  return JSON.parse(tempClusterKeyTerms);  
}

/**
 * Get the value of a term
 * @param index = the name of the column (cluster)
 * @param term = the term
 * @return the value of the term.
 */
function getValueOfTerm(index, term) {

  //filter the data
  var data = 0;
  termClusterData.filter(function(d) {    
    if(d.name == term) 
      {
          data = d[index];
      }
  });

  return data;
}

/**
 * Convert the input data to appropriate format.
 * @return the top 5 terms of each cluster plus their names.
 */
function getClusterWords() {

  var tempClusterWords = '[';

  for (var i = 0; i < clusterKeytermsOriginal.length; i++) {

    var temp = eval(clusterKeytermsOriginal[i]);
    tempClusterWords += '{"cluster":"cluster' + i + '", "words": ['

    for (var j = 0; j < temp.length; j++) {
      
      tempClusterWords += '{"word":"' + temp[j] + '"}';

      if( j < 4) {//only top 5
        tempClusterWords += ',';
      }

      if(j == 4) {//only top 5
        break;
      }
    }

    tempClusterWords += ']}';
    if((i+1) < clusterKeytermsOriginal.length) {
      tempClusterWords += ",";
    }
  }

  tempClusterWords += ']';

  return JSON.parse(tempClusterWords);
}

/**
 * Bring it to the front of other div (clusters) 
 * @param clusterName = the name (ID) of cluster which was clicked
 */
function clusterZIndex(clusterName) {

  var clusters = document.getElementsByClassName("cluster");

  for (var i = 0; i < clusters.length; i++) {
   
    if($(clusters[i]).attr('id') == clusterName)
    {
      $(clusters[i]).css('zIndex', 1);
    }
    else {
      $(clusters[i]).css('zIndex', 0);
    }
  }
}

/**
 * Load the clicked cluster
 * @param elementID = the name (ID) of cluster which was clicked
 */
function clusterClicked(elementID) {
  saveLog("clusterClicked");

  //brign it to front of other div (clusters)
  clusterZIndex(elementID);  

  //enable drgagable
  $("#"+elementID).draggable( 'enable' );

  //show cluster nodes
  showClusterNodes(elementID);
  
  //check if the cluster is not selected before
  if(document.getElementById(elementID).style.borderColor != "rgb(254, 46, 154)") {
    var clusterColor = $("#"+elementID + " p").css("background-color");
    

   var clusterBorder = document.getElementsByClassName("cluster");

   for (i = 0; i < clusterBorder.length; i++) {
        clusterBorder[i].style.borderColor = "#cccccc";
        clusterBorder[i].style.borderWidth = "1px";
        clusterBorder[i].style.backgroundColor = "white";
    }

    $( "#"+elementID).css("background-color", "Silver");
     document.getElementById(elementID).style.borderColor = "#FE2E9A";
     document.getElementById(elementID).style.borderStyle = "outset";
     document.getElementById(elementID).style.borderWidth = "2px"; 

     //change the background color of the cluster view pannel to
     //color of the cluster 
     $("#panel2title").css("background-color", clusterColor);
     $("#panel3title").css("background-color", clusterColor);
     $("#panel4title").css("background-color", clusterColor);
     // $("#panel5title").css("background-color", clusterColor);
     $("#panel6title").css("background-color", clusterColor);
     $("#panel7title").css("background-color", clusterColor);
     $("#panel8title").css("background-color", clusterColor);
     // $("#panel9title").css("background-color", clusterColor);

    //load list of documnets of each cluster
    docListLoad(elementID); 

    //load list of key terms of each cluster
    listLoad(elementID, $( "#"+elementID + " p" ).css("background-color"));

    //load the term cloud
    loadTermCloud(elementID);
  }
}

/**
 * Paralel Cordinator Diagram
 * part of this function is obtained from D3 website
 * @param allData = the data of diagram
 * @param panelName = The pannel name
 * @param ID = the ID of a specific data in Json file
 * @param divName = the division name
 * @param color = color of line
 */
function paralelCordinator(allData, panelName, ID, divName, color) {
  saveLog("paralelCordinator+" + panelName);
  //clear the svg
  $(divName).html("");

  var line = d3.svg.line(),
    axis = d3.svg.axis().orient("left"),
    background_par_cor,
    foreground_par_cor,
    y = {},
    dragging = {},
    x;

  //filter the data
  var data = allData.filter(function(d) { 
    
    for (var i = 0; i < ID.length; i++) {
      if(d.name == ID[i]) 
      {
          return d;
      }
    }
  });  

  var number_of_clusters = d3.keys(data[0]).length - 1;
  
  var margin = {top: 10, right: 10, bottom: 20, left: 10},
    width = (($(panelName).width() / 4) * number_of_clusters) - margin.left - margin.right,
    height = $(panelName).height() - margin.bottom - $(panelName).height() / 4;

  x = d3.scale.ordinal().rangePoints([0, width], 1);

  var svg_par_cor = d3.select(divName).append("svg")
    .attr("class", "svg_par_cor")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Extract the list of dimensions and create a scale for each.  
  x.domain(dimensions = d3.keys(data[0]).filter(function(d) {
    return (d != "name" && d != "@!@@@%%@@@@%@@!!!@@") && (y[d] = d3.scale.linear()
        .domain([0, 100])
        .range([height, 0]));
  }));

   //paralelCordinator related Method
  function position(d) {
    var v = dragging[d];
    return v == null ? x(d) : v;
  }

  //paralelCordinator related Method
  function transition(g) {
    return g.transition().duration(500);
  }

    //paralelCordinator related Method
  // Returns the path for a given data point.
  function path(d) {
    return line(dimensions.map(function(p) { return [position(p), y[p](d[p])]; }));
  }

  //check if the number of clusters are more than 1
  if(dimensions.length > 1) {
  // Add grey background lines for context.
  background_par_cor = svg_par_cor.append("g")
      .attr("class", "background_par_cor")
    .selectAll("path")
    .data(data)
    .enter().append("path")
      .attr("d", path);

  // Add blue foreground lines for focus.
  foreground_par_cor = svg_par_cor.append("g")
    .attr("class", "foreground_par_cor")
    .selectAll("path")
    .data(data)
    .enter().append("path")
    .attr("d", path)
    .attr('stroke', function(d, i) { return color[d.name];});

  // Add a group element for each dimension.
  var g = svg_par_cor.selectAll(".dimension")
      .data(dimensions)
    .enter().append("g")
      .attr("class", "dimension")
      .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
      .call(d3.behavior.drag()
        .origin(function(d) { return {x: x(d)}; })
        .on("dragstart", function(d) {
          dragging[d] = x(d);
          background_par_cor.attr("visibility", "hidden");
        })
        .on("drag", function(d) {
          dragging[d] = Math.min(width, Math.max(0, d3.event.x));
          foreground_par_cor.attr("d", path);
          dimensions.sort(function(a, b) { return position(a) - position(b); });
          x.domain(dimensions);
          g.attr("transform", function(d) { return "translate(" + position(d) + ")"; })
        })
        .on("dragend", function(d) {
          delete dragging[d];
          transition(d3.select(this)).attr("transform", "translate(" + x(d) + ")");
          transition(foreground_par_cor).attr("d", path);
          background_par_cor
              .attr("d", path)
            .transition()
              .delay(500)
              .duration(0)
              .attr("visibility", null);
        }));

  // Add an axis and title.
  g.append("g")
      .attr("class", "axis_par_cor")
      .each(function(d) { d3.select(this).call(axis.scale(y[d])); })
      .append("text")
      .style("text-anchor", "middle")
      .attr("y", height + 15)
      .text(function(d) { return d; }); 
}
}

/**
 * Show the word clouds
 * @param cloudWords = words of cloud
 * @param cloudSize = size of words of cloud
 * @param divisionName = the division name
 * @param parentDivisionName = name of the parrent division
 * @param color = true: colorfull cloud
 * @param title = the title of the pannel
 */
var division;
var parentDivision;
function wordCloud(cloudWords, cloudSize, divisionName, parentDivisionName, color, title)
{
  saveLog("wordCloud");
  try {
    //change the title of pannel
    $( "#panel8title" ).text(title);

    division = divisionName;
    parentDivision = parentDivisionName;
    
    //determine the color
    if(color) {
      fill = d3.scale.category20(); // for colorful word cloud
    } else {
      fill = d3.scale.linear()
            .domain([0,1,2,3,4,5,6,10,15,20,100])
            .range(["#222", "#333", "#444", "#555", "#666", "#777", "#888", "#999", "#aaa", "#bbb", "#ccc", "#ddd"]);
    }

    //reset words
    var parrentHight = $("#"+parentDivision).height();
    var heightSVG = parrentHight - 0.25 * parrentHight;
    var widthSVG = $("#"+parentDivision).width();
    d3.layout.cloud().size([widthSVG, heightSVG]).words();
    document.getElementById(division).innerHTML = "";
    
      d3.layout.cloud().size([widthSVG, heightSVG])
         .words(cloudWords.map(
        function(d) {
         return {text: d, size: Math.log(cloudSize[d])*15};//20 + Math.random() * 30)};
        }
      ))
        .padding(0)
        .rotate(function() {return ~~(Math.random() * 1) * 90; }) //for horizontal only
                              //{return ~~(Math.random() * 5) * 30 - 60;}) // for all directions
                              //{return ~~(Math.random() * 2) * 90; }) //for horizontal and verticall
        .font("Impact")
        .fontSize(function(d) { return d.size; })
        .on("end", draw)
        .start();   
  } catch (e) {
    // TODO: handle exception
    window.alert(e.toString());
  } 
}

/**
 * Draw the cloud in the specific division
 * @param words = words of cloud
 */
function draw(words) {  
  try {
    var parrentHight = $("#"+parentDivision).height();
    var heightSVG = parrentHight - 0.25 * parrentHight;
    var widthSVG = $("#"+parentDivision).width();

    d3.select("#"+division).append("svg")
    .attr("width", widthSVG)
    .attr("height", heightSVG)
    .append("g")
    .attr("transform", "translate("+(widthSVG/2 )+","+(heightSVG/2)+")")
    .selectAll("text")
    .data(words)
    .enter().append("text")
    .transition()
    .delay(function(d,i){return i*10;})
    .duration(0)
    .ease("elastic")
    .style("font-size", function(d) { return  d.size + "px"; })//5*Math.log(d.size)
    .style("font-family", "Impact")
    .style("fill", function(d, i) { return fill(i); })
    .attr("text-anchor", "middle")
    .attr("transform", function(d) {

      // //check if the word is not out of the boundary
      // if(d.y < (-1 * (heightSVG/2 - 10))) {
      //   d.y = d.y + 10;
      // }
      // if(d.y > (heightSVG/2 - 10)) {
      //   d.y = d.y - 10;
      // }
       
      return "translate(" + [d.x , d.y] + ")rotate(" + d.rotate + ")";
    })
    .text(function(d) { return d.text; });
  } catch (e) {
    // TODO: handle exception
    window.alert(e.toString());
  }    
}

/**
 * Get the text of words of cloud
 * @param cloudWords = two dimensional array contains words and weights
 * @returns {Array} list of words
 */
function wordText(cloudWords) {
//sample
//  var words = ["data minining", "information reterival", "art", "data", "ehsan", "sherkat",
//              "human", "dataset", "database", "that", "before", "weka", "classification",
//              "cluster", "skew", "nlp", "natural language processing", "bioinformatic",
//              "statistics", "book", "processor", "pooling",
//             ];
  
  var words = new Array();
  var count = 0;
  
  for (var i = 0; i < cloudWords.length; i++) {   
    words[count] = cloudWords[i];
    count++;
    i++;
  }
     
  return words; 
}

/**
 * get the size of words of cloud
 * @param cloudWords = cloud words
 * @returns hashMap of words count
 */
function sizeOfText(cloudWords) {
  
  var hashMap = {};
    
  for (var i = 0; i < cloudWords.length; i++) {
    hashMap[cloudWords[i]] = cloudWords[i+1];
    i++;
  }
  
  return hashMap;
}

/**
 * Load the list of terms
 * @param clusterID = the ID of cluster
 * @param color = the color of barcharts
 */
function listLoad(clusterID, color) {

  saveLog("listLoad");
  
  //clear the list
   $("#barcharts").html("");
   $("#selectable").html("");
   $("#TermClusterView").html("");

  //read json file
  var json = clusterKeyTerms;
  var part3Data;// input data

  for (var i = 0; i < json.length; i++) {
    if(json[i].cluster == clusterID)
    {  
      part3Data = json[i].words;

      //create the list of terms
      for (var i = 0; i < part3Data.length; i++) {

        if(i == 0) {//load paralel cordinator view for the first word 
              $("#selectable").append("<li draggable=\"true\" ondragstart=\"dragTerm(event)\" "+
                "class='ui-widget-content ui-selectee ui-selected' onclick=\"termClick(event)\""+
                "style=\"background-color: rgb(135, 135, 135);\"><span class='termListSpan'>"+part3Data[i].word+"</span></li>");

              //highlight the first term in the document view (if exists)
              $('#doc_content').removeHighlight();//remove previous highlights
              // word = "/\b"+ word + "/\b";
              var re = new RegExp("\\b"+part3Data[i].word+"\\b", "gi");//only find the word boundary
              $("#doc_content").highlight(re, "#767676");

              //load the parallecordinator view of the first term
              var words = new Array(1);
              var colors = {};
              words[0] = part3Data[i].word;
              colors[part3Data[i].word] = "#767676";
              paralelCordinator(termClusterData, "#panel7", words, "#TermClusterView", colors);

              //higlight the docuemnts that have the first word in general view graph
              // highlightDocuments(words);
          }  
          else {
            $("#selectable").append("<li draggable=\"true\" ondragstart=\"dragTerm(event)\" "+
              "class='ui-widget-content' onclick=\"termClick(event)\"><span class='termListSpan'>"+part3Data[i].word+"</span></li>");
          }       
      }

      var bar_width = ($(panel3).width()*30/100);
      var bar_height = ($("#selectable").height()) / part3Data.length;

      var picture1 = d3.select("#barcharts").append("svg")
        .attr("width", bar_width)
        .attr("height", $("#selectable").height()); 

      //for scaling the size of data to the size of screen for the bar charts
      var linearScale = d3.scale.linear()
                            .domain([0,100])
                            .range([0, bar_width]);
  
      //The right bars
      picture1.selectAll("rect.v2")
        .data(part3Data)
        .enter()
        .append("rect")
        .attr("height", bar_height - 4)
        .attr("width", bar_width)
        .attr("y", function (d, i) {return (i * bar_height + 4);})
        .attr("x", 0)
        .style("stroke-width", "1px")
        .style("stroke", "DimGray")
        .style("fill", "none");
  
      //the left bars
      picture1.selectAll("rect.v1")
        .data(part3Data)
        .enter()
        .append("rect")
        .attr("height", bar_height - 6)
        .attr("width", function (d, i) { 
          return linearScale((d.v1 - part3Data[part3Data.length - 1].v1)*3);
        })
        .attr("y", function (d, i) {return (i * bar_height + 5);})
        .attr("x", 1)
        .style("fill", "#b8b8b9");//color); on comment for having similar color to clusters header color
        }    
      };
}

/**
 * Load the load document
 * @param index = the index of document in the listbox
 */
function loadDoc(index) {
  saveLog("loadDoc");

  //get the ID (name) of selected cluster
  var selectedClusterName = getSelectedClusterID();

  //read doc content
  var json = clusterDocuments;
  var docJson;

  for (var i = 0; i < json.length; i++) {
    if(json[i].cluster == selectedClusterName) {
      docJson = json[i].docs;

      for (var j = 0; j < docJson.length; j++) {
        if(docJson[j].ID == index)
        {
          //show the doc content in paragraph tag of pannel 2
          document.getElementById("doc_content").innerHTML = getDocumentContent(docJson[j].ID); 
          //Or
          // d3.select("#doc_content")
          //   .append("text")
          //   .text(docData);    
          //Or
          // $("#doc_content").html(docData);      

          //highlight the selceted term in the new document
          //highlight the term in the document view if exists
          $('#doc_content').removeHighlight();//remove previous highlights          

          var selectedTerms = document.getElementsByClassName("ui-widget-content ui-selectee ui-selected");
          var words = new Array(selectedTerms.length);
          var colors = {};

          for (var k = 0; k < selectedTerms.length; k++) { 
            var word = $(selectedTerms[k]).text();
            var color = $(selectedTerms[k]).css("background-color");;
            // word = "/\b"+ word + "/\b";
            var re = new RegExp("\\b"+word+"\\b", "gi");//only find the word boundary
            $("#doc_content").highlight(re, color);
          };
        }
      }   
    }     
  }
}

/**
 * Add new term to the cluster (if a term in key term list double clicked)
 */
$(document).ready(function(){
    saveLog("AddTermDoubleClickList");
    $("#selectable").dblclick(function(){ 
      
      var term = $(this.getElementsByClassName("ui-selected")).text();

      var terms = document.getElementById(getSelectedClusterID()).getElementsByClassName("sortable");

      if(!termExists($(terms).children(), term)) {//check if the term exists or not
        appendTerm(term);
      }
      else {
        alert("This cluster already have \""+term+"\"");
      }      
    });
});

/**
 * Add new term to the cluster (if a word in a documnet content double clicked)
 */
$(document).ready(function(){
   saveLog("AddTermDoubleClickDocContent");
    //if a word in a documnet content double clicked
    $("#doc_content").dblclick(function(){

      var term = getSelectedText();

      var terms = document.getElementById(getSelectedClusterID()).getElementsByClassName("sortable");

      if(!termExists($(terms).children(), term)) {
        appendTerm(term);
      }
      else {
        alert("This cluster already have \""+term+"\"");
      }      
    });
});

/**
 * append the selected term to the cluster
 * @param term = the term
 */
function appendTerm(term) {
  var x;
  x = document.getElementsByClassName("cluster");
  var i;
  for (i = 0; i < x.length; i++) {
    if(x[i].style.borderColor == "rgb(254, 46, 154)")
    {
      $(x[i].getElementsByClassName("sortable")).append(
        "<li class='ui-state-default ui-sortable-handle' onmousedown=\"wordMouseDown(event)\"><span class='terms'>"+
        term+"</span></li>");
    }
  }
}

/**
 * Get the selected text inside of document view
 * @returns the text of selected text inside the document view
 */
function getSelectedText() {
    var text = "";
    if (window.getSelection) {
        text = window.getSelection().toString();
    } else if (document.selection && document.selection.type != "Control") {
        text = document.selection.createRange().text;
    }

    return text.trim();
}

/**
 * Clearing the cluster terms
 * @param item = indicates the clearTerms buttom of which cluster was pressed
 */
function clearTerms(item) {
  // var x;
  // x = document.getElementsByClassName("cluster");
  // var i;
  // for (i = 0; i < x.length; i++) {
  //     if(x[i].style.borderColor == "rgb(254, 46, 154)")
  //     {
  //         $(x[i].getElementsByClassName("sortable")).html("");
  //     }
  // }

  // $("#"+  + " sortable").html("");
  var clusterName = item;
  var clusterElement = document.getElementById(clusterName);
  $(clusterElement.getElementsByClassName("sortable")).html("");

}

/**
 * For right click of clusters in tree view
 */
$(function(){
    $.contextMenu({
        selector: '.context-menu-one', 
        callback: function(key, options) {

            //for fetching the cluster name
            var clusterName = $(this).text();
            if($(this).children().children().text().length > 0) {
              clusterName = clusterName.substring(0,clusterName.indexOf($(this).children().children().text()));
            }

            if(key == "AddTerm") {
              addTermToCluster(clusterName);
            }
            
            if(key == "Rename") {
              clusterRename(clusterName);
            } 

            if(key == "Delete") {
              clusterDelete(clusterName);
            }

            if(key == "showNodes") {
              showClusterNodes(clusterName);
            }

            if(key == "Download") {              
              downloadCluster(clusterName);
            }

            if(key == "ChangeColor") {              
              clusterColorChange(clusterName);
            } 
        },
        items: {
            "AddTerm": {name: "AddTerm", icon: "edit"}, 
            "showNodes": {name: "showNodes", icon: "edit"},           
            "Rename": {name: "Rename", icon: "paste"},
            "Delete": {name: "Delete", icon: "delete"},
            "Download": {name: "Download", icon: "edit"},
            "ChangeColor": {name: "ChangeColor", icon: "edit"}
        }
    });
 
});

var selectedColorInPalette = "";
/**
 * Change cluster color
 * @param clusterName = name of cluster
 */
function clusterColorChange(clusterName) {
  saveLog("clusterColorChange");

  selectedColorInPalette = "";

  var statesdemo = {
  state0: {
    title: 'Select a color:',
    opacity: 0.3,
    html: function() { return colorPalette();},
    buttons: { Cancel: false, Ok: true },
    focus: 1,
    submit:function(e,v,m,f){
      if(v){        
        e.preventDefault();

        if(selectedColorInPalette == "") {
          alert("Please select a color first!");
        }
        else {
          //check if there is a cluster with this color or not
          if(colorIsSelected(selectedColorInPalette)) {
            alert("This color has been selected before!");
          }
          else {
             $.prompt.close();             
             changeClusterColor(clusterName, selectedColorInPalette);                       
          }         
        }
      }
      else {
        $.prompt.close();
      }      
     }
    }
  };

  $.prompt(statesdemo);   
}

/**
 * change the cluster color
 * @param clusterName = the name of cluster
 * @param color = new color code
 */
function changeClusterColor(clusterName, color) {
  //change the panel titles if the selected cluster should be recolored
  if(getSelectedClusterID() == clusterName) {
     $("#panel2title").css("background-color", color);
     $("#panel3title").css("background-color", color);
     $("#panel4title").css("background-color", color);
     // $("#panel5title").css("background-color", color);
     $("#panel6title").css("background-color", color);
     $("#panel7title").css("background-color", color);
     $("#panel8title").css("background-color", color);
     // $("#panel9title").css("background-color", color);

     //change color in document-cluster view
     var words = new Array(1);
     var colors = {};
     words[0] = document.getElementById('doc_select').value;
     colors[words[0]] = color;//"Blue";
     paralelCordinator(documentClusterData, "#panel6", words, "#DocumentClusterView", colors);
  }

  //change the cluster color in clusters panel
  var oldColor = $("#"+ clusterName + " p").css("background-color");
  $("#"+ clusterName + " p").css({"background-color": color});

  //change the cluster color in general view panel
  changeClusterColorInGraph(oldColor, color);
}

/**
 * Change the color of cluster in graph
 * @param oldColor = old color name
 * @param color = new color
 */
function changeClusterColorInGraph(oldColor, color) {

  //change the cluster in tooltip of node
  node.attr("data-hasqtip", function(d) {
          $(this).qtip({
            content: {
              text: '<strong>Document name:</strong><br><u class="hyperLink" onclick="showDocumentPDF($(this).text())">'+ d.na +
                    '</u><br><br><strong>List of clusters name:</strong><br>' + createListOfDocumentClustersName(d.cl, d.na) +
                    '</u><br><strong>List of top 5 terms:</strong><br>' + getListOfTermsOfDocument(d.na)
            },            
            hide: {
              fixed: true,
              delay: 700
            },
            show: {
              delay: 700
            },
            style: {
              classes: 'qtip-rounded qtip-shadow'
            },
            position: {
              my: 'center right',
              at: 'center left'
            }
          });
     });

  node2.attr("data-hasqtip", function(d) {
          $(this).qtip({
            content: {
              text: '<strong>Document name:</strong><br><u class="hyperLink" onclick="showDocumentPDF($(this).text())">'+ d.na +
                    '</u><br><br><strong>List of clusters name:</strong><br>' + createListOfDocumentClustersName(d.cl, d.na) +
                    '</u><br><strong>List of top 5 terms:</strong><br>' + getListOfTermsOfDocument(d.na)
            },            
            hide: {
              fixed: true,
              delay: 700
            },
            show: {
              delay: 700
            },
            style: {
              classes: 'qtip-rounded qtip-shadow'
            },
            position: {
              my: 'center right',
              at: 'center left'
            }
          });
     });

  //change the node color
  var nodes = document.getElementsByClassName("node");

  for (var i = 0; i < nodes.length; i++) {
    if($(nodes[i]).css("fill") == oldColor ) {
      $(nodes[i]).css({"fill": color})
    }
  }

  nodes = document.getElementsByClassName("node2");

  for (var i = 0; i < nodes.length; i++) {
    if($(nodes[i]).css("fill") == oldColor ) {
      $(nodes[i]).css({"fill": color})
    }
  }
}

/**
 * Create a color palette
 */
function colorPalette() {
  //create color seqs
  var seq = new Array();
  // seq[0] = palette('tol', 8);
  // seq[1] = palette('tol-dv', 8);
  // seq[2] = palette('tol-sq', 8);
  // seq[3] = palette('tol-rainbow', 8);
  // seq[4] = palette('cb-BrBG', 8);
  // seq[5] = palette('cb-PRGn', 8);
  // seq[6] = palette('cb-PiYG', 8);
  // seq[7] = palette('cb-PuOr', 8);
  // seq[8] = palette('cb-RdBu', 8);
  // seq[9] = palette('cb-RdYlBu', 8);
  // seq[10] = palette('cb-RdYlGn', 8);
  // seq[11] = palette('cb-Spectral', 8);
  // seq[12] = palette('cb-Paired', 8);
  // seq[13] = palette('cb-Pastel1', 8);
  // seq[14] = palette('cb-Pastel2', 8);
  // seq[15] = palette('cb-Set1', 8);
  // seq[16] = palette('cb-Set2', 8);
  // seq[17] = palette('cb-Set3', 8);
  // seq[18] = palette('sol-base', 8);
  // seq[19] = palette('sol-accent', 8);

  seq[3] = palette('cb-GnBu', 8);
  seq[14] = palette('cb-YlGnBu', 8);
  seq[16] = palette('cb-YlOrRd', 8);
  seq[0] = palette('cb-Blues', 8);  
  seq[7] = palette('cb-PuBu', 8);
  seq[2] = palette('cb-BuPu', 8);  
  seq[1] = palette('cb-BuGn', 8);
  seq[4] = palette('cb-Greens', 8);
  seq[13] = palette('cb-YlGn', 8);
  seq[8] = palette('cb-PuBuGn', 8);  
  seq[9] = palette('cb-PuRd', 8);
  seq[11] = palette('cb-RdPu', 8);
  seq[10] = palette('cb-Purples', 8);  
  seq[5] = palette('cb-OrRd', 8);  
  seq[6] = palette('cb-Oranges', 8);  
  seq[12] = palette('cb-Reds', 8);  
  seq[15] = palette('cb-YlOrBr', 8);
  
  var paletteTable = "<table style=\"width:100%\">";

  for (var j = 0; j < seq.length; j++) {
    paletteTable += "<tr>";
    for (var i = 1; i < seq[j].length; i++) {
      paletteTable += "<td class='paletteCell' onclick='selectTheColor(this)' style=\"border: 1px solid white; background: #"+seq[j][i]+"; width: 63px; height: 20px\"></td>";
    }
    paletteTable += "</tr>";
  }

  paletteTable += "</table>";
   
  return paletteTable;
}

/**
 * Get the color code of selected cel 
 * @param element = selected cel
 */
function selectTheColor(element) {
  //remove previous selected color
  $(".paletteCell").css({"border": "1px solid white"});

  //select the cell
  $(element).css({"border": "2px solid black"});

  selectedColorInPalette = rgb2hex($( element ).css( "background-color" ));
}

/**
 * Checks if the file exists in the user directory 
 * @param fileName = file name
 * @return true if exists
 */
function checkFileExists(fileName) {

  var result = false;

  $.ajax({
    type: "POST",
    url: "./cgi-bin/downloadCheck.py",
    data: { userDirectory:JSON.stringify(userDirectory), fileName:JSON.stringify(fileName)}, 
    async: false,              
    success: function( msg ) {

      var status = msg['status'];

      if (status == "yes") {        
        result =  true;
      }
    },
    error: function(msg){
      alert("Error1 in downloading the cluster!");
    }
  });

  return result;
}

/**
 * Download the selected cluster
 * @param clusterName = cluster name
 */
function downloadCluster(clusterName) {

  saveLog("downloadCluster");

  //change the mouse icon
 $("body").css("cursor", "wait");

  //get the original cluster name
  var originalName = "Cluster"+(parseInt($("#" + clusterName).index()) + 1 );

  //check if the zip file exists
  if(checkFileExists(originalName)) {
    $("body").css("cursor", "auto");
    window.open( "./"+userID+"/" + originalName + ".zip");
  }
  else if(checkFileExists("Cluster1")) {
    $("body").css("cursor", "auto");
    alert("This is a new cluster, you need to push 'Cluster' button first then you can download this cluster.");
  } 
  else {
    //create the zip file of cluster
    alert("Please be patient while the ZIP file is creating!");
    $.ajax({
      url: "./cgi-bin/documentClusters.py",
      type: "POST",
      async: false,
      cache: false,
      traditional: true,
      data: {userDirectory:userDirectory},
            success: function (msg) {
              $("body").css("cursor", "auto");
      },
      error: function(msg){
          $("body").css("cursor", "auto");
          alert("Internal Server Error: unsuccessful load data from server");  
          $("body").css("cursor", "auto");        
      }
    });

    if(checkFileExists(originalName)) {
      $("body").css("cursor", "auto");
      window.open( "./"+userID+"/" + originalName + ".zip");
    }
    else {
      $("body").css("cursor", "auto");
      alert("This is a new cluster, you need to push 'Cluster' button first then you can download this cluster.");
    }
  }  
}

/**
 * For right click of clusters files in tree view
 */
$(function(){
    $.contextMenu({
        selector: '.context-menu-three', 
        callback: function(key, options) {

          if(key == "ShowPDF") {
            showDocumentPDF($(this).text());
          }

          if(key == "ShowCloud") {
            showDocumentCloud($(this).text());
          }
            
        },
        items: {
            "ShowPDF": {name: "ShowPDF", icon: "edit"},
            "ShowCloud": {name: "ShowCloud", icon: "paste"}
        }
    });
 
});

/**
 * @param documentName = name of the document
 * Show the content of the document PDF
 */
function showDocumentPDF(documentName) {

  saveLog("showDocumentPDF");

  if(documentName != "") {
    documentName = documentName.replace(".txt", ".pdf");
    window.open( "./"+userID+"/" + documentName);
  }

}

/**
 * Removing a cluster
 * @param clusterName = the name of right clicked cluster
 */
function clusterDelete(clusterName) {

  saveLog("clusterDelete");

  if(clusterName != null) {

    if(confirm("Are you sure about deleting \"" + clusterName + "\"")) {
      $("body").css("cursor", "wait");

      var selectedCluster = getSelectedClusterID(); 

      //rename the cluster in json data files 
      //because data are temp it does not need to delele it just
      //rename it to a strange name
      renameClusterNameInJson(clusterKeyTerms, clusterName, "@!@@@%%@@@@%@@!!!@@");
      renameClusterNameInJson(clusterCloud, clusterName, "@!@@@%%@@@@%@@!!!@@");
      renameClusterNameInJson(clusterWords, clusterName, "@!@@@%%@@@@%@@!!!@@");      
      renameClusterNameInJson(clusterDocuments, clusterName, "@!@@@%%@@@@%@@!!!@@");

      //rename the cluster in csv data files
      renameClusterNameInCSV("data2", clusterName, "@!@@@%%@@@@%@@!!!@@");
      renameClusterNameInCSV("data1", clusterName, "@!@@@%%@@@@%@@!!!@@");

      //clear document view, term view, term cloud and paralel cordinator
      //if the selected cluster was removed!
      if(clusterName == selectedCluster) {
        $("#doc_content").html("");
        $("#doc_select").html("");
        $("#DocumentClusterView").html("");
        $("#barcharts").html("");
        $("#selectable").html("");
        $("#TermClusterView").html("");
        $("#panel8_2").html("");

        //change the title colors to defualt
        $("#panel2title").css("background-color", "#CCC");
        $("#panel3title").css("background-color", "#CCC");
        $("#panel4title").css("background-color", "#CCC");
        // $("#panel5title").css("background-color", "#CCC");
        $("#panel6title").css("background-color", "#CCC");
        $("#panel7title").css("background-color", "#CCC");
        $("#panel8title").css("background-color", "#CCC");
        // $("#panel9title").css("background-color", "#99CCFF");
      }

      //remove the cluster in cluster view
      $("#" + clusterName).remove();

      //remove the name of cluster in tree view
      refreshTreeView();

      //remove cluster from general view graph
      removeClusterInGraph(clusterName);   

      $("body").css("cursor", "auto");   
    }
  }
  else {
    alert("Please select the cluster first.");
    $("body").css("cursor", "auto");
  }
}

/**
 * Removing a cluster from general view graph
 * @param clusterName = the name of right clicked cluster
 */
function removeClusterInGraph(clusterName) {

  //if no cluster exists
  var number_of_clusters = $(".cluster").length;

  if(number_of_clusters == 0) {//if no cluster exists
    generalViewGraph = "";

    $("#general_view1").html("");

    $( "#slider1" ).slider( "disable" );
    $( "#slider2" ).slider( "disable" );
    $( "#slider3" ).slider( "disable" );
    $("#slider1_Textbox").attr("disabled","disabled");
    $("#slider2_Textbox").attr("disabled","disabled");
    $("#slider3_Textbox").attr("disabled","disabled");
    $("#span2").text("");
    $("#span4").text("");
  }
  else {
     //update the list of removed documents
    generalViewGraph.nodes.filter(function(n) {        
        
        var clusters = n.cl.split(",");
        var newClusters = "";

        if(clusters.length == 1 && clusters[0] == clusterName) {
          // console.log(documentsNameIndex[n.na]);
          removedDocuments[documentsName.indexOf(n.na)] = true;
        }
    })

    //update the generalViewGraph
      //get general view graph
      generalViewGraph = getGeneralViewGraph(0.97);

      //load General View
      var threshold = $("#slider1").slider("value") / 100;      

      generalViewLoader(threshold);
  }
}

/**
 * check if the list of clusters name have the corresponding cluster name
 * @clusterName = cluster name
 * @list = list of clusters name
 * @param = True: if contains
 */
function containsCluster(list, clusterName) {
  var temp = list.split(",");

  var result = false;

  for (var i = 0; i < temp.length; i++) {
    if(temp[i] == clusterName) {
      return true;
    }
  }

  return result;
}

/**
 * Renaming a cluster
 * @param oldName = the name of selected cluster
 */
function clusterRename(oldName) {
  saveLog("clusterRename");

  var clusterName = prompt("Please input the new name of \""+oldName+"\":");

  if(clusterName != null) {

    if(nameIsValid(clusterName)) {

         if(!nameExists(clusterName)) { // check if the name exists or not
      
          //rename the name of cluster in cluster view
          while(clusterName.includes(" ")) {
            clusterName = clusterName.replace(" ", "_");//for space character
          }
          
          var cluster = "#" + oldName;
          $(cluster + " p").html(clusterName);

          //rename the ID of cluster
          $(cluster).attr("onclick", "clusterClicked('"+clusterName+"')");
          $(cluster).attr("id", clusterName);          

          //rename the cluster in json data files
          renameClusterNameInJson(clusterKeyTerms, oldName, clusterName);
          renameClusterNameInJson(clusterCloud, oldName, clusterName);
          renameClusterNameInJson(clusterWords, oldName, clusterName);      
          renameClusterNameInJson(clusterDocuments, oldName, clusterName);

          //rename the cluster in csv data files
          renameClusterNameInCSV("data2", oldName, clusterName);
          renameClusterNameInCSV("data1", oldName, clusterName);

          //rename the name of cluster in tree view
          refreshTreeView();

          //rename the name of cluster in paralel cordinator views
          if(getSelectedClusterID() != "") {//check if the cluster is selected or not

            if(!isEmpty(clusterName)) {//check if the cluster is empty or not

              var doc = new Array(1);
              var color = {};
              doc[0] = document.getElementById('doc_select').value;
              color[doc[0]] = $( "#"+clusterName + " p" ).css("background-color");//"Blue";

              paralelCordinator(documentClusterData, "#panel6", doc, "#DocumentClusterView", color);

              var selectedTerms = document.getElementsByClassName("ui-widget-content ui-selectee ui-selected");
              var words = new Array(selectedTerms.length);
              var colors = {};

              for (var i = 0; i < selectedTerms.length; i++) {          
                words[i] = $(selectedTerms[i]).text();
                colors[$(selectedTerms[i]).text()] = $(selectedTerms[i]).css("background-color");
              };

              //load the parallecordinator view of the term
              paralelCordinator(termClusterData, "#panel7", words, "#TermClusterView", colors);
            } 
          }

          //rename the name of the cluster in its tooltip
          clusterToolTip(clusterName);

          //rename the name of cluster in general view graph
          renameClusterNameInGraph(oldName, clusterName);

        } else { //if name exsits
            alert("This name has already been assigned to a cluster!");
        }
    } else {//if name is invalid
      alert("The name should start with [A-Za-z].\r\n"+
       "[0-9] and '_' and '-' and [A-Za-z] are allowed for other characters.");
    } 
  }   
}

/**
 * Rename Cluster Name in Graph
 * @param oldName = old name of cluster
 * @param oldName = new name of cluster
 */
function renameClusterNameInGraph(oldName, newName) {
  
  var names = $(".clusterNameInGraph");

  //rename the cluster name in tooltip of node
  node.attr("data-hasqtip", function(d) {
          $(this).qtip({
            content: {
              text: '<strong>Document name:</strong><br><u class="hyperLink" onclick="showDocumentPDF($(this).text())">'+ d.na +
                    '</u><br><br><strong>List of clusters name:</strong><br>' 
                    + createListOfDocumentClustersName(renameCLusterNameInToolTip(d.cl, oldName, newName), d.na)                    
            },            
            hide: {
              fixed: true,
              delay: 700
            },
            show: {
              delay: 700
            },
            style: {
              classes: 'qtip-rounded qtip-shadow'
            },
            position: {
              my: 'center right',
              at: 'center left'
            }
          });
     });

  node2.attr("data-hasqtip", function(d) {
          $(this).qtip({
            content: {
              text: '<strong>Document name:</strong><br><u class="hyperLink" onclick="showDocumentPDF($(this).text())">'+ d.na +
                    '</u><br><br><strong>List of clusters name:</strong><br>' 
                    + createListOfDocumentClustersName(renameCLusterNameInToolTip(d.cl, oldName, newName), d.na)                    
            },            
            hide: {
              fixed: true,
              delay: 700
            },
            show: {
              delay: 700
            },
            style: {
              classes: 'qtip-rounded qtip-shadow'
            },
            position: {
              my: 'center right',
              at: 'center left'
            }
          });
     });

  //rename the cluster name in generalViewGraph
  for (var i = 0; i < generalViewGraph.nodes.length; i++) {
    var newClusters = "";
    var clusters = generalViewGraph.nodes[i].cl.split(",");

    for (var j = 0; j < clusters.length; j++) {
      var temp = "";
      if(clusters[j] == oldName) {      
        temp = newName;
      } else {
        temp = clusters[j];
      }

      if(newClusters == "") {
        newClusters = temp;
      }
      else {
        newClusters += ("," + temp);
      }
    }

    generalViewGraph.nodes[i].cl = newClusters;
  }

  for (var i = 0; i < generalViewGraph2.nodes.length; i++) {
    var newClusters = "";
    var clusters = generalViewGraph2.nodes[i].cl.split(",");

    for (var j = 0; j < clusters.length; j++) {
      var temp = "";
      if(clusters[j] == oldName) {      
        temp = newName;
      } else {
        temp = clusters[j];
      }

      if(newClusters == "") {
        newClusters = temp;
      }
      else {
        newClusters += ("," + temp);
      }
    }

    generalViewGraph2.nodes[i].cl = newClusters;
  }
}

/**
 * rename the name of cluster in tooltip of nodes in general view
 * @param clusterListNames = the old list of cluster names
 * @param oldName = old name of cluster
 * @param newName = new name of cluster
 * @return newClusters = new list of document cluster names
 */
function renameCLusterNameInToolTip(clusterListNames, oldName, newName) {
  var clusters = clusterListNames.split(",");

  var newClusters = "";

  for (var i = 0; i < clusters.length; i++) {
    var temp = "";
    if(clusters[i] == oldName) {      
      temp = newName;
    } else {
      temp = clusters[i];
    }

    if(newClusters == "") {
      newClusters = temp;
    }
    else {
      newClusters += ("," + temp);
    }
  }

  return newClusters;
}

/**
 * Check if the cluste is empty or not
 * @param clusterName = the name of cluster to be checked
 * @return = true if empty
 */
function isEmpty(clusterName) {
  var empty = true;

  for (var i = 0; i < clusterWords.length; i++) {
    if(clusterWords[i].cluster == clusterName) {      
      return false;
      break;
    }
  };

  return empty;
}

/**
 * Rename Cluster Name In Json file
 * @param jsonFile = the name of a json file
 * @param oldName = the old name of cluster
 * @param newName = the new name of cluster
 */
function renameClusterNameInJson(jsonFile, oldName, newName) {

  for (var i = 0; i < jsonFile.length; i++) {
    if(jsonFile[i].cluster == oldName) {
      jsonFile[i].cluster = newName;
    }
  }
}

/**
 * Rename cluster name in CSV file
 * @param data = the name of a csv file
 * @param oldName = the old name of cluster
 * @param newName = the new name of cluster
 */
function renameClusterNameInCSV(data, oldName, newName) {

  if(data == "data1") {//for documnet cluster data
    var header = documentClusterDataString.substring(0, documentClusterDataString.indexOf("\n"));
    var tail = documentClusterDataString.substring(documentClusterDataString.indexOf("\n")+1);
    header = header.replace(","+oldName,","+newName);

    documentClusterDataString = header + "\n" + tail;
    // alert(csvFileString);
    documentClusterData = d3.csv.parse(documentClusterDataString);

  } else if(data == "data2") {//for term cluster data
    var header = termClusterDataString.substring(0, termClusterDataString.indexOf("\n"));
    var tail = termClusterDataString.substring(termClusterDataString.indexOf("\n")+1);
    header = header.replace(","+oldName,","+newName);
  
    termClusterDataString = header + "\n" + tail;
    // alert(csvFileString);
    termClusterData = d3.csv.parse(termClusterDataString);
  }  
}

/**
 * Get Selected Cluster ID
 * @return the ID
 */
function getSelectedClusterID() {

   var clusters;
   var ID = "";
   clusters = document.getElementsByClassName("cluster");
   var i;
   for (i = 0; i < clusters.length; i++) {
   //get the ID of seleceted cluster by its border color
    if(clusters[i].style.borderColor == "rgb(254, 46, 154)")
    {
      ID = $(clusters[i]).attr("ID");
      break;
    }
   }

   return ID;
}

/**
 * For adding new cluster context menu
 */
$(function(){
    $.contextMenu({
        selector: '.context-menu-zero', 
        callback: function(key, options) {

            if(key == "Add") {
              addCluster();
            }                                
        },
        items: {
            "Add": {name: "Add Cluster", icon: "edit"}
        }
    }); 
});

/**
 * Adding new empty cluster
 */
function addCluster() {
  saveLog("addCluster");

  var clusterName = prompt("Please input the name of cluster:");

  if(clusterName != null && clusterName != "") {
    if(nameIsValid(clusterName)) {//check if the name is valid
      //check if the name is not already been choosen.
      if(!nameExists(clusterName)) {

        clusterName = clusterName.replace(" ", "_");//for space character

        createCluster(clusterName);
        refreshTreeView();

      } else { //if name exsits
        alert("This name has already been assigned to a cluster!");
      }
    } else {//if name is invalid
      alert("The name should start with [A-Za-z].\r\n"+
       "[0-9] and '_' and '-' and [A-Za-z] are allowed for other characters.");
    }
   }
}

/**
 * Set top position of cluster (4 cluster in each row)
 */
function setTop() {
    var clusters = document.getElementsByClassName("cluster");
    var lengthOfCluster = Math.floor((clusters.length - 1) / 4);

    // return lengthOfCluster * 260 + 10;
    // return lengthOfCluster * ($('.cluster').height() + 10 ) + 10;
    return lengthOfCluster * (52) + 2;
}

/**
 * Set left position of cluster (4 cluster in each row)
 */
function setleft() {
  var clusters = document.getElementsByClassName("cluster");

  return ((clusters.length - 1) % 4 + 1) * 0.12 + ((clusters.length - 1) % 4) * 24.5 + 0.5;
}

/**
 * Create cluster
 * @param clusterName = the cluster name
 */
function createCluster(clusterName) {
    //add new cluster
    var clusterPannel = document.getElementById("panel4_1");

    $(clusterPannel).append(
      "<div class=\"cluster context-menu-two box menu-1 \" id=\""+clusterName+"\" onclick=\"clusterClicked('"+clusterName+"')\""+
      "ondrop=\"drop(event)\" ondragover=\"allowDrop(event)\" ondrag=\"clusterDrag(this)\">"+
      "<p class=\"clusterTitle\" onclick = \"showClusterNodes($(this).text().trim())\"> "+clusterName+"</p>"+
      "<div class=\"clusterwordlist\">"+
      "<ul id=\"Terms"+clusterName+"\" class=\"sortable ui-sortable\">"+                 
      "</ul>"+
      "</div>"+
      "</div>"       
    );

    //for styling the cluster
    $( "#"+clusterName).css("background-color", "White");
    document.getElementById(clusterName).style.borderColor = "#cccccc";
    document.getElementById(clusterName).style.borderStyle = "outset";
    document.getElementById(clusterName).style.borderWidth = "1px";
    $( "#"+clusterName + " p" ).css("background-color", setBackGroundColor());
    $( "#"+clusterName ).css("top", setTop() + "%");
    $( "#"+clusterName ).css("left", setleft() + "%");

    //for draging new cluster 
    $(function() {
      var draggableDiv = $( "#"+clusterName ).draggable({
        obstacle: "#panel4title, #button12, #spliter1", 
        distance: 10,
        containment: "#panel4",
        opacity: 0.55,
        preventCollision: true,
        scroll: true,
      });
      // disable the dragable for the word list 
      // in order to be selectable
      $("#Terms"+clusterName, draggableDiv).mousedown(function(ev) {
        draggableDiv.draggable('disable');
      }).mouseup(function(ev) {
      draggableDiv.draggable('enable');
      });
    });

    //for moving terms inside new cluster
    $(function() {
      $( ".sortable" ).sortable({ 
        axis: 'y',
        cancel: ".sortable li span"
      });
      $( ".sortable" ).disableSelection();
    });

    //for cluster tooltip
    clusterToolTip(clusterName); 
}

/**
 * For cluster tooltip
 * @param clusterName = cluster ID
 */
function clusterToolTip(clusterName) {
  $("#"+clusterName).qtip({ 
    // Content
    content: { 
      title: "Cluster Name: " + clusterName,
      text: "Number of Documents: " + numberOfDocumnets(clusterName)
    },

    // Positioning
    position: {
      at: 'bottom center',
      my: 'top center',
    },

    // Styles
    style: {
      classes: 'qtip-rounded qtip-shadow'
    }
  })
}

/**
 * Get the number of documents of the cluster
 * @param clusterName = cluster ID
 * @return docNumber = number of documents of the cluster
 */
function numberOfDocumnets(clusterName) {
  var docNumber = 0;

  for (var i = 0; i < clusterDocuments.length; i++) {
    if(clusterDocuments[i].cluster == clusterName) {
      docNumber = clusterDocuments[i].docs.length;
    }
  };
  
  return docNumber;
}

/**
 * When a cluster is draging 
 * @param clusterID = cluster ID
 */
function clusterDrag(clusterID) {
  saveLog("clusterDrag");
  //enable the dragablity of the cluster
  $(clusterID).draggable( 'enable' ); 

  //brign it to front of other div (clusters)
  clusterZIndex($(clusterID).attr('id'));
}

/**
 * When a panel is draging 
 * @param panelID = panel ID
 */
function panelDrag(panelID) {
  saveLog("panelDrag");

  $("#panel2").css('zIndex', 0);
  $("#panel3").css('zIndex', 0);
  $("#panel4").css('zIndex', 0);
  $("#panel5").css('zIndex', 0);
  $("#panel6").css('zIndex', 0);
  $("#panel7").css('zIndex', 0);
  $("#panel8").css('zIndex', 0);
  $("#panel9").css('zIndex', 0);

  $("#"+$(panelID).attr('id')).css('zIndex', 1);
  $(panelID).draggable('enable');

}

/**
 * allowDrop for adding term to cluster
 * @param event = the event
 */
function allowDrop(event) {
  event.preventDefault();

  return false;
}

function dragTerm(event) {
  event.dataTransfer.setData('text', $(event.target).text());
}

/**
 * Drop for adding term to cluster
 * @param event = the event
 */
function drop(event) {
  saveLog("drop");

    event.preventDefault();

    var term = event.dataTransfer.getData("text").trim();

    if(term == "") {//for draging term from term list
      term = event.dataTransfer.getData("text/html").trim();
    }

    var clusterName;
    var className = $(event.target).attr('class');

    if(className == "clusterTitle") {

      clusterName = $(event.target).parent().attr('id');

    } else if (className == "clusterwordlist") {

      clusterName = $(event.target).parent().attr('id');

    } else if (className == "cluster context-menu-two box menu-1  ui-draggable") {

      clusterName = $(event.target).attr('id');

    } else if (className == "terms") {

      clusterName = $(event.target).parent().parent().parent().parent().attr('id');

    } else if (className == "ui-state-default ui-sortable-handle") {

      clusterName = $(event.target).parent().parent().parent().attr('id'); 

    }

    if(clusterName != null) {
      var terms = document.getElementById(clusterName).getElementsByClassName("sortable");

      if(!termExists($(terms).children(), term)) {

          var cluster = document.getElementById(clusterName);

          $(cluster.getElementsByClassName("sortable")).append(
            "<li class='ui-state-default ui-sortable-handle' onmousedown=\"wordMouseDown(event)\"><span class='terms'>"+
            term+"</span></li>");
      }
      else {
          alert("This cluster already have \""+term+"\"");
      }
    }

  return false;
}

function wordMouseDown(event) {

   //select term content
   selectTermContent(event.target);

   //highlight the term in key terms and the document content              
   termInsideClusterClicked($(event.target).text());
}

/**
 * Refresh tree view
 */
function refreshTreeView() {

  var clusters = document.getElementsByClassName("cluster");
  var treeHtml = "<ul>"+
                "<li data-jstree='{ \"opened\" : true }' class=\"context-menu-zero box menu-1\">Clusters"+
                "<ul id=\"new_cluster_tree_view\">";

  for (var i = 0; i < clusters.length; i++) {
    treeHtml = treeHtml + "<li onclick = \"clusterClicked('"+$(clusters[i]).attr('id')+"')\""+
    " class=\"context-menu-one box menu-1\">"+$(clusters[i]).attr('id')+    
    getFiles($(clusters[i]).attr('id'))
    + "</li>";
  }  

  treeHtml = treeHtml + "</ul>"+"</li>";

  $.jstree.destroy();
  // $("#cluster_tree_view").html("");
  $("#cluster_tree_view").append(treeHtml);
  $("#cluster_tree_view").jstree();
}

/**
 * Get the list of files of the cluster
 * @param clusterName = get the name of the cluster
 * @return list of files of a cluster
 */
function getFiles(clusterName) { 

  var files = "";

  for (var i = 0; i < clusterDocuments.length; i++) {
    if(clusterDocuments[i].cluster == clusterName) {

      files += "<ul>";
      for (var j = 0; j < clusterDocuments[i].docs.length; j++) {
        files += "<li data-jstree='{\"icon\":\"img/pdf.gif\"}' onclick = \"fileClicked(this)\" class=\"context-menu-three box menu-1\">"
        +clusterDocuments[i].docs[j].ID+"</li>";
      }  
      files += "</ul>"; 
    }
  }

  return files;
}

/**
 * Show the content of the selected file in the cluster tree view
 * @param fileName = the name of selected file
 */
function fileClicked(fileName) {
  document.getElementById("doc_content").innerHTML = "";
  loadDoc($(fileName).text());

  highlightDocGeneralView($(fileName).text());

  //show the paralel cordinator view
  var words = new Array(1);
  var colors = {};
  words[0] = $(fileName).text();
  colors[words[0]] = $( "#"+getSelectedClusterID() + " p" ).css("background-color");//"Blue";
  paralelCordinator(documentClusterData, "#panel6", words, "#DocumentClusterView", colors);

  //change the selected list of documents  
  var docSelect = document.getElementById('doc_select');
  for(var i = 0; i < docSelect.options.length; i++) {
      if(docSelect.options[i].innerHTML == $(fileName).text()) {
          docSelect.selectedIndex = i;
          break;
      }
  }
}

/**
 * Check if the color is selected or not
 * @param color = color
 * @return hex value
 */
function colorIsSelected(color) {
  var result = false;

  var clusters = document.getElementsByClassName("clusterTitle");

  for (var i = 0; i < clusters.length; i++) {

    if(rgb2hex($(clusters[i]).css("background-color")) == color) {
      return true;
    }
  }

  return result;
}

/**
 * Convert rgb to hex 
 * @param rgb = rgb
 * @return hex value
 */
function rgb2hex(rgb){
  if(rgb != "rgba(0, 0, 0, 0)" && //for null color in chorme and opera
    rgb != "transparent" ) {//for null color in IE and Mozilla
    rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
  }
  else {
    return "#";//for null color
  } 
}

/**
 * Return hex value of a digit
 * @param x = a digit
 * @return hex value
 */
function hex(x) {
  var hexDigits = '0123456789ABCDEF'.split('');
  return isNaN(x) ? "00" : hexDigits[(x - x % 16) / 16] + hexDigits[x % 16];
}

/**
 * Choose the background color of clusters
 * @return a color code
 */
function setBackGroundColor() {
  //these are the constant colors of the first 28 clusters
  var colors = ["#2CA25F", "#55E8C9", "#9E1CDA", "#D95F02", 
                "#995500", "#A19404", "#EEADAA", "#002395", 
                "#FFA500", "#FFA500", "#FFCC00", "#0033FF", 
                "#666699", "#BBBBBB", "#ED92FD"];


  // var colors = ["#138808", "#1E90FF", "#FFA500", "#FF9999", 
  //               "#B9632C", "#2F4F4F", "#BDB76B", "#002395", 
  //               "#AFEEEE", "#FFA500", "#FFE4E1", "#602F6B",  
  //               "#8A2BE2", "#00FF00", "#4B0082", "#DDA0DD", 
  //               "#808000", "#FFA07A", "#2F4F4F", "#FF8C00", 
  //               "#00FA9A", "#006400", "#00FFFF", "#556B2F", 
  //               "#0000CD", "#000080", "#FFDAB9", "#FF00FF", 
  //               "#BA55D3", "#FAEBD7"];

  // var colors = ["#00FFFF", "#0000FF", "#A52A2A", "#FF1493", 
  //               "#FF00FF", "#808080", "#FFFF00", "#8A2BE2", 
  //               "#008000", "#FFFACD", "#ADD8E6", "#32CD32", 
  //               "#00FF00", "#191970", "#808000", "#FFA500", 
  //               "#800080", "#FA8072", "#D2B48C", "#008080", 
  //               "#EE82EE"];

  for (var i = 0; i < colors.length; i++) {

    if(!colorIsSelected(colors[i])) {
      return colors[i];
    }
  }

  //if the number of clusters are more than the defual colors
  //choose a random color
  var extraColor = randomColor();
  while(colorIsSelected(extraColor)) {
    extraColor = randomColor();
  }

  return extraColor; 
}

/**
 * Choose a random color
 * @return a color code
 */
function randomColor() {
  var letters = '0123456789ABCDEF'.split('');
  var first = '56789ABCDEF'.split('');
  var color = '#';
  for (var i = 0; i < 6; i++ ) {
    if(i == 0) {
      color += first[Math.floor(Math.random() * 9)];
    } else {
      color += letters[Math.floor(Math.random() * 16)];
    } 
  }

  return color;
}

/**
 * Check if the name of cluster exists or not
 * @param name = the name of cluster
 */
function nameExists(name) {
    var clusters = document.getElementsByClassName("cluster");

    for (var i = 0; i < clusters.length; i++) {
      if($(clusters[i]).attr('id') == name) {
        return true;
      }
    };

    return false;
}

/**
 * For right click of clusters
 */
$(function(){
    $.contextMenu({
        selector: '.context-menu-two', 
        callback: function(key, options) {

            saveLog("clusterRightClick");
            
            if(key == "AddTerm") {
              addTermToCluster($(this).closest('div').attr('id'));
            }

            if(key == "RenameCluster") {
              clusterRename($(this).closest('div').attr('id'));
            } 

            if(key == "DeleteCluster") {
              clusterDelete($(this).closest('div').attr('id'));
            }

            if (key == "ClearTerms") {
              clearTerms($(this).closest('div').attr('id'));
            }

            if(key == "showNodes") {
              showClusterNodes($(this).closest('div').attr('id'));
            }

            if(key == "Download") {
              downloadCluster($(this).closest('div').attr('id'));
            }

            if(key == "ChangeColor") {              
              clusterColorChange($(this).closest('div').attr('id'));
            }
        },
        items: {
            "AddTerm": {name: "AddTerm", icon: "edit"},
            "showNodes": {name: "showNodes", icon: "edit"},
            "RenameCluster": {name: "RenameCluster", icon: "paste"},
            "DeleteCluster": {name: "DeleteCluster", icon: "delete"},
            "ClearTerms": {name: "ClearTerms", icon: "delete"},
            "Download": {name: "Download", icon: "edit"},
            "ChangeColor": {name: "ChangeColor", icon: "edit"}
        }
    });
});

/**
 * Add term to cluster
 * @param clusterName = the name of clicked cluster
 */
function addTermToCluster(clusterName) {
    saveLog("addTermToCluster");

    var term = prompt("Add new term:");

    if(term != null) {

      $('#selectable').selectable({ 
        cancel: '.ui-selected' 
      });

      // check if the term exists or not
      var terms = document.getElementById(clusterName).getElementsByClassName("sortable");

      if(!termExists($(terms).children(), term)) {
        $(terms).append(
            "<li class='ui-state-default ui-sortable-handle' onmousedown=\"wordMouseDown(event)\"><span class='terms'>"+term+"</span></li>");
      }
      else {
        alert("This cluster already have \""+term+"\"");
      }
            
    }
}

/**
 * Checks if the term exists in the selected cluster or not
 * @param clusterTerms = the list of terms of selected cluster
 * @param term = the term
 * @return true: if exists, false: in not exists
 */
function termExists(clusterTerms, term) {

  var exists = false;

  for (var i = 0; i < clusterTerms.length; i++) {
    if($(clusterTerms[i]).text() == term) {
      exists = true;
      break;
    }
  }

  return exists;
}

/**
 * load list of documets of selected cluster
 * @param clusterName = the name of cluster
 */
function docListLoad(clusterName) {

  $("#doc_content").html("");
  $("#doc_select").html("");
  $("#DocumentClusterView").html("");
  
  var json = clusterDocuments;
  var Data;// input data

  for (var i = 0; i < json.length; i++) {
    if(json[i].cluster == clusterName)
    {

      Data = json[i].docs;

      //clear the previes list
      $("#doc_select").html("");
      // $("#doc_content").html("");

      for (var j = 0; j < Data.length; j++) {
        $("#doc_select").append("<option value=\""+Data[j].ID+"\" >"+Data[j].ID+"</option>");        
        
        //load the first document if it is for the first time
        if(j == 0) {
            $("#doc_content").html(getDocumentContent(Data[j].ID));

            //show the parallel cordinator view of the first document
            var words = new Array(1);
            var colors = {};
            words[0] = Data[j].ID;
            colors[words[0]] = $( "#"+clusterName + " p" ).css("background-color");//"Blue";
            paralelCordinator(documentClusterData, "#panel6", words, "#DocumentClusterView", colors);

            //higlight the first document in general view
            highlightDocGeneralView(Data[j].ID);
        }
      };
    }
  }

  //change the color of selected doc to red
  $("#doc_select").css('color','red');
  var options = document.getElementById('doc_select').children;
  var selected = $("#doc_select").val();
  for(var k=0; k < options.length; k++){
    if(options[k].value == selected)
      options[k].style.color = 'red';               
    else
      options[k].style.color = 'black';
  }

}

/**
 * get the content of the documnet 
 * @param docName = the name of the document
 * @return the content of the document
 */
function getDocumentContent(docName) {
  var content = "";

  // create request object
  var asyncRequest = new XMLHttpRequest(); 

  //for documet cluster data
  asyncRequest.open( 'POST', "./"+userID+"/"+docName, false );
  asyncRequest.send(); // send the request
  content = asyncRequest.responseText;

  return content;
}

/**
 * On each term click in term list
 */
function termClick(event) {
    saveLog("termClick");

    //highlight the term in the document view, if exists        
    var selectedTerms = document.getElementsByClassName("ui-widget-content ui-selectee ui-selected");          
        
    var color = setTermColor(event.target);
        
    $('#doc_content').removeHighlight();//remove previous highlights

    var words = new Array(selectedTerms.length);
    var colors = {};

    for (var i = 0; i < selectedTerms.length; i++) {          
        var wordRegEx = new RegExp("\\b"+$(selectedTerms[i]).text()+"\\b", "gi");//only find the word boundary       
        words[i] = $(selectedTerms[i]).text();
        color = $(selectedTerms[i]).css("background-color");
        colors[$(selectedTerms[i]).text()] = color;
        $("#doc_content").highlight(wordRegEx, color);
    };

    //load the paralelcordinator view of the term
    if(selectedTerms.length > 0) {
      paralelCordinator(termClusterData, "#panel7", words, "#TermClusterView", colors);
    }

    $("#selectable").selectable({
    selected: function (event, ui) {
        // if(event.shiftKey){
        //   alert("");
        // }       
        
        //highlight the term in the document view if exists        
        var selectedTerms = document.getElementsByClassName("ui-widget-content ui-selectee ui-selected");          
        
        var color = setTermColor(ui.selected);
        
        $('#doc_content').removeHighlight();//remove previous highlights

        var words = new Array(selectedTerms.length);
        var colors = {};

        for (var i = 0; i < selectedTerms.length; i++) {          
            var wordRegEx = new RegExp("\\b"+$(selectedTerms[i]).text()+"\\b", "gi");//only find the word boundary       
            words[i] = $(selectedTerms[i]).text();
            color = $(selectedTerms[i]).css("background-color");
            colors[$(selectedTerms[i]).text()] = color;
            $("#doc_content").highlight(wordRegEx, color);
        };

        //load the parallecordinator view of the term
        if(selectedTerms.length > 0) {
          paralelCordinator(termClusterData, "#panel7", words, "#TermClusterView", colors);
        }
      },      
    });

  //remove the color of span
  $(".termListSpan").removeAttr("style");

  //highlight documents that have this term, inside general view graph
  highlightDocuments(words);
}

/**
 * Highlight documents that have selected terms
 * @param words = the selected words
 */
var docsHighlight = new Array();//Highlighted docs
function highlightDocuments(words) {

  saveLog("highlightDocuments");

  docsHighlight = new Array();  

  for (var i = 0; i < words.length; i++) {    
    for (var j = 0; j < termDocumentSimilarity.length; j++) {
      var docScore = 0.0;
      docScore = termDocumentSimilarity[j][allWords.indexOf(words[i])];
      if(docScore > 0) {
        docsHighlight[documentsName[j]] = true;    
      }
    }    
  }

  //change the stroke of corresponding nodes (docs) in general view graph
  // node.style("stroke", function(o) {
  //   if(o.na == $(doc_select).val())     
  //   {
  //     return "red";      
  //   }
  //   else if(docsHighlight[o.na]) {
  //     return "blue";
  //   }
  //   else {          
  //     return "#ccc";
  //   }
  // })

  // node.style("stroke-width", function(o) {
  //   if(docsHighlight[o.na] || o.na == $(doc_select).val()) {
  //     return "2px";
  //   }
  //   else {          
  //     return "0.5px";
  //   }   
  // })

  //change the opacity of corresponding nodes (docs) and links in general view graph
  node.style("opacity", function(o) {
          return docsHighlight[o.na] ? 1 : highlight_trans;
  });

  link.style("opacity", function(o) {
      return docsHighlight[o.source.na] && docsHighlight[o.target.na] ? 1 : 0;
  });

  node2.style("opacity", function(o) {
          return docsHighlight[o.na] ? 1 : highlight_trans;
  });

  link2.style("opacity", function(o) {
      return docsHighlight[o.source.na] && docsHighlight[o.target.na] ? 1 : 0;
  });
}

/**
 * Set the background color of term
 * @param element = the selected term
 * @return a color code
 */
function setTermColor(element) {
  
  var wordList = document.getElementsByClassName("ui-widget-content ui-selectee");

  for (var i = 0; i < wordList.length; i++) {
    if($(wordList[i]).attr("class") != "ui-widget-content ui-selectee ui-selected") 
    {//if it is not selected
      $(wordList[i]).removeAttr("style");
    }
  }

  var color = selectBackGroundColorOfTerm($(element).index());

  $(element).css( "background-color", color );

  return color;
}

/**
 * Choose the background color of term
 * @param termIndex = the index of term in list of document terms
 * @return a color code
 */
function selectBackGroundColorOfTerm(termIndex) {
  //these are the constant colors of the first 30 selected terms 
  // var colors = ["#F39814", "#9ACD32", "#FFFF00", "#EE82EE", "#00FF7F",
  //               "#87CEEB", "#006400", "#FA8072", "#FF0000", "#DDA0DD",
  //               "#FFC0CB", "#7B68EE", "#FFE4E1", "#48D1CC", "#00FF00",
  //               "#E6E6FA", "#778899", "#CD5C5C", "#DAA520", "#FF69B4",
  //               "#FFD700", "#FF1493", "#00BFFF", "#FA8072", "#FF8C00",
  //               "#00FFFF", "#7FFFD4", "#FF6347", "#F0F8FF", "#9ACD32"];

  var colors = ["#767676", "#878787", "#989898", "#A9A9A9", "#B2B2B2", "#BABABA", "#C3C3C3", "#CBCBCB", "#D4D4D4", "#DDDDDD", "#E5E5E5",
                "#3D3D1F", "#474724", "#525229", "#5C5C2E", "#666633", "#757547", "#85855C", "#949470", "#A3A385", "#B2B299", "#C2C2AD",
                "#472400", "#522900", "#5C2E00", "#663300", "#754719", "#855C33", "#94704D", "#A38566", "#B29980", "#C2AD99", "#D1C2B2",
                "#995C00", "#B26B00", "#CC7A00", "#E68A00", "#FF9900", "#FFA319", "#FFAD33", "#FFB84D", "#FFC266", "#FFCC80", "#FFD699",
                "#300000", "#400000", "#480000", "#500000", "#580000", "#680000", "#700000", "#780000", "#800000", "#880000", "#900000"];

  var selectedTerms = document.getElementsByClassName("ui-widget-content ui-selectee ui-selected");
  if(selectedTerms.length > colors.length) {
    //if the number of clusters are more than the default colors
    //choose a random color
    var extraColor = randomColor();
    while(colorIsSelected(extraColor)) 
    {
      extraColor = randomColor();
    }

    return extraColor; 
  }

  if(selectedTerms.length == 1) {
    return colors[0];
  }

  if(termIndex <= colors.length ) {
    return colors[termIndex];
  }
  else {
    termIndex = termIndex - (Math.floor(termIndex / colors.length)) * colors.length;

    var termColor = colors[termIndex];
    var index = termIndex;
    while(colorIsSelected(termColor)) 
    {
      index++;
      if(index > (colors.length - 1)) {
        index = 0;
      }
      termColor = colors[index];
    }

    return termColor;
  }
    
}

/**
 * Check if the color is selected or not
 * @param color = color
 * @return hex value
 */
function colorIsSelectedForTerm(color) {
  var result = false;

  var wordList = document.getElementsByClassName("ui-widget-content ui-selectee ui-selected");

  for (var i = 0; i < wordList.length; i++) {

    if(rgb2hex($(wordList[i]).css("background-color")) == color) {
      return true;
    }
  }

  return result;
}

/**
 * load term cloud
 * @param elementID = the ID of cluster
 */
function loadTermCloud(elementID) {

  saveLog("loadTermCloud");

  //clear the cloud
  $("#panel8_2").html("");

  //read json file  
  var json = clusterCloud;
    for (var i = 0; i < json.length; i++) {
      if(json[i].cluster == elementID) {

        var words = json[i].cloud.split("|");
        var x = document.getElementById("cloudColor");
        var title = "Term Cloud (selected cluster)";
        wordCloud(wordText(words), sizeOfText(words), "panel8_2", "panel8", x.checked, title);
      }
   }  
}

/**
 * for auto complete of search bar
 */
$(function() {     
    saveLog("search");

    $( "#textbox1" ).autocomplete({
      source: function(request,response) {
        response($.map(getWord(request.term), function (item) {
             return { label: item, value: item };
        }))
        },
      select: function( event, ui ) {
        //check if the term exists or not
        
        if(getSelectedClusterID() != "") {//check if the cluster is checked
            var term = ui.item.value;

            var terms = document.getElementById(getSelectedClusterID()).getElementsByClassName("sortable");

            var ok = confirm("Do you want to add '" + term + "' to cluster '" + getSelectedClusterID() + "'?"); 

            if(ok) {
              if(!termExists($(terms).children(), term)) {
                appendTerm(term);
              }
              else {
                alert("This cluster already have \""+term+"\"");
              }
            }
          }        
      }      
    });
});

/**
 * Search the term in all words of document collocation
 * @param term = the term
 * @return the found words
 */
function getWord(term) {

  var foundWords = new Array();
  var index = 0;

  for (var i = 0; i < allWords.length; i++) {
    if(allWords[i].indexOf(term) > -1) {
      foundWords[index] = allWords[i];
      index++;
    }
  }

  return foundWords;
}

/**
 * Clear cloud
 */
function clearCloud() {
  $("#panel8title").text("Term Cloud");
  $("#panel8_2").html("");
}

/**
 * Load the cloud again
 */
function loadCloudAgain() {
  loadTermCloud(getSelectedClusterID());
}

/**
 * Check the validity of the name of the cluster
 * This function checks if the name has the invalid characters
 * inside or not.
 * The name should start with [A-Za-z].
 * "[0-9] and '_' and '-' and [A-Za-z] are allowed for other characters.
 *
 * @param name = the name of the cluster
 * @return true: valid, false: invalid
 */
 function nameIsValid(name) {

  var valid = true;

  for (var i = 0; i < name.length; i++) {
    if(i == 0) {//check if the first char is [A-Za-z]
      var re = new RegExp("[A-Za-z]");     
      if(name.charAt(i).match(re) == null) {        
        valid = false;
        break;
      }
    } else {
      var re = new RegExp("[A-Za-z0-9_-\\s]");     
      if(name.charAt(i).match(re) == null) {        
        valid = false;
        break;
      }
    }
  };

  return valid;
 }

/*
 * For single and double click on a term inside cluster
 */
var DELAY = 300, //the delay between clicks
     clicks = 0,   //numbr of clicks
     timer = null; //timer
$(document).delegate(".ui-sortable-handle", "click", function(){
    // alert('you clicked me again!');
    // 
    clicks++;  //count clicks

        if(clicks == 1) {

            saveLog("termInsideClusterClicked");

            var temp = this;

            timer = setTimeout(function() {

              //select term content
              selectTermContent(temp);

              //highlight the term in key terms and the document content              
              termInsideClusterClicked($(temp).text());

              clicks = 0;             //after action performed, reset counter
            }, DELAY);

        } else {          
            clearTimeout(timer);    //prevent single-click action

            var confirmed = confirm("Are you sure about deleting this term?");
            if(confirmed) {
              saveLog("Term Remove");
              $(this).remove();       //Remove the item form the cluster
            }
            
            clicks = 0;             //after action performed, reset counter
        }
});

/*
 * For selecting the term content
 * @param term = clicked term
 */
function selectTermContent(term) {
    var range = document.createRange();
    range.selectNodeContents(term);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
}

/*
 * For single click on a term inside cluster
 * @param term = clicked term
 */
 function termInsideClusterClicked(term) {

  //highlight the term in the document view if exists
  $('#doc_content').removeHighlight();//remove previous highlights
  var re = new RegExp("\\b"+term+"\\b", "gi");//only find the word boundary
  $("#doc_content").highlight(re, "#767676");

  //find the word in cluster key terms and highlight it
  var words = $(".ui-selectable").children();

  var wordList = $("#selectable .ui-widget-content");

  //remove all selected terms
  for (var i = 0; i < wordList.length; i++) {
    $(wordList[i]).removeAttr("style");
    if(i == 0) { 
      $(wordList[i]).attr('class', 'ui-widget-content ui-selectee ui-selected');
    }
    else {
      $(wordList[i]).attr('class', 'ui-widget-content ui-selectee');
    } 
  }

  for (var i = 0; i < words.length; i++) {
    //unselect the selected word in cluster term list
    $(words[i]).removeClass("ui-selected");

    if($(words[i]).text() == term) { //if the term exists      

      //select the word in cluster term list      
      $(words[i]).addClass("ui-selected");

      //show the paralel cordinator of the term
      var words = new Array(1);
      var colors = {};
      words[0] = term;
      colors[words[0]] = "#767676";
      paralelCordinator(termClusterData, "#panel7", words, "#TermClusterView", colors);

      //highlight documents that have this term, inside general view graph
      highlightDocuments(words);
    }
  }
 }

/*
 * select text of searchBox
 * @param term = clicked term
 */
function selectText() {
  var searchBox = document.getElementById("textbox1");
  searchBox.select();

  //or
  // $("#textbox1").select();
}

/*
 * Enable dragable for panel4 (Clusters view)
 */
function enableDrag() {
  //enabel drgagable
  $("#panel4").draggable( 'enable' );

  $("#panel2").css('zIndex', 0);
  $("#panel3").css('zIndex', 0);
  $("#panel4").css('zIndex', 1);
  $("#panel5").css('zIndex', 0);
  $("#panel6").css('zIndex', 0);
  $("#panel7").css('zIndex', 0);
  $("#panel8").css('zIndex', 0);
  $("#panel9").css('zIndex', 0);
}

/*
 * If MindMap Clicked
 */
function MindMapClicked() {

  if(userID != "") {
    window.open("./" + userID + "/docClusters.mm");
  }

}

/*
 * Send the desired terms of the users to the server in order to reclustering.
 */
function SendData2Server()
{
    //save session before
    sessionDescription = "This session was saved automatically before reclustering.";
    callSaveSession("AutoSave");

    clusterNumber = document.getElementsByClassName("cluster").length;

    if (clusterNumber < 2)
    {
        userU = -1;
        alert("Your desired number of clusters should be at least 2!")
    }
    else
    {
        userU = +1;
        serverData = new Array();

        var confirmed = confirm("Your desired number of clusters is "+clusterNumber);
        if (confirmed)
        {

          var clusters = document.getElementsByClassName("cluster");

          for (var i = 0; i < clusters.length; i++) {
            var clusterName = $(clusters[i]).attr('id');
            var terms = $(document.getElementById(clusterName).getElementsByClassName("sortable")).children();

            serverClusetrName[i] = clusterName;
            serverData[i] = new Array();
            for (var j = 0; j < terms.length; j++) {
              serverData[i][j] = $(terms[j]).text();
            }            
          }

          clearScreen();
          callServer();          
        }
    }
}

/*
 * clear the screen.
 */
function clearScreen() {

  //clear previous data
  tsneResult = new Array();

  $("#forceSilhouette_label").html("");

  clusterWords = "";//the name and the key terms of clusters
  clusterKeyTerms = "";//the key terms of clusters are here
  clusterDocuments = "";//the list of documents of cluster
  clusterCloud = "";//the cloud terms of cluster
  termClusterData = "";//the term cluster data
  termClusterDataString = "";//the string of the term cluster data (for changing it later)
  documentClusterData = "";//the document cluster data
  documentClusterDataString = "";//the string of the documnet cluster data (for changing it later)
  allWords = "";//all words

  $("#panel4_1").html("");
  $("#doc_content").html("");
  $("#doc_select").html("");
  $("#DocumentClusterView").html("");
  $("#barcharts").html("");
  $("#selectable").html("");
  $("#TermClusterView").html("");
  $("#panel8_2").html("");
  $("#general_view1").html("");
  $("#general_view2").html("");
  $("#TsneSilhouette_label").html("");

  $( "#slider1" ).slider( "disable" );
  $( "#slider2" ).slider( "disable" );
  $( "#slider3" ).slider( "disable" );
  $("#slider1_Textbox").attr("disabled","disabled");
  $("#slider2_Textbox").attr("disabled","disabled");
  $("#slider3_Textbox").attr("disabled","disabled");

  $.jstree.destroy();//clear tree view

  $("#silhouette").html("");
}

/*
 * Show the cloud of the selected terms by the user.
 */
function showMyCloud() {

  saveLog("showMyCloud");

  var selectedCluster = getSelectedClusterID();

  if (selectedCluster != "") {
    var terms = $(document.getElementById(selectedCluster).getElementsByClassName("sortable")).children();

    var wordsTemp = "";
    for (var j = 0; j < terms.length; j++) {

      if(j == 0 ) {
        wordsTemp += $(terms[j]).text() + "|" + Math.floor(getValueOfTerm(selectedCluster, $(terms[j]).text())/10)//Math.floor(1*Math.log(getValueOfTerm(selectedCluster, $(terms[j]).text()))); 
      } else {
        wordsTemp += "|" + $(terms[j]).text() + "|" + Math.floor(getValueOfTerm(selectedCluster, $(terms[j]).text())/10)//Math.floor(1*Math.log(getValueOfTerm(selectedCluster, $(terms[j]).text())));
      }
    }

    //clear the cloud
    $("#panel8_2").html("");

    if(wordsTemp != "") {
      var words = wordsTemp.split("|");
      var x = document.getElementById("cloudColor");
      var title = "Term Cloud (User Terms)";
      wordCloud(wordText(words), sizeOfText(words), "panel8_2", "panel8", x.checked, title);
    }
  }  
}

/*
 * Add zero for numbers less than 10
 * @param num = number
 * @return number with zero if it is less than 10
 */
function twoDigitNumber(num) {

  if(num < 10) {
    return "0" + num;
  } else {
    return num;
  }

}

/*
 * Check if there are invalid chars in the session name or not
 * @param name = name of the session
 */
function sessionNameValidity(name) {
  var valid = true;

  for (var i = 0; i < name.length; i++) {

  var re = new RegExp("[A-Za-z0-9_-\\s]");     
  if(name.charAt(i).match(re) == null) {        
        valid = false;
        break;
    }
  }

  return valid;
}

/*
 * @param name = name of the session
 * Save the current session of the user.
 */
function callSaveSession(sessionName) {

    saveLog("callSaveSession");

    //get note of the sessions
    if(sessionDescription != "This session was saved automatically before reclustering.") {
      sessionDescription = $("#sessionNote").val();
    } 

    //for no comment case
    if(sessionDescription == null) {
      sessionDescription = "";
    }
    
    //clear notes
    $("#sessionNote").val("");

    var tempRemovedDocuments = JSON.stringify(removedDocuments);

    var currentdate = new Date();
    currentdate = twoDigitNumber(currentdate.getDate()) + " " + 
      twoDigitNumber(currentdate.getMonth() + 1) + " " + 
      currentdate.getFullYear() + " " + 
      twoDigitNumber(currentdate.getHours()) + "_" + 
      twoDigitNumber(currentdate.getMinutes()) + "_" + 
      twoDigitNumber(currentdate.getSeconds());

    var fileName = userID + "#$" + currentdate + " @ " + sessionName;
    var sessionValue = sessionName + " @ " + currentdate; 

    //get the new list of cluster words
    clusterWords = getNewClusterWords();

    $.ajax({
    type: "POST",
    url: "./cgi-bin/SessionSave.py",
    async: true,
    data: { fileName:JSON.stringify(fileName),
            userDirectory:JSON.stringify(userDirectory),
            clusterWords:JSON.stringify(clusterWords),
            clusterKeyTerms:JSON.stringify(clusterKeyTerms),
            clusterDocuments:JSON.stringify(clusterDocuments),
            clusterCloud:JSON.stringify(clusterCloud),
            termClusterData:JSON.stringify(termClusterData),
            termClusterDataString:JSON.stringify(termClusterDataString),
            documentClusterData:JSON.stringify(documentClusterData),
            removedDocuments:JSON.stringify(tempRemovedDocuments),
            gravity:JSON.stringify(gravity),
            linkDistance:JSON.stringify(linkDistance),
            cosineDistance:JSON.stringify($("#slider1").slider("value") / 100),
            documentsName:JSON.stringify(documentsNameString),
            documentDocumentSimilarity:JSON.stringify(documentDocumentSimilarityString),
            termDocumentSimilarity:JSON.stringify(termDocumentSimilarityString),
            sessionDescription:JSON.stringify(sessionDescription),
            silhouette:JSON.stringify(silhouette),
            documentClusterDataString:JSON.stringify(documentClusterDataString)},                
    success: function( msg ) {

      var status = msg['status'];

      if (status == "yes") {
        sessionDescription = "";
        alert("Session saved successfully.");

        //select the latest session
        sessionValue = sessionValue.replace("_", ":").replace("_", ":");
        getListOfSessions("first");
      }
      if (status == "no") {
        alert("Error1 in saving the session!");
      }
      if (status == "error") {
        alert("Error3 in saving the session!");
      }
                    
    },
    error: function(msg){            
       alert("Error2 in saving the session!");
    }
  });
}

/*
 * Save the current session of the user.
 */
function saveSession() { 

  if(userID != "") {
    if( $(".cluster").length > 0 ) {    

    var sessionName = prompt("Please enter name of the session:","");

    if(sessionName == null ) {//cancelation
      return false;
    }

    while(!sessionNameValidity(sessionName)) {
      alert("Invalid name! (only use alphabet characters and numbers)");
      sessionName = prompt("Please enter name of the session:","");
    }

    callSaveSession(sessionName);
  }
  else {
  alert("Nothing to be saved!");
 } 
 }
 else {
  alert("Nothing to be saved!");
 } 
}

/**
 * Get the new list of clusters words.
 * @return the new list of terms of each clusterd determined by the user.
 */
function getNewClusterWords() {

  var tempClusterWords = '[';

  var clusters = document.getElementsByClassName("cluster");

  for (var i = 0; i < clusters.length; i++) {
    var clusterName = $(clusters[i]).attr('id');
    var terms = $(document.getElementById(clusterName).getElementsByClassName("sortable")).children();

    tempClusterWords += '{"cluster":"' + clusterName + '", "words": ['            
            
    for (var j = 0; j < terms.length; j++) {
      tempClusterWords += '{"word":"' + $(terms[j]).text() + '"}';

      if((j+1) < terms.length) {
        tempClusterWords += ',';
      }
    }

    tempClusterWords += ']}';
      if((i+1) < clusters.length) {
        tempClusterWords += ",";
    }           
  }

  tempClusterWords += ']';

  return JSON.parse(tempClusterWords);  
}

/*
 * Delete the selected session.
 */
function deleteSession() {

  saveLog("deleteSession");

   if(userID != "") {

    var sessionName = $( "#session_select" ).val();

    if(sessionName != null) {
       var confirmed = confirm("Are you sure about deleting this session?");

        if(confirmed) {

          var date = sessionName.substring(sessionName.indexOf(" @ ") + 3).replace("_", ":").replace("_", ":");
          var name = sessionName.substring(0, sessionName.indexOf(" @ "));          
          sessionName = userID + "#$" + date + " @ " + name + ".session";
          sessionName = sessionName.replace(":", "_").replace(":", "_");

          $.ajax({
          type: "POST",
          url: "./cgi-bin/SessionRemove.py",
          data: { userDirectory:JSON.stringify(userDirectory), sessionName:JSON.stringify(sessionName) },                
          success: function( msg ) {
      
          var status = msg['status'];

          if (status == "yes") {
            alert("Session deleted successfully.");

            getListOfSessions("first");
          }
          if (status == "no") {
            alert("There was no session to be deleted!");
          }       
        },
        error: function(msg){            
          alert("Error in deleting the session!");
          }
        });
      }
    }
    else {
      alert("Please select a session!");
    }   
 }
 else {
  alert("Nothing to be deleted!");
 } 
}

/*
 * On page close.
 */
function pageClose() {
  return "Did you saved your session?";
}

/*
 * Get the list of sessions (the name of the sessions).
 * @param sessionIndex = index of session that should be selected
 * @return the lis of sessions 
 */
function getListOfSessions(sessionIndex) {

  sessions = [];
  sessionsDescription = [];

  $.ajax({
        type: "POST",
        url: "./cgi-bin/SessionList.py",
        data: { userDirectory:JSON.stringify(userDirectory)}, 
        async: false,              
        success: function( msg ) {
      
        var status = msg['status'];

        if (status == "yes") { 
          sessions = msg['sessions'];
          sessionsDescription = msg['sessionDescription'];
          refreshSessionListBox(sessionIndex);
        }
        if(status == "no") {
          refreshSessionListBox();
        }
        if (status == "error") {
          alert("Error1 in finding the list of sessions!");
        }     
      },
      error: function(msg){            
        alert("Error2 in finding the list of sessions!");
      }
  });

}

/*
 * Refresh list of sessions in listBox
 * @param sessionIndex = index of session that should be selected
 */
function refreshSessionListBox(sessionIndex) {
  $("#session_select").html("");
  $("#session_select").append("<option value=\"first\" disabled selected>Select Session</option>"); 

  for (var j = 0; j < sessions.length; j++) {
    var name = sessions[j].substring(sessions[j].indexOf(" @ ") + 3, sessions[j].indexOf(".session"));
    var date = sessions[j].substring(sessions[j].indexOf("#$") + 2, sessions[j].indexOf(" @ ")).replace("_", ":").replace("_", ":");

    var number = "";
    if(j < 10) {
      number = "0" + (j+1) + ") ";
    }
    else {
      number = (j+1) + ") ";
    }

    var finalName = name + " @ " + date;
    $("#session_select").append("<option class=\"d\" value=\""+finalName+"\" title=\""+ sessionsDescription[j] +"\">"+ number + finalName+"</option>");   
  }

  $("#session_select option[value='"+sessionIndex+"']").attr("selected", true);
}

/*
 * load session
 * @param sessionName = the name of session to be loaded
 */
function loadSession(sessionName) {
  saveLog("loadSession");

  //change cursor
  $("body").css("cursor", "wait");

  //clear screen
  clearScreen();

  //remove zip files
  removeZip();

  sessionName = sessionName.replace(":", "_").replace(":", "_");

  sessionName = userID + "#$" + sessionName + ".session";

  $.ajax({
        type: "POST",
        url: "./cgi-bin/SessionLoad.py",
        cache: false,
        traditional: true,
        data: { userDirectory:JSON.stringify(userDirectory), sessionName:JSON.stringify(sessionName) },
        success: function( msg ) {
            $("body").css("cursor", "auto");

            var status = msg['status'];
            
            if (status == "no")
            {
              alert("Such session does not exists!");
            }
            else if (status == "error")
            {
              alert("Error in retrieving the session!");
            }
            else if (status == "yes") {
              clearScreen();
              
              //load session data;
              var data = JSON.parse(msg['data']);

              clusterWords = data.clusterWords;//the name and the key terms of clusters
              clusterKeyTerms = data.clusterKeyTerms;//the key terms of clusters are here
              clusterDocuments = data.clusterDocuments;//the list of documents of cluster
              clusterCloud = data.clusterCloud;//the cloud terms of cluster
              termClusterData = data.termClusterData;//the term cluster data
              termClusterDataString = data.termClusterDataString;//the string of the term cluster data (for changing it later)
              documentClusterData = data.documentClusterData;//the document cluster data
              documentClusterDataString = data.documentClusterDataString;//the string of the documnet cluster data (for changing it later)
              silhouette = data.silhouette;//silhouette
              gravity = data.gravity;
              linkDistance = data.linkDistance;
              var cosineDistance = data.cosineDistance;
              json2arrayRemovedDocuments(data.removedDocuments);

              //load note of user
              $("#sessionNote").val(data.sessionDescription);

              //for list of all terms of the collection
              // create request object
              var asyncRequest = new XMLHttpRequest();
              asyncRequest.open( 'POST', "./"+userID+"/" + "out" + userID + ".Terms", false );
              asyncRequest.send(); // send the request
              // allWords = d3.csv.parse(asyncRequest.responseText);
              allWords = asyncRequest.responseText.split("\n"); // .split("\r\n")

            //load clusters
            for (var i = 0; i < clusterWords.length; i++) { 
              //create cluster 
              createCluster(clusterWords[i].cluster);

              //add terms to the cluster
              for (var j = 0; j < clusterWords[i].words.length; j++) {        

                x = document.getElementById(clusterWords[i].cluster);

                $(x.getElementsByClassName("sortable")).append(
                "<li class='ui-state-default ui-sortable-handle' onmousedown=\"wordMouseDown(event)\"><span class='terms'>"+
                clusterWords[i].words[j].word+"</span></li>");
              }
            }

              //get the list of documents name
                documentsNameString =  data.documentsName;
                documentsName = documentsNameString.split("\n"); // .split("\r\n")

                //get document-document similarity matrix
                documentDocumentSimilarityString = data.documentDocumentSimilarity
                var temp = documentDocumentSimilarityString.split("\n"); // .split("\r\n")
                for (var i = 0; i < temp.length; i++) {
                  if(temp[i].length > 0 ) {
                    documentDocumentSimilarity[i] = temp[i].split(",");
                  }
                }

                 //get term-document matrix                
                termDocumentSimilarityString = data.termDocumentSimilarity;
                var temp = termDocumentSimilarityString.split("\n");// .split("\r\n")
                for (var i = 0; i < temp.length; i++) {
                  if(temp[i].length > 0 ) {
                    termDocumentSimilarity[i] = temp[i].split(",");
                  }
                }

            //get general view graph
            generalViewGraph = getGeneralViewGraph(0.97);

            //load General View
            generalViewLoader(cosineDistance);

            //set the sliders value
            $("#slider1").slider("value", parseInt(cosineDistance * 100));
            $("#slider2").slider("value", parseInt(linkDistance));
            $("#slider3").slider("value", parseInt(gravity * 100));
            $("#slider1_Textbox").val(parseInt(cosineDistance * 100));
            $("#slider2_Textbox").val(parseInt(linkDistance));
            $("#slider3_Textbox").val(parseInt(gravity * 100));

            //refresh tree view
            refreshTreeView();

            //select the first cloud
            clusterClicked(clusterWords[0].cluster); 

            $( "#slider1" ).slider( "enable" );
            $( "#slider2" ).slider( "enable" );
            $( "#slider3" ).slider( "enable" );
            $("#slider1_Textbox").removeAttr("disabled");
            $("#slider2_Textbox").removeAttr("disabled");
            $("#slider3_Textbox").removeAttr("disabled");

            //show silhouette
            $("#silhouette").append("Silhouette: " + silhouette);

            $("body").css("cursor", "auto");
          }
      },
      error: function(msg){   
      $("body").css("cursor", "auto");         
        alert("Error in retrieving the session!");        
      }
  });  
}

function json2arrayRemovedDocuments(data) {

  data = data.replace("[", "").replace("]", "");
  data = data.split(",");

  for (var i = 0; i < data.length; i++) {
    if(data[i] == "true") {
      removedDocuments[i] = true;
    }
    else if(data[i] == "false") {
      removedDocuments[i] = false;
    } 
    
  };
}

//varibales for contorling general view graph
var svg,//for T-SNE    
    link,// T-SNE 
    node,// T-SNE
    g,// T-SNE
    g2,//for force layout 
    svg2,//for force layout 
    link2,//for force layout
    node2,//for force layout 
    r = 4;//r of circles
var linkedByIndex = new Array();
var linkedByIndex2 = new Array();
var gravity = 0.3;
var linkDistance = 20;
var highlight_trans = 0.25;

/*
 * load general view
 * @parm threshold = threshold for cosine distance
 */
function generalViewLoader(threshold) {

  //load T-SNE layout
  loadT_SNE(threshold);

  //load Force layout
  load_Force(threshold);   
}

/*
 * load force layout
 * @parm threshold = threshold for cosine distance
 */
function load_Force(threshold) {
  $("#general_view2").html("");//clear the screen
  linkedByIndex2 = new Array();

  var margin = {top: 5, right: 5, bottom: 5, left: 5},
      width = $("#general_view1").width() - margin.left - margin.right,
      height = $("#general_view1").height() - margin.top - margin.bottom;

  var nominal_base_node_size = 8;
  var focus_node = null, highlight_node = null;
  var highlight_color = "black";  
  var outline = false;
  var default_link_color = "#a6a6a6";
  var nominal_stroke = 0.5;
  var max_stroke = 4.5;
  var max_base_node_size = 36;
  var min_zoom = 0.1;
  var max_zoom = 8;
  var zoom = d3.behavior.zoom().scaleExtent([min_zoom,max_zoom]);  
  var towhite = "stroke";
  if (outline) {
    tocolor = "stroke"
    towhite = "fill"
  }
  var size = d3.scale.pow().exponent(1).domain([1,100]).range([8,24]);

  svg2 = d3.select("#general_view2").append("svg")
    .attr("class", "svg")
    .attr("width", "100%")
    .attr("height", "100%");

  g2 = svg2.append("g");

  force2 = d3.layout.force()
    .size([width, height])
    .gravity(gravity)
    .distance(linkDistance)
    .charge(-50)
    .on("tick", tick);

  var drag = force2.drag()
    .on("dragstart", dragstart);

  node2 = force2.nodes();
  link2 = force2.links();

  link2 = g2.append('g').selectAll(".link2"),
  node2 = g2.append('g').selectAll(".node2"); 

  // d3.json("data/json5.json", function(error, json) {
  //  if (error) throw error;

    //filter links by threshold
    var linkData = generalViewGraph2.links.filter(function(n) {        
        if(n.v <= threshold) {
          return n;
        }        
    });
    
    linkData.forEach(function(d) {linkedByIndex2[d.source + "," + d.target] = true;  });

    //update #documents and # links statistics
    $("#span2").text(generalViewGraph2.nodes.length);
    $("#span4").text(linkData.length / 2);

    force2.nodes(generalViewGraph2.nodes)
        .links(linkData)
        .start();

      link2 = link2.data(linkData)
        .enter().append("line")
        .attr("class", "link2");

      node2 = node2.data(generalViewGraph2.nodes)
        .enter().append("circle")
        .attr("class", "node2")
        .style("fill", function(d) { return d.co; })
        .attr("r", r)        
        .on("dblclick", dblclick)
        .call(drag)
        .attr("data-hasqtip", function(d) {
          $(this).qtip({
            content: {
              text: '<strong>Document name:</strong><br><u class="hyperLink" onclick="showDocumentPDF($(this).text())">'+ d.na +
                    '</u><br><br><strong>List of clusters name:</strong><br>' + createListOfDocumentClustersName(d.cl, d.na) +
                    '</u><br><strong>List of top 5 terms:</strong><br>' + getListOfTermsOfDocument(d.na)               
            },            
            hide: {
              fixed: true,
              delay: 700
            },
            show: {
              delay: 1500
            },
            style: {
              classes: 'qtip-rounded qtip-shadow'
            },
            position: {
              my: 'center right',
              at: 'center left'
            }
          });
     });

    node2.on("mouseover", function(d) { saveLog("forceLayoutNodeMouseOver"); force2.stop(); set_highlight(d) })
        .on("click", function(d) {   force2.stop();
                                      d3.event.stopPropagation();
                                       focus_node = d;
                                       set_focus(d);
                                       set_highlight(d); 
                                       saveLog("forceLayoutNodeClick");} )
        .on("mousedown", function(d) { force2.stop(); d3.event.stopPropagation(); } )
        .on("mouseout", function(d) { force2.stop(); exit_highlight(); } )
        .on("contextmenu", function (d, i) {
          saveLog("forceLayoutNodeShowCloud");
            force2.stop(); d3.event.preventDefault();
           // react on right-clicking
        });

    svg2.on("click",  function() {
        force2.stop();
        if (focus_node!= null)
        {
          focus_node = null;
          if (highlight_trans<1)
          {  
            node2.style("opacity", 1);            
            link2.style("opacity", 1);

            node.style("opacity", 1);            
            link.style("opacity", 1);
          }
        }
        else {
          node2.style("opacity", 1);            
          link2.style("opacity", 1);

          node.style("opacity", 1);            
          link.style("opacity", 1);
        }  
        if (highlight_node == null) exit_highlight();
    })
    .on("contextmenu", function (d, i) {
            d3.event.preventDefault();
           // react on right-clicking
     });

    // node.on("dblclick.zoom", function(d) { d3.event.stopPropagation();
    //   var dcx = (window.innerWidth/2-d.x*zoom.scale());
    //   var dcy = (window.innerHeight/2-d.y*zoom.scale());
    //   zoom.translate([dcx,dcy]);
    //   g.attr("transform", "translate("+ dcx + "," + dcy  + ")scale(" + zoom.scale() + ")"); 
    // });

  // });  

  function tick() {
    link2.attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

    node2.attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; });
  }  

  function dblclick(d) {
    d3.select(this).classed("fixed", d.fixed = false);
  }

  function dragstart(d) {
    d3.select(this).classed("fixed", d.fixed = true);
  }

  function isConnected(a, b) {
    return linkedByIndex2[a.index + "," + b.index] || linkedByIndex2[b.index + "," + a.index] || a.index == b.index;
  }

  function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  } 

  function set_highlight(d)
  {
    svg2.style("cursor","pointer");
    svg.style("cursor","pointer");
    if (focus_node!= null) d = focus_node;
    highlight_node = d;

    if (highlight_color !="#a6a6a6")
    {
      node2.style(towhite, function(o) {
        if(o.na == $(doc_select).val()) {
            return "red";
        }
        // else if(docsHighlight[o.na]) 
        // {
        //   return "blue";
        // }
        else if(isConnected(d, o)) {
          return highlight_color;
        }
        else {          
          return "#a6a6a6";
        }
      });
      
      link2.style("stroke", function(o) {
          return o.source.index == d.index || o.target.index == d.index ? highlight_color : 
                  ((isNumber(o.score) && o.score>=0)?color(o.score):default_link_color);
      });

      //set node stroke
      node2.style("stroke-width", function(o) {
        if((docsHighlight[o.na] && isConnected(d, o)) || o.na == $(doc_select).val()) {
          return "2px";
        }
        else {          
          return "0.5px";
        }   
      })

      node.style(towhite, function(o) {
        if(o.na == $(doc_select).val()) {
            return "red";
        }
        // else if(docsHighlight[o.na]) 
        // {
        //   return "blue";
        // }
        else if(isConnected(d, o)) {
          return highlight_color;
        }
        else {          
          return "#a6a6a6";
        }
      });
      
      link.style("stroke", function(o) {
          return o.source.index == d.index || o.target.index == d.index ? highlight_color : 
                  ((isNumber(o.score) && o.score>=0)?color(o.score):default_link_color);
      });

      //set node stroke
      node.style("stroke-width", function(o) {
        if((docsHighlight[o.na] && isConnected(d, o)) || o.na == $(doc_select).val()) {
          return "2px";
        }
        else {          
          return "0.5px";
        }   
      })
    }
  }

  function exit_highlight()
  {
    highlight_node = null;
    if (focus_node==null)
    {
      svg2.style("cursor","move");
      if (highlight_color!="#a6a6a6")
      {
        node2.style(towhite, function(o) {
          if(o.na == $(doc_select).val()) {
            return "red";
          }
          // else if(docsHighlight[o.na]) 
          // {
          //   return "blue";
          // }
          else {          
            return "#a6a6a6";
          }
        })
        link2.style("stroke", function(o) {return (isNumber(o.score) && o.score>=0)?color(o.score):default_link_color});

          //set node stroke
          node2.style("stroke-width", function(o) {
          if(o.na == $(doc_select).val()) {
            return "2px";
          }
          else {          
            return "0.5px";
          }   
        })
      }
    }
  }

  zoom.on("zoom", function() {

    var stroke = nominal_stroke;

    if (nominal_stroke*zoom.scale()>max_stroke) {
      stroke = max_stroke/zoom.scale();
    }

    link2.style("stroke-width",stroke);
    // node.style("stroke-width",stroke);

    node2.style("stroke-width", function(o) {
        if(o.na == $(doc_select).val() ) {
          return stroke * 3;
        }
        else {          
          return stroke;
        }
    });
     
    var base_radius = nominal_base_node_size;
  
    g2.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
  });

  svg2.call(zoom); 
}//************************* End of force layout load

/*
 * Focus on the selected nodes
 * @param d = node
 */
function set_focus(d)
{ 
    if(event.ctrlKey) {// for the keep functionality
      if (highlight_trans<1)  {

        saveLog("keepFunction");

        node2.style("opacity", function(o, i) {
          return isConnected(d, o) || $($(".node2")[i]).css("opacity") == 1 ?  1 : highlight_trans;
        });
    
        link2.style("opacity", function(o, i) {
          return o.source.index == d.index || o.target.index == d.index || $($(".link2")[i]).css("opacity") == 1 ? 1 : 0;
        });

        node.style("opacity", function(o, i) {
          return isConnected(d, o) || $($(".node")[i]).css("opacity") == 1 ?  1 : highlight_trans;
        });
    
        link.style("opacity", function(o, i) {
          return o.source.index == d.index || o.target.index == d.index || $($(".link")[i]).css("opacity") == 1 ? 1 : 0;
        }); 
      }
    }
    else if(event.altKey) {// for un-keep
      saveLog("unKeepFunction");
      //get the opacity of the clicked node
      var d_index = 0;
      node2.filter(function(o, i) {
        if(o.na == d.na) {
          d_index = i;
        }
      });

      node.filter(function(o, i) {
        if(o.na == d.na) {
          d_index = i;
        }
      });

      if($($(".node2")[d_index]).css("opacity") == 1) {
        //remove the opacity of the node and its isolated neighbors
        var degree = {};
        link2.style("opacity", function(o, i) {
          if(o.source.index == d.index) {
            degree[o.target.index] = 0;
            return 0;
          }
          else if(o.target.index == d.index) {
            degree[o.source.index] = 0;
            return 0;
          }
          else {
            return $($(".link2")[i]).css("opacity") == 1 ? 1 : 0;
          }            
        });

        //get neighbor nodes degree
        link2.filter(function(o, i) {
          if($($(".link2")[i]).css("opacity") == 1) {
            if(o.target.index in degree) {
              degree[o.target.index]++;
            }
            else if(o.source.index in degree) {
              degree[o.source.index]++;
            }
          }
        });

        node2.style("opacity", function(o, i) {
          if(o.na == d.na) {
            return highlight_trans;
          } 
          else if(isConnected(d, o) && degree[o.index] == 0){
            return highlight_trans; 
          } 
          else {
            return $($(".node2")[i]).css("opacity");
          }            
        }); 
      }

        if($($(".node")[d_index]).css("opacity") == 1) {
        //remove the opacity of the node and its isolated neighbors
        var degree = {};
        link.style("opacity", function(o, i) {
          if(o.source.index == d.index) {
            degree[o.target.index] = 0;
            return 0;
          }
          else if(o.target.index == d.index) {
            degree[o.source.index] = 0;
            return 0;
          }
          else {
            return $($(".link")[i]).css("opacity") == 1 ? 1 : 0;
          }            
        });

        //get neighbor nodes degree
        link.filter(function(o, i) {
          if($($(".link")[i]).css("opacity") == 1) {
            if(o.target.index in degree) {
              degree[o.target.index]++;
            }
            else if(o.source.index in degree) {
              degree[o.source.index]++;
            }
          }
        });

        node.style("opacity", function(o, i) {
          if(o.na == d.na) {
            return highlight_trans;
          } 
          else if(isConnected(d, o) && degree[o.index] == 0){
            return highlight_trans; 
          } 
          else {
            return $($(".node")[i]).css("opacity");
          }            
        }); 
      }
    }
    else {
        if (highlight_trans<1)  {
        node2.style("opacity", function(o) {
          return isConnected(d, o) ? 1 : highlight_trans;
        });
    
        link2.style("opacity", function(o) {
          return o.source.index == d.index || o.target.index == d.index ? 1 : 0;
        });

        node.style("opacity", function(o) {
          return isConnected(d, o) ? 1 : highlight_trans;
        });
    
        link.style("opacity", function(o) {
          return o.source.index == d.index || o.target.index == d.index ? 1 : 0;
        });   
      }
    }    
}

/*
 * check if two nodes are connected togather or not
 * @param a = node
 * @param b = node
 * @return true if connected
 */
function isConnected(a, b) {
    return linkedByIndex[a.index + "," + b.index] || linkedByIndex[b.index + "," + a.index] || a.index == b.index;
}

/*
 * load T-SNE layout
 * @param threshold = threshold for cosine distance
 */
function loadT_SNE(threshold) {
  $("#general_view1").html("");//clear the screen

  linkedByIndex = new Array();

  var margin = {top: 5, right: 5, bottom: 5, left: 5},
      width = $("#general_view1").width() - margin.left - margin.right,
      height = $("#general_view1").height() - margin.top - margin.bottom;

  var nominal_base_node_size = 8;
  var focus_node = null, highlight_node = null;
  var highlight_color = "black";  
  var outline = false;
  var default_link_color = "#a6a6a6";
  var nominal_stroke = 0.5;
  var max_stroke = 4.5;
  var max_base_node_size = 36;
  var min_zoom = 0.1;
  var max_zoom = 8;
  var zoom = d3.behavior.zoom().scaleExtent([min_zoom,max_zoom]);  
  var towhite = "stroke";
  if (outline) {
    tocolor = "stroke"
    towhite = "fill"
  }
  var size = d3.scale.pow().exponent(1).domain([1,100]).range([8,24]);

  // svg = d3.select("#general_view").append("svg")
  //   .attr("class", "svg")
  //   .attr("width", width)
  //   .attr("height", height);    

  //in order to have enough space to show the graph (min width is 300)
    // if($("#general_view").width() < 400) {
    //   svg = d3.select("#general_view").append("svg")
    //   .attr("class", "svg")
    //   .attr("width", "400px")
    //   .attr("height", "400px");

    //   width = 400 - margin.left - margin.right;
    //   height = 400 - margin.top - margin.bottom;


    // }
    // else 
    {
      svg = d3.select("#general_view1").append("svg")
      .attr("class", "svg")
      .attr("width", "100%")
      .attr("height", "100%");
    }

  g = svg.append("g");

  force = d3.layout.force()
    .size([width, height])
    .gravity(0.3)
    .distance(20)
    .charge(-300)
    .alpha(0)
    .on("tick", tick);

  var drag = force.drag()
    .on("dragstart", dragstart);

  node = force.nodes();
  link - force.links();

  link = g.append('g').selectAll(".link"),
  node = g.append('g').selectAll(".node");

  // d3.json("data/json5.json", function(error, json) {
  //  if (error) throw error;

    //filter links by threshold
    var linkData = generalViewGraph.links.filter(function(n) {        
        if(n.v <= threshold) {
          return n;
        }
    });
    
    linkData.forEach(function(d) {linkedByIndex[d.source + "," + d.target] = true;  });

    //update #documents and # links statistics
    $("#span2").text(generalViewGraph.nodes.length);
    $("#span4").text(linkData.length / 2);

    force.nodes(generalViewGraph.nodes)
        .links(linkData)
        // .start();

      link = link.data(linkData)
        .enter().append("line")
        .attr("class", "link");

      node = node.data(generalViewGraph.nodes)
        .enter().append("circle")
        .attr("class", "node")
        .style("fill", function(d) { return d.co; })
        .attr("r", r)        
        .on("dblclick", dblclick)
        .call(drag)
        .attr("data-hasqtip", function(d) {
          $(this).qtip({
            content: {
              text: '<strong>Document name:</strong><br><u class="hyperLink" onclick="showDocumentPDF($(this).text())">'+ d.na +
                    '</u><br><br><strong>List of clusters name:</strong><br>' + createListOfDocumentClustersName(d.cl, d.na) +
                    '</u><br><strong>List of top 5 terms:</strong><br>' + getListOfTermsOfDocument(d.na)               
            },            
            hide: {
              fixed: true,
              delay: 700
            },
            show: {
              delay: 700
            },
            style: {
              classes: 'qtip-rounded qtip-shadow'
            },
            position: {
              my: 'center right',
              at: 'center left'
            }
          });
     });

    node.on("mouseover", function(d) { saveLog("tSneLayoutNodeMouseOver"); set_highlight(d) })
        .on("click", function(d) { 
                                      d3.event.stopPropagation();
                                       focus_node = d;
                                       set_focus(d);
                                       set_highlight(d); 
                                     saveLog("tSneLayoutNodeClick");} )
        .on("mousedown", function(d) { d3.event.stopPropagation(); } )
        .on("mouseout", function(d) { exit_highlight(); } )
        .on("contextmenu", function (d, i) {
          saveLog("tSneLayoutNodeContextMenue");
            d3.event.preventDefault();
           // react on right-clicking
        });

    svg.on("click",  function() {
        if (focus_node!= null)
        {
          focus_node = null;
          if (highlight_trans<1)
          {  
            node.style("opacity", 1);            
            link.style("opacity", 1);

            node2.style("opacity", 1);            
            link2.style("opacity", 1);
          }
        }
        else {
          node.style("opacity", 1);            
          link.style("opacity", 1);

          node2.style("opacity", 1);            
          link2.style("opacity", 1);
        }  
        if (highlight_node == null) exit_highlight();
    })
    .on("contextmenu", function (d, i) {        
            d3.event.preventDefault();
           // react on right-clicking
     });

    // node.on("dblclick.zoom", function(d) { d3.event.stopPropagation();
    //   var dcx = (window.innerWidth/2-d.x*zoom.scale());
    //   var dcy = (window.innerHeight/2-d.y*zoom.scale());
    //   zoom.translate([dcx,dcy]);
    //   g.attr("transform", "translate("+ dcx + "," + dcy  + ")scale(" + zoom.scale() + ")"); 
    // });

  // });

  node.classed("fixed", function(d) {
    d.fixed = false;
  });

  force.start();
  for (var i = 0; i < 2; i++) 
    force.tick();

  node.classed("fixed", function(d) {
    d.fixed = true;
  });

  function tick() {
    // node.attr("cx", function(d) { return d.x = Math.max(r, Math.min(width - r, d.x)); })
    //     .attr("cy", function(d) { return d.y = Math.max(r, Math.min(height - r, d.y)); });

        node.attr("cx", function(d) { return d.x = d.x; })
        .attr("cy", function(d) { return d.y = d.y; });

    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });
  }

  function dblclick(d) {
    // d3.select(this).classed("fixed", d.fixed = false);
  }

  function dragstart(d) {
    // d3.select(this).classed("fixed", d.fixed = true);
  }

  function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  } 

  function set_highlight(d)
  {
    svg.style("cursor","pointer");
    svg2.style("cursor","pointer");
    if (focus_node!= null) d = focus_node;
    highlight_node = d;

    if (highlight_color !="#a6a6a6")
    {
        node.style(towhite, function(o) {
        if(o.na == $(doc_select).val()) {
            return "red";
        }
        // else if(docsHighlight[o.na]) 
        // {
        //   return "blue";
        // }
        else if(isConnected(d, o)) {
          return highlight_color;
        }
        else {          
          return "#a6a6a6";
        }
      });
      
      link.style("stroke", function(o) {
          return o.source.index == d.index || o.target.index == d.index ? highlight_color : 
              ((isNumber(o.score) && o.score>=0)?color(o.score):default_link_color);
      });

      //set node stroke
      node.style("stroke-width", function(o) {
        if((docsHighlight[o.na] && isConnected(d, o)) || o.na == $(doc_select).val()) {
          return "2px";
        }
        else {          
          return "0.5px";
        }   
      })

      node2.style(towhite, function(o) {
        if(o.na == $(doc_select).val()) {
            return "red";
        }
        // else if(docsHighlight[o.na]) 
        // {
        //   return "blue";
        // }
        else if(isConnected(d, o)) {
          return highlight_color;
        }
        else {          
          return "#a6a6a6";
        }
      });
      
      link2.style("stroke", function(o) {
          return o.source.index == d.index || o.target.index == d.index ? highlight_color : 
              ((isNumber(o.score) && o.score>=0)?color(o.score):default_link_color);
      });

      //set node stroke
      node2.style("stroke-width", function(o) {
        if((docsHighlight[o.na] && isConnected(d, o)) || o.na == $(doc_select).val()) {
          return "2px";
        }
        else {          
          return "0.5px";
        }   
      })
    }
  }

  function exit_highlight()
  {
    highlight_node = null;
    if (focus_node==null)
    {
      svg.style("cursor","move");
      if (highlight_color!="#a6a6a6")
      {
        node.style(towhite, function(o) {
          if(o.na == $(doc_select).val()) {
            return "red";
          }
          // else if(docsHighlight[o.na]) 
          // {
          //   return "blue";
          // }
          else {          
            return "#a6a6a6";
          }
        })
        link.style("stroke", function(o) {return (isNumber(o.score) && o.score>=0)?color(o.score):default_link_color});

          //set node stroke
          node.style("stroke-width", function(o) {
          if(o.na == $(doc_select).val()) {
            return "2px";
          }
          else {          
            return "0.5px";
          }   
        })
      }
    }
  }

  zoom.on("zoom", function() {

    var stroke = nominal_stroke;

    if (nominal_stroke*zoom.scale()>max_stroke) {
      stroke = max_stroke/zoom.scale();
    }

    link.style("stroke-width",stroke);
    // node.style("stroke-width",stroke);

    node.style("stroke-width", function(o) {
        if(o.na == $(doc_select).val() ) {
          return stroke * 3;
        }
        else {          
          return stroke;
        }
    });
     
    var base_radius = nominal_base_node_size;
  
    g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
  });

  svg.call(zoom);  
}//*******************************End of T-SNE

/*
 * Create list of documents clusters name
 * @param clustersNames = the list of clusters name (comma separated)
 * @parm documentName = the name of the document
 * @return list of document clusters name.
 */
function createListOfDocumentClustersName(clustersNames, documentName) {
  var clusters = clustersNames.split(",");

  var list = "";

  for (var i = 0; i < clusters.length; i++) {
    list += '<span style="font-size:20px;color:'+getClusterColor(clusters[i])+';">&#9679; </span><u class="hyperLink clusterNameInGraph" onclick=loadDocInCluster("'
            +documentName+'","'+clusters[i]+'")>'+clusters[i]+'</u><br>';
  };  

  return list;
}

/*
 * Create list of top terms of document
 * @parm documentName = the name of the document
 * @return list of top terms of document.
 */
function getListOfTermsOfDocument(documentName) {
  
  var terms = new Array();
  terms = getDocumentTermsSorted(documentName);

  var list = "";

  //show top 5 terms
  for (var i = 0; i < terms.length; i++) {
    if(i == 5)//show top 5 terms
      break;

    list += '<span>'+terms[i][0]+'</span><br>'; 
  }  

  return list;
}

/*
 * get sorted list of document terms
 * @parm documentName = the name of the document
 * @return sorted list of document terms
 */
function getDocumentTermsSorted(documentName) {
  var temp = termDocumentSimilarity[documentsName.indexOf(documentName)];
  var terms = new Array();
  var termsScore = new Array();

  var index = 0;
  for (var i = 0; i < temp.length; i++) {
    if(temp[i] > 0.0) {
      terms[index] = allWords[i];
      termsScore[index] = temp[i];
      index++;
    }    
  }

  //sort the terms by score
  for (var i = 0; i < termsScore.length; i++) {
    for (var j = i; j < termsScore.length; j++) {
      if(termsScore[j] > termsScore[i]) {
        var temp = termsScore[i];
        termsScore[i] = termsScore[j];
        termsScore[j] = temp;

        temp = terms[i];
        terms[i] = terms[j];
        terms[j] = temp;
      }
    }
  }

  var finalTerms = new Array(terms.length);
  for (var i = 0; i < terms.length; i++) {
    finalTerms[i] = new Array(2);
    finalTerms[i][0] = terms[i];
    finalTerms[i][1] = termsScore[i];
  }

  return finalTerms;
}

/*
 * Load document in the cluster
 * @param clusterName = cluster name
 * @parm documentName = the name of the document
 */
function loadDocInCluster(documentName, clusterName) {
  clusterClicked(clusterName);

  //load the document
  document.getElementById("doc_content").innerHTML = "";
  loadDoc(documentName);
  highlightDocGeneralView(documentName);

  //show the paralel cordinator view
  var words = new Array(1);
  var colors = {};
  words[0] = documentName;
  colors[words[0]] = $( "#"+clusterName + " p" ).css("background-color");//"Blue";
  paralelCordinator(documentClusterData, "#panel6", words, "#DocumentClusterView", colors);

  //change the selected list of documents  
  var docSelect = document.getElementById('doc_select');
  for(var i = 0; i < docSelect.options.length; i++) {
      if(docSelect.options[i].innerHTML == documentName) {
          docSelect.selectedIndex = i;
          break;
      }
  }
}

/*
 * Get general view graph
 * @param similarityThreshold = the similarity threshold
 * @return generalViewGraph = the general view graph
 */
function getGeneralViewGraph(similarityThreshold) {

  var scale_width = $("#general_view1").width() / 11;
  var scale_height = $("#general_view1").height() / 11;

  var date1 = new Date();
  var n1 = date1.getTime();

  var tsneSilhouetteState = false;
  
  //run t-sne
  if(tsneResult.length < 1) {
    tsneSilhouetteState = true;
    var opt = {epsilon: 10}; // epsilon is learning rate (10 = default)
    var tsne = new tsnejs.tSNE(opt); // create a tSNE instance
    tsne.initDataDist(documentDocumentSimilarity);

    for(var k = 0; k < 300; k++) {
      tsne.step(); // every time you call this, solution gets better
    }

    tsneResult = tsne.getSolution(); // Y is an array of 2-D points that you can plot
  }

  var date2 = new Date();
  var n2 = date2.getTime();  
  var time = (n2-n1)/1000;
  console.log("Time to run T-SNE: " + time);

  var tsneLables = new Array();

  var tempGeneralViewGraph = "{";

  //add nodes
  var documentNewIndex = [];
  var index = 0;
  tempGeneralViewGraph += "\"nodes\":[";
  for (var i = 0; i < documentDocumentSimilarity.length; i++) {
    if(removedDocuments[i] == false) 
    {
      documentNewIndex[i] = index;
      
      var documentClustersName = getDocumentClustersName(documentsName[i]);
      tempGeneralViewGraph += "{\"x\": " + (tsneResult[i][0] + scale_width) * 6
                            + ", \"y\": " + (tsneResult[i][1] + scale_height) * 6
                            + ", \"fixed\":false"
                            + ", \"na\":\"" + documentsName[i]                            
                            + "\", \"cl\":\"" + documentClustersName 
                            + "\", \"co\":\"";

      tsneLables[index] = documentClustersName.split(",")[0];
      index++;

      if(documentClustersName.split(",").length > 1) {
        tempGeneralViewGraph += "black\"},";      
      } else {
        tempGeneralViewGraph += getClusterColor(documentClustersName) + "\"},";
      }
    }    
  };

  //get tsne avg silhouette
  if(tsneSilhouetteState) 
  {   
    getTsneSilhouette(tsneResult, tsneLables);
  }

  //remove the last comma
  tempGeneralViewGraph = tempGeneralViewGraph.substring(0, tempGeneralViewGraph.length - 1);

  tempGeneralViewGraph += "],";

  //add links
  var count = 0;
  tempGeneralViewGraph += "\"links\":[";
  for (var i = 0; i < documentDocumentSimilarity.length; i++) {
    if(removedDocuments[i] == false) 
    {
      for (var j = 0; j < documentDocumentSimilarity.length; j++) {
        if(removedDocuments[j] == false) 
        {
          if(i != j) {// no self loop (cycle)
            if(parseFloat(documentDocumentSimilarity[i][j]) <= similarityThreshold ) {
              tempGeneralViewGraph += "{\"source\":"+documentNewIndex[i]+",\"target\":"
                +documentNewIndex[j]+",\"v\":"+documentDocumentSimilarity[i][j]+"},";
                count++;
            }
          }
        }
      }
    }
  }

  //remove the last comma
  tempGeneralViewGraph = tempGeneralViewGraph.substring(0, tempGeneralViewGraph.length - 1);

  tempGeneralViewGraph += "]}";

  generalViewGraph2 = JSON.parse(tempGeneralViewGraph);

  var date3 = new Date();
  var n3 = date3.getTime();  
  time = (n3-n2)/1000;
  console.log("Time to create graph: " + time);

  return JSON.parse(tempGeneralViewGraph);  
}

/*
 * Get  Silhouette
 * @param tsneResult =  x and y dimensions 
 * @param tsneLables = labels of documents
 */
function getTsneSilhouette(tsneResult, tsneLables) {

  $.ajax({
    type: "POST",
    url: "./cgi-bin/tsneSilhouette.py",
    data: { tsneResult:JSON.stringify(tsneResult),
            tsneLables:JSON.stringify(tsneLables)},                
    success: function( msg ) {

      var status = msg['status'];

      if (status == "yes") {
        TsneSilhouette = eval(msg['TsneSilhouette']);
        TsneSilhouette = TsneSilhouette.toFixed(4);

        //show the tsne Silhouette
        $("#TsneSilhouette_label").html( "T-SNE Silhouette: " + TsneSilhouette);
      }
      if (status == "no") {
        alert("Error1 in getting Tsne Silhouette!");
      } 
      if (status == "error") {        
        alert("Error2 in getting Tsne Silhouette!");
      }                   
    },
    error: function(msg){            
       alert("Error3 in getting Tsne Silhouette!");
    }
  });
}

/*
 * Get general view graph
 * @param similarityThreshold = the similarity threshold
 * @return graph in VNA format
 */
function exportGraphToVNAformat(similarityThreshold) {
  saveLog("exportGraphToVNAformat");

  if(userID == "") {
    return null;
  }

  //get VNA
  var vna = getVNA(similarityThreshold);

  //save VNA to file
   $.ajax({
    type: "POST",
    url: "./cgi-bin/VNASave.py",
    data: { vna:JSON.stringify(vna),
            userDirectory:JSON.stringify(userDirectory)},                
    success: function( msg ) {

      var status = msg['status'];

      if (status == "yes") {
        //open the link of VNA in new Tab
        window.open("./" + userID + "/vna",'_blank');
      }
      if (status == "no") {
        alert("Error1 in getting graph VNA!");
      }
                    
    },
    error: function(msg){            
       alert("Error2 in getting graph VNA!");
    }
  });
 }

/*
 * Get general view graph
 * @param similarityThreshold = the similarity threshold
 * @return graph in VNA format
 */
function getVNA(similarityThreshold) {

  saveLog("getVNA");

  var VNA_Format = "*Node data\n";
  VNA_Format += "id name clusters color\n";

  //add nodes
  var documentNewIndex = [];
  var index = 0;
  for (var i = 0; i < documentDocumentSimilarity.length; i++) {
    if(removedDocuments[i] == false) 
    {
      documentNewIndex[i] = index;
      
      var documentClustersName = getDocumentClustersName(documentsName[i]);
      VNA_Format += index + " " + "\"" + documentsName[i] + "\" \"" + documentClustersName + "\" \"";

      index++;

      if(documentClustersName.split(",").length > 1) {
        VNA_Format += "black\"\n";      
      } else {
        VNA_Format += getClusterColor(documentClustersName) + "\"\n";
      }
    }    
  };

  //add links
  VNA_Format += "*Tie data\n";
  VNA_Format += "from to distance\n";

  for (var i = 0; i < documentDocumentSimilarity.length; i++) {
    if(removedDocuments[i] == false) 
    {
      for (var j = 0; j < documentDocumentSimilarity.length; j++) {
        if(removedDocuments[j] == false) 
        {
          if(i != j) {// no self loop (cycle)
            if(parseFloat(documentDocumentSimilarity[i][j]) <= similarityThreshold ) {
              VNA_Format += documentNewIndex[i]+" "+documentNewIndex[j]+" "+documentDocumentSimilarity[i][j]+"\n";
            }
          }
        }
      }
    }
  }

  return VNA_Format; 
}

/*
 * Get cluster color
 * @param clusterName = cluster Name
 * @return color of the cluster
 */
function getClusterColor(clusterName) {
  if(clusterName != "") {
    return rgb2hex($("#"+ clusterName + " p").css("background-color"));
  }
  else {
    return "#FF0000";
  }
  
}

/*
 * Get name of clusters that the document belongs to
 * @param documentName = document Name
 * @return the list of clusters seperated with comma
 */
function getDocumentClustersName(documentName) {

  var clusterList = "";

  for (var i = 0; i < clusterDocuments.length; i++) {
    for (var j = 0; j < clusterDocuments[i].docs.length; j++) {
      if(clusterDocuments[i].cluster != "@!@@@%%@@@@%@@!!!@@") 
      {
        if(clusterDocuments[i].docs[j].ID == documentName) {
          if(clusterList == "") {
            clusterList = clusterDocuments[i].cluster;
          } else {
           clusterList += "," + clusterDocuments[i].cluster;
          }
        }        
      }
    }
  }

  return clusterList;
}

/*
 * Change Cosine distance of general view graph
 * @param value = value
 */
function graphCosineDistanceChange(value) {

  $("#forceSilhouette_label").html("");

  saveLog("graphCosineDistanceChange");

 if(userID != "") {
      value = value / 100;

      //exit highligted node
      node.style("stroke", function(o) {
          if(o.na == $(doc_select).val()) {
            return "red";
          }
          // else if(docsHighlight[o.na]) 
          // {
          //   return "blue";
          // }
          else {          
            return "#a6a6a6";
          }
      })
      node.style("opacity", 1);            
      link.style("opacity", 1);
      link.style("stroke", "#a6a6a6");

       node2.style("stroke", function(o) {
          if(o.na == $(doc_select).val()) {
            return "red";
          }
          // else if(docsHighlight[o.na]) 
          // {
          //   return "blue";
          // }
          else {          
            return "#a6a6a6";
          }
      })
      node2.style("opacity", 1);            
      link2.style("opacity", 1);
      link2.style("stroke", "#a6a6a6");

      var newLinks = generalViewGraph.links.filter(function(n) {        
        if(n.v <= value) {          
          return n;
        }        
      });

      var newLinks2 = generalViewGraph2.links.filter(function(n) {        
        if(n.v <= value) {          
          return n;
        }        
      });    

      //for links
      force.links(newLinks).resume();
      link = link.data(newLinks);
      link.exit().remove();
      link.enter().append("line")
        .attr("class", "link");
      force.start(); 

      force2.links(newLinks2).resume();
      link2 = link2.data(newLinks2);
      link2.exit().remove();
      link2.enter().append("line")
        .attr("class", "link"); 
      force2.start();  

      linkedByIndex = new Array();
      newLinks.forEach(function(d) { linkedByIndex[d.source.index + "," + d.target.index] = true;  });

      linkedByIndex2 = new Array();
      newLinks2.forEach(function(d) { linkedByIndex2[d.source.index + "," + d.target.index] = true;  });

      //update # links statistics
      $("#span4").text(newLinks.length/2);
  } 
}

/*
 * Change link distance of general view graph
 * @param value = value
 */
function graphLinkDistanceChange(value) {

  saveLog("graphLinkDistanceChange");
  $("#forceSilhouette_label").html("");

  if(userID != "") {
    linkDistance = value;
    force2.linkDistance(linkDistance);
    force2.start();
  }
}

/*
 * Change Gravity of general view graph
 * @param value = value
 */
function graphGravityChange(value) {
  saveLog("graphGravityChange");
  $("#forceSilhouette_label").html("");

  if(userID != "") {
    gravity = (value / 100);
    force2.gravity(gravity);

  force2.start();
  }
}

/*
 * Highlight the document in general view graph
 * @param docName = docuemnt name
 */
function highlightDocGeneralView(docName) {

  node.style("stroke", function(o) {
        if(o.na == docName) {
          return "red";
        }
        // else if(docsHighlight[o.na]) 
        // {
        //   return "blue";
        // }
        else {          
          return "#a6a6a6";
        }
  });

  node.style("stroke-width", function(o) {
        if(o.na == docName) {
          return "2px";
        }
        // else if(docsHighlight[o.na]) 
        // {
        //   return "2px";
        // }
        else {          
          return "0.5px";
        }
  });

  node2.style("stroke", function(o) {
        if(o.na == docName) {
          return "red";
        }
        // else if(docsHighlight[o.na]) 
        // {
        //   return "blue";
        // }
        else {          
          return "#a6a6a6";
        }
  });

  node2.style("stroke-width", function(o) {
        if(o.na == docName) {
          return "2px";
        }
        // else if(docsHighlight[o.na]) 
        // {
        //   return "2px";
        // }
        else {          
          return "0.5px";
        }
  });
}

/**
 * Show the term cload of the document 
* @param documentName = docuemnt name
 */
function showDocumentCloud(documentName) {

  saveLog("showDocumentCloud");

  if($("#doc_content").text().length <= 1) {
    return null;
  }

  //get sorted list of top terms of the document
  var terms = getDocumentTermsSorted(documentName);

  //get top 30 terms
  var wordsTemp = "";
  for (var i = 0; i < terms.length; i++) {
    if(i == 0 ) {
        wordsTemp += terms[i][0] + "|" + Math.floor(terms[i][1]*15); 
      } 
    else {
        wordsTemp += "|" + terms[i][0] + "|" + Math.floor(terms[i][1]*15);
      }

    if(i >= 29) {
      break;
    }
  }

  //clear the cloud
  $("#panel8_2").html("");

  if(wordsTemp != "") {
    var words = wordsTemp.split("|");
    var x = document.getElementById("cloudColor");
    var title = "Term Cloud (Selected Document)";
    wordCloud(wordText(words), sizeOfText(words), "panel8_2", "panel8", x.checked, title);
  }

}

/**
 * For right click in general view graph
 */
$(function(){
    $.contextMenu({
        selector: '.context-menu-four', 
        callback: function(key, options) {         

          if(key == "ShowCloud") {
            showSelectedDocumentsCloud();
          }
            
        },
        items: {            
            "ShowCloud": {name: "ShowCloud", icon: "edit"}
        }
    });
 
});

/**
 * Show the terms cloud of selected documents in general view graph
 */
function showSelectedDocumentsCloud() {
  
  //no user no job!
  if(userID == "") {
    return null;
  }

  //get the names of the selected documents
  var selectedDocuments = new Array();

  var index = 0;
  node.filter(function(o, i) {
    if($($(".node")[i]).css("opacity") == 1) {
      selectedDocuments[index] = o.na;
      index++;
    }
  }); 

  //get terms of each document and aggregate the terms
  var aggregatedTerms = new Array(allWords.length);//allWords.length + 1);//hashmap of terms
  // aggregatedTerms["allWords[i]"] = 0.003;
    
  for (var i = 0; i < allWords.length; i++) {//initialize the aggregatedTerms
    aggregatedTerms[allWords[i]] = parseFloat(0.0);
  }

  for (var i = 0; i < selectedDocuments.length; i++) {
    var temp = termDocumentSimilarity[documentsName.indexOf(selectedDocuments[i])];

    //add the value of each term to the aggregatedTerms
    for (var j = 0; j < temp.length; j++) {

      try {
        aggregatedTerms[allWords[j]] = (aggregatedTerms[allWords[j]] + parseFloat(temp[j]));    
      }
      catch(err) {
        // console.log(err.message);
      }
    }
  }  

  //divide the terms value by total number of selected documents (normalization of values)
  for (var term in aggregatedTerms)
    aggregatedTerms[term] = (aggregatedTerms[term] / selectedDocuments.length);
  
  //sort the aggregated terms
  var aggregatedTermsSorted = [];
  for (var term in aggregatedTerms)
      aggregatedTermsSorted.push([term, aggregatedTerms[term]]);

  aggregatedTermsSorted.sort(function(a, b) {return b[1] - a[1]}); 
  
  //get top 30 terms
  var wordsTemp = "";
  for (var i = 0; i < aggregatedTermsSorted.length; i++) {
    if(i == 0 ) {
        wordsTemp += aggregatedTermsSorted[i][0] + "|" + Math.floor(aggregatedTermsSorted[i][1]*30); 
      } 
    else {
        wordsTemp += "|" + aggregatedTermsSorted[i][0] + "|" + Math.floor(aggregatedTermsSorted[i][1]*30);
      }

    if(i >= 29) {
      break;
    }
  }

  //clear the cloud
  $("#panel8_2").html("");

  //show the terms in Term Cloud view
  if(wordsTemp != "") {
    var words = wordsTemp.split("|");
    var x = document.getElementById("cloudColor");
    var title = "Term Cloud (Selected Nodes)";
    wordCloud(wordText(words), sizeOfText(words), "panel8_2", "panel8", x.checked, title);
  }
}

/**
 * show the cluster nodes in general view graph
 * @param clusterName = neme of cluster
 */
function showClusterNodes(clusterName) {
  node.style("opacity", function(o) {
    
    if(o.co != "black") {
      return o.cl == clusterName ? 1 : highlight_trans;
    }
    else {
      var temp = o.cl.split(",");
      for (var i = 0; i < temp.length; i++) {
        if(temp[i] == clusterName) {
          return 1;
        }
      };

      return highlight_trans;      
    }
    
  });
      
  link.style("opacity", function(o) {
    if(o.source.co != "black" && o.target.co != "black") {
        return o.source.cl == clusterName && o.target.cl == clusterName ? 1 : highlight_trans;
    } 
    else {
      var tempSource = o.source.cl.split(",");
      var sourceCluster = "";
      for (var i = 0; i < tempSource.length; i++) {
        if(tempSource[i] == clusterName) {
          sourceCluster = clusterName;
          break;
        }
      }

      var tempTarget = o.target.cl.split(",");
      var targetCluster = "";
      for (var i = 0; i < tempTarget.length; i++) {
        if(tempTarget[i] == clusterName) {
          targetCluster = clusterName;
          break;
        }
      }

      return sourceCluster == clusterName && targetCluster == clusterName ? 1 : highlight_trans;
    }
  });

    node2.style("opacity", function(o) {
    
    if(o.co != "black") {
      return o.cl == clusterName ? 1 : highlight_trans;
    }
    else {
      var temp = o.cl.split(",");
      for (var i = 0; i < temp.length; i++) {
        if(temp[i] == clusterName) {
          return 1;
        }
      };

      return highlight_trans;      
    }
    
  });
      
  link2.style("opacity", function(o) {
    if(o.source.co != "black" && o.target.co != "black") {
        return o.source.cl == clusterName && o.target.cl == clusterName ? 1 : highlight_trans;
    } 
    else {
      var tempSource = o.source.cl.split(",");
      var sourceCluster = "";
      for (var i = 0; i < tempSource.length; i++) {
        if(tempSource[i] == clusterName) {
          sourceCluster = clusterName;
          break;
        }
      }

      var tempTarget = o.target.cl.split(",");
      var targetCluster = "";
      for (var i = 0; i < tempTarget.length; i++) {
        if(tempTarget[i] == clusterName) {
          targetCluster = clusterName;
          break;
        }
      }

      return sourceCluster == clusterName && targetCluster == clusterName ? 1 : highlight_trans;
    }
  });
}

/**
 * Save log of user operations.
 * @param command = The number related to a command
 */
function saveLog(command)
{
    $.ajax({
        url: "./cgi-bin/saveLog.py",
        type: "POST",
        cache: false,
        traditional: true,
        data: {userDirectory : JSON.stringify(userID), command : JSON.stringify(command)}
    });
}

/**
 * Get Silhouette of force layout.
 */
function forceSilhouette() {
  saveLog("forceSilhouette");

  force2.stop();

  $("#forceSilhouette_label").html("");
  
  var nodes = $(".node2");

  var forceResult = new Array();
  var forceLables = new Array();

  for (var i = 0; i < nodes.length; i++) {
    forceResult[i] = new Array();
    forceResult[i][0] = parseFloat($(nodes[i]).attr("cx"));
    forceResult[i][1] = parseFloat($(nodes[i]).attr("cy"));

    forceLables[i] = $(nodes[i]).css("fill");    
  }

  getForceSilhouette(forceResult, forceLables);
}

/*
 * Get  force Silhouette
 * @param forceResult =  x and y dimensions 
 * @param forceLables = labels of documents
 */
function getForceSilhouette(forceResult, forceLables) {

  $.ajax({
    type: "POST",
    url: "./cgi-bin/tsneSilhouette.py",
    data: { tsneResult:JSON.stringify(forceResult),
            tsneLables:JSON.stringify(forceLables)},                
    success: function( msg ) {

      var status = msg['status'];

      if (status == "yes") {
        var forceSilhouette = eval(msg['TsneSilhouette']);
        forceSilhouette = forceSilhouette.toFixed(4);

        //show the tsne Silhouette
        $("#forceSilhouette_label").html( "Force layout Silhouette: " + forceSilhouette);
      }
      if (status == "no") {
        alert("Error1 in getting Force Silhouette!");
      } 
      if (status == "error") {        
        alert("Error2 in getting Force Silhouette!");
      }                   
    },
    error: function(msg){            
       alert("Error3 in getting Force Silhouette!");
    }
  });
}