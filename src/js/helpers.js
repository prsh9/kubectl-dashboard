import { remote } from 'electron'

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
export function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
}

export function getCurrentVersion() {
	return remote.app.getVersion()
}

export async function getLatestVersion() {
	const axios = require("axios")
	
	return axios.default({
		url: "https://api.github.com/repos/prsh9/KubeCtl-Dashboard/releases/latest",
		timeout: 5000
	}).then(res => {
		return {
			url: res.data.url,
			html_url: res.data.html_url,
			tag_name: res.data.tag_name,
			name: res.data.name,
			published_at: res.data.published_at,
		}
	}, err => {
		throw {
			message: err.message,
			response: err.response
		};
	})
}

export async function checkForUpdates() {
	const semverCompare = require("semver-compare");

	var currentVer = getCurrentVersion()

	return getLatestVersion().then((res) => {
		var latest_version = res.tag_name.substr(1);
		var isUpgrade = semverCompare(currentVer, latest_version)

		var response = {
			is_upgrade: false,
			latest_version: res.tag_name,
			html_url: res.html_url,
			name: res.name,
			published_at: res.published_at
		}

		if(isUpgrade < 0) {
			response.is_upgrade = true
		}

		return response;
	})
}

// module.exports = { debounce, getCurrentVersion, getLatestVersion, checkForUpdates }	