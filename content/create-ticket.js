var CreateTicket = {

	messages: [],
	taigaApi: null,
	
	ticket: {
		project: null,
	},
	
	gui: {
		projects: () => document.querySelector('#projects'),
		wizard: () => document.querySelector('#taiga-create-ticket')
	},

	startup: function(
		preferences = false,
		taigaApi = new TaigaApi()
	) {
		this.messages = window.arguments[0];

		this.taigaApi = taigaApi;
		this.preferences = preferences || new Preferences("extensions.taiga.");

		this.taigaApi.address = this.preferences.stringFrom("address");
		this.taigaApi.token = this.preferences.stringFrom("token");

		if (this.messages.length != 1) 
			new Prompt('taiga-create-ticket')
				.alert(i18n('createTicket'), i18n('selectOneMessage'))
				.then(window.close);

		this.updateGui();
	},

	showProjects: function() {		
		ListBuilder
			.fetchEntitiesFrom(() => this.taigaApi.projects())
			.nameEntities(i18n('project'), i18n('projects'))
			.createItemsNamed('listitem')
			.addItemsTo(this.gui.projects())
			.addItemOnlyWhen(project => project.i_am_member)
			.loadSelectionWith(() => this.preferences.stringFrom("lastProject"))
			.storeSelectionWith(id => this.preferences.setString("lastProject", `${id}`))
			.consumeSelectionWith((projectId) => {
				this.ticket.project = projectId;
				this.updateGui();
			})
			.catch((error) => {
				new Prompt('taiga-create-ticket') 
					.alert(i18n('createTicket'), error)
					.then(window.close);
			});
	},
	
	updateGui: function() {
		switch (this.gui.wizard().currentPage.id) {
			case 'page-project':
				this.gui.wizard().canAdvance = this.ticket.project != null;
				break;
		}
	}
	
};

// showProjects triggered before startup when using load-event
window.addEventListener("pageshow", (event) => {
	if (event.target.nodeName == 'wizardpage')
		CreateTicket.startup();
}, false);
