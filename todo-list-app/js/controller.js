/**
 * Creates a new Controller.
 * @class string Controller
 */
(function (window) {
	'use strict';


	/**
	 * Le controller permet l' interaction entre le Model et la Vue.
	 * @constructs Controller
	 * @param {object} (model) L' instance {@link Model}.
	 * @param {object} (view) L' instance {@Link View}.
	 */
	function Controller(model, view) {
		var self = this;
		self.model = model;
		self.view = view;

		self.view.bind('newTodo', function (title) {
			self.addItem(title);
		});

		self.view.bind('itemEdit', function (item) {
			self.editItem(item.id);
		});

		self.view.bind('itemEditDone', function (item) {
			self.editItemSave(item.id, item.title);
		});

		self.view.bind('itemEditCancel', function (item) {
			self.editItemCancel(item.id);
		});

		self.view.bind('itemRemove', function (item) {
			self.removeItem(item.id);
		});

		self.view.bind('itemToggle', function (item) {
			self.toggleComplete(item.id, item.completed);
		});

		self.view.bind('removeCompleted', function () {
			self.removeCompletedItems();
		});

		self.view.bind('toggleAll', function (status) {
			self.toggleAll(status.completed);
		});
	}


	/**
	 * Charge les routes possibles ('' | 'active' | 'completed').
	 * @param {string} (locationHash) Le hash de la page en cours, peut avoir les valeurs : '' | 'active' | 'completed'.
	 * @function setView                
	 */
	Controller.prototype.setView = function (locationHash) {
		var route = locationHash.split('/')[1];
		var page = route || '';
		this._updateFilterState(page);
	};


	/**
	 * Affiche toutes les tâches.
	 * @function showAll
	 */
	Controller.prototype.showAll = function () {
		var self = this;
		self.model.read(function (data) {
			self.view.render('showEntries', data);
		});
	};


	/**
	 * Retourne toutes les tâches actives.
	 * @function showActive  
	 */
	Controller.prototype.showActive = function () {
		var self = this;
		self.model.read({ completed: false }, function (data) {
			self.view.render('showEntries', data);
		});
	};


	/**
	 * Retourne toutes les tâches terminées.
	 * @function showCompleted
	 */
	Controller.prototype.showCompleted = function () {
		var self = this;
		self.model.read({ completed: true }, function (data) {
			self.view.render('showEntries', data);
		});
	};


	/**
	 * Evénement à déclencher lorsque vous souhaitez ajouter un élément. Il suffit de passer
	 * dans l'objet événement et il va gérer l'insertion DOM et la sauvegarde du nouvel élément.
	 * @param {string} (title) Le contenu du todo.
	 * @function addItem
	 */
	Controller.prototype.addItem = function (title) { // ETAPE 1 : correction erreur nom de fonction
		var self = this;

	    if (title.trim() !== '') {
	        self.model.create(title, function() {
	            self.view.render('clearNewTodo');
	            self._filter(true);
	        });
	    }
	};


	/*
	 * Déclenche l'édition d'un élément.
	 * @param {number} (id) L' ID du model à éditer.
	 * @function editItem
	 */
	Controller.prototype.editItem = function (id) {
		var self = this;
		self.model.read(id, function (data) {
			self.view.render('editItem', {id: id, title: data[0].title});
		});
	};


	/*
	 * Termine le mode d'édition d'élément et élimine les espaces.
	 * @param {number} (id) L' ID du model éditer à sauvegarder.
	 * @param {string} (title) Le contenu du todo.
	 * @function editItemSave
	 */
	Controller.prototype.editItemSave = function (id, title) {
		var self = this;

		title = title.trim();

		if (title.length !== 0) {
			self.model.update(id, {title: title}, function () {
				self.view.render('editItemDone', {id: id, title: title});
			});
		} else {
			self.removeItem(id);
		}
	};


	/*
	 * Annule l'édition d'un élément.
	 * @param {number} (id) L' ID du model à mettre à éditer.
	 * @function editItemCancel
	 */
	Controller.prototype.editItemCancel = function (id) {
		var self = this;
		self.model.read(id, function (data) {
			self.view.render('editItemDone', {id: id, title: data[0].title});
		});
	};


	/**
	 * Supprime une tâche de la liste.
	 * @param {number} (id) L'ID de l'élément à retirer du DOM et du stockage.
	 * @function removeItem
	 */
	Controller.prototype.removeItem = function (id) {
		var self = this;
		var items;
		self.model.read(function(data) {
			items = data;
		});

		self.model.remove(id, function () {
			self.view.render('removeItem', id);
			console.log("Element with ID: " + id + " has been removed.");
		});
		self._filter();
	};


	/**
	 * Supprime tous les éléments terminés.
	 * @function removeCompletedItems
	 */
	Controller.prototype.removeCompletedItems = function () {
		var self = this;
		self.model.read({ completed: true }, function (data) {
			data.forEach(function (item) {
				self.removeItem(item.id);
			});
		});
		self._filter();
	};


	/**
	 * Met à jour l' affichage des éléments en fonction de leur statut.
	 * @param {number} (id) L'ID de l'élément à marquer comme "complété" ou à retirer.
	 * @param {object} (checkbox) La case à cocher pour validé le statut de l' élément.
	 * @param {boolean|undefined} (silent) Empêcher le re-filtrage des éléments de tâche.
	 * @function toggleComplete
	 */
	Controller.prototype.toggleComplete = function (id, completed, silent) {
		var self = this;
		self.model.update(id, { completed: completed }, function () {
			self.view.render('elementComplete', {
				id: id,
				completed: completed
			});
		});

		if (!silent) {
			self._filter();
		}
	};


	/**
	 * Permet de basculer l' activation / désactivation des cases à cocher.
	 * @param {object} (checkbox) La case à cocher pour validé le statut de l' élément.
	 * @function toggleAll
	 */
	Controller.prototype.toggleAll = function (completed) {
		var self = this;
		self.model.read({ completed: !completed }, function (data) {
			data.forEach(function (item) {
				self.toggleComplete(item.id, completed, true);
			});
		});
		self._filter();
	};


	/**
	 * Modifie la page en fonction du nombre de todo.
	 * @function _updateCount
	 */
	Controller.prototype._updateCount = function () {
		var self = this;
		self.model.getCount(function (todos) {
			self.view.render('updateElementCount', todos.active);
			self.view.render('clearCompletedButton', {
				completed: todos.completed,
				visible: todos.completed > 0
			});

			self.view.render('toggleAll', {checked: todos.completed === todos.total});
			self.view.render('contentBlockVisibility', {visible: todos.total > 0});
		});
	};


	/**
	 * Filtre les éléments de la todo en fonction de la route active.
	 * @param {boolean|undefined} (force)  Refiltre les items.
	 * @function _filter
	 */
	Controller.prototype._filter = function (force) {
		var activeRoute = this._activeRoute.charAt(0).toUpperCase() + this._activeRoute.substr(1);
		/**
		 * Mettre à jour les éléments sur la page qui changent à chaque fois
		 */
		this._updateCount();

		/**
		 * Si la dernière route active n'est pas "All", ou si nous changeons de route,nous recréons
		 * les éléments de l'élément todo, en appelant:
		 * this.show[All|Active|Completed]();
		 */
		if (force || this._lastActiveRoute !== 'All' || this._lastActiveRoute !== activeRoute) {
			this['show' + activeRoute](); // remplace un switch
		}

		this._lastActiveRoute = activeRoute;
	};


	/**
	 * Met à jour les routes dans url.
	 * @param  {string} (currentPage) '' || active || completed La route de la page actuelle.
	 * @function _updateFilterState
	 */
	Controller.prototype._updateFilterState = function (currentPage) {
		/**
		 * Stockez une référence à la route active, ce qui nous permet de filtrer à nouveau
		 * les éléments de tâche tels qu'ils sont marqués comme complets ou incomplets.
		 */
		this._activeRoute = currentPage;

		if (currentPage === '') {
			this._activeRoute = 'All';
		}

		this._filter();

		this.view.render('setFilter', currentPage);
	};


	// Exporte vers Window
	window.app = window.app || {};
	window.app.Controller = Controller;
})(window);
