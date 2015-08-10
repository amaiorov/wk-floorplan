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
  return '<div id="home"><div class="wk-logo"></div><table id="chart" class="table table-condensed table-striped"></table></div>';
};


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @return {string}
 * @notypecheck
 */
template.SeatEditor = function(opt_data, opt_ignored) {
  var output = '<div id="seat-editor"><div class="editing-region"><div class="floor-pane"><div class="floor-viewport"><div class="floor" data-id="6"><div class="inner">';
  var employeeList6 = opt_data.floor6Employees;
  var employeeListLen6 = employeeList6.length;
  for (var employeeIndex6 = 0; employeeIndex6 < employeeListLen6; employeeIndex6++) {
    var employeeData6 = employeeList6[employeeIndex6];
    output += template.EmployeeIcon({initials: employeeData6.initials});
  }
  output += '</div></div><div class="floor" data-id="7"><div class="inner">';
  var employeeList11 = opt_data.floor7Employees;
  var employeeListLen11 = employeeList11.length;
  for (var employeeIndex11 = 0; employeeIndex11 < employeeListLen11; employeeIndex11++) {
    var employeeData11 = employeeList11[employeeIndex11];
    output += template.EmployeeIcon({initials: employeeData11.initials});
  }
  output += '</div></div><div class="floor" data-id="8"><div class="inner">';
  var employeeList16 = opt_data.floor8Employees;
  var employeeListLen16 = employeeList16.length;
  for (var employeeIndex16 = 0; employeeIndex16 < employeeListLen16; employeeIndex16++) {
    var employeeData16 = employeeList16[employeeIndex16];
    output += template.EmployeeIcon({initials: employeeData16.initials});
  }
  output += '</div></div></div><div class="btn-group floor-buttons" role="group" aria-label="..."><button type="button" class="btn btn-default" data-id="6">Floor 6</button><button type="button" class="btn btn-default" data-id="7">Floor 7</button><button type="button" class="btn btn-default" data-id="8">Floor 8</button></div><div class="split-handle"></div></div><div class="waitlist-pane"><div class="container"><h3>Wait List</h3><div class="waitlist">';
  var employeeList21 = opt_data.unseatedEmployees;
  var employeeListLen21 = employeeList21.length;
  for (var employeeIndex21 = 0; employeeIndex21 < employeeListLen21; employeeIndex21++) {
    var employeeData21 = employeeList21[employeeIndex21];
    output += template.EmployeeIcon({initials: employeeData21.initials});
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
  return '<div class="employee-icon"><div class="icon"><span class="initials">' + opt_data.initials + '</span></div></div>';
};
