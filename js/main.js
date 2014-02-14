require([
  "dojo/dom", "dojo/fx", "dojox/gfx", "dojo/_base/array", "dojo/window", "dojo/dom-style", 
  "dojox/gfx/Moveable", "dojo/json", "dojo/_base/xhr", "dojo/request", "dojo/request/xhr", "dojo/domReady!"],

  function (dom, fx, gfx, array, win, domStyle, move, JSON, xhr, request, rxhr) {
    // Where the listings are stored
    __URL__ = "http://jrcresearch.net/placester/listings.json"
    var _storedJSON = null;
    // Create the surface to which we make it rain on... makin' it rain! UHH! Yeah!
    this.surface = gfx.createSurface('mainCanvas', "100%", "100%");

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

    function _makeMoveable(x, y, width, height, img) {
      group = this.surface.createGroup();

      group.createImage({
              x: _randX || 100, 
              y: _randY || 100, 
              width: width || 100, 
              height: height || 100, 
              src: img});

      new move(group);
    }

  	function _parseListing(json) {
      var _storedJSON = json;

      for (i = json.count - 1; i >= 0; i--) {
        _currentListing = json.listings[i];
        console.log(_currentListing);
        _randX = Math.random()*300; 
        _randY = Math.random()*300;
        
        try {
          _imageSRC = _currentListing.images[0].url;
        }
        catch(err){
          _imageSRC = null;
        }

        if (_imageSRC != null) {
          _makeMoveable(_randX, _randY, null, null, img=_imageSRC)
        }
      };
  	}

  	function _sortResultsBasedOnQueue() {
      //pass
  	}

  	function start() {
    	request(__URL__, {
          handleAs: 'json'
        }).then(_parseListing)
  	} 

    // Kick-off the application.
    start();
  }
)
