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
		var options = {
	        groupingItemURI: msg.paths[key],
	        xooMLDriver: dropboxXooMLUtility,
	        itemDriver: dropboxItemUtility,
	        syncDriver: mirrorSyncUtility,
	        readIfExists: true
	      }

		new ItemMirror(options, function (error, itemMirror) {
	        if (error) { throw error; }
	        console.log("itemMirror constructed at " + msg.paths[key]);
			createAssociation(itemMirror, msg);
		});		
	}

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

//function to find files match a name pattern
function findSomeFiles(words, tab) {  //words need to change to paragraph
	var resultSet = [];
	//filter keyword using stopwords
	var wordSet = filterKeyword(words);
	var searchCount = wordSet.length;
	console.log("Filtered Word Set", wordSet);
	for(var key in wordSet) {
		var keyword = wordSet[key];
		client.findByName('/', keyword, {limit:100}, (function(keyword, resultSet, tab) {
			//closure to pass in resultSet correctly due to scope  
			return function(error, result){
				if(error === undefined || (error && error.status == 400)) {
					console.log("Error %o", error);
				} else { 
					console.log('found results: %o', result); 
					// resultSet.push(result);	
					
					filter(keyword, result, resultSet);

					searchCount-=1
					if(searchCount == 1) {
						var msg = {
						'action': 'searchResult',
						'message': resultSet
						}	
						chrome.tabs.sendMessage(tab.id, msg, logCallback);
					}
				}
			}
		})(keyword, resultSet, tab));
	}
}

function filter(keyword, result, resultSet) {
	for(var key in result) {
		var r = result[key];
		if(r.isFolder && r.name == keyword) {
			// var folderName = r.path.split("/").pop();
			resultSet.push(r.path);
		}
	}
}

function createAssociation(itemMirror, msg) {
	var savePaths = msg.message;
	var selectedText = msg.selectedText;
	chrome.tabs.getSelected(null, function(tab){
		var url = tab.url;
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

console.log('background.js loaded');

});