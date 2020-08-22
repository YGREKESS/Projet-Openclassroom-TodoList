/**
 * Creates a new Template.
 * @class string Template
 */
(function (window) {
	'use strict';


	var htmlEscapes = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		'\'': '&#x27;',
		'`': '&#x60;'
	};


	var escapeHtmlChar = function (chr) {
		return htmlEscapes[chr];
	};

	var reUnescapedHtml = /[&<>"'`]/g;
	var reHasUnescapedHtml = new RegExp(reUnescapedHtml.source);

	var escape = function (string) {
		return (string && reHasUnescapedHtml.test(string))
			? string.replace(reUnescapedHtml, escapeHtmlChar)
			: string;
	};


	/**
	 * Définit les valeurs par défaut du template
	 * @constructs Template
	 */
	function Template() {
		this.defaultTemplate
		=	'<li data-id="{{id}}" class="{{completed}}">'
		+		'<div class="view">'
		+			'<input class="toggle" type="checkbox" {{checked}}>'
		+			'<label>{{title}}</label>'
		+			'<button class="destroy"></button>'
		+		'</div>'
		+	'</li>';
	}

	/**
	 * Récupère le template et l'adapte en fonction de la tâche créée.
	 * @param {object} (data) L'objet contenant les données que vous souhaitez adapter au template.
	 * @returns {string} Template HTML correspondant à l' élément <li>
	 * @function show
	 */
	Template.prototype.show = function (data) {
		var i, l;
		var view = '';

		for (i = 0, l = data.length; i < l; i++) {
			var template = this.defaultTemplate;
			var completed = '';
			var checked = '';

			if (data[i].completed) {
				completed = 'completed';
				checked = 'checked';
			}

			template = template.replace('{{id}}', data[i].id);
			template = template.replace('{{title}}', escape(data[i].title));
			template = template.replace('{{completed}}', completed);
			template = template.replace('{{checked}}', checked);

			view = view + template;
		}
		return view;
	};


	/**
	 * Affiche un compteur du nombre de tâches à terminer.
	 * @param {number} (activeTodos) Le nombre de todos actifs.
	 * @returns {string} Chaîne contenant le nombre.
	 * @function itemCounter
	 */
	Template.prototype.itemCounter = function (activeTodos) {
		var plural = activeTodos === 1 ? '' : 's';

		return '<strong>' + activeTodos + '</strong> item' + plural + ' left';
	};


	/**
	 * Met à jour le texte dans le bouton "Clear completed".
	 * @param  {number} (completedTodos) Le nombre de todos complété(s).
	 * @returns {string} Chaîne contenant le nombre.
	 * @function clearCompletedButton
	 */
	Template.prototype.clearCompletedButton = function (completedTodos) {
		if (completedTodos > 0) {
			return 'Clear completed';
		} else {
			return '';
		}
	};


	// Exporte vers Window
	window.app = window.app || {};
	window.app.Template = Template;
})(window);
