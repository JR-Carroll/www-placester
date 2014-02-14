require([
  "dojo/dom", "dojo/fx", "dojox/gfx", "dojo/_base/array", "dojo/window", "dojo/dom-style", 
  "dojox/gfx/Moveable", "dojo/json", "dojo/_base/xhr", "dojo/request", "dojo/request/xhr", "dojo/domReady!"],

  function (dom, fx, gfx, array, win, domStyle, move, JSON, xhr, request, rxhr) {
  	console.log("Yay this is working");
    URL = "http://jrcresearch.net/placester/listings.json"

    // Create the surface to which we make it rain on... makin' it rain! UHH! Yeah!
    var surface = gfx.createSurface(dom.byId("mainCanvas"));

  	function makeItRain() {
  		//pass
  	}

  	function _toggleStartScreen() {
  		//pass
  	}

  	function _queryListings() {
  		//pass
  	}

  	function _moveImageDown() {
  		//pass
  	}

  	function _removeImage() {
  		//pass
  	}

  	function _moveImageToQueue() {
  		//pass
  	}

  	function selectFromQueue() {
  		//pass
  	}

  	function _displayPropertyDetails() {
  		//pass
  	}

  	function _hidePropertyDetails() {
  		//pass
  	}

  	function _showContactInfo() {
  		//pass
  	}

  	function _slideAltPhotos() {
  		//pass
  	}

  	function _parseListing(json) {
  		//pass
      // console.log(json);
      console.log("at least this hit");
      console.log(json);
  	}

  	function _sortResultsBasedOnQueue() {
      //pass
  	}

  	function start() {
    	request(URL, {
          handleAs: 'json'
        }).then(_parseListing)
  	} 

    // Kick-off the application.
    start();
  }
)
