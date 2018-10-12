'use strict';

// Location of data files
var trialsFile = "";
const menuD1B2AFile = "./data/menu_d1_b2A.csv"
const menuD1B2BFile = "./data/menu_d1_b2B.csv"
const menuD1B4File  = "./data/menu_d1_b4.csv"
const menuD2B2AFile = "./data/menu_d2_b2A.csv"
const menuD2B2BFile = "./data/menu_d2_b2B.csv"
const menuD2B4File  = "./data/menu_d2_b4.csv"
const menuD3B2AFile = "./data/menu_d3_b2A.csv"
const menuD3B2BFile = "./data/menu_d3_b2B.csv"
const menuD3B4File  = "./data/menu_d3_b4.csv"

// Global variables
var menu;
var trialsData = [];
var numTrials = 0;
var currentTrial = 1;
var markingMenuD1B2A = [];
var markingMenuD1B2B = [];
var markingMenuD1B4  = [];
var markingMenuD2B2A = [];
var markingMenuD2B2B = [];
var markingMenuD2B4  = [];
var markingMenuD3B2A = [];
var markingMenuD3B2B = [];
var markingMenuD3B4  = [];
var radialMenuTree = null;
var radialMenuD1B2A = [];
var radialMenuD1B2B = [];
var radialMenuD1B4  = [];
var radialMenuD2B2A = [];
var radialMenuD2B2B = [];
var radialMenuD2B4  = [];
var radialMenuD3B2A = [];
var radialMenuD3B2B = [];
var radialMenuD3B4  = [];
var tracker = new ExperimentTracker();
var markingMenuSubscription = null;
var radialMenuSvg = null;

var participantType = null;

function getParticipantId() {
	var participantId = prompt("Enter your participant id", "1");

	participantType = participantId%4; // Get participant type from 0-3.
	if (participantType == 1) {
		trialsFile = "./data/experiment_1.csv";
	} else if (participantType == 2) {
		trialsFile = "./data/experiment_2.csv";
	} else if (participantType == 3) {
		trialsFile = "./data/experiment_3.csv";
	} else if (participantType == 0) {
		trialsFile = "./data/experiment_4.csv";
	}

	initExperiment();
}

// Load CSV files from data and return text
function getData(relativePath) {
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open("GET", relativePath, false);
	xmlHttp.send(null);
	return xmlHttp.responseText;
}


// Loads the CSV data files on page load and store it to global variables
function initExperiment() {

	// Get Trails
	var data = getData(trialsFile);

	var records = data.split("\n");
	numTrials = records.length - 1;
	for (var i = 1; i <= numTrials; i++) {
		var cells = records[i].split(",");
		var menuType = cells[0].trim();
		var menuDepth = cells[1].trim();
		var menuBreadth = cells[2].trim();
		var targetItem = cells[3].trim();
		trialsData[i] = {
			'Menu Type': menuType,
			'Menu Depth': menuDepth,
			'Menu Breadth': menuBreadth,
			'Target Item': targetItem
		};
	}

	// Get Menus
	var menuD1B2AData = getData(menuD1B2AFile);
	var menuD1B2BData = getData(menuD1B2BFile);
	var menuD1B4Data  = getData(menuD1B4File);
	var menuD2B2AData = getData(menuD2B2AFile);
	var menuD2B2BData = getData(menuD2B2BFile);
	var menuD2B4Data  = getData(menuD2B4File);
	var menuD3B2AData = getData(menuD3B2AFile);
	var menuD3B2BData = getData(menuD3B2BFile);
	var menuD3B4Data  = getData(menuD3B4File);
	
	// Format CSV Menu to respective Menu structures
	markingMenuD1B2A = formatMarkingMenuData(menuD1B2AData);
	markingMenuD1B2B = formatMarkingMenuData(menuD1B2BData);
	markingMenuD1B4  = formatMarkingMenuData(menuD1B4Data);
	markingMenuD2B2A = formatMarkingMenuData(menuD2B2AData);
	markingMenuD2B2B = formatMarkingMenuData(menuD2B2BData);
	markingMenuD2B4  = formatMarkingMenuData(menuD2B4Data);
	markingMenuD3B2A = formatMarkingMenuData(menuD3B2AData);
	markingMenuD3B2B = formatMarkingMenuData(menuD3B2BData);
	markingMenuD3B4  = formatMarkingMenuData(menuD3B4Data);
	radialMenuD1B2A = formatRadialMenuData(menuD1B2AData);
	radialMenuD1B2B = formatRadialMenuData(menuD1B2BData);
	radialMenuD1B4  = formatRadialMenuData(menuD1B4Data);
	radialMenuD2B2A = formatRadialMenuData(menuD2B2AData);
	radialMenuD2B2B = formatRadialMenuData(menuD2B2BData);
	radialMenuD2B4  = formatRadialMenuData(menuD2B4Data);
	radialMenuD3B2A = formatRadialMenuData(menuD3B2AData);
	radialMenuD3B2B = formatRadialMenuData(menuD3B2BData);
	radialMenuD3B4  = formatRadialMenuData(menuD3B4Data);
	
	//Start the first trial
	nextTrial();
}

// Wrapper around nextTrial() to prevent click events while loading menus
function loadNextTrial(e){
	e.preventDefault();
	nextTrial();
	
}

// Move to next trai and record events
function nextTrial() {

	tracker.resetClickCount();

	if (currentTrial <= numTrials) {

		var menuType = trialsData[currentTrial]['Menu Type'];
		var menuDepth = trialsData[currentTrial]['Menu Depth'];
		var targetItem = trialsData[currentTrial]['Target Item'];
		var menuBreadth = trialsData[currentTrial]['Menu Breadth'];

		document.getElementById("trialNumber").innerHTML = String(currentTrial) + "/" + String(numTrials);
		document.getElementById("menuType").innerHTML = menuType;
		document.getElementById("menuDepth").innerHTML = menuDepth;
		document.getElementById("targetItem").innerHTML = targetItem;
		document.getElementById("selectedItem").innerHTML = "&nbsp;";
		// Set IV3 state over here
		document.getElementById("menuBreadth").innerHTML = menuBreadth;

		tracker.newTrial();
		tracker.trial = currentTrial;
		tracker.menuType = menuType;
		tracker.menuDepth = menuDepth;
		tracker.menuBreadth = menuBreadth;
		tracker.targetItem = targetItem;

		if (menuType === "Marking") {
				
			initializeMarkingMenu();
			
			if(menuDepth == 1){

				if(menuBreadth == 2) {
					if (targetItem == "Animals" || targetItem == "Food") {
						menu = MarkingMenu(markingMenuD1B2A, document.getElementById('marking-menu-container'));
					} else {
						menu = MarkingMenu(markingMenuD1B2B, document.getElementById('marking-menu-container'));						
					}
				} else if (menuBreadth == 4) {
					menu = MarkingMenu(markingMenuD1B4, document.getElementById('marking-menu-container'));
				}

			}
			else if(menuDepth == 2){

				if(menuBreadth == 2) {
					if (targetItem == "Fish" || targetItem == "Birds" || targetItem == "Fruit" || targetItem == "Vegetables") {
						menu = MarkingMenu(markingMenuD2B2A, document.getElementById('marking-menu-container'));
					} else { // targetItems are "Shoes", "Hats", "Asia", "Africa"
						menu = MarkingMenu(markingMenuD2B2B, document.getElementById('marking-menu-container'));
					}
				} else if (menuBreadth == 4) {
					menu = MarkingMenu(markingMenuD2B4, document.getElementById('marking-menu-container'));
				}

			}else if(menuDepth == 3){

				if(menuBreadth == 2) {
					if (targetItem == "Goldfish" || targetItem == "Shark" || targetItem == "Parrot" || targetItem == "Owl" ||
						targetItem == "Beef" || targetItem == "Pork" || targetItem == "Butter" || targetItem == "Milk") {
						menu = MarkingMenu(markingMenuD3B2A, document.getElementById('marking-menu-container'));
					} else { // targetItems are "T-Shirt", "Jacket", "Tights", "Jeans", "Germany", "England", "Brazil", "USA"
						menu = MarkingMenu(markingMenuD3B2B, document.getElementById('marking-menu-container'));
					}
				} else if (menuBreadth == 4) {
					menu = MarkingMenu(markingMenuD3B4, document.getElementById('marking-menu-container'));
				}
			}

			markingMenuSubscription = menu.subscribe((selection) => markingMenuOnSelect(selection));

		} else if (menuType === "Radial") {

			initializeRadialMenu();			
			if (menuDepth == 1){

				if(menuBreadth == 2) {
					if (targetItem == "Animals" || targetItem == "Food") {
						menu = createRadialMenu(radialMenuD1B2A);
					} else {
						menu = createRadialMenu(radialMenuD1B2B);						
					}
				} else if (menuBreadth == 4) {
					menu = createRadialMenu(radialMenuD1B4);
				}

			}
			else if(menuDepth == 2){

				if(menuBreadth == 2) {
					if (targetItem == "Fish" || targetItem == "Birds" || targetItem == "Fruit" || targetItem == "Vegetables") {
						menu = createRadialMenu(radialMenuD2B2A);
					} else { // targetItems are "Shoes", "Hat", "Asia", "Africa"
						menu = createRadialMenu(radialMenuD2B2B);
					}
				} else if (menuBreadth == 4) {
					menu = createRadialMenu(radialMenuD2B4);
				}

			}else if(menuDepth == 3){

				if(menuBreadth == 2) {
					if (targetItem == "Goldfish" || targetItem == "Shark" || targetItem == "Parrot" || targetItem == "Owl" ||
						targetItem == "Beef" || targetItem == "Pork" || targetItem == "Butter" || targetItem == "Milk") {
						menu = createRadialMenu(radialMenuD3B2A);
					} else { // targetItems are "T-Shirt", "Jacket", "Tights", "Jeans", "Germany", "England", "Brazil", "USA"
						menu = createRadialMenu(radialMenuD3B2B);
					}
				} else if (menuBreadth == 4) {
					menu = createRadialMenu(radialMenuD3B4);
				}
			}

		}

		currentTrial++;
	} else {
		
	    var nextButton = document.getElementById("nextButton");
	    nextButton.innerHTML = "Done";
		tracker.toCsv();
	}
}





/*Functions related to MarkingMenu*/

// Reconstructs marking menu container
function initializeMarkingMenu(){
	
	//Unload Radial Menu
	var radialMenuContainer = document.getElementById('radial-menu-container');
	if(radialMenuContainer != null){
		radialMenuContainer.parentNode.removeChild(radialMenuContainer);
	}
	
	// Load Marking Menu
	var interactionContainer = document.getElementById('interaction-container');
	if (markingMenuSubscription != null) {
		markingMenuSubscription.unsubscribe();
	}
	var markingMenuContainer = document.getElementById('marking-menu-container');
	if(markingMenuContainer == null){
		interactionContainer.innerHTML += "<div id=\"marking-menu-container\" style=\"height:100%;width:100%\" onmousedown=\"markingMenuOnMouseDown()\" oncontextmenu=\"preventRightClick(event)\"></div>";
	}
}

//Formats csv menu data in the structure accepted by radial menu
// Assumes menu csv is sorted by Id and Parent both Ascending
function formatMarkingMenuData(data) {
	var records = data.split("\n");
	var numRecords = records.length;
	var menuItems = {}

	// Parse through the records and create individual menu items
	for (var i = 1; i < numRecords; i++) {
		var items = records[i].split(',');
		var id = items[0].trim();
		var label = items[2].trim();
		menuItems[id] = {
			'name': label,
			'children': []
		};
	}

	for (var i = numRecords - 1; i >= 1; i--) {
		var items = records[i].split(',');
		var id = items[0].trim();
		var parent = items[1].trim();
		if (parent === '0') {
			continue;
		} else {
			var children = menuItems[parent]['children'];
			children.push(menuItems[id]);
			delete menuItems[id]
			menuItems[parent]['children'] = children;
		}
	}

	var menuItemsList = [];
	for (var key in menuItems) {
		menuItemsList.push(menuItems[key]);
	}

	return menuItemsList;
}

// Function to start tracking timer on mouse down
function markingMenuOnMouseDown(){

	tracker.startTimer();
}

//Function to start tracking timer on mouse down
function markingMenuOnSelect(selectedItem){

	tracker.recordSelectedItem(selectedItem.name);
	document.getElementById("selectedItem").innerHTML = selectedItem.name;
}

function preventRightClick(e){
	e.preventDefault();
}


/*Functions related to RadialMenu*/

// Reconstructs radial menu container
function initializeRadialMenu(){
	
	// Unload Marking Menu
	if (markingMenuSubscription != null) {
		markingMenuSubscription.unsubscribe();
	}
	var markingMenuContainer = document.getElementById('marking-menu-container');
	if(markingMenuContainer!=null){
		markingMenuContainer.parentNode.removeChild(markingMenuContainer);
	}
	
	

	// Reload Radial Menu
	var interactionContainer = document.getElementById('interaction-container');
	var radialMenuContainer = document.getElementById('radial-menu-container');
	if(radialMenuContainer == null){
		interactionContainer.innerHTML += "<div id=\"radial-menu-container\" style=\"height:100%;width:100%\" oncontextmenu=\"toggleRadialMenu(event)\"></div>";
	}

}

// Create radial menu svg element
function createRadialMenu(radialMenuL){
	
    var radialmenuElement = document.getElementById('radialmenu');
    if(radialmenuElement != null){
    	radialmenuElement.parentNode.removeChild(radialmenuElement);
    }
	
	
	var w = window.innerWidth;
	var h = window.innerHeight;
	var radialMenuSvgElement = document.getElementById('radial-menu-svg');
	if (radialMenuSvgElement != null){
		radialMenuSvgElement.parentNode.removeChild(radialMenuSvgElement);
	}
	radialMenuSvg = d3.select("#radial-menu-container").append("svg").attr("width", w).attr("height", h).attr("id","radial-menu-svg");
	radialMenuTree = radialMenuL;
	return radialMenuSvg;
}

// Toggle radial menu on right click
function toggleRadialMenu(e) {
	
	if(tracker.startTime == null){
	
		if(radialMenuTree != null){
				menu = module.exports(radialMenuTree, {
					x: e.clientX,
					y: e.clientY
				}, radialMenuSvg);
		
			// Start timing once menu appears
			tracker.startTimer();
		}
	}else{
		
		// Record previous item
		tracker.recordSelectedItem(null);
		
		if(radialMenuTree != null){
			menu = module.exports(radialMenuTree, {
				x: e.clientX,
				y: e.clientY
			}, radialMenuSvg);
	
		// Start timing once menu appears
		tracker.startTimer();
		}
	}
	e.preventDefault();
}

//Callback for radialmenu when a leaf node is selected
function radialMenuOnSelect() {

	tracker.recordSelectedItem(this.id);
	var radialmenu = document.getElementById('radialmenu');
	radialmenu.parentNode.removeChild(radialmenu);
	
	document.getElementById("selectedItem").innerHTML = this.id;
}

//Formats csv menu data in the structure accepted by radial menu
// Assumes menu csv is sorted by Id and Parent both Ascending
function formatRadialMenuData(data) {

	var records = data.split("\n");
	var numRecords = records.length;
	var menuItems = {}



	// Parse through the records and create individual menu items
	for (var i = 1; i < numRecords; i++) {
		var items = records[i].split(',');
		var id = items[0].trim();
		var label = items[2].trim();
		menuItems[id] = {
			'id': label,
			'fill': "#39d",
			'name': label,
			'_children': []
		};
	}

	for (var i = numRecords - 1; i >= 1; i--) {
		var items = records[i].split(',');
		var id = items[0].trim();
		var parent = items[1].trim();
		if (parent === '0') {
			continue;
		} else {
			var _children = menuItems[parent]['_children'];
			if(menuItems[id]['_children'].length == 0){
				menuItems[id]['callback'] = radialMenuOnSelect;	
			}
			_children.push(menuItems[id]);
			delete menuItems[id];
			menuItems[parent]['_children'] = _children;
		}
	}


	var menuItemsList = [];
	for (var key in menuItems) {
		if (menuItems[key]['_children'].length == 0){
			delete menuItems[key]['_children'];
			menuItems[key]['callback'] = radialMenuOnSelect;
		} else{
			delete menuItems[key]['callback'];
		}
		menuItemsList.push(menuItems[key]);
	}

	return {
		'_children': menuItemsList
	};

}


getParticipantId();
var interactionContainer = document.getElementById('interaction-container');
interactionContainer.addEventListener('mousedown', function(){
	tracker.numClicks++;
})