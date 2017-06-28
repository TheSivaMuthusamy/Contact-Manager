		var Application = React.createClass({
			propTypes: {
				location: React.PropTypes.array.isRequired
			},

			render: function() {

			switch (this.props.location[0]) {
					case 'contacts':
						if (this.props.location[1]) {
							return React.createElement(ContactView, Object.assign({}, this.props, {
								id: this.props.location[1], 
								onChangeContact: updateContactForm,
								onSubmitContact: submitContactForm,
							}));
						}
						else {
							return React.createElement(ContactsView, Object.assign({}, this.props, {
							onChangeContact: updateNewContact,
							onSubmitContact: submitNewContact,
							}));
						}
						break;
					default:
							return React.createElement('div', {}, 
							React.createElement('h1', {}, "Not Found"),
							React.createElement('a', {href: '#/contacts'}, "Contacts")
							);
					}
			}
		})

		var ContactItem = React.createClass({

			propTypes: {
				id: React.PropTypes.number.isRequired,
				name: React.PropTypes.string.isRequired,
				email: React.PropTypes.string.isRequired,
				description: React.PropTypes.string
			},

			render: function() {
				return(
					React.createElement('li', {className: 'ContactItem'},
						React.createElement('a', {href: '#/contacts/' + this.props.id, className: 'ContactItem-name'},
							this.props.name),
						React.createElement('a', {className: 'ContactItem-email', href: 'mailto:'+ this.props.email}, this.props.email),
						React.createElement('div', {className: 'ContactItem-description'}, this.props.description)
						)
					)

			}
		});

		var ContactForm = React.createClass({

			propTypes: {
				value: React.PropTypes.object.isRequired,
				onChange: React.PropTypes.func.isRequired,
				onSubmit: React.PropTypes.func.isRequired
			},

			onNameChange: function(e) {
				this.props.onChange(Object.assign({}, this.props.value, {name: e.target.value}));
			},
	
			onEmailChange: function(e) {
				this.props.onChange(Object.assign({}, this.props.value, {email: e.target.value}));
			},
	
			onDescriptionChange: function(e) {
				this.props.onChange(Object.assign({}, this.props.value, {description: e.target.value}));
			},

			onSubmit: function(e){
				e.preventDefault();
				this.props.onSubmit();
			},

			render: function() {
				var errors = this.props.value.errors || {};
				return(
					React.createElement('form', {onSubmit: this.onSubmit, className: 'ContactForm', noValidate: true},
						React.createElement('input', {className: errors.name && 'ContactForm-error', placeholder: 'Name (required)', value: this.props.value.name, onChange: this.onNameChange,
						}),
						React.createElement('input', {className: errors.email && 'ContactForm-error', placeholder: 'Email', value: this.props.value.email, onChange: this.onEmailChange,
						}),
						React.createElement('textarea', {placeholder: 'Description', value: this.props.value.description, onChange: this.onDescriptionChange,
						}),
						React.createElement('button', {type: 'submit'}, "Save Contact")
						)
				)
			}

		});

		var ContactsView = React.createClass({

			propTypes: {
				contacts: React.PropTypes.array.isRequired,
				newContactForm: React.PropTypes.object.isRequired,
				onChangeContact: React.PropTypes.func.isRequired,
				onSubmitContact: React.PropTypes.func.isRequired
			},

			render: function() {
				var listElements = this.props.contacts
									.filter(function(contact) { return contact.email })
									.map(function(contact) { return React.createElement(ContactItem, Object.assign({}, contact, {id: contact.key})); })

				return (
					 React.createElement('div', {className: 'ContactView'},
						React.createElement('h1', {className: 'ContactView-title'}, "Contacts"),
						React.createElement('ul', {className: 'ContactView-list'}, listElements),
						React.createElement(ContactForm, {value: this.props.newContactForm,
							onChange: this.props.onChangeContact,
							onSubmit: this.props.onSubmitContact
						})
					)
				);
			}




		})

		var ContactView = React.createClass({
	
			propTypes: {
				contacts: React.PropTypes.array.isRequired,
				id: React.PropTypes.string.isRequired,
				contactForms: React.PropTypes.object.isRequired,
				onChangeContact: React.PropTypes.func.isRequired,
				onSubmitContact: React.PropTypes.func.isRequired
			},

			render: function() {
				var key = this.props.id;
				var contactForm = 
					this.props.contactForms[key] ||
          this.props.contacts.filter(function(contact) { return contact.key == key })[0];

				return (
					!contactForm
						? React.createElement('h1', {}, "Not Found")
						: React.createElement('div', {className: 'ContactView'},
							React.createElement('h1', {className: 'ContactView-title'}, "Edit Contact"),
							React.createElement(ContactForm, {
							value: contactForm,
							onChange: this.props.onChangeContact,
							onSubmit: this.props.onSubmitContact
						})
					)
				)
			},
		});

		var CONTACT_TEMPLATE = {name: "", email: "", description: "", errors: null};


		function _addValidationToContact(contact) {
  		if (!contact.name) {
    		contact.errors.name = ["Please enter your new contact's name"]
  		}
  		if (!/.+@.+\..+/.test(contact.email)) {
    		contact.errors.email = ["Please enter your new contact's email"]
  		}
		}

		function updateNewContact(contact) {
			setState({ newContactForm: contact });
		}

		function navigated() {
			normalizedHash = window.location.hash.replace(/^#\/?|\/$/g, '');

			if (normalizedHash === '') {
				startNavigating('/contacts')
			}
			else {
				setState({location: normalizedHash.split('/'), transition: false});
			}
							
		}


		function submitNewContact() {
			var contact = Object.assign( {}, state.newContactForm, {key: state.contacts.length + 1, errors: {}});

			_addValidationToContact(contact);
			
			setState(
				Object.keys(contact.errors).length === 0
				? {
					newContactForm: Object.assign({}, CONTACT_TEMPLATE),
					contacts: state.contacts.slice(0).concat(contact),
				}
				: {newContactForm: contact}
			)
			
		}

		function updateContactForm(contact) {
			var update = {};
  		update[contact.key] = contact;
  		var contactForms = Object.assign(state.contactForms, update);

  		setState({ contactForms: contactForms })
		}


		function submitContactForm() {
			var key = state.location[1];
  		var contactForm = state.contactForms[key];

  		if (!contactForm) {
    		startNavigating('/contacts');
  		}
  		else {
    		var contact = Object.assign({}, contactForm, {errors: {}});

    		_addValidationToContact(contact);

    		var contactForms = Object.assign({}, state.contactForms);
    		var update = { contactForms: contactForms };
    
    		if (Object.keys(contact.errors).length === 0) {
      		delete contactForms[key];
      		update.contacts = state.contacts.slice(0).map(function(x) {
        		return x.key == key ? contact : x
      		});

      		startNavigating('/contacts');
    		}
    		else {
      		contactForms[key] = contact;
    		}

    		setState(update);
  		}  
			
		}

		function startNavigating(hash) {
			var currentHash = window.location.hash.substr(1);

  		if (currentHash != hash) {
    		setState({transition: true});

    		window.location.replace(
     			window.location.pathname + window.location.search + '#' + hash
    	);
  	}
	}


		function setState(changes) {
			Object.assign(state, changes);

			if(!state.transition) {

				ReactDOM.render(React.createElement(Application, state), document.getElementById('react-app'));
			}
		}	

		var state = {
			transition: false,
			contacts: [
				{key: 1, name: "Siva Muthusamy", email: "s.b.Muthusamy@gmail.com", description: "Can't use react"},
				{key: 2, name: "Jim", email: "jim@example.com"},
			],
			contactForms: {},
			newContactForm: Object.assign({}, CONTACT_TEMPLATE),
			location: window.location.hash
		};

		window.addEventListener('hashchange', navigated, false);

		navigated();