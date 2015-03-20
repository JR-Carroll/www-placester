define(
	["dojo/_base/declare", "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dojo/text!temp/_propertyCardWidget.html", 
	"dojo/dom-style", "dijit/registry", "dojo/dom", "dijit/Dialog", "dojo/on"],
	function(declare, _WidgetBase, _TemplatedMixin, template, domStyle, registry, dom, Dialog, on) {
		return declare([_WidgetBase, _TemplatedMixin], {
			imgID: " ",
			_setImgIDAttr: {node: "cardImage", type: "attribute", attribute: "id"},

			price: " ",
			_setPriceAttr: {node: "_price", type: "innerHTML"},

			address: " ",
			_setAddressAttr: {node: "_address", type: "innerHTML"},

			neighborhood: " ",
			_setNeighborhoodAttr: {node: "_neighborhood", type: "innerHTML"},

			sqft: " ",
			_setSqftAttr: {node: "_sqft", type: "innerHTML"},

			floors: " ",
			_setFloorsAttr: {node: "_floors", type: "innerHTML"},

			rooms: " ",
			_setRoomsAttr: {node: "_rooms", type: "innerHTML"},

			fbaths: " ",
			_setFbathsAttr: {node: "_fbaths", type: "innerHTML"},

			hbaths: " ",
			_setHbathsAttr: {node: "_hbaths", type: "innerHTML"},

			ac: " ",
			_setAcAttr: {node: "_ac", type: "innerHTML"},

			yard: " ",
			_setYardAttr: {node: "_yard", type: "innerHTML"},

			pool: " ",
			_setPoolAttr: {node: "_pool", type: "innerHTML"},

			washer: " ",
			_setWasherAttr: {node: "_washer", type: "innerHTML"},

			imageURL: null,
			_setImageURLAttr: {node: "cardImage", type: "attribute", attribute: "style"},

			saleRent: null,
			_setSaleRentAttr: {node: "saleRent", type: "attribute", attribute: "style"},

			templateString: template,
			baseClass: "PropertyCard",

			_evalValue: function(value) {
				// General purpose helper function to determine if the value exists in the json data or not.
				if (value === null || value === undefined) {
					return false
				} else {
					return true
				}
			},

			_evalNonLegitZero: function(value) {
				// We don't want to see "0" values for things like square feet -- this is a false positive data point.
				if (value === 0 || value === undefined || value === null) {
					return false
				} else {
					return true
				}
			},

			_evalBoolean: function(value) {
				if (value === undefined || value === null) {
					return false
				} else {
					return value
				}
			},

			_evalPoolWasher: function(value) {
				if (value === undefined || value === null) {
					return "N/A"
				} else if (value === true) {
					return "Yes"
				} else if (value === false) {
					return "No"
				} else {
					return "N/A"
				}
			},

			_buildMapImage: function(location) {
				longitude = location.coords[0];
				latitude = location.coords[1];
				_mapURL = "http://maps.googleapis.com/maps/api/staticmap?center=" + longitude + "," + latitude + "&markers=color:blue%7Clabel:S|" + longitude + "," + latitude + "&zoom=17&size=600x300&sensor=false"
				var mapDialog = new Dialog({
				        title: "Relative Location of Address",
				        content: "<img src='" + _mapURL + "'>",
				    });

				on(this.mapButton, "click", function() {mapDialog.show()});
				on(this.mapText, "click", function() {mapDialog.show()});
			},

			_buildMoreInfo: function() {
				var infoDialog = new Dialog({
				        title: "Relative Location of Address",
				        content: JSON.stringify(this._attrPairNames),
				    });

				on(this.moreInfo, "click", function() {infoDialog.show()});
			},

			_buildContact: function(contact) {
				_contactHTML = "Contact: " + contact.phone + "<br/>Email: <a href='mailto:" + contact.email + "'>realtor@placester.com</a>";

				var contactDialog = new Dialog({
				        title: "Contact Information",
				        content: _contactHTML,
				    });


				on(this.contactButton, "click", function() {contactDialog.show()});
			},

			_buildAddress: function(locData) {
				return (String(locData.address) + " " + String(locData.locality) + ", " + String(locData.region))
			},

			postCreate: function() {
				var domNode = this.domNode;
				this.inherited(arguments);

				var _curData = this.cur_data;
				var _locData = this.location;

				if (_curData) {
					if (this.images === undefined || this.images[0] === undefined || this.images[0] === null) {
						this.set("imageURL", "background-image: url('./img/noimage.jpg')");
					} else {
						this.set("imageURL", "background-image: url('" + String(this.images[0].url) + "')");
					}

					if (this.purchase_types) {
						if (this.purchase_types[0] === 'sale') {
							// The property is for sale -- add the sale corner icon.
							this.set("saleRent", "background-image: url('./img/sale.png')");
						} else if (this.purchase_types[0] === 'rent'|| this.purchase_types[0] === 'rental') {
							// property is for rent -- so add the rent corner icon.
							this.set("saleRent", "background-image: url('./img/rent.png')");
						} else {
							// we got something other than 'sale' or 'rent', sooo... idk.. log it?
							console.log("We got something other than sale/rent: ", this.purchase_types[0]);
						}
					}

					// Create map button
					// Construct map URL
					if (_locData && _locData.coords) {
						this._buildMapImage(_locData);
					}

					this._buildContact(this.contact);
					this._buildMoreInfo();

					// Set the price of the unit
					_priceString = (this._evalValue(_curData.price) ? "$" + new String(_curData.price) : "N/A");
					this.set('price', _priceString);

					// Set the Address
					_addressString = (this._evalValue(_locData.address) ? this._buildAddress(_locData) : "N/A");
					this.set('address', _addressString);

					// Set the neighborhood
					_neighborhoodString = (this._evalValue(_locData.neighborhood) ? new String(_locData.neighborhood) : "N/A");
					this.set('neighborhood', _neighborhoodString);

					// Set the square footage
					_squareFootString = (this._evalNonLegitZero(_curData.sqft) ? new String(_curData.sqft) : "N/A");
					this.set('sqft', _squareFootString);

					// Set the number of floors
					_floorsString = (this._evalNonLegitZero(_curData.floors) ? new String(_curData.floors) : "N/A");
					this.set('floors', _floorsString);

					// Set the number of rooms
					_roomsString = (this._evalNonLegitZero(_curData.beds) ? new String(_curData.beds) : "N/A");
					this.set('rooms', _roomsString);

					// Set the number of full baths
					_fbathsString = (this._evalValue(_curData.baths) ? new String(_curData.baths) : "N/A");
					this.set('fbaths', _fbathsString);

					// Set the number of half baths
					_hbathsString = (this._evalValue(_curData.half_baths) ? new String(_curData.half_baths) : "N/A");
					this.set('hbaths', _hbathsString);

					// Set if AC is installed or not
					_acString = (this._evalBoolean(_curData.air_cond) ? new String(_curData.air_cond) : "N/A");
					this.set('ac', _acString);

					// Set if there is a yard or not
					_yardString = (this._evalBoolean(_curData.yard) ? new String(_curData.yard) : "N/A");
					this.set('yard', _yardString);

					// Set if there is a swimming pool or not
					_swimmingString = new String(this._evalPoolWasher(_curData.swm_pool));
					this.set('pool', _swimmingString);

					// Set if there is a washing machine or not
					_washerString = new String(this._evalPoolWasher(_curData.washer));
					this.set('washer', _washerString);
				}
			}
		});
	});