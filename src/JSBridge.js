// v9.3
(function () {
	var _scriptVersion = 9.3;
	// Private objects & functions
	var _inherit = (function () {
		function _() { }
		return function (child, parent) {
			_.prototype = parent.prototype;
			child.prototype = new _;
			child.prototype.constructor = child;
			child.superproto = parent.prototype;
			return child;
		};
	})();
	var _addProperty = function (obj, name, writable, value) {
		if (!obj._privVals)
			obj._privVals = {};
		if (!obj._typeInfo)
			obj._typeInfo = {};
		if (!obj.propertyChanged)
			obj.propertyChanged = new _Event(obj);

		if (value != undefined)
			obj._privVals[name] = value;
		var propDef = { get: function () { return obj._privVals[name]; }, enumerable: true };
		if (writable) {
			propDef.set = function (newVal) {
				if (obj._privVals[name] != newVal) {
					obj._privVals[name] = newVal;
					obj.propertyChanged.raise(name);
				}
				if (obj._typeInfo[name])
					delete obj._typeInfo[name];
			};
		}
		Object.defineProperty(obj, name, propDef);
	};
	var _bindHandler = function (handler, handlers, bind, scope) {
		if (bind || typeof bind == "undefined") {
			handlers.push({ handler: handler, scope: (scope ? scope : null) });
		}
		else {
			var index = 0;
			while (index < handlers.length) {
				if (handlers[index].handler === handler) {
					handlers.splice(index, 1);
				}
				else {
					index++;
				}
			}
		}
	};
	var _callHandlers = function (handlers) {
		var params = [];
		var i = 1;
		while (arguments[i])
			params.push(arguments[i++]);

		var result = false;
		for (var index in handlers) {
			var handlerDescriptor = handlers[index];
			if (handlerDescriptor && handlerDescriptor.handler) {
				var thisResult = handlerDescriptor.handler.apply(handlerDescriptor.scope, params);
				if (thisResult != false)
					result = result || thisResult;
			}
		}
		return result;
	}
	var _Event = function (sender) {
		var _handlers = [],
			_handlersToRemove = [],
			_bRaisingEvent = false;


		this.add = function (handler, target) {
			var bExists = false;

			for (var index in _handlers) {
				var h = _handlers[index];
				if (h && h.handler == handler && h.target == target) {
					bExists = true;
					break;
				}
			}
			if (!bExists) {
				_handlers.push({ handler: handler, target: target });
			}
		}

		this.remove = function (handler, target) {
			var index = 0;

			while (index < _handlers.length) {
				var h = _handlers[index];

				if ((!handler || h.handler == handler) && (!target || h.target == target)) {
					if (!_bRaisingEvent) {
						_handlers.splice(index, 1);
						index--;
					}
					else {
						_handlersToRemove.push(h);
					}
				}
				index++;
			}
		}

		this.clear = function () {
			if (!_bRaisingEvent) {
				_handlers = [];
			}
			else {
				_handlersToRemove = _handlers.slice(0);
			}
		}

		this.raise = function (eventArgs) {
			// Make sure every handler is called in raise(), if any handler is removed while in 'for' cycle, remove it after the loop finishes
			_bRaisingEvent = true;

			for (index in _handlers) {
				var h = _handlers[index];
				if (h && h.handler) {
					h.handler.call(h.target ? h.target : sender, eventArgs, sender);
					if (eventArgs && eventArgs.cancel) {
						break;
					}
				}
			}

			_bRaisingEvent = false;

			for (index in _handlersToRemove) {
				var hToRemove = _handlersToRemove[index];
				if (hToRemove)
					this.remove(hToRemove.handler, hToRemove.target);
			}
		}
	};

	if (typeof MobileCrmException === "undefined") {
		MobileCrmException = function (msg) {
			this.message = msg;
			this.name = "MobileCrmException";
		};
		MobileCrmException.prototype.toString = function () { return this.message; };
	}

	// MobileCRM object definition
	if (typeof MobileCRM === "undefined") {
		MobileCRM = {
			/// <summary>An entry point for Mobile CRM data model.</summary>
			/// <field name="bridge" type="MobileCRM.Bridge">Singleton instance of <see cref="MobileCRM.Bridge">MobileCRM.Bridge</see> providing the management of the Javascript/native code cross-calls.</field>
			bridge: null,

			Bridge: function (platform) {
				/// <summary>Provides the management of the Javascript/native code cross-calls. Its only instance <see cref="MobileCRMbridge">MobileCRM.bridge</see> is created immediately after the &quot;JSBridge.js&quot; script is loaded.</summary>
				/// <param name="platform" type="String">A platform name</param>
				/// <field name="platform" type="String">A string identifying the device platform (e.g. Android, iOS, Windows, WindowsRT, Windows10 or WindowsPhone).</field>
				/// <field name="version" type="Number">A number identifying the version of the JSBridge. This is the version of the script which might not match the version of the application part of the bridge implementation. Application version must be equal or higher than the script version.</field>
				this.commandQueue = [];
				this.processing = false;
				this.callbacks = {};
				this.callbackId = 0;
				this.version = _scriptVersion;
				this.platform = platform;
			},

			Configuration: function () {
				/// <summary>Provides an access to the application configuration.</summary>
				/// <remarks>This object cannot be created directly. To obtain/modify this object, use <see cref="MobileCRM.Configuration.requestObject">MobileCRM.Configuration.requestObject</see> function.</remarks>
				/// <field name="applicationEdition" type="String">Gets the application edition.</field>
				/// <field name="applicationPath" type="String">Gets the application folder.</field>
				/// <field name="applicationVersion" type="String">Gets the application version (major.minor.subversion.build).</field>
				/// <field name="customizationDirectory" type="String">Gets or sets the runtime customization config root.</field>
				/// <field name="externalConfiguration" type="String">Gets the external configuration directory (either customization or legacy configuration).</field>
				/// <field name="isBackgroundSync" type="Boolean">Gets or sets whether background synchronization is in progress.</field>
				/// <field name="isOnline" type="Boolean">Gets or sets whether the online mode is currently active.</field>
				/// <field name="legacyVersion" type="String">Gets or sets the legacy redirect folder.</field>
				/// <field name="licenseAlert" type="String">Gets the flag set during sync indicating that the user&apos;s license has expired.</field>
				/// <field name="settings" type="MobileCRM._Settings">Gets the application settings.</field>
				/// <field name="storageDirectory" type="String">Gets the root folder of the application storage.</field>
			},

			Localization: {
				stringTable: {},
				initialized: false
			},

			Reference: function (entityName, id, primaryName) {
				/// <summary>Represents an entity reference which provides the minimum information about an entity.</summary>
				/// <param name="entityName" type="String">The logical name of the reference, e.g. "account".</param>
				/// <param name="id" type="String">GUID of the existing entity or null for new one.</param>
				/// <param name="primaryName" type="String">The human readable name of the reference, e.g "Alexandro".</param>
				/// <field name="entityName" type="String">The logical name of the reference, e.g. "account".</field>
				/// <field name="id" type="String">GUID of the existing entity or null for new one.</field>
				/// <field name="isNew" type="Boolean">Indicates whether the entity is newly created.</field>
				/// <field name="primaryName" type="String">The human readable name of the reference, e.g. "Alexandro".</field>
				this.entityName = entityName;
				this.id = id;
				this.isNew = (id ? false : true);
				this.primaryName = primaryName;
			},

			Relationship: function (sourceProperty, target, intersectEntity, intersectProperty) {
				/// <summary>Represents a relationship between two entities.</summary>
				/// <param name="sourceProperty" type="String">Gets the name of the source of the relationship.</param>
				/// <param name="target" type="MobileCRM.Reference">Gets the target of the relationship.</param>
				/// <param name="intersectEntity" type="String">Gets the intersect entity if any. Used when displaying entities that are associated through a Many to Many relationship.</param>
				/// <param name="intersectProperty" type="String">Gets the intersect entity property if any. Used when displaying entities that are associated through a Many to Many relationship.</param>
				/// <field name="sourceProperty" type="String">Gets the name of the source of the relationship.</field>
				/// <field name="target" type="MobileCRM.Reference">Gets the target of the relationship.</field>
				/// <field name="intersectEntity" type="String">Gets the intersect entity if any. Used when displaying entities that are associated through a Many to Many relationship.</field>
				/// <field name="intersectProperty" type="String">Gets the intersect entity property if any. Used when displaying entities that are associated through a Many to Many relationship.</field>
				this.sourceProperty = sourceProperty;
				this.target = target;
				this.intersectEntity = intersectEntity;
				this.intersectProperty = intersectProperty;
			},

			ManyToManyReference: {
			},

			DynamicEntity: function (entityName, id, primaryName, properties, isOnline) {
				/// <summary>Represents a CRM entity, with only a subset of properties loaded.</summary>
				/// <remarks><p>This class is derived from <see cref="MobileCRM.Reference">MobileCRM.Reference</see></p><p>There is a compatibility issue since the version 7.4 which gets the boolean and numeric properties as native Javascript objects (instead of strings). If you experienced problems with these types of fields, switch on the legacy serialization by setting the static property MobileCRM.DynamicEntity.legacyPropsSerialization to true.</p></remarks>
				/// <param name="entityName" type="String">The logical name of the entity, e.g. "account".</param>
				/// <param name="id" type="String">GUID of the existing entity or null for new one.</param>
				/// <param name="primaryName" type="String">The human readable name of the entity, e.g "Alexandro".</param>
				/// <param name="properties" type="Object">An object with entity properties, e.g. {firstname:"Alexandro", lastname:"Puccini"}.</param>
				/// <param name="isOnline" type="Boolean">Indicates whether the entity was created by online request or from local data.</param>
				/// <field name="entityName" type="String">The logical name of the entity, e.g. "account".</field>
				/// <field name="id" type="String">GUID of the existing entity or null for new one.</field>
				/// <field name="isNew" type="Boolean">Indicates whether the entity is newly created.</field>
				/// <field name="isOnline" type="Boolean">Indicates whether the entity was created by online request or from local data.</field>
				/// <field name="primaryName" type="String">The human readable name of the entity, e.g. "Alexandro".</field>
				/// <field name="properties" type="Object">An object with entity properties, e.g. {firstname:"Alexandro", lastname:"Puccini"}.</field>
				MobileCRM.DynamicEntity.superproto.constructor.apply(this, arguments);
				this.isOnline = isOnline;
				if (properties) {
					if (MobileCRM.DynamicEntity.legacyPropsSerialization) {
						// This is a workaround for failing scripts in v7.4 (string/bool issue)
						for (var i in properties) {
							if (typeof (properties[i]) == "boolean")
								properties[i] = properties[i].toString();
						}
					}
					this.properties = new MobileCRM.ObservableObject(properties);
				}
				else
					this.properties = {};
			},

			Metadata: {
				entities: null
			},

			MetaEntity: function (props) {
				/// <summary>Represents an entity metadata.</summary>
				MobileCRM.MetaEntity.superproto.constructor.apply(this, arguments);
			},

			MetaProperty: function () {
				/// <summary>Represents a property (CRM field) metadata.</summary>
				/// <field name="name" type="String">Gets the field (logical) name.</field>
				/// <field name="required" type="Number">Gets the attribute requirement level (0=None, 1=SystemRequired, 2=Required, 3=Recommended, 4=ReadOnly).</field>
				/// <field name="type" type="Number">Gets the attribute CRM type (see http://msdn.microsoft.com/en-us/library/microsoft.xrm.sdk.metadata.attributetypecode.aspx ).</field>
				/// <field name="format" type="Number">Gets the attribute display format.</field>
				/// <field name="isVirtual" type="Boolean">Gets whether the property is virtual (has no underlying storage). State and PartyList properties are virtual.</field>
				/// <field name="isReference" type="Boolean">Gets whether the property is a reference (lookup) to another entity.</field>
				/// <field name="isNullable" type="Boolean">Gets whether the property may contain NULL.</field>
				/// <field name="defaultValue" type="">Gets the property default value.</field>
				/// <field name="targets" type="Array">Gets the names of target entities, if the property is a lookup, or customer.</field>
				/// <field name="minimum" type="Number">Gets the attribute minimum value.</field>
				/// <field name="maximum" type="Number">Gets the attribute minimum value.</field>
				/// <field name="precision" type="Number">Gets the numeric attribute&apos;s precision (decimal places).</field>
				/// <field name="permission" type="Number">Gets the attribute&apos;s permission set (0=None, 1=User, 2=BusinessUnit, 4=ParentChild, 8=Organization).</field>
				/// <field name="activityPartyType" type="Number">Gets the activity party type (from, to, attendee, etc.)</field>
				/// <field name="isMultiParty" type="Boolean">Gets whether the activity party property can have multiple values (multiple to, cc, resources.)</field>
				/// <field name="isSingularParty" type="Boolean">Gets whether the property represents a singular activity party property. These properties exists as both a Lookup property on the entity and an ActivytParty record.</field>
			},

			FetchXml: {
				Fetch: function (entity, count, page) {
					/// <summary>Represents a FetchXml query object.</summary>
					/// <param name="entity" type="MobileCRM.FetchXml.Entity">An entity object.</param>
					/// <param name="count" type="int">the maximum number of records to retrieve.</param>
					/// <param name="page" type="int">1-based index of the data page to retrieve.</param>
					/// <field name="aggregate" type="Boolean">Indicates whether the fetch is aggregated.</field>
					/// <field name="count" type="int">the maximum number of records to retrieve.</field>
					/// <field name="entity" type="MobileCRM.FetchXml.Entity">An entity object.</field>
					/// <field name="page" type="int">1-based index of the data page to retrieve.</field>
					this.entity = entity;
					this.count = count;
					this.page = page;
					this.aggregate = false;
				},
				Entity: function (name) {
					/// <summary>Represents a FetchXml query root entity.</summary>
					/// <param name="name" type="String">An entity logical name.</param>
					/// <field name="attributes" type="Array">An array of <see cref="MobileCRM.FetchXml.Attribute">MobileCRM.FetchXml.Attribute</see> objects.</field>
					/// <field name="filter" type="MobileCRM.FetchXml.Filter">A query filter.</field>
					/// <field name="linkentities" type="Array">An array of <see cref="MobileCRM.FetchXml.LinkEntity">MobileCRM.FetchXml.LinkEntity</see> objects.</field>
					/// <field name="name" type="String">An entity logical name.</field>
					/// <field name="order" type="Array">An array of <see cref="MobileCRM.FetchXml.Order">MobileCRM.FetchXml.Order</see> objects.</field>
					this.name = name;
					this.attributes = [];
					this.order = [];
					this.filter = null;
					this.linkentities = [];
				},
				LinkEntity: function (name) {
					/// <summary>Represents a FetchXml query linked entity.</summary>
					/// <remarks>This object is derived from <see cref="MobileCRM.FetchXml.Entity">MobileCRM.FetchXml.Entity</see></remarks>
					/// <field name="alias" type="String">A link alias.</field>
					/// <field name="from" type="String">The "from" field (if parent then target entity primary key).</field>
					/// <field name="linkType" type="String">The link (join) type ("inner" or "outer").</field>
					/// <param name="name" type="String">An entity name</param>
					/// <field name="to" type="String">The "to" field.</field>
					MobileCRM.FetchXml.LinkEntity.superproto.constructor.apply(this, arguments);

					this.from = null;
					this.to = null;
					this.linktype = null;
					this.alias = null;
				},
				Attribute: function (name) {
					/// <summary>Represents a FetchXml select statement (CRM field).</summary>
					/// <param name="name" type="String">A lower-case entity attribute name (CRM logical field name).</param>
					/// <field name="aggregate" type="String">An aggregation function.</field>
					/// <field name="alias" type="String">Defines an attribute alias.</field>
					/// <field name="dategrouping" type="String">A date group by modifier (year, quarter, month, week, day).</field>
					/// <field name="groupby" type="Boolean">Indicates whether to group by this attribute.</field>
					/// <field name="name" type="String">A lower-case entity attribute name (CRM logical field name).</field>
					this.name = name;
					this.aggregate = null;
					this.groupby = false;
					this.alias = null;
					this.dategrouping = null;
				},
				Order: function (attribute, descending) {
					/// <summary>Represents a FetchXml order statement.</summary>
					/// <param name="attribute" type="String">An attribute name (CRM logical field name).</param>
					/// <param name="descending" type="Boolean">true, for descending order; false, for ascending order</param>
					/// <field name="alias" type="String">Defines an order alias.</field>
					/// <field name="attribute" type="String">An attribute name (CRM logical field name).</field>
					/// <field name="descending" type="Boolean">true, for descending order; false, for ascending order.</field>
					this.attribute = attribute;
					this.alias = null;
					this.descending = descending ? true : false;
				},
				Filter: function () {

					/// <summary>Represents a FetchXml filter statement. A logical combination of <see cref="MobileCRM.FetchXml.Condition">Conditions</see> and child-filters.</summary>
					/// <field name="conditions" type="Array">An array of <see cref="MobileCRM.FetchXml.Condition">Condition</see> objects.</field>
					/// <field name="filters" type="Array">An array of <see cref="MobileCRM.FetchXml.Filter">Filter</see> objects representing child-filters.</field>
					/// <field name="type" type="String">Defines the filter operator ("or" / "and").</field>
					this.type = null;
					this.conditions = [];
					this.filters = [];
				},
				Condition: function () {
					/// <summary>Represents a FetchXml attribute condition statement.</summary>
					/// <field name="attribute" type="String">The attribute name (CRM logical field name).</field>
					/// <field name="operator" type="String">The condition operator. "eq", "ne", "in", "not-in", "between", "not-between", "lt", "le", "gt", "ge", "like", "not-like", "null", "not-null", "eq-userid", "eq-userteams", "today", "yesterday", "tomorrow", "this-year", "last-week", "last-x-hours", "next-x-years", "olderthan-x-months", ...</field>
					/// <field name="uiname" type="String">The lookup target entity display name.</field>
					/// <field name="uitype" type="String">The lookup target entity logical name.</field>
					/// <field name="value" type="">The value to compare to.</field>
					/// <field name="values" type="Array">The list of values to compare to.</field>
					this.attribute = null;
					this.operator = null;
					this.uitype = null;
					this.uiname = null;
					this.value = null;
					this.values = [];
				}
			},

			Platform: function (props) {
				/// <summary>Represents object for querying platform specific information and executing platform integrated actions.</summary>
				/// <remarks>This object cannot be created directly. To obtain/modify this object, use <see cref="MobileCRM.Platform.requestObject">MobileCRM.Platform.requestObject</see> function.</remarks>
				/// <field name="capabilities" type="Number">Gets the mask of capability flags supported by this device (MakePhoneCalls=1; HasMapView=2).</field>
				/// <field name="deviceIdentifier" type="String">Gets the unique identifier of this device.</field>
				/// <field name="screenWidth" type="Number">Gets the current screen width in pixels.</field>
				/// <field name="screenHeight" type="Number">Gets the current screen width in pixels.</field>
				/// <field name="screenDensity" type="Number">Gets the screen density (DPI).</field>
				/// <field name="isTablet" type="Boolean">Indicates whether this device is tablet.</field>
				/// <field name="customImagePath" type="String">Gets or sets the custom image path that comes from customizations.</field>
				MobileCRM.Platform.superproto.constructor.apply(this, arguments);
			},

			Application: function () {
				/// <summary>Encapsulates the application-related functionality.</summary>
			},
			AboutInfo: function() {
				/// <summary>[v8.2] Represents the branding information.</summary>
				/// <field name="manufacturer" type="String">Gets the manufacturer text.</field>
				/// <field name="productTitle" type="String">Gets the product title text.</field>
				/// <field name="productTitleAndVersion" type="String">[v9.0] Gets the string with product title and version.</field>
				/// <field name="productSubTitle" type="String">Gets the product subtitle text.</field>
				/// <field name="poweredBy" type="String">Gets the powered by text.</field>
				/// <field name="icon" type="String">Gets the icon name.</field>
				/// <field name="website" type="String">Gets the website url.</field>
				/// <field name="supportEmail" type="String">Gets the support email.</field>
				this.manufacturer = "";
				this.productTitle = "";
				this.productTitleAndVersion = "";
				this.productSubTitle = "";
				this.poweredBy = "";
				this.icon = "";
				this.website = "";
				this.supportEmail = "";
			},
			MobileReport: function () {
				/// <summary>Provides a functionality of mobile reporting.</summary>
			},
			UI: {
				FormManager: {
				},
				EntityForm: function (props) {
					/// <summary>Represents the Javascript equivalent of native entity form object.</summary>
					/// <remarks>This object cannot be created directly. To obtain/modify this object, use <see cref="MobileCRM.UI.EntityForm.requestObject">MobileCRM.UI.EntityForm.requestObject</see> function.</remarks>
					/// <field name="associatedViews" type="Array">Gets the associated views as an array of <see cref="MobileCRM.UI._EntityList">MobileCRM.UI._EntityList</see> objects.</field>
					/// <field name="canEdit" type="Boolean">Gets whether the form can be edited.</field>
					/// <field name="canClose" type="Boolean">Determines if form can be closed, i.e. there are no unsaved data being edited.</field>
					/// <field name="context" type="Object">Gets the specific context object for onChange and onSave handlers. The onChange context contains single property &quot;changedItem&quot; with the name of the changed detail item and the onSave context contains property &quot;errorMessage&quot; which can be used to break the save process with certain error message.</field>
					/// <field name="controllers" type="Array">Gets the form controllers (map, web) as an array of <see cref="MobileCRM.UI._Controller">MobileCRM.UI._Controller</see> objects.</field>
					/// <field name="detailViews" type="Array">Gets the detailView controls  as an array of <see cref="MobileCRM.UI._DetailView">MobileCRM.UI._DetailView</see> objects.</field>
					/// <field name="entity" type="MobileCRM.DynamicEntity">Gets or sets the entity instance the form is showing.</field>
					/// <field name="form" type="MobileCRM.UI.Form">Gets the top level form.</field>
					/// <field name="iFrameOptions" type="Object">Carries the custom parameters that can be specified when opening the form using <see cref="MobileCRM.UI.FormManager">MobileCRM.UI.FormManager</see>.</field>
					/// <field name="isDirty" type="Boolean">Indicates whether the form  has unsaved data.</field>
					/// <field name="relationship" type="MobileCRM.Relationship">Defines relationship with parent entity.</field>
					/// <field name="visible" type="Boolean">Gets whether the underlying form is visible.</field>
					MobileCRM.UI.EntityForm.superproto.constructor.apply(this, arguments);
				},

				EntityList: function (props) {
					/// <summary>[v9.2] Represents the Javascript equivalent of native entity list object.</summary>
					/// <field name="allowAddExisting" type="Boolean">Gets or sets whether adding an existing entity is allowed.</field>
					/// <field name="allowCreateNew" type="Boolean">Gets or sets whether create a new entity (or managing the N:N entities in the case of N:N list) is allowed.</field>
					/// <field name="allowedDocActions" type="Number">Gets or sets a mask of document actions (for Note and Sharepoint document lists).</field>
					/// <field name="allowSearch" type="Boolean">Gets or sets whether to show the search bar.</field>
					/// <field name="autoWideWidth" type="String">>Gets the view auto width pixel size.</field>
					/// <field name="entityName" type="String">Gets the name of the entities in this list.</field>
					/// <field name="flipMode" type="Number">Gets or sets the flip configuration (which views to show and which one is the initial).</field>
					/// <field name="hasMapViews" type="Boolean">Gets whether the list has a view that can be displayed on map.</field>
					/// <field name="hasCalendarViews" type="Boolean">Gets or sets whether there is a view with &quot;CalendarFields&quot;.</field>
					/// <field name="hasMoreButton" type="Boolean">Gets whether the list needs a more button.</field>
					/// <field name="internalName" type="String">Gets the internal list name. Used for localization and image lookup.</field>
					/// <field name="isDirty" type="Boolean">Gets or sets whether the list is dirty.</field>
					/// <field name="isLoaded" type="Boolean">Gets or sets whether the list is loaded.</field>
					/// <field name="isMultiSelect" type="Boolean">Gets whether multi selection is active.</field>
					/// <field name="listButtons" type="Array">Gets the read-only array of strings defining the list buttons.</field>
					/// <field name="listMode" type="Number">Gets the current list mode.</field>
					/// <field name="listView" type="MobileCRM.UI._ListView">Gets the controlled listView control.</field>
					/// <field name="lookupSource" type="MobileCRM.Relationship">Gets the lookup source. If the list is used for lookup this is the entity whose property is being &quot;looked-up&quot;.</field>
					/// <field name="options" type="Number">Gets the kinds of views available on the list.</field>
					/// <field name="relationship" type="MobileCRM.Relationship">Gets the relation source and related entity. &quot;null&quot;, if there is no relationship (if it is not an associated list).</field>
					/// <field name="selectedEntity" type="MobileCRM.DynamicEntity">Gets currently selected entity. &quot;null&quot;, if there&apos;s no selection.</field>
					/// <field name="uniqueName" type="Number">Gets or sets the unique name of the list. Used to save/load list specific settings.</field>
					MobileCRM.UI.EntityList.superproto.constructor.apply(this, arguments);
				},

				HomeForm: function (props) {
					/// <summary>[v8.0] Represents the Javascript equivalent of the home form object which contains the Home/UI replacement iFrame.</summary>
					/// <remarks><p>This class works only from Home/UI replacement iFrame.</p><p>This object cannot be created directly. To obtain/modify this object, use <see cref="MobileCRM.UI.HomeForm.requestObject">MobileCRM.UI.HomeForm.requestObject</see> function.</p></remarks>
					/// <field name="form" type="MobileCRM.UI.Form">Gets the top level form.</field>
					/// <field name="items" type="Array">Gets the list of the home items.</field>
					/// <field name="listView" type="MobileCRM.UI._ListController">Gets the list view with home items.</field>
					/// <field name="lastSyncResult" type="MobileCRM.Services.SynchronizationResult">[v8.1] An object with last sync results. Contains following boolean properties: newCustomizationReady, customizationDownloaded, dataErrorsEncountered, appWasLocked, syncAborted, adminFullSync, wasBackgroundSync</field>
					/// <field name="syncResultText" type="String">[v8.1] The last synchronization error text.</field>
					/// <field name="syncProgress" type="Object">[v8.1] An object with current sync progress. Contains following properties: labels, percent. It is undefined if no sync is running.</field>
					MobileCRM.UI.HomeForm.superproto.constructor.apply(this, arguments);
				},

				ReportForm: function() {
					/// <summary>[v8.1] Represents the Dynamics CRM report form object.</summary>
					/// <field name="allowedReportIds" type="Array">The list of report entity ids that has to be included in the report form selector.</field>
					/// <field name="allowedLanguages" type="Array">The list of LCID codes of the languages that has to be included into the report form selector. The number -1 stands for "Any language".</field>
					/// <field name="defaultReport" type="String">The primary name of the report entity that should be pre-selected on the report form.</field>
					this.allowedReportIds = [];
					this.allowedLanguages = [];
					this.defaultReport = null;
				},

				IFrameForm: function () {
					/// <summary>[v9.0] Represents the iFrame form object.</summary>
					/// <field name="form" type="MobileCRM.UI.Form">Gets the form hosting the iFrame.</field>
					/// <field name="options" type="Object">Carries the custom parameters that can be specified when opening the form using <see cref="MobileCRM.UI.IFrameForm.show">MobileCRM.UI.IFrameForm.show</see> function.</field>
					/// <field name="preventCloseMessage" type="Boolean">[v9.3] Prevent close message. The form cannot be closed if set. No other home-item can be opened and synchronization is not allowed to be started.</field>
					MobileCRM.UI.IFrameForm.superproto.constructor.apply(this, arguments);
				},

				Form: function (props) {
					/// <summary>[v8.0] Represents the Javascript equivalent of the form object.</summary>
					/// <field name="canMaximize" type="Boolean">Gets or sets whether form can be maximized to fullscreen (full application frame).</field>
					/// <field name="isMaximized" type="Boolean">Gets or sets whether form is currently maximized to fullscreen (full application frame).</field>
					/// <field name="caption" type="String">Gets or sets the form caption.</field>
					/// <field name="selectedViewIndex" type="Number">Gets or sets the selected view (tab) index.</field>
					/// <field name="showTitle" type="Boolean">[v8.1] Determines whether the form caption bar should be visible.</field>
					/// <field name="viewCount" type="Number">Gets the count of views in the form.</field>
					/// <field name="visible" type="Boolean">Gets whether the form is visible.</field>
					MobileCRM.UI.Form.superproto.constructor.apply(this, arguments);
				},

				ViewController: function () {
					/// <summary>Represents the Javascript equivalent of view controller (map/web content).</summary>
				},

				ProcessController: function() {
					/// <summary>[v8.2] Represents the Javascript equivalent of view process controller.</summary>
					/// <remarks>It is not intended to create an instance of this class. To obtain this object, use <see cref="MobileCRM.UI.EntityForm.requestObject">EntityForm.requestObject</see> function and locate the controller in form&apos;s "controllers" list.</remarks>
					/// <field name="currentStateInfo" type="Object">Gets the information about the current process flow state (active stage, visible stage and process).</field>
					MobileCRM.UI.ProcessController.superproto.constructor.apply(this, arguments);
				},

				ViewDefinition: function() {
					/// <summary>Represents the entity view definition.</summary>
					/// <field name="entityName" type="String">Gets the entity this view is for.</field>
					/// <field name="name" type="String">Gets the name of the view.</field>
					/// <field name="fetch" type="String">Gets the fetchXml query.</field>
					/// <field name="kind" type="Number">Gets the kind of the view (public, associated, etc.).</field>
					/// <field name="version" type="Number">Gets the version.</field>
					/// <field name="buttons" type="String">Gets the view buttons.</field>
					/// <field name="selector" type="String">Gets the view template selector workflow.</field>
					/// <field name="templates" type="Array">Gets the list templates.</summary>
					/// <field name="entityLabel" type="String">Gets the entity label.</summary>
				},

				MessageBox: function (title, defaultText) {
					/// <summary>This object allows the user to show a popup window and choose one of the actions.</summary>
					/// <param name="title" type="string">The message box title.</param>
					/// <param name="defaultText" type="string">The cancel button title text.</param>
					/// <field name="items" type="Array">An array of button names.</field>
					/// <field name="title" type="string">The message box title.</field>
					/// <field name="defaultText" type="string">The cancel button title text.</field>
					/// <field name="multiLine" type="Boolean">Indicates whether the message is multi line.</field>
					var nArgs = arguments.length;
					var arr = [];
					for (var i = 2; i < nArgs; i++)
						arr.push(arguments[i]);

					this.title = title || null;
					this.defaultText = defaultText || null;
					this.multiLine = false;
					this.items = arr;
				},

				LookupForm: function () {
					/// <summary>This object allows user to select an entity from a configurable list of entity types.</summary>
					/// <field name="entities" type="Array">An array of allowed entity kinds (schema names).</field>
					/// <field name="allowedViews" type="String">OBSOLETE: Allowed views, or null if all are allowed.</field>
					/// <field name="source" type="MobileCRM.Relationship">The entity whose property will be set to the chosen value.</field>
					/// <field name="prevSelection" type="MobileCRM.Reference">The entity whose property will be set to the chosen value.</field>
					/// <field name="allowNull" type="Boolean">Whether to allow selecting no entity.</field>
					var nEntities = arguments.length;
					var arr = [];
					for (var i = 0; i < nEntities; i++)
						arr.push(arguments[i]);

					this._views = [];
					this.allowedViews = "";
					this.entities = arr;
					this.source = null;
					this.prevSelection = null;
					this.allowNull = false;
				},
				MultiLookupForm: function () {
					/// <summary>[v9.3] This object allows user to select a list of entities from a configurable list of entity types.</summary>
					/// <field name="entities" type="Array">An array of allowed entity kinds (schema names).</field>
					/// <field name="source" type="MobileCRM.Relationship">The entity whose property will be set to the chosen value.</field>
					/// <field name="dataSource" type="MobileCRM.Reference[]">The list of entities that should be displayed as selected.</field>
					/// <field name="prevSelection" type="MobileCRM.Reference">The entity whose property will be set to the chosen value.</field>
					/// <field name="allowNull" type="Boolean">Whether to allow selecting no entity.</field>
					MobileCRM.UI.MultiLookupForm.superproto.constructor.apply(this, arguments);
					this.dataSource = [];
				},

				_DetailView: function (props) {
					/// <summary>Represents the Javascript equivalent of detail view with set of items responsible for fields editing.</summary>
					/// <field name="isDirty" type="Boolean">Indicates whether the value of an item has been modified.</field>
					/// <field name="isEnabled" type="Boolean">Gets or sets whether the all items are enabled or disabled.</field>
					/// <field name="isVisible" type="Boolean">Gets or sets whether the view is visible.</field>
					/// <field name="items" type="Array">An array of <see cref="MobileCRM.UI._DetailItem">MobileCRM.UI._DetailItem</see> objects</field>
					/// <field name="name" type="String">Gets the name of the view</field>
					MobileCRM.UI._DetailView.superproto.constructor.apply(this, arguments);
				},
				DetailViewItems: {
					Item: function (name, label) {
						/// <summary>[8.0] Represents the <see cref="MobileCRM.UI._DetailView"></see> item.</summary>
						/// <param name="name" type="String">Defines the item name.</param>
						/// <param name="label" type="String">Defines the item label.</param>
						/// <field name="name" type="String">Gets or sets the item name.</field>
						/// <field name="label" type="String">Gets or sets the item label.</field>
						/// <field name="dataMember" type="String">Gets or sets the name of the property containing the item value in data source objects.</field>
						/// <field name="errorMessage" type="String">Gets or sets the item error message.</field>
						/// <field name="isEnabled" type="Boolean">Gets or sets whether the item is editable.</field>
						/// <field name="isVisible" type="Boolean">Gets or sets whether the item is visible.</field>
						/// <field name="value" type="Object">Gets or sets the bound item value.</field>
						/// <field name="isNullable" type="Boolean">Gets or sets whether the item value can be &quot;null&quot;.</field>
						/// <field name="validate" type="Boolean">Gets or sets whether the item needs validation.</field>
						/// <field name="style" type="String">The name of the Woodford item style.</field>
						this._type = null;
						this.name = name;
						this.label = label;
					},
					SeparatorItem: function (name, label) {
						/// <summary>[8.0] Represents the <see cref="MobileCRM.UI._DetailView"></see> separator item.</summary>
						/// <param name="name" type="String">Defines the item name.</param>
						/// <param name="label" type="String">Defines the item label.</param>
						MobileCRM.UI.DetailViewItems.SeparatorItem.superproto.constructor.apply(this, arguments);
						this._type = "Separator";
					},
					TextBoxItem: function (name, label) {
						/// <summary>[8.0] Represents the <see cref="MobileCRM.UI._DetailView"></see> text item.</summary>
						/// <param name="name" type="String">Defines the item name.</param>
						/// <param name="label" type="String">Defines the item label.</param>
						/// <field name="numberOfLines" type="Number">Gets or sets the number of lines to display. Default is one.</field>
						/// <field name="isPassword" type="Boolean">Gets or sets whether the text value should be masked. Used for password entry.</field>
						/// <field name="maxLength" type="Number">Gets to sets the maximum text length.</field>
						/// <field name="kind" type="Number">Gets or sets the value kind (Text=0, Email=1, Url=2, Phone=3, Barcode=4).</field>
						/// <field name="placeholderText" type="Number">Gets or sets the text that is displayed in the control until the value is changed by a user action or some other operation. Default is empty string.</field>
						MobileCRM.UI.DetailViewItems.TextBoxItem.superproto.constructor.apply(this, arguments);
						this._type = "TextBox";
					},
					NumericItem: function (name, label) {
						/// <summary>[8.0] Represents the <see cref="MobileCRM.UI._DetailView"></see> numeric item.</summary>
						/// <param name="name" type="String">Defines the item name.</param>
						/// <param name="label" type="String">Defines the item label.</param>
						/// <field name="minimum" type="Number">Gets or sets the minimum allowed value.</field>
						/// <field name="maximum" type="Number">Gets or sets the maximum allowed value.</field>
						/// <field name="increment" type="Number">Gets or sets the increment (if the upDownVisible is true).</field>
						/// <field name="upDownVisible" type="Boolean">Gets or sets whether the up/down control is visible.</field>
						/// <field name="decimalPlaces" type="Number">Gets or sets the number of decimal places.</field>
						/// <field name="displayFormat" type="String">Gets or sets the value format string.</field>
						MobileCRM.UI.DetailViewItems.NumericItem.superproto.constructor.apply(this, arguments);
						this._type = "Numeric";
						//this.minimum = 0;
						//this.maximum = 0;
						//this.increment = 1;
						//this.upDownVisible = false;
						//this.decimalPlaces = 2;
						//this.displayFormat = "";
					},
					CheckBoxItem: function (name, label) {
						/// <summary>[8.0] Represents the <see cref="MobileCRM.UI._DetailView"></see> checkbox item.</summary>
						/// <param name="name" type="String">Defines the item name.</param>
						/// <param name="label" type="String">Defines the item label.</param>
						/// <field name="textChecked" type="String">Gets or sets the text for checked state.</field>
						/// <field name="textUnchecked" type="String">Gets or sets the text for unchecked state.</field>
						MobileCRM.UI.DetailViewItems.CheckBoxItem.superproto.constructor.apply(this, arguments);
						this._type = "CheckBox";
						this.isNullable = false;
					},
					DateTimeItem: function (name, label) {
						/// <summary>[8.0] Represents the <see cref="MobileCRM.UI._DetailView"></see> date/time item.</summary>
						/// <param name="name" type="String">Defines the item name.</param>
						/// <param name="label" type="String">Defines the item label.</param>
						/// <field name="minimum" type="Date">Gets or sets the minimum allowed value.</field>
						/// <field name="maximum" type="Date">Gets or sets the maximum allowed value.</field>
						/// <field name="parts" type="Number"> Gets or sets whether to display and edit the date, time or both.</field>
						MobileCRM.UI.DetailViewItems.DateTimeItem.superproto.constructor.apply(this, arguments);
						this._type = "DateTime";
					},
					DurationItem: function (name, label) {
						/// <summary>[8.0] Represents the <see cref="MobileCRM.UI._DetailView"></see> duration item.</summary>
						/// <param name="name" type="String">Defines the item name.</param>
						/// <param name="label" type="String">Defines the item label.</param>
						MobileCRM.UI.DetailViewItems.DurationItem.superproto.constructor.apply(this, arguments);
						this._type = "Duration";
					},
					ComboBoxItem: function (name, label) {
						/// <summary>[8.0] Represents the <see cref="MobileCRM.UI._DetailView"></see> combobox item.</summary>
						/// <param name="name" type="String">Defines the item name.</param>
						/// <param name="label" type="String">Defines the item label.</param>
						/// <field name="listDataSource" type="Object">Gets or sets the object with props and values to be displayed in the combo list (e.g. {&quot;label1&quot;:1, &quot;label2&quot;:2}).</field>
						MobileCRM.UI.DetailViewItems.ComboBoxItem.superproto.constructor.apply(this, arguments);
						this._type = "ComboBox";
					},
					LinkItem: function (name, label) {
						/// <summary>[8.0] Represents the <see cref="MobileCRM.UI._DetailView"></see> link item.</summary>
						/// <param name="name" type="String">Defines the item name.</param>
						/// <param name="label" type="String">Defines the item label.</param>
						/// <field name="isMultiLine" type="Boolean">Gets or sets whether the item is multiline. Default is false.</field>
						MobileCRM.UI.DetailViewItems.LinkItem.superproto.constructor.apply(this, arguments);
						this._type = "Link";
					}
				},

				MediaTab: function (index, name) {
					/// <summary>Represents the MediaTab controller.</summary>
					/// <remarks>An instance of this class can only be obtained by calling the <see cref="MobileCRM.UI.EntityForm.getMediaTab">MobileCRM.UI.EntityForm.getMediaTab</see> method.</remarks>
					/// <param name="index" type="Number">The index of an associated media tab.</param>
					/// <param name="name" type="String">The name of an associated media tab.</param>

					this.index = index;
					this.name = name;
				}
			},
			Services: {
				FileInfo: function (filePath, url, mimeType) {
					/// <summary>Carries the result of a DocumentService operation.</summary>
					/// <remarks>In case of cancelled document service operation, all properties in this object will be set to &quot;null&quot;.</remarks>
					/// <field name="filePath" type="String">Gets the full path of the local file.</field>
					/// <field name="url" type="String">Gets the local URL of the file which can be used from within this HTML document.</field>
					/// <field name="mimeType" type="String">Gets the file MIME type.</field>
					this.filePath = filePath;
					this.url = url;
					this.mimeType = mimeType;
				},
				ChatService:function(){
					/// <summary>[v9.3] Represents a service for sending instant messages to users or shared channels.</summary>
					/// <remarks>Instance of this object cannot be created directly. Use <see cref="MobileCRM.Services.ChatService.getService">MobileCRM.Services.ChatService.getService</see> to create new instance.</remarks>
					/// <field name="chatUser" type="MobileCRM.DynamicEntity">An instance of the resco_chatuser entity for current user (either system or external).</field>
					/// <field name="userEntity" type="String">The user entity name (either systemuser or external user entity name).</field>
				    /// <field name="userId" type="String">Primary key (id) of the current user (either system or external).</field>
				    MobileCRM.Services.ChatService.superproto.constructor.apply(this, arguments);
				},
				DocumentService: function () {
					/// <summary>[v8.1] Represents a service for acquiring the documents.</summary>
					/// <field name="maxImageSize" type="Number">Gets or sets the maximum captured image size. If captured image size is greater, the image is resized to specified maximum size.</field>
					/// <field name="recordQuality" type="Number">Gets or sets the record quality for audio/video recordings.</field>
					/// <field name="allowChooseVideo" type="Boolean">Indicates whether the video files should be included into the image picker when selecting the photos. The default is true.</field>
				},
				AddressBookService: function () {
					/// <summary>[v9.1] Represents a service for accessing the address book.</summary>
				},

				SynchronizationResult: function (syncResult) {
					/// <summary>[v8.1] Represents the synchronization result.</summary>
					/// <field name="newCustomizationReady" type="Boolean">Indicates whether the new customization is ready.</field>
					/// <field name="customizationDownloaded" type="Boolean">Indicates whether the new customization was applied.</field>
					/// <field name="dataErrorsEncountered" type="Boolean">Indicates whether some data errors were encountered during sync (cannot upload, delete, change status, owner, etc.).</field>
					/// <field name="appWasLocked" type="Boolean">Application was locked.</field>
					/// <field name="syncAborted" type="Boolean">Sync was aborted.</field>
					/// <field name="adminFullSync" type="Boolean">Full sync was requested so background sync was aborted.</field>
					/// <field name="wasBackgroundSync" type="Boolean">Indicates whether the last sync was background sync or foreground sync.</field>
					if (typeof (syncResult) != "undefined") {
						var res = new Number(syncResult);
						this.newCustomizationReady = (res & 1) != 0;
						this.customizationDownloaded = (res & 2) != 0;
						this.dataErrorsEncountered = (res & 8) != 0;
						this.appWasLocked = (res & 16) != 0;
						this.syncAborted = (res & 32) != 0;
						this.adminFullSync = (res & 64) != 0;
						this.wasBackgroundSync = (res & 0x80000000) != 0;
					}
				},
				GeoAddress: function () {
					/// <summary>[v9.3] Represents a service for translating geo position into the civic address and back.</summary>
					/// <field name="streetNumber" type="String">Gets or sets the street number.</field>
					/// <field name="street" type="String">Gets or sets the street.</field>
					/// <field name="city" type="String">Gets or sets the city.</field>
					/// <field name="zip" type="String">Gets or sets the zip code.</field>
					/// <field name="stateOrProvice" type="String">Gets or sets the state or province.</field>
					/// <field name="country" type="String">Gets or sets the country.</field>
					/// <field name="isValid" type="String">Indicates whether the address is valid.</field>
				}
			}
		};

		/************************/
		// Prototypes & Statics //
		/************************/

		// MobileCRM.UI._MediaTab
		MobileCRM.UI.MediaTab.prototype._onCommand = function (commandIndex, errorCallback) {
			/// <summary>Executes the MediaTab command by index.</summary>
			/// <param name="commandIndex" type="Number">Specifies the command index.</param>
			var mediaTab = MobileCRM.bridge.exposeObjectAsync("EntityForm.Controllers.get_Item", [this.index]);
			mediaTab.invokeMethodAsync("View.ExecuteAction", [commandIndex], function () { }, errorCallback);
			mediaTab.release();
		};
		MobileCRM.AboutInfo.requestObject = function (callback,errorCallback,scope) {
			/// <summary>[v8.2] Asynchronously gets the AboutInfo object with branding information.</summary>
			/// <param name="callback" type="function(Object)">The callback function that is called asynchronously with the about info object.</param>
			/// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
			MobileCRM.bridge.invokeStaticMethodAsync("MobileCrm", "MobileCrm.Controllers.AboutForm", "LoadAboutInfo", [], function (res) {
				var aboutInfo = new MobileCRM.AboutInfo();
				for (var property in res) {
					if (aboutInfo.hasOwnProperty(property))
						aboutInfo[property] = res[property];
				}
				callback.call(scope, aboutInfo);
			},errorCallback, scope);
		}
		MobileCRM.UI.MediaTab.prototype.capturePhoto = function (errorCallback) {
			/// <summary>Captures photo on this media tab.</summary>
			this._onCommand(2, errorCallback);
		};
		MobileCRM.UI.MediaTab.prototype.selectPhoto = function (errorCallback) {
			/// <summary>Executes the select photo comand on this media tab.</summary>
			this._onCommand(4, errorCallback);
		};
		MobileCRM.UI.MediaTab.prototype.selectFile = function (errorCallback) {
			/// <summary>Executes the select file command on this media tab.</summary>
			this._onCommand(8, errorCallback);
		};
		MobileCRM.UI.MediaTab.prototype.recordAudio = function (errorCallback) {
			/// <summary>Executes the record audio command on this media tab.</summary>
			this._onCommand(16, errorCallback);
		};
		MobileCRM.UI.MediaTab.prototype.recordVideo = function (errorCallback) {
			/// <summary>Executes the record video command on this media tab.</summary>
			this._onCommand(32, errorCallback);
		};
		MobileCRM.UI.MediaTab.prototype.clear = function (errorCallback) {
			/// <summary>Clears the content of this media tab.</summary>
			this._onCommand(0x1000, errorCallback);
		};
		MobileCRM.UI.MediaTab.prototype.getDocumentInfo = function (callback, errorCallback, scope) {
			/// <summary>[v8.0.1] Asynchronously gets the media tab view object.</summary>
			/// <param name="callback" type="function(Object)">The callback function that is called asynchronously with the document info object.</param>
			/// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
			/// <param name="scope" type="Object">The scope for callbacks.</param>
			var mediaTab = MobileCRM.bridge.exposeObjectAsync("EntityForm.Controllers.get_Item", [this.index]);
			mediaTab.invokeMethodAsync("get_View", [], callback, errorCallback, scope);
			mediaTab.release();
		};
		MobileCRM.UI.MediaTab.prototype.getData = function (callback, errorCallback, scope) {
			/// <summary>[v8.0] Gets the media tab document in form of base64 string.</summary>
			/// <param name="callback" type="function(String)">The callback function that is called asynchronously with the base64-encoded document data.</param>
			/// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
			/// <param name="scope" type="Object">The scope for callbacks.</param>
			MobileCRM.bridge.command("getViewData", this.name, callback, errorCallback, scope);
		};
		MobileCRM.UI.MediaTab.getData = function (viewName, callback, errorCallback, scope) {
			/// <summary>[v8.0] Gets the media tab document in form of base64 string.</summary>
			/// <param name="viewName" type="String">The name of the media tab.</param>
			/// <param name="callback" type="function(String)">The callback function that is called asynchronously with the base64-encoded document data.</param>
			/// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
			/// <param name="scope" type="Object">The scope for callbacks.</param>
			MobileCRM.bridge.command("getViewData", viewName, callback, errorCallback, scope);
		};
		MobileCRM.UI.MediaTab.prototype.isEmpty = function (callback, errorCallback, scope) {
			/// <summary>[v9.0.2] Asynchronously gets the boolean value indicating whether the media tab content is empty or not.</summary>
			/// <param name="callback" type="function(Boolean)">The callback function that is called asynchronously with the boolean value indicating whether the content is empty or not.</param>
			/// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
			/// <param name="scope" type="Object">The scope for callbacks.</param>
			var mediaTab = MobileCRM.bridge.exposeObjectAsync("EntityForm.Controllers.get_Item", [this.index]);
			mediaTab.invokeMethodAsync("get_IsEmpty", [], callback, errorCallback, scope);
			mediaTab.release();
		};

		// MobileCRM.Bridge
		MobileCRM.Bridge.prototype._createCmdObject = function (success, failed, scope) {
			var self = MobileCRM.bridge;
			var cmdId = 'Cmd' + self.callbackId++;
			self.callbacks[cmdId] = { SuccessFn: success, FailedFn: failed, Scope: scope };
			return cmdId;
		};

		MobileCRM.Bridge.prototype.requestObject = function (objectName, callback, errorCallback, scope) {
			/// <summary>Requests the managed application object.</summary>
			/// <remarks>Method initiates an asynchronous request which either ends with calling the <b>errorCallback</b> or with calling the <b>callback</b> with JSON representation of requested object. Requested object must be exposed by application. The list of exposed objects can be found in JSBridge Guide.</remarks>
			/// <param name="objectName" type="String">The name of exposed managed object as it was registered on application side.</param>
			/// <param name="callback" type="function(obj)">The callback function that is called asynchronously with JSON-serialized <see cref="MobileCRM.ObservableObject">MobileCRM.ObservableObject</see> <b>obj</b> as argument. Callback must return the object clone with changed properties (see <see cref="MobileCRM.ObservableObject.getChanged">getChanged</see> method). Returned object is passed back to application and its properties are applied back on requested object.</param>
			/// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called asynchronously in case of error.</param>
			/// <param name="scope" type="Object">The scope for callbacks.</param>
			MobileCRM.bridge.command("requestObj", objectName, callback, errorCallback, scope);
		}
		MobileCRM.Bridge.prototype.initialize = function () {
			/// <summary>Initializes the bridge to be used for synchronous invokes.</summary>
		}
		/* Following methods are no longer supported (they are no longer implemented on iOS)
		MobileCRM.Bridge.prototype.invokeMethod = function (objectName, method) {
			/// <summary>Synchronously invokes a method on exposed managed object and returns the result.</summary>
			/// <remarks><p>WARNING: This function is in experimental stage and can cause a deadlock if invoked C# method calls back to Javascript. Its usage must be tested on all platforms.</p><p>Before calling this method for the first time, it is necessary to initialize the bridge by calling <see cref="MobileCRM.Bridge.initialize">initialize</see> method.</p></remarks>
			/// <param name="objectName" type="String">The name of exposed managed object as it was registered on application side.</param>
			/// <param name="method" type="String">The name of the method implemented by object class.</param>
			var params = [];
			var i = 2;
			while (arguments[i])
				params.push(arguments[i++]);
			return MobileCRM.bridge.invoke("invokeMethod", objectName + "." + method + JSON.stringify(params));
		}
		MobileCRM.Bridge.prototype.invokeStaticMethod = function (assembly, typeName, method) {
			/// <summary>Synchronously invokes a static method on specified type and returns the result.</summary>
			/// <remarks><p>WARNING: This function is in experimental stage and can cause a deadlock if invoked C# method calls back to Javascript. Its usage must be tested on all platforms.</p><p>Before calling this method for the first time, it is necessary to initialize the bridge by calling <see cref="MobileCRM.Bridge.initialize">initialize</see> method.</p></remarks>
			/// <param name="assembly" type="String">The name of the assembly which defines the type.</param>
			/// <param name="typeName" type="String">The full name of the C# type which implements the method.</param>
			/// <param name="method" type="String">The name of static method to be invoked.</param>
			var params = [];
			var i = 3;
			while (arguments[i])
				params.push(arguments[i++]);
			return MobileCRM.bridge.invoke("invokeMethod", (assembly ? (assembly + ":") : "") + typeName + "." + method + JSON.stringify(params));
		}
		MobileCRM.Bridge.prototype.getPropertyValue = function (objectName, property) {
			/// <summary>Synchronously invokes a property getter on exposed managed object and returns the result.</summary>
			/// <param name="objectName" type="String">The name of exposed managed object as it was registered on application side.</param>
			/// <param name="property" type="String">The name of the property.</param>
			return MobileCRM.bridge.invokeMethod(objectName, "get_" + property);
		}
		MobileCRM.Bridge.prototype.setPropertyValue = function (objectName, property, value) {
			/// <summary>Synchronously invokes a property setter on exposed managed object.</summary>
			/// <param name="objectName" type="String">The name of exposed managed object as it was registered on application side.</param>
			/// <param name="property" type="String">The name of the property.</param>
			/// <param name="value" type="">A value being set into property.</param>
			return MobileCRM.bridge.invokeMethod(objectName, "set_" + property, value);
		}*/
		MobileCRM.Bridge.prototype.invokeMethodAsync = function (objectName, method, paramsList, callback, errorCallback, scope) {
			/// <summary>Invokes a method on exposed managed object and returns the result asynchronously via callback.</summary>
			/// <param name="objectName" type="String">The name of exposed managed object as it was registered on C# side (IJavascriptBridge.ExposeObject).</param>
			/// <param name="method" type="String">The name of the method implemented by object class.</param>
			/// <param name="paramsList" type="Array">An array with parameters that should be passed to a method.</param>
			/// <param name="callback" type="function(obj)">The callback function that is called asynchronously with JSON-serialized return value. It is either generic type or <see cref="MobileCRM.ObservableObject">MobileCRM.ObservableObject</see> with JSON-serialized return value.</param>
			/// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called asynchronously in case of error.</param>
			/// <param name="scope" type="Object">The scope for callbacks.</param>
			return MobileCRM.bridge.command("invokeMethod", objectName + "." + method + JSON.stringify(paramsList), callback, errorCallback, scope);
		}
		MobileCRM.Bridge.prototype.invokeStaticMethodAsync = function (assembly, typeName, method, paramsList, callback, errorCallback, scope) {
			/// <summary>Invokes a static method on specified type and returns the result asynchronously via callback.</summary>
			/// <param name="assembly" type="String">The name of the assembly which defines the type.</param>
			/// <param name="typeName" type="String">The full name of the C# type which implements the method.</param>
			/// <param name="method" type="String">The name of static method to be invoked.</param>
			/// <param name="paramsList" type="Array">An array with parameters that should be passed to a method.</param>
			/// <param name="callback" type="function(obj)">The callback function that is called asynchronously with JSON-serialized return value. It is either generic type or <see cref="MobileCRM.ObservableObject">MobileCRM.ObservableObject</see> with JSON-serialized return value.</param>
			/// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called asynchronously in case of error.</param>
			/// <param name="scope" type="Object">The scope for callbacks.</param>
			return MobileCRM.bridge.command("invokeMethod", (assembly ? (assembly + ":") : "") + typeName + "." + method + JSON.stringify(paramsList),  callback, errorCallback, scope);
		}

		var _tmpObjId = 0;
		MobileCRM.Bridge.prototype.exposeObjectAsync = function (method, paramsList) {
			/// <summary>Exposes the managed object which is the result of the method call.</summary>
			/// <param name="method" type="String">The name of the method implemented by object class.</param>
			/// <param name="paramsList" type="Array">An array with parameters that should be passed to a method.</param>
			/// <returns type="MobileCRM.ExposedObject">The Javascript placeholder object for exposed managed object.</returns>
			var objId = ++_tmpObjId;
			MobileCRM.bridge.command("exposeMethodResult", objId + "#" + method + JSON.stringify(paramsList));
			return new MobileCRM.ExposedObject(objId);
		}

		MobileCRM.Bridge.prototype.raiseGlobalEvent = function (eventName, args) {
			/// <summary>[v9.0] Raises the global event which can have listeners bound by other iFrames.</summary>
			/// <param name="eventName" type="String">Global event name.</param>
			/// <param name="args" type="Object">Any object that has to be passed to all event listeners. This object is stringified JSON and passed to another iFrame listening on the global event.</param>
			this.invokeStaticMethodAsync("MobileCrm.UI", "MobileCrm.UI.Controllers.WebController", "RaiseGlobalEvent", [eventName, JSON.stringify(args)]);
		}

		var _globalHandlers = { };

		MobileCRM.Bridge.prototype.onGlobalEvent = function (eventName, handler, bind, scope) {
			/// <summary>[v9.0] Binds or unbinds the handler for global event.</summary>
			/// <remarks><p>This methods binds or unbinds a handler which is called when this or other iFrame raises the specified event by calling the <see cref="MobileCRM.Bridge.raiseGlobalEvent">MobileCRM.bridge.raiseGlobalEvent</see> method.</p><p>It can also bind a handler for pre-defined events EntityFormClosed, IFrameFormClosed, SyncStarted and SyncFinished.</p></remarks>
			/// <param name="eventName" type="String">Global event name.</param>
			/// <param name="handler" type="function(args)">The handler function that has to be bound or unbound.</param>
			/// <param name="bind" type="Boolean">Determines whether to bind or unbind the handler.</param>
			/// <param name="scope" type="Object">The scope for handler calls.</param>
			var handlers = _globalHandlers[eventName];
			if (handlers === undefined) {
				_globalHandlers[eventName] = handlers = [];
			}
			var register = handlers.length == 0;
			_bindHandler(handler, handlers, bind, scope);
			if (bind) {
				if (register)
					MobileCRM.bridge.command("registerGlobalEvent", "+" + eventName);
			}
			else if (handlers.length == 0)
				MobileCRM.bridge.command("registerGlobalEvent", "-" + eventName);
		};

		MobileCRM.Bridge.prototype._callGlobalHandlers = function (event, data) {
			var handlers = _globalHandlers[event];
			if (handlers && handlers.length > 0) {
				return _callHandlers(handlers, data);
			}
			return null;
		}

		MobileCRM.Bridge.prototype.runCallback = function (id, response) {
			/// <summary>Internal method which is called from Mobile CRM application to run a command callback.</summary>
			/// <param name="id" type="String">A command ID</param>
			/// <param name="response" type="String">A string containing the JSON response</param>
			try {
				var callback = MobileCRM.bridge.callbacks[id];
				if (callback) {
					var result = null;
					if (callback.SuccessFn) {
						result = callback.SuccessFn.call(callback.Scope, response);
						// Forget SuccessFn not to be called anymore
						delete callback.SuccessFn;
					}
					return JSON.stringify(result);
				}
				return "Err: callback not found";
			} catch (exception) {
				return 'Err:' + exception.message;
			}
		};
		MobileCRM.Bridge.prototype.setResponse = function (id, response, deleteCallback) {
			/// <summary>Internal method which is called from Mobile CRM application in case of successfully processed command.</summary>
			/// <param name="id" type="String">A command ID</param>
			/// <param name="response" type="String">A string containing the JSON response</param>
			try {
				var self = MobileCRM.bridge;
				var callback = self.callbacks[id];
				if (callback) {
					if (callback.SuccessFn) {
						callback.SuccessFn.call(callback.Scope, response);
					}
					if (deleteCallback != false)
						delete self.callbacks[id];
				}
			} catch (exception) {
				return exception.message;
			}
			return "OK";
		};
		MobileCRM.Bridge.prototype.setError = function (id, error) {
			/// <summary>Internal method which is called from Mobile CRM application in case of command processing failure.</summary>
			/// <param name="id" type="String">A command ID</param>
			/// <param name="response" type="String">A string containing the error message</param>
			var self = MobileCRM.bridge;
			var callback = self.callbacks[id];
			if (callback) {
				if (callback.FailedFn) {
					callback.FailedFn.call(callback.Scope, error);
				}
				delete self.callbacks[id];
			}
		};
		MobileCRM.Bridge.prototype.closeForm = function () {
			/// <summary>Closes a form containing this HTML document.</summary>
			MobileCRM.bridge.command("closeForm");
		};
		MobileCRM.Bridge.prototype.enableDebug = function (callback, errorCallback, scope) {
			/// <summary>Enables platform-specific features for debugging the web page.</summary>
			/// <param name="callback" type="function(obj)">The callback function that is called asynchronously.</param>
			/// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called asynchronously in case of error.</param>
			/// <param name="scope" type="Object">The scope for callbacks.</param>
			/// <remarks><p>After calling this method, it is possible to attach the Google Chrome debugger into the web page opened in MobileCRM application running on Android (KitKat or newer).</p><p>This method also activates the Javascript warnings in Windows 7 app.</p><p>It has dummy implementation on iOS and Android debug build.</p></remarks>
			MobileCRM.bridge.command("enableDebug", "", callback, errorCallback, scope);
		};
		MobileCRM.Bridge.prototype.enableZoom = function (enable) {
			/// <summary>Enables platform-specific pinch zoom gesture.</summary>
			/// <param name="enable" type="Boolean">Indicates whether to enable or disable zooming support.</param>
			/// <remarks><p>After calling this method, it is possible to use the pinch gesture to control the content zoom. This functionality is implemented only on Android. Other platforms either do not support zoom or it is controlled by the HTML viewport meta tag.</p></remarks>
			MobileCRM.bridge.command("enableZoom", enable);
		};
		MobileCRM.Bridge.prototype.getWindowSize = function (callback, errorCallback, scope) {
			/// <summary>[v8.0] Returns the size of the window in logical pixels without any scaling and viewport calculations..</summary>
			/// <param name="callback" type="function(obj)">The callback function that is called asynchronously. Gets an object with the window &quot;width&quot; and &quot;height&quot;.</param>
			/// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called asynchronously in case of error.</param>
			/// <param name="scope" type="Object">The scope for callbacks.</param>
			MobileCRM.bridge.command("getWindowSize", "", callback, errorCallback, scope);
		};
		MobileCRM.Bridge.prototype.alert = function (text, callback, scope) {
			/// <summary>Shows a message asynchronously and calls the callback after it is closed by user.</summary>
			/// <param name="callback" type="function(obj)">The callback function that is called asynchronously.</param>
			/// <param name="scope" type="Object">The scope for callbacks.</param>
			window.setTimeout(function () {
				window.alert(text); // when called directly, alert hangs up on iOS9 (if called from callback invoked from native code)
				if (callback)
					callback.call(scope);
			});
		};
		MobileCRM.Bridge.prototype.log = function (text) {
			/// <summary>[v8.0] Appends a message into the JSBridge log.</summary>
			/// <param name="text" type="String">A text to be written into the log.</param>
			MobileCRM.bridge.command("log", text);
		};

		// MobileCRM.ExposedObject
		MobileCRM.ExposedObject = function (id) {
			/// <summary>Represents the Javascript placeholder for exposed managed object.</summary>
			/// <param name="id" type="Number">An id of the exposed managed object.</param>
			/// <field name="id" type="Number">An id of the exposed managed object.</field>
			this.id = id;
		};
		MobileCRM.ExposedObject.prototype.asInvokeArgument = function () {
			/// <summary>[v9.1] Returns the exposed object reference which can be used as an argument in invokeMethod functions.</summary>
			return "~ExpObj:#exposedObj#" + this.id;
		};
		MobileCRM.ExposedObject.prototype.invokeMethodAsync = function (method, paramsList, callback, errorCallback, scope) {
			/// <summary>Invokes a method on exposed managed object and returns the result asynchronously via callback.</summary>
			/// <param name="objectName" type="String">The name of exposed managed object as it was registered on C# side (IJavascriptBridge.ExposeObject).</param>
			/// <param name="method" type="String">The name of the method implemented by object class.</param>
			/// <param name="paramsList" type="Array">An array with parameters that should be passed to a method.</param>
			/// <param name="callback" type="function(obj)">The callback function that is called asynchronously with JSON-serialized return value. It is either generic type or <see cref="MobileCRM.ObservableObject">MobileCRM.ObservableObject</see> with JSON-serialized return value.</param>
			/// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called asynchronously in case of error.</param>
			/// <param name="scope" type="Object">The scope for callbacks.</param>
			MobileCRM.bridge.invokeMethodAsync("#exposedObj#" + this.id, method, paramsList, callback, errorCallback, scope);
		};
		MobileCRM.ExposedObject.prototype.exposeObjectAsync = function (method, paramsList) {
			/// <summary>Exposes the managed object which is the result of the method called on this exposed object.</summary>
			/// <param name="method" type="String">The name of the method implemented by object class.</param>
			/// <param name="paramsList" type="Array">An array with parameters that should be passed to a method.</param>
			/// <returns type="MobileCRM.ExposedObject">The Javascript placeholder object for exposed managed object.</returns>
			return MobileCRM.bridge.exposeObjectAsync("#exposedObj#" + this.id + "." + method, paramsList);
		};
		MobileCRM.ExposedObject.prototype.release = function () {
			/// <summary>Releases the exposed managed object.</summary>
			MobileCRM.bridge.command("releaseExposedObject", this.id);
		};

		// MobileCRM.ObservableObject 
		MobileCRM.ObservableObject = function (props) {
			/// <summary>Represents a generic object which is monitoring the changes of its properties.</summary>
			/// <param name="props" type="Object">Optional list of properties.</param>
			var privChanged = {};
			var typeInfo = {};

			var propertyChanged = new _Event(this);
			propertyChanged.add(function (args) {
				privChanged[args] = true;
			}, this);
			Object.defineProperty(this, "propertyChanged", { value: propertyChanged, enumerable: false });
			Object.defineProperty(this, "_privChanged", { value: privChanged, enumerable: false });
			Object.defineProperty(this, "_typeInfo", { value: typeInfo, enumerable: false });
			if (props) {
				for (var i in props) {
					this.addProp(i, true, props[i]);
				}
			}
		};
		MobileCRM.ObservableObject.prototype.addProp = function (name, writable, value) {
			/// <summary>Creates a new observable property for this object</summary>
			/// <param name="name" type="String">A name of the new property.</param>
			/// <param name="writable" type="Boolean">Indicates whether the property should have setter.</param>
			/// <param name="value" type="">An initial value.</param>
			_addProperty(this, name, writable, value);
		};
		MobileCRM.ObservableObject.prototype.getChanged = function () {
			/// <summary>Creates a clone of this object containing all properties that were changed since object construction.</summary>
			/// <remarks>This method enumerates object recursively and creates the object clone containing only the changed properties.</remarks>
			/// <returns type="Object">An object clone containing all changed properties.</returns>
			var parse = function (obj, changedProps) {
				var result = undefined;
				for (var i in obj) {
					var val = obj[i];
					var changedVal = undefined;
					if (val instanceof MobileCRM.ObservableObject)
						changedVal = val.getChanged();
					else if (changedProps[i] == true)
						changedVal = val;
					else if (val && typeof val == "object" && !(val instanceof Date) && i[0] != '_')
						changedVal = parse(val, {});
					if (changedVal !== undefined) {
						if (result == null) {
							if (obj.constructor == Array) {
								result = [];
								for (var j = 0; j < obj.length; j++)
									result[j] = null;
							}
							else
								result = {};
						}
						var propName = i;
						if (obj._typeInfo) {
							var typeInfo = obj._typeInfo[i];
							if (typeInfo)
								propName += "-" + typeInfo;
						}
						result[propName] = changedVal;
					}
				}
				return result;
			};
			return parse(this, this._privChanged);
		}
		MobileCRM.ObservableObject.prototype.setTypedValue = function (propName, type, value) {
			/// <summary>[v8.0] Sets the explicitly typed value for specified property.</summary>
			/// <param name="propName" type="String">The name of the property which is being set.</param>
			/// <param name="type" type="String">The fully qualified .Net type (e.g. &quot;System.String&quot; or &quot;MobileCrm.Data.IReference,MobileCrm.Data&quot;).</param>
			/// <param name="value" type="">The value which has to be set.</param>
			this[propName] = value;
			this._typeInfo[propName] = type.replace(',', '-'); // Comma is not allowed by JsonReader, replace to '-'
		};

		//MobileCRM.Configuration
		MobileCRM.Configuration.requestObject = function (callback, errorCallback, scope) {
			/// <summary>Requests the managed Configuration object.</summary>
			/// <remarks>Method initiates an asynchronous request which either ends with calling the <b>errorCallback</b> or with calling the <b>callback</b> with Javascript version of Configuration object. See <see cref="MobileCRM.Bridge.requestObject">MobileCRM.Bridge.requestObject</see> for further details.</remarks>
			/// <param name="callback" type="function(config)">The callback function that is called asynchronously with <see cref="MobileCRM.Configuration">MobileCRM.Configuration</see> object instance as argument. Callback should return true to apply changed properties.</param>
			/// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
			/// <param name="scope" type="Object">The scope for callbacks.</param>
			MobileCRM.bridge.requestObject("Configuration", function (obj) {
				if (callback.call(scope, obj) != false) {
					var changed = obj.getChanged();
					return changed;
				}
				return '';
			}, errorCallback, scope);
		};

		//MobileCRM.Localization
		MobileCRM.Localization.initialize = function (callback, errorCallback, scope) {
			/// <summary>Initializes the Localization object.</summary>
			/// <remarks><p>Method loads the string table asynchronously and calls either the <b>errorCallback</b> with error message or the <b>callback</b> with initialized Localization object.</p><p>All other functions will return the default or empty string before the initialization finishes.</p></remarks>
			/// <param name="callback" type="function(config)">The callback function that is called asynchronously with initialized Localization object as argument.</param>
			/// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is to be called in case of error.</param>
			/// <param name="scope" type="Object">The scope for callbacks.</param>
			MobileCRM.bridge.command("localizationInit", null, function (res) {
				MobileCRM.Localization.stringTable = res;
				MobileCRM.Localization.initialized = true;
				if (callback)
					callback.call(scope, MobileCRM.Localization);
			}, errorCallback, scope);
		};
		MobileCRM.Localization.getLoadedLangId = function (callback, errorCallback, scope) {
			/// <summary>Asynchronously gets currently loaded localization language.</summary>
			/// <remarks>The default language is &quot;en-US&quot;.</remarks>
			/// <param name="callback" type="function(langId)">The callback function that is called asynchronously with currently loaded localization language as argument.</param>
			/// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is to be called in case of error.</param>
			/// <param name="scope" type="Object">The scope for callbacks.</param>
			MobileCRM.bridge.invokeStaticMethodAsync("MobileCrm.Data", "MobileCrm.Localization", "get_LoadedLangId", [], callback, errorCallback, scope);
		};
		MobileCRM.Localization.getTextOrDefault = function (id, defaultString) {
			/// <summary>Gets the display string for the passed id, or the passed default string if a string with the passed id doesn't exists.</summary>
			/// <param name="id" type="String">Display string id.</param>
			/// <param name="defaultString" type="String">Default display string.</param>
			/// <returns type="String">Human readable string label.</returns>
			return MobileCRM.Localization.stringTable[id] || defaultString;
		};
		MobileCRM.Localization.getComponentLabel = function (entityName, componentType, viewName) {
			/// <summary>Gets the display string for the passed entity and component (view, form) id.</summary>
			/// <param name="entityName" type="String">The entity logical name.</param>
			/// <param name="componentType" type="String">The component type. (View, DetailView).</param>
			/// <param name="viewName" type="String">The component id</param>
			/// <returns type="String">The component label.</returns>
			return MobileCRM.Localization.stringTable[entityName + "." + componentType + "." + viewName] || MobileCRM.Localization.stringTable[componentType + "." + viewName] || viewName;
		}
		MobileCRM.Localization.get = function (id) {
			/// <summary>Gets the display string for the passed id.</summary>
			/// <param name="id" type="String">Display string id.</param>
			/// <returns type="String">Human readable string label.</returns>
			return MobileCRM.Localization.getTextOrDefault(id, id);
		}
		MobileCRM.Localization.getPlural = function (id) {
			/// <summary>Gets the plural version of the display string for the passed id.</summary>
			/// <param name="id" type="String">Display string id.</param>
			/// <returns type="String">Human readable plural string label.</returns>
			return MobileCRM.Localization.get(id + "+s");
		}
		MobileCRM.Localization.makeId = function (section, id) {
			/// <summary>Creates an absolute id from section and id.</summary>
			/// <param name="section" type="String">The section id.</param>
			/// <param name="id" type="String">Display string id.</param>
			/// <returns type="String">Absolute id.</returns>
			return section + "." + id;
		}

		//MobileCRM.Reference
		MobileCRM.Reference.prototype.toString = function () {
			/// <summary>Prints the reference primary name into string.</summary>
			/// <returns type="String">A string with primary name of this entity reference.</returns>
			return this.primaryName;
		}
		MobileCRM.Reference.loadById = function (entityName, id, success, failed, scope) {
			/// <summary>Asynchronously loads the CRM reference.</summary>
			/// <param name="entityName" type="String">An entity name</param>
			/// <param name="id" type="String">The reference ID.</param>
			/// <param name="success" type="function(result)">A callback function for successful asynchronous result. The <b>result</b> will carry an instance of <see cref="MobileCRM.Reference">MobileCRM.Reference</see> object.</param>
			/// <param name="failed" type="function(error)">A callback function for command failure. The <b>error</b> argument will carry the error message.</param>
			/// <param name="scope" type="">A scope for calling the callbacks; set &quot;null&quot; to call the callbacks in global scope.</param>
			window.MobileCRM.bridge.command('referenceload', JSON.stringify({ entity: entityName, id: id }), success, failed, scope);
		};

		// MobileCRM.ManyToManyReference
		MobileCRM.ManyToManyReference.addRecord = function (entityName, ref1, ref2, create, success, failed, scope) {
			/// <summary>Adds or removes an N-N relationship record between the two passed entities.</summary>
			/// <param name="entityName" type="String">The relationship entity name.</param>
			/// <param name="ref1" type="MobileCRM.Reference">First entity instance.</param>
			/// <param name="ref2" type="MobileCRM.Reference">Second entity instance.</param>
			/// <param name="create" type="Boolean">Whether to create or delete the relationship record.</param>
			/// <param name="success" type="function(result)">A callback function for successful asynchronous result.</param>
			/// <param name="failed" type="function(error)">A callback function for command failure. The <b>error</b> argument will carry the error message.</param>
			/// <param name="scope" type="">A scope for calling the callbacks; set &quot;null&quot; to call the callbacks in global scope.</param>
			MobileCRM.bridge.command('addManyToManyReference', JSON.stringify({ entityName: entityName, ref1: ref1, ref2: ref2, create: create }), success, failed, scope);
		};
		MobileCRM.ManyToManyReference.create = function (entityName, ref1, ref2, success, failed, scope) {
			/// <summary>Creates a new N-N relationship between the two passed entities.</summary>
			/// <remarks>New relationship is created either in local database or using the online request. It depends on current application mode.</remarks>
			/// <param name="entityName" type="String">The relationship entity name.</param>
			/// <param name="ref1" type="MobileCRM.Reference">First entity instance.</param>
			/// <param name="ref2" type="MobileCRM.Reference">Second entity instance.</param>
			/// <param name="success" type="function(result)">A callback function for successful asynchronous result.</param>
			/// <param name="failed" type="function(error)">A callback function for command failure. The <b>error</b> argument will carry the error message.</param>
			/// <param name="scope" type="">A scope for calling the callbacks; set &quot;null&quot; to call the callbacks in global scope.</param>
			MobileCRM.ManyToManyReference.addRecord(entityName, ref1, ref2, true, success, failed, scope);
		};
		MobileCRM.ManyToManyReference.remove = function (entityName, ref1, ref2, success, failed, scope) {
			/// <summary>Removes an existing N-N relationship between the two passed entities.</summary>
			/// <remarks>Relationship is removed either from local database or using the online request. It depends on current application mode.</remarks>
			/// <param name="entityName" type="String">The relationship entity name.</param>
			/// <param name="ref1" type="MobileCRM.Reference">First entity instance.</param>
			/// <param name="ref2" type="MobileCRM.Reference">Second entity instance.</param>
			/// <param name="success" type="function(result)">A callback function for successful asynchronous result.</param>
			/// <param name="failed" type="function(error)">A callback function for command failure. The <b>error</b> argument will carry the error message.</param>
			/// <param name="scope" type="">A scope for calling the callbacks; set &quot;null&quot; to call the callbacks in global scope.</param>
			MobileCRM.ManyToManyReference.addRecord(entityName, ref1, ref2, false, success, failed, scope);
		};

		// MobileCRM.DynamicEntity
		_inherit(MobileCRM.DynamicEntity, MobileCRM.Reference);

		MobileCRM.DynamicEntity.legacyPropsSerialization = false; // serves to disable the legacy fields serialization (bool/string issue) 

		MobileCRM.DynamicEntity.createNew = function (entityName, id, primaryName, properties) {
			/// <summary>Creates the MobileCRM.DynamicEntity object representing new entity.</summary>
			/// <param name="entityName" type="String">The logical name of the entity, e.g. "account".</param>
			/// <param name="id" type="String">GUID of the existing entity or null for new one.</param>
			/// <param name="primaryName" type="String">The human readable name of the entity, e.g "Alexandro".</param>
			/// <param name="properties" type="Object">An object with entity properties, e.g. {firstname:"Alexandro", lastname:"Puccini"}.</param>
			var entity = new MobileCRM.DynamicEntity(entityName, id, primaryName, properties);
			entity.isNew = true;
			return entity;
		}
		MobileCRM.DynamicEntity.deleteById = function (entityName, id, success, failed, scope) {
			/// <summary>Asynchronously deletes the CRM entity.</summary>
			/// <param name="entityName" type="String">The logical name of the entity, e.g. "account".</param>
			/// <param name="id" type="String">GUID of the existing entity or null for new one.</param>
			/// <param name="success" type="function()">A callback function for successful asynchronous result.</param>
			/// <param name="failed" type="function(error)">A callback function for command failure. The <b>error</b> argument will carry the error message.</param>
			/// <param name="scope" type="">A scope for calling the callbacks; set &quot;null&quot; to call the callbacks in global scope.</param>
			var request = { entity: entityName, id: id };
			var cmdParams = JSON.stringify(request);
			window.MobileCRM.bridge.command('entitydelete', cmdParams, success, failed, scope);
		};
		MobileCRM.DynamicEntity.loadById = function (entityName, id, success, failed, scope) {
			/// <summary>Asynchronously loads the CRM entity properties.</summary>
			/// <param name="entityName" type="String">The logical name of the entity, e.g. "account".</param>
			/// <param name="id" type="String">GUID of the existing entity or null for new one.</param>
			/// <param name="success" type="function(result)">A callback function for successful asynchronous result. The <b>result</b> argument will carry the MobileCRM.DynamicEntity object.</param>
			/// <param name="failed" type="function(error)">A callback function for command failure. The <b>error</b> argument will carry the error message.</param>
			/// <param name="scope" type="">A scope for calling the callbacks; set &quot;null&quot; to call the callbacks in global scope.</param>
			window.MobileCRM.bridge.command('entityload', JSON.stringify({ entity: entityName, id: id }), success, failed, scope);
		};
		MobileCRM.DynamicEntity.loadDocumentBody = function (entityName, id, success, failed, scope) {
			/// <summary>Asynchronously loads the document body for specified entity.</summary>
			/// <remarks>Function sends an asynchronous request to application, where the locally stored document body (e.g. the annotation.documentbody) is encoded to base64 and sent back to the Javascript callback. This function supports both online data and the data stored in local database/BLOB store.</remarks>
			/// <param name="entityName" type="String">The logical name of the entity, in most cases "annotation".</param>
			/// <param name="id" type="String">GUID of the existing entity or null for new one.</param>
			/// <param name="success" type="function(result)">A callback function for successful asynchronous result. The <b>result</b> argument will carry the string with base64-encoded data.</param>
			/// <param name="failed" type="function(error)">A callback function for command failure. The <b>error</b> argument will carry the error message.</param>
			/// <param name="scope" type="">A scope for calling the callbacks; set &quot;null&quot; to call the callbacks in global scope.</param>
			window.MobileCRM.bridge.command('documentBodyload', JSON.stringify({ entity: entityName, id: id }), success, failed, scope);
		};
		MobileCRM.DynamicEntity.unzipDocumentBody = function (entityName, id, targetDir, success, failed, scope) {
			/// <summary>[v9.1] Asynchronously unpacks the document body (assumes it's a zip file) for specified entity.</summary>
			/// <param name="entityName" type="String">The logical name of the entity, in most cases the "annotation".</param>
			/// <param name="id" type="String">GUID of the existing entity or null for new one.</param>
			/// <param name="targetDir" type="String">The relative path of the target directory within the application storage.</param>
			/// <param name="success" type="function(result)">A callback function for successful asynchronous result. The <b>result</b> argument will carry the string with base64-encoded data.</param>
			/// <param name="failed" type="function(error)">A callback function for command failure. The <b>error</b> argument will carry the error message.</param>
			/// <param name="scope" type="">A scope for calling the callbacks; set &quot;null&quot; to call the callbacks in global scope.</param>
			window.MobileCRM.bridge.command('documentBodyUnzip', targetDir + ';' + JSON.stringify({ entity: entityName, id: id }), success, failed, scope);
		};
		MobileCRM.DynamicEntity.downloadAttachment = function (entityName, id, success, failed, scope) {
			/// <summary>[v9.1] Initiates the attachment download for specified entity.</summary>
			/// <remarks>Function sends an asynchronous request to application, which downloads the document body (e.g. the annotation) from server and sends it back to the Javascript callback.</remarks>
			/// <param name="entityName" type="String">The logical name of the entity, in most cases "annotation".</param>
			/// <param name="id" type="String">GUID of the existing entity or null for new one.</param>
			/// <param name="success" type="function(result)">A callback function for successful asynchronous result. The <b>result</b> argument will carry the string with base64-encoded data.</param>
			/// <param name="failed" type="function(error)">A callback function for command failure. The <b>error</b> argument will carry the error message.</param>
			/// <param name="scope" type="">A scope for calling the callbacks; set &quot;null&quot; to call the callbacks in global scope.</param>

			window.MobileCRM.bridge.command("downloadAttachment", JSON.stringify({ entity: entityName, id: id }), success, failed, scope);
		}
		MobileCRM.DynamicEntity.prototype.save = function (callback) {
			/// <summary>Performs the asynchronous CRM create/modify entity command.</summary>
			/// <param name="callback" type="function(err)">A callback function for asynchronous result. The <b>err</b> argument will carry the error message or null in case of success. The callback is called in scope of DynamicEntity object which is being saved.</param>
			var props = this.properties;
			if (props._privVals)
				props = props._privVals;
			var request = { entity: this.entityName, id: this.id, properties: props, isNew: this.isNew, isOnline: this.isOnline };
			var cmdParams = JSON.stringify(request);
			var self = this;
			window.MobileCRM.bridge.command('entitysave', cmdParams,
						function (res) {
							self.id = res.id;
							self.isNew = false;
							self.isOnline = res.isOnline;
							self.primaryName = res.primaryName;
							self.properties = res.properties;
							callback.call(self, null);
						},
						function (err) {
							callback.call(self, err);
						}, null);
			return this;
		};

		// MobileCRM.Metadata
		MobileCRM.Metadata.requestObject = function (callback, errorCallback, scope) {
			/// <summary>Requests the Metadata object containing the list of MetaEntities which are enabled for current mobile project.</summary>
			/// <remarks>Method initiates an asynchronous request which either ends with calling the <b>errorCallback</b> or with calling the <b>callback</b> with Javascript version of Metadata object. See <see cref="MobileCRM.Bridge.requestObject">MobileCRM.Bridge.requestObject</see> for further details.</remarks>
			/// <param name="callback" type="function(metadata)">The callback function which is called asynchronously with serialized EntityForm object as argument. Callback should return true to apply changed properties.</param>
			/// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
			/// <param name="scope" type="Object">The scope for callbacks.</param>
			MobileCRM.bridge.requestObject("Metadata", function (obj) {
				if (obj) {
					MobileCRM.Metadata.entities = obj;
				}
				callback.call(scope, MobileCRM.Metadata);
				return '';
			}, errorCallback, scope);
		}

		MobileCRM.Metadata.getEntity = function (name) {
			/// <summary>Gets the MetaEntity object describing the entity attributes.</summary>
			/// <remarks>It&apos;s required to request the Metadata object prior to using this object. See <see cref="MobileCRM.Metadata.requestObject">MobileCRM.Metadata.requestObject</see>.</remarks>
			/// <param name="name" type="String">A name of MetaEntity.</param>
			/// <returns type="MobileCRM.MetaEntity">A <see cref="MobileCRM.MetaEntity">MobileCRM.MetaEntity</see> object or "undefined".</returns>
			return MobileCRM.Metadata.entities[name];
		};

		MobileCRM.Metadata.getActivities = function () {
			/// <summary>Gets the list of activities.</summary>
			/// <remarks>It&amp;s required to request the Metadata object prior to using this object. See <see cref="MobileCRM.Metadata.requestObject">MobileCRM.Metadata.requestObject</see>.</remarks>
			/// <returns type="Array">An array of entity names.</returns>
			var arr = [];
			var metaEntities = MobileCRM.Metadata.entities;
			for (var entity in metaEntities) {
				var meta = metaEntities[entity];
				if (meta && meta.isEnabled && meta.canRead() && (meta.attributes & 0x10) != 0)
					arr.push(meta.name);
			}
			return arr;
		};

		MobileCRM.Metadata._childParentMap = { invoicedetail: "invoice", quotedetail: "quote", salesorderdetail: "salesorder", opportunityproduct: "opportunity", uom: "uomschedule", productpricelevel: "pricelevel", discount: "discounttype", contractdetail: "contract", salesliteratureitem: "salesliterature", queueitem: "queue", activitymimeattachment: "email" };
		MobileCRM.Metadata.getEntityParent = function (childEntityName) {
			/// <summary>Gets the entity&#39;s parent entity name.</summary>
			/// <param name="childEntityName" type="String">The entity name.</param>
			/// <returns type="String">The parent entity name, or "undefined" if N/A.</returns>
			return MobileCRM.Metadata._childParentMap[childEntityName];
		};

		MobileCRM.Metadata.entityHasChildren = function (entityName) {
			/// <summary>Gets whether the passed entity has child entities.</summary>
			/// <param name="entityName" type="String">The entity name.</param>
			/// <returns type="Boolean">True if the entity is a parent, false otherwise.</returns>
			return "undefined" != typeof MobileCRM.Metadata._childParentMap[entityName];
		};
		MobileCRM.Metadata.getOptionSetValues = function (entityName, optionSetName, callback, errorCallback, scope) {
			/// <summary>Asynchronously gets the list of values for given CRM OptionSet.</summary>
			/// <param name="entityName" type="String">The entity name.</param>
			/// <param name="entityName" type="String">The OptionSet name.</param>
			/// <param name="callback" type="function(optionSetValues)">The callback function that is called asynchronously with option set values object as argument.</param>
			/// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
			/// <param name="scope" type="Object">The scope for callbacks.</param>
			var fn = function () {
				var result = {};
				var stringTable = MobileCRM.Localization.stringTable;
				var searchVal = entityName + '.' + optionSetName + '.';
				var searchValLen = searchVal.length;
				for (var i in stringTable) {
					if (i && i.substr(0, searchValLen) == searchVal) {
						var val = parseInt(i.substr(searchValLen), 10);
						if (val > 0) {
							var st = stringTable[i];
							result[st] = val;
						}
					}
				}
				callback.call(scope, result);
			};
			if (MobileCRM.Localization.initialized)
				fn();
			else
				MobileCRM.Localization.initialize(fn, errorCallback, scope);
		};

		// MobileCRM.MetaEntity
		_inherit(MobileCRM.MetaEntity, MobileCRM.ObservableObject);

		MobileCRM.MetaEntity.loadByName = function (name, callback, errorCallback, scope) {
			/// <summary>Gets the MetaEntity by its name.</summary>
			/// <remarks>If you only need to know the attributes of a single entity, use this method to prevent requesting all Metadata information.</remarks>
		    /// <param name="name" type="String">A logical name of requested entity.</param>
		    /// <param name="callback" type="function">The callback function that is called asynchronously with MetaEntity object as argument.</param>
		    /// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
		    /// <param name="scope" type="Object">The scope for callbacks.</param>
		    var obj = MobileCRM.bridge.exposeObjectAsync("MobileCrm.Data:MobileCrm.Data.Metadata.get_Entities", []);
		    obj.invokeMethodAsync("get_Item", [name], function (metaEntity) {
		        callback(metaEntity, scope);
		        obj.release();
		    }, errorCallback, scope);
		}
		MobileCRM.MetaEntity.prototype.getProperty = function (name) {
			/// <summary>Gets the MetaProperty object describing the CRM attribute (field) properties.</summary>
			/// <param name="name" type="String">A logical name of the CRM field.</param>
			/// <returns type="MobileCRM.MetaProperty">An instance of the <see cref="MobileCRM.MetaProperty">MobileCRM.MetaProperty</see> object or "null".</returns>
			var properties = this.properties;
			if (properties) {
				for (var i = 0; i < properties.length; i++) {
					if (properties[i].name == name)
						return properties[i];
				}
			}
			return null;
		};
		MobileCRM.MetaEntity.prototype.canRead = function () {
			/// <summary>Checks whether the current user has read permission on the entity type.</summary>
			/// <returns type="Boolean">True if the permission is granted, false otherwise.</returns>
			return this.getDepth(0) != 0;
		}
		MobileCRM.MetaEntity.prototype.canWrite = function () {
			/// <summary>Checks whether the current user has write permission on the entity type.</summary>
			/// <returns type="Boolean">True if the permission is granted, false otherwise.</returns>
			return this.getDepth(1) != 0;
		}
		MobileCRM.MetaEntity.prototype.canCreate = function () {
			/// <summary>Checks whether the current user has create permission on the entity type.</summary>
			/// <returns type="Boolean">True if the permission is granted, false otherwise.</returns>
			return this.getDepth(2) != 0;
		}
		MobileCRM.MetaEntity.prototype.canAppendTo = function (child) {
			/// <summary>Checks whether the user has permission to append a child <b>To</b> a this parent entity.</summary>
			/// <param name="child" type="String">The entity to append (f.e. opportunity).</param>
			/// <returns type="Boolean">True if the user has append permissions, false otherwise.</returns>
			return this.getDepth(5) != 0 && MobileCRM.Metadata.entities[child].getDepth(4) != 0;
		}
		MobileCRM.MetaEntity.prototype.canDelete = function () {
			/// <summary>Checks whether the current user has create permission on the entity type.</summary>
			/// <returns type="Boolean">True if the permission is granted, false otherwise.</returns>
			return this.getDepth(3) != 0;
		}
		MobileCRM.MetaEntity.prototype.getDepth = function (permission) {
			/// <summary>Gets the permission depth.</summary>
			/// <param name="permission" type="Number">Permission to check.</param>
			/// <returns type="Number">The permission depth (none, user, business unit, organization).</returns>
			var p = this.permissionMask;
			var m = permission * 4;
			var d = (p >> m) & 0xF;

			var disabled = (this.attributes & (0x40 << permission)) != 0;
			if (disabled)
				d = 0;

			return d;
		}

		// MobileCRM.FetchXml.Fetch
		MobileCRM.FetchXml.Fetch.executeFromXML = function (fetchXmlData, success, failed, scope) {
			/// <summary>Performs the asynchronous CRM Fetch command.</summary>
			/// <remarks></remarks>
			/// <param name="fetchXmlData" type="String">CRM fetch in XML representation.</param>
			/// <param name="success" type="function(result)">A callback function for successful asynchronous result. The <b>result</b> argument will carry the objects array of type specified by <b>resultformat</b> XML attribute (Array, JSON, XML or DynamicEntities).</param>
			/// <param name="failed" type="function(error)">A callback function for command failure. The <b>error</b> argument will carry the error message.</param>
			/// <param name="scope" type="">A scope for calling the callbacks; set &quot;null&quot; to call the callbacks in global scope.</param>
			window.MobileCRM.bridge.command('fetchXML', fetchXmlData, success, failed, scope);
		};
		MobileCRM.FetchXml.Fetch.prototype.execute = function (output, success, failed, scope) {
			/// <summary>Performs the asynchronous CRM Fetch request.</summary>
			/// <param name="output" type="String">A string defining the output format: Array, JSON, XML or DynamicEntities.</param>
			/// <param name="success" type="function(result)">A callback function for successful asynchronous result. The <b>result</b> argument will carry the objects array of type specified by <b>output</b> argument.</param>
			/// <param name="failed" type="function(error)">A callback function for command failure. The <b>error</b> argument will carry the error message.</param>
			/// <param name="scope" type="">A scope for calling the callbacks; set &quot;null&quot; to call the callbacks in global scope.</param>
			var reqParams = JSON.stringifyNotNull({ entity: this.entity, resultformat: output, page: this.page, count: this.count, aggregate: this.aggregate });
			MobileCRM.bridge.command('fetch', reqParams, success, failed, scope);
		};
		MobileCRM.FetchXml.Fetch.prototype.executeOnline = function (output, success, failed, scope) {
			/// <summary>[v8.0] Performs the online CRM Fetch request regardless of the app online/offline mode.</summary>
			/// <param name="output" type="String">A string defining the output format: Array, JSON, XML or DynamicEntities.</param>
			/// <param name="success" type="function(result)">A callback function for successful asynchronous result. The <b>result</b> argument will carry the objects array of type specified by <b>output</b> argument.</param>
			/// <param name="failed" type="function(error)">A callback function for command failure. The <b>error</b> argument will carry the error message.</param>
			/// <param name="scope" type="">A scope for calling the callbacks; set &quot;null&quot; to call the callbacks in global scope.</param>
			var format = "Online.";
			if (output)
				format += output;
			this.execute(format, success, failed, scope);
		};
		MobileCRM.FetchXml.Fetch.prototype.executeOffline = function (output, success, failed, scope) {
			/// <summary>[v8.0] Performs the offline CRM Fetch request regardless of the app online/offline mode.</summary>
			/// <param name="output" type="String">A string defining the output format: Array, JSON, XML or DynamicEntities.</param>
			/// <param name="success" type="function(result)">A callback function for successful asynchronous result. The <b>result</b> argument will carry the objects array of type specified by <b>output</b> argument.</param>
			/// <param name="failed" type="function(error)">A callback function for command failure. The <b>error</b> argument will carry the error message.</param>
			/// <param name="scope" type="">A scope for calling the callbacks; set &quot;null&quot; to call the callbacks in global scope.</param>
			var format = "Offline.";
			if (output)
				format += output;
			this.execute("Offline." + output, success, failed, scope);
		};

		// MobileCRM.FetchXml.Entity
		MobileCRM.FetchXml.Entity.prototype.addAttribute = function (name, alias, agreggate) {
			/// <summary>Adds an entity attribute to the fetch query.</summary>
			/// <param name="attribute" type="String">The attribute (CRM logical field name) to order by.</param>
			/// <param name="alias" type="String">Optional parameter defining an attribute alias.</param>
			/// <param name="aggregate" type="String">Optional parameter defining an aggregation function.</param>
			/// <returns type="MobileCRM.FetchXml.Attribute">The newly created MobileCRM.FetchXml.Attribute object</returns>
			var attr = new MobileCRM.FetchXml.Attribute(name);
			if (alias)
				attr.alias = alias;
			if (agreggate)
				attr.aggregate = agreggate;
			this.attributes.push(attr);
			return attr;
		};
		MobileCRM.FetchXml.Entity.prototype.addAttributes = function () {
			/// <summary>Adds all entity attributes to the fetch query.</summary>
			this.allattributes = true;
		};
		MobileCRM.FetchXml.Entity.prototype.addFilter = function () {
			/// <summary>Adds a filter for this fetch entity.</summary>
			/// <returns type="MobileCRM.FetchXml.LinkEntity">Existing or newly created entity filter.</returns>
			var filter = this.filter;
			if (filter)
				return filter;

			filter = new MobileCRM.FetchXml.Filter();
			this.filter = filter;
			return filter;
		};
		MobileCRM.FetchXml.Entity.prototype.addLink = function (target, from, to, linktype) {
			/// <summary>Adds an entity link (join) to the fetch query.</summary>
			/// <param name="target" type="String">The target entity.</param>
			/// <param name="from" type="String">The "from" field (if parent then target entity primary key).</param>
			/// <param name="to" type="String">The "to" field.</param>
			/// <param name="linkType" type="String">The link (join) type ("inner" or "outer").</param>
			/// <returns type="MobileCRM.FetchXml.LinkEntity">The newly created MobileCRM.FetchXml.LinkEntity object.</returns>
			var link = new MobileCRM.FetchXml.LinkEntity(target);
			link.from = from;
			link.to = to;
			link.linktype = linktype;
			this.linkentities.push(link);
			return link;
		};
		MobileCRM.FetchXml.Entity.prototype.orderBy = function (attribute, descending) {
			/// <summary>Adds an order by statement to the fetch query.</summary>
			/// <param name="attribute" type="String">The attribute (CRM logical field name) to order by.</param>
			/// <param name="descending" type="Boolean">false, for ascending order; true, for descending order.</param>
			/// <returns type="MobileCRM.FetchXml.Order">The newly created MobileCRM.FetchXml.Order object.</returns>
			var order = new MobileCRM.FetchXml.Order(attribute, descending);
			this.order.push(order);
			return order;
		}

		// MobileCRM.FetchXml.LinkEntity
		_inherit(MobileCRM.FetchXml.LinkEntity, MobileCRM.FetchXml.Entity);

		// MobileCRM.FetchXml.Filter
		MobileCRM.FetchXml.Filter.prototype.where = function (attribute, op, value) {
			/// <summary>Adds a attribute condition to the filter.</summary>
			/// <param name="attribute" type="String">The attribute name (CRM logical field name).</param>
			/// <param name="op" type="String">The condition operator. "eq", "ne", "lt", "le", "gt", "ge", "like"</param>
			/// <param name="value" type="Depends on attribute type">The values to compare to.</param>
			/// <returns type="MobileCRM.FetchXml.Condition">The condition instance.</returns>
			var condition = new MobileCRM.FetchXml.Condition();
			condition.attribute = attribute;
			condition.operator = op;
			condition.value = value;
			this.conditions.push(condition);
			return condition;
		};
		MobileCRM.FetchXml.Filter.prototype.isIn = function (attribute, values) {
			/// <summary>Adds a attribute inclusion condition to the filter.</summary>
			/// <param name="attribute" type="String">The attribute name (CRM logical field name).</param>
			/// <param name="values" type="Array">An array of values.</param>
			/// <returns type="MobileCRM.FetchXml.Condition">The condition instance.</returns>
			var condition = new MobileCRM.FetchXml.Condition();
			condition.attribute = attribute;
			condition.operator = "in";
			condition.values = values;
			this.conditions.push(condition);
			return condition;
		};
		MobileCRM.FetchXml.Filter.prototype.notIn = function (attribute, values) {
		    /// <summary>Adds a attribute inclusion condition to the filter.</summary>
		    /// <param name="attribute" type="String">The attribute name (CRM logical field name).</param>
		    /// <param name="values" type="Array">An array of values.</param>
		    /// <returns type="MobileCRM.FetchXml.Condition">The condition instance.</returns>
		    var condition = new MobileCRM.FetchXml.Condition();
		    condition.attribute = attribute;
		    condition.operator = "not-in";
		    condition.values = values;
		    this.conditions.push(condition);
		    return condition;
		}
		MobileCRM.FetchXml.Filter.prototype.between = function (attribute, low, high) {
			/// <summary>Adds a condition that the passed attribute is between the passed bounds.</summary>
			/// <param name="attribute" type="String">The attribute name (CRM logical field name).</param>
			/// <param name="low" type="Depends on attribute type">The lower bound.</param>
			/// <param name="high" type="Depends on attribute type">The higher bound.</param>
			/// <returns type="MobileCRM.FetchXml.Condition">The condition instance.</returns>
			var condition = new MobileCRM.FetchXml.Condition();
			condition.attribute = attribute;
			condition.operator = "between";
			condition.values = [low, high];
			this.conditions.push(condition);
			return condition;
		};
		MobileCRM.FetchXml.Filter.prototype.startsWith = function (attribute, value) {
			/// <summary>Adds a condition that the passed column value contains the passed string.</summary>
			/// <param name="attribute" type="String">The attribute name (CRM logical field name).</param>
			/// <param name="value" type="String">The value to compare to.</param>
			/// <returns type="MobileCRM.FetchXml.Condition">The condition instance.</returns>
			return this.where(attribute, "like", value + "%");
		};
		MobileCRM.FetchXml.Filter.prototype.contains = function (attribute, value) {
			/// <summary>Adds a condition that the passed column starts with the passed string.</summary>
			/// <param name="attribute" type="String">The attribute name (CRM logical field name).</param>
			/// <param name="value" type="String">The value to compare to.</param>
			/// <returns type="MobileCRM.FetchXml.Condition">The condition instance.</returns>
			return this.where(attribute, "like", "%" + value + "%");
		};

		// MobileCRM.Platform
		_inherit(MobileCRM.Platform, MobileCRM.ObservableObject);

		function _executePlatformAction(action, data, success, failed, scope) {
		    var params = [action, data];
		    MobileCRM.bridge.invokeStaticMethodAsync("Resco.UI", "Resco.UI.Platform", "Instance.Execute", params, success, failed, scope);
		};

		MobileCRM.Platform.requestObject = function (callback, errorCallback, scope) {
			/// <summary>Requests the managed Platform object.</summary>
			/// <remarks>Method initiates an asynchronous request which either ends with calling the <b>errorCallback</b> or with calling the <b>callback</b> with Javascript version of Platform object. See <see cref="MobileCRM.Bridge.requestObject">MobileCRM.Bridge.requestObject</see> for further details.</remarks>
			/// <param name="callback" type="function(platform)">The callback function that is called asynchronously with serialized Platform object as argument.</param>
			/// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
			/// <param name="scope" type="Object">The scope for callbacks.</param>
			MobileCRM.bridge.requestObject("Platform", callback, errorCallback, scope);
		};
		MobileCRM.Platform.email = function (address, subject, body, errorCallback, scope) {
			/// <summary>[v8.1] Opens the platform-specific e-mail message form with pre-filled data.</summary>
			/// <param name="address" type="String">Recipient&#39;s email address.</param>
			/// <param name="subject" type="String">An e-mail subject.</param>
			/// <param name="body" type="String">A string with email body.</param>
			/// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called asynchronously in case of error.</param>
			/// <param name="scope" type="Object">The scope for errorCallback.</param>

			var emailContent = { Address: address, Subject: subject, Body: body };
			_executePlatformAction(1, emailContent, null, errorCallback, scope);
		};
		MobileCRM.Platform.emailWithAttachments = function (address, subject, body, attachments, entity, relationship, errorCallback, scope) {
			/// <summary>[v9.1] Sends a list of files (full paths or IReferences to blobs) as email attachments.</summary>
			/// <remarks>This method either open the CRM Email form or the native mail client (depending on application settings).</remarks>
			/// <param name="address" type="String">Recipient&quot;s email address.</param>
			/// <param name="subject" type="String">An e-mail subject.</param>
			/// <param name="body" type="String">A string with email body.</param>
			/// <param name="attachments" type="Array">Array of files to send. Element must be a full path or a IReference to a note, etc.</param>
			/// <param name="entity" type="MobileCRM.Reference">The related entity reference.</param>
			/// <param name="relationship" type="MobileCRM.Relationship">The relationship to the created email entity. (optional).</param>
			/// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called asynchronously in case of error.</param>
			/// <param name="scope" type="Object">The scope for errorCallback.</param>

			var params = {
				relationship: relationship,
				body: body,
				subject: subject,
				address: address,
				attachments: attachments,
				entity: entity
			}

			MobileCRM.bridge.command("sendEmailWithAttachments", JSON.stringify(params), null, errorCallback, scope);
		};
		MobileCRM.Platform.openUrl = function (url) {
			/// <summary>Open url in external browser.</summary>
			/// <param name="url" type="String">web page url</param>
			var param = { Address: url };
			_executePlatformAction(3, param, null, null);
		};
		MobileCRM.Platform.getURL = function (success, failed, scope) {
			/// <summary>Gets the full URL of currently loaded HTML document.</summary>
			/// <param name="success" type="function(result)">A callback function for successful asynchronous result. The <b>result</b> will carry a string with URL.</param>
			/// <param name="failed" type="function(error)">A callback function for command failure. The <b>error</b> argument will carry the error message.</param>
			/// <param name="scope" type="">A scope for calling the callbacks; set &quot;null&quot; to call the callbacks in global scope.</param>
			MobileCRM.bridge.command("getURL", null, success, failed, scope);
		};
		MobileCRM.Platform.getDeviceInfo = function (success, failed, scope) {
			/// <summary>Gets the device information.</summary>
			/// <param name="success" type="function(result)">A callback function for successful asynchronous result. The <b>result</b> will carry a <see cref="MobileCRM._DeviceInfo">MobileCRM._DeviceInfo</see> object.</param>
			/// <param name="failed" type="function(error)">A callback function for command failure. The <b>error</b> argument will carry the error message.</param>
			/// <param name="scope" type="">A scope for calling the callbacks; set &quot;null&quot; to call the callbacks in global scope.</param>
			MobileCRM.bridge.command("getDeviceInfo", null, success, failed, scope);
		};
		MobileCRM.Platform.navigateTo = function (latitude, longitude, failed, scope) {
			/// <summary>Execute the navigateTo function based on the latitude and longitude.</summary>
			/// <param name="failed" type="function(error)">A callback function for command failure. The <b>error</b> argument will carry the error message.</param>
			/// <param name="scope" type="">A scope for calling the callbacks; set &quot;null&quot; to call the callbacks in global scope.</param>
			var params = { Address: latitude + "," + longitude };
			_executePlatformAction(4, params, null, null);
		};
		MobileCRM.Platform.scanBarCode = function (success, failed, scope) {
			/// <summary>Activates the bar-code scanning.</summary>
			/// <remarks>If the current platform does not support the bar-code scanning, the <b>failed</b> handler is called with error "Unsupported".</remarks>
			/// <param name="success" type="function(result)">A callback function for successful asynchronous result. The <b>result</b> will carry an array of strings with scanned codes.</param>
			/// <param name="failed" type="function(error)">A callback function for command failure. The <b>error</b> argument will carry the error message.</param>
			/// <param name="scope" type="">A scope for calling the callbacks; set &quot;null&quot; to call the callbacks in global scope.</param>
			MobileCRM.bridge.command("scanBarcode", null, success, failed, scope);
		};
		MobileCRM.Platform.getLocation = function (success, failed, scope, age, precision) {
			/// <summary>Gets current geo-location from platform-specific location service.</summary>
			/// <remarks>If the current platform does not support the location service, the <b>failed</b> handler is called with error "Unsupported".</remarks>
			/// <param name="success" type="function(result)">A callback function for successful asynchronous result. The <b>result</b> will carry an object with properties <b>latitude</b> and <b>longitude</b>.</param>
			/// <param name="failed" type="function(error)">A callback function for command failure. The <b>error</b> argument will carry the error message.</param>
			/// <param name="scope" type="">A scope for calling the callbacks; set &quot;null&quot; to call the callbacks in global scope.</param>
			/// <param name="age" type="Number">Max age in seconds to accept GPS.</param>
			/// <param name="precision" type="Number">Desired accuracy in meters.</param>
			var params = { maxAge: age, accuracy: precision };
			MobileCRM.bridge.command("getLocation", JSON.stringify(params), success, failed, scope);
		};

		// MobileCRM.Application
		MobileCRM.Application.synchronize = function (backgroundOnly, ifNotSyncedBefore) {
			/// <summary>Starts background/foreground sync if not synchronized or the last sync was before desired limit.</summary>
			/// <param name="backgroundOnly" type="Boolean">if true, only the background sync is allowed; otherwise it can also run the foreground sync.</param>
			/// <param name="ifNotSyncedBefore" type="Date">Defines a time limit required for the last sync. Starts the sync only if wasn&quot;t done yet or if it was before this limit. If it is null or undefined, sync is done always.</param>
			MobileCRM.bridge.invokeStaticMethodAsync("MobileCrm", "MobileCrm.Controllers.HomeForm", "Instance.Synchronize", [backgroundOnly, ifNotSyncedBefore]);
		}
		MobileCRM.Application.synchronizeOnForeground = function (forceLogin) {
			/// <summary>[v8.1] Starts the synchronization on foreground (closes all form if possible and showing the standard progress).</summary>
			/// <remarks>Foreground sync must be done to download the new customization or to display the sync conflicts.</remarks>
			/// <param name="forceLogin" type="Boolean">if true, the sync dialog with URL and credentials will be opened; otherwise it is opened only if the password is not saved.</param>
			MobileCRM.bridge.invokeStaticMethodAsync("MobileCrm", "MobileCrm.Controllers.HomeForm", "Instance.Synchronize", [forceLogin, false]);
		}

		MobileCRM.Application.getAppColor = function (colName, success, failed, scope) {
			/// <summary>Gets the customized color by its name.</summary>
			/// <param name="colName" type="String">Defines the color name. Must be one of these: TitleBackground, TitleForeground, ListBackground, ListForeground, ListSelBackground, ListSelForeground, ListSeparator, SearchBackground, SearchForeground, SearchSelForeground, FormBackground, FormItemBackground, FormItemForeground, FormItemLabelForeground, FormItemDisabled, FormItemLink, TabBackground, TabForeground, TabSelForeground.</param>
			/// <param name="success" type="function(result)">A callback function for successful asynchronous result. The <b>result</b> will carry a String object with color in CSS format (e.g. "#FF0000" for red color).</param>
			/// <param name="failed" type="function(error)">A callback function for command failure. The <b>error</b> argument will carry the error message.</param>
			/// <param name="scope" type="">A scope for calling the callbacks; set &quot;null&quot; to call the callbacks in global scope.</param>
			MobileCRM.bridge.command("getAppColor", colName, success, failed, scope);
		};

		MobileCRM.Application.getAppImage = function (imageName, colorize, success, failed, scope) {
			/// <summary>Gets the colorized application image. It is taken either from customization package or from application bundle.</summary>
			/// <param name="imageName" type="String">Defines the image name (e.g. &quot;Buttons.Call.png&quot;).</param>
			/// <param name="colorize" type="String">If the image supports colorization, this value defines the colorization color. It can be either integer with RGB value or the application color name as defined in <see cref="MobileCRM.Application.getAppColor">MobileCRM.Application.getAppColor</see>. Leave null if no colorization is desired.</param>
			/// <param name="success" type="function(result)">A callback function for successful asynchronous result. The <b>result</b> will carry a String object with &quot;data:&quot; URL containing base64-encoded colorized application image.</param>
			/// <param name="failed" type="function(error)">A callback function for command failure. The <b>error</b> argument will carry the error message.</param>
			/// <param name="scope" type="">A scope for calling the callbacks; set &quot;null&quot; to call the callbacks in global scope.</param>
			var data = colorize ? (colorize + "#" + imageName) : imageName;
			MobileCRM.bridge.command("getAppImage", data, success, failed, scope);
		};

		MobileCRM.Application.fileExists = function (path, success, failed, scope) {
		    /// <summary>Checks whether the file with given path exists in application local data.</summary>
		    /// <param name="path" type="String">Defines the relative path of the file located in the application local data.</param>
		    /// <param name="success" type="function(result)">A callback function for successful asynchronous result. The <b>result</b> will carry a Boolean object determining whether the file exists or not.</param>
		    /// <param name="failed" type="function(error)">A callback function for command failure. The <b>error</b> argument will carry the error message.</param>
		    /// <param name="scope" type="">A scope for calling the callbacks; set &quot;null&quot; to call the callbacks in global scope.</param>
		    MobileCRM.bridge.invokeStaticMethodAsync("MobileCrm.Data", "MobileCrm.Configuration", "Instance.FileExists", [path], success, failed, scope);
		};

		MobileCRM.Application.directoryExists = function (path, success, failed, scope) {
		    /// <summary>Checks whether the directory with given path exists in the application local data.</summary>
		    /// <param name="path" type="String">Defines the relative path of the directory located in the application local data.</param>
		    /// <param name="success" type="function(result)">A callback function for successful asynchronous result. The <b>result</b> will carry a Boolean object determining whether the directory exists or not.</param>
		    /// <param name="failed" type="function(error)">A callback function for command failure. The <b>error</b> argument will carry the error message.</param>
		    /// <param name="scope" type="">A scope for calling the callbacks; set &quot;null&quot; to call the callbacks in global scope.</param>
		    MobileCRM.bridge.invokeStaticMethodAsync("MobileCrm.Data", "MobileCrm.Configuration", "Instance.DirectoryExists", [path], success, failed, scope);
		};

	    MobileCRM.Application.createDirectory = function (path, success, failed, scope) {
	        /// <summary>Asynchronously creates the directory in the application local data.</summary>
	        /// <param name="path" type="String">Defines the relative path of the directory in the application local data.</param>
	        /// <param name="success" type="function(result)">A callback function which is called in case of successful asynchronous result.</param>
	        /// <param name="failed" type="function(error)">A callback function for command failure. The <b>error</b> argument will carry the error message.</param>
	        /// <param name="scope" type="">A scope for calling the callbacks; set &quot;null&quot; to call the callbacks in global scope.</param>
	        MobileCRM.bridge.invokeStaticMethodAsync("MobileCrm.Data", "MobileCrm.Configuration", "Instance.CreateDirectory", [path], success, failed, scope);
	    };

	    MobileCRM.Application.deleteDirectory = function (path, success, failed, scope) {
	        /// <summary>Asynchronously deletes the empty directory from the application local data.</summary>
	        /// <param name="path" type="String">Defines the relative path of the directory in the application local data.</param>
	        /// <param name="success" type="function(result)">A callback function which is called in case of successful asynchronous result.</param>
	        /// <param name="failed" type="function(error)">A callback function for command failure. The <b>error</b> argument will carry the error message.</param>
	        /// <param name="scope" type="">A scope for calling the callbacks; set &quot;null&quot; to call the callbacks in global scope.</param>
	        MobileCRM.bridge.invokeStaticMethodAsync("MobileCrm.Data", "MobileCrm.Configuration", "Instance.DeleteDirectory", [path], success, failed, scope);
	    };
	    MobileCRM.Application.getDirectories = function (path, success, failed, scope) {
	    	/// <summary>Asynchronously gets the list of directories from the application local data.</summary>
	    	/// <param name="path" type="String">Defines the relative path of the Directory in the application local data.</param>
	    	/// <param name="success" type="function(result)">A callback function which carry the array of directories names.</param>
	    	/// <param name="failed" type="function(error)">A callback function for command failure. The <b>error</b> argument will carry the error message.</param>
	    	/// <param name="scope" type="">A scope for calling the callbacks; set &quot;null&quot; to call the callbacks in global scope.</param>

	    	MobileCRM.bridge.invokeStaticMethodAsync("MobileCrm.Data", "MobileCrm.Configuration", "Instance.GetDirectories", [path], success, failed, scope);
	    };

	    MobileCRM.Application.deleteFile = function (path, success, failed, scope) {
	        /// <summary>Asynchronously deletes the file from the application local data.</summary>
	        /// <param name="path" type="String">Defines the relative path of the file in the application local data.</param>
	        /// <param name="success" type="function(result)">A callback function which is called in case of successful asynchronous result.</param>
	        /// <param name="failed" type="function(error)">A callback function for command failure. The <b>error</b> argument will carry the error message.</param>
	        /// <param name="scope" type="">A scope for calling the callbacks; set &quot;null&quot; to call the callbacks in global scope.</param>

	        MobileCRM.bridge.invokeStaticMethodAsync("MobileCrm.Data", "MobileCrm.Configuration", "Instance.DeleteFile", [path], success, failed, scope);
	    };

	    MobileCRM.Application.getFiles = function (path, success, failed, scope) {
	    	/// <summary>Asynchronously gets the list of files from the application local data.</summary>
	    	/// <param name="path" type="String">Defines the relative path of the Directory in the application local data.</param>
	    	/// <param name="success" type="function(result)">A callback function which carry the array of files names in the directory.</param>
	    	/// <param name="failed" type="function(error)">A callback function for command failure. The <b>error</b> argument will carry the error message.</param>
	    	/// <param name="scope" type="">A scope for calling the callbacks; set &quot;null&quot; to call the callbacks in global scope.</param>

	    	MobileCRM.bridge.invokeStaticMethodAsync("MobileCrm.Data", "MobileCrm.Configuration", "Instance.GetFiles", [path], success, failed, scope);
	    };

	    MobileCRM.Application.moveFile = function (src, dst, success, failed, scope) {
	        /// <summary>Asynchronously moves the application local file to another location.</summary>
	        /// <param name="src" type="String">Defines the relative path of the source file in the application local data.</param>
	        /// <param name="dst" type="String">Defines the relative path of the destination file in the application local data.</param>
	        /// <param name="success" type="function(result)">A callback function which is called in case of successful asynchronous result.</param>
	        /// <param name="failed" type="function(error)">A callback function for command failure. The <b>error</b> argument will carry the error message.</param>
	        /// <param name="scope" type="">A scope for calling the callbacks; set &quot;null&quot; to call the callbacks in global scope.</param>
	        MobileCRM.bridge.invokeStaticMethodAsync("MobileCrm.Data", "MobileCrm.Configuration", "Instance.MoveFile", [src, dst], success, failed, scope);
	    };

	    MobileCRM.Application.readFile = function (path, success, failed, scope) {
	        /// <summary>Reads the file from the application local data and asynchronously gets its content.</summary>
	        /// <param name="path" type="String">Defines the relative path of the file in the application local data.</param>
	        /// <param name="success" type="function(result)">A callback function for successful asynchronous result. The <b>result</b> will carry a String object with the file content.</param>
	        /// <param name="failed" type="function(error)">A callback function for command failure. The <b>error</b> argument will carry the error message.</param>
	        /// <param name="scope" type="">A scope for calling the callbacks; set &quot;null&quot; to call the callbacks in global scope.</param>
	        var reader = MobileCRM.bridge.exposeObjectAsync("MobileCrm.Data:MobileCrm.Configuration.Instance.OpenStorageReader", [path]);
	        reader.invokeMethodAsync("ReadToEnd", [], success, failed, scope);
	        reader.invokeMethodAsync("Dispose", [], undefined, failed, scope);
	        reader.release();
	    };

	    MobileCRM.Application.writeFile = function (path, text, append, success, failed, scope) {
	    	/// <summary>Asynchronously writes the text into the file from the application local data.</summary>
			/// <remarks>File content is encoded using UTF-8 encoding.</remarks>
	        /// <param name="path" type="String">Defines the relative path of the file in the application local data.</param>
	        /// <param name="text" type="String">Defines the file content to be written.</param>
	        /// <param name="append" type="Boolean">Determines whether to overwrite or append to an existing file..</param>
	        /// <param name="success" type="function(result)">A callback function which is called in case of successful asynchronous result.</param>
	        /// <param name="failed" type="function(error)">A callback function for command failure. The <b>error</b> argument will carry the error message.</param>
	        /// <param name="scope" type="">A scope for calling the callbacks; set &quot;null&quot; to call the callbacks in global scope.</param>
	        var reader = MobileCRM.bridge.exposeObjectAsync("MobileCrm.Data:MobileCrm.Configuration.Instance.OpenStorageWriter", [path, append]);
	        reader.invokeMethodAsync("Write", [text], success, failed, scope);
	        reader.invokeMethodAsync("Dispose", [], undefined, failed, scope);
	        reader.release();
	    };

	    MobileCRM.Application.writeFileWithEncoding = function (path, text, encoding, append, success, failed, scope) {
	    	/// <summary>[v9.0.2] Asynchronously writes the text into the file from the application local data.</summary>
	    	/// <param name="path" type="String">Defines the relative path of the file in the application local data.</param>
	    	/// <param name="text" type="String">Defines the file content to be written.</param>
	    	/// <param name="encoding" type="String">Defines the text encoding for file content (default is UTF-8). Use &quot;ASCII&quot; for ANSI text or &quot;UTF-16&quot; for multi-byte Unicode.</param>
	    	/// <param name="append" type="Boolean">Determines whether to overwrite or append to an existing file.</param>
	    	/// <param name="success" type="function(result)">A callback function which is called in case of successful asynchronous result.</param>
	    	/// <param name="failed" type="function(error)">A callback function for command failure. The <b>error</b> argument will carry the error message.</param>
	    	/// <param name="scope" type="">A scope for calling the callbacks; set &quot;null&quot; to call the callbacks in global scope.</param>
	    	var reader = MobileCRM.bridge.exposeObjectAsync("MobileCrm.Data:MobileCrm.Configuration.Instance.OpenStorageWriterEnc", [path, append, (encoding || null)]);
	    	reader.invokeMethodAsync("Write", [text], success, failed, scope);
	    	reader.invokeMethodAsync("Dispose", [], undefined, failed, scope);
	    	reader.release();
	    };

	    MobileCRM.Application.readFileAsBase64 = function (path, success, failed, scope) {
	    	/// <summary>Reads the file from the application local data and asynchronously gets its base64-encoded content.</summary>
	    	/// <param name="path" type="String">Defines the relative path of the file in the application local data.</param>
	    	/// <param name="success" type="function(result)">A callback function for successful asynchronous result. The <b>result</b> will carry a string with the base64-encoded file content.</param>
	    	/// <param name="failed" type="function(error)">A callback function for command failure. The <b>error</b> argument will carry the error message.</param>
	    	/// <param name="scope" type="">A scope for calling the callbacks; set &quot;null&quot; to call the callbacks in global scope.</param>
	    	MobileCRM.bridge.invokeStaticMethodAsync("MobileCrm.Data", "MobileCrm.Configuration", "Instance.ReadStorageFileAsBase64", [path], success, failed, scope);
	    };

	    MobileCRM.Application.writeFileFromBase64 = function (path, base64, success, failed, scope) {
	    	/// <summary>Asynchronously writes the base64-encoded data into the application local storage file.</summary>
	    	/// <param name="path" type="String">Defines the relative path of the file in the application local data.</param>
	    	/// <param name="base64" type="String">A string containing the base64-encoded file content.</param>
	    	/// <param name="success" type="function()">A callback function which is called in case of success.</param>
	    	/// <param name="failed" type="function(error)">A callback function for command failure. The <b>error</b> argument will carry the error message.</param>
	    	/// <param name="scope" type="">A scope for calling the callbacks; set &quot;null&quot; to call the callbacks in global scope.</param>
	    	MobileCRM.bridge.invokeStaticMethodAsync("MobileCrm.Data", "MobileCrm.Configuration", "Instance.WriteStorageFileFromBase64", [path, base64], success, failed, scope);
	    };

		// MobileCRM.UI.FormManager
		MobileCRM.UI.FormManager.showEditDialog = function (entityName, id, relationship, options) {
			/// <summary>Shows an entity edit dialog.</summary>
			/// <param name="entityName" type="String">The entity name.</param>
			/// <param name="id" type="String">GUID of the existing entity or null for new one.</param>
			/// <param name="relationship" type="MobileCRM.RelationShip">The optional relationship with a parent entity.</param>
			/// <param name="options" type="Object">A JSON object containing a form-specific properties like pre-defined field values, peer iFrame options or document options.</param>
			var reference = new MobileCRM.Reference(entityName, id);
			if (!id || id.length == 0)
				delete reference.id;
			if (typeof relationship != "undefined")
				reference.relationShip = JSON.stringify(relationship);
			if (typeof options != "undefined")
				reference.options = JSON.stringify(options);
			MobileCRM.bridge.command("formManagerAction", JSON.stringify(reference));
		}
		MobileCRM.UI.FormManager.showDetailDialog = function (entityName, id, relationship) {
			/// <summary>Shows an entity detail dialog.</summary>
			/// <param name="entityName" type="String">The entity name.</param>
			/// <param name="id" type="String">GUID of the existing entity.</param>
			/// <param name="relationship" type="MobileCRM.RelationShip">The optional relationship with a parent entity.</param>
			var reference = new MobileCRM.Reference(entityName, id);
			reference.detail = true;
			if (typeof relationship != "undefined")
				reference.relationShip = JSON.stringify(relationship);
			MobileCRM.bridge.command("formManagerAction", JSON.stringify(reference));
		}
		MobileCRM.UI.FormManager.showNewDialog = function (entityName, relationship, options) {
			/// <summary>Shows a new entity dialog.</summary>
			/// <param name="entityName" type="String">The entity name.</param>
			/// <param name="relationship" type="MobileCRM.RelationShip">The optional relationship with a parent entity.</param>
		/// <param name="options" type="Object">A JSON object containing a form-specific properties like pre-defined field values, peer iFrame options or document options.</param>
		MobileCRM.UI.FormManager.showEditDialog(entityName, null, relationship, options);
		}

		_inherit(MobileCRM.UI._DetailView, MobileCRM.ObservableObject);
		MobileCRM.UI._DetailView.prototype.getItemByName = function (name) {
			/// <summary>Returns the <see cref="MobileCRM.UI._DetailItem">MobileCRM.UI._DetailItem</see> with specified name or "null".</summary>
			/// <param name="name" type="String">A name of requested detail item.</param>
			/// <returns type="MobileCRM.UI._DetailItem">An instance of <see cref="MobileCRM.UI._DetailItem">MobileCRM.UI._DetailItem</see> with specified name or "null".</returns>
			var items = this.items;
			var nItems = items.length;
			for (var i = 0; i < nItems; i++) {
				var item = items[i];
				if (item.name == name)
					return item;
			}
			return undefined;
		};
		MobileCRM.UI._DetailView.prototype.getItemIndex = function (name) {
			/// <summary>Returns index of <see cref="MobileCRM.UI._DetailItem">MobileCRM.UI._DetailItem</see> with specified name or -1.</summary>
			/// <param name="name" type="String">A name of requested detail item.</param>
			/// <returns type="Number">Index of <see cref="MobileCRM.UI._DetailItem">MobileCRM.UI._DetailItem</see> with specified name or -1.</returns>
			var items = this.items;
			var nItems = items.length;
			for (var i = 0; i < nItems; i++) {
				var item = items[i];
				if (item.name == name)
					return i;
			}
			return -1;
		};
		MobileCRM.UI._DetailView.prototype.insertItem = function (item, index) {
			/// <summary>[v8.0] Inserts the <see cref="MobileCRM.UI.DetailViewItems.Item">MobileCRM.UI.DetailViewItems.Item</see> into this detailed view.</summary>
			/// <param name="item" type="MobileCRM.UI.DetailViewItems.Item">An item to be added.</param>
			/// <param name="index" type="Number">An index on which the item should be placed. Set to -1 to append the item at the end.</param>
			var data = {};
			for (var prop in item) {
				data[prop] = item[prop];
			}
			data.action = "insert";
			data.viewName = this.name;
			data.index = (typeof (index) !== "undefined") ? index : -1;
			MobileCRM.bridge.command("detailViewAction", JSON.stringify(data));
		};
		MobileCRM.UI._DetailView.prototype.insertItems = function (items, index) {
			/// <summary>[v8.0] Inserts the <see cref="MobileCRM.UI.DetailViewItems.Item">MobileCRM.UI.DetailViewItems.Item</see> into this detailed view.</summary>
			/// <param name="items" type="Array(MobileCRM.UI.DetailViewItems.Item)">An array of items to be added.</param>
			/// <param name="index" type="Number">An index on which the items should be placed. Set to -1 to append the items at the end.</param>
			var data = {};
			data.action = "insertMultiple";
			data.viewName = this.name;
			data.index = (typeof (index) !== "undefined") ? index : -1;
			data.items = items;
			MobileCRM.bridge.command("detailViewAction", JSON.stringify(data));
		};
		MobileCRM.UI._DetailView.prototype.removeItem = function (index) {
			/// <summary>[v8.0] Removes the item from this detailed view.</summary>
			/// <param name="index" type="Number">An index of the item which has to be removed.</param>
			var data = {
				action: "delete",
				viewName: this.name,
				index: index
			};
			MobileCRM.bridge.command("detailViewAction", JSON.stringify(data));
		};
		MobileCRM.UI._DetailView.prototype.removeItems = function (indexes) {
			/// <summary>[v8.0] Removes all items from this detailed view.</summary>
			/// <param name="indexes" type="Array">An array of item indexes that has to be removed.</param>
			var data = {
				action: "delete",
				viewName: this.name,
				index: indexes
			};
			MobileCRM.bridge.command("detailViewAction", JSON.stringify(data));
		};
		MobileCRM.UI._DetailView.prototype.startEditItem = function (index) {
			/// <summary>[v9.2] Starts editing the detail item and sets the focus on it.</summary>
			/// <param name="index" type="Number">Selected item index.</param>
			if (index < 0) {
				MobileCRM.bridge.alert("Index must not be negative.");
				return;
			}
			var data = {
				action: "startEditItem",
				viewName: this.name,
				index: index
			};
			MobileCRM.bridge.command("detailViewAction", JSON.stringify(data));
		};
		MobileCRM.UI._DetailView.prototype.updateComboItemDataSource = function (index, listDataSource, defaultValue) {
			/// <summary>[v9.1] Changes the data source for CombobBoxitem <see cref="MobileCRM.UI.DetailViewItems.Item">MobileCRM.UI.DetailViewItems.ComboBoxItem</see>.</summary>
			/// <param name="index" type="Number">Item index on the view.</param>
			/// <param name="listDataSource" type="Object">The data source object (e.g. {&quot;label1&quot;:1, &quot;label2&quot;:2}).</param>
			/// <param name="defaultValue" type="String">New data source default value. If not defined, the first item from listDataSource will be used.</param>
			var data = {
				action: "updateDataSource",
				viewName: this.name,
				index: index,
				listDataSource: listDataSource
			};

			this.items[index].value = defaultValue !== undefined ? defaultValue : listDataSource[Object.keys(listDataSource)[0]];
			MobileCRM.bridge.command("detailViewAction", JSON.stringify(data));
		};
		MobileCRM.UI._DetailView.prototype.registerClickHandler = function (item, callback, scope) {
			/// <summary>[v8.0] Installs the handler which has to be called when user clicks on the link item.</summary>
			/// <param name="item" type="MobileCRM.UI.DetailViewItems.LinkItem">An item</param>
			/// <param name="callback" type="function(String, String)">A callback which is called when user clicks on the link item. It obtains the link item name and the detail view name as arguments.</param>
			/// <param name="scope" type="Object">A scope, in which the callback has to be called.</param>
			if (!MobileCRM.UI._DetailView._handlers) {
				MobileCRM.UI._DetailView._handlers = [];
			}
			var handlers = MobileCRM.UI._DetailView._handlers;
			var index = this.name + "." + item.name;
			handlers[index] = { handler: callback, scope: scope };
		};
		MobileCRM.UI._DetailView._callHandler = function (viewName, itemName) {
			var index = viewName + "." + itemName;
			var handlerDescriptor = MobileCRM.UI._DetailView._handlers[index];
			if (handlerDescriptor && handlerDescriptor.handler) {
				if (handlerDescriptor.scope)
					handlerDescriptor.handler.apply(handlerDescriptor.scope, itemName, viewName);
				else
					handlerDescriptor.handler(itemName, viewName);
			}
		};
		_inherit(MobileCRM.UI.DetailViewItems.SeparatorItem, MobileCRM.UI.DetailViewItems.Item);
		_inherit(MobileCRM.UI.DetailViewItems.TextBoxItem, MobileCRM.UI.DetailViewItems.Item);
		_inherit(MobileCRM.UI.DetailViewItems.NumericItem, MobileCRM.UI.DetailViewItems.Item);
		_inherit(MobileCRM.UI.DetailViewItems.CheckBoxItem, MobileCRM.UI.DetailViewItems.Item);
		_inherit(MobileCRM.UI.DetailViewItems.DateTimeItem, MobileCRM.UI.DetailViewItems.Item);
		_inherit(MobileCRM.UI.DetailViewItems.DurationItem, MobileCRM.UI.DetailViewItems.Item);
		_inherit(MobileCRM.UI.DetailViewItems.ComboBoxItem, MobileCRM.UI.DetailViewItems.Item);
		_inherit(MobileCRM.UI.DetailViewItems.LinkItem, MobileCRM.UI.DetailViewItems.Item);

		// MobileCRM.UI.ViewController
		MobileCRM.UI.ViewController.createCommand = function (primary, labels, callback, scope) {
			/// <summary>Overrides the form's primary/secondary command button.</summary>
			/// <param name="primary" type="Boolean">true, for primary button; false, for secondary button.</param>
			/// <param name="labels" type="Array/String">An array of labels or single label.</param>
			/// <param name="callback" type="Function">A callback which is called when command is launched.</param>
			/// <param name="scope" type="Object">A scope, in which the callback has to be called.</param>
			var cmdId = MobileCRM.bridge._createCmdObject(callback, null, scope);
			if (typeof labels == "string")
				labels = [labels];
			MobileCRM.bridge.command("createCommand", JSON.stringify({ commandId: cmdId, primary: primary, labels: labels }));
		};

		// MobileCRM.UI.ProcessController
		_inherit(MobileCRM.UI.ProcessController, MobileCRM.ObservableObject);

		MobileCRM.UI.ProcessController.prototype.changeProcess = function (processRef, errorCallback, scope) {
			/// <summary>[v8.2] Changes (or clears) the business process flow for the current entity.</summary>
			/// <param name="processRef" type="MobileCRM.Reference">A reference to the workflow entity defining the process to use, or null to disable BusinessProcessFlow.</param>
			/// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called asynchronously in case of error.</param>
			/// <param name="scope" type="Object">The scope for callback.</param>
	        var controller = MobileCRM.bridge.exposeObjectAsync("EntityForm.GetController", [this.view.name]);
	        controller.invokeMethodAsync("ChangeProcessTo", [processRef], function () { }, errorCallback, scope);
	        controller.release();
		};
		
		// MobileCRM.UI.ViewDefinition
		MobileCRM.UI.ViewDefinition.loadEntityViews = function (entityName, callback, errorCallback, scope) {
			/// <summary>Asynchronously loads all view definitions for given entity.</summary>
			/// <param name="entityName" type="String">The entity name.</param>
			/// <param name="callback" type="function(viewDefArray)">The callback function which is called asynchronously. Callback will obtain an array of ViewDefinition objects.</param>
			/// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called asynchronously in case of error.</param>
			/// <param name="scope" type="Object">The scope for callbacks.</param>
			MobileCRM.bridge.invokeStaticMethodAsync("MobileCrm.UI", "MobileCrm.UI.ViewParser", "LoadListViews", [entityName], callback, errorCallback, scope);
		};

		// MobileCRM.UI.MessageBox
		MobileCRM.UI.MessageBox.prototype.show = function (success, failed, scope) {
			/// <summary>Shows a popup window which allows the user to choose one of the actions.</summary>
			/// <param name="success" type="function(obj)">The callback function that is called with chosen item string.</param>
			/// <param name="failed" type="function(errorMsg)">The errorCallback which is called asynchronously in case of error.</param>
			/// <param name="scope" type="Object">The scope for callbacks.</param>
			MobileCRM.bridge.command("messageBox", JSON.stringify(this), success, failed, scope);
		};

	    // MobileCRM.UI.LookupForm
		MobileCRM.UI.LookupForm.prototype.addView = function (entityName, viewName, isDefault) {
		    /// <summary>Appends an entity view to the list of allowed views.</summary>
		    /// <param name="entityName" type="string">Entity logical name.</param>
		    /// <param name="viewName" type="string">A name of the view.</param>
		    /// <param name="isDefault" type="Boolean">true, if the view should be set as default.</param>
		    this._views.push({
		    	entity: entityName, view: viewName, isDefault: isDefault
		    });
		};
		MobileCRM.UI.LookupForm.prototype.addEntityFilter = function (entityName, filterXml) {
		    /// <summary>Defines a fetch XML filter for entity records.</summary>
		    /// <param name="entityName" type="string">Entity logical name.</param>
			/// <param name="filterXml" type="string">A string defining the fetch XML which has to be applied as filter for entity records.</param>
			if (!this._filters)
				this._filters = {};
			this._filters[entityName] = filterXml;
		};
		MobileCRM.UI.LookupForm.prototype.show = function (success, failed, scope) {
			/// <summary>Shows a dialog which allows the user to select an entity from a configurable list of entity types.</summary>
			/// <param name="success" type="function(obj)">The callback function that is called with chosen <see cref="MobileCRM.Reference">MobileCRM.Reference</see> object.</param>
			/// <param name="failed" type="function(errorMsg)">The errorCallback which is called asynchronously in case of error.</param>
			/// <param name="scope" type="Object">The scope for callbacks.</param>
			MobileCRM.bridge.command("lookupForm", JSON.stringify(this._constructParams()), success, failed, scope);
		};
		MobileCRM.UI.LookupForm.prototype._constructParams = function () {
			var _escape = function (st) {
				var xml_special_to_escaped_one_map = { '<': '&lt;', '>': '&gt;' };
				return st.replace(/([<>])/g, function (str, item) {
					return xml_special_to_escaped_one_map[item];
				});
			};

			var obsoleteViews, obsoleteFilters;
			if (this.allowedViews) {
				// Decide whether the obsolete prop contains a filter or a view list
				if (this.allowedViews[0] == "<")
					obsoleteFilters = this.allowedViews;
				else
					obsoleteViews = this.allowedViews;
			}

			var firstOne = true;
			var xml = "<extra><views>";
			if (this._views.length > 0) {
				for (var i in this._views) {
					var view = this._views[i];
					var entityName = view.entity;
					if (this.entities.indexOf(entityName) < 0)
						this.entities.push(entityName);

					if (firstOne)
						firstOne = false;
					else
						xml += ":";

					xml += _escape(entityName + (view.isDefault ? ".@" : ".") + view.view);
				}
			}
			if (obsoleteViews) {
				if (!firstOne)
					xml += ":";
				xml += _escape(this.allowedViews);
			}
			xml += "</views>";

			if (this._filters) {
				for (var entity in this._filters) {
					var filter = this._filters[entity];
					xml += "<filter entity='" + entity + "'>" + _escape(filter) + "</filter>";
				}
			}
			else if (obsoleteFilters && this.entities.length > 0)
				xml += "<filter entity='" + this.entities[0] + "'>" + _escape(obsoleteFilters) + "</filter>";

			xml += "</extra>";
			return { entities: this.entities, source: this.source, prevSelection: this.prevSelection, allowedViews: xml, allowNull: this.allowNull };
		};

	    // MobileCRM.UI.MultiLookupForm
		_inherit(MobileCRM.UI.MultiLookupForm, MobileCRM.UI.LookupForm);
		MobileCRM.UI.MultiLookupForm.prototype.show = function (success, failed, scope) {
			/// <summary>Shows a dialog which allows the user to select a list of entities from a configurable list of entity types.</summary>
			/// <param name="success" type="function(obj)">The callback function that is called with chosen array of <see cref="MobileCRM.Reference">MobileCRM.Reference</see> objects.</param>
			/// <param name="failed" type="function(errorMsg)">The errorCallback which is called asynchronously in case of error.</param>
			/// <param name="scope" type="Object">The scope for callbacks.</param>
			var params = this._constructParams();
			params.dataSource = this.dataSource;
			MobileCRM.bridge.command("multiLookupForm", JSON.stringify(params), success, failed, scope);
		};

		// MobileCRM.UI.Form
		_inherit(MobileCRM.UI.Form, MobileCRM.ObservableObject);
		MobileCRM.UI.Form.requestObject = function (callback, errorCallback, scope) {
			/// <summary>[v8.0] Requests the currently opened Form object.</summary>
			/// <remarks>Method initiates an asynchronous request which either ends with calling the <b>errorCallback</b> or with calling the <b>callback</b> with Javascript version of Form object. See <see cref="MobileCRM.Bridge.requestObject">MobileCRM.Bridge.requestObject</see> for further details.</remarks>
			/// <param name="callback" type="function(form)">The callback function that is called asynchronously with serialized Form object as argument. Callback should return true to apply changed properties.</param>
			/// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
			/// <param name="scope" type="Object">The scope for callbacks.</param>
			MobileCRM.bridge.requestObject("Form", function (obj) {
				if (callback.call(scope, obj) != false) {
					var changed = obj.getChanged();
					return changed;
				}
				return '';
			}, errorCallback, scope);
		};

		MobileCRM.UI.Form.showPleaseWait = function (caption) {
			/// <summary>Shows a please wait message, disabling the form except for the close command.</summary>
			/// <param name="caption" type="String">Wait message.</param>
			/// <returns type="Object">An object representing the UI component with single method &quot;close&quot;.</returns>
			var obj = MobileCRM.bridge.exposeObjectAsync("Form.ShowPleaseWait", [caption]);
			return {
				close: function () {
					obj.invokeMethodAsync("Dispose", []);
					obj.release();
				}
			};
		};

		// MobileCRM.UI.HomeForm
		_inherit(MobileCRM.UI.HomeForm, MobileCRM.ObservableObject);
		MobileCRM.UI.HomeForm.requestObject = function (callback, errorCallback, scope) {
			/// <summary>[v8.0] Requests the managed HomeForm object.</summary>
			/// <remarks>Method initiates an asynchronous request which either ends with calling the <b>errorCallback</b> or with calling the <b>callback</b> with Javascript version of HomeForm object. See <see cref="MobileCRM.Bridge.requestObject">MobileCRM.Bridge.requestObject</see> for further details.</remarks>
			/// <param name="callback" type="function(homeForm)">The callback function that is called asynchronously with serialized HomeForm object as argument. Callback should return true to apply changed properties.</param>
			/// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
			/// <param name="scope" type="Object">The scope for callbacks.</param>
			MobileCRM.bridge.requestObject("HomeForm", function (obj) {
				obj.lastSyncResult = new MobileCRM.Services.SynchronizationResult(obj.lastSyncResult);
				delete obj._privChanged.lastSyncResult;
				if (callback.call(scope, obj) != false) {
					var changed = obj.getChanged();
					return changed;
				}
				return '';
			}, errorCallback, scope);
		};

		MobileCRM.UI.HomeForm.openHomeItemAsync = function (name, errorCallback, scope) {
			/// <summary>[v8.0] Opens the specified HomeItem.</summary>
			/// <param name="name" type="String">The name of the HomeItem to be opened. It can be either the entity logical name (e.g. &quot;contact&quot;) or one of following special forms names: &quot;@Dashboard&quot;, &quot;@Map&quot;, &quot;activity&quot;, &quot;@Tourplan&quot;,&quot;@CallImport&quot;,&quot;@Setup&quot;,&quot;@About&quot;.</param>
			/// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
			/// <param name="scope" type="Object">The scope for callbacks.</param>
			MobileCRM.bridge.invokeStaticMethodAsync("MobileCrm", "MobileCrm.Controllers.HomeForm", "Instance.ShowHomeItemByName", [name], null, errorCallback, scope);
		};
		MobileCRM.UI.HomeForm.closeHomeItemAsync = function (name, errorCallback, scope) {
			/// <summary>[v8.0] Close the specified HomeItem.</summary>
			/// <param name="name" type="String">The name of the HomeItem to be opened. It can be either the entity logical name (e.g. &quot;contact&quot;) or one of following special forms names: &quot;@Dashboard&quot;, &quot;@Map&quot;, &quot;@activity&quot;, &quot;@Tourplan&quot;,&quot;@CallImport&quot;,&quot;@Setup&quot;,&quot;@About&quot;.</param>
			/// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
			/// <param name="scope" type="Object">The scope for callbacks.</param>
			MobileCRM.UI.HomeForm.requestObject(function (homeForm) {
				for (var i in homeForm.items) {
					var item = homeForm.items[i];
					if (item.name == name) {
						var item = MobileCRM.bridge.exposeObjectAsync("HomeForm.Items.get_Item", [i]);
						item.invokeMethodAsync("CloseForm", [], null, errorCallback, scope);
						item.release();
						return;
					}
				}
			}, errorCallback, scope);
		};
		MobileCRM.UI.HomeForm.closeForms = function (callback, errorCallback, scope) {
			/// <summary>[v8.0] Close all opened forms.</summary>
			/// <param name="callback" type="function()">The callback function that is called asynchronously after forms were closed sucesfully.</param>
			/// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
			/// <param name="scope" type="Object">The scope for callbacks.</param>
				MobileCRM.bridge.invokeMethodAsync("HomeForm", "TryCloseForms", [false], function () {
					callback.call(scope);
				}, errorCallback, scope);
		}
		MobileCRM.UI.HomeForm.hideUIReplacement = function () {
			/// <summary>[v8.0] Hides the UI replacement iframe and shows the classic home form.</summary>
			MobileCRM.bridge.invokeMethodAsync("HomeForm", "HideUIReplacement", []);
		};

		MobileCRM.UI.HomeForm._syncFinishedCallbacks = [];

		MobileCRM.UI.HomeForm.onSyncFinished = function (handler, scope) {
			/// <summary>[v8.1] Binds the new handler to the synchronization finish event.</summary>
			/// <param name="handler" type="function(homeForm)">A function which will be called when the synchronization finished event occurs with current instance of the MobileCRM.UI.HomeForm as parameter.</param>
			/// <param name="scope" type="Object">A scope in which the handler should be called.</param>
			_bindHandler(handler, MobileCRM.UI.HomeForm._syncFinishedCallbacks, true, scope);
		};
		MobileCRM.UI.HomeForm._raiseSyncFinished = function (homeForm) {
			var handlers = MobileCRM.UI.HomeForm._syncFinishedCallbacks;
			if (handlers && handlers.length > 0) {
				var result = '';
				homeForm.lastSyncResult = new MobileCRM.Services.SynchronizationResult(homeForm.lastSyncResult);
				delete homeForm._privChanged.lastSyncResult;
				if (_callHandlers(handlers, homeForm) != false) {
					var changed = homeForm.getChanged();
					result = JSON.stringify(changed);
				}
				return result;
			}
		}
		
		// MobileCRM.UI.ReportForm
		MobileCRM.UI.ReportForm.prototype.show = function (success, failed, scope) {
			/// <summary>Shows the Dynamics CRM report form.</summary>
			/// <param name="success" type="function(obj)">The callback function that is called if the report form was successfully opened.</param>
			/// <param name="failed" type="function(errorMsg)">The errorCallback which is called asynchronously in case of error.</param>
			/// <param name="scope" type="Object">The scope for callbacks.</param>
			var params = { allowedReportIds: this.allowedReportIds, allowedLanguages: this.allowedLanguages, defaultReport: this.defaultReport };
			MobileCRM.bridge.command("showReport", JSON.stringify(params), success, failed, scope);
		};
		MobileCRM.MobileReport.runReport = function (fetch, reportXML, reportFormat, isExportOnly, isOnline, outputFile, success, failed, scope) {
			/// <summary>[v9.1] Executes the mobile reporting request which produces the mobile report document of given format.</summary>
			/// <param name="fetch" type="String">The fetch XML defining the entity (entities) query used as report input.</param>
			/// <param name="reportXML" type="String">The mobile report XML definition which can be loaded from the resco_report entity or constructed dynamically. Ignored if IsExportOnly parameter is true.</param>
			/// <param name="reportFormat" type="String">Report format: Pdf (default), Html, Excel, Text.</param>
			/// <param name="isExportOnly" type="Boolean">If true then ReportXml is optional. The default is false.</param>
			/// <param name="isOnline" type="Boolean">Indicates whether the report should be run against the online data or local database. The default is current application mode.</param>
			/// <param name="outputFile" type="String">The full path to the output file. If omitted a temp file is created. The output path is always passed to the success callback.</param>
			/// <param name="success" type="function(obj)">A callback function that is called with the file path to successfully created report.</param>
			/// <param name="failed" type="function(errorMsg)">A callback which is called in case of error.</param>
			/// <param name="scope" type="Object">The scope for callbacks.</param>

			var params = { SourceFetch: fetch, ReportFormat: reportFormat || "Pdf", IsExportOnly: isExportOnly, IsOnline: isOnline };
			if (reportXML)
				params.ReportXml = reportXML;
			if (outputFile)
				params.OutputFile = outputFile;

			MobileCRM.bridge.command("runMobileReportAsync", JSON.stringify(params), success, failed, scope);
		}
		// MobileCRM.UI.IFrameForm
		_inherit(MobileCRM.UI.IFrameForm, MobileCRM.ObservableObject);

		MobileCRM.UI.IFrameForm.showModal = function (caption, url, options) {
			/// <summary>Shows a new iFrame form in modal window.</summary>
			/// <param name="caption" type="String">Defines the form caption.</param>
			/// <param name="url" type="String">Defines the URL of the HTML document.</param>
			/// <param name="options" type="Object">Generic object passed to the new iFrame.</param>
			MobileCRM.bridge.command("showIFrame", JSON.stringify({
				caption: caption, url: url, modal: true, options: options
			}));
		};

		MobileCRM.UI.IFrameForm.show = function (caption, url, maximized, options) {
			/// <summary>Shows a new iFrame form.</summary>
			/// <param name="caption" type="String">Defines the form caption.</param>
			/// <param name="url" type="String">Defines the URL of the HTML document.</param>
			/// <param name="maximized" type="Boolean">Indicates whether the new form should be maximized.</param>
			/// <param name="options" type="Object">Generic object passed to the new iFrame (see <see cref="MobileCRM.UI.IFrameForm.requestObject">MobileCRM.UI.IFrameForm.requestObject</see>).</param>
			MobileCRM.bridge.command("showIFrame", JSON.stringify({
				caption: caption, url: url, modal: false, maximized: maximized, options: options
			}));
		};

		MobileCRM.UI.IFrameForm.requestObject = function (callback, errorCallback, scope) {
			/// <summary>[v9.0] Asynchronously requests the IFrameForm object.</summary>
			/// <remarks>Method initiates an asynchronous request which either ends with calling the <b>errorCallback</b> or with calling the <b>callback</b> with Javascript version of IFrameForm object. See <see cref="MobileCRM.Bridge.requestObject">MobileCRM.Bridge.requestObject</see> for further details.</remarks>
			/// <param name="callback" type="function(iFrameForm)">The callback function that is called asynchronously with serialized <see cref="MobileCRM.UI.IFrameForm">MobileCRM.UI.IFrameForm</see> object as argument. Callback should return true to apply changed properties.</param>
			/// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
			/// <param name="scope" type="Object">The scope for callbacks.</param>
			MobileCRM.bridge.requestObject("IFrameForm", function (obj) {
				if (callback.call(scope, obj) != false) {
					var changed = obj.getChanged();
					return changed;
				}
				return '';
			}, errorCallback, scope);
		};

		// MobileCRM.UI.EntityList
		_inherit(MobileCRM.UI.EntityList, MobileCRM.ObservableObject);
		MobileCRM.UI.EntityList._handlers = { onCanExecute: [], onCommand: [] };
		MobileCRM.UI.EntityList._callHandlers = function (event, data, context) {
			var handlers = MobileCRM.UI.EntityList._handlers[event];
			if (handlers && handlers.length > 0) {
				data.context = context;
				data._inCallback = true;
				var result = '';
				if (_callHandlers(handlers, data) != false) {
					var changed = data.getChanged();
					result = JSON.stringify(changed);
				}
				data._inCallback = false;
				return result;
			}
		}
		MobileCRM.UI.EntityList.requestObject = function (callback, errorCallback, scope) {
			/// <summary>Requests the EntityList object.</summary>
			/// <remarks>Method initiates an asynchronous request which either ends with calling the <b>errorCallback</b> or with calling the <b>callback</b> with Javascript version of EntityList object. See <see cref="MobileCRM.Bridge.requestObject">MobileCRM.Bridge.requestObject</see> for further details.</remarks>
			/// <param name="callback" type="function(entityList)">The callback function that is called asynchronously with serialized EntityList object as argument See <see cref="MobileCRM.UI.EntityList">MobileCRM.UI.EntityList</see> for further details.</remarks>. Callback should return true to apply changed properties.</param>
			/// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
			/// <param name="scope" type="Object">The scope for callbacks.</param>
			MobileCRM.bridge.requestObject("EntityList", function (obj) {
				if (callback.call(scope, obj) != false) {
					var changed = obj.getChanged();
					return changed;
				}
				return '';
			}, errorCallback, scope);
		};
		MobileCRM.UI.EntityList.selectView = function (viewName) {
			/// <summary>Selects specified EntityList view.</summary>
			/// <remark>Selecting different entity view causes loading the iFrame related to that view (if the view has one). Currently loaded EntityList iFrame will be unloaded and it should not perform any further asynchronous actions.</remark>
			/// <param name="viewName" type="String">The name of the entity view which has to be selected.</param>
			var viewFilter = MobileCRM.bridge.exposeObjectAsync("EntityList.FilterGroup.get_Item", ["View"]);
			viewFilter.invokeMethodAsync("SetSelection", [viewName, false]);
			viewFilter.release();
			MobileCRM.UI.EntityList.reload();
		};
		MobileCRM.UI.EntityList.onCommand = function (command, handler, bind, scope) {
			/// <summary>Binds or unbinds the handler for EntityList command.</summary>
			/// <param name="command" type="String">The name of the EntityList command.</param>
			/// <param name="handler" type="function(entityList)">The handler function that has to be bound or unbound.</param>
			/// <param name="bind" type="Boolean">Determines whether to bind or unbind the handler.</param>
			/// <param name="scope" type="Object">The scope for handler calls.</param>
			var handlers = MobileCRM.UI.EntityList._handlers[command];
			if (!handlers)
				handlers = MobileCRM.UI.EntityList._handlers[command] = [];
			_bindHandler(handler, handlers, bind, scope);
			var action = ((bind == false && handlers.length == 0) ? "cmdDel" : "cmd");
			MobileCRM.bridge.command("registerListEvents", action + ":" + command);
		};
		MobileCRM.UI.EntityList.runCommand = function (commandName, parameter, errorCallback, scope) {
			/// <summary>Executes the list/button command attached to this entity list.</summary>
			/// <param name="commandName" type="String">A name of the command. It can be either custom command or one of following predefined commands: </param>
			/// <param name="parameter" type="Number">A command parameter (e.g. the status code value for ChangeStatus command).</param>
			MobileCRM.bridge.invokeMethodAsync("EntityList", "RunCommand", [commandName, parameter], null, errorCallback, scope);
		};
		MobileCRM.UI.EntityList.reload = function () {
			/// <summary>Initiates asynchronous entity list reload.</summary>
			MobileCRM.bridge.invokeMethodAsync("EntityList", "Reload", []);
		}
		MobileCRM.UI.EntityList.setPrimaryCommand = function (labels, callback, scope) {
			/// <summary>Overrides the entity list&apos;s primary command button.</summary>
			/// <param name="labels" type="Array/String">An array of labels or single label (e.g. &quot;New&quot;).</param>
			/// <param name="callback" type="Function">A callback which is called when command is launched.</param>
			/// <param name="scope" type="Object">A scope, in which the callback has to be called.</param>
			MobileCRM.UI.ViewController.createCommand(true, labels, callback, scope);
		};
		MobileCRM.UI.EntityList.setDataSource = function (dataSource) {
			/// <summary>Sets the entity list data source replacement.</summary>
			/// <remarks><p>Data source must be set during the document load stage and must not be delayed.</p><p>It is used only if the entity view iFrame is marked as data source provider in Woodford.</p></remarks>
			/// <param name="dataSource" type="MobileCRM.UI.ListDataSource">A data source object implementing the DynamicEntity list loading routine.</param>
			MobileCRM.UI.EntityList._dataSource = dataSource;
		};
		MobileCRM.UI.EntityList._initDataSource = function (chunkReadyCmdId, fetch) {
			var result = {};
			var dataSource = MobileCRM.UI.EntityList._dataSource;
			if (dataSource) {
				dataSource._chunkReadyCmdId = chunkReadyCmdId;
				dataSource.fetch = fetch;
				result = {
					chunkSize: dataSource.chunkSize || 50
				};
			}
			return JSON.stringify(result);
		};
		MobileCRM.UI.EntityList._loadNextChunk = function (page, count) {
			var ds = MobileCRM.UI.EntityList._dataSource;
			if (ds && typeof ds.loadNextChunk == "function") {
				try {
					var fetch = ds.fetch;
					fetch.page = page;
					fetch.count = count;
					ds.loadNextChunk(page, count);
					return "OK";
				} catch (e) {
					return e.message;
				}
			}
			return "Invalid ListDataSource";
		};

		MobileCRM.UI.ListDataSource = function () {
			/// <summary>The data source loading routine implementation.</summary>
			/// <remarks><p>An instance of this object can be used to supply the data source for <see cref="MobileCRM.UI.EntityList.setDataSource">MobileCRM.UI.EntityList.setDataSource</see> function.</p><p>The instance of this object is valid only if the method loadNextChunk is implemented. See example <see cref="MobileCRM.UI.EntityList.setDataSource">here</see>.</p></remarks>
			/// <field name="chunkSize" type="Number">Controls the number of entities loaded in once.</field>
			/// <field name="fetch" type="MobileCRM.FetchXml.Fetch">Gets the original fetch request for this list view.</field>
			/// <field name="loadNextChunk" type="function(page, count)">Controls the number of entities loaded in once. It is called from native code to get chunk (array) of <see cref="MobileCRM.DynamicEntity">DynamicEntities</see>. The chunk is defined by 1-based page number and the desired count which corresponds to the value of chunkSize property.</field>
			this.chunkSize = 50;
			this.fetch = null;
			this.loadNextChunk = null;
			this._chunkReadyCmdId = null;
		};
		MobileCRM.UI.ListDataSource.prototype.chunkReady = function (entities) {
			/// <summary>This method has to be called from within the &quot;loadNextChunk&quot; routine when it loads chunk (array) of <see cref="MobileCRM.DynamicEntity">DynamicEntities</see>.</summary>
			/// <remarks>Data source enumeration ends when the chunkReady method is called with empty array (no more records are available).</remarks>
			/// <param name="entities" type="Array[MobileCRM.DynamicEntity]">A chunk (array) of <see cref="MobileCRM.DynamicEntity">DynamicEntities</see> that has to be passed back to the native code to fill in to the list view.</param>
			MobileCRM.bridge.command(this._chunkReadyCmdId, JSON.stringify(entities));
		};

		// MobileCRM.UI.EntityForm
		_inherit(MobileCRM.UI.EntityForm, MobileCRM.ObservableObject);
		MobileCRM.UI.EntityForm._handlers = { onChange: [], onSave: [], onPostSave: [], onDetailCollectionChange: [], onSelectedViewChanged: [] };

		MobileCRM.UI.EntityForm.prototype.getDetailView = function (name) {
			/// <summary>Returns the DetailView by its name.</summary>
			/// <param name="name" type="String">A name of DetailView.</param>
			/// <returns type="MobileCRM.UI._DetailView">A <see cref="MobileCRM.UI._DetailView">MobileCRM.UI._DetailView</see> object with requested name.</returns>
			var detailViews = this.detailViews;
			if (detailViews) {
				var nItems = detailViews.length;
				for (var i = 0; i < nItems; i++) {
					var item = detailViews[i];
					if (item.name == name)
						return item;
				}
			}
			return undefined;
		};

		MobileCRM.UI.EntityForm.prototype.getController = function (name) {
			/// <summary>Returns the tab controller by its view name.</summary>
			/// <param name="name" type="String">A name of controller&apos;s view.</param>
			/// <returns type="MobileCRM.UI._Controller">A <see cref="MobileCRM.UI._Controller">MobileCRM.UI._Controller</see> object with requested view name.</returns>
			var controllers = this.controllers;
			if (controllers) {
				var nItems = controllers.length;
				for (var i = 0; i < nItems; i++) {
					var item = controllers[i];
					if (item.view && item.view.name == name)
						return item;
				}
			}
			return undefined;
		};

		MobileCRM.UI.EntityForm.prototype.updateAddressFields = function (latitude, longitude) {
		    /// <summary>Sets the address fields according to the current geo-location from platform-specific location service.</summary>
		    /// <param name="latitude" type="Number">The latitude from geo-location from platform-specific location service </param>
			/// <param name="longitude" type="Number">longitude from geo-location from platform-specific location service</param>
		        var detailViewController = MobileCRM.bridge.exposeObjectAsync("EntityForm.Controllers.get_Item", [0]);

		        detailViewController.invokeMethodAsync("UpdateAddress", [latitude, longitude]);
		        detailViewController.release();
		};

		MobileCRM.UI.EntityForm.prototype.cancelValidation = function (errorMsg) {
			/// <summary>Stops the onSave validation and optionally causes an error message to be displayed.</summary>
		    /// <param name="errorMsg" type="String">An error message to be displayed or &quot;null&quot; to cancel the validation without message.</param>
			this.context.errorMessage = errorMsg || "";
		};

		MobileCRM.UI.EntityForm.prototype.selectTab = function (tabName, errorCallback, scope) {
			/// <summary>[v8.0] Selects the form tab by its name.</summary>
			/// <param name="tabName" type="String">The name of the tab.</param>
			/// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called asynchronously in case of error.</param>
			/// <param name="scope" type="Object">The scope for callback.</param>
			MobileCRM.bridge.invokeMethodAsync("EntityForm", "FindView", [tabName], function (index) {
				if (index < 0) {
					if (errorCallback)
						errorCallback.call(scope, tabName + " view not found");
				}
				else
					MobileCRM.bridge.invokeMethodAsync("EntityForm", "Form.set_SelectedViewIndex", [index], function () { }, errorCallback, scope);
			}, errorCallback, scope);
		};

		MobileCRM.UI.EntityForm.prototype.selectView = function (tabName, viewName) {
		    /// <summary>Selects the associated entity list view by its name.</summary>
		    /// <param name="tabName" type="String">The name of the associated entity list tab.</param>
		    /// <param name="viewName" type="String">The view name.</param>
			/// <returns type="Boolean">true, if the view selection was initiated; false, if tab was not found.</returns>
			var controllers = this.controllers;
			for (var i = 0; i < controllers.length; i++) {
				var controller = controllers[i];
				var view = controller.view;
				if (view && view.name == tabName) {
					var list = MobileCRM.bridge.exposeObjectAsync("EntityForm.Controllers.get_Item", [i]);
					// Expose the filter item for key 'View'
					var viewFilter = list.exposeObjectAsync("List.FilterGroup.get_Item", ["View"]);
					// Select desired view in filter item
					viewFilter.invokeMethodAsync("SetSelection", [viewName, false]);
					// release exposed filter item
					viewFilter.release();
					// reload the ListView - in our case the list is contained in the FlipController, thus we need to access it via 'List' property
					list.invokeMethodAsync("List.Reload", []);
					// release exposed controller
					list.release();
					return true;
				}
			}
			var assocViews = this.associatedViews;
			for (var i = 0; i < assocViews.length; i++) {
				var assocView = assocViews[i];
				var view = assocView.listView;
				if (view && view.name == tabName) {
					var list = MobileCRM.bridge.exposeObjectAsync("EntityForm.AssociatedViews.get_Item", [i]);
					// Expose the filter item for key 'View'
					var viewFilter = list.exposeObjectAsync("FilterGroup.get_Item", ["View"]);
					// Select desired view in filter item
					viewFilter.invokeMethodAsync("SetSelection", [viewName, false]);
					// release exposed filter item
					viewFilter.release();
					// reload the ListView - in our case the list is contained in the FlipController, thus we need to access it via 'List' property
					list.invokeMethodAsync("Reload", []);
					// release exposed controller
					list.release();
					return true;
				}
			}
			return false;
		};

		MobileCRM.UI.EntityForm.prototype.setTabVisibility = function (tabName, visible) {
			/// <summary>Sets the visibility of the form tab defined by its name.</summary>
			/// <param name="tabName" type="String">The name of the tab</param>
			/// <param name="visible" type="Boolean">Defines desired visbility state.</param>
			/// <returns type="Boolean">true, if the visibility change was initiated; false, if tab was not found.</returns>
			var controllers = this.controllers;
			for (var i = 0; i < controllers.length; i++) {
				var controller = controllers[i];
				var view = controller.view;
				if (view && view.name == tabName) {
					view.isVisible = visible;
					if (controller.hasOwnProperty("isLoaded") && controller.isLoaded === false)
						controller.isLoaded = true;
					return true;
				}
			}
			var assocViews = this.associatedViews;
			for (var i = 0; i < assocViews.length; i++) {
				var assocView = assocViews[i];
				var view = assocView.listView;
				if (view && view.name == tabName) {
					view.isVisible = visible;
					return true;
				}
			}
			var detailViews = this.detailViews;
			for (var i = 0; i < detailViews.length; i++) {
				var detailView = detailViews[i];
				if (detailView.name == tabName) {
					detailView.isVisible = visible;
					return true;
				}
			}
			return false;
		};

		MobileCRM.UI.EntityForm.prototype.getMediaTab = function (name) {
			/// <summary>Gets the MediaTab object representing the media tab with given name.</summary>
			/// <returns type="MobileCRM.UI.MediaTab">A MobileCRM.UI.MediaTab object representing the media tab, or &quot;null&quot;, if the tab was not found.</returns>
			var controllers = this.controllers;
			for (var i = 0; i < controllers.length; i++) {
				var controller = controllers[i];
				var view = controller.view;
				if (view && view.name == name) {
					if (controller.hasOwnProperty("isLoaded") && controller.isLoaded === false)
						controller.isLoaded = true;
					return new MobileCRM.UI.MediaTab(i, name);
				}
			}
			return null;
		};
	    

		var _pendingSaveId = 0;
		MobileCRM.UI.EntityForm.prototype.suspendSave = function () {
			/// <summary>Suspends current &quot;onSave&quot; validation and allows performing another asynchronous tasks to determine the validation result</summary>
			/// <returns type="Object">A request object with single function &quot;resumeSave&quot; which has to be called with the validation result (either error message string or &quot;null&quot; in case of success).</returns>
			var cmdId = "EntityFormPendingValidation" + (++_pendingSaveId);
			var entityForm = this;
			entityForm.context.pendingSaveCommand = cmdId;
			return {
				resumeSave: function (result) {
					if (entityForm._inCallback) {
						// still in "onSave" callback - do not send a command (handler not installed yet)
						entityForm.context.errorMessage = result;
						entityForm.context.pendingSaveCommand = null;
					}
					else
						MobileCRM.bridge.command(cmdId, result);
				}
			};
		};
		MobileCRM.UI.EntityForm.onSave = function (handler, bind, scope) {
			/// <summary>Binds or unbinds the handler for onSave event on EntityForm.</summary>
			/// <param name="handler" type="function(entityForm)">The handler function that has to be bound or unbound.</param>
			/// <param name="bind" type="Boolean">Determines whether to bind or unbind the handler.</param>
			/// <param name="scope" type="Object">The scope for handler calls.</param>
			var handlers = MobileCRM.UI.EntityForm._handlers.onSave;
			var register = handlers.length == 0;
			_bindHandler(handler, handlers, bind, scope);
			if (register)
				MobileCRM.bridge.command("registerEvents", "onSave");
		}
		MobileCRM.UI.EntityForm.onChange = function (handler, bind, scope) {
			/// <summary>Binds or unbinds the handler for onChange event on EntityForm.</summary>
			/// <param name="handler" type="function(entityForm)">The handler function that has to be bound or unbound.</param>
			/// <param name="bind" type="Boolean">Determines whether to bind or unbind the handler.</param>
			/// <param name="scope" type="Object">The scope for handler calls.</param>
			var handlers = MobileCRM.UI.EntityForm._handlers.onChange;
			var register = handlers.length == 0;
			_bindHandler(handler, handlers, bind, scope);
			if (register)
				MobileCRM.bridge.command("registerEvents", "onChange");
		}
		MobileCRM.UI.EntityForm.onPostSave = function (handler, bind, scope) {
			/// <summary>[v8.2] Binds or unbinds the handler for onPostSave event on EntityForm.</summary>
			/// <param name="handler" type="function(entityForm)">The handler function that has to be bound or unbound.</param>
			/// <param name="bind" type="Boolean">Determines whether to bind or unbind the handler.</param>
			/// <param name="scope" type="Object">The scope for handler calls.</param>
			var handlers = MobileCRM.UI.EntityForm._handlers.onPostSave;
			var register = handlers.length == 0;
			_bindHandler(handler, handlers, bind, scope);
			if (register)
				MobileCRM.bridge.command("registerEvents", "onPostSave");
		}
		var _pendingPostSaveId = 0;
		MobileCRM.UI.EntityForm.prototype.suspendPostSave = function () {
			/// <summary>[v8.2] Suspends current &quot;onPostSave&quot; operations and allows performing another asynchronous tasks before the form is closed.</summary>
			/// <returns type="Object">A request object with single method &quot;resumePostSave&quot; which has to be called to resume the post-save operations.</returns>
			var cmdId = "EntityFormPendingPostSave" + (++_pendingPostSaveId);
			var entityForm = this;
			entityForm.context.pendingPostSaveCommand = cmdId;
			return {
				resumePostSave: function () {
					if (entityForm._inCallback) {
						// still in "onPostSave" callback - do not send a command (handler not installed yet)
						entityForm.context.pendingPostSaveCommand = null;
					}
					else
						MobileCRM.bridge.command(cmdId);
				}
			};
		};
		MobileCRM.UI.EntityForm.onSelectedViewChanged = function (handler, bind, scope) {
			/// <summary>[v9.3] Binds or unbinds the handler for onSelectedViewChanged event on EntityForm.</summary>
			/// <remarks>Bound handler is called with the EntityForm object as an argument. The EntityForm context object contains &quot;selectedView&quot; property with the name of currently selected view.</remarks>
			/// <param name="handler" type="function(entityForm)">The handler function that has to be bound or unbound.</param>
			/// <param name="bind" type="Boolean">Determines whether to bind or unbind the handler.</param>
			/// <param name="scope" type="Object">The scope for handler calls.</param>
			var handlers = MobileCRM.UI.EntityForm._handlers.onSelectedViewChanged;
			var register = handlers.length == 0;
			_bindHandler(handler, handlers, bind, scope);
			if (register)
				MobileCRM.bridge.command("registerEvents", "onSelectedViewChanged");
		}
		MobileCRM.UI.EntityForm.requestObject = function (callback, errorCallback, scope) {
			/// <summary>Requests the managed EntityForm object.</summary>
			/// <remarks>Method initiates an asynchronous request which either ends with calling the <b>errorCallback</b> or with calling the <b>callback</b> with Javascript version of EntityForm object. See <see cref="MobileCRM.Bridge.requestObject">MobileCRM.Bridge.requestObject</see> for further details.</remarks>
			/// <param name="callback" type="function(entityForm)">The callback function that is called asynchronously with serialized EntityForm object as argument. Callback should return true to apply changed properties.</param>
			/// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
			/// <param name="scope" type="Object">The scope for callbacks.</param>
			MobileCRM.bridge.requestObject("EntityForm", function (obj) {
				if (callback.call(scope, obj) != false) {
					var changed = obj.getChanged();
					return changed;
				}
				return '';
			}, errorCallback, scope);
		}
		MobileCRM.UI.EntityForm._callHandlers = function (event, data, context) {
			var handlers = MobileCRM.UI.EntityForm._handlers[event];
			if (handlers && handlers.length > 0) {
				data.context = context;
				data._inCallback = true;
				var result = '';
				if (_callHandlers(handlers, data) != false) {
					var changed = data.getChanged();
					result = JSON.stringify(changed);
				}
				data._inCallback = false;
				return result;
			}
		}
		MobileCRM.UI.EntityForm._callCmdHandlers = function (event, data, context) {
			var handlers = MobileCRM.UI.EntityForm._handlers[event];
			if (handlers && handlers.length > 0) {
				data.context = context;
				return _callHandlers(handlers, data);
			}
			return null;
		}
		MobileCRM.UI.EntityForm.executeCommandByName = function (command, callback, errorCallback, scope) {
		    /// <summary>[v8.1] Execute the command with the passed name. The command must exist and must be enabled.</summary>
		    /// <param name="command" type="String">The name of the EntityForm command.</param>
		    /// <param name="callback" type="function(entityForm)">The callback function that is called asynchronously in case of success.</param>
		    /// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
		    /// <param name="scope" type="Object">The scope for callbacks.</param>
		    MobileCRM.bridge.invokeMethodAsync("EntityForm", "ExecuteCommandByName", [command], callback, errorCallback, scope);
		}
		MobileCRM.UI.EntityForm.onCommand = function (command, handler, bind, scope) {
			/// <summary>Binds or unbinds the handler for EntityForm command.</summary>
			/// <param name="command" type="String">The name of the EntityForm command.</param>
			/// <param name="handler" type="function(entityForm)">The handler function that has to be bound or unbound.</param>
			/// <param name="bind" type="Boolean">Determines whether to bind or unbind the handler.</param>
			/// <param name="scope" type="Object">The scope for handler calls.</param>
			var handlers = MobileCRM.UI.EntityForm._handlers[command];
			if (!handlers)
				handlers = MobileCRM.UI.EntityForm._handlers[command] = [];
			_bindHandler(handler, handlers, bind, scope);
			var action = ((bind == false && handlers.length == 0) ? "cmdDel" : "cmd");
			MobileCRM.bridge.command("registerEvents", action + ":" + command);
		}
		MobileCRM.UI.EntityForm.onCanExecuteCommand = function (command, handler, bind, scope) {
			/// <summary>Binds or unbinds the handler called when the EntityForm needs to find out whether the command can be executed (is enabled).</summary>
			/// <param name="command" type="String">The name of the EntityForm command. Optionally can contain the param value separated by slash (e.g. ChangeStatus/5).</param>
			/// <param name="handler" type="function(entityForm)">The handler function that has to be bound or unbound. Handler&#39;s return value indicates whether the command is enabled (true/false).</param>
			/// <param name="bind" type="Boolean">Determines whether to bind or unbind the handler.</param>
			/// <param name="scope" type="Object">The scope for handler calls.</param>
			var handlerName = "CanExecute_" + command;
			var handlers = MobileCRM.UI.EntityForm._handlers[handlerName];
			if (!handlers)
				handlers = MobileCRM.UI.EntityForm._handlers[handlerName] = [];
			_bindHandler(handler, handlers, bind, scope);
			var action = ((bind == false && handlers.length == 0) ? "cmdEnabledDel" : "cmdEnabled");
			MobileCRM.bridge.command("registerEvents", action + ":" + command);
		}
		MobileCRM.UI.EntityForm.enableCommand = function (command, enable, iParam) {
			/// <summary>Enables or disables the form command.</summary>
			/// <param name="command" type="String">The name of the command.</param>
			/// <param name="enable" type="Boolean">Determines whether to enable or disable the command.</param>
			/// <param name="iParam" type="Number">[v9.1] Optional parameter defining the additional command parameter (like status code value for &quot;ChangeStatus&quot; command).</param>
			if (typeof iParam != "undefined")
				command += "/" + iParam;
			MobileCRM.bridge.invokeMethodAsync("EntityForm", "EnableCommandByName", [command, enable]);
		};
		MobileCRM.UI.EntityForm.refreshForm = function () {
			/// <summary>Reloads the form&apos;s edit state.</summary>
			MobileCRM.bridge.invokeMethodAsync("EntityForm", "ReloadForm", []);
		};
		MobileCRM.UI.EntityForm.saveAndClose = function () {
			/// <summary>Saves edited entity and closes the form.</summary>
			MobileCRM.bridge.invokeMethodAsync("EntityForm", "SaveAndClose", [true]);
		};
		MobileCRM.UI.EntityForm.save = function () {
			/// <summary>[v9.0]Saves the form entity and its children and refreshes the form.</summary>
			MobileCRM.bridge.invokeMethodAsync("EntityForm", "InternalSave", [false]);
		};
		MobileCRM.UI.EntityForm.closeWithoutSaving = function () {
			/// <summary>Closes the form ignoring all changes that have been made on it.</summary>
			MobileCRM.bridge.invokeMethodAsync("EntityForm", "SaveAndClose", [false]);
		};
		MobileCRM.UI.EntityForm.prototype.reactivateEntity = function (statuscode) {
			/// <summary>Reactivates inactive entity and reloads the form.</summary>
			/// <param name="statuscode" type="Number">Activation status code.</param>
			this.entity.properties.statuscode = statuscode;
			MobileCRM.bridge.invokeMethodAsync("EntityForm", "OnEntityStateChanged", []);
			MobileCRM.UI.EntityForm.save();
		}
		MobileCRM.UI.EntityForm.showPleaseWait = function (caption) {
			/// <summary>Shows a please wait message, disabling the form except for the close command.</summary>
			/// <param name="caption" type="String">Wait message.</param>
			/// <returns type="Object">An object representing the UI component with single method &quot;close&quot;.</returns>
			var obj = MobileCRM.bridge.exposeObjectAsync("EntityForm.Form.ShowPleaseWait", [caption]);
			return {
				close: function () {
					obj.invokeMethodAsync("Dispose", []);
					obj.release();
				}
			};
		};
		MobileCRM.UI.EntityForm.maximizeView = function(viewName, maximize) {
			/// <summary>[v8.1] Makes the passed view maximized/restored.</summary>
			/// <param name="viewName" type="String">The name of the view which has to be maximized/restored.</param>
			/// <param name="maximize" type="Boolean">true, to maximize the view; false, to restore it.</param>
			MobileCRM.bridge.invokeMethodAsync("EntityForm", "MaximizeView", [viewName, maximize]);
		};
		MobileCRM.UI.EntityForm.isViewMaximized = function(viewName, callback, errorCallback, scope) {
			/// <summary>[v8.1] Inspects whether the passed view is maximized or restored.</summary>
			/// <param name="viewName" type="String">The name of the view which has to be maximized/restored.</param>
			/// <param name="callback" type="function(Boolean)">Asynchronous callback which is called with Boolean result: true, if the view is maximized; false, if it is restored.</param>
			/// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
			/// <param name="scope" type="Object">The scope for callbacks.</param>
			MobileCRM.bridge.invokeMethodAsync("EntityForm", "IsViewMaximized", [viewName], callback, errorCallback, scope);
		};
		MobileCRM.UI.EntityForm.openSalesEntityDetail = function (detail, errorCallback) {
			/// <summary>[v8.2] Shows an entity edit dialog.</summary>
			/// <param name="detail" type="MobileCRM.DynamicEntity">detail entity.</param>
			/// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called asynchronously in case of error.</param>
			MobileCRM.bridge.invokeMethodAsync("EntityForm", "ShowEntityDetailDialog", [detail.id], null, errorCallback, null);
		}
		// MobileCRM.UI.EntityForm.DetailCollection
		MobileCRM.UI.EntityForm.DetailCollection = function () {
			/// <summary>Provides functions accessing the collection of the sales entity details (e.g. Order details)</summary>
		};

		MobileCRM.UI.EntityForm.DetailCollection._updateDetail = function (updateCallback) {
			var props = this.properties;
			if (props._privVals)
				props = props._privVals;
			var request = { entity: this.entityName, id: this.id, properties: props, isNew: this.isNew, isOnline: this.isOnline };
			var cmdParams = JSON.stringify(request);
			var self = this;
			MobileCRM.bridge.command('updateSalesDetailProduct', cmdParams,
				function (res) {
					self.id = res.id;
					self.isNew = false;
					self.isOnline = res.isOnline;
					self.primaryName = res.primaryName;
					self.properties = res.properties;
					if (typeof updateCallback == "function")
						updateCallback.call(self, null);
				},
				function (err) {
					if (typeof updateCallback == "function")
						updateCallback.call(self, err);
				}, null);
			return this;
		};

		MobileCRM.UI.EntityForm.DetailCollection.getAll = function (callback, errorCallback, scope) {
			/// <summary>Asynchronously returns the collection of the sales entity details (e.g. Order details)</summary>
			/// <param name="callback" type="function(Array)">The callback function that is called asynchronously with an array of <see cref="MobileCRM.DynamicEntity">MobileCRM.DynamicEntity</see> objects as argument.</param>
			/// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
			/// <param name="scope" type="Object">The scope for callbacks.</param>
			MobileCRM.bridge.invokeMethodAsync("EntityForm", "Entity.get_DetailCollection", [], function (orderDetails) {
				var nDetails = orderDetails.length;
				for (var i = 0; i < nDetails; i++) {
					var detail = orderDetails[i];
					detail.update = MobileCRM.UI.EntityForm.DetailCollection._updateDetail;
				}
				callback.call(scope, orderDetails);
			}, errorCallback, scope);
		};
		MobileCRM.UI.EntityForm.DetailCollection.get = function (index, callback, errorCallback, scope) {
			/// <summary>Asynchronously returns requested sales entity detail (e.g. Order detail)</summary>
			/// <param name="index" type="Number">An index of requested item.</param>
			/// <param name="callback" type="function(MobileCRM.DynamicEntity)">The callback function that is called asynchronously with the <see cref="MobileCRM.DynamicEntity">MobileCRM.DynamicEntity</see> object as argument.</param>
			/// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
			/// <param name="scope" type="Object">The scope for callbacks.</param>
			MobileCRM.bridge.invokeMethodAsync("EntityForm", "Entity.DetailCollection.get_Item", [index], function (entity) {
				entity.update = MobileCRM.UI.EntityForm.DetailCollection._updateDetail;
				if (typeof callback == "function")
					callback.call(scope, entity);
			}, errorCallback, scope);
		};
		MobileCRM.UI.EntityForm.DetailCollection.deleteByIndex = function (index, callback, errorCallback, scope) {
			/// <summary>Deletes the sales entity detail (e.g. Order detail) by index.</summary>
			/// <param name="index" type="Number">An index of the item to be deleted.</param>
			/// <param name="callback" type="Function">The callback function which is called asynchronously in case of success.</param>
			/// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
			/// <param name="scope" type="Object">The scope for callbacks.</param>
			MobileCRM.bridge.invokeMethodAsync("EntityForm", "Entity.DetailCollection.RemoveItem", [index], callback, errorCallback, scope);
		};

		MobileCRM.UI.EntityForm.DetailCollection.deleteById = function (orderDetailId, callback, errorCallback, scope) {
			/// <summary>Deletes the sales entity detail (e.g. Order detail) by id.</summary>
			/// <param name="id" type="String">An id of the item to be deleted.</param>
			/// <param name="callback" type="Function">The callback function which is called asynchronously in case of success.</param>
			/// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
			/// <param name="scope" type="Object">The scope for callbacks.</param>
			MobileCRM.bridge.invokeMethodAsync("EntityForm", "Entity.get_DetailCollection", [], function (res) {
				var nDetails = res.length;
				for (var i = 0; i < nDetails; i++) {
					if (res[i].id == orderDetailId) {
						MobileCRM.UI.EntityForm.DetailCollection.deleteByIndex(i, callback, errorCallback, scope);
					}
				}
			}, errorCallback, scope);
		};

		MobileCRM.UI.EntityForm.DetailCollection.add = function (product, callback, errorCallback, scope) {
			/// <summary>Appends the product into sales order collection.</summary>
			/// <remarks>Resulting <see cref="MobileCRM.DynamicEntity">MobileCRM.DynamicEntity</see> object implements method &quot;update&quot; which can be used to update the entity properties in the sales detail collection.</remarks>
			/// <param name="product" type="MobileCRM.Reference">A reference of the product to be appended.</param>
			/// <param name="callback" type="function(MobileCRM.DynamicEntity)">The callback function which is called asynchronously with <see cref="MobileCRM.DynamicEntity">MobileCRM.DynamicEntity</see> object as an argument.</param>
			/// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
			/// <param name="scope" type="Object">The scope for callbacks.</param>
			MobileCRM.bridge.command("addSalesDetailProduct", JSON.stringify(product), function (detailEntity) {
				detailEntity.update = MobileCRM.UI.EntityForm.DetailCollection._updateDetail;
				callback(detailEntity);
			}, errorCallback, scope);
		};

		MobileCRM.UI.EntityForm.DetailCollection.onChange = function (handler, bind, scope) {
			/// <summary>[v8.2] Binds or unbinds the handler which is called when the list of sales details changes.</summary>
			/// <param name="handler" type="function(entityForm)">The handler function that has to be bound or unbound.</param>
			/// <param name="bind" type="Boolean">Determines whether to bind or unbind the handler.</param>
			/// <param name="scope" type="Object">The scope for handler calls.</param>
			var handlers = MobileCRM.UI.EntityForm._handlers.onDetailCollectionChange;
			var register = handlers.length == 0;
			_bindHandler(handler, handlers, bind, scope);
			if (register)
				MobileCRM.bridge.command("registerEvents", "onDetailCollectionChange");
		};

		// Services
		MobileCRM.Services.DocumentService.prototype._executeAction = function (action, callback, errorCallback, scope) {
			var params = {
				action: action,
				maxImageSize: this.maxImageSize,
				recordQuality: this.recordQuality,
				allowChooseVideo: this.allowChooseVideo
			};
			MobileCRM.bridge.command("documentService", JSON.stringify(params), callback, errorCallback, scope);
		};
		MobileCRM.Services.DocumentService.prototype.capturePhoto = function (callback, errorCallback, scope) {
			/// <summary>Asks the user to capture a photo and calls the async callback with file info.</summary>
			/// <param name="callback" type="function(MobileCRM.Services.FileInfo)">The callback function which is called asynchronously with <see cref="MobileCRM.Services.FileInfo">MobileCRM.Services.FileInfo</see> object as an argument.</param>
			/// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
			/// <param name="scope" type="Object">The scope for callbacks.</param>
			this._executeAction(2, callback, errorCallback, scope);
		};
		MobileCRM.Services.DocumentService.prototype.selectPhoto = function (callback, errorCallback, scope) {
			/// <summary>Asks the user to choose a media (image, video, depending on the value of allowChooseVideo property) and calls the async callback with file info.</summary>
			/// <param name="callback" type="function(MobileCRM.Services.FileInfo)">The callback function which is called asynchronously with <see cref="MobileCRM.Services.FileInfo">MobileCRM.Services.FileInfo</see> object as an argument.</param>
			/// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
			/// <param name="scope" type="Object">The scope for callbacks.</param>
			this._executeAction(4, callback, errorCallback, scope);
		};
		MobileCRM.Services.DocumentService.prototype.selectFile = function (callback, errorCallback, scope) {
			/// <summary>Asks the user to choose a file and calls the async callback with file info.</summary>
			/// <param name="callback" type="function(MobileCRM.Services.FileInfo)">The callback function which is called asynchronously with <see cref="MobileCRM.Services.FileInfo">MobileCRM.Services.FileInfo</see> object as an argument.</param>
			/// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
			/// <param name="scope" type="Object">The scope for callbacks.</param>
			this._executeAction(8, callback, errorCallback, scope);
		};
		MobileCRM.Services.DocumentService.prototype.recordAudio = function (callback, errorCallback, scope) {
			/// <summary>Asks the user to record an audio note and calls the async callback with file info.</summary>
			/// <param name="callback" type="function(MobileCRM.Services.FileInfo)">The callback function which is called asynchronously with <see cref="MobileCRM.Services.FileInfo">MobileCRM.Services.FileInfo</see> object as an argument.</param>
			/// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
			/// <param name="scope" type="Object">The scope for callbacks.</param>
			this._executeAction(0x10, callback, errorCallback, scope);
		};
		MobileCRM.Services.DocumentService.prototype.recordVideo = function (callback, errorCallback, scope) {
			/// <summary>Asks the user to record an video and calls the async callback with file info.</summary>
			/// <param name="callback" type="function(MobileCRM.Services.FileInfo)">The callback function which is called asynchronously with <see cref="MobileCRM.Services.FileInfo">MobileCRM.Services.FileInfo</see> object as an argument.</param>
			/// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
			/// <param name="scope" type="Object">The scope for callbacks.</param>
			this._executeAction(0x20, callback, errorCallback, scope);
		};
		MobileCRM.Services.DocumentService.prototype.pasteFile = function (callback, errorCallback, scope) {
			/// <summary>Takes the file from clipboard and calls the async callback with file info.</summary>
			/// <param name="callback" type="function(MobileCRM.Services.FileInfo)">The callback function which is called asynchronously with <see cref="MobileCRM.Services.FileInfo">MobileCRM.Services.FileInfo</see> object as an argument.</param>
			/// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
			/// <param name="scope" type="Object">The scope for callbacks.</param>
			this._executeAction(0x40000, callback, errorCallback, scope);
		};
		MobileCRM.Services.DocumentService.prototype.print = function (filePath, landscape, errorCallback, scope) {
			/// <summary>[v9.1] Prints the documnet defined by file path.</summary>
			/// <param name="filePath" type="String">A file path.</param>
			/// <param name="landscape" type="Boolean">True, to print the document in landscape. False, to print it in portrait</param>
			/// <param name="errorCallback" type="function(errorMsg)">The error callback which is called in case of error.</param>
			/// <param name="scope" type="Object">The scope for callbacks.</param>
			var params = {
				filePath: filePath || "",
				landscape: landscape,
				print:true
			}
			MobileCRM.bridge.command("documentService", JSON.stringify(params), null, errorCallback, scope);
		};
		_inherit(MobileCRM.Services.ChatService, MobileCRM.ObservableObject);
		MobileCRM.Services.ChatService.getService = function (callback, errorCallback, scope) {
			/// <summary>Asynchronously creates the new instance of the ChatService.</summary>
			/// <param name="callback" type="function(MobileCRM.Services.ChatService)">The callback function which is called asynchronously with <see cref="MobileCRM.Services.ChatService">MobileCRM.Services.ChatService</see> instance as an argument.</param>
			/// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
			/// <param name="scope" type="Object">The scope for callbacks.</param>
			MobileCRM.bridge.command("chatService", JSON.stringify({ method: "create" }), callback, errorCallback, scope);
		};
		MobileCRM.Services.ChatService.prototype.postMessage = function (regardingEntity, text, callback, errorCallback, scope) {
			/// <summary>Submits a new post into the channel defines by related entity reference.</summary>
			/// <remarks>Use reference to resco_chattopic entity to specify a shared channel or reference to a peer user to specify the private channel.</remarks>
			/// <param name="regardingEntity" type="MobileCRM.Reference">A reference to an entity that the post should relate to.</param>
			/// <param name="text" type="String">The post content.</param>
			/// <param name="callback" type="function(MobileCRM.DynamicEntity)">The callback function which is called asynchronously with <see cref="MobileCRM.DynamicEntity">MobileCRM.DynamicEntity</see> representing newly created resco_chatpost record.</param>
			/// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
			/// <param name="scope" type="Object">The scope for callbacks.</param>
			MobileCRM.bridge.command("chatService", JSON.stringify({ method: "postMessage", entityName: regardingEntity.entityName, entityId: regardingEntity.id, text: text }), callback, errorCallback, scope);
		};
		MobileCRM.Services.ChatService.prototype.attachNoteToPost = function (postId, filePath, mimeType, subject, callback, errorCallback, scope) {
			/// <summary>Creates a note (annotation) entity with the file attachment related to specified post.</summary>
			/// <remarks>The file path can be either a relative path to application data or a full path to a file being attached.</remarks>
			/// <param name="postId" type="String">An id of the resco_chatpost entity which should have the note attached.</param>
			/// <param name="filePath" type="String">A path to a file that has to be attached.</param>
			/// <param name="mimeType" type="String">A MIME type of the file.</param>
			/// <param name="subject" type="String">A text which will be used as note&apos;s subject.</param>
			/// <param name="callback" type="function(MobileCRM.DynamicEntity)">The callback function which is called asynchronously with <see cref="MobileCRM.DynamicEntity">MobileCRM.DynamicEntity</see> representing newly created annotation record.</param>
			/// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
			/// <param name="scope" type="Object">The scope for callbacks.</param>
			MobileCRM.bridge.command("chatService", JSON.stringify({ method: "attachNoteToPost", postId: postId, filePath: filePath, mimeType: mimeType, subject: subject }), callback, errorCallback, scope);
		};
		MobileCRM.Services.ChatService.prototype.subscribeToEntityChannel = function (regardingEntity, subscribe, callback, errorCallback, scope) {
			/// <summary>Subscribes current user to a channel specified by related entity.</summary>
			/// <remarks>Use reference to resco_chattopic entity to specify a shared channel.</remarks>
			/// <param name="regardingEntity" type="MobileCRM.Reference">Reference to an entity that has to be subscribed/unsubscribed.</param>
			/// <param name="subscribe" type="Boolean">Determines whether to subscribe or unsubscribe entity channel.</param>
			/// <param name="callback" type="Function">The callback function which is called asynchronously in case of success.</param>
			/// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
			/// <param name="scope" type="Object">The scope for callbacks.</param>
			MobileCRM.bridge.command("chatService", JSON.stringify({ method: "subscribe", entityName: regardingEntity.entityName, entityId: regardingEntity.id, subscribe: subscribe }), callback, errorCallback, scope);
		};

		MobileCRM.Services.AddressBookService.getService = function (errorCallback, scope) {
			/// <summary>[v9.1] Gets an instance of AddressBookService object.</summary>
			/// <returns type="MobileCRM.Services.AddressBookService">An instance of AddressBookService object.</returns>
			/// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
			/// <param name="scope" type="Object">The scope for callbacks.</param>
			MobileCRM.bridge.command("getAddressService", [], null, errorCallback, scope);
			return new MobileCRM.Services.AddressBookService();
		};

		MobileCRM.Services.AddressBookService.prototype.getContact = function (id, callback, errorCallback, scope) {
			/// <summary>[v9.1] Gets an address book contact by its ID.</summary>
			/// <param name="id" type="String">Requested contact id.</param>
			/// <param name="callback" type="function(MobileCRM.Services.AddressBookService.AddressBookRecord)">The callback function which is called asynchronously with <see cref="MobileCRM.Services.AddressBookService.AddressBookRecord">MobileCRM.Services.AddressBookService.AddressBookRecord</see> object as an argument.</param>
			/// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
			/// <param name="scope" type="Object">The scope for callbacks.</param>
			MobileCRM.bridge.invokeMethodAsync("AddressBookService", "GetContact", [id], function (res) {
				callback.call(scope, res);
			}, errorCallback, scope);

		};

		MobileCRM.Services.AddressBookService.AddressBookRecord = function () {
			/// <field name="recordId" type="String">Record id.</field>
			/// <field name="firstName" type="String">Record first name.</field>
			/// <field name="lastName" type="String">Record last name.</field>
			/// <field name="middleName" type="String">Record middle name.</field>
			/// <field name="nickName" type="String">Record nick name.</field>
			/// <field name="jobTitle" type="String">Job title.</field>
			/// <field name="organization" type="String">Organization name.</field>
			/// <field name="prefix" type="String">Name prefix (Title) name.</field>
			/// <field name="suffix" type="String">Name suffix (Title) name.</field>
			/// <field name="geo" type="Array">Address GPS coordinates.</field>
			/// <field name="url" type="String">Web page URL of record.</field>
		};

		MobileCRM.Services.GeoAddress.fromLocation = function (latitude, longitude, success, failed, scope) {
			/// <summary>Translates the geo position represented by latitude and longitude values into the GeoAddress object.</summary>
			/// <param name="latitude" type="Number">Latitude value of the GPS position.</param>
			/// <param name="longitude" type="Number">Longitude value of the GPS position.</param>
			/// <param name="success" type="function(address)">A callback function that is called with the GeoAddress object as argument.</param>
			/// <param name="failed" type="function(errorMsg)">A callback which is called in case of error.</param>
			/// <param name="scope" type="Object">The scope for callbacks.</param>
			MobileCRM.bridge.command("locationToAddress", latitude + ";" + longitude, success, failed, scope);
		};
		MobileCRM.Services.GeoAddress.prototype.toLocation = function (success, failed, scope) {
			/// <summary>Translates the civic address represented by GeoAddress object into GPS position.</summary>
			/// <param name="success" type="function(location)">A callback function that is called with the location object having latitude and longitude properties.</param>
			/// <param name="failed" type="function(errorMsg)">A callback which is called in case of error.</param>
			/// <param name="scope" type="Object">The scope for callbacks.</param>
			MobileCRM.bridge.command("addressToLocation", JSON.stringifyNotNull(this), success, failed, scope);
		};

		/**************************************/
		// Platform dependent implementation   /
		// MobileCRM.bridge singleton creation /
		/**************************************/
		if (typeof CrmBridge !== "undefined") {
			// Android
			MobileCRM.Bridge.prototype.command = function (command, params, success, failed, scope) {
				var cmdId = this._createCmdObject(success, failed, scope);
				CrmBridge.println(cmdId + ';' + command + ':' + params);
			};
			if (typeof CrmBridge.invoke !== "undefined") {
				MobileCRM.Bridge.prototype.invoke = function (command, params) {
					var result = CrmBridge.invoke(command, params);
					if (result.length >= 4 && result.substr(0, 4) == 'ERR:')
						throw new MobileCrmException(result.substr(4));
					else
						return eval('(' + result + ')');
				};
			}
			MobileCRM.bridge = new MobileCRM.Bridge('Android');
		}
		else {
			if (typeof window.external !== "undefined") {
				var win10 = typeof window.win10version !== "undefined";
				if (typeof window.external.notify !== "undefined" || win10) {
					// WindowsPhone || WindowsRT || Windows10
					MobileCRM.Bridge.prototype.command = function (command, params, success, failed, scope) {
						var cmdId = this._createCmdObject(success, failed, scope);
						window.external.notify(cmdId + ';' + command + ':' + params);
					};
					MobileCRM.Bridge.prototype.invoke = function (command, params) {
						var result = undefined;
						var error = null;
						var cmdId = this._createCmdObject(function (res) { result = res; }, function (err) { error = err; }, this);
						window.external.notify(cmdId + ';' + command + ':' + params);
						if (error)
							throw new MobileCrmException(error);
						else
							return result;
					};
					if (typeof window.alert === "undefined") {
						window.alert = function (text) {
							MobileCRM.bridge.invoke("alert", text);
						};
					}
					MobileCRM.Bridge.prototype.alert = function (text, callback, scope) {
						/// <summary>Shows a message asynchronously and calls the callback after it is closed by user.</summary>
						/// <param name="callback" type="function(obj)">The callback function that is called asynchronously.</param>
						/// <param name="scope" type="Object">The scope for callbacks.</param>
						MobileCRM.bridge.command("alert", text, callback, callback, scope);
					};
					var platformName = win10 ? window.win10version : (navigator.userAgent.indexOf("Windows Phone") > 0 ? "WindowsPhone" : "WindowsRT");
					MobileCRM.bridge = new MobileCRM.Bridge(platformName);
				}
				else if (typeof window.external.ProcessCommand !== "undefined") {
					// Windows Desktop
					MobileCRM.Bridge.prototype.command = function (command, params, success, failed, scope) {
						var cmdId = this._createCmdObject(success, failed, scope);
						window.external.ProcessCommand(cmdId, command, params);
					};
					if (typeof window.external.InvokeCommand !== "undefined") {
						MobileCRM.Bridge.prototype.invoke = function (command, params) {
							var result = window.external.InvokeCommand(command, params);
							if (result.length >= 4 && result.substr(0, 4) == 'ERR:')
								throw new MobileCrmException(result.substr(4));
							else
								return eval('(' + result + ')');
						};
					}
					MobileCRM.bridge = new MobileCRM.Bridge('Windows');
				}
			}
			else if (navigator.userAgent.toLowerCase().match(/(iphone|ipod|ipad)/)) {
				MobileCRM.Bridge.prototype.command = function (command, params, success, failed, scope) {
					var self = MobileCRM.bridge;
					var cmdId = self._createCmdObject(success, failed, scope);
					var cmdText = cmdId + ';' + command + ':' + params; //{ Command: command, Id: callbackObj };
					self.commandQueue.push(cmdText);
					if (!self.processing) {
						self.processing = true;
						document.location.href = 'crm:wake';
//						var iframe = document.createElement("IFRAME");
//						iframe.setAttribute("src", "crm:wake");
//						document.documentElement.appendChild(iframe);
//						iframe.parentNode.removeChild(iframe);
					}
				};
				MobileCRM.Bridge.prototype.peekCommand = function () {
					var cmdText = MobileCRM.bridge.commandQueue.shift();
					if (cmdText != null) {
						return cmdText;
					}
					return "";
				};
 				MobileCRM.Bridge.prototype.invoke = function (command, params) {
					var self = MobileCRM.bridge;
					var result = undefined;
					var error = null;
					var cmdId = self._createCmdObject(function (res) { result = res; }, function (err) { error = err; }, self);
					var cmdText = cmdId + ';' + command + ':' + params;
					self.commandQueue.push(cmdText);

                    var iframe = document.getElementById("MobileCRM_JSBridge_iFrame");
                    if (iframe === null) {
                        iframe = document.createElement("iframe");
                        iframe.id = "MobileCRM_JSBridge_iFrame";
                        iframe.style = "visibility:hidden;display:none";
                        iframe.src = "crm:wake";
                        iframe.height = 0; iframe.width = 0; iframe.hspace = "0"; iframe.vspace = "0";
                        iframe.marginheight = "0"; iframe.marginwidth = "0"; iframe.frameBorder = "0";
                        iframe.scrolling = "No";
                        document.documentElement.appendChild(iframe);
                    } else {
                        iframe.src = iframe.src;
                        document.documentElement.removeChild(iframe);
                        document.documentElement.appendChild(iframe);
                    }                    
                    if(error)
                        throw new MobileCrmException(error);
					return result;
				};
				MobileCRM.Bridge.prototype.dequeueCommand = function (id) {
					var queue = MobileCRM.bridge.commandQueue;
					for (var i in queue) {
						var cmdText = queue[i];
						if (cmdText) {
							var idEnd = cmdText.indexOf(';');
							if (idEnd > 0 && cmdText.substr(0, idEnd) == id) {
								queue.splice(i, 1);
								return cmdText;
							}
						}
					}
					return "";
				};
				MobileCRM.bridge = new MobileCRM.Bridge('iOS');

				MobileCRM.Bridge.prototype.initialize = function () {
					/// <summary>OBSOLETE: Initializes the bridge to be used for synchronous invokes.</summary>
					//try { MobileCRM.bridge.invoke("initBridge", ""); } catch (exc) { };
				};

				// Generate random ID from URL hash and current time
				//var id = ((_getHashCode(window.location.toString()) * 7919) + ((new Date()).getTime()));
				//MobileCRM.bridge.id = id | 0; // Convert to 32bit integer
			}

			//if (MobileCRM.bridge == null)
			//    throw new Error("MobileCRM bridge does not support this platform.");
		}
	}

	///////////////////////////////////////////
	// Resolve the missing JSON implementation
	if (typeof JSON === "undefined")
		JSON = {};

	if (typeof JSON.parse !== 'function')
		JSON.parse = function (text, reviver) {
			var j;
			function walk(holder, key) {
				var k, v, value = holder[key];
				if (value && typeof value === 'object') {
					for (k in value) {
						if (Object.prototype.hasOwnProperty.call(value, k)) {
							v = walk(value, k);
							if (v !== undefined) {
								value[k] = v;
							} else {
								delete value[k];
							}
						}
					}
				}
				return reviver.call(holder, key, value);
			}

			text = String(text);
			var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
			cx.lastIndex = 0;
			if (cx.test(text)) {
				text = text.replace(cx, function (a) {
					return '\\u' +
						('0000' + a.charCodeAt(0).toString(16)).slice(-4);
				});
			}
			if (/^[\],:{}\s]*$/
					.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
						.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
						.replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
				j = eval('(' + text + ')');
				return typeof reviver === 'function' ?
					walk({ '': j }, '') : j;
			}
			throw new SyntaxError('JSON.parse');
		};

	if (typeof JSON.stringify !== 'function')
		JSON.stringify = function (obj) {
			var t = typeof obj;
			if (t != "object" || obj === null) {
				if (t == "string") obj = obj.toJSON();
				return String(obj);
			}
			else if (obj instanceof Date) return '"' + obj.toJSON() + '"';
			else {
				var n, v, json = [], arr = (obj && obj.constructor == Array);
				for (n in obj) {
					v = obj[n]; t = typeof v;
					if (t != 'function') {
						if (t == "string") v = v.toJSON();
						if (t == "undefined") v = null;
						else if (t == "object" && v !== null) v = JSON.stringify(v);
						json.push((arr ? "" : '"' + n + '":') + String(v));
					}
				}
				return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
			}
		};

	// A custom JSON.stringify version which omits the properties with undefined values
	if (typeof JSON.stringifyNotNull !== 'function')
		JSON.stringifyNotNull = function (obj) {
			var t = typeof obj;
			if (t != "object" || obj === null) {
				if (t == "string") obj = obj.toJSON();
				return String(obj);
			}
			else if (obj instanceof Date) return '"' + obj.toJSON() + '"';
			else {
				var n, v, json = [], arr = (obj && obj.constructor == Array);
				for (n in obj) {
					v = obj[n];
					if (v != null) {
						t = typeof v;
						if (t != 'function' && t != 'undefined') {
							if (t == "string") v = v.toJSON();
							else if (t == "object" && v !== null) {
								if ((v = JSON.stringifyNotNull(v)) == 'null')
									continue;
							}
							json.push((arr ? "" : '"' + n + '":') + String(v));
						}
					}
				}
				return (json.length == 0) ? "null" : (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
			}
		};

	if (typeof Date.prototype.toJSON !== 'function') {
		Date.prototype.toJSON = function (key) {
			function f(n) {
				return n < 10 ? '0' + n : n;
			}
			if (isFinite(this.valueOf())) {
				var timeOff = -this.getTimezoneOffset() / 60;
				return this.getFullYear() + '-' +
					f(this.getMonth() + 1) + '-' +
					f(this.getDate()) + 'T' +
					f(this.getHours()) + ':' +
					f(this.getMinutes()) + ':' +
					f(this.getSeconds()) +
					(timeOff == 0 ? 'Z' : ((timeOff > 0 ? '+' : '') + f(timeOff) + ':00'));
			}
			else
				return null;
		};

		Number.prototype.toJSON =
		Boolean.prototype.toJSON = function (key) {
			return this.valueOf();
		};
	}

	String.prototype.toJSON = function () {
		return '"' + this.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\r/g, '\\r').replace(/\n/g, '\\n').replace(/\t/g, '\\t') + '"';
	};
})();
