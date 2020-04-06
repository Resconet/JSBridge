/// <reference path="../JSBridge.d.ts"/>

var tinymce: any;
// Whether to automatically update the html editor when the entity property changes.
var handleOnChange = true;
// Whether to update the entity property when the content of the html editor is changed.
var updateEntityOnChange = true;

class EntityFormFoRichText {
	/**Get the name of the entity field from param: index.html?field=description*/
	private _field: string;
	private _editor: any;
	private _editorMode: editorMode;
	public constructor(editorMode: editorMode) {
		var url = this.getUrlParams();
		this._field = url['field'];
		this._editorMode = editorMode;
	}

	private CheckMode(entityForm: MobileCRM.UI.EntityForm, continueWith: (isReadOnly: boolean) => void) {
		if (!entityForm.canEdit) {
			continueWith(false);
		}
		else {
			MobileCRM.Metadata.requestObject(metaData => {
				var entity = metaData.getEntity(entityForm.entity.entityName);
				if (entity) {
					var prop = entity.getProperty(this._field);
					if (!prop)
						continueWith(true);
					else if (prop.permission === 2) //can create
						continueWith(false);
					else if ((prop.permission & 2) == 0)
						continueWith(true);
					else
						continueWith(false);
				}
			}, MobileCRM.bridge.alert, [this]);
		}
	}

	public initialize() {
		if (!this._field) {
			MobileCRM.bridge.alert("Parsed RichTextEditor field is undefined");
			return;
		}

		MobileCRM.UI.EntityForm.requestObject(entityF => {
			this.CheckMode(entityF, (isReadOnly) => {
				if (isReadOnly)
					loadEditor(editorMode.readOnly, (editor) => {
						editor.setMode('readonly');
						this.onEditorLoaded(entityF, editor);
					});
				else {
					loadEditor(this._editorMode, (editor) => {
						this.onEditorLoaded(entityF, editor);
					});
				}
			});
		}, MobileCRM.bridge.alert, null);
	}

	private onEditorLoaded(entityForm: MobileCRM.UI.EntityForm, editor: any) {
		if (!editor)
			MobileCRM.bridge.alert("Editor is undefined");
		else {
			this._editor = editor;
			//this._editor.getBody().firstChild.scrollIntoView();
			this._editor.off('Change'); // Disable change event

			var text = entityForm.entity.properties[this._field];
			this._editor.setContent(text || "");

			this.registerOnSave();

			if (handleOnChange) {
				this._editor.on('Change', this.onEditorChanged.bind(this));
				this.registerOnChangeHandlers();
			}
		}
	}

	private registerOnSave() {
		MobileCRM.UI.EntityForm.onSave(this.saveEditorContent, true, this);
	}

	private onEditorChanged(obj?: MobileCRM.UI.EntityForm | any) { // we can accept two different types editor or entity form
		MobileCRM.bridge.invokeMethodAsync("WebController", "set_IsDirty", [true]);

		if (updateEntityOnChange)
			MobileCRM.UI.EntityForm.requestObject(this.saveEditorContent, MobileCRM.bridge.alert, this);
	}

	private registerOnChangeHandlers() {
		// If available, use the 11.2 itemChange event.
		if (MobileCRM.UI.EntityForm.onItemChange) {
			MobileCRM.UI.EntityForm.onItemChange(this._field, entityF => {
				if (!entityF.canEdit && this._editorMode !== editorMode.readOnly) {
					tinymce.remove();
					loadEditor(editorMode.readOnly, (editor) => {
						editor.setMode('readonly');
						this._editor = editor;
					});
				}
				else if (entityF.canEdit && this._editorMode == editorMode.readOnly) {
					tinymce.remove();
					loadEditor(editorMode.simpleMode, (editor) => {
						this._editor = editor;
					});
				}

				this.onEditorChanged(entityF);
			}, true, this);
		}
		else {
			MobileCRM.UI.EntityForm.onChange(function (entityForm) {
				var context = entityForm.context as MobileCRM.UI.IFormChangeContext;
				if (context.changedItem === this._field) {
					if (!entityForm.canEdit && this._editorMode !== editorMode.readOnly) {
						tinymce.remove();
						loadEditor(editorMode.readOnly, (editor) => {
							editor.setMode('readonly');
							this._editor = editor;
						});
					}
					else if (entityForm.canEdit && this._editorMode == editorMode.readOnly) {
						tinymce.remove();
						loadEditor(editorMode.readOnly, (editor) => {
							this._editor = editor;
						});
					}

					this.onEditorChanged();
				}
			}, true, null);
		}
	}

	private saveEditorContent(entityForm: MobileCRM.UI.EntityForm): boolean {
		var entity = entityForm.entity;
		entity.properties[this._field] = this._editor.getContent();
		return true;
	}

	private getUrlParams() {
		var match,
			pl = /\+/g,  // Regex for replacing addition symbol with a space
			search = /([^&=]+)=?([^&]*)/g,
			decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
			query = window.location.search.substring(1);

		var urlParams = {};
		while (match = search.exec(query))
			urlParams[decode(match[1])] = decode(match[2]);
		return urlParams;
	}
}

function loadEditor(editMode: editorMode, continueWith: (edtior: any) => void) {
	if (editMode === editorMode.readOnly) {
		tinymce.init({
			plugins : 'autoresize',
			selector: 'textarea',
			toolbar: false,
			menubar: false,
			statusbar: false,
			setup: function (editor) {
				editor.on('init', function (e) {
					editor.execCommand('mceFullScreen');
					continueWith(editor);
				});
			}
		});
	}
	else if (editMode === editorMode.simpleMode) {
		tinymce.init({
			selector: 'textarea',
			plugins: [
				'autoresize',
				'advlist autolink lists link charmap hr anchor pagebreak',
				'paste textcolor colorpicker'
			],
			menubar: false,
			toolbar1: 'styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | forecolor backcolor',
			removed_menuitems: "fullscreen",
			statusbar: false, // If we want wordcount in the footer, comment this and add wordcount to plugins.
			setup: function (editor) {
				editor.on('init', function (e) {
					editor.execCommand('mceFullScreen');
					continueWith(editor);
				});
			}
		});
	}
	else if (editMode === editorMode.fullMode) {
		tinymce.init({
			selector: 'textarea',
			plugins: [
				'advlist autolink lists link image charmap preview hr anchor pagebreak',
				'searchreplace visualblocks visualchars code fullscreen',
				'insertdatetime media nonbreaking save table contextmenu directionality',
				'emoticons template paste textcolor colorpicker textpattern imagetools codesample toc help'
			],
			toolbar1: 'undo redo | insert | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image',
			toolbar2: 'visualblocks preview media | forecolor backcolor emoticons | codesample help',
			//menubar: 'file edit insert format table tools',
			menubar: 'edit insert format table',
			removed_menuitems: "fullscreen",
			statusbar: false,
			setup: function (editor) {
				editor.on('init', function (e) {
					editor.execCommand('mceFullScreen');
					continueWith(editor);
				});
			}
		});
	}
	else
		continueWith(null);
}

enum editorMode {
	readOnly = 0,
	simpleMode = 1,
	fullMode = 2
}

window.onload = function () {
	var er = new EntityFormFoRichText(editorMode.simpleMode);
	er.initialize();
}
