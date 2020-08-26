/*global app, jasmine, describe, it, beforeEach, expect */

describe('Controller', function () {
	'use strict';

	var subject, model, view;

	var setUpModel = function (todos) {
		model.read.and.callFake(function (query, callback) {
			callback = callback || query;
			callback(todos);
		});

		model.getCount.and.callFake(function (callback) {

			var todoCounts = {
				active: todos.filter(function (todo) {
					return !todo.completed;
				}).length,
				completed: todos.filter(function (todo) {
					return !!todo.completed;
				}).length,
				total: todos.length
			};

			callback(todoCounts);
		});

		model.remove.and.callFake(function (id, callback) {
			callback();
		});

		model.create.and.callFake(function (title, callback) {
			callback();
		});

		model.update.and.callFake(function (id, updateData, callback) {
			callback();
		});
	};

	var createViewStub = function () {
		var eventRegistry = {};
		return {
			render: jasmine.createSpy('render'),
			bind: function (event, handler) {
				eventRegistry[event] = handler;
			},
			trigger: function (event, parameter) {
				eventRegistry[event](parameter);
			}
		};
	};

	beforeEach(function () {
		model = jasmine.createSpyObj('model', ['read', 'getCount', 'remove', 'create', 'update']);
		view = createViewStub();
		subject = new app.Controller(model, view);
	});

	it('should show entries on start-up', function () { // entries ==> saisies
		
		// TODO: write test
		let todo = {title: 'my todo'};
		setUpModel([todo]);

		subject.setView('');

		expect(view.render).toHaveBeenCalledWith('showEntries', [todo]);
	});

	describe('routing', function () {

		it('should show all entries without a route', function () {
			var todo = {title: 'my todo'};
			setUpModel([todo]);

			subject.setView('');

			expect(view.render).toHaveBeenCalledWith('showEntries', [todo]);
		});

		it('should show all entries without "all" route', function () {
			var todo = {title: 'my todo'};
			setUpModel([todo]);

			subject.setView('#/');

			expect(view.render).toHaveBeenCalledWith('showEntries', [todo]);
		});

		it('should show active entries to the view', function () {
			
			// TODO: write test
			var todo = {title: 'my todo', completed: false};
			setUpModel([todo]);

			subject.setView('#/active');

			expect(view.render).toHaveBeenCalledWith('showEntries', [todo]);
		});

		it('should show active entries to the model', function () {  //===================> TEST AJOUTE : Test si la tâche s'implante bien dans le stockage
			
			// test le model
			var todo = {title: 'my todo', completed: false};
			setUpModel([todo]);

			subject.setView('#/active');

			expect(model.read).toHaveBeenCalledWith({completed: false}, jasmine.any(Function));
		});

		it('should show completed entries', function () {

			// TODO: write test
			var todo = {title: 'my todo', completed: true};
			setUpModel([todo]);

			subject.setView('#/completed');

			expect(view.render).toHaveBeenCalledWith('showEntries', [todo]);
		});

		it('should show completed entries to the model', function () {	//===================> TEST AJOUTE : Test si la tâche s'implante bien dans le stockage

			// test le model
			var todo = {title: 'my todo', completed: true};
			setUpModel([todo]);

			subject.setView('#/completed');

			expect(model.read).toHaveBeenCalledWith({completed: true}, jasmine.any(Function));
		})

	});

	it('should show the content block when todos exists', function () {
		setUpModel([{title: 'my todo', completed: true}]);

		subject.setView('');

		expect(view.render).toHaveBeenCalledWith('contentBlockVisibility', {
			visible: true
		});
	});

	it('should hide the content block when no todos exists', function () {
		setUpModel([]);

		subject.setView('');

		expect(view.render).toHaveBeenCalledWith('contentBlockVisibility', {
			visible: false
		});
	});

	it('should check the toggle all button, if all todos are completed', function () {
		setUpModel([{title: 'my todo', completed: true}]);

		subject.setView('');

		expect(view.render).toHaveBeenCalledWith('toggleAll', {
			checked: true
		});
	});

	it('should set the "clear completed" button', function () {
		var todo = {id: 42, title: 'my todo', completed: true};
		setUpModel([todo]);

		subject.setView('');

		expect(view.render).toHaveBeenCalledWith('clearCompletedButton', {
			completed: 1,
			visible: true
		});
	});

	it('should highlight "All" filter by default', function () {
		// TODO: write test
		setUpModel([]);

		// setView permet de séléctionner toutes les routes
		subject.setView('');

		// Vérifie que le filtre "All" est bien mis en avant quand l'utilisateur n'a activé aucun onglet.
		expect(view.render).toHaveBeenCalledWith('setFilter', '');
	});

	it('should highlight "Active" filter when switching to active view', function () {
		// TODO: write test
		setUpModel([]);

		// setView permet de sélectionner une route précise "Active"
		subject.setView('#/active');

		// Vérifie que le filtre "Active" est bien mis en avant quand l'utilisateur est sur l'onglet des tâches actives.
		expect(view.render).toHaveBeenCalledWith('setFilter', 'active');
	});

	it('should highlight "Completed" filter when switching to completed view', function () { //===================> TEST AJOUTE : Vérifie que le filtre "Completed" est bien mis en avant quand l'utilisateur est sur l'onglet des tâches complétées.

		setUpModel([]);

		subject.setView('#/completed');

		expect(view.render).toHaveBeenCalledWith('setFilter', 'completed');
	});

	describe('toggle all', function () {
		it('should toggle all todos to completed', function () {
			// TODO: write test
			var todos = [{
				  id: 1,
				  title: 'todo1',
				  completed: false
				}, {
				  id: 2,
				  title: 'todo2',
				  completed: false
				}];

			setUpModel(todos);

			subject.setView('');

			view.trigger('toggleAll', {completed: true});

			// Vérification que le model met à jour la todo 1 en completed: true suite à l'action de l'utilisateur
			expect(model.update).toHaveBeenCalledWith(1, {completed: true}, jasmine.any(Function));
			// Vérification que le model met à jour la todo 2 en completed: true suite à l'action de l'utilisateur
			expect(model.update).toHaveBeenCalledWith(2, {completed: true}, jasmine.any(Function));
		});

		it('should update the view', function () {
	      // TODO: write test
	      var todo = {
	        id: 1,
	        title: 'my todo',
	        completed: true
	      };

	      setUpModel([todo]);

	      subject.setView('');

	      // Passe la todo en false, comme si l'utilisateur avait cliqué dessus
	      view.trigger('itemToggle', {
	        id: 1,
	        completed: false
	      });

	      // Vérifie que la View retourne la todo correctement, ici marquée comme completed:false
	      expect(view.render).toHaveBeenCalledWith('elementComplete', {
	        id: 1,
	        completed: false
	      });
		});
	});

	describe('new todo', function () {
		it('should add a new todo to the model', function () {
			// TODO: write test

			setUpModel([]);

			subject.setView('');

			view.trigger('newTodo', 'a new todo');

			expect(model.create).toHaveBeenCalledWith('a new todo', jasmine.any(Function));
		});

		it('should add a new todo to the view', function () {
			setUpModel([]);

			subject.setView('');

			view.render.calls.reset();
			model.read.calls.reset();
			model.read.and.callFake(function (callback) {
				callback([{
					title: 'a new todo',
					completed: false
				}]);
			});

			view.trigger('newTodo', 'a new todo');

			expect(model.read).toHaveBeenCalled();

			expect(view.render).toHaveBeenCalledWith('showEntries', [{
				title: 'a new todo',
				completed: false
			}]);
		});

		it('should clear the input field when a new todo is added', function () {
			setUpModel([]);

			subject.setView('');
			// view 174
			view.trigger('newTodo', 'a new todo');

			expect(view.render).toHaveBeenCalledWith('clearNewTodo');
		});
	});

	describe('element removal', function () {
		it('should remove an entry from the model', function () { //=====================> TEST AJOUTE : Vérification avec 2 todos qu'en cas de suppression de l'un il n'en reste plus qu'un dans la view. 
			
			// TODO: write test
			var todos = [{
				  id: 1,
				  title: 'todo1',
				  completed: true
				}, {
				  id: 2,
				  title: 'todo2',
				  completed: false
				}];

			setUpModel(todos);

			subject.setView('');
			view.trigger('itemRemove', {id: 1});

			expect(model.remove).toHaveBeenCalledWith(1, jasmine.any(Function));
			expect(view.render).toHaveBeenCalledWith('updateElementCount', 1);
		});

		it('should remove an entry from the view', function () {
			var todo = {id: 42, title: 'my todo', completed: true};
			setUpModel([todo]);

			subject.setView('');
			view.trigger('itemRemove', {id: 42});

			expect(view.render).toHaveBeenCalledWith('removeItem', 42);
		});

		it('should update the element count', function () {
			var todo = {id: 42, title: 'my todo', completed: true};
			setUpModel([todo]);

			subject.setView('');
			view.trigger('itemRemove', {id: 42});

			expect(view.render).toHaveBeenCalledWith('updateElementCount', 0);
		});
	});

	describe('remove completed', function () {
		it('should remove a completed entry from the model', function () {
			var todo = {id: 42, title: 'my todo', completed: true};
			setUpModel([todo]);

			subject.setView('');
			view.trigger('removeCompleted');

			expect(model.read).toHaveBeenCalledWith({completed: true}, jasmine.any(Function));
			expect(model.remove).toHaveBeenCalledWith(42, jasmine.any(Function));
		});

		it('should remove a completed entry from the view', function () {
			var todo = {id: 42, title: 'my todo', completed: true};
			setUpModel([todo]);

			subject.setView('');
			view.trigger('removeCompleted');

			expect(view.render).toHaveBeenCalledWith('removeItem', 42);
		});
	});

	describe('element complete toggle', function () {
		it('should update the model', function () {
			var todo = {id: 21, title: 'my todo', completed: false};
			setUpModel([todo]);
			subject.setView('');

			view.trigger('itemToggle', {id: 21, completed: true});

			expect(model.update).toHaveBeenCalledWith(21, {completed: true}, jasmine.any(Function));
		});

		it('should update the view', function () {
			var todo = {id: 42, title: 'my todo', completed: true};
			setUpModel([todo]);
			subject.setView('');

			view.trigger('itemToggle', {id: 42, completed: false});

			expect(view.render).toHaveBeenCalledWith('elementComplete', {id: 42, completed: false});
		});
	});

	describe('edit item', function () {
		it('should switch to edit mode', function () {
			var todo = {id: 21, title: 'my todo', completed: false};
			setUpModel([todo]);

			subject.setView('');

			view.trigger('itemEdit', {id: 21});

			expect(view.render).toHaveBeenCalledWith('editItem', {id: 21, title: 'my todo'});
		});

		it('should leave edit mode on done', function () {
			var todo = {id: 21, title: 'my todo', completed: false};
			setUpModel([todo]);

			subject.setView('');

			view.trigger('itemEditDone', {id: 21, title: 'new title'});

			expect(view.render).toHaveBeenCalledWith('editItemDone', {id: 21, title: 'new title'});
		});

		it('should persist the changes on done', function () {
			var todo = {id: 21, title: 'my todo', completed: false};
			setUpModel([todo]);

			subject.setView('');

			view.trigger('itemEditDone', {id: 21, title: 'new title'});

			expect(model.update).toHaveBeenCalledWith(21, {title: 'new title'}, jasmine.any(Function));
		});

		it('should remove the element from the model when persisting an empty title', function () {
			var todo = {id: 21, title: 'my todo', completed: false};
			setUpModel([todo]);

			subject.setView('');

			view.trigger('itemEditDone', {id: 21, title: ''});

			expect(model.remove).toHaveBeenCalledWith(21, jasmine.any(Function));
		});

		it('should remove the element from the view when persisting an empty title', function () {
			var todo = {id: 21, title: 'my todo', completed: false};
			setUpModel([todo]);

			subject.setView('');

			view.trigger('itemEditDone', {id: 21, title: ''});

			expect(view.render).toHaveBeenCalledWith('removeItem', 21);
		});

		it('should leave edit mode on cancel', function () {
			var todo = {id: 21, title: 'my todo', completed: false};
			setUpModel([todo]);

			subject.setView('');

			view.trigger('itemEditCancel', {id: 21});

			expect(view.render).toHaveBeenCalledWith('editItemDone', {id: 21, title: 'my todo'});
		});

		it('should not persist the changes on cancel', function () {
			var todo = {id: 21, title: 'my todo', completed: false};
			setUpModel([todo]);

			subject.setView('');

			view.trigger('itemEditCancel', {id: 21});

			expect(model.update).not.toHaveBeenCalled();
		});
	});
});
