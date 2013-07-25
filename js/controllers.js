'use strict';

/* Controllers */

function SeatListCtrl($scope, $http, $location, $routeParams) {
	// Google Docs URL
	var host = '50.56.126.197';
	$http.defaults.useXDomain = true;
	var url = "https://spreadsheets.google.com/feeds/list/0AuOy3p4ez6oidG1jZjljTnN6Z3dpSW5vSU16eHlXQnc/od6/public/basic?alt=json",
		db = "http://"+ host +":5984/wieden_seats", // Main Seat DB
		roomdb = "http://"+ host +":5984/wieden_rooms", // Conference Room / Bathroom / Printer DB
		db_dump = {};
	// Some Defaults...
	$scope.query = {floor: 6};
	$scope.rooms = [];
	$scope.focus = true;
	$scope.search = true;
	$scope.userToggle = true;

	// Utility function for parsing CouchDB data
	function parseData(data) {
		var newArr = [],
			d = data.rows;
		for (var i in d) {
			newArr.push(d[i].doc);
		}
		return newArr;
	}

	/* Cleans up ugly strings returned by Google */
	function cleanUp (str) {
		return str.replace( /[\s\n\r]+/g, '' ).replace(/\:/g,'": "').replace(/\,/g,'", "');
	}

	// Fetches Room Info from Couch
	function resetRooms () {
		$http.get(roomdb + '/_all_docs?include_docs=true').success(function(data){
			$scope.rooms = parseData(data);
			for (var i in $scope.rooms) {
				$scope.rooms[i].selected = false;
			}
		});
	}

	function init () {
		$http.get(db + '/_all_docs?include_docs=true').success(function(dump){
			var jsonDump = dump.rows;
			console.log(jsonDump);
			for(var i in jsonDump) {
				db_dump[jsonDump[i].doc['name'] + jsonDump[i].doc['extension']] = jsonDump[i];
			}
			fetchRows();
		});
		resetRooms();
	}

	// Fetches seats from google doc
	function fetchRows () {
		jQuery.getJSON(url, function (response) {
			var people = [],
				extra;
			for (var i in response.feed.entry) {
				console.log(response.feed.entry[i].$t);
				if (response.feed.entry[i].content && response.feed.entry[i].content.$t !== '') {
					extra = '{"' + cleanUp(response.feed.entry[i].content.$t) + '"}';
					extra = jQuery.parseJSON(extra);
					if (response.feed.entry[i].title && extra.floor) {
						people.push(constructSeat(i, response, extra));
					}
				}
			}
			$scope.turned = false;
			$scope.loaded = true;
			$scope.seats = people;
			$scope.$apply();
		});	
	}

	// Saves all updates to the DB
	$scope.save = function () {
		for (var i in $scope.rooms) {
			$scope.rooms[i].selected = false;
		}
		for (var i in $scope.seats) {
			$scope.seats[i].selected = false;
		}

		$http.post(db + '/_bulk_docs', JSON.stringify({'docs': $scope.seats})).success(function(dump){
			if (dump[0]['error']) {
				$('.error').addClass('on');
				$scope.updateRevs('seat');
				setTimeout(function(){
					$('.error').removeClass('on');
				}, 	200);
			} else {
				$scope.updateRevs('seat');
				succeed(dump);
			}
		});
		
		$http.post(roomdb + '/_bulk_docs', JSON.stringify({'docs': $scope.rooms})).success(function(dump){
			if (dump[0]['error']) {
				$('.error').addClass('on');
				$scope.updateRevs('room');
				setTimeout(function(){
					$('.error').removeClass('on');
				}, 	200);
			} else {
				resetRooms();
				succeed(dump);
			}
		});
	}

	// Construct container
	function constructSeat (i, response, extra) {
		var container = {};
		container['id'] = response.feed.entry[i].title.$t.trim() + ' ' + extra.last + extra['ext.'];
		if (container.id in db_dump) {
			var thisDump = db_dump[container.id];
			container['top'] = thisDump.doc.top
			container['left'] = thisDump.doc.left;
			container['_rev'] = thisDump.value.rev;
			container['_id'] = thisDump.id;
			container['type'] = thisDump.doc.type;
		} else {
			container['top'] = 0;
			container['left'] = 0;
			container['type'] = "seat";
		}
		container['selected'] = false;
		container["floor"] = extra.floor;
		if (!extra.last) {
			extra.last = " ";
		}
		container.thresh = $scope.pos(container['left']);
		container["name"] = response.feed.entry[i].title.$t.trim() + " " + extra.last;
		container["initials"] = response.feed.entry[i].title.$t[0] + extra.last[0];
		container["extension"] = extra['ext.'];
		container['printnum'] = extra['deskmailbox'];
		return container;
	}

	$scope.printSortFunction = function (a) {
		var ret;
		if (isNaN(a.printnum)) { ret = '100000000'} else { ret = a.printnum }
		return parseInt(ret);
	}

	// Updates DB revision numbers for saving multiple times
	$scope.updateRevs = function (type) {
		if (type == 'seat') {
			$http.get(db + '/_all_docs?include_docs=true').success(function(dump){
				var jsonDump = dump;
				for(var i in jsonDump.rows) {
					db_dump[jsonDump.rows[i].doc['id']] = jsonDump.rows[i];
				}
				for (var seat in $scope.seats) {
					$scope.seats[seat]['_rev'] = db_dump[$scope.seats[seat].id].value.rev;
				}
			});
		} else {
			$http.get(roomdb + '/_all_docs?include_docs=true').success(function(dump){
				var jsonDump = dump.rows;
				for (var i in $scope.rooms) {
					var id = $scope.rooms[i]['_id'];
					var rev;
					for (var b in jsonDump) {
						if (jsonDump[b].id === id) {
							rev = jsonDump[b].doc['_rev'];
							$scope.rooms[i]['_rev'] = rev;
						}
					}
				}
			});
		}
	}

	$scope.pos = function(seat) {
		var num = seat.split('.')[0];
		if (num.length > 2) {
			num = num.substring(0,1);
		}
		num = parseInt(num);

		if (num > 80) {
			return 'seatright'
		} else {
			return 'seatleft';
		}
	}

	// Toggles the state of the pin drops on click
	$scope.toggle = function () {
		if (this.seat) {
			for (var i in $scope.seats) {
				if (this.seat.name != $scope.seats[i].name) {
					$scope.seats[i].selected = false;
				}
			}
			for (var i in $scope.rooms) {
				$scope.rooms[i].selected = false;
			}
			this.seat.selected = !this.seat.selected;
		}
		else if (this.room) {
			for (var i in $scope.rooms) {
				if (this.room.name != $scope.rooms[i].name) {
					$scope.rooms[i].selected = false;
				}
			}
			for (var i in $scope.seats) {
				$scope.seats[i].selected = false;
			}
			this.room.selected = !this.room.selected;
		} else {
			for (var i in $scope.seats) {
				$scope.seats[i].selected = false;
			}
			for (var i in $scope.rooms) {
				$scope.rooms[i].selected = false;
			}
		}
	}

	// When a non-admin first views the page, show nothing. Start showing on search or filter.
	$scope.textChange = function (query) {
		if (query.name === "" || typeof query.name == "undefined") {
			$scope.turned = "";
			delete query.name;
		}
		else {
			$scope.turned = "searching";
		}
	}

	// Displays the fading success message
	function succeed (dump) {
		$('.success').addClass('on');
		setTimeout(function(){
			$('.success').removeClass('on');
		}, 200);
	}

	// Handles creation of a new "room" from the admin form
	$scope.saveRoom = function () {
		var room = $scope.room;
		if (room.name !== "" && room.name && room.floor !== "" && room.floor) {
			room.initials = "P";

			$scope.rooms.push({name: room.name, floor: room.floor, top: 0, left: 0, type: 'printer', initials: room.initials});
			$scope.room.name = "";
			$scope.room.floor = "";
			$scope.room.type = "";
			$scope.save();
		}		
	}

	// Deletes a room
	$scope.deleteRoom = function (scope) {
		scope.room['_deleted'] = true;
		$scope.save();
	}

	init();
}