// This file was automatically generated from main.soy.
// Please don't edit this file by hand.

if (typeof template == 'undefined') { var template = {}; }


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @return {string}
 * @notypecheck
 */
template.Home = function(opt_data, opt_ignored) {
  return '<div id="home"><div id="main-container"><div id="toolbar"><div class="inner"><div class="wk-logo"></div><div id="search"><div class="input-group"><input type="text" class="form-control" aria-label="..."><div class="input-group-btn"><button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Everything <span class="caret"></span></button><ul class="dropdown-menu dropdown-menu-right"><li><a href="#" data-value="all">Everything</a></li><li><a href="#" data-value="people">People</a></li><li><a href="#" data-value="rooms">Rooms</a></li><li><a href="#" data-value="printers">Printers</a></li></ul></div></div></div></div></div><div id="editor-container"></div></div><table id="chart" class="table table-condensed table-striped"></table></div>';
};


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @return {string}
 * @notypecheck
 */
template.SeatEditor = function(opt_data, opt_ignored) {
  var output = '<div id="seat-editor"><div class="editing-region"><div class="floor-pane"><div class="floor-viewport"><div class="floor-container"><div class="floor" data-id="6"><div class="inner">';
  var employeeList6 = opt_data.floor6Employees;
  var employeeListLen6 = employeeList6.length;
  for (var employeeIndex6 = 0; employeeIndex6 < employeeListLen6; employeeIndex6++) {
    var employeeData6 = employeeList6[employeeIndex6];
    output += template.EmployeeIcon({initials: employeeData6.initials, firstName: employeeData6.firstName, lastName: employeeData6.lastName});
  }
  output += '</div></div><div class="floor" data-id="7"><div class="inner">';
  var employeeList13 = opt_data.floor7Employees;
  var employeeListLen13 = employeeList13.length;
  for (var employeeIndex13 = 0; employeeIndex13 < employeeListLen13; employeeIndex13++) {
    var employeeData13 = employeeList13[employeeIndex13];
    output += template.EmployeeIcon({initials: employeeData13.initials, firstName: employeeData13.firstName, lastName: employeeData13.lastName});
  }
  output += '</div></div><div class="floor" data-id="8"><div class="inner">';
  var employeeList20 = opt_data.floor8Employees;
  var employeeListLen20 = employeeList20.length;
  for (var employeeIndex20 = 0; employeeIndex20 < employeeListLen20; employeeIndex20++) {
    var employeeData20 = employeeList20[employeeIndex20];
    output += template.EmployeeIcon({initials: employeeData20.initials, firstName: employeeData20.firstName, lastName: employeeData20.lastName});
  }
  output += '</div></div></div><div class="mousewheel-scroller"><div class="inner"></div></div><div class="btn-group floor-buttons" data-toggle="buttons"><label class="btn btn-default active" data-id="6"><input type="radio" name="options" autocomplete="off" checked>6th Flr</label><label class="btn btn-default" data-id="7"><input type="radio" name="options" autocomplete="off">7th Flr</label><label class="btn btn-default" data-id="8"><input type="radio" name="options" autocomplete="off">8th Flr</label></div></div><div class="split-handle"></div></div><div class="waitlist-pane"><div class="container"><h3>Wait List</h3><div class="waitlist">';
  var employeeList27 = opt_data.unseatedEmployees;
  var employeeListLen27 = employeeList27.length;
  for (var employeeIndex27 = 0; employeeIndex27 < employeeListLen27; employeeIndex27++) {
    var employeeData27 = employeeList27[employeeIndex27];
    output += template.EmployeeIcon({initials: employeeData27.initials, firstName: employeeData27.firstName, lastName: employeeData27.lastName});
  }
  output += '</div></div></div></div></div>';
  return output;
};


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @return {string}
 * @notypecheck
 */
template.EmployeeIcon = function(opt_data, opt_ignored) {
  return '<div class="employee-icon occupant-icon" data-first="' + opt_data.firstName + '" data-last="' + opt_data.lastName + '" data-clickable="true"><div class="icon"><span class="initials">' + opt_data.initials + '</span></div></div>';
};
