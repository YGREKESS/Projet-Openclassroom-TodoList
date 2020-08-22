/*global NodeList */
(function (window) {
	'use strict';


	/**
	 * Récupére les éléments en fonction de leur .class
	 * Utiliser dans {@link View}.
	 * @function qs       
	 */
	window.qs = function (selector, scope) {
		return (scope || document).querySelector(selector);
	};


	/**
	 * Récupére un tableau d'éléments en fonction de leur .class
	 * Utiliser dans {@link View}.
	 * @function qsa    
	 */
	window.qsa = function (selector, scope) {
		return (scope || document).querySelectorAll(selector);
	};


	/**
	 * Raccourcis addEventListener.
	 * Utiliser dans {@link View}.
	 * Utiliser dans {@link App}.
	 * @param {object} (target)  La cible.
	 * @param {bolean} (type) Focus ou Blur.
  	 * param {function} (callback) La fonction de rappel.
	 * @param {object} (useCapture) L' élément capturé.
	 * @function $on    
	 */
	window.$on = function (target, type, callback, useCapture) {
		target.addEventListener(type, callback, !!useCapture);
	};


	/**
	 * Lie un eventListener à un parent.
	 * Utiliser dans {@link View}.
	 * @param  {object} (target)  La cible.
	 * @param  {function} (selector) Vérifie qu'il y a match entre enfants et parents.
	 * @param {bolean} (type) Le type d' event.
	 * @param  {function} (handler)  Un callback exécuté si il y a une certaine condition.
	 * @function $delegate    
	 */
	window.$delegate = function (target, selector, type, handler) {
		function dispatchEvent(event) {
			var targetElement = event.target; // cible l' élément
			var potentialElements = window.qsa(selector, target); // qsa sur élément du même type
			var hasMatch = Array.prototype.indexOf.call(potentialElements, targetElement) >= 0; // est-ce que dans potentialElements il y a targetElement , si >= o il y a un index et ça match

			if (hasMatch) {
				/**
				 * si on a un élément hasMatch on appel le gestionnaire sur l' élément cible.
				 */
				handler.call(targetElement, event);
			}
		}
		/**
		 * useCapture peut être de type blur ou focus.
		 * @type {bolean}
		 */
		var useCapture = type === 'blur' || type === 'focus';
		/**
		 * $on ajoute un eventListener
		 */
		window.$on(target, type, dispatchEvent, useCapture);
	};


	/**
	 * Recherche le parent de l'élément avec le nom de tag : $parent(qs('a'), 'div');
	 * Utiliser dans {@link View}.
	 * @param {object} (element) L' élément actif.
	 * @param {string} (tagName) Le tagName de l' élément.
	 * @function $parent    
	 */
	window.$parent = function (element, tagName) {
		if (!element.parentNode) {
			return; // si pas d' élément parent il ne se passe rien
		}
		if (element.parentNode.tagName.toLowerCase() === tagName.toLowerCase()) { // si le tagName de l' élément parent en minuscule est strictement égale à notre tagName
			return element.parentNode; // on retourne notre élément parent
		}
		return window.$parent(element.parentNode, tagName);
	};


	/**
	 * Autorise les boucle sur les nœuds : qsa('.foo').forEach(function () {})
	 */
	NodeList.prototype.forEach = Array.prototype.forEach; // parcourir chaque noeuds revient à parcourir chaque tableau


})(window);
