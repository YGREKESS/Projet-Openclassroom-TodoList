/**
 * Creates a new View.
 * @class string View
 */
(function (window) {
	'use strict';


	/**
	 * Définit les valeurs par défaut du Template.
	 * @constructs View
	 */
	function View(template) {
		this.template = template;

		this.ENTER_KEY = 13;
		this.ESCAPE_KEY = 27;

		this.$todoList = qs('.todo-list');
		this.$todoItemCounter = qs('.todo-count');
		this.$clearCompleted = qs('.clear-completed');
		this.$main = qs('.main');
		this.$footer = qs('.footer');
		this.$toggleAll = qs('.toggle-all');
		this.$newTodo = qs('.new-todo');
	}


	/**
	 * Supprime un élément en fonction de son id.
	 * @param {number} (id) L' ID de l' élément à supprimer.
	 * @function _removeItem  
	*/
	View.prototype._removeItem = function (id) {
		var elem = qs('[data-id="' + id + '"]');

		if (elem) {
			this.$todoList.removeChild(elem);
		}
	};


	/**
	 * Masque les éléments "completed" (terminés).
	 * @param  {number} (completedCount) Le nombre d' élément coché.
	 * @param  {bolean} (visible) True si visible, false sinon.
	 * @function _clearCompletedButton  
	 */
	View.prototype._clearCompletedButton = function (completedCount, visible) {
		this.$clearCompleted.innerHTML = this.template.clearCompletedButton(completedCount);
		this.$clearCompleted.style.display = visible ? 'block' : 'none';
	};


	/**
	 * Indique la page actuelle ('' || active || completed).
	 * @param {string} (currentPage) La page actuelle peut avoir les valeurs
	 * @function _setFilter  
	 */
	View.prototype._setFilter = function (currentPage) {
		qs('.filters .selected').className = '';
		qs('.filters [href="#/' + currentPage + '"]').className = 'selected';
	};


	/**
	 * Test si l' élément est terminé.
	 * @param  {number} (id) L'ID de l'élément à tester.
	 * @param  {bolean} (completed) Le statut de l' élément.
	 * @function _elementComplete  
	 */
	View.prototype._elementComplete = function (id, completed) {
	    var listItem = qs('[data-id="' + id + '"]');

	    if (listItem) {
	        listItem.className = completed ? 'completed' : '';
	        // On définit la tâche comme terminée par défaut
	        qs('input', listItem).checked = completed;
	    }
	};


	/**
	 * Edition d'un élément.
	 * @param  {number} (id) L' ID de l' élément à éditer.
	 * @param  {string} (title) Le contenu de la modification de l' élément.
	 * @function _editItem  
	 */
	View.prototype._editItem = function (id, title) {
	    var listItem = qs('[data-id="' + id + '"]');

	    if (listItem) {
	        listItem.className = listItem.className + ' editing';
	        var input = document.createElement('input');
	        input.className = 'edit';
	        listItem.appendChild(input);
	        input.focus();
	        input.value = title;
	    }
	};


	/**
	 * Remplace l' ancien élément par l' élément édité.
	 * @param  {number} (id)    L' ID de l' élément à éditer.
	 * @param  {string} (title) Le contenu de le la modification de l' élément.
	 * @function _editItemDone  
	 */
	View.prototype._editItemDone = function (id, title) {
	    var listItem = qs('[data-id="' + id + '"]');

	    if (listItem) {
	        var input = qs('input.edit', listItem);
	        listItem.removeChild(input);
	        listItem.className = listItem.className.replace('editing', '');
	        qsa('label', listItem).forEach(function(label) {
	            label.textContent = title;
	        });
	    }
	};


	/**
	 * Met à jour le DOM.
	 * @param  {string} (viewCmd)   La fonction active.
	 * @param  {object} (parameter) Les paramètres actifs.
	 * @function render  
	 */
	View.prototype.render = function (viewCmd, parameter) {
		var self = this;
		var viewCommands = {
			/**
			 * Affiche les éléments
			 */
			showEntries: function () {
				self.$todoList.innerHTML = self.template.show(parameter);
			},
			/**
			 * Supprime l' élément
			 */
			removeItem: function () {
				self._removeItem(parameter);
			},
			/**
			 * Met à jour le compteur
			 */
			updateElementCount: function () {
				self.$todoItemCounter.innerHTML = self.template.itemCounter(parameter);
			},
			/**
			 * Affiche le bouton 'clearCompleted'
			 */
			clearCompletedButton: function () {
				self._clearCompletedButton(parameter.completed, parameter.visible);
			},
			/**
			 * Vérifie la visibilité d' élément
			 */
			contentBlockVisibility: function () {
				self.$main.style.display = self.$footer.style.display = parameter.visible ? 'block' : 'none';
			},
			/**
			 * Affiche tous les éléments
			 */
			toggleAll: function () {
				self.$toggleAll.checked = parameter.checked;
			},
			/**
			 * Filtre les éléments
			 */
			setFilter: function () {
				self._setFilter(parameter);
			},
			/**
			 * Vide le contenu du nouveau todo dans l' input
			 */
			clearNewTodo: function () {
				self.$newTodo.value = '';
			},
			/**
			 * Affiche les éléments avec le statut completed
			 */
			elementComplete: function () {
				self._elementComplete(parameter.id, parameter.completed);
			},
			/**
			 * Permet d' éditer un élément
			 */
			editItem: function () {
				self._editItem(parameter.id, parameter.title);
			},
			/**
			 * Sauvegarde l' édition d' un élément
			 */
			editItemDone: function () {
				self._editItemDone(parameter.id, parameter.title);
			}
		};

		viewCommands[viewCmd]();
	};


	/**
	 * Ajoute un ID à l' élément.
	 * @param  {object} (element) L' élément actif.
	 * @function _itemId  
	 */
	View.prototype._itemId = function (element) {
		var li = $parent(element, 'li');
		return parseInt(li.dataset.id, 10);
	};


	/**
	 * Ajoute un EventListener sur l' édition d'un élément.
	 * @param  {function} (handler) Une fonction callback.
	 * @function _bindItemEditDone  
	 */
	View.prototype._bindItemEditDone = function (handler) {
		var self = this;
		$delegate(self.$todoList, 'li .edit', 'blur', function () {
			if (!this.dataset.iscanceled) {
				handler({
					id: self._itemId(this),
					title: this.value
				});
			}
		});

		$delegate(self.$todoList, 'li .edit', 'keypress', function (event) {
			/**
			 * Retire le curseur du bouton lorsque l'on appuie sur Entrée.
			 */
			if (event.keyCode === self.ENTER_KEY) {
				this.blur();
			}
		});
	};


	/**
	 * Ajoute un EventListener sur l' annulation de l' édition d'un élément.
	 * @param  {function} (handler) Une fonction callback.
	 * @function _bindItemEditCancel  
	 */
	View.prototype._bindItemEditCancel = function (handler) {
		var self = this;
		$delegate(self.$todoList, 'li .edit', 'keyup', function (event) {
			if (event.keyCode === self.ESCAPE_KEY) {
				this.dataset.iscanceled = true;
				this.blur();

				handler({id: self._itemId(this)});
			}
		});
	};


	/**
	 * Fait le lien entre le Controller et la Vue.
	 * @param  {function} (event)   L' évenement actif.
	 * @param  {function} (handler) Une fonction callback.
	 * @function bind  
	 */
	View.prototype.bind = function (event, handler) {
	    var self = this;

	    switch (event) {
	        case 'newTodo':
	            $on(self.$newTodo, 'change', function() {
	                handler(self.$newTodo.value);
	            });
	            break;
	        case 'removeCompleted':
	            $on(self.$clearCompleted, 'click', function() {
	                handler();
	            });
	            break;
	        case 'toggleAll':
	            $on(self.$toggleAll, 'click', function() {
	                handler({ completed: this.checked });
	            });
	            break;
	        case 'itemEdit':
	            $delegate(self.$todoList, 'li label', 'dblclick', function() {
	                handler({ id: self._itemId(this) });
	            });
	            break;
	        case 'itemRemove':
	            $delegate(self.$todoList, '.destroy', 'click', function() {
	                handler({ id: self._itemId(this) });
	            });
	            break;
	        case 'itemToggle':
	            $delegate(self.$todoList, '.toggle', 'click', function() {
	                handler({
	                    id: self._itemId(this),
	                    completed: this.checked,
	                });
	            });
	            break;
	        case 'itemEditDone':
	            self._bindItemEditDone(handler);
	            break;
	        case 'itemEditCancel':
	            self._bindItemEditCancel(handler);
	            break;
	    }
	};


	// Exportation vers Window
	window.app = window.app || {};
	window.app.View = View;
}(window));
