'use strict'

console.log(' item mirror on page script loaded for tab: %s', chrome.runtime.id);	

chrome.runtime.onMessage.addListener(function(msg, sender, responseCallback){
	//window.addEventListener('mouseup',updateSelectedText);
	console.log('sender %o', sender);
	execute(msg);
});

function responseCallback(){
	return "scriptjs received message";
}


function execute(msg) {
	console.log('msg: %o passed to controller',msg);
	if(msg.action === 'toggleSidebar') {
		toggleSidebar();
		updateSelectedText();
	} else if (msg.action === 'searchResult') {
		addFolderIcon(msg);
	} else if (msg.action === 'saved') {
		toggleSidebar();
		// var alert = document.createElement('div');
		// alert.id = "alert";
		// alert.setAttribute('class', 'alert alert-info');
		// alert.style.position = "fixed";
		// alert.style.bottom = "30%";
		// alert.style.zIndex = "9999999";
		// alert.style.background = "#428bca";
		// alert.style.left = "30%";
		// alert.style.width = "300px";
		// alert.style.height = "150px;"
		// // alert.style.display = "none";
		// alert.setAttribute('data-dismiss', 'alert');
		// alert.setAttribute('aria-hidden', 'true');
		// alert.innerHTML = "Saved Success";
		// document.body.appendChild(alert);
		// setTimeout(function(){
		// 	alert.style.display = "none";
		// }, 1500);
	}
}

//function for intersection
function intersect(a, b){
  var ai = bi= 0;
  var intersection = [];

  while( ai < a.length && bi < b.length ){
     if      (a[ai] < b[bi] ){ ai++; }
     else if (a[ai] > b[bi] ){ bi++; }
     else /* they're equal */
     {
       intersection.push(ai);
       ai++;
       bi++;
     }
  }

  return intersection;
}


function comparsion(intersection, i, j, matchFolders, resultArray){

	var folders = [];
	var folderPosition = '';
	var foldersWord = '';
	var temp = [];

	if(intersection.length > 3){
		if(j < resultArray.length) {
			j += 1;

			console.log("j in the inner loop: %o", resultArray[j][0]);

			if(resultArray[j][3] == true){
				var intersection = intersection;
				console.log('continued intersection in the inner loop with stopword after: %o', intersection);

				comparsion(intersection, i, j, matchFolders, resultArray);

			}else {
				var intersection = _.intersection(intersection, resultArray[j][1]);
				console.log('continued intersection in the inner loop: %o', intersection);

				comparsion(intersection, i, j, matchFolders, resultArray);
			}

		}else {
			folders = intersection;
			folderPosition = resultArray[j][2];

			// foldersWord = resultArray[j][0];
			
			// temp.push(foldersWord);
			// temp.push(folders);
			// matchFolders[folderPosition] = temp;
			matchFolders[folderPosition] = folders;
			console.log("matchFolders testing22222......: %o", matchFolders);
		}

	}else if(intersection.length == 0){
		folders = resultArray[i][1];
		folderPosition = resultArray[i][2];
		//foldersWord = resultArray[i][0];

		// temp.push(foldersWord);
		// temp.push(folders);
		// matchFolders[folderPosition] = temp;
		matchFolders[folderPosition] = folders;

		console.log("matchFolders testing33333......: %o", matchFolders);
	}else{
		folders = intersection;
		folderPosition = resultArray[j][2];
		//foldersWord = resultArray[j][0];
		//temp.push(foldersWord);
		//temp.push(folders);
		//matchFolders[folderPosition] = temp;
		matchFolders[folderPosition] = folders;

		console.log("matchFolders testing44444......: %o", matchFolders);
	}

	return matchFolders;
}

function addFolderIcon(msg) {
	var newTextList = [];
	var selectedTextWindow = document.getElementById("selectedTextWindow");
	if(!selectedTextWindow) {throw "missing selectedTextWindow";}

	console.log('msg.message: %o', msg.message);
	var resultArray = msg.message;
	//var length = resultArray.length;
	var matchFolders = {};

	for (var i=0; i< resultArray.length; i++) {

		if(resultArray[i][3] == true){
			continue;
		}else {
			if(resultArray[i][1].length != 0){

				if(resultArray[i][1].length <= 3){
					var folders = resultArray[i][1];
					var folderPosition = resultArray[i][2];
					// var foldersWord = resultArray[i][0];
					// var temp = [];
					// temp.push(foldersWord);
					// temp.push(folders);
					// matchFolders[folderPosition] = temp;
					matchFolders[folderPosition] = folders;

					console.log("matchFolders testing11111......: %o", matchFolders);
					//insert single folder icon

				// }else if (resultArray[i][1].length > 1 && resultArray[i][1] <= 3){
				// 	var folders = resultArray[i][1];
				// 	var folderPosition = resultArray[i][2];
				// 	matchFolders[folderPosition] = folders;

				// 	console.log("matchFolders testing22222......: %o", matchFolders);
				// 	//insert multiple folders icon
				}else {
					var j = i+1;
					if(j < resultArray.length) {
						console.log("j: %o", resultArray[j][0]);

						if(resultArray[j][3] == true){
							var intersection = resultArray[i][1];
							console.log('first intersection with stopword after: %o', intersection);

							comparsion(intersection, i, j, matchFolders, resultArray);

						}else {
							var intersection = _.intersection(resultArray[i][1], resultArray[j][1]);
							console.log('first intersection in the for loop: %o', intersection);

							comparsion(intersection, i, j, matchFolders, resultArray);
						}
					}else {
						var folders = resultArray[i][1];
						var folderPosition = resultArray[i][2];
						matchFolders[folderPosition] = folders;

						console.log("matchFolders testing55555......: %o", matchFolders);
					}
					
					

					

					
				}
			}
		}

	
	}

	console.log("matchFolders testing......: %o", matchFolders);


	//var folderNames = createFolderNames(msg.message);
	//console.log('folderNames: %o', folderNames);
	var textList = selectedTextWindow.innerHTML.split('');
	console.log('textList: %o', textList);
	textList.push(' ');
	selectedTextWindow.innerHTML = "";
	for (var i=0; i< textList.length; i++){
		if (matchFolders[i]){

			//if(findStopwords(matchFolders[i][0]) == false){

				if (matchFolders[i].length == 1){
					selectedTextWindow.appendChild(createSingleIcon(matchFolders[i]));
				} else {
					var multipleIcon = createMultipleIcon(matchFolders[i]);
					//console.log(multipleIcon);
					selectedTextWindow.appendChild(multipleIcon);

					//multipleIcon.addEventListener('mouseover', createModal);

					//multipleIcon.addEventListener('click', toggleSidebar);
					multipleIcon.onchange = function(){
						console.log("click event ever firing up???????");
						toggleSidebar();
					};
				}

			//}

		}
		selectedTextWindow.innerHTML += textList[i];
		
	}


	// for(var key in textList) {
	// 	var text = textList[key];
	// 	console.log('text: %o', text);
	// 	if(folderNames[text]) {

	// 		if (folderNames[text].length == 1){
	// 			text = "<b style='padding: 0 4px;'>" + text+ "</b>";
	// 			selectedTextWindow.appendChild(createSingleIcon(folderNames[text]));
	// 		} else {
	// 			text = "<b style='padding: 0 4px;'>" + text+ "</b>";
	// 			selectedTextWindow.appendChild(createMultipleIcon(folderNames[text]));
	// 		}
			
	// 	}
	// 	newTextList.push(text);
	// 	selectedTextWindow.innerHTML += text +" ";
	// }

	//remove the spinner
	var spinnerImage = document.querySelector('#spinnerImage');
	spinnerImage.parentNode.removeChild(spinnerImage);	
	addModalEvent();

}


function findStopwords(word){
	var stopWords = ["a","able","about","across","after","all","almost","also","am","among","an","and","any","are","as","at","be","because","been","but","by","can","cannot","could","dear","did","do","does","either","else","ever","every","for","from","get","got","had","has","have","he","her","hers","him","his","how","however","i","if","in","into","is","it","its","just","least","let","like","likely","may","me","might","most","must","my","neither","no","nor","not","of","off","often","on","only","or","other","our","own","rather","said","say","says","she","should","since","so","some","than","that","the","their","them","then","there","these","they","this","tis","to","too","twas","us","wants","was","we","were","what","when","where","which","while","who","whom","why","will","with","would","yet","you","your"];
	var flag = stopWords.indexOf(word.toLowerCase()) > 0 ? true : false;
	console.log("flag.......: %o", flag);

	return flag;
}

function createFolderNames(messages) {
	var folderNames = [];
	for(var key in messages) {
		var folderName = messages[key].split("/").pop();
		//console.log(folderName);
		//create an array where key is the matched foldernames, value is the folder paths
		folderNames[folderName] = messages[key];
		console.log(folderNames);
	}
	return folderNames;
}

function createSingleIcon(path) {
	//var a = document.createElement('a');
	var icon = document.createElement('img');
	var imgURL = chrome.extension.getURL("images/folder.png");
	icon.src = imgURL;
	icon.id = "folderIcon";
	var newPath = JSON.stringify(path);
	//icon.title = path;
	icon.setAttribute('data-paths', newPath);
	//a.setAttribute("href", "https://www.dropbox.com/home" + path);
	//a.target = "_blank";
	//a.appendChild(icon);
	return icon;
}

function createMultipleIcon(path) {
	//console.log("what is the path: %o", path);
	//var a = document.createElement('a');
	var icon = document.createElement('img');
	var imgURL = chrome.extension.getURL("images/folders.png");
	icon.src = imgURL;
	icon.id = "foldersIcon";
	var newPath = JSON.stringify(path);
	//var newPath = Array.prototype.slice.call(path);
	//console.log("newpath is what tpye: %o", typeof newPath);
	//icon.title = path;
	icon.setAttribute('data-paths', newPath);


	// var customModal = '<div class="custom-modal modal hide fade" tabindex="-1" role="dialog" aria-hidden="true"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button></div><div class="modal-body"></div><div class="modal-footer"><button class="btn" data-dismiss="modal">Close</button></div></div>'


	
	// icon.setAttribute('onclick', 'var foldersPath = '+ path + ';console.log(foldersPath);var bigDiv = document.createElement("div");' + 'var wrapperDiv = document.createElement("div");' + 'wrapperDiv.setAttribute("style","position: absolute; left: 0px; top: 0px; background-color: rgb(255, 255, 255); opacity: 0.5; z-index: 2000; height: 1083px; width: 100%;");' + 'var iframeElement = document.createElement("iframe");' + 'iframeElement.setAttribute("style","width: 100%; height: 100%;");' + 'wrapperDiv.appendChild(iframeElement);' + 'var modalDialogParentDiv = document.createElement("div");' + 'modalDialogParentDiv.setAttribute("style","position: absolute; width: 350px; border: 1px solid rgb(51, 102, 153); padding: 10px; background-color: rgb(255, 255, 255); z-index: 2001; overflow: auto; text-align: center; top: 149px; left: 497px;");' + 'var modalDialogSiblingDiv = document.createElement("div");' + 'var modalDialogTextDiv = document.createElement("div");' + 'modalDialogTextDiv.setAttribute("style" , "text-align:center");' + 'var modalDialogTextSpan = document.createElement("span");' + 'var modalDialogText = document.createElement("strong");' + 'modalDialogText.innerHTML = "Processing...  Please Wait.";' + 'modalDialogTextSpan.appendChild(modalDialogText);' + 'modalDialogTextDiv.appendChild(modalDialogTextSpan);' + 'modalDialogSiblingDiv.appendChild(modalDialogTextDiv);' + 'for (var i=0; i<5; i++){var p = document.createElement("p");var span = document.createElement("span");span.innerText = foldersPath[i];var checkbox = document.createElement("input");checkbox.type = "checkbox";checkbox.name = "name";checkbox.value = foldersPath[i];checkbox.id = "id";checkbox.checked = true;p.appendChild(checkbox);p.appendChild(span);modalDialogSiblingDiv.appendChild(p);}' + 'modalDialogParentDiv.appendChild(modalDialogSiblingDiv);' + 'bigDiv.appendChild(wrapperDiv);' + 'bigDiv.appendChild(modalDialogParentDiv);' + 'document.body.appendChild(bigDiv);');


	//icon.addEventListener('click', function(e){alert(e);}, false);
	//icon.setAttribute('data-toggle', "modal");
	//icon.setAttribute('data-target', ".multipleIcon");
	//a.appendChild(icon);

	return icon;
}


function addModalEvent() {
	var foldersIcon = document.querySelectorAll('#foldersIcon');
	var folderIcon = document.querySelectorAll('#folderIcon');

	console.log(foldersIcon);
	console.log(folderIcon);
	for(var i=0; i< foldersIcon.length; i++){
		
		//Simple solution: using this keyword to pass along parameter into the for loop
		foldersIcon[i].addEventListener('click', function(){
				
			//console.log(this);

			var data = this.dataset.paths;
			var array = JSON.parse(data);
			createModal(array, this);
		});


		
		//var data = foldersIcon[i].dataset.paths;
		//var array = JSON.parse(data);
		//General solution: using closure to pass along parameter into the for loop
		// foldersIcon[i].addEventListener('click', function(foldersIcon){

			
		// 	//console.log(this);
		// 	return function() {
				
		// 		createModal(JSON.parse(foldersIcon.dataset.paths));
		// 	}
		// }(foldersIcon[i]));

		// return function(i){
		// 		foldersIcon[i].addEventListener('click', function(){
		// 		createModal(array);
		// 	});
		// }
		//foldersIcon[i].setAttribute('onclick', createModal(data));
		// return (function(i, foldersIcon, array){
		// 	foldersIcon[i].onclick = function(){
		// 		console.log(array);
		// 		console.log(i);
		// 		console.log(foldersIcon[i]);
		// 	}
		// })(i, foldersIcon, array);
		// foldersIcon[i].onclick = function(){
		// 	console.log(array);
		// 	console.log(i);
		// 	console.log(foldersIcon[i]);
		// 	//console.log("array in the onclick event: %o", array);
		// 	//createModal(array);
		// }
	}

	for(var i=0; i< folderIcon.length; i++){
		
		//Simple solution: using this keyword to pass along parameter into the for loop
		folderIcon[i].addEventListener('click', function(){
				
			//console.log(this);

			var data = this.dataset.paths;
			var array = JSON.parse(data);
			createModal(array, this);
		});

	}
}

function createModal(data, folderIcon){
	// var temp = [];
	// temp = data.split('",');
	// var foldersPath = ["/2015-06, MSIM capstone, Qin Qin, Jay, shared/tagging articles, esp. for qianqian/Wm's topics/constraints & delcarative programming", "/2015-06, MSIM capstone, Qin Qin, Jay, shared/tagging articles, esp. for qianqian/Wm's topics/programming", "/2015-06, MSIM capstone, Qin Qin, Jay, shared/tagging articles, esp. for qianqian/Wm's topics/constraints & delcarative programming", "/2015-06, MSIM capstone, Qin Qin, Jay, shared/tagging articles, esp. for qianqian/Wm's topics/constraints & delcarative programming", "/2015-06, MSIM capstone, Qin Qin, Jay, shared/tagging articles, esp. for qianqian/Wm's topics/constraints & delcarative programming"];
	console.log("passing data in the new modal: %o", data);
	var foldersPath = data;
	var currentfolder = folderIcon;
	console.log(folderIcon);
	console.log("current folderPaths value: %o",foldersPath);
	var bigDiv = document.createElement("div");
	var wrapperDiv = document.createElement("div");
	wrapperDiv.setAttribute("style","position: absolute; left: 0px; top: 0px; background-color: rgb(255, 255, 255); opacity: 0.5; z-index: 2000; height: 1083px; width: 100%;");

	var iframeElement = document.createElement("iframe");
	iframeElement.setAttribute("style","width: 100%; height: 100%;");

	wrapperDiv.appendChild(iframeElement);

	

	var modalDialogParentDiv = document.createElement("div");
	modalDialogParentDiv.setAttribute("style","position: absolute; width: 550px; border: 1px solid black;  background-color: rgb(255, 255, 255); z-index: 2001; overflow: auto; text-align: left; top: 149px; left: 307px;  border-radius: 5px;");
	modalDialogParentDiv.setAttribute('id', "modalBox");
	modalDialogParentDiv.setAttribute('zIndex', "99999");

	var modalDialogSiblingDiv = document.createElement("div");
	//modalDialogSiblingDiv.setAttribute('class', 'panel-header')

	var modalDialogTextDiv = document.createElement("div"); 
	modalDialogTextDiv.id = 'modalDialogTextDiv';
	modalDialogSiblingDiv.setAttribute("style", "border-bottom: 1px solid black; height: 35px; padding: 12px;");
	modalDialogTextDiv.setAttribute("style", "text-align:left; float: left;");

	var modalDialogTextSpan = document.createElement("span"); 
	modalDialogTextSpan.setAttribute("style", "font-size: 12px");
	var modalDialogText = document.createElement("strong"); 
	modalDialogText.innerHTML = "Please select the folders:";

	modalDialogTextSpan.appendChild(modalDialogText);
	modalDialogTextDiv.appendChild(modalDialogTextSpan);

	var modalDialogSiblingDiv1 = document.createElement("div");
	modalDialogSiblingDiv1.setAttribute("style", "padding: 15px;")

	// var p = document.createElement("p");var span = document.createElement("span");span.innerText = path[i];var checkbox = document.createElement("input");checkbox.type = "checkbox";checkbox.name = "name";checkbox.value = path[i];checkbox.id = "id";checkbox.checked = true;p.appendChild(checkbox);p.appendChild(span);modalDialogSiblingDiv.appendChild(p);

	// var label = document.createElement('label')
	// label.htmlFor = "id";
	// label.appendChild(document.createTextNode('text for label after checkbox'));

	//modalDialogSiblingDiv.appendChild(p);
	//modalDialogSiblingDiv.appendChild(label);

	if(foldersPath.length< 5){
		var length = foldersPath.length;

		for (var i=0; i<length; i++){
			var p = document.createElement("p");p.setAttribute('class', 'checkbox');var span = document.createElement("span");span.innerText = foldersPath[i]; span.setAttribute("style", "font-size: 12px");var checkbox = document.createElement("input");checkbox.type = "checkbox";checkbox.name = "name";checkbox.value = foldersPath[i];checkbox.id = "id";checkbox.checked = true;checkbox.class="form-control";var openBtn = document.createElement('a'); openBtn.setAttribute('class', 'btn btn-default pull-right'); openBtn.setAttribute('style', 'margin-top: -4%;');openBtn.href = 'https://www.dropbox.com/home' + foldersPath[i]; openBtn.innerText = 'Open'; openBtn.target = "_blank"; p.appendChild(checkbox);p.appendChild(span);p.appendChild(openBtn);modalDialogSiblingDiv1.appendChild(p);

		}

	}else {
		var length = 5;

		for (var i=0; i<length; i++){
			var p = document.createElement("p");p.setAttribute('class', 'checkbox');var span = document.createElement("span");span.innerText = foldersPath[i]; span.setAttribute("style", "font-size: 12px");var checkbox = document.createElement("input");checkbox.type = "checkbox";checkbox.name = "name";checkbox.value = foldersPath[i];checkbox.id = "id";checkbox.checked = true;checkbox.class="form-control";var openBtn = document.createElement('a'); openBtn.setAttribute('class', 'btn btn-default pull-right'); openBtn.setAttribute('style', 'margin-top: -4%;');openBtn.href = 'https://www.dropbox.com/home' + foldersPath[i]; openBtn.innerText = 'Open'; openBtn.target = "_blank"; p.appendChild(checkbox);p.appendChild(span);p.appendChild(openBtn);modalDialogSiblingDiv1.appendChild(p);

		}

	}

	// for (var i=0; i<5; i++){
	// 	var p = document.createElement("p");p.setAttribute('class', 'checkbox');var span = document.createElement("span");span.innerText = foldersPath[i]; span.setAttribute("style", "font-size: 12px");var checkbox = document.createElement("input");checkbox.type = "checkbox";checkbox.name = "name";checkbox.value = foldersPath[i];checkbox.id = "id";checkbox.checked = true;checkbox.class="form-control";var openBtn = document.createElement('a'); openBtn.setAttribute('class', 'btn btn-default pull-right'); openBtn.setAttribute('style', 'margin-top: -4%;');openBtn.href = 'https://www.dropbox.com/home' + foldersPath[i]; openBtn.innerText = 'Open'; openBtn.target = "_blank"; p.appendChild(checkbox);p.appendChild(span);p.appendChild(openBtn);modalDialogSiblingDiv1.appendChild(p);

	// }

	var modalDialogSiblingDiv2 = document.createElement("div");
	modalDialogSiblingDiv2.setAttribute('style', 'padding: 15px; float: right;');
	var button = document.createElement('button');
	button.setAttribute('class', 'btn btn-primary');
	button.setAttribute('style', 'margin-right: 5px;')
	button.innerText = 'Confirm';
	button.id = 'saveBox';
	modalDialogSiblingDiv2.appendChild(button);

	var button1 = document.createElement('button');
	button1.setAttribute('class', 'btn btn-default');
	button1.innerText = 'Cancel';
	button1.id = 'cancelBox';
	modalDialogSiblingDiv2.appendChild(button1);

	// for (var i=0; i<5; i++){var p = document.createElement("p");var span = document.createElement("span");span.innerText = path[i];var checkbox = document.createElement("input");checkbox.type = "checkbox";checkbox.name = "name";checkbox.value = path[i];checkbox.id = "id";checkbox.checked = true;p.appendChild(checkbox);p.appendChild(span);modalDialogSiblingDiv.appendChild(p);}
	//modalDialogTextDiv.appendChild(breakElement);
	//modalDialogTextDiv.appendChild(breakElement);
	//modalDialogTextDiv.appendChild(imageElement);

	modalDialogSiblingDiv.appendChild(modalDialogTextDiv);
	modalDialogParentDiv.appendChild(modalDialogSiblingDiv);
	modalDialogParentDiv.appendChild(modalDialogSiblingDiv1);
	modalDialogParentDiv.appendChild(modalDialogSiblingDiv2);

	bigDiv.appendChild(wrapperDiv);
	bigDiv.appendChild(modalDialogParentDiv);

	// bigDiv.addEventListener('click', function(){
	// 	if(bigDiv){
	// 		body.remove(bigDiv);
	// 	}
	// }, false);



	//document.body.appendChild(wrapperDiv);
	document.body.appendChild(bigDiv);

	button1.onclick = function() {
		if(bigDiv){
			bigDiv.parentNode.removeChild(bigDiv);
		}
	}

	button.addEventListener('click', function(currentfolder){
		return function(){
			console.log("currentfolder....:%o", currentfolder);

			var modalBox = document.getElementById('modalBox');
			var checkedFolders = modalBox.querySelectorAll('input[type="checkbox"]:checked');
			console.log(checkedFolders);

			var temp = [];
			for (var i = 0; i < checkedFolders.length; i++) {
			  temp.push(checkedFolders[i].value);
			}

			var choosePath = JSON.stringify(temp);
			currentfolder.setAttribute('data-paths', choosePath);

			console.log("temp array in modal: %o", temp);

			if(bigDiv){
				bigDiv.parentNode.removeChild(bigDiv);
			}
		}
	}(currentfolder));
	// button.onclick = function() {
	// 	console.log("currentfolder....:%o", currentfolder);
	// 	var modalBox = document.getElementById('modalBox');
	// 	var checkedFolders = modalBox.querySelectorAll('input[type="checkbox"]:checked');
	// 	console.log(checkedFolders);

	// 	var temp = [];
	// 	for (var i = 0; i < checkedFolders.length; i++) {
	// 	  temp.push(checkedFolders[i].value);
	// 	}

	// 	console.log("temp array in modal: %o", temp);

	// 	var choosePath = JSON.stringify(temp);
	// 	//var newPath = Array.prototype.slice.call(path);
	// 	//console.log("newpath is what tpye: %o", typeof newPath);
	// 	//icon.title = path;
	// 	currentfolder.setAttribute('data-paths', choosePath);

	// 	console.log("New currentfolder....:%o", currentfolder);

	// 	if(bigDiv){
	// 		bigDiv.parentNode.removeChild(bigDiv);
	// 	}

	// }

}



//function for adding the spinner for searching process
function addSpinner(){
	var spinnerCon = document.createElement('p');
	spinnerCon.id = 'spinnerImage';
	var spinnerSpan = document.createElement('span');
	spinnerSpan.innerText = "Searching..";
	var spinnerDiv = document.createElement('img');
	spinnerDiv.id = 'spinner';
	var imgURL = chrome.extension.getURL("images/spinner.gif")
	spinnerDiv.src = imgURL;
	spinnerCon.setAttribute('class', 'pull-left');
	spinnerCon.appendChild(spinnerDiv);
	spinnerCon.appendChild(spinnerSpan);
	var header = document.querySelector('.sideBarHeader');
	header.appendChild(spinnerCon);

}

function toggleSidebar () {
	console.log('toggle sidebar');
	var sidebarHTML = getItemMirrorSidebar();
	//check if the spinner exist before append a new one
	if(!(document.querySelector('#spinnerImage'))){
		addSpinner();
	}
	
	//createBootstrapModal();
	//createModal();
	if(sidebarHTML.style.display === 'none') {
		sidebarHTML.style.display = 'inline';
	} else {
		sidebarHTML.style.display = 'none';
		sidebarHTML.style.bottom = "-30%";
		var v = 30;
		var slide = setInterval(function(){
			if(sidebarHTML.style.bottom != "0%"){
			sidebarHTML.style.bottom = "-" + v+"%";
			v-=1;
			}else{
				clearInterval(slide);
			}
		

		}, 10);
	}
}

function updateSelectedText() {
	//check if the spinner exist before append a new one
	
	var selectedTextWindow = document.getElementById('selectedTextWindow');
	var selectedText = getSelectedText();
	console.log(selectedText);
	if(selectedText !== undefined && (!(document.querySelector('#spinnerImage')))){
		// if{
			addSpinner();
		//}
	}
	if(selectedTextWindow && selectedText) {
		searchDropbox(selectedText);
		selectedTextWindow.innerText = selectedText;
	}
	//addSpinner();
}

//passed a message back to background.js
function searchDropbox(selectedText) {
	var msg = {
		'action': 'search',
		'message': selectedText
	};
	console.log('sending message %o', msg);
	chrome.runtime.sendMessage(msg, function(response){
		console.log("%o", response);
	});
}


function getItemMirrorSidebar () {
	var sidebarHTML = document.getElementById('itemMirrorSidebar')
	if(sidebarHTML === null){
		sidebarHTML = createItemMirrorSidebar();
		console.log('creating new item mirror sidebar');
		document.body.appendChild(sidebarHTML);
		var v = 30;
		var slide = setInterval(function(){
			if(sidebarHTML.style.bottom != "0%"){
			sidebarHTML.style.bottom = "-" + v+"%";
			v-=1;
			}else{
				clearInterval(slide);
			}
		

		}, 10);
	} 
	return sidebarHTML;
}

function createItemMirrorSidebar() {
	var sidebarHTML = createSiderbarFrame();
	createSiderbarContent(sidebarHTML);
	return sidebarHTML;
}

function createSiderbarFrame() {
	var sidebarHTML = document.createElement('div');
	sidebarHTML.id = "itemMirrorSidebar"
	sidebarHTML.style.position = "fixed";
	sidebarHTML.style.bottom = "0";
	sidebarHTML.style.right = "10px";
	sidebarHTML.style.width = "280px";
	sidebarHTML.style.minHeight = "350px";
	sidebarHTML.style.border = "5px solid black";
	sidebarHTML.style.background = "#fff";
	//sidebarHTML.style.opacity = "0.97";
	//sidebarHTML.style.zIndex = "999999";
	sidebarHTML.style.borderRadius="10px"
	sidebarHTML.style.display = 'none';
	return sidebarHTML;
}

function createSiderbarContent(sidebarHTML) {
	var sidebarContainer = document.createElement('div');
	sidebarContainer.setAttribute("class", "sideBarHeader");


	var leftDiv = document.createElement('div');
	leftDiv.setAttribute("id", "left");
	leftDiv.setAttribute("style", "padding: 0;");

	var rightDiv = document.createElement('div');
	rightDiv.setAttribute("id", "right");
	rightDiv.setAttribute("style", "padding: 0;");

	sidebarContainer.appendChild(leftDiv);
	sidebarContainer.appendChild(rightDiv);
	var selectedTextWindow = document.createElement('div');
	selectedTextWindow.id = "selectedTextWindow";
	selectedTextWindow.setAttribute("contentEditable", "True");

	// var okButton = document.createElement('button');
	// okButton.innerText = "Save";
	// okButton.id = "okButton";
	// cancel button
	// var cancelButton = document.createElement('button');       
	// cancelButton.innerText="close";
	// cancelButton.id = "closeButton";

	var refreshButton = document.createElement('img');
	var imgURL = chrome.extension.getURL("images/search.png")
	refreshButton.src = imgURL;
	refreshButton.id = "refreshButton";
	refreshButton.setAttribute("class", "pull-right");

	var okButton = document.createElement('img');
	var imgURL = chrome.extension.getURL("images/check.png")
	okButton.src = imgURL;
	okButton.id = "okButton";
	okButton.setAttribute("class", "pull-right");
	

	var cancelButton = document.createElement('img');
	var imgURL = chrome.extension.getURL("images/close.png")
	cancelButton.src = imgURL;
	cancelButton.id = "closeButton";
	cancelButton.setAttribute("class", "pull-right");
	
	sidebarContainer.appendChild(cancelButton);
	sidebarContainer.appendChild(okButton);
	sidebarContainer.appendChild(refreshButton);
	

	okButton.onclick = function(){
		// get the folder path
		var path = {};
		var newSelectedText = document.getElementById("selectedTextWindow").innerText;
		console.log("newSelectedText....: %o", newSelectedText);
		var folderPaths = document.getElementById("selectedTextWindow").getElementsByTagName("img");

		console.log('Get back image array: %o', folderPaths);

		if(folderPaths.length == 0){
			path = {"['/2015-06, MSIM capstone, Qin Qin, Jay, shared']" : ['/2015-06, MSIM capstone, Qin Qin, Jay, shared'] };
		}else {
			for(var key in folderPaths) {
				if(folderPaths[key].dataset !== undefined ){
					console.log("currrent folderPaths...: %o", key, folderPaths[key].dataset.paths);
					path[folderPaths[key].dataset.paths] = JSON.parse(folderPaths[key].dataset.paths);
				}
			}
		}

		

		console.log("New path for generate itemMirror: %o", path);

		// console.log("folderPaths: " + path);
		var msg = {
			'action': 'save',
			'paths': path,
			'selectedText': newSelectedText
		};

		console.log('sending folderNames %o', msg);
		chrome.runtime.sendMessage(msg, function(response){
			console.log("%o", response);
		});
	};


	cancelButton.onclick = function(){
		toggleSidebar();
	};

	refreshButton.onclick = function(){
		updateSelectedText();
	} 

	sidebarHTML.appendChild(sidebarContainer);
	sidebarHTML.appendChild(selectedTextWindow);
	//sidebarHTML.appendChild(okButton);
	//sidebarHTML.appendChild(cancelButton);

}

function getSelectedText(msg) {
	var selection = window.getSelection();
	if(selection.rangeCount > 0) {
	 	var range = selection.getRangeAt(0);
	   	if (range) {
	    	var div = document.createElement('div');
	    	div.appendChild(range.cloneContents());
		 	return div.innerText;
		}
	}	
}



