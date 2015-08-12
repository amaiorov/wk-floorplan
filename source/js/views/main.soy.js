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
  return '<div id="home"><div id="main-container"><div id="toolbar"><div class="inner"><div class="wk-logo"></div><div id="search"><input type="text"><button type="button" class="btn btn-default" data-id="search"><select><option>All</option><option value="people">People</option><option value="printers">Printers</option><option value="rooms">Rooms</option></select></div></div></div><div id="editor-container"></div></div><table id="chart" class="table table-condensed table-striped"></table></div>';
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
    output += template.EmployeeIcon({initials: employeeData6.initials, firstName: employeeData6.firstName, lastName: employeeData6.lastName, extension: employeeData6.extension, showInfo: true});
  }
  output += '</div></div><div class="floor" data-id="7"><div class="inner">';
  var employeeList15 = opt_data.floor7Employees;
  var employeeListLen15 = employeeList15.length;
  for (var employeeIndex15 = 0; employeeIndex15 < employeeListLen15; employeeIndex15++) {
    var employeeData15 = employeeList15[employeeIndex15];
    output += template.EmployeeIcon({initials: employeeData15.initials, firstName: employeeData15.firstName, lastName: employeeData15.lastName, extension: employeeData15.extension, showInfo: true});
  }
  output += '</div></div><div class="floor" data-id="8"><div class="inner">';
  var employeeList24 = opt_data.floor8Employees;
  var employeeListLen24 = employeeList24.length;
  for (var employeeIndex24 = 0; employeeIndex24 < employeeListLen24; employeeIndex24++) {
    var employeeData24 = employeeList24[employeeIndex24];
    output += template.EmployeeIcon({initials: employeeData24.initials, firstName: employeeData24.firstName, lastName: employeeData24.lastName, extension: employeeData24.extension, showInfo: true});
  }
  output += '</div></div></div><div class="mousewheel-scroller"><div class="inner"></div></div><div class="btn-group floor-buttons" data-toggle="buttons"><label class="btn btn-default active" data-id="6"><input type="radio" name="options" autocomplete="off" checked>6th Flr</label><label class="btn btn-default" data-id="7"><input type="radio" name="options" autocomplete="off">7th Flr</label><label class="btn btn-default" data-id="8"><input type="radio" name="options" autocomplete="off">8th Flr</label></div></div><div class="split-handle"></div></div><div class="waitlist-pane"><div class="container"><h3>Wait List</h3><div class="waitlist">';
  var employeeList33 = opt_data.unseatedEmployees;
  var employeeListLen33 = employeeList33.length;
  for (var employeeIndex33 = 0; employeeIndex33 < employeeListLen33; employeeIndex33++) {
    var employeeData33 = employeeList33[employeeIndex33];
    output += template.EmployeeIcon({initials: employeeData33.initials, firstName: employeeData33.firstName, lastName: employeeData33.lastName, extension: employeeData33.extension});
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
  return '<div class="employee-icon entity-icon" data-first="' + opt_data.firstName + '" data-last="' + opt_data.lastName + '" data-clickable="true"><div class="icon"><span class="initials">' + opt_data.initials + '</span></div>' + ((opt_data.showInfo == true) ? '<div class="info"><p>' + opt_data.firstName + ' ' + opt_data.lastName + '</p>' + ((opt_data.extension) ? '<p><span>Ext</span> ' + opt_data.extension + '</p>' : '') + '</div>' : '') + '</div>';
};
