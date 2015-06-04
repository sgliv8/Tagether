require(["ItemMirror"], function(ItemMirror){
'use strict'
var client = new Dropbox.Client({ key : "f5wpuw9g0k2ibth", sandbox:false});

var   dropboxXooMLUtility,
      dropboxItemUtility,
      mirrorSyncUtility,
      groupingItemURI,
      itemMirrorOptions,
      createAssociationOptions,
      createAssociationCase2Options;

	dropboxXooMLUtility = {
	  driverURI: "DropboxXooMLUtility",
	  dropboxClient: client
	};
	dropboxItemUtility = {
	  driverURI: "DropboxItemUtility",
	  dropboxClient: client
	};
	mirrorSyncUtility = {
	  utilityURI: "MirrorSyncUtility"
	};


	itemMirrorOptions = {
      1: {
        groupingItemURI: groupingItemURI,
        xooMLDriver: dropboxXooMLUtility,
        itemDriver: dropboxItemUtility
      },
      2: {
        groupingItemURI: groupingItemURI,
        xooMLDriver: dropboxXooMLUtility,
        itemDriver: dropboxItemUtility,
        syncDriver: mirrorSyncUtility,
        readIfExists: false
      },
      3: {
        groupingItemURI: groupingItemURI,
        xooMLDriver: dropboxXooMLUtility,
        itemDriver: dropboxItemUtility,
        syncDriver: mirrorSyncUtility,
        readIfExists: true
      }
    };


//ensure dropbox authentication
authenticate();

//add a listener to listen if the extension icon got clicked
chrome.browserAction.onClicked.addListener(function(tab){
	console.log('sending message to toggle sidebar to tab: %o', tab);
	var message = {
			authentication: 'true',
			action: 'toggleSidebar'
	};
	chrome.tabs.sendMessage(tab.id, message, logCallback);
});
//adds listener for messages passed from the website back to this script, such as search
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse){
	console.log('sender %o', sender);
	execute(msg, sender);	
});

function logCallback(resp){
		console.log('message returned with response %s', resp);	
}	

function authenticate() {
	client.authDriver(new Dropbox.AuthDriver.ChromeExtension({
		receiverPath: 'html/chrome_oauth_receiver.html'}));
	client.authenticate(function(error, client){
		if(error){throw error;}
		// constructNewItemMirror();
		console.log("Dropbox client authenticated.");
	});
}

function constructNewItemMirror(msg) {

	for(var key in msg.paths){
		for(var innerKey in msg.paths[key]){

			var options = {
		        groupingItemURI: msg.paths[key][innerKey],
		        xooMLDriver: dropboxXooMLUtility,
		        itemDriver: dropboxItemUtility,
		        syncDriver: mirrorSyncUtility,
		        readIfExists: true
		      }

			new ItemMirror(options, function (error, itemMirror) {
		        if (error) { throw error; }
		        console.log("itemMirror constructed at " + msg.paths[key][innerKey]);
				createAssociation(itemMirror, msg);
			});		

		}
	}

}

function createAssociation(itemMirror, msg) {
	//var savePaths = msg.message;
	var selectedText = msg.selectedText;
	chrome.tabs.getSelected(null, function(tab){
		var url = tab.url;
		console.log("what is the current url.....: %o", url);
		createAssociationCase2Options = {
		    "displayText": msg.selectedText,
		    "itemURI": url
	   	};

	    itemMirror.createAssociation(createAssociationCase2Options, function(error, GUID) {
	        if (error) {
	            throw error;}
	        else { 
	        	console.log("file saved.");
	        }
	    });
	});

}


function execute(msg, sender) {
	console.log('msg: %o passed to background',msg);
	if(msg.action === 'search') {
		console.log('searching');
		findSomeFiles(msg.message, sender.tab);
	} else if(msg.action === "save") {
		constructNewItemMirror(msg);
		console.log("save msg " + msg);
		chrome.tabs.getSelected(null, function(tab){
		var message = {
	        		'action': 'saved'
	            	};
	        	chrome.tabs.sendMessage(tab.id, message, logCallback);
	        	console.log("send message to sidebar: " + message);
	    });

	}
}

//New filter keywords function
function filterKeyword(text) {
	var regex_str;
	var regex;
	var stopWords = ["a", "about", "above", "above", "across", "after",
    "afterwards", "again", "against", "all", "almost", "alone", "along",
    "already", "also","although","always","am","among", "amongst",
    "amoungst", "amount",  "an", "and", "another", "any","anyhow","anyone",
    "anything","anyway", "anywhere", "are", "around", "as",  "at", "back",
    "be","became", "because","become","becomes", "becoming", "been",
    "before", "beforehand", "behind", "being", "below", "beside",
    "besides", "between", "beyond", "bill", "both", "bottom","but",
    "by", "call", "can", "cannot", "cant", "co", "con", "could",
    "couldnt", "cry", "de", "describe", "detail",  "do", "does", "done",  "down",
    "due", "during", "each", "eg", "eight", "either", "eleven","else",
    "elsewhere", "empty", "enough", "etc", "even", "ever", "every",
    "everyone", "everything", "everywhere", "except", "few", "fifteen",
    "fify", "fill", "find", "fire", "first", "five", "for", "former",
    "formerly", "forty", "found", "four", "from", "front", "full",
    "further", "get", "give", "go", "had", "has", "hasnt", "have",
    "he", "hence", "her", "here", "hereafter", "hereby", "herein",
    "hereupon", "hers", "herself", "him", "himself", "his", "how",
    "however", "hundred", "ie", "if", "in", "inc", "indeed",
    "interest", "into", "is",  "it", "its", "itself", "keep",
    "last", "latter", "latterly", "least", "less", "ltd", "made",
    "many", "may", "me", "meanwhile", "might", "mill", "mine",
    "more", "moreover", "most", "mostly", "move", "much", "must", "my",
    "myself", "name", "namely", "neither", "never", "nevertheless", "next",
    "nine", "no", "nobody", "none", "noone", "nor", "not", "nothing", "now",
    "nowhere", "of", "off", "often", "on", "once", "one", "only", "onto",
    "or", "other", "others", "otherwise", "our", "ours", "ourselves", "out",
    "over", "own","part", "per", "perhaps", "please", "put", "rather", "re",
    "same", "see", "seem", "seemed", "seeming", "seems", "serious", "several",
    "she", "should", "show", "side", "since", "sincere", "six", "sixty", "so",
    "some", "somehow", "someone", "something", "sometime", "sometimes", "somewhere",
    "still", "such", "system", "take", "ten", "than", "that", "the", "their", "them",
    "themselves", "then", "thence", "there", "thereafter", "thereby", "therefore",
    "therein", "thereupon", "these", "they", "thickv", "thin", "third", "this",
    "those", "though", "three", "through", "throughout", "thru", "thus", "to",
    "together", "too", "top", "toward", "towards", "twelve", "twenty", "two",
    "un", "under", "until", "up", "upon", "us", "very", "via", "was", "way", "we",
    "well", "were", "what", "whatever", "when", "whence", "whenever", "where",
    "whereafter", "whereas", "whereby", "wherein", "whereupon", "wherever",
    "whether", "which", "while", "whither", "who", "whoever", "whole", "whom",
    "whose", "why", "will", "with", "within", "without", "would", "yet", "you",
    "your", "yours", "yourself", "yourselves", "the",
    // contractions?
    "didnt", "doesnt", "dont", "isnt", "wasnt", "youre", "hes", "ive", "theyll",
    "whos", "wheres", "whens", "whys", "hows", "whats", "were", "shes", "im", "thats"
    ];
    var cleansed_string = text;

    // Split out all the individual words in the phrase
    var words = cleansed_string.match(/[^\s]+|\s+[^\s+]$/g);

    var keywords = [];

    // Review all the words
    for (var x=0; x < words.length; x++) {
            // For each word, check all the stop words
            for (var y=0; y < stopWords.length; y++) {
                    // Get the current word
                    var word = words[x].replace(/\s+|[^a-z]+/ig, "");       // Trim the word and remove non-alpha

                    // Get the stop word
                    var stopword = stopWords[y];

                    // If the word matches the stop word, remove it from the keywords
                    if (word.toLowerCase() == stopword) {
                            // Build the regex
                            regex_str = "^\\s*"+stopword+"\\s*$";           // Only word
                            regex_str += "|^\\s*"+stopword+"\\s+";          // First word
                            regex_str += "|\\s+"+stopword+"\\s*$";          // Last word
                            regex_str += "|\\s+"+stopword+"\\s+";           // Word somewhere in the middle
                            regex = new RegExp(regex_str, "ig");

                            // Remove the word from the keywords
                            cleansed_string = cleansed_string.replace(regex, " ");
                    }
            }
    }

    var keywordsFound = cleansed_string.split(' ');
    for (var i = 0; i < keywordsFound.length; i++) {
            if (keywordsFound[i] !== "" && keywords.indexOf(keywordsFound[i]) === -1) {
                    keywords.push(keywordsFound[i]);
            }
    }

    return keywords;
}

function findStopwords(word){
	var stopWords = ["a","able","about","across","after","all","almost","also","am","among","an","and","any","are","as","at","be","because","been","but","by","can","cannot","could","dear","did","do","does","either","else","ever","every","for","from","get","got","had","has","have","he","her","hers","him","his","how","however","i","if","in","into","is","it","its","just","least","let","like","likely","may","me","might","most","must","my","neither","no","nor","not","of","off","often","on","only","or","other","our","own","rather","said","say","says","she","should","since","so","some","than","that","the","their","them","then","there","these","they","this","tis","to","too","twas","us","wants","was","we","were","what","when","where","which","while","who","whom","why","will","with","would","yet","you","your"];
	if(word === "a"){
		var flag = true;
	}else {
		var flag = stopWords.indexOf(word.toLowerCase()) > 0 ? true : false;
		console.log("flag.......: %o", flag);
	}

	return flag;
}

//function to find files match a name pattern
function findSomeFiles(words, tab) {  //words need to change to paragraph
	var resultSet = {};
	var initResult = [];
	//filter keyword using stopwords
	var charList = words.split('');
	charList.push(' ');
	console.log('charList: %o', charList);
	var length = charList.length;
	var keyword = '';

	


	var mark = 0;
	for(var c=0; c<length; c++){
		if (charList[c] == 'a' || charList[c] == 'A' || charList[c] == 'b' || charList[c] == 'B' || charList[c] == 'c' || charList[c] == 'C' || charList[c] == 'd' || charList[c] == 'D' || charList[c] == 'e' || charList[c] == 'E' || charList[c] == 'f' || charList[c] == 'F' || charList[c] == 'g' || charList[c] == 'G' || charList[c] == 'H' || charList[c] == 'h' || charList[c] == 'i' || charList[c] == 'I' || charList[c] == 'J' || charList[c] == 'j' || charList[c] == 'k' || charList[c] == 'K' || charList[c] == 'L' || charList[c] == 'l' || charList[c] == 'M' || charList[c] == 'm' || charList[c] == 'N' || charList[c] == 'n' || charList[c] == 'o' || charList[c] == 'O' || charList[c] == 'p' || charList[c] == 'P' || charList[c] == 'q' || charList[c] == 'Q' || charList[c] == 'R' || charList[c] == 'r' || charList[c] == 'S' || charList[c] == 's' || charList[c] == 'T' || charList[c] == 't' || charList[c] == 'u' || charList[c] == 'U' || charList[c] == 'V' || charList[c] == 'v' || charList[c] == 'W' || charList[c] == 'w' || charList[c] == 'X' || charList[c] == 'x' || charList[c] == 'Y' || charList[c] == 'y' || charList[c] == 'z' || charList[c] == 'Z' || charList[c] == '1' || charList[c] == '2' ||charList[c] == '3' || charList[c] == '4' || charList[c] == '5' || charList[c] == '6' || charList[c] == '7' || charList[c] == '8' ||charList[c] == '9' || charList[c] == '0'){
			keyword += charList[c];
			console.log("current keyword: %o", keyword);
		}
		else if(charList[c] == ' ' ){
			mark = c;
			break;
		} 
		else {
			continue;
		}
	}

	console.log("charList length: %o", length);
	console.log('keyword: %o', keyword);
	var stopwordFlag = findStopwords(keyword);
	//console.log('stopwordFlag: %o', stopwordFlag);
	console.log('mark: %o', mark);

	var formerWordResult = dropboxSearch(keyword, resultSet, mark, stopwordFlag, charList, tab, initResult);

	// if(!stopwordFlag){
	// 	var formerWordResult = dropboxSearch(keyword, resultSet, mark, charList, tab, initResult);
	// }else {
	// 		var arr = grabword(charList, mark, '');

	// 		var keyword = arr[0];

	// 		var start = arr[1];

	// 		var flag = arr[2];

	// 		if(!flag) {
	// 			dropboxSearch(keyword, resultSet, start, charList, tab, initResult);
	// 		}else {
	// 			var arr = grabword(charList, start, '');

	// 			var keyword = arr[0];

	// 			var start1 = arr[1];

	// 			var flag2 = arr[2];
	// 		}
	// }
	
	//console.log('resultSet: %o', resultSet);

	console.log('formerWordResult: %o', formerWordResult);

	// if (formerWordResult[1].length > 3){
	// 	var arr = grabword(charList, mark, '');
	// 	var lKeyword = arr[0];
	// 	var start = arr[1];
	// 	var succeedWordResult = dropboxSearch(lKeyword, resultSet, start, charList, tab, initResult);

	// 	console.log("if -- I want to see the succeed keyword dropboxSearch result: %o", succeedWordResult);
	// }else {
	// 	var arr = grabword(charList, mark, '');
	// 	var lKeyword = arr[0];
	// 	var start = arr[1];

	// 	var succeedWordResult = dropboxSearch(keyword, resultSet, start, charList, tab, initResult);

	// 	console.log("else -- I want to see the succeed keyword dropboxSearch result: %o", succeedWordResult);
	// }

	// if(Object.keys(resultSet).length > 3) {
	// 	var arr = grabword(charList, mark, keyword);
	// 	var keyword = arr[0];
	// 	var mark = arr[1];
	// 	dropboxSearch(keyword, resultSet, tab);
	// }else {
	// 	console.log("charList in else function: %o", charList);
	// 	var arr = grabword(charList, mark, '');
	// 	var keyword = arr[0];
	// 	console.log("keyword in else function: %o", keyword);
	// 	var mark = arr[1];
	// 	console.log("mark in else function: %o", mark);
	// 	dropboxSearch(keyword, resultSet, tab);
	// }


	//var wordSet = filterKeyword(words);
	//var searchCount = wordSet.length;
	//console.log("Filtered Word Set", wordSet);
	//for(var key in wordSet) {
		//var keyword = wordSet[key];
		
	//}
}

// function dropboxSearch(){

// }



// function findSomeFile(words, tab) {  //words need to change to paragraph
// 	var resultSet = {};
// 	var initResult = [];
// 	//filter keyword using stopwords
// 	var charList = words.split('');
// 	console.log('charList: %o', charList);
// 	// var length = charList.length;
// 	// var keyword = '';

	


// 	//var mark = 0;

// 	var arr = grabword(charList, 0, '');

// 	var keyword = arr[0];

// 	var mark = arr[1];

// 	var flag = arr[2];

// 	if(!flag) {
// 		dropboxSearch(keyword, resultSet, mark, charList, tab, initResult);
// 	}else {
// 		var arr = grabword(charList, 0, '');
// 	}

// }


function dropboxSearch(keyword, resultSet, start, flag, charList, tab, initResult) {
	console.log("keyword in dropbox search: %o", keyword);
	console.log("mark in dropbox search: %o", start);
	console.log("mark in dropbox search: %o", flag);

	if(!flag && keyword !== ''){
		// if not stopword do the dropbox search 
		client.findByName('/', keyword, {limit:50}, (function(word, resultSet, start, flag, charList, tab, initResult) {
			//closure to pass in resultSet correctly due to scope 
			return function(error, result){ 
				if(error === undefined || (error && error.status == 400)) {
					console.log("Error %o", error);
				} else {
					//console.log('found results__keyword: %o', word); 
					console.log('found results: %o', result); 
					//console.log('found results__keyword: %o', keyword);
					// resultSet.push(result);	
					
					//console.log('initResult before used: %o', initResult)
					filter(word, start, flag, result, resultSet, initResult);
					//initResult.push(start);

					console.log('current keyword initResult: %o', initResult);
					//console.log('resultList in return function: %o', initResult[1]);
					//console.log('resultSet in return function: %o', initResult[2]);

					
						// var arr = grabword(charList, start, '');
						// var lKeyword = arr[0];
						// var mark = arr[1];
						// var dropbox = dropboxSearch(lKeyword, resultSet, mark, charList, tab, initResult);

						// console.log("if -- I want to see the succeed keyword dropboxSearch result__dropbox: %o", dropbox);
						//console.log('succeed keyword initResult in if function: %o', initResult);

						

						// var intersection = intersect(initResult, succeedResult);

						// if(intersection.length > 3) {
						// 	var arr = grabword(charList, start, '');
						// 	var lKeyword = arr[0];
						// 	var mark = arr[1];
						// 	dropboxSearch(lKeyword, resultSet, start, charList, tab);

						// }
					
						console.log("charList in else function: %o", charList);
						console.log("mark in else function: %o", start);
						console.log("tab in else function: %o", tab);
						var arr = grabword(charList, start, '');
						var keyword = arr[0];
						console.log("keyword in else function: %o", keyword);
						var mark = arr[1];
						console.log("mark in else function: %o", mark);
						var stopFlag = arr[2];
						console.log("stopFlag in else function: %o", stopFlag);
						if((keyword == '' && mark === undefined) || (keyword == '' && mark == (charList.length - 1))){
							//console.log('final initResult: %o', initResult);

							//pass the result back to the script.js
							var msg = {
								'action': 'searchResult',
								'message': initResult
								}

								console.log('msg.message before send: %o', msg.message);	
								chrome.tabs.sendMessage(tab.id, msg, logCallback);


						}else {
							if(!stopFlag && keyword !== ''){
								dropboxSearch(keyword, resultSet, mark, stopFlag, charList, tab, initResult);
							}else {
								var list2 = [];
								var resultList1 = [];
								list2.push(keyword);
								list2.push(resultList1);
								list2.push(mark);
								list2.push(stopFlag);
								//list.push(resultSet);
								initResult.push(list2);

								var arr = grabword(charList, mark, '');
								var keyword2 = arr[0];
								console.log("keyword2 in else function: %o", keyword2);
								var mark2 = arr[1];
								console.log("mark2 in else function: %o", mark2);
								var stopFlag2 = arr[2];
								console.log("stopFlag2 in else function: %o", stopFlag2);



								if((keyword2 == '' && mark2 === undefined) || (keyword2 == '' && mark2 == (charList.length - 1))){
									//console.log('final initResult: %o', initResult);

									//pass the result back to the script.js
									var msg = {
										'action': 'searchResult',
										'message': initResult
										}

										console.log('msg.message before send: %o', msg.message);	
										chrome.tabs.sendMessage(tab.id, msg, logCallback);
									}else {
										dropboxSearch(keyword2, resultSet, mark2, stopFlag2, charList, tab, initResult);
									}

								
							}
							

							//console.log("else -- I want to see the succeed keyword dropboxSearch result__dropbox: %o", dropbox);

						}
						


					
					
					// if(Object.keys(resultSet).length > 3) {
					// 	var arr = grabword(charList, start, '');
					// 	var keyword = arr[0];
					// 	var mark = arr[1];
					// 	dropboxSearch(keyword, resultSet, mark, charList, tab);
					// }else {
					// 	console.log("charList in else function: %o", charList);
					// 	console.log("mark in else function: %o", start);
					// 	console.log("tab in else function: %o", tab);
					// 	var arr = grabword(charList, start, '');
					// 	var keyword = arr[0];
					// 	console.log("keyword in else function: %o", keyword);
					// 	var mark = arr[1];
					// 	console.log("mark in else function: %o", mark);
					// 	dropboxSearch(keyword, resultSet, mark, charList, tab);
					// }
				}
				//console.log('current keyword initResult in return function: %o', initResult);
			}
		})(keyword, resultSet, start, flag, charList, tab, initResult));
	}else {
		var list1 = [];
		var resultList2 = [];
		list1.push(keyword);
		list1.push(resultList2);
		list1.push(start);
		list1.push(flag);
		//list.push(resultSet);
		initResult.push(list1);

		var arr = grabword(charList, start, '');
		var keyword3 = arr[0];
		console.log("keyword in else function: %o", keyword3);
		var mark3 = arr[1];
		console.log("mark in else function: %o", mark3);
		var stopFlag3 = arr[2];
		console.log("stopFlag3 in else function: %o", stopFlag3);


		if((keyword3 == '' && mark3 === undefined) || (keyword3 == '' && mark3 == (charList.length - 1))){
			//console.log('final initResult: %o', initResult);

			//pass the result back to the script.js
			var msg = {
				'action': 'searchResult',
				'message': initResult
				}

				console.log('msg.message before send: %o', msg.message);	
				chrome.tabs.sendMessage(tab.id, msg, logCallback);
		}else {
			dropboxSearch(keyword3, resultSet, mark3, stopFlag3, charList, tab, initResult);
		}
		
	}
	//var initResult = [];
	
	//console.log('current keyword outside client search function: %o', result);
	//console.log('current keyword outside the closure scope: %o', keyword, resultSet, start, charList, tab, initResult);
	//console.log('current keyword initResult outside the closure scope: %o', initResult);
	return initResult;
}


// function addWord(charList, start, keyword){
// 	var mark;

// 	for(var c=start; c<length; c++){
// 		if (charList[c] == 'a' || charList[c] == 'A' || charList[c] == 'b' || charList[c] == 'B' || charList[c] == 'c' || charList[c] == 'C' || charList[c] == 'd' || charList[c] == 'D' || charList[c] == 'e' || charList[c] == 'E' || charList[c] == 'f' || charList[c] == 'F' || charList[c] == 'g' || charList[c] == 'G' || charList[c] == 'H' || charList[c] == 'h' || charList[c] == 'i' || charList[c] == 'I' || charList[c] == 'J' || charList[c] == 'j' || charList[c] == 'k' || charList[c] == 'K' || charList[c] == 'L' || charList[c] == 'l' || charList[c] == 'M' || charList[c] == 'm' || charList[c] == 'N' || charList[c] == 'n' || charList[c] == 'o' || charList[c] == 'O' || charList[c] == 'p' || charList[c] == 'P' || charList[c] == 'q' || charList[c] == 'Q' || charList[c] == 'R' || charList[c] == 'r' || charList[c] == 'S' || charList[c] == 's' || charList[c] == 'T' || charList[c] == 't' || charList[c] == 'u' || charList[c] == 'U' || charList[c] == 'V' || charList[c] == 'v' || charList[c] == 'W' || charList[c] == 'w' || charList[c] == 'X' || charList[c] == 'x' || charList[c] == 'Y' || charList[c] == 'y' || charList[c] == 'z' || charList[c] == 'Z'){
// 			keyword =+ charList[c];
// 		}
// 		if(charList[c] == ' ' || charList[c] == "," || charList[c] == '.'){
// 			mark = c;
// 			break;
// 		}
// 	}
// 	return [keyword, mark];
// }

//function for intersection
function intersect(a, b)
{
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

function grabword(charList, start, keyword) {
	var mark;

	for(var c=start + 1; c<charList.length; c++){
		if (charList[c] == 'a' || charList[c] == 'A' || charList[c] == 'b' || charList[c] == 'B' || charList[c] == 'c' || charList[c] == 'C' || charList[c] == 'd' || charList[c] == 'D' || charList[c] == 'e' || charList[c] == 'E' || charList[c] == 'f' || charList[c] == 'F' || charList[c] == 'g' || charList[c] == 'G' || charList[c] == 'H' || charList[c] == 'h' || charList[c] == 'i' || charList[c] == 'I' || charList[c] == 'J' || charList[c] == 'j' || charList[c] == 'k' || charList[c] == 'K' || charList[c] == 'L' || charList[c] == 'l' || charList[c] == 'M' || charList[c] == 'm' || charList[c] == 'N' || charList[c] == 'n' || charList[c] == 'o' || charList[c] == 'O' || charList[c] == 'p' || charList[c] == 'P' || charList[c] == 'q' || charList[c] == 'Q' || charList[c] == 'R' || charList[c] == 'r' || charList[c] == 'S' || charList[c] == 's' || charList[c] == 'T' || charList[c] == 't' || charList[c] == 'u' || charList[c] == 'U' || charList[c] == 'V' || charList[c] == 'v' || charList[c] == 'W' || charList[c] == 'w' || charList[c] == 'X' || charList[c] == 'x' || charList[c] == 'Y' || charList[c] == 'y' || charList[c] == 'z' || charList[c] == 'Z' || charList[c] == '1' || charList[c] == '2' ||charList[c] == '3' || charList[c] == '4' || charList[c] == '5' || charList[c] == '6' || charList[c] == '7' || charList[c] == '8' ||charList[c] == '9' || charList[c] == '0'){
			keyword += charList[c];
		}
		else if(charList[c] == ' ' ){
			mark = c;
			break;
		}
		else {
			continue;
		}
	}

	var flag = findStopwords(keyword)
	return [keyword, mark, flag];
}

function filter(keyword, start, flag, result, resultSet, initResult) {
	console.log("keyword in filter: %o", keyword);
	console.log("result in filter: %o", result);
	var resultList = [];
	var list = [];
	for(var key in result) {
		var r = result[key];
		if (r.isFolder) {//if(r.isFolder && r.name == keyword) {
			// var folderName = r.path.split("/").pop();
			resultList.push(r.path);
			//resultSet.push(r.path);
		}
	}
	// if (resultList.length != 0){
	// 	resultSet[keyword] = resultList;
	// 	console.log('resultSet in filter function: %o', resultSet);
	// }

	list.push(keyword);
	list.push(resultList);
	list.push(start);
	list.push(flag);
	//list.push(resultSet);
	initResult.push(list);

	console.log("resultList in filter function: %o", initResult);
	return initResult;
}
	

console.log('background.js loaded');

});