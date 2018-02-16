/**************************
 * Author: Ehsan Sherkat  *
 * Copyright: 2015        *
 **************************/

 /**
 * The clustering algorithm confidence level change
 */
$(function() {
    var slider = $('#slider0').slider({
      orientation: "horizontal",
      range: "min",
      max: 100,
      value: 50,
      change: function(event, ui) {
        $("#slider0_Textbox").val(ui.value);
      },
      slide: function(event, ui) {
        $("#slider0_Textbox").val(ui.value);
      }
    });
});

function changeSlider0() {
  var value = $("#slider0_Textbox").val();
  if(parseInt(value) != "NaN" && value != "") {
     $("#slider0").slider("value", parseInt(value));
  } 
}

$(function() {
  $("#slider0_Textbox").val("50");
  $("#slider0_Textbox").click(function() { $(this).select(); } ); 
});

/**
 * The Cosine Similarity slider for general view panel
 */
$(function() {
    var slider = $('#slider1').slider({
      orientation: "horizontal",
      range: "min",
      max: 97,
      value: 50,
      change: function(event, ui) {
        graphCosineDistanceChange(ui.value);
        $("#slider1_Textbox").val(ui.value);
      },
      slide: function(event, ui) {
        graphCosineDistanceChange(ui.value);
        $("#slider1_Textbox").val(ui.value);
      }
    });
});

function changeSlider1() {
  var value = $("#slider1_Textbox").val();
  if(parseInt(value) != "NaN" && value != "") {
     $("#slider1").slider("value", parseInt(value));
  } 
}

$(function() {
  $("#slider1_Textbox").val("50");
  $("#slider1_Textbox").click(function() { $(this).select(); } ); 
});

/**
 * The link distance slider for generla view panel
 */
$(function() {
    var slider = $('#slider2').slider({
      orientation: "horizontal",
      range: "min",
      max: 100,
      value: 20,
      change: function(event, ui) {
        graphLinkDistanceChange(ui.value);
        $("#slider2_Textbox").val(ui.value);
      },
      slide: function(event, ui) {
        graphLinkDistanceChange(ui.value);
        $("#slider2_Textbox").val(ui.value);
      }
    });
});

/**
 * The perplexity slider for t-SNE
 */
$(function() {
    var slider = $('#slider4').slider({
      orientation: "horizontal",
      range: "min",
      min: 5,
      max: 50,
      value: 18,
      change: function(event, ui) {
        graphLinkDistanceChange(ui.value);
        $("#slider4_Textbox").val(ui.value);
      },
      slide: function(event, ui) {
        graphLinkDistanceChange(ui.value);
        $("#slider4_Textbox").val(ui.value);
      }
    });
});

$(function() {
  $("#slider4_Textbox").val("18");
  $("#slider4_Textbox").click(function() { $(this).select(); } ); 
});

function changeSlider2() {
  var value = $("#slider2_Textbox").val();
  if(parseInt(value) != "NaN" && value != "") {
     $("#slider2").slider("value", parseInt(value));
  } 
}

function changeSlider4() {
  var value = $("#slider4_Textbox").val();
  if(parseInt(value) != "NaN" && value != "") {
     $("#slider4").slider("value", parseInt(value));
  } 
}

$(function() {
  $("#slider2_Textbox").val("20");
  $("#slider2_Textbox").click(function() { $(this).select(); } ); 
});

/**
 * The Gravity slider for generla view panel
 */
$(function() {
    var slider = $('#slider3').slider({
      orientation: "horizontal",
      range: "min",
      max: 100,
      value: 30,
      change: function(event, ui) {
        graphGravityChange(ui.value);
        $("#slider3_Textbox").val(ui.value);
      },
      slide: function(event, ui) {
        graphGravityChange(ui.value);
        $("#slider3_Textbox").val(ui.value);
      }
    });
});

function changeSlider3() {
  var value = $("#slider3_Textbox").val();
  if(parseInt(value) != "NaN" && value != "") {
     $("#slider3").slider("value", parseInt(value));
  } 
}

$(function() {
  $("#slider3_Textbox").val("30");
  $("#slider3_Textbox").click(function() { $(this).select(); } ); 
});

//for resizing pannels
$(function() {
    $( ".resizable" ).resizable({
  handles: "e, s, w"
});
});

$(function() {
    var draggableDiv = $( "#panel2" ).draggable({
  	obstacle: "#panel1", 
    containment: "body",
    distance: 10,
    opacity: 0.55,
    preventCollision: true,
	});

  // disable the dragable for the text 
  // in order to be selectable
  $('#doc_content', draggableDiv).mousedown(function(ev) {
     draggableDiv.draggable('disable');
      }).mouseup(function(ev) {
     draggableDiv.draggable('enable');
    });
  }
);

$(function() {
    var draggableDiv = $( "#panel3" ).draggable({
  	obstacle: "#panel1", 
    containment: "body",
    distance: 10,
    opacity: 0.55,
    preventCollision: true,
	});

  // disable the dragable for the word list 
  // in order to be selectable
  $('#word_lists', draggableDiv).mousedown(function(ev) {
     draggableDiv.draggable('disable');
      }).mouseup(function(ev) {
     draggableDiv.draggable('enable');
    });
  }
);

$(function() {
  var draggableDiv = $( "#panel4" ).draggable({
  	obstacle: "#panel1", 
    containment: "body",
    distance: 10,
    opacity: 0.55,
    preventCollision: true,    
	});

  // disable the dragable for the clusters
  // in order to be selectable
  $('#panel4_1', draggableDiv).mousedown(function(ev) {
     draggableDiv.draggable('disable');
      }).mouseup(function(ev) {
     draggableDiv.draggable('enable');
  });

});

$(function() {
    var draggableDiv = $( "#panel5" ).draggable({
  	obstacle: "#panel1", 
    containment: "body",
    distance: 10,
    opacity: 0.55,
    preventCollision: true,
	});

  // disable the dragable for the cluster_tree_view
  $('#cluster_tree_view', draggableDiv).mousedown(function(ev) {
     draggableDiv.draggable('disable');
      }).mouseup(function(ev) {
     draggableDiv.draggable('enable');
  });

});

$(function() {
    var draggableDiv = $( "#panel6" ).draggable({
  	obstacle: "#panel1", 
    containment: "body",
    distance: 10,
    opacity: 0.55,
    preventCollision: true,
	});

  // disable the dragable for svg
  $("#DocumentClusterView", draggableDiv).mousedown(function(ev) {
     draggableDiv.draggable('disable');
      }).mouseup(function(ev) {
     draggableDiv.draggable('enable');
    });

});

$(function() {
    var draggableDiv = $( "#panel7" ).draggable({
  	obstacle: "#panel1", 
    containment: "body",
    distance: 10,
    opacity: 0.55,
    preventCollision: true,
	});

  // disable the dragable for svg
  $("#TermClusterView", draggableDiv).mousedown(function(ev) {
     draggableDiv.draggable('disable');
      }).mouseup(function(ev) {
     draggableDiv.draggable('enable');
    });
});

$(function() {
    var draggableDiv = $( "#panel8" ).draggable({
  	obstacle: "#panel1", 
    containment: "body",
    opacity: 0.55,
    distance: 10,
    preventCollision: true,
	});

  // disable the dragable for term cloud svg
  $("#panel8_2", draggableDiv).mousedown(function(ev) {
     draggableDiv.draggable('disable');
      }).mouseup(function(ev) {
     draggableDiv.draggable('enable');
    });
});

$(function() {
    var draggableDiv = $( "#panel9" ).draggable({
  	obstacle: "#panel1", 
    containment: "body",
    distance: 10,
    opacity: 0.55,
    preventCollision: true,
	});

  // disable the dragable for the general view (T-SNE)
  // in order to be selectable
  $('#general_view1', draggableDiv).mousedown(function(ev) {
     draggableDiv.draggable('disable');
      }).mouseup(function(ev) {
     draggableDiv.draggable('enable');
    });

  // disable the dragable for the general view 2 (force layout)
  // in order to be selectable
  $('#general_view2', draggableDiv).mousedown(function(ev) {
     draggableDiv.draggable('disable');
      }).mouseup(function(ev) {
     draggableDiv.draggable('enable');
    });
});

//for tabs in general view
$(function() {
    $( "#tabs" ).tabs();
});

// *************** sortable list
$(function() {
    $( ".sortable" ).sortable();
    $( ".sortable" ).disableSelection();
    saveLog("sortable");
});

// //terms list
$(function() {
    $( "#selectable" ).selectable( { 
      cancel: "span",     
    });
});

// ***** cluster tree view init
$(function () { 
  $('#cluster_tree_view').jstree(); 
});

//****** buttons help tooltips
$(function () {
  $('#button1').qtip({ 
      content: {
          text: 'Help'
      },

      position: {
        my: 'top center',
        at: 'bottom center'
      },

      style: {
        classes: 'qtip-rounded qtip-shadow'
      }
  })
  $('#button2').qtip({ 
      content: {
          text: 'Upload Document'
      },

      position: {
        my: 'top center',
        at: 'bottom center'
      },

      style: {
        classes: 'qtip-rounded qtip-shadow'
      }
  })
  $('#button3').qtip({ 
      content: {
          text: 'Save Session'
      },

      position: {
        my: 'top center',
        at: 'bottom center'
      },

      style: {
        classes: 'qtip-rounded qtip-shadow'
      }
  })
  $('#button4').qtip({ 
      content: {
          text: 'Cluster'
      },

      position: {
        my: 'top center',
        at: 'bottom center'
      },

      style: {
        classes: 'qtip-rounded qtip-shadow'
      }
  })
  $('#textbox1').qtip({ 
      // content: {
      //     text: 'Input a term to search!'
      // },

      // position: {
      //   my: 'top left',
      //   at: 'bottom left'
      // },

      // style: {
      //   classes: 'qtip-rounded qtip-shadow'
      // }
  })
  $('#button6').qtip({ 
      content: {
          text: 'Cluster Cloud'
      },

      position: {
        my: 'top center',
        at: 'bottom center'
      },

      style: {
        classes: 'qtip-rounded qtip-shadow'
      }
  })
  $('#button7').qtip({ 
      content: {
          text: 'My Cloud'
      },

      position: {
        my: 'top center',
        at: 'bottom center'
      },

      style: {
        classes: 'qtip-rounded qtip-shadow'
      }
  })
  $('#button8').qtip({ 
      content: {
          text: 'Clear Cloud'
      },

      position: {
        my: 'top center',
        at: 'bottom center'
      },

      style: {
        classes: 'qtip-rounded qtip-shadow'
      }
  })
  $('#button14').qtip({ 
      content: {
          text: 'Delete Session'
      },

      position: {
        my: 'top center',
        at: 'bottom center'
      },

      style: {
        classes: 'qtip-rounded qtip-shadow'
      }
  })  
  $('#button11').qtip({ 
      content: {
          text: 'MindMap'
      },

      position: {
        my: 'bottom center',
        at: 'top center'
      },

      style: {
        classes: 'qtip-rounded qtip-shadow'
      }
  })
  $('#button41').qtip({ 
      content: {
          text: 'Change Perplexity'
      },

      position: {
        my: 'bottom center',
        at: 'top center'
      },

      style: {
        classes: 'qtip-rounded qtip-shadow'
      }
  })
  $('#button12').qtip({ 
      content: {
          text: 'Add Cluster'
      },

      position: {
        my: 'top center',
        at: 'bottom center'
      },

      style: {
        classes: 'qtip-rounded qtip-shadow'
      }
  })
  $('#session_select').qtip({ 
      content: {
          text: 'Select Session'
      },

      position: {
        my: 'top center',
        at: 'bottom center'
      },

      style: {
        classes: 'qtip-rounded qtip-shadow'
      }
  })
  $('#button18').qtip({ 
      show: 'click',
      hide: 'click',
      content: {
          text: "<p>Write note about session:</p><textarea id=\"sessionNote\" rows=\"10\" cols=\"30\" autofocus></textarea>"
      },
      position: {
        my: 'top center',
        at: 'bottom center'
      },
      style: {
        classes: 'qtip-rounded qtip-shadow'
      }
  })
  $('#button15').qtip({ 
      content: {
          text: 'ShowPDF'
      }, 

      position: {
        my: 'bottom center',
        at: 'top center'
      },

      style: {
        classes: 'qtip-rounded qtip-shadow'
      }
  })
  $('#slider1_Textbox').qtip({ 
      content: {
          text: 'Cosine Distance (%)'
      },

      position: {
        my: 'bottom center',
        at: 'top center'
      },

      style: {
        classes: 'qtip-rounded qtip-shadow'
      }
  })
  $('#slider4_Textbox').qtip({ 
      content: {
          text: 'Perplexity'
      },

      position: {
        my: 'bottom center',
        at: 'top center'
      },

      style: {
        classes: 'qtip-rounded qtip-shadow'
      }
  })
  $('#slider2_Textbox').qtip({ 
      content: {
          text: 'Link Distance [0-100]'
      },

      position: {
        my: 'bottom center',
        at: 'top center'
      },

      style: {
        classes: 'qtip-rounded qtip-shadow'
      }
  })
  $('#slider3_Textbox').qtip({ 
      content: {
          text: 'Gravity (%)'
      },

      position: {
        my: 'bottom center',
        at: 'top center'
      },

      style: {
        classes: 'qtip-rounded qtip-shadow'
      }
  })
  $('#button16').qtip({ 
      content: {
          text: 'Show Cloud'
      },

      position: {
        my: 'bottom center',
        at: 'top center'
      },

      style: {
        classes: 'qtip-rounded qtip-shadow'
      }
  })
   $('#button19').qtip({ 
      content: {
          text: 'Force layout Silhouette'
      },

      position: {
        my: 'bottom center',
        at: 'top center'
      },

      style: {
        classes: 'qtip-rounded qtip-shadow'
      }
  })
  $('#button17').qtip({ 
      content: {
          text: 'Graph VNA'
      },

      position: {
        my: 'bottom center',
        at: 'top center'
      },

      style: {
        classes: 'qtip-rounded qtip-shadow'
      }
  })
  $('#auto_save_session_text').qtip({ 
      content: {
          text: 'Automatically save session before reclustering.'
      },

      position: {
        my: 'top center',
        at: 'bottom center'
      },

      style: {
        classes: 'qtip-rounded qtip-shadow'
      }
  })
  $('#slider0_Textbox').qtip({ 
      content: {
          text: 'User confidence level'
      },

      position: {
        my: 'top center',
        at: 'bottom center'
      },

      style: {
        classes: 'qtip-rounded qtip-shadow'
      }
  })        
});//end of buttons help tooltips
