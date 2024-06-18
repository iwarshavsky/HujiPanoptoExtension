//@ sourceURL=script.js
// Author: itaiwar - itaiwar.dev@gmail.com

let already_run = false;
function run() {

	if (!already_run) {
		already_run = true;
		is_selecting_element = false;
		var css = `
		.video_selection_hover:hover {
		  outline: 15px solid blue;
		  box-sizing: border-box;
		  -moz-box-sizing: border-box;
		  -webkit-box-sizing: border-box;
		  outline: 10px solid red;
		  outline-offset: -10px;
		}
		#cancel_selection {
		  text-align: center;
		  background: white;
		  position: absolute;
		  left: 0;
		  right: 0;
		  margin-left: auto;
		  margin-right: auto;
		  width: 150px;
		  border: 2px solid black;
		}
	  `;


		var style = document.createElement('style');
		style.type = 'text/css';

		// Check if style.styleSheet exists for IE support
		if (style.styleSheet) {
			// This is required for IE8 and below
			style.styleSheet.cssText = css;
		} else {
			// This works for modern browsers
			style.appendChild(document.createTextNode(css));
		}

		// Append the style element to the head
		document.head.appendChild(style);


		container = document.querySelector(".header-right")
		new_time = document.createElement('p');
		new_time.onclick = function () { new_time.style.opacity = 1 - new_time.style.opacity }
		new_time.style.opacity = 0.1;
		new_time.style.paddingRight = "10px";

		/**
		 * Select a video element to enlarge.
		 * @param {*} event 
		 * @returns nothing
		 */
		function select_element_for_PiP(event) {

			function enterPictureInPicture(el) {
				// https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement/requestPictureInPicture
				el.requestPictureInPicture();

			}

			event.preventDefault();

			// Don't do anything if already in this state.
			if (is_selecting_element) {
				return;
			}
			is_selecting_element = true;
			let video_elements = document.querySelectorAll("video");

			function exit_clicking_state() {
				video_elements.forEach(el_ => {
					el_.classList.remove("video_selection_hover");
					el_.onclick = '';
					cancel_selection_element.remove()
				});
				is_selecting_element = false;
			}
			let cancel_selection_element = document.createElement('div');
			cancel_selection_element.innerHTML = "Cancel";
			cancel_selection_element.id = "cancel_selection";
			document.querySelector(".header-left").appendChild(cancel_selection_element);
			cancel_selection_element.onclick = exit_clicking_state;

			video_elements.forEach(el => {
				el.classList.add("video_selection_hover");
				el.onclick = function (e) {
					exit_clicking_state();
					enterPictureInPicture(e.target);
				}

			});
		}

		picture_in_picture_button = document.createElement("button")
		picture_in_picture_button.innerHTML = '<svg height="inherit" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 48.276 48.276" xml:space="preserve" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <path style="fill:#010002;" d="M43.963,4.553H4.311C1.934,4.553,0,6.486,0,8.865v24.874c0,2.378,1.934,4.311,4.311,4.311h7.273 c-0.488,1.097-0.492,2.366,0.064,3.463c0.689,1.354,2.08,2.21,3.6,2.21h17.776c1.52,0,2.91-0.855,3.6-2.21 c0.294-0.579,0.438-1.203,0.438-1.829c0-0.56-0.125-1.115-0.355-1.634h7.257c2.378,0,4.312-1.933,4.312-4.311V8.865 C48.274,6.486,46.341,4.553,43.963,4.553z M43.842,33.617H33.604L27.401,25.1c-0.759-1.04-1.974-1.657-3.266-1.657 c-1.291,0-2.505,0.617-3.266,1.657l-6.201,8.517H4.433V8.986h39.408L43.842,33.617L43.842,33.617z"></path> </g> </g> </g></svg>';
		picture_in_picture_button.style.height = "inherit";
		picture_in_picture_button.style.marginLeft = "10px";
		picture_in_picture_button.style.marginRight = "10px";
		picture_in_picture_button.onclick = select_element_for_PiP;

		container.appendChild(picture_in_picture_button);
		container.appendChild(new_time);

		let field = document.getElementById('timeRemaining');
		let options = { characterData: false, attributes: false, childList: true, subtree: false };
		let observer = new MutationObserver(mCallback);

		/**
		 * Callback to be called to update remaining time according to speed
		 * @param {*} mutations 
		 */
		function mCallback(mutations) {

			split_time = field.innerText.substring(1).split(':');
			let has_hours = split_time.length != 2;
			if (!has_hours) {
				split_time.unshift("0");
			}

			let [hours, minutes, seconds] = split_time;

			let secs = parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds);
			let rate = parseFloat(document.getElementById("playSpeedMultiplier").innerHTML.slice(0, -1)) || 1
			console.log(rate);
			secs = Math.floor(secs / rate);
			new_hours = Math.floor(secs / 3600);
			new_mins = Math.floor((secs - new_hours * 3600) / 60);
			new_secs = secs - new_hours * 3600 - new_mins * 60;

			if (!(isNaN(new_mins) || isNaN(new_secs))) {
				new_time.innerHTML = ` <small>(x${rate})</small>  ` + (
					has_hours ? `-${('0000' + new_hours).slice(-2)}:` : "-")
					+ `${('0000' + new_mins).slice(-2)}:${('0000' + new_secs).slice(-2)} `;
				document.title = new_time.innerText;

			}

		}

		observer.observe(field, options);
	}
}

/**
 * This function waits for element to load before starting this extension.
 * @param {*} selector 
 * @returns 
 */
function waitForElm(selector) {
	return new Promise(resolve => {
		if (document.querySelector(selector)) {
			return resolve(document.querySelector(selector));
		}

		const observer = new MutationObserver(mutations => {
			if (document.querySelector(selector)) {
				observer.disconnect();
				resolve(document.querySelector(selector));
			}
		});

		// If you get "parameter 1 is not of type 'Node'" error, see https://stackoverflow.com/a/77855838/492336
		observer.observe(document.body, {
			childList: true,
			subtree: true
		});
	});
}

waitForElm(".header-right").then((elm) => {
	run()
});


