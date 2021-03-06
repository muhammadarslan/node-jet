'use strict';
var jetPathMatcher = require('./path_matcher');
var jetValueMatcher = require('./value_matcher');
var jetUtils = require('./utils');

var isDefined = jetUtils.isDefined;

exports.create = function (options, notify) {
	var pathMatcher = jetPathMatcher.create(options);
	var valueMatcher = jetValueMatcher.create(options);
	var added = {};

	var matchValue = function (path, event, value) {
		var isAdded = added[path];
		if (event === 'remove' || !valueMatcher(value)) {
			if (isAdded) {
				delete added[path];
				notify({
					path: path,
					event: 'remove',
					value: value
				});
			}
			return true;
		}
		if (!isAdded) {
			event = 'add';
			added[path] = true;
		} else {
			event = 'change';
		}
		notify({
			path: path,
			event: event,
			value: value
		});
		return true;
	};

	if (isDefined(pathMatcher) && !isDefined(valueMatcher)) {
		return function (path, lowerPath, event, value) {
			if (!pathMatcher(path, lowerPath)) {
				// return false to indicate no further interest.
				return false;
			}
			notify({
				path: path,
				event: event,
				value: value
			});
			return true;
		};
	} else if (!isDefined(pathMatcher) && isDefined(valueMatcher)) {
		return function (path, lowerPath, event, value) {
			return matchValue(path, event, value);
		};
	} else if (isDefined(pathMatcher) && isDefined(valueMatcher)) {
		return function (path, lowerPath, event, value) {
			if (!pathMatcher(path, lowerPath)) {
				return false;
			}
			return matchValue(path, event, value);
		};
	} else {
		return function (path, lowerPath, event, value) {
			notify({
				path: path,
				event: event,
				value: value
			});
			return true;
		};
	}
};