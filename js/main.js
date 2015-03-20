require({
  baseUrl: "/placester/",
  packages: [
  {name: "dojo", location: "//ajax.googleapis.com/ajax/libs/dojo/1.8.3/dojo/"},
  {name: "dijit", location: "//ajax.googleapis.com/ajax/libs/dojo/1.8.3/dijit/"},
  {name: "loc", location: "./js"},
  {name: "temp", location: "./js/templates"}
  ]
},["dojo/dom", "dojo/fx", "dojox/gfx", "dojox/gfx/fx", "dojo/window", "dojo/dom-style", 
  "dojox/gfx/Moveable", "dojo/json", "dojo/_base/xhr", "dojo/request", "dojo/request/xhr", 
  "dojo/_base/lang", "dojo/on", "loc/propertyWidget", "dojo/io-query", "dojo/dom-construct", 
  "dojo/hash", "dojo/topic", "dijit/registry", "dojo/domReady!"],

  function (dom, fx, gfx, gfxFX, win, domStyle, move, JSON, xhr, request, rxhr, lang, on, property, ioQuery, domCon, hash, topic, registry, Dialog) {
    // Where the listings are stored
    var __LISTURL__ = "http://jrcresearch.net/placester/listings.json"
    var __URL__ = window.location.href;
    // init important variables
    var _allPages = {};
    var _allImgs = [];
    var _storedJSON = null;
    var _bottomCanvasY = parseInt(domStyle.get("mainCanvas").height, 10);
    var _canvasWidth = domStyle.get("mainCanvas", "width");
    // could be based on screen resolution and reduce the number cards per page,
    // thus reducing overflow/run-off on the page.
    var _pageMax = 6;
    var imageContainer = {1: null,
                          2: null,
                          3: null,
                          4: null,
                          5: null,
                          6: null};
    
    var preferredProp  = {1: null,
                          2: null,
                          3: null,
                          4: null,
                          5: null,
                          6: null};                          

    // Create the surface to which we make it rain on... makin' it rain! UHH! Yeah!
    this.surface = gfx.createSurface('mainCanvas', "100%", "80%");

    function _fadeOutShape(shape) {
      //helper function to fadeout the desired shape
      dojo.fadeOut({node: shape.getNode(), 
                    duration: 4000, 
                    onEnd: function() {
                            shape.removeShape();
                          }}).play()
    }

    function _trailingRainDrops(obj, rawImg){
      // console.log("got this far at least");
      if (obj != null) {
        this._obj = obj || null;
        this._rawImg = rawImg || null;
        // Get the x-value of the image placement so as to know where to place the drops.
        this._preX = parseInt(this._rawImg.rawNode.childNodes[0].attributes.x.value);
        // Center is "corner of image" + "one half of the image width"
        this._centerX = this._preX + 100/2;
        //  The current y position of the image as it moves down!
        this._centerY = obj[0].dy;
        
        // Creates the water-drop/circle behind the image every 50-or-so pixels.
        if (this._centerY > this._rawImg._threshold) {
          dropplet = surface.createCircle({ cx: this._centerX, cy: this._centerY, r: 7}).setFill("#2D608F").moveToBack();
          new _fadeOutShape(dropplet);
          this._rawImg._threshold += 50;
        }
      }
    }

  	function _moveImageDown(x, y, img) {
      // Control for how fast the image drops to the bottom of the canvas.
      var rndDropSpeed = Math.random()*25000 + 5000;
      // Keeping track of local image object within scope.
      this._rawImgObj = img;
      // The DROP function/animation.
      this._animation = gfxFX.animateTransform({
                          duration: rndDropSpeed,
                          shape: img,
                          repeat: -1,
                          onPlay: function(obj, img){
                            obj['_trigger'] = 0;
                            this['_makeDrop'] = _trailingRainDrops;
                            }, 
                          onAnimate: function(obj) {
                            this._makeDrop(obj, this.shape);
                          },
                          onEnd: function() {
                            this.shape._threshold = 0;
                            }, 
                          transform: [{
                            name: "translate",
                            start: [0, y],
                            end: [0, _bottomCanvasY - 100]
                          }]
                        }).play();
                      }

  	function _moveImageToQueue(imgObj, imgAnim, imgDict) {
      // Selec the nearest available spot
      for (var key in imageContainer) {
        newKey = parseInt(key);
        if (imageContainer[newKey] === null) {
          spot = "spot" + String(newKey);
          imageContainer[newKey] = imgDict;
          preferredProp[newKey] = imgDict.args[3];
          domStyle.set(spot, {
            backgroundImage: "url(" + imgDict.url + ")",
            backgroundSize: "100px 100px",
            backgroundRepeat: "no-repeat"
          });
          imgAnim._animation.stop();_allPages
          imgObj.removeShape();
          _refreshPageContents();
          break;
        } else {
          //pass
        }
      }
  	}

    function makeItRain(){
      var propertyContainer = dom.byId("sortedProperties");

      for (i = this._storedJSON.count - 1; i >= 0; i--) {
        _currentListing = this._storedJSON.listings[i];
        _randY = -50;
        _randX = Math.random()*_canvasWidth; // add 100 to ensure it's not too far left.
        
        if (_randX + 100 >= (_canvasWidth)) {
          _randX = _randX - 150; // sub 150 to ensure it is not too far right.
        }
        
        // Try/Catch to see if there is an image to load -- if not, make null and move on.
        try {
          _imageSRC = {
            url: _currentListing.images[0].url,
            args: [_randX, _randY, null, _currentListing]
          }
        }
        catch(err){
          _imageSRC = null;
        }

        // If there was an image, then push it to the array of tracked images.
        if (_imageSRC != null) {
          _allImgs.push(new _makeImageObject(_imageSRC.url, _randX, _randY, _imageSRC, null, null));
        }
      };
    }

    function _makeImageObject(url, x, y, imgObj, width, height) {
      this._url = url;
      this._x = x;
      this._y = y;

      // Create the falling image.
      this.surfaceImg = surface.createGroup();
      this.surfaceImg.createImage({
                        x: this._x,
                        y: this._y,
                        width: width || 100, 
                        height: height || 100, 
                        src: this._url});

      // The threshold for which a water-dropplet is created.
      this.surfaceImg._threshold = 0;
      var surfaceImg = this.surfaceImg;
      var surfaceAnim = new _moveImageDown(this._x, this._y, this.surfaceImg);
      var _imgObj = imgObj;

      on(this.surfaceImg.getNode(), "click", function(){_moveImageToQueue(surfaceImg, surfaceAnim, _imgObj)});
    }

  	function _parseListing(json) {
      this._storedJSON = json;
      // create the pages that the user can jump around in!
      var totalProperties = this._storedJSON.count -1; // correcting for offset.

      // keeping track of our current step/index within the JSON object.
      var _currentIndex = 0;
      var _currentPage = 1; // not working with offsets on this one.  This is PAGE 1, DAMMIT!!!

      i = totalProperties;
      while (i >= 0){
        // initialization of the total-on-page counter.  Everytime this loop hits, we reset.
        _totalOnPage = 0;
        _pageString = "page_" + String(_currentPage);
        var _page = [];
        
        while (_totalOnPage < _pageMax) {
          if (this._storedJSON.listings[_currentIndex] === undefined) {
            // if the index does not exist, then we've gone too far and we need
            // to break out of this loop.
            break;
          }
          _page.push(this._storedJSON.listings[_currentIndex]);
          _currentIndex++;
          _totalOnPage++;
          i--;
        }
        // Leaving while-loop once we've added the max number to the pages.
        // need to increment other variables and add to total pages.
        _allPages[_pageString] = _page;
        _currentPage++;
      }

      _allPages["count"] = _currentPage -1;

      // create links for all pages!
      var pageContainer = dom.byId('pagination');
      var _hostPath = window.location.hostname + window.location.pathname;

      for (var i = 1; i <= _allPages.count; i++) {
        _pageURI = "#" + "page_"+i;
        _pageHTML = "<div class='page' id='page_"+i+"'><a href=\""+_pageURI+"\">"+i+"</div>";
        domCon.place(_pageHTML, "pagination");
      }
    }

    function pageCreation() {
      if (_allPages) {
        __URL__ = window.location.href;
        // The property container for the various properties.
        var propertyContainer = dom.byId("sortedProperties");
        var query = __URL__.substring(__URL__.indexOf("#") + 1, __URL__.length);

        if (!query || query == "" || query === undefined || query === null){
          var _pageNum = "page_1";
        } else {
          var _pageNum = query; 
        }

        if (_allPages) {
          if (query == "preferred") {
            for (var i = 1; i <= 6; i++) {
              if (preferredProp[i] != null) {
                new property(preferredProp[i]).placeAt(propertyContainer)
              }
            }
          } else {
            for (var i = 0; i < _allPages[_pageNum].length; i++) {
              new property(_allPages[_pageNum][i]).placeAt(propertyContainer);
            }
          }
        }
      }
    }

    function _refreshPageContents() {
      registry._destroyAll();
      pageCreation();
    }

  	function start() {
    	request(__LISTURL__, {
          handleAs: 'json'
        }).then(_parseListing).then(makeItRain).then(pageCreation);

      on(dom.byId("spot1"), "click", function(){
        domStyle.set("spot1", "backgroundImage", null);
        // throwing the image back into the rain cloud.
        _allImgs.push(new _makeImageObject(imageContainer[1].url, imageContainer[1].args[0], imageContainer[1].args[1], imageContainer[1], null, null))
        imageContainer[1] = null;
        preferredProp[1] = null;
        _refreshPageContents();
      });

      on(dom.byId("spot2"), "click", function(){
        domStyle.set("spot2", "backgroundImage", null);
        // throwing the image back into the rain cloud.
        _allImgs.push(new _makeImageObject(imageContainer[2].url, imageContainer[2].args[0], imageContainer[2].args[1], imageContainer[2], null, null))
        imageContainer[2] = null;
        preferredProp[2] = null;
        _refreshPageContents();
      });

      on(dom.byId("spot3"), "click", function(){
        domStyle.set("spot3", "backgroundImage", null);
        // throwing the image back into the rain cloud.
        _allImgs.push(new _makeImageObject(imageContainer[3].url, imageContainer[3].args[0], imageContainer[3].args[1], imageContainer[3], null, null))
        imageContainer[3] = null;
        preferredProp[3] = null;
        _refreshPageContents();
      });

      on(dom.byId("spot4"), "click", function(){
        domStyle.set("spot4", "backgroundImage", null);
        // throwing the image back into the rain cloud.
        _allImgs.push(new _makeImageObject(imageContainer[4].url, imageContainer[4].args[0], imageContainer[4].args[1], imageContainer[4], null, null))
        imageContainer[4] = null;
        preferredProp[4] = null;
        _refreshPageContents();
      });

      on(dom.byId("spot5"), "click", function(){
        domStyle.set("spot5", "backgroundImage", null);
        // throwing the image back into the rain cloud.
        _allImgs.push(new _makeImageObject(imageContainer[5].url, imageContainer[5].args[0], imageContainer[5].args[1], imageContainer[5], null, null))
        imageContainer[5] = null;
        preferredProp[5] = null;
        _refreshPageContents();
  	  });

      on(dom.byId("spot6"), "click", function(){
        domStyle.set("spot6", "backgroundImage", null);
        // throwing the image back into the rain cloud.
        _allImgs.push(new _makeImageObject(imageContainer[6].url, imageContainer[6].args[0], imageContainer[6].args[1], imageContainer[6], null, null))
        imageContainer[6] = null;
        preferredProp[6] = null;
        _refreshPageContents();
      });

      on(dom.byId("preferred"), "click", function() {
        hash("#preferred", true);
      });

      topic.subscribe("/dojo/hashchange", function() {
        registry._destroyAll();
        pageCreation()});
    }

    // Kick-off the application.
    start();
  }
)
