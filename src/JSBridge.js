(function () {
	var _scriptVersion = 16.1
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
	var _findInArray = function (arr, property, value) {
		if (arr) {
			for (var i = 0; i < arr.length; i++) {
				if (arr[i][property] == value)
					return arr[i];
			}
		}
		return null;
	};
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
	var _registerEventHandler = function (event, handler, handlers, bind, scope) {
		var register = handlers.length == 0;
		_bindHandler(handler, handlers, bind, scope);
		if (register)
			MobileCRM.bridge.command("registerEvents", event);
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
	function _safeErrorMessage(err) {
		return "message" in err ? err.message : ("Message" in err ? err.Message : err.toString());
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

			CultureInfo: function () {
				/// <summary>[v10.2] Provides information about current device culture. The information includes the names for the culture, the writing system, the calendar used, and formatting for dates.</summary>
				/// <field name="name" type="String">Gets the culture name in the format languageCode/region (e.g. &quot;en-US&quot;). languageCode is a lowercase two-letter code derived from ISO 639-1. regioncode is derived from ISO 3166 and usually consists of two uppercase letters.</field>
				/// <field name="displayName" type="String">Gets the full localized culture name.</field>
				/// <field name="nativeName" type="String">Gets the culture name, consisting of the language, the country/region, and the optional script, that the culture is set to display.</field>
				/// <field name="localization" type="String">Gets selected localization language.</field>
				/// <field name="ISOName" type="String">Gets the ISO 639-1 two-letter code for the language of the current CultureInfo.</field>
				/// <field name="isRightToLeft" type="Boolean">Gets a value indicating whether the current CultureInfo object represents a writing system where text flows from right to left.</field>
				/// <field name="dateTimeFormat" type="MobileCRM.DateTimeFormat">Gets a DateTimeFormat that defines the culturally appropriate format of displaying dates and times.</field>
				/// <field name="numberFormat" type="MobileCRM.NumberFormat">Gets a NumberFormat that defines the culturally appropriate format of displaying numbers, currency, and percentage.</field>
			},

			DateTimeFormat: function () {
				/// <summary>[v10.2] Provides culture-specific information about the format of date and time values.</summary>
				/// <field name="abbreviatedDayNames" type="String[]">Gets a string array containing the culture-specific abbreviated names of the days of the week.</field>
				/// <field name="abbreviatedMonthGenitiveNames" type="String[]">Gets a string array of abbreviated month names associated with the current DateTimeFormat object.</field>
				/// <field name="abbreviatedMonthNames" type="String[]">Gets a string array that contains the culture-specific abbreviated names of the months.</field>
				/// <field name="aMDesignator" type="String">Gets the string designator for hours that are "ante meridiem" (before noon).</field>
				/// <field name="dayNames" type="String[]">Gets a string array that contains the culture-specific full names of the days of the week.</field>
				/// <field name="firstDayOfWeek" type="Number">Gets the first day of the week (0=Sunday, 1=Monday, ...)</field>
				/// <field name="fullDateTimePattern" type="String">Gets the custom format string for a long date and long time value.</field>
				/// <field name="longDatePattern" type="String">Gets the custom format string for a long date value.</field>
				/// <field name="longTimePattern" type="String">Gets the custom format string for a long time value.</field>
				/// <field name="monthDayPattern" type="String">Gets the custom format string for a month and day value.</field>
				/// <field name="monthGenitiveNames" type="String[]">Gets a string array of month names associated with the current DateTimeFormat object.</field>
				/// <field name="monthNames" type="String[]">Gets a string array containing the culture-specific full names of the months.</field>
				/// <field name="pMDesignator" type="String">Gets the string designator for hours that are "post meridiem" (after noon).</field>
				/// <field name="shortDatePattern" type="String">Gets the custom format string for a short date value.</field>
				/// <field name="shortestDayNames" type="String[]">Gets a string array of the shortest unique abbreviated day names associated with the current DateTimeFormat object.</field>
				/// <field name="shortTimePattern" type="String">Gets the custom format string for a short time value.</field>
				/// <field name="sortableDateTimePattern" type="String">Gets the custom format string for a sortable date and time value.</field>
				/// <field name="universalSortableDateTimePattern" type="String">Gets the custom format string for a universal, sortable date and time string.</field>
				/// <field name="yearMonthPattern" type="String">Gets the custom format string for a year and month value.</field>
			},

			NumberFormat: function () {
				/// <summary>[v10.2] Provides culture-specific information for formatting and parsing numeric values.</summary>
				/// <field name="currencyDecimalDigits" type="Number">Gets the number of decimal places to use in currency values.</field>
				/// <field name="currencyDecimalSeparator" type="String">Gets the string to use as the decimal separator in currency values.</field>
				/// <field name="currencyGroupSeparator" type="String">Gets the string that separates groups of digits to the left of the decimal in currency values.</field>
				/// <field name="currencyGroupSizes" type="Number[]">Gets the number of digits in each group to the left of the decimal in currency values.</field>
				/// <field name="currencyNegativePattern" type="Number">Gets the format pattern for negative currency values.</field>
				/// <field name="currencyPositivePattern" type="Number">Gets the format pattern for positive currency values.</field>
				/// <field name="currencySymbol" type="String">Gets the string to use as the currency symbol.</field>
				/// <field name="naNSymbol" type="String">Gets the string that represents the IEEE NaN (not a number) value.</field>
				/// <field name="negativeInfinitySymbol" type="String">Gets the string that represents negative infinity.</field>
				/// <field name="negativeSign" type="String">Gets the string that denotes that the associated number is negative.</field>
				/// <field name="numberDecimalDigits" type="Number">Gets the number of decimal places to use in numeric values.</field>
				/// <field name="numberDecimalSeparator" type="String">Gets the string to use as the decimal separator in numeric values.</field>
				/// <field name="numberGroupSeparator" type="String">Gets the string that separates groups of digits to the left of the decimal in numeric values.</field>
				/// <field name="numberGroupSizes" type="Number[]"> Gets the number of digits in each group to the left of the decimal in numeric values.</field>
				/// <field name="numberNegativePattern" type="Number">Gets the format pattern for negative numeric values.</field>
				/// <field name="percentDecimalDigits" type="Number">Gets the number of decimal places to use in percent values.</field>
				/// <field name="percentDecimalSeparator" type="String">Gets the string to use as the decimal separator in percent values.</field>
				/// <field name="percentGroupSeparator" type="String">Gets the string that separates groups of digits to the left of the decimal in percent values.</field>
				/// <field name="percentGroupSizes" type="Number[]">Gets the number of digits in each group to the left of the decimal in percent values.</field>
				/// <field name="percentNegativePattern" type="Number">Gets the format pattern for negative percent values.</field>
				/// <field name="percentPositivePattern" type="Number">Gets the format pattern for positive percent values.</field>
				/// <field name="percentSymbol" type="String">Gets the string to use as the percent symbol.</field>
				/// <field name="perMilleSymbol" type="String">Gets the string to use as the per mille symbol.</field>
				/// <field name="positiveInfinitySymbol" type="String">Gets the string that represents positive infinity.</field>
				/// <field name="positiveSign" type="String">Gets the string that denotes that the associated number is positive.</field>
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

			ActivityParty: function (entityName, id, primaryName, isDirectParty, addressUsed) {
				/// <summary>Person or group associated with an activity. An activity can have multiple activity parties.</summary>
				/// <param name="entityName" type="String">The logical entity name of the party (account, contact, lead, systemuser, etc.)</param>
				/// <param name="id" type="String">GUID of the existing entity or null for new one or direct party.</param>
				/// <param name="primaryName" type="String">The human readable name of the reference, e.g "Alexandro".</param>
				/// <param name="isDirectParty" type="Boolean">Gets or sets whether the party is direct (email) or a pointer to an CRM record.</param>
				/// <param name="addressUsed" type="String">Gets or sets the actual address used.</param>
				/// <field name="entityName" type="String">The entity name of the party (account, contact, lead, systemuser, etc.)</field>
				/// <field name="id" type="String">GUID of the existing entity or null for new one or direct party.</field>
				/// <field name="primaryName" type="String">The human readable name of the reference, e.g. "Alexandro".</field>
				/// <field name="isDirectParty" type="Boolean">Gets or sets whether the party is direct (email) or a pointer to an CRM record.</field>
				/// <field name="addressUsed" type="String">Gets or sets the actual address used.</field>
				MobileCRM.ActivityParty.superproto.constructor.apply(this, arguments);
				this.isDirectParty = isDirectParty;
				this.addressUsed = addressUsed;
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
				/// <field name="forceDirty" type="Boolean">Indicates whether to force save the provided properties even if not modified. Default behavior is to save only properties that were modified.</field>
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
				/// <field name="isEnabled" type="Boolean">Indicates whether an entity is enabled. This field is used for limited runtime customization.</field>
				/// <field name="isExternal" type="Boolean">Indicates whether an entity stores data from external  sources Exchange/Google.</field>
				/// <field name="name" type="String">Gets the entity (logical) name.</field>
				/// <field name="objectTypeCode" type="Number">Gets the unique entity type code.</field>
				/// <field name="primaryFieldName" type="String">The name of the entity primary field (name) property.</field>
				/// <field name="primaryKeyName" type="String">The name of the entity primary key property.</field>
				/// <field name="relationshipName" type="String">Gets the name of the many-to-many relationship name. Defined only for intersect entities.</field>
				/// <field name="statusFieldName" type="String">Gets the status property name. In general it is called "statuscode" but there are exceptions.</field>
				/// <field name="uploadOnly" type="Boolean">Indicates whether this entity can be downloaded during synchronization.</field>
				/// <field name="attributes" type="Number">Gets additional entity attributes.</field>
				MobileCRM.MetaEntity.superproto.constructor.apply(this, arguments);
			},

			MetaProperty: function () {
				/// <summary>Represents a property (CRM field) metadata.</summary>
				/// <field name="name" type="String">Gets the field (logical) name.</field>
				/// <field name="required" type="Number">Gets the attribute requirement level (0=None, 1=SystemRequired, 2=Required, 3=Recommended, 4=ReadOnly).</field>
				/// <field name="type" type="Number">Gets the attribute CRM type (see <see cref="http://msdn.microsoft.com/en-us/library/microsoft.xrm.sdk.metadata.attributetypecode.aspx">MS Dynamics SDK</see>).</field>
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
				Fetch: function (entity, count, page, distinct) {
					/// <summary>Represents a FetchXml query object.</summary>
					/// <param name="entity" type="MobileCRM.FetchXml.Entity">An entity object.</param>
					/// <param name="count" type="int">the maximum number of records to retrieve.</param>
					/// <param name="page" type="int">1-based index of the data page to retrieve.</param>
					/// <param name="distinct" type="bool">Whether to return only distinct (different) values.</param>
					/// <field name="aggregate" type="Boolean">Indicates whether the fetch is aggregated.</field>
					/// <field name="count" type="int">the maximum number of records to retrieve.</field>
					/// <field name="entity" type="MobileCRM.FetchXml.Entity">An entity object.</field>
					/// <field name="page" type="int">1-based index of the data page to retrieve.</field>
					/// <field name="distinct" type="Boolean">Whether to return only distinct (different) values.</field>
					this.entity = entity;
					this.count = count;
					this.page = page;
					this.aggregate = false;
					this.distinct = distinct;
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
				/// <field name="isMultiPanel" type="Boolean">Gets whether the device has tablet or phone UI.</field>
				/// <field name="customImagePath" type="String">Gets or sets the custom image path that comes from customization.</field>
				MobileCRM.Platform.superproto.constructor.apply(this, arguments);
			},

			Application: function () {
				/// <summary>Encapsulates the application-related functionality.</summary>
			},
			AboutInfo: function () {
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
			Integration: {
				///<summary>Encapsulate methods and properties what can be used for integration.</summary>
			},
			OAuthSettings: function () {
				/// <summary>[v12.4] Represents the settings what are used to authenticate using OAuth server account.</summary>
				/// <field name="authorityEndPoint" type="String">Gets or sets the OAuth token url.</field>
				/// <field name="authorizationUrl" type="String">Gets or sets the authorization url to get authorization code.</field>
				/// <field name="clientId" type="String">Gets or sets the authentication Client Id.</field>
				/// <field name="clientSecret" type="String">Gets or sets the Authentication Client Secret.</field>
				/// <field name="redirectUrl" type="String">Gets or sets the authorization redirect url for service.</field>
				/// <field name="resourceUrl" type="String">Gets or sets the App ID URI of the target web API (secured resource).</field>
				/// <field name="scopes" type="String">Gets or sets the scope to limit an application&apos;s access to a user&apos;s account.</field>

				this.authorityEndPoint = "";
				this.authorizationUrl = "";
				this.authorityEndPoint = "";
				this.resourceUrl = "";
				this.scopes = "";
				this.clientSecret = "";
				this.redirectUrl = "";
			},
			MobileReport: function () {
				/// <summary>Provides a functionality of mobile reporting.</summary>
			},
			Questionnaire: function () {
				/// <summary>Provides a functionality for questionnaires.</summary>
			},
			UI: {
				FormManager: {
				},
				EntityForm: function (props) {
					/// <summary>Represents the Javascript equivalent of native entity form object.</summary>
					/// <remarks>This object cannot be created directly. To obtain/modify this object, use <see cref="MobileCRM.UI.EntityForm.requestObject">MobileCRM.UI.EntityForm.requestObject</see> function.</remarks>
					/// <field name="associatedViews" type="Array">Gets the associated views as an array of <see cref="MobileCRM.UI._EntityList">MobileCRM.UI._EntityList</see> objects.</field>
					/// <field name="bulkUpdateItems" type="Array">A list of entity records editted on this bulk update form.</field>
					/// <field name="canEdit" type="Boolean">Gets whether the form can be edited.</field>
					/// <field name="canClose" type="Boolean">Determines if form can be closed, i.e. there are no unsaved data being edited.</field>
					/// <field name="context" type="Object">Gets the specific context object for onChange and onSave handlers. The onChange context contains single property &quot;changedItem&quot; with the name of the changed detail item and the onSave context contains property &quot;errorMessage&quot; which can be used to break the save process with certain error message.</field>
					/// <field name="controllers" type="Array">Gets the form controllers (map, web) as an array of <see cref="MobileCRM.UI._Controller">MobileCRM.UI._Controller</see> objects.</field>
					/// <field name="detailViews" type="Array">Gets the detailView controls  as an array of <see cref="MobileCRM.UI._DetailView">MobileCRM.UI._DetailView</see> objects.</field>
					/// <field name="isBulkUpdateForm" type="Boolean">Indicates whether the form is bulk update form.</field>
					/// <field name="entity" type="MobileCRM.DynamicEntity">Gets or sets the entity instance the form is showing.</field>
					/// <field name="form" type="MobileCRM.UI.Form">Gets the top level form.</field>
					/// <field name="iFrameOptions" type="Object">Carries the custom parameters that can be specified when opening the form using <see cref="MobileCRM.UI.FormManager">MobileCRM.UI.FormManager</see>.</field>
					/// <field name="isDirty" type="Boolean">Indicates whether the form  has unsaved data.</field>
					/// <field name="relationship" type="MobileCRM.Relationship">Defines relationship with parent entity.</field>
					/// <field name="visible" type="Boolean">Gets whether the underlying form is visible.</field>
					/// <field name="documentView" type="MobileCRM.UI._DocumentView">NoteForm only. Gets the view containing the note attachment.</field>
					MobileCRM.UI.EntityForm.superproto.constructor.apply(this, arguments);
				},

				QuestionnaireForm: function () {
					/// <summary>[v10.3] Represents the Javascript equivalent of native questionnaire form object.</summary>
					/// <field name="form" type="MobileCRM.UI.Form">Gets the form which hosts the questionnaire.</field>
					/// <field name="groups" type="MobileCRM.UI.QuestionnaireForm.Group[]">A list of <see cref="MobileCRM.UI.QuestionnaireForm.Group">QuestionnaireForm.Group</see> objects.</field>
					/// <field name="questions" type="MobileCRM.UI.QuestionnaireForm.Question[]">A list of <see cref="MobileCRM.UI.QuestionnaireForm.Question">QuestionnaireForm.Question</see> objects.</field>
					/// <field name="relationship" type="MobileCRM.Relationship">Gets the relation source and related entity. &quot;null&quot;, if there is no relationship.</field>
					MobileCRM.UI.QuestionnaireForm.superproto.constructor.apply(this, arguments);
				},

				EntityChart: function (props) {
					/// <summary>[13.0] Represents the Javascript equivalent of native entity chart object.</summary>
					MobileCRM.UI.EntityChart.superproto.constructor.apply(this, arguments);
				},

				EntityList: function (props) {
					/// <summary>[v9.2] Represents the Javascript equivalent of native entity list object.</summary>
					/// <field name="allowAddExisting" type="Boolean">Gets or sets whether adding an existing entity is allowed.</field>
					/// <field name="allowCreateNew" type="Boolean">Gets or sets whether create a new entity (or managing the N:N entities in the case of N:N list) is allowed.</field>
					/// <field name="allowedDocActions" type="Number">Gets or sets a mask of document actions (for Note and Sharepoint document lists).</field>
					/// <field name="allowSearch" type="Boolean">Gets or sets whether to show the search bar.</field>
					/// <field name="autoWideWidth" type="String">Gets the view auto width pixel size.</field>
					/// <field name="context" type="Object">[v10.0] Gets the specific context object for onChange, onSave and onCommand handlers.<p>The onSave context contains property &quot;entities&quot; with the list of all changed entities and property &quot;errorMessage&quot; which can be used to cancel the save process with certain error message.</p><p>The onChange handler context contains &quot;entities&quot; property with the list of currently changed entities (typically just one entity) and property &quot;propertyName&quot; with the field name that was changed.</p><p>Command handler context contains the &quot;cmdParam&quot; property and &quot;entities&quot; property with the list of currently selected entities.</p></field>
					/// <field name="currentView" type="String">[v10.0] Gets currently selected entity list view.
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

				ReportForm: function () {
					/// <summary>[v8.1] Represents the Dynamics CRM report form object.</summary>
					/// <field name="allowedReportIds" type="Array">The list of report entity ids that has to be included in the report form selector.</field>
					/// <field name="allowedLanguages" type="Array">The list of LCID codes of the languages that has to be included into the report form selector. The number -1 stands for "Any language".</field>
					/// <field name="defaultReport" type="String">The primary name of the report entity that should be pre-selected on the report form.</field>
					this.allowedReportIds = [];
					this.allowedLanguages = [];
					this.defaultReport = null;
				},
				
				RoutePlan: function () {
					/// <summary>[v14.2] Represents the Javascript equivalent view of RoutePlan form object.</summary>
					/// <field name="myRoute" type="DynamicEntity[]">A list of route entities.</field>
					/// <field name="completedEntities" type="DynamicEntity[]"> A list of completed entities that are about to be removed from route plan.</field>
					/// <field name="routeEntityName" type="String">Logical name of the route visit entity.</field>
					/// <field name="routeDay" type="Date">Currently selected route day.</field>
					/// <field name="isDirty" type="Boolean">Controls whether the form is dirty and requires save, or whether it can be closed.</field>
					MobileCRM.UI.RoutePlan.superproto.constructor.apply(this, arguments);
				},
				
				IFrameForm: function () {
					/// <summary>[v9.0] Represents the iFrame form object.</summary>
					/// <field name="form" type="MobileCRM.UI.Form">Gets the form hosting the iFrame.</field>
					/// <field name="isDirty" type="Boolean">[v10.0] Controls whether the form is dirty and requires save, or whether it can be closed.</field>
					/// <field name="options" type="Object">Carries the custom parameters that can be specified when opening the form using <see cref="MobileCRM.UI.IFrameForm.show">MobileCRM.UI.IFrameForm.show</see> function.</field>
					/// <field name="preventCloseMessage" type="String">[v9.3] Prevents closing the form if non-empty string is set. No other home-item can be opened and synchronization is not allowed to be started. Provided message is shown when user tries to perform those actions.</field>
					/// <field name="saveBehavior" type="Number">[v10.0] Controls the behavior of the Save command on this form (0=Default, 1=SaveOnly, 2=SaveAndClose).</field>
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

				ProcessController: function () {
					/// <summary>[v8.2] Represents the Javascript equivalent of view process controller.</summary>
					/// <remarks>It is not intended to create an instance of this class. To obtain this object, use <see cref="MobileCRM.UI.EntityForm.requestObject">EntityForm.requestObject</see> function and locate the controller in form&apos;s "controllers" list.</remarks>
					/// <field name="currentStateInfo" type="Object">Gets the information about the current process flow state (active stage, visible stage and process).</field>
					MobileCRM.UI.ProcessController.superproto.constructor.apply(this, arguments);
				},

				ViewDefinition: function () {
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
					/// <field name="preventClose" type="Boolean">Whether to prevent closing form without choosing a value.</field>
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
					this.preventClose = false;
				},
				MultiLookupForm: function () {
					/// <summary>[v9.3] This object allows user to select a list of entities from a configurable list of entity types. Derived from LookupForm so you can use the addView() and addEntityFilter() methods.</summary>
					/// <field name="entities" type="Array">An array of allowed entity kinds (schema names).</field>
					/// <field name="source" type="MobileCRM.Relationship">The entity whose property will be set to the chosen value.</field>
					/// <field name="dataSource" type="MobileCRM.Reference[]">The list of entities that should be displayed as selected.</field>
					/// <field name="allowNull" type="Boolean">Whether to allow selecting no entity.</field>
					/// <field name="initialTab" type="Number">Optional index of the tab which has to be pre-selected - 0=All Items, 1=Selected Items (default).</field>
					MobileCRM.UI.MultiLookupForm.superproto.constructor.apply(this, arguments);
					this.dataSource = [];
				},
				TourplanForm: function (props) {
					/// <summary>Represents the Javascript equivalent tourplan form object.</summary>
					/// <remarks>This object cannot be created directly. To obtain/modify this object, use <see cref="MobileCRM.UI.TourplanForm.requestObject">MobileCRM.UI.TourplanForm.requestObject</see> function.</remarks>
					/// <field name="isDirty" type="Boolean">Indicates whether the form has been modified.</field>
					/// <field name="isLoaded" type="Boolean">Gets or sets whether the form is loaded.</field>
					/// <field name="view" type="MobileCRM.UI._AppointmentView">Gets tourplan form view <see cref="MobileCRM.UI._AppointmentView">MobileCRM.UI.AppointmentView</see>.</field>
					MobileCRM.UI.TourplanForm.superproto.constructor.apply(this, arguments);
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
						/// <field name="supportingText" type="String">Gets or sets the item supporting text (e.g. description).</field>
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
						/// <field name="listDataSourceValueType" type="String">Type of list data source element value. Default is string, allowed int, string.</param></param>
						MobileCRM.UI.DetailViewItems.ComboBoxItem.superproto.constructor.apply(this, arguments);
						this._type = "ComboBox";
					},
					LinkItem: function (name, label, listDropDownFormat) {
						/// <summary>[8.0] Represents the <see cref="MobileCRM.UI._DetailView"></see> link item.</summary>
						/// <param name="name" type="String">Defines the item name.</param>
						/// <param name="label" type="String">Defines the item label.</param>
						/// <param name="listDropDownFormat" type="MobileCRM.UI.DetailViewItems.DropDownFormat">Defines item&apos;s drop down format.</param>
						/// <field name="isMultiLine" type="Boolean">Gets or sets whether the item is multiline. Default is false.</field>
						MobileCRM.UI.DetailViewItems.LinkItem.superproto.constructor.apply(this, arguments);
						this._type = "Link";
						if (listDropDownFormat)
							this.listDropDownFormat = listDropDownFormat;
					},
					ButtonItem: function (name, clickText) {
						/// <summary>[8.0] Represents the <see cref="MobileCRM.UI._DetailView"></see> duration item.</summary>
						/// <param name="name" type="String">Defines the item name.</param>
						/// <param name="clickText" type="String">Gets or sets the text content of click button.</param>
						/// <param name="label" type="String">Defines the item label.</param>
						MobileCRM.UI.DetailViewItems.DurationItem.superproto.constructor.apply(this, arguments);
						this._type = "Button";
						this.name = name;
						this.isEnabled = true;
						this.style = "Button";
						this.clickText = clickText;
					},
					DropDownFormat: {
						StringList: 17,
						StringListInput: 18,
						MultiStringList: 19,
						MultiStringListInput: 20
					},
					GridItem: function (name, label, gridStyleDefintion) {
						/// <summary>[13.0] Represents the <see cref="MobileCRM.UI._DetailView"></see> grid item.</summary>
						/// <param name="name" type="String">Defines the item name.</param>
						/// <param name="label" type="String">Defines the item label.</param>
						/// <param name="gridStyleDefintion" type="MobileCRM.UI.DetailViewItems.GridStyleDefintion">Gets or sets the style definition for grid item.</param>
						this.items = [];
						MobileCRM.UI.DetailViewItems.GridItem.superproto.constructor.apply(this, arguments);
						if (gridStyleDefintion)
							this._setGrid(gridStyleDefintion.columns, gridStyleDefintion.rows);
						this._type = "Grid";
					},
					GridStyleDefintion: function (columns, rows) {
						/// <summary>[13.0] Represents the columns and rows style definition for grid item.</summary>
						/// <param name="columns" type="Array">MobileCRM.UI.DetailViewItems.DetailGridLength>">Defines the columns style.</param>
						/// <param name="rows" type="Array">MobileCRM.UI.DetailViewItems.DetailGridLength>">Defines the rows style.</param>
						this.columns = columns;
						this.rows = rows;
					},
					DetailGridLength: function (value, gridUnitType) {
						/// <summary>[13.0] Represents the grid length in grid unit type.</summary>
						/// <param name="value" type="String">Grid length value.</param>
						/// <param name="gridUnitType" type="MobileCRM.UI.DetailViewItems.DetailGridUnitType">Defines the grid <see cref="MobileCRM.UI.DetailViewItems.DetailGridUnitType"></see> unit type.</param>
						this._value = value;
						this._gridUnitType = gridUnitType;
					},
					DetailGridUnitType: {
						/// <summary>[13.0] Gets the grid unit type.</summary>
						/// <field name="auto" type="enum">Gets automatic unit type.</field>
						/// <field name="pixel" type="enum">Gets absolute pixel unit type.</field>
						/// <field name="star" type="enum">Gets relative unit type.</field>
						auto: 0,
						pixel: 1,
						star: 2
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
				FileInfo: function (filePath, url, mimeType, nextInfo) {
					/// <summary>Carries the result of a DocumentService operation.</summary>
					/// <remarks>In case of canceled document service operation, all properties in this object will be set to &quot;null&quot;.</remarks>
					/// <field name="filePath" type="String">Gets the full path of the local file.</field>
					/// <field name="url" type="String">Gets the local URL of the file which can be used from within this HTML document.</field>
					/// <field name="mimeType" type="String">Gets the file MIME type.</field>
					/// <field name="nextInfo" type="MobileCRM.Services.FileInfo">Gets the next file info or &quot;null&quot;.</field>
					this.filePath = filePath;
					this.url = url;
					this.mimeType = mimeType;
					this.nextInfo = nextInfo || null;
				},
				ChatService: function () {
					/// <summary>[v9.3] Represents a service for sending instant messages to users or shared channels.</summary>
					/// <remarks>Instance of this object cannot be created directly. Use <see cref="MobileCRM.Services.ChatService.getService">MobileCRM.Services.ChatService.getService</see> to create new instance.</remarks>
					/// <field name="chatUser" type="MobileCRM.DynamicEntity">An instance of the resco_chatuser entity for current user (either system or external).</field>
					/// <field name="userEntity" type="String">The user entity name (either systemuser or external user entity name).</field>
					/// <field name="userId" type="String">Primary key (id) of the current user (either system or external).</field>
					MobileCRM.Services.ChatService.superproto.constructor.apply(this, arguments);
				},
				DocumentService: function () {
					/// <summary>[v8.1] Represents a service for acquiring the documents.</summary>
					/// <field name="maxImageSize" type="String">Gets or sets the maximum captured image size. If captured image size is greater, the image is resized to specified maximum size [640x480,1024x768,1600x1200,2048x1536,2592x1936 ].</field>
					/// <field name="maxUploadImageSize" type="String">Gets or sets the maximum uploaded image size. If uploaded image size is greater then image is resized to specified maximum size [640x480,1024x768,1600x1200,2048x1536,2592x1936 ].</field>
					/// <field name="recordQuality" type="String">Gets or sets the record quality for audio/video recordings [Low, Medium, High].</field>
					/// <field name="allowChooseVideo" type="Boolean">Indicates whether the video files should be included into the image picker when selecting the photos. The default is true.</field>
					/// <field name="allowMultipleFiles" type="Boolean">Indicates whether to allow multiple files for DocumentActions SelectPhoto and SelectFile.[Not implemented on iOS.]</field>
					/// <field name="allowCancelHandler" type="Boolean">Indicates whether to allow handling of cancel event. Callback will pass the null argument in this case.</field>
				},
				AudioRecorder: function () {
					/// <summary>[v10.0] Represents a service for recording an audio.</summary>
				},
				CompanyInformation: function (name, address) {
					/// <summary>Represents CompanyInformation object.</summary>
					/// <param name="address" type="String">Company address<param>
					/// <param name="name" type="String">Company name<param>
					/// <field name="address" type="String">Company address<field>
					/// <field name="name" type="String">Company name<field>
					this.name = name;
					this.address = address;
				},
				AddressBookService: function () {
					/// <summary>[v9.1] Represents a service for accessing the address book.</summary>
				},
				DynamicsReport: function (reportId, regarding) {
					/// <summary>[v10.0] Represents a service for downloading MS Dynamics reports.</summary>
					/// <param name="reportId" type="String">ID of the &quot;report&quot; entity record.<param>
					/// <param name="regarding" type="MobileCRM.Reference">Regarding entity reference.<param>
					/// <field name="reportId" type="String">ID of the &quot;report&quot; entity record.<field>
					/// <field name="regarding" type="MobileCRM.Reference">Regarding entity reference.<field>
					/// <field name="outputFolder" type="String">AppData-relative or absolute path to the output folder where the file should be stored. Leave undefined to put them into platform-specific temporary folder.<field>
					this.reportId = reportId;
					this.regarding = regarding;
					this.outputFolder = null;
				},
				HttpWebRequest: function () {
					/// <summary>[v11.0] Instance of http web request.</summary>
					/// <field name="userName" type="String">The authentication user name.</field>
					/// <field name="password" type="name="password" type="String">The authentication password.</field>
					/// <field name="method" type="String">The http method to use for the request (e.g. "POST", "GET", "PUT").</field>
					/// <field name="headers" type="Object">An object of additional header key/value pairs to send along with requests using the HttpWebRequest.</field>
					/// <field name="contentType" type="String">The htt request data content type.</field>
					/// <field name="allowRedirect" type="Boolean">The http allows servers to redirect a client request to a different location.</field>
					/// <field name="responseEncoding" type="String">The http web response encoding type. (default: UTF-8), e.g. Base64, ASCII, UTF-8, Binary in case of blob.</field>
					/// <field name="responseType" type="String">The HttpWebResponse content type.</field>

					this.userName = "";
					this.password = "";
					this.method = "";
					this.headers = {};
					this.contentType = null;
					this.allowRedirect = false;
					this._body = null;
					this._encoding = "UTF-8";
					this._credentials = {};
					this.responseType = null;
					this.responseEncoding = this._encoding;
				},
				SynchronizationResult: function (syncResult) {
					/// <summary>[v8.1] Represents the synchronization result.</summary>
					/// <field name="newCustomizationReady" type="Boolean">Indicates whether the new customization is ready.</field>
					/// <field name="customizationDownloaded" type="Boolean">Indicates whether the new customization was applied.</field>
					/// <field name="dataErrorsEncountered" type="Boolean">Indicates whether some data errors were encountered during sync (cannot upload, delete, change status, owner, etc.).</field>
					/// <field name="appWasLocked" type="Boolean">Application was locked.</field>
					/// <field name="syncAborted" type="Boolean">Sync was aborted.</field>
					/// <field name="adminFullSync" type="Boolean">Full sync was requested so background sync was aborted.</field>
					/// <field name="webError" type="Boolean">Indicates whether sync failed due to a communication error (HttpException, for example).</field>
					/// <field name="connectFailed" type="Boolean">Indicates whether sync could not start because of a connection failure.</field>
					/// <field name="wasBackgroundSync" type="Boolean">Indicates whether the last sync was background sync or foreground sync.</field>
					/// <field name="OAuthError" type="Boolean">Sync failed because the OAuth access token can&apos;t be acquired or refreshed.</field>
					/// <field name="syncDownloadRestartedOnBackground" type="Boolean">New customization was downloaded. Sync is still downloading data on background.</field>
					/// <field name="warning" type="Boolean">Sync result contains some warnings that are not critical.</field>
					if (typeof (syncResult) != "undefined") {
						this._rawValue = syncResult;
						var res = new Number(syncResult);
						this.newCustomizationReady = (res & 1) != 0;
						this.customizationDownloaded = (res & 2) != 0;
						this.dataErrorsEncountered = (res & 8) != 0;
						this.appWasLocked = (res & 16) != 0;
						this.syncAborted = (res & 32) != 0;
						this.adminFullSync = (res & 64) != 0;
						this.webError = (res & 128) != 0;
						this.connectFailed = (res & 256) != 0;
						this.OAuthError = (res & 512) != 0;
						this.syncDownloadRestartedOnBackground = (res & 1024) != 0;
						this.warning = (res & 2048) != 0;
						this.wasBackgroundSync = (res & 0x80000000) != 0;
					}
				},
				GeoAddress: function () {
					/// <summary>[v9.3] Represents a service for translating geo position into the civic address and back.</summary>
					/// <field name="streetNumber" type="String">Gets or sets the street number.</field>
					/// <field name="street" type="String">Gets or sets the street.</field>
					/// <field name="city" type="String">Gets or sets the city.</field>
					/// <field name="zip" type="String">Gets or sets the zip code.</field>
					/// <field name="stateOrProvince" type="String">Gets or sets the state or province.</field>
					/// <field name="country" type="String">Gets or sets the country.</field>
					/// <field name="isValid" type="String">Indicates whether the address is valid.</field>
				},
				AIVision: function () {
					/// <summary>[v12.3] Represents a service for AI image recognition.</summary>
					/// <field name="action" type="number">Sets action for AI vision service. Capture photo or Select picture.</field>
					/// <field name="settings" type="Array">Array sets of json formated prediction key and url.</field>
					this._isNew = true;
					this._entityName = "";
				},
				AIVisionSettings: function () {
					/// <summary>[v12.3] Represents the settings for AI image recognition service.</summary>
					/// <field name="modelName" type="String">Gets or sets the model name.</field>
					/// <field name="predictionKey" type="String">Gets or sets the model prediction key.</field>
					/// <field name="url" type="String">Gets or sets the url to train model.</field>
					/// <field name="serviceType" type="String">Gets or sets the service type. By default we use Azure.</field>
					this.modelName = "";
					this.predictionKey = "";
					this.url = "";
					this.serviceType = "Azure"; // [v12.3] supports only azure service, used as default.
				}
			}
	    };

		/************************/
		// Prototypes & Statics //
		/************************/
		MobileCRM.Bridge.prototype._callAsyncMethod = function (cmdId, result) {
			if (result instanceof Promise) {
				result.then(function (asyncRes) {
					MobileCRM.bridge.command(cmdId, typeof (asyncRes) == "string" ? asyncRes : JSON.stringify(asyncRes));
				}).catch(function (err) {
					MobileCRM.bridge.command(cmdId, "Err:" + err);
				});
				return cmdId;
			}
			else
				return typeof (result) == "string" ? result : JSON.stringify(result);
		}
		// MobileCRM.UI._MediaTab
		MobileCRM.UI.MediaTab.prototype._onCommand = function (commandIndex, errorCallback) {
			/// <summary>Executes the MediaTab command by index.</summary>
			/// <param name="commandIndex" type="Number">Specifies the command index.</param>
			///	<param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
			var mediaTab = MobileCRM.bridge.exposeObjectAsync("EntityForm.Controllers.get_Item", [this.index]);
			mediaTab.invokeMethodAsync("View.ExecuteAction", [commandIndex], function () { }, errorCallback);
			mediaTab.release();
		};
		MobileCRM.UI.MediaTab.prototype.setEditable = function (editable, errorCallback) {
			/// <summary>[v11.1] Marks the MediaTab as editable.</summary>
			/// <param name="editable" type="Boolean">Indicates whether to mark MediaTab as editable.</param>
			/// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
			var mediaTab = MobileCRM.bridge.exposeObjectAsync("EntityForm.Controllers.get_Item", [this.index]);
			mediaTab.invokeMethodAsync("set_IsEditable", [editable], function () { }, errorCallback);
			mediaTab.release();
		};
		MobileCRM.UI.MediaTab.prototype.setCommandsMask = function (commandMask, errorCallback) {
			/// <summary>[v11.1] Sets the mask of allowed document actions.</summary>
			/// <param name="commandMask" type="Number">Specifies the mask of allowed commands.</param>
			/// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
			var mediaTab = MobileCRM.bridge.exposeObjectAsync("EntityForm.Controllers.get_Item", [this.index]);
			mediaTab.invokeMethodAsync("set_CommandsMask", [commandMask], function () { }, errorCallback);
			mediaTab.release();
		};
		MobileCRM.AboutInfo.requestObject = function (callback, errorCallback, scope) {
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
			}, errorCallback, scope);
		};
		MobileCRM.UI.MediaTab.prototype.capturePhoto = function (errorCallback) {
			/// <summary>Captures photo on this media tab.</summary>
			this._onCommand(2, errorCallback);
		};
		MobileCRM.UI.MediaTab.prototype.selectPhoto = function (errorCallback) {
			/// <summary>Executes the select photo command on this media tab.</summary>
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
	    MobileCRM.UI.MediaTab.prototype.open = function (errorCallback) {
	        /// <summary>Opens the loaded document in a external application. Which application is platform specific.</summary>
	        this._onCommand(0x4000, errorCallback);
	    }
	    MobileCRM.UI.MediaTab.prototype.export = function (errorCallback) {
	        /// <summary>Saves to file to disk.</summary>
	        this._onCommand(0x8000000, errorCallback);
	    }
	    MobileCRM.UI.MediaTab.prototype.print = function (errorCallback) {
	        /// <summary>Prints the document.</summary>
	        this._onCommand(0x80000, errorCallback);
	    }
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
		MobileCRM.UI.MediaTab.getDataAsync = function (viewName) {
			/// <summary>[v8.0] Gets the media tab document in form of base64 string.</summary>
			/// <param name="viewName" type="String">The name of the media tab.</param>
			/// <returns type="Promise&lt;string&gt;">A Promise object which will be resolved with the base64-encoded document data.</returns>
			return MobileCRM.bridge.invokeCommandPromise("getViewData", viewName);
		};
		MobileCRM.UI.MediaTab.prototype.getDataAsync = function () {
			/// <summary>[v8.0] Gets the media tab document in form of base64 string.</summary>
			/// <returns type="Promise&lt;string&gt;">A Promise object which will be resolved with the base64-encoded document data.</returns>
			return MobileCRM.UI.MediaTab.getDataAsync(this.name);
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
	    MobileCRM.UI.MediaTab.prototype.getNoteSubject = function (callback, errorCallback, scope) {
	        /// <summary>[v10.1] Asynchronously gets the subject text of the note loaded on the media tab.</summary>
	        /// <param name="callback" type="function(String)">The callback function that is called asynchronously with the media tab note subject.</param>
	        /// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
	        /// <param name="scope" type="Object">The scope for callbacks.</param>
	        var mediaTab = MobileCRM.bridge.exposeObjectAsync("EntityForm.Controllers.get_Item", [this.index]);
	        mediaTab.invokeMethodAsync("get_NoteSubject", [], callback, errorCallback, scope);
	        mediaTab.release();
	    };
	    MobileCRM.UI.MediaTab.prototype.setNoteSubject = function (subject, errorCallback, scope) {
	        /// <summary>[v10.1] Asynchronously sets the name of the note to load (and save).</summary>
	        /// <param name="subject" type="String">The name of the note to load (and save).</param>
	        /// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
	        /// <param name="scope" type="Object">The scope for callbacks.</param>
	        var mediaTab = MobileCRM.bridge.exposeObjectAsync("EntityForm.Controllers.get_Item", [this.index]);
	        mediaTab.invokeMethodAsync("set_NoteSubject", [subject], function () { }, errorCallback, scope);
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
		MobileCRM.Bridge.prototype.invokeCommandPromise = function (command, args) {
			return new Promise(function (resolve, reject) {
				MobileCRM.bridge.command(command, args, resolve, function (err) { reject(new Error(err)); });
			});
		}
		MobileCRM.Bridge.prototype.invokeMethodPromise = function (objectName, method, paramsList) {
			/// <summary>Invokes a method on exposed managed object asynchronously as a Promise.</summary>
			/// <param name="objectName" type="String">The name of exposed managed object as it was registered on C# side (IJavascriptBridge.ExposeObject).</param>
			/// <param name="method" type="String">The name of the method implemented by object class.</param>
			/// <param name="paramsList" type="Array">An array with parameters that should be passed to a method.</param>
			/// <returns type="Promise&lt;any&gt;">A Promise object which will be resolved with JSON-serialized return value. It is either generic type or <see cref="MobileCRM.ObservableObject">MobileCRM.ObservableObject</see> with JSON-serialized return value..</returns>
			return MobileCRM.bridge.invokeCommandPromise("invokeMethod", objectName + "." + method + JSON.stringify(paramsList));
		}
		MobileCRM.Bridge.prototype.invokeStaticMethodPromise = function (assembly, typeName, method, paramsList) {
			/// <summary>Invokes a static method on specified type asynchronously as a Promise.</summary>
			/// <param name="assembly" type="String">The name of the assembly which defines the type.</param>
			/// <param name="typeName" type="String">The full name of the C# type which implements the method.</param>
			/// <param name="method" type="String">The name of static method to be invoked.</param>
			/// <param name="paramsList" type="Array">An array with parameters that should be passed to a method.</param>
			/// <returns type="Promise&lt;any&gt;">A Promise object which will be resolved with JSON-serialized return value. It is either generic type or <see cref="MobileCRM.ObservableObject">MobileCRM.ObservableObject</see> with JSON-serialized return value..</returns>
			return MobileCRM.bridge.invokeCommandPromise("invokeMethod", (assembly ? (assembly + ":") : "") + typeName + "." + method + JSON.stringify(paramsList));
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
				return 'Err:' + _safeErrorMessage(exception);
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
				return _safeErrorMessage(exception);
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
	    var _alertQueue = [];
	    MobileCRM.Bridge.prototype.alert = function (text, callback, scope) {
	        /// <summary>Shows a message asynchronously and calls the callback after it is closed by user.</summary>
	        /// <param name="callback" type="function(obj)">The callback function that is called asynchronously.</param>
	        /// <param name="scope" type="Object">The scope for callbacks.</param>
	        _alertQueue.push(function () {
	            window.alert(text); // when called directly, alert hangs up on iOS9 (if called from callback invoked from native code)
	            if (callback)
	                callback.call(scope);
	        });
	        window.setTimeout(function(){
	        	var nextWorker = _alertQueue.splice(0, 1);
	        	nextWorker[0]();
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
		MobileCRM.ExposedObject.prototype.invokeMethodPromise = function (method, paramsList) {
			/// <summary>Invokes a method on exposed managed object and returns the result asynchronously via callback.</summary>
			/// <param name="objectName" type="String">The name of exposed managed object as it was registered on C# side (IJavascriptBridge.ExposeObject).</param>
			/// <param name="method" type="String">The name of the method implemented by object class.</param>
			/// <param name="paramsList" type="Array">An array with parameters that should be passed to a method.</param>
			/// <returns type="Promise&lt;any&gt;">A Promise object which will be resolved with JSON-serialized return value. It is either generic type or <see cref="MobileCRM.ObservableObject">MobileCRM.ObservableObject</see> with JSON-serialized return value..</returns>
			return MobileCRM.bridge.invokeMethodPromise("#exposedObj#" + this.id, method, paramsList);
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
		MobileCRM.ObservableObject.prototype.runCallback = function (callback, scope) {
			/// <summary>Invokes callback passing this instance of ObservableObject as argument.</summary>
	        /// <param name="callback" type="function">The callback function.</param>
	        /// <param name="scope" type="Object">The scope for callback.</param>
	        /// <returns type="Object">An object clone containing all properties changed during the callback call.</returns>
			var obj = this;
			if (callback.call(scope, obj) != false) {
				var changed = obj.getChanged();
				return changed;
			}
			return '';
		}
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
				return obj.runCallback(callback, scope);
	        }, errorCallback, scope);
	    };
	    // MobileCRM._Settings
	    MobileCRM._Settings = {
	        /// <summary>MobileCRM configuration settings class.</summary>
	        /// <field name="afterSaveReload" type="Number">Gets options for default after save behavior &quot;None = 0, New = 1,Always = 2&quot;</field>
	        /// <field name="authenticationType" type="Number">Gets possible CRM server authentication methods. &quot;AD = 0, PassPort = 1,SPLA = 2,PassportEMEA = 3,PassportAPAC = 4 &quot;</field>
	        /// <field name="businessUnitId" type="String">Gets or sets the current user's business unit id.</field>
	        /// <field name="canUsePassword" type="Boolean">Gets whether there is a valid password and whether it can be used.</field>
	        /// <field name="crm2011AuthId" type="String">Gets or sets the discovered CRM service authentication server identifier.</field>
	        /// <field name="crm2011AuthType" type="String">Gets or sets the discovered CRM service authentication server type.</field>
	        /// <field name="crm2011AuthUrl" type="String">Gets or sets the discovered CRM service authentication server url.</field>
	        /// <field name="crmOnlineDeviceToken" type="String">Gets or sets the token (cookie) issued by LiveId services identifying this device.</field>
	        /// <field name="crmOnlineDeviceTokenExpires" type="Date">Gets when CrmOnlineDeviceToken expires (UTC).</field>
	        /// <field name="crmWebServiceMinorVersion" type="Number">Gets or sets the discovered CRM service minor version (13 - for CRM 2011 Rollup 13 and up).</field>
	        /// <field name="crmWebServiceVersion" type="Number">Gets or sets the discovered CRM service version (4,5).</field>
	        /// <field name="currencyDecimalPrecision" type="Number">Gets or sets the organization Pricing Decimal Precision configuration option (0..4).</field>
	        /// <field name="currencyDisplayOption" type="Number">Gets or sets the currency field display option 0- Symbol ($), 1 - Code (USD).</field>
	        /// <field name="currencyFormatCode" type="Number">Gets or sets the currency field display option 0- $123, 1-123$, 2-$ 123, 3-123 $.</field>
	        /// <field name="customerId" type="MobileCRM.Reference">Gets or sets the customer when application is running in customer mode. <see cref="MobileCRM.Reference">MobileCRM.Reference</see> object instance as argument</field>
	        /// <field name="customerUserId" type="MobileCRM.Reference">Gets or sets the CustomerUserId when application is running in customer mode. <see cref="MobileCRM.Reference">MobileCRM.Reference</see> object instance as argument</field>
	        /// <field name="deviceFriendlyName" type="String">Gets or sets the device friendly name e.g. &quot;Steve's iPhone&quot;.</field>
	        /// <field name="deviceIdentifier" type="String">Gets or sets the hardware unique id.</field>
	        /// <field name="deviceInfo" type="String">Gets or sets the device system an hardware information e.g. &quot;Hewlett-Packard HP ProBook 6450b\tMicrosoft Windows NT 6.1.7600.0&quot;</field>
	        /// <field name="internalDeviceId" type="String">Gets the device id.</field>
	        /// <field name="disableSyncAnalyzer" type="Boolean">Gets or sets whether the synchronization should use the SyncAnalyzer step.</field>
	        /// <field name="discountCalculationMethod" type="Number">Gets or sets the option for calculating the discount 0 - apply after (Price*Quantity)-Discount , 1- apply before (Price-Discount)*Quantity.</field>
	        /// <field name="duplicateDetection" type="Number">Gets whether duplicate detection is enabled and whether to detect against the local database, online, or always online. &quot;Disabled = 0, Enabled = 1,AlwaysOnline = 2&quot;</field>
	        /// <field name="enableAdvancedFind" type="Boolean">Gets or sets whether to enabled advanced find functionality. Default true.</field>
	        /// <field name="enableListButtons" type="Boolean">Enables list buttons. Default is true.</field>
	        /// <field name="enableListSearchButtons" type="Boolean">Gets or sets whether to allow list search buttons.</field>
	        /// <field name="forceCustomizationDownload" type="Boolean">Gets or sets a value indicating whether the customization download is forced.</field>
	        /// <field name="forcedFullSyncDate" type="Date">Gets or sets the date when the device must be full synced. If the last sync was before this date, the next sync must be full.</field>
	        /// <field name="forgetPassword" type="Boolean">Gets or sets whether password can be used for next login.</field>
	        /// <field name="fullScreenForms" type="Boolean">Gets or sets whether to show forms maximized by default. Can be overridden per form in Woodford.</field>
	        /// <field name="googleEmail" type="String">Gets or sets the Google account email.</field>
	        /// <field name="gPSAccuracy" type="Number">Gets or sets the default accuracy (in meters) when resolving the current position.</field>
	        /// <field name="gPSMaxAge" type="Number">Gets or sets the default maximum age (in seconds) of the last result when resolving the current position.</field>
	        /// <field name="isOnlineCrm" type="Boolean">Gets whether the last login was for a CRM Online instance.</field>
	        /// <field name="maxAttachmentSize" type="Number">Gets or sets the maximum attachment size to sync (in bytes).</field>
	        /// <field name="onlineNoLock" type="Boolean">Gets or sets whether to use "no-lock" in fetchXml during online mode.</field>
	        /// <field name="organizationId" type="String">Gets or sets the current user's organization id (given by the server).</field>
	        /// <field name="saveBehavior" type="Number">Gets options for default after save behavior &quot;Default = 0, SaveOnly = 1,SaveAndClose = 2&quot;</field>
	        /// <field name="saveSignatureAsImage" type="Boolean">Gets or sets whether to store signature attachments as SVG (vector) or PNG (image).</field>
	        /// <field name="serverHostName" type="String">Gets the server host name.</field>
	        /// <field name="serverSettingsVersion" type="String">Gets the version of the settings file as send with the customization.</field>
	        /// <field name="serverVersion" type="Number">Gets or sets the server version, either 4 for CRM 4.0 or 5 for CRM 2011.</field>
	        /// <field name="showPersonalContacts" type="Boolean">Gets or sets whether to show contacts from the user's personal address book.</field>
	        /// <field name="showSystemCalendars" type="Boolean">Gets or sets whether to show private calendars in calendars.</field>
	        /// <field name="systemUserId" type="String">Gets or sets the current user id (given by the server).</field>
	        /// <field name="teams" type="Array<String>">Gets the array of ids of teams the current user is member of.</field>
	        /// <field name="useCrmEmail" type="Boolean">Gets or sets whether to create a CRM email entity or use the platform email service.</field>
	        /// <field name="useDatabaseBlobStore" type="Boolean">Gets or sets whether to store attachment blobs in database or in files. If you change this setting you must perform a full sync!</field>
	        /// <field name="useFlexiForms" type="Boolean">Gets or sets whether flexi forms (New UI).</field>
	        /// <field name="googleApiKey" type="String">Gets or sets the google API key.</field>
	    }

	    MobileCRM.CultureInfo.currentCulture = null;
	    MobileCRM.CultureInfo.initialize = function (callback, errorCallback, scope) {
	        /// <summary>[v10.2] Initializes the CultureInfo object.</summary>
	        /// <remarks><p>Method loads the current culture information asynchronously and calls either the <b>errorCallback</b> with error message or the <b>callback</b> with initialized CultureInfo object.</p><p>All other functions will return the default or empty string before the initialization finishes.</p></remarks>
	        /// <param name="callback" type="function(currentCulture)">The callback function that is called asynchronously with initialized CultureInfo object as argument.</param>
	        /// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is to be called in case of error.</param>
	        /// <param name="scope" type="Object">The scope for callbacks.</param>
	        MobileCRM.bridge.command("getCultureInfo", '', function (res) {
	            MobileCRM.CultureInfo.currentCulture = res;
	            if (callback)
	                callback.call(scope, res);
	        }, errorCallback, scope);
	    }
		MobileCRM.CultureInfo.initializeAsync = function () {
			/// <summary>[v10.2] Initializes the CultureInfo object.</summary>
			/// <remarks><p>Method loads the current culture information asynchronously.</p><p>All other functions will return the default or empty string before the initialization promise is resolved.</p></remarks>
			/// <returns type="Promise&lt;MobileCRM.CultureInfo&gt;">A Promise object which will be resolved with the loaded CultureInfo object.</returns>
			return new Promise(function (resolve, reject) {
				MobileCRM.CultureInfo.initialize(resolve, function (err) { reject(new Error(err)); });
			});
		}

		MobileCRM.CultureInfo.load = function (culture, callback, errorCallback, scope) {
			/// <summary>[v10.2] Asynchronously gets the CultureInfo object for specified language/country.</summary>
			/// <param name="culture" type="String">The name of culture that has to be loaded. The culture name is in the format language code-country where language code is a lowercase two-letter code derived from ISO 639-1. country is derived from ISO 3166 and usually consists of two uppercase letters</param>
			/// <param name="callback" type="function(cultureInfo)">The callback function that is called asynchronously with initialized CultureInfo object as argument.</param>
			/// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is to be called in case of error.</param>
			/// <param name="scope" type="Object">The scope for callbacks.</param>
			MobileCRM.bridge.command("getCultureInfo", culture || '', function (res) {
				if (callback)
					callback.call(scope, res);
			}, errorCallback, scope);
		};
		MobileCRM.CultureInfo.loadAsync = function (culture) {
			/// <summary>[v10.2] Asynchronously gets the CultureInfo object for specified language/country.</summary>
			/// <param name="culture" type="String">The name of culture that has to be loaded. The culture name is in the format language code-country where language code is a lowercase two-letter code derived from ISO 639-1. country is derived from ISO 3166 and usually consists of two uppercase letters</param>
			/// <returns type="Promise&lt;MobileCRM.CultureInfo&gt;">A Promise object which will be resolved with the loaded CultureInfo object.</returns>
			return MobileCRM.bridge.invokeCommandPromise("getCultureInfo", culture || '');
		};

	    MobileCRM.CultureInfo.shortDateString = function (date) {
	        /// <summary>[v10.2] Returns the short date string that matches current device culture.</summary>
	        /// <remarks>This method fails if <see cref="MobileCRM.CultureInfo.initialize">CultureInfo.initialize</see> method hasn't completed yet.</remarks>
	        /// <param name="date" type="Date">A date being formatted.</param>
	        return MobileCRM.CultureInfo.formatDate(date, MobileCRM.CultureInfo.currentCulture.dateTimeFormat.shortDatePattern)
	    };

	    MobileCRM.CultureInfo.longDateString = function (date) {
	        /// <summary>[v10.2] Returns the long date string that matches current device culture.</summary>
	        /// <remarks>This method fails if <see cref="MobileCRM.CultureInfo.initialize">CultureInfo.initialize</see> method hasn't completed yet.</remarks>
	        /// <param name="date" type="Date">A date being formatted.</param>
	        return MobileCRM.CultureInfo.formatDate(date, MobileCRM.CultureInfo.currentCulture.dateTimeFormat.longDatePattern)
	    };

	    MobileCRM.CultureInfo.shortTimeString = function (date) {
	        /// <summary>[v10.2] Returns the short time string that matches current device culture.</summary>
	        /// <remarks>This method fails if <see cref="MobileCRM.CultureInfo.initialize">CultureInfo.initialize</see> method hasn't completed yet.</remarks>
	        /// <param name="date" type="Date">A date being formatted.</param>
	        return MobileCRM.CultureInfo.formatDate(date, MobileCRM.CultureInfo.currentCulture.dateTimeFormat.shortTimePattern)
	    };

	    MobileCRM.CultureInfo.longTimeString = function (date) {
	        /// <summary>[v10.2] Returns the long time string that matches current device culture.</summary>
	        /// <remarks>This method fails if <see cref="MobileCRM.CultureInfo.initialize">CultureInfo.initialize</see> method hasn't completed yet.</remarks>
	        /// <param name="date" type="Date">A date being formatted.</param>
	        return MobileCRM.CultureInfo.formatDate(date, MobileCRM.CultureInfo.currentCulture.dateTimeFormat.longTimePattern)
	    };

	    MobileCRM.CultureInfo.fullDateTimeString = function (date) {
	        /// <summary>[v10.2] Returns the date and time string that matches current device culture.</summary>
	        /// <remarks>This method fails if <see cref="MobileCRM.CultureInfo.initialize">CultureInfo.initialize</see> method hasn't completed yet.</remarks>
	        /// <param name="date" type="Date">A date being formatted.</param>
	        return MobileCRM.CultureInfo.formatDate(date, MobileCRM.CultureInfo.currentCulture.dateTimeFormat.fullDateTimePattern)
	    };

	    MobileCRM.CultureInfo.monthDayString = function (date) {
	        /// <summary>[v10.2] Returns the month and day string that matches current device culture.</summary>
	        /// <remarks>This method fails if <see cref="MobileCRM.CultureInfo.initialize">CultureInfo.initialize</see> method hasn't completed yet.</remarks>
	        /// <param name="date" type="Date">A date being formatted.</param>
	        return MobileCRM.CultureInfo.formatDate(date, MobileCRM.CultureInfo.currentCulture.dateTimeFormat.monthDayPattern)
	    };

	    MobileCRM.CultureInfo.yearMonthString = function (date) {
	        /// <summary>[v10.2] Returns the year and month string that matches current device culture.</summary>
	        /// <remarks>This method fails if <see cref="MobileCRM.CultureInfo.initialize">CultureInfo.initialize</see> method hasn't completed yet.</remarks>
	        /// <param name="date" type="Date">A date being formatted.</param>
	        return MobileCRM.CultureInfo.formatDate(date, MobileCRM.CultureInfo.currentCulture.dateTimeFormat.yearMonthPattern)
	    };

		MobileCRM.CultureInfo.formatDate = function (date, format) {
			/// <summary>[v10.2] Returns the formatted date/time string that matches current device culture.</summary>
			/// <remarks>This method fails if <see cref="MobileCRM.CultureInfo.initialize">CultureInfo.initialize</see> method hasn't completed yet.</remarks>
			/// <param name="date" type="Date">A date being formatted.</param>
			/// <param name="format" type="String">Custom format string that meets the <see cref="https://docs.microsoft.com/en-us/dotnet/standard/base-types/custom-date-and-time-format-strings">MSDN Sepcification</see>.</param>
			var df = MobileCRM.CultureInfo.currentCulture.dateTimeFormat;
			var zeroPad = function (num, length, dontCut) {
				var st = "" + num;
				if (st.length > length)
					return dontCut ? st : st.substr(0, length);
				while (st.length < length)
					st = "0" + st;
				return st;
			};
			var trimDigits = function (num, length) {
				var st = "" + num;
				if (st.length > length)
					return st.substr(0, length);
				return st;
			};
			var hoursTo12h = function (h) {
				return h <= 12 ? h : (h % 12);
			};
			var i = 0;
			var fLen = format.length;
			var res = "";
			while (i < fLen) {
				var c = format.charAt(i);
				switch (c) {
					case 'd': // Day
						if (format.charAt(++i) === 'd') {
							if (format.charAt(++i) === 'd') {
	    						if (format.charAt(++i) === 'd') {
	    							res += df.dayNames[date.getDay()];
	    							i++;
	    						}
	    						else
	    							res += df.abbreviatedDayNames[date.getDay()];
	    					}
	    					else
	    						res += zeroPad(date.getDate(), 2, false);
	    				} else
	    					res += date.getDate();
	    				break;
	    			case 'f':
	    				if (format.charAt(++i) === 'f') {
	    					if (format.charAt(++i) === 'f') {
	    						if (format.charAt(++i) === 'f') {
	    							if (format.charAt(++i) === 'f') {
	    								if (format.charAt(++i) === 'f') {
	    									if (format.charAt(++i) === 'f') {
	    										res += date.getMilliseconds();
	    										i++;
	    									}
	    									else
	    										res += date.getMilliseconds();
	    								}
	    								else
	    									res += date.getMilliseconds();
	    							}
	    							else
	    								res += date.getMilliseconds();
	    						}
	    						else
	    							res += date.getMilliseconds();
	    					}
	    					else
	    						res += trimDigits(date.getMilliseconds(), 2);
	    				}
	    				else
	    					res += trimDigits(date.getMilliseconds(), 1);
	    				break;
	    			case 'F':
	    				if (format.charAt(++i) === 'F') {
	    					if (format.charAt(++i) === 'F') {
	    						if (format.charAt(++i) === 'F') {
	    							if (format.charAt(++i) === 'F') {
	    								if (format.charAt(++i) === 'F') {
	    									if (format.charAt(++i) === 'F') {
	    										res += zeroPad(date.getMilliseconds(), 7, false);
	    										i++;
	    									}
	    									else
	    										res += zeroPad(date.getMilliseconds(), 6, false);
	    								}
	    								else
	    									res += zeroPad(date.getMilliseconds(), 5, false);
	    							}
	    							else
	    								res += zeroPad(date.getMilliseconds(), 4, false);
	    						}
	    						else
	    							res += zeroPad(date.getMilliseconds(), 3, false);
	    					}
	    					else
	    						res += zeroPad(date.getMilliseconds(), 2, false);
	    				}
	    				else
	    					res += zeroPad(date.getMilliseconds(), 1, false);
	    				break;
	    			case 'g':
	    				if (format.charAt(++i) === 'g') {
	    					res += "A.D.";
	    					i++;
	    				}
	    				else
	    					res += "AD";
	    				break;
	    			case 'h':
	    				if (format.charAt(++i) === 'h') {
	    					res += zeroPad(hoursTo12h(date.getHours()), 2, false);
	    					i++;
	    				}
	    				else
	    					res += hoursTo12h(date.getHours());
	    				break;
	    			case 'H':
	    				if (format.charAt(++i) === 'H') {
	    					res += zeroPad(date.getHours(), 2, false);
	    					i++;
	    				}
	    				else
	    					res += date.getHours();
	    				break;
	    			case 'K':
	    				var o = -date.getTimezoneOffset();
	    				res += (o < 0 ? "-" : "") + zeroPad(Math.abs(o / 60), 2, false) + ":" + zeroPad(o % 60, 2, false);
	    				i++;
	    				break;
	    			case 'm':
	    				if (format.charAt(++i) === 'm') {
	    					res += zeroPad(date.getMinutes(), 2, false);
	    					i++;
	    				}
	    				else
	    					res += date.getMinutes();
	    				break;
	    			case 's':
	    				if (format.charAt(++i) === 's') {
	    					res += zeroPad(date.getSeconds(), 2, false);
	    					i++;
	    				}
	    				else
	    					res += date.getSeconds();
	    				break;
	    			case 'M':
	    				if (format.charAt(++i) === 'M') {
	    					if (format.charAt(++i) === 'M') {
	    						if (format.charAt(++i) === 'M') {
	    							res += df.monthGenitiveNames[date.getMonth()];
	    							i++;
	    						}
	    						else
	    							res += df.abbreviatedMonthGenitiveNames[date.getMonth()];
	    					}
	    					else
	    						res += zeroPad(date.getMonth() + 1, 2, false);
	    				} else
	    					res += date.getMonth() + 1;
	    				break;
	    			case 't':
	    				if (format.charAt(++i) === 't')
	    					i++;

	    				res += date.getHours() < 12 ? df.aMDesignator : df.pMDesignator;
	    				break;
	    			case 'y':
	    				if (format.charAt(++i) === 'y') {
	    					if (format.charAt(++i) === 'y') {
	    						if (format.charAt(++i) === 'y') {
	    							if (format.charAt(++i) === 'y') {
	    								res += zeroPad(date.getFullYear(), 5, true);
	    								i++;
	    							}
	    							else
	    								res += zeroPad(date.getFullYear(), 4, true);
	    						}
	    						else
	    							res += zeroPad(date.getFullYear(), 3, true);
	    					} else
	    						res += zeroPad(date.getFullYear() % 100, 2, false);
	    				}
	    				else
	    					res += date.getFullYear() % 100;
	    				break;
	    			case 'z':
	    				if (format.charAt(++i) === 'z') {
	    					var o = -date.getTimezoneOffset();
	    					if (format.charAt(++i) === 'z') {
	    						res += (o < 0 ? "-" : "") + zeroPad(Math.abs(o / 60), 2, false) + ":" + zeroPad(o % 60, 2, false);
	    						i++;
	    					}
	    					else
	    						res += (o < 0 ? "-" : "") + zeroPad(Math.abs(o / 60), 2, false);
	    				}
	    				else
	    					res += -date.getTimezoneOffset() / 60;
	    			case '/':
	    				res += (typeof (df.dateSeparator) == "string") ? df.dateSeparator : '/';
	    				i++;
	    				break;
	    			case ':':
	    				res += (typeof (df.timeSeparator) == "string") ? df.timeSeparator : ':';
	    				i++;
	    				break;
	    			default:
	    				res += c;
	    				i++;
	    				break;
				}
			}
			return res;
		};

	    //MobileCRM.Localization
	    MobileCRM.Localization.initialize = function (callback, errorCallback, scope) {
	        /// <summary>Initializes the Localization object.</summary>
	        /// <remarks><p>Method loads the string table asynchronously and calls either the <b>errorCallback</b> with error message or the <b>callback</b> with initialized Localization object.</p><p>All other functions will return the default or empty string before the initialization finishes.</p></remarks>
	        /// <param name="callback" type="function(config)">The callback function that is called asynchronously with initialized Localization object as argument.</param>
	        /// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is to be called in case of error.</param>
	        /// <param name="scope" type="Object">The scope for callbacks.</param>
	        MobileCRM.Localization.initializeEx(null, callback, errorCallback, scope);
	    };
	    MobileCRM.Localization.initializeEx = function (regularExpression, callback, errorCallback, scope) {
	        /// <summary>[v10.0] Initializes the Localization object.</summary>
	        /// <remarks><p>Method loads the string table asynchronously and calls either the <b>errorCallback</b> with error message or the <b>callback</b> with initialized Localization object.</p><p>All other functions will return the default or empty string before the initialization finishes.</p></remarks>
	        /// <param name="regularExpression" type="string">The regular expression defining a subset of localization keys. Refer to <see cref="https://msdn.microsoft.com/en-us/library/az24scfc(v=vs.110).aspx">Regular Expression Language - Quick Reference</see>. Set to null to obtain whole localization.</param>
	        /// <param name="callback" type="function(config)">The callback function that is called asynchronously with initialized Localization object as argument.</param>
	        /// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is to be called in case of error.</param>
	        /// <param name="scope" type="Object">The scope for callbacks.</param>
	        MobileCRM.bridge.command("localizationInit", regularExpression || '', function (res) {
	            MobileCRM.Localization.stringTable = res;
	            MobileCRM.Localization.initialized = true;
	            if (callback)
	                callback.call(scope, MobileCRM.Localization);
	        }, errorCallback, scope);
	    };
		MobileCRM.Localization.initializeAsync = function (regularExpression) {
			/// <summary>[v10.0] Initializes the Localization object.</summary>
			/// <remarks><p>Method loads the string table asynchronously and resolves pending promise with initialized Localization object.</p><p>All other functions will return the default or empty string before the initialization finishes.</p></remarks>
			/// <param name="regularExpression" type="string">Optional regular expression defining a subset of localization keys. Refer to <see cref="https://msdn.microsoft.com/en-us/library/az24scfc(v=vs.110).aspx">Regular Expression Language - Quick Reference</see>. Set to null to obtain whole localization.</param>
			/// <returns type="Promise&lt;MobileCRM.Localization&gt;">A Promise object which will be resolved with initialized Localization object as argument.</returns>
			return new Promise(function (resolve, reject) {
				MobileCRM.Localization.initializeEx(regularExpression, resolve, function (err) { reject(new Error(err)); });
			});
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
	        MobileCRM.bridge.command('referenceload', JSON.stringify({ entity: entityName, id: id }), success, failed, scope);
	    };
		MobileCRM.Reference.loadAsync = function (entityName, id) {
			/// <summary>Asynchronously loads the CRM reference.</summary>
			/// <param name="entityName" type="String">An entity name</param>
			/// <param name="id" type="String">The reference ID.</param>
			/// <returns type="Promise&lt;MobileCRM.Reference&gt;">A Promise object which will be resolved with an instance of Reference object representing entity record reference.</returns>
			return MobileCRM.bridge.invokeCommandPromise('referenceload', JSON.stringify({ entity: entityName, id: id }));
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

		// MobileCRM.ActivityParty
		_inherit(MobileCRM.ActivityParty, MobileCRM.Reference);

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
	        MobileCRM.bridge.command('entitydelete', cmdParams, success, failed, scope);
	    };
		MobileCRM.DynamicEntity.deleteAsync = function (entityName, id) {
			/// <summary>Asynchronously deletes the CRM entity.</summary>
			/// <param name="entityName" type="String">The logical name of the entity, e.g. "account".</param>
			/// <param name="id" type="String">GUID of the existing entity or null for new one.</param>
			/// <returns type="Promise&lt;void&gt;">A Promise object which will be resolved after the entity record is deleted.</returns>
			var request = { entity: entityName, id: id };
			var cmdParams = JSON.stringify(request);
			return MobileCRM.bridge.invokeCommandPromise('entitydelete', cmdParams);
		};
	    MobileCRM.DynamicEntity.loadById = function (entityName, id, success, failed, scope) {
	        /// <summary>Asynchronously loads the CRM entity properties.</summary>
	        /// <param name="entityName" type="String">The logical name of the entity, e.g. "account".</param>
	        /// <param name="id" type="String">GUID of the existing entity or null for new one.</param>
	        /// <param name="success" type="function(result)">A callback function for successful asynchronous result. The <b>result</b> argument will carry the MobileCRM.DynamicEntity object.</param>
	        /// <param name="failed" type="function(error)">A callback function for command failure. The <b>error</b> argument will carry the error message.</param>
	        /// <param name="scope" type="">A scope for calling the callbacks; set &quot;null&quot; to call the callbacks in global scope.</param>
	        MobileCRM.bridge.command('entityload', JSON.stringify({ entity: entityName, id: id }), success, failed, scope);
	    };
		MobileCRM.DynamicEntity.loadAsync = function (entityName, id) {
			/// <summary>Asynchronously loads the CRM entity properties.</summary>
			/// <param name="entityName" type="String">The logical name of the entity, e.g. "account".</param>
			/// <param name="id" type="String">GUID of the existing entity or null for new one.</param>
			/// <returns type="Promise&lt;MobileCRM.DynamicEntity&gt;">A Promise object which will be resolved with an instance of DynamicEntity object representing entity record.</returns>
			return MobileCRM.bridge.invokeCommandPromise('entityload', JSON.stringify({ entity: entityName, id: id }));
		};

		MobileCRM.DynamicEntity.saveMultiple = function (updatedEntities, online, sucessCallback, failureCallback, scope) {
			/// <summary>Saves an entities instances to storage.Where the entity is stored is determined by how it was loaded: online / offline.</summary>
			/// <param name="updatedEntities" type="MobileCRM.DynamicEntity[]">Array of MobileCRM.DynamicEntity.</param>
			/// <param name="online" type="Boolean">Whether to load and save online or offline. Null for default mode defined by current configuration.</param>
			/// <param name="sucessCallbacak" type="function(result)">A callback function for successful asynchronous result.</param>
			/// <param name="failureCallback" type="function(error)">A callback function for command failure. The <b>error</b> argument will carry the error message.</param>
			/// <param name="scope" type="">A scope for calling the callbacks; set &quot;null&quot; to call the callbacks in global scope.</param>

			MobileCRM.DynamicEntity._executeMultiple(online, updatedEntities, null, sucessCallback, failureCallback, scope);
		};
		MobileCRM.DynamicEntity.deleteMultiple = function (deletedEntities, online, sucessCallback, failureCallback, scope) {
			/// <summary>Saves an entity instance to storage.Where the entity is stored is determined by how it was loaded: online / offline.</summary>
			/// <param name="deletedEntities" type="MobileCRM.DynamicEntity[]">Array of MobileCRM.DynamicEntity or MobileCRM.Reference what will be deleted.</param>
			/// <param name="sucessCallbacak" type="function(result)">A callback function for successful asynchronous result.</param>
			/// <param name="failureCallback" type="function(error)">A callback function for command failure. The <b>error</b> argument will carry the error message.</param>
			/// <param name="online" type="Boolean">Whether to load and save online or offline. Null for default mode defined by current configuration.</param>
			/// <param name="scope" type="">A scope for calling the callbacks; set &quot;null&quot; to call the callbacks in global scope.</param>

			MobileCRM.DynamicEntity._executeMultiple(online, null, deletedEntities, sucessCallback, failureCallback, scope);
		};

		MobileCRM.DynamicEntity._executeMultiple = function (online, updateEntities, deleteEntities, sucessCallback, failureCallback, scope) {
			var data = {
				updateEntities: null,
				deleteEntities: null,
				online: online
			};

			if (updateEntities) {
				data.updateEntities = [];
				for (var ue in updateEntities) {
					data.updateEntities.push("" + JSON.stringify(updateEntities[ue]) + "");
				}
			}
			else if (deleteEntities) {
				data.deleteEntities = [];
				for (var de in deleteEntities) {
					var entity = deleteEntities[de];
					data.deleteEntities.push(JSON.stringify({ entity: entity.entityName, id: entity.id }));
				}
			}

			MobileCRM.bridge.command('executeMultiple', JSON.stringify(data), sucessCallback, failureCallback, scope);
		};

	    MobileCRM.DynamicEntity.saveDocumentBody = function (entityId, entityName, relationship, filePath, mimeType, success, failed, scope) {
	        /// <summary>[v10.0]Asynchronously saves the document body for specified entity.</summary>
	        /// <remarks>Function sends an asynchronous request to application, where the locally stored document body (e.g. the annotation.documentbody) is saved.</remarks>
	        /// <param name="entityId" type="String">GUID of the existing entity or &quot;null&quot; for new one.</param>
	        /// <param name="entityName" type="String">The logical name of the entity; optional, default is &quot;annotation&quot;.</param>
	        /// <param name="relationship" type="MobileCRM.Relationship">The relationship with parent object.</param>
	        /// <param name="filePath" type="String">Absolute or app data-relative path to the file holding the body.</param>
	        /// <param name="mimeType" type="String">MimeType of the content, optional.</param>
	        /// <param name="success" type="function(MobileCRM.Reference)">A callback function for successful asynchronous result. The <b>result</b> argument will carry the <see cref="MobileCRM.Reference">Reference</see> to updated/created entity.</param>
	        /// <param name="failed" type="function(error)">A callback function for command failure. The <b>error</b> argument will carry the error message.</param>
	        /// <param name="scope" type="">A scope for calling the callbacks; set &quot;null&quot; to call the callbacks in global scope.</param>
	        MobileCRM.bridge.command('documentBodysave', JSON.stringify({ entity: entityName, id: entityId, relationship: relationship, filePath: filePath, mimeType: mimeType }), success, failed, scope);
	    };
		MobileCRM.DynamicEntity.saveDocumentBodyAsync = function (entityId, entityName, relationship, filePath, mimeType) {
			/// <summary>[v10.0]Asynchronously saves the document body for specified entity.</summary>
			/// <remarks>Function sends an asynchronous request to application, where the locally stored document body (e.g. the annotation.documentbody) is saved.</remarks>
			/// <param name="entityId" type="String">GUID of the existing entity or &quot;null&quot; for new one.</param>
			/// <param name="entityName" type="String">The logical name of the entity; optional, default is &quot;annotation&quot;.</param>
			/// <param name="relationship" type="MobileCRM.Relationship">The relationship with parent object.</param>
			/// <param name="filePath" type="String">Absolute or app data-relative path to the file holding the body.</param>
			/// <param name="mimeType" type="String">MimeType of the content, optional.</param>
			/// <returns type="Promise&lt;MobileCRM.Reference&gt;">A Promise object which will be resolved with the <see cref="MobileCRM.Reference">Reference</see> object representing updated/created entity.</returns>
			return MobileCRM.bridge.invokeCommandPromise('documentBodysave', JSON.stringify({ entity: entityName, id: entityId, relationship: relationship, filePath: filePath, mimeType: mimeType }));
		};
	    MobileCRM.DynamicEntity.loadDocumentBody = function (entityName, id, success, failed, scope) {
	        /// <summary>Asynchronously loads the document body for specified entity.</summary>
	        /// <remarks>Function sends an asynchronous request to application, where the locally stored document body (e.g. the annotation.documentbody) is encoded to base64 and sent back to the Javascript callback. This function supports both online data and the data stored in local database/BLOB store.</remarks>
	        /// <param name="entityName" type="String">The logical name of the entity, in most cases "annotation".</param>
	        /// <param name="id" type="String">GUID of the existing entity or null for new one.</param>
	        /// <param name="success" type="function(result)">A callback function for successful asynchronous result. The <b>result</b> argument will carry the string with base64-encoded data.</param>
	        /// <param name="failed" type="function(error)">A callback function for command failure. The <b>error</b> argument will carry the error message.</param>
	        /// <param name="scope" type="">A scope for calling the callbacks; set &quot;null&quot; to call the callbacks in global scope.</param>
	        MobileCRM.bridge.command('documentBodyload', JSON.stringify({ entity: entityName, id: id }), success, failed, scope);
	    };
		MobileCRM.DynamicEntity.loadDocumentBodyAsync = function (entityName, id) {
			/// <summary>Asynchronously loads the document body for specified entity.</summary>
			/// <remarks>Function sends an asynchronous request to application, where the locally stored document body (e.g. the annotation.documentbody) is encoded to base64 and pending Javascript promise is resolved. This function supports both online data and the data stored in local database/BLOB store.</remarks>
			/// <param name="entityName" type="String">The logical name of the entity, in most cases "annotation".</param>
			/// <param name="id" type="String">GUID of the existing entity or null for new one.</param>
			/// <returns type="Promise&lt;string&gt;">A Promise object which will be resolved with base64-encoded data string.</returns>
			return MobileCRM.bridge.invokeCommandPromise('documentBodyload', JSON.stringify({ entity: entityName, id: id }));
		};
	    MobileCRM.DynamicEntity.unzipDocumentBody = function (entityName, id, targetDir, success, failed, scope) {
	        /// <summary>[v9.1] Asynchronously unpacks the document body (assumes it's a zip file) for specified entity.</summary>
	        /// <param name="entityName" type="String">The logical name of the entity, in most cases the "annotation".</param>
	        /// <param name="id" type="String">GUID of the existing entity or null for new one.</param>
	        /// <param name="targetDir" type="String">The relative path of the target directory within the application storage.</param>
	        /// <param name="success" type="function(result)">A callback function for successful asynchronous result. The <b>result</b> argument will carry the string with base64-encoded data.</param>
	        /// <param name="failed" type="function(error)">A callback function for command failure. The <b>error</b> argument will carry the error message.</param>
	        /// <param name="scope" type="">A scope for calling the callbacks; set &quot;null&quot; to call the callbacks in global scope.</param>
	        MobileCRM.bridge.command('documentBodyUnzip', targetDir + ';' + JSON.stringify({ entity: entityName, id: id }), success, failed, scope);
	    };
	    MobileCRM.DynamicEntity.downloadAttachment = function (entityName, id, success, failed, scope) {
	        /// <summary>[v9.1] Initiates the attachment download for specified entity.</summary>
	        /// <remarks>Function sends an asynchronous request to application, which downloads the document body (e.g. the annotation) from server and sends it back to the Javascript callback.</remarks>
	        /// <param name="entityName" type="String">The logical name of the entity, in most cases "annotation".</param>
	        /// <param name="id" type="String">GUID of the existing entity or null for new one.</param>
	        /// <param name="success" type="function(result)">A callback function for successful asynchronous result. The <b>result</b> argument will carry the string with base64-encoded data.</param>
	        /// <param name="failed" type="function(error)">A callback function for command failure. The <b>error</b> argument will carry the error message.</param>
	        /// <param name="scope" type="">A scope for calling the callbacks; set &quot;null&quot; to call the callbacks in global scope.</param>

	        MobileCRM.bridge.command("downloadAttachment", JSON.stringify({ entity: entityName, id: id }), success, failed, scope);
		}
		MobileCRM.DynamicEntity.downloadAttachmentAsync = function (entityName, id) {
			/// <summary>[v9.1] Initiates the attachment download for specified entity.</summary>
			/// <remarks>Function sends an asynchronous request to application, which downloads the document body (e.g. the annotation) from server and resolves pending Javascript promise.</remarks>
			/// <param name="entityName" type="String">The logical name of the entity, in most cases "annotation".</param>
			/// <param name="id" type="String">GUID of the existing entity or null for new one.</param>
			/// <returns type="Promise&lt;string&gt;">A Promise object which will be resolved with base64-encoded data string.</returns>

			return MobileCRM.bridge.invokeCommandPromise("downloadAttachment", JSON.stringify({ entity: entityName, id: id }));
		}
	    MobileCRM.DynamicEntity.prototype.save = function (callback, forceMode) {
	        /// <summary>Performs the asynchronous CRM create/modify entity command.</summary>
	        /// <param name="callback" type="function(err)">A callback function for asynchronous result. The <b>err</b> argument will carry the error message or null in case of success. The callback is called in scope of DynamicEntity object which is being saved.</param>
	        /// <param name="forceMode" type="Boolean">[v10.0.2] Optional parameter which forces online/offline mode for saving. Set &quot;true&quot; to save entity online; &quot;false&quot; to save it offline. Any other value (including &quot;undefined&quot;) causes entity tobe saved in currently selected application offline/online mode.</param>
	        var props = this.properties;
	        if (props._privVals)
	            props = props._privVals;
	        var request = { entity: this.entityName, id: this.id, properties: props, isNew: this.isNew, isOnline: this.isOnline };
	        if (forceMode === true || forceMode === false)
				request.isOnlineForce = forceMode;
			if (this.forceDirty)
				request.forceDirty = this.forceDirty;
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

		MobileCRM.DynamicEntity.prototype.saveAsync = function (forceMode) {
			/// <summary>Performs the asynchronous CRM create/modify entity command.</summary>
			/// <param name="forceMode" type="Boolean">Optional parameter which forces online/offline mode for saving. Set &quot;true&quot; to save entity online; &quot;false&quot; to save it offline. Any other value (including &quot;undefined&quot;) causes entity to be saved in currently selected application offline/online mode.</param>
			/// <returns type="Promise&lt;DynamicEntity&gt;">A Promise object which will be resolved with saved DynamicEntity object as result.</returns>
			var _this = this;
			return new Promise(function (resolve, reject) {
				_this.save(function (err) {
					if (err)
						reject(new Error(err));
					else
						resolve(this);
				}, forceMode);
			});
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
	        /// <param name="optionSetName" type="String">The OptionSet name.</param>
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
	    MobileCRM.Metadata.getStringListOptions = function (entityName, propertyName) {
	        /// <summary>Gets the list of options for the string list property.</summary>
	        /// <param name="entityName" type="String">The entity name.</param>
	        /// <param name="propertyName" type="String">The string list property name.</param>
	        var options = {};
	        var keyPrefix = entityName + "." + propertyName + ".";
	        for(var key in MobileCRM.Localization.stringTable)
	        {
	            var label = MobileCRM.Localization.stringTable[key];
	            if(key.substring(0, keyPrefix.length) === keyPrefix) {
	                options[key] = label;
	            }
	        }
	        return options;
	    }

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
	        return _findInArray(this.properties, "name", name);
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
			var reqParams = JSON.stringifyNotNull({ entity: this.entity, resultformat: output, page: this.page, count: this.count, aggregate: this.aggregate, distinct: this.distinct });
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

		MobileCRM.FetchXml.Fetch.prototype.executeAsync = function (output, online) {
	        /// <summary>Performs the asynchronous CRM Fetch request.</summary>
	        /// <param name="output" type="String">A string defining the output format: Array, JSON, XML or DynamicEntities.</param>
	        /// <param name="online" type="Boolean">Optional parameter determining whether the fetch should be executed online or offline. If omitted, function respects current online/offline mode of the app.</param>
	        /// <returns type="Promise&lt;any[]&gt;">A Promise object which will be resolved with array of objects having type specified by <b>output</b> argument.</returns>
	    	var _this = this;
	    	return new Promise(function (resolve, reject) {
	    		var format = "";
	    		if (online === true || online === false)
	    			format = online ? "Online." : "Offline.";
	    		if (output)
	    			format += output;
				_this.execute(format, resolve, function (err) { reject(new Error(err)); });
	    	});
	    };

	    MobileCRM.FetchXml.Fetch.deserializeFromXml = function (xml, success, failed, scope) {
	        /// <summary>Deserializes the Fetch object from XML.</summary>
	        /// <param name="xml" type="String">A string defining the fetch XML request.</param>
	        /// <param name="success" type="function(result: MobileCRM.FetchXml.Fetch)">A callback function for successful asynchronous result. The <b>result</b> argument will carry the Fetch object.</param>
	        /// <param name="failed" type="function(error)">A callback function for command failure. The <b>error</b> argument will carry the error message.</param>
	        /// <param name="scope" type="">A scope for calling the callbacks; set &quot;null&quot; to call the callbacks in global scope.</param>
	        MobileCRM.bridge.invokeStaticMethodAsync("MobileCrm.Data", "MobileCrm.Data.FetchXml.Fetch", "Deserialize", [xml], success, failed, scope);
	    };
		MobileCRM.FetchXml.Fetch.deserializeFromXmlAsync = function (xml) {
			/// <summary>Deserializes the Fetch object from XML.</summary>
	        /// <param name="xml" type="String">A string defining the fetch XML request.</param>
			/// <returns type="Promise&lt;MobileCRM.FetchXml.Fetch&gt;">A Promise object which will be resolved with the Fetch object.</returns>
			return MobileCRM.bridge.invokeStaticMethodPromise("MobileCrm.Data", "MobileCrm.Data.FetchXml.Fetch", "Deserialize", [xml]);
		};

	    MobileCRM.FetchXml.Fetch.prototype.serializeToXml = function (success, failed, scope) {
	        /// <summary>[v10.0] Serializes the Fetch object to XML.</summary>
	        /// <param name="success" type="function(String)">A callback function for successful asynchronous result. The <b>result</b> argument will carry the XML representation of the Fetch object.</param>
	        /// <param name="failed" type="function(error)">A callback function for command failure. The <b>error</b> argument will carry the error message.</param>
	        /// <param name="scope" type="">A scope for calling the callbacks; set &quot;null&quot; to call the callbacks in global scope.</param>
			var reqParams = JSON.stringifyNotNull({ entity: this.entity, page: this.page, count: this.count, aggregate: this.aggregate, distinct: this.distinct });
	        MobileCRM.bridge.command('fetchToXml', reqParams, success, failed, scope);
	    };
		MobileCRM.FetchXml.Fetch.prototype.serializeToXmlAsync = function () {
			/// <summary>[v10.0] Serializes the Fetch object to XML.</summary>
			/// <returns type="Promise&lt;string&gt;">A Promise object which will be resolved with the XML representation of this Fetch object.</returns>
			var reqParams = JSON.stringifyNotNull({ entity: this.entity, page: this.page, count: this.count, aggregate: this.aggregate, distinct: this.distinct });
			return MobileCRM.bridge.invokeCommandPromise('fetchToXml', reqParams);
		};

	    // MobileCRM.FetchXml.Entity
	    MobileCRM.FetchXml.Entity.prototype.addAttribute = function (name, alias, aggregate) {
	        /// <summary>Adds an entity attribute to the fetch query.</summary>
	        /// <param name="name" type="String">The attribute (CRM logical field name) to order by.</param>
	        /// <param name="alias" type="String">Optional parameter defining an attribute alias.</param>
	        /// <param name="aggregate" type="String">Optional parameter defining an aggregation function.</param>
	        /// <returns type="MobileCRM.FetchXml.Attribute">The newly created MobileCRM.FetchXml.Attribute object</returns>
	        var attr = new MobileCRM.FetchXml.Attribute(name);
	        if (alias)
	            attr.alias = alias;
	        if (aggregate)
	            attr.aggregate = aggregate;
	        this.attributes.push(attr);
	        return attr;
	    };
	    MobileCRM.FetchXml.Entity.prototype.addAttributes = function () {
	        /// <summary>Adds all entity attributes to the fetch query.</summary>
	        this.allattributes = true;
	    };
	    MobileCRM.FetchXml.Entity.prototype.addFilter = function () {
	        /// <summary>Adds a filter for this fetch entity.</summary>
	        /// <returns type="MobileCRM.FetchXml.Filter">Existing or newly created entity filter.</returns>
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
	    MobileCRM.FetchXml.Entity.prototype.removeLink = function (link) {
	        /// <summary>Removes an entity link from the fetch query.</summary>
	        /// <param name="link" type="MobileCRM.FetchXml.LinkEntity">The MobileCRM.FetchXml.LinkEntity object to remove.</param>
	        /// <returns type="Array">The list of remaining <see cref="MobileCRM.FetchXml.LinkEntity">LinkEntity</see> objects or null if the link does not exists.</returns>
	        var index = this.linkentities.indexOf(link);
	        if (index !== -1) {
	            this.linkentities.splice(index, 1);
	            return this.linkentities;
	        }
	        return null;
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
	    MobileCRM.Platform.makeCall = function (telephone, errorCallback, scope) {
	        /// <summary>[v8.0] Opens the platform-specific call application with specified phone number.</summary>
	        /// <param name="telephone" type="String">Telephone number</param>
	        /// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called asynchronously in case of error.</param>
	        /// <param name="scope" type="Object">The scope for errorCallback.</param>
	        var tel = { Address: telephone };
	        _executePlatformAction(0, tel, function () { }, errorCallback, scope);
	    }
	    MobileCRM.Platform.sendSMS = function (phoneNumber, text, errorCallback, scope) {
	        /// <summary>[v11.2.3] Opens the platform-specific sms application with specified phone number and pre-fill text.</summary>
	        /// <param name="phoneNumber" type="String">Phone number</param>
	        /// <param name="text" type="String">SMS text</param>
	        /// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called asynchronously in case of error.</param>
	        /// <param name="scope" type="Object">The scope for errorCallback.</param>
	        var tel = { Address: phoneNumber, Body: text };
	        _executePlatformAction(2, tel, function () { }, errorCallback, scope);
	    }
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
		MobileCRM.Platform.sendEmail = function (address, subject, body, mimeType, errorCallback, scope) {
			/// <summary>[v15.0] Opens the platform-specific e-mail message form with pre-filled data.</summary>
			/// <param name="address" type="String">Recipient&#39;s email address.</param>
			/// <param name="subject" type="String">An e-mail subject.</param>
			/// <param name="body" type="String">A string with email body.</param>
			/// <param name="mimeType" type="String">Body content MIME type.</param>
			/// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called asynchronously in case of error.</param>
			/// <param name="scope" type="Object">The scope for errorCallback.</param>

			var emailContent = { Address: address, Subject: subject, Body: body, MimeType: mimeType };
			_executePlatformAction(1, emailContent, null, errorCallback, scope);
		};
	    MobileCRM.Platform.openDocument = function (path, mimeType, args, errorCallback, scope) {
	        /// <summary>[v8.1] Opens specified document in associated program.</summary>
	        /// <remarks>Apple security policy doesn&amp;t allow this functionality on iOS.</remarks>
	        /// <param name="path" type="String">A path to the document file.</param>
	        /// <param name="mimeType" type="String">Document MIME type (required on Android).</param>
	        /// <param name="args" type="String">Optional arguments for Windows 7 command line.</param>
	        /// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called asynchronously in case of error.</param>
	        /// <param name="scope" type="Object">The scope for errorCallback.</param>

	        var c = { Address: path, Subject: args, MimeType: mimeType };
	        _executePlatformAction(5, c, null, errorCallback, scope);
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
		MobileCRM.Platform.getNetworkInfo = function (success, failed, scope) {
			/// <summary>[v11.2] Gets network information.</summary>
			/// <param name="success" type="function(result)">A callback function for successful asynchronous result. The <b>result</b> will carry an object with properties <b>connected</b> and <b>fastConnection</b>.</param>
			/// <param name="failed" type="function(error)">A callback function for command failure. The <b>error</b> argument will carry the error message.</param>
			/// <param name="scope" type="">A scope for calling the callbacks; set &quot;null&quot; to call the callbacks in global scope.</param>
			MobileCRM.bridge.command("getNetworkInfo", null, success, failed, scope);
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
	    MobileCRM.Platform.scanBarCodeRequiredLength = function (requiredLength, success, failed, scope) {
	        /// <summary>Activates the bar-code scanning.</summary>
	        /// <remarks>If the current platform does not support the bar-code scanning, the <b>failed</b> handler is called with error "Unsupported".</remarks>
	        /// <param name="requiredLength" type="Number">Set required length of scanned barcode.</param>
	        /// <param name="success" type="function(result)">A callback function for successful asynchronous result. The <b>result</b> will carry an array of strings with scanned codes.</param>
	        /// <param name="failed" type="function(error)">A callback function for command failure. The <b>error</b> argument will carry the error message.</param>
	        /// <param name="scope" type="">A scope for calling the callbacks; set &quot;null&quot; to call the callbacks in global scope.</param>
	        MobileCRM.bridge.command("scanBarcode", JSON.stringify({ "RequiredLength": requiredLength }), success, failed, scope);
	    };
	    MobileCRM.Platform.getLocation = function (success, failed, scope, age, precision, timeout) {
	        /// <summary>Gets current geo-location from platform-specific location service.</summary>
	        /// <remarks>If the current platform does not support the location service, the <b>failed</b> handler is called with error "Unsupported".</remarks>
	        /// <param name="success" type="function(result)">A callback function for successful asynchronous result. The <b>result</b> will carry an object with properties <b>latitude</b>, <b>longitude</b> and <b>timestamp</b>	.</param>
	        /// <param name="failed" type="function(error)">A callback function for command failure. The <b>error</b> argument will carry the error message.</param>
	        /// <param name="scope" type="">A scope for calling the callbacks; set &quot;null&quot; to call the callbacks in global scope.</param>
	        /// <param name="age" type="Number">Max age in seconds to accept GPS.</param>
	        /// <param name="precision" type="Number">Desired accuracy in meters.</param>
	        /// <param name="timeout" type="Number">Timeout in milliseconds (since v10.1).</param>
	        var params = { maxAge: age, accuracy: precision };
	        if (timeout)
	            params.timeout = timeout;
	        MobileCRM.bridge.command("getLocation", JSON.stringify(params), success, failed, scope);
	    };
		MobileCRM.Platform.getLocationAsync = function (age, precision, timeout) {
			/// <summary>Gets current geo-location from platform-specific location service.</summary>
			/// <remarks>If the current platform does not support the location service, returned Promise is rejected with error "Unsupported".</remarks>
			/// <param name="age" type="Number">Max age in seconds to accept GPS.</param>
			/// <param name="precision" type="Number">Desired accuracy in meters.</param>
			/// <param name="timeout" type="Number">Timeout in milliseconds (since v10.1).</param>
			/// <returns type="Promise&lt;object&gt;">A Promise object which will be resolved with an object having <b>latitude</b> and <b>longitude</b> properties.</returns>
			var params = { maxAge: age, accuracy: precision };
			if (timeout)
				params.timeout = timeout;
			return MobileCRM.bridge.invokeCommandPromise("getLocation", JSON.stringify(params));
		};
	    MobileCRM.Platform.preventBackButton = function (handler, scope) {
	        /// <summary>Prevents application to close when HW back button is pressed and installs handler which is called instead.</summary>
	        /// <remarks><p>Pass &quot;null&quot; handler to allow the HW back button.</p><p>Works only under OS having HW back button (Android, Windows 10).</p></remarks>
	        /// <param name="handler" type="function()">Handler function which will be called each time when user presses the Android HW back button.</param>
	        MobileCRM.bridge.command("setBackButtonHandler", handler ? MobileCRM.bridge._createCmdObject(handler, null, scope) : null, handler, null, scope);
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
	    MobileCRM.Application.showAppLogin = function () {
	        /// <summary>Causes that the password is forgotten and user is required to type it again to make the app running.</summary>
	        MobileCRM.bridge.invokeStaticMethodAsync("MobileCrm", "MobileCrm.SecurityManager", "OpenLoginForm", []);
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

	    MobileCRM.Application.checkUserRoles = function (roles, success, failed, scope) {
	        /// <summary>Checks whether the current user is member of the passed roles. Role can be either the Guid (aeb33d0f-89b4-e111-9c9a-00155d0b710a) or the role Name.</summary>
	        /// <param name="roles" type="Array(String)">Defines the roles to check.</param>
	        /// <param name="success" type="function(result)">A callback function for successful asynchronous result. The <b>result</b> will carry a number with the count of matching roles.</param>
	        /// <param name="failed" type="function(error)">A callback function for command failure. The <b>error</b> argument will carry the error message.</param>
	        /// <param name="scope" type="">A scope for calling the callbacks; set &quot;null&quot; to call the callbacks in global scope.</param>
	        MobileCRM.bridge.command("checkUserRoles", JSON.stringify(roles), success, failed, scope);
		};

		MobileCRM.Application.setAppColors = function (colors, success, failed, scope) {
			/// <summary>[v11.2] Sets the application colors.</summary>
			/// <param name="colors" type="object">Properties of the object define the colors to set. The values must be int in the AARRGGBB format.</param>
			/// <param name="success" type="function(result)">A callback function for successful asynchronous result.</param>
			/// <param name="failed" type="function(error)">A callback function for command failure. The <b>error</b> argument will carry the error message.</param>
			/// <param name="scope" type="">A scope for calling the callbacks; set &quot;null&quot; to call the callbacks in global scope.</param>
			MobileCRM.bridge.command("setAppColors", JSON.stringify(colors), success, failed, scope);
		};

	    MobileCRM.Application.fileExists = function (path, success, failed, scope) {
	        /// <summary>Checks whether the file with given path exists in application local data.</summary>
	        /// <param name="path" type="String">Defines the relative path of the file located in the application local data.</param>
	        /// <param name="success" type="function(result)">A callback function for successful asynchronous result. The <b>result</b> will carry a Boolean object determining whether the file exists or not.</param>
	        /// <param name="failed" type="function(error)">A callback function for command failure. The <b>error</b> argument will carry the error message.</param>
	        /// <param name="scope" type="">A scope for calling the callbacks; set &quot;null&quot; to call the callbacks in global scope.</param>
	        MobileCRM.bridge.invokeStaticMethodAsync("MobileCrm.Data", "MobileCrm.Configuration", "Instance.FileExists", [path], success, failed, scope);
	    };
	    MobileCRM.Application.fileExistsAsync = function (path) {
	        /// <summary>Checks whether the file with given path exists in application local data.</summary>
	        /// <param name="path" type="String">Defines the relative path of the file located in the application local data.</param>
	        return MobileCRM.bridge.invokeStaticMethodPromise("MobileCrm.Data", "MobileCrm.Configuration", "Instance.FileExists", [path]);
	    };

	    MobileCRM.Application.directoryExists = function (path, success, failed, scope) {
	        /// <summary>Checks whether the directory with given path exists in the application local data.</summary>
	        /// <param name="path" type="String">Defines the relative path of the directory located in the application local data.</param>
	        /// <param name="success" type="function(result)">A callback function for successful asynchronous result. The <b>result</b> will carry a Boolean object determining whether the directory exists or not.</param>
	        /// <param name="failed" type="function(error)">A callback function for command failure. The <b>error</b> argument will carry the error message.</param>
	        /// <param name="scope" type="">A scope for calling the callbacks; set &quot;null&quot; to call the callbacks in global scope.</param>
	        MobileCRM.bridge.invokeStaticMethodAsync("MobileCrm.Data", "MobileCrm.Configuration", "Instance.DirectoryExists", [path], success, failed, scope);
	    };
	    MobileCRM.Application.directoryExistsAsync = function (path) {
	        /// <summary>Checks whether the directory with given path exists in the application local data.</summary>
	        /// <param name="path" type="String">Defines the relative path of the directory located in the application local data.</param>
	        return MobileCRM.bridge.invokeStaticMethodPromise("MobileCrm.Data", "MobileCrm.Configuration", "Instance.DirectoryExists", [path]);
	    };

	    MobileCRM.Application.createDirectory = function (path, success, failed, scope) {
	        /// <summary>Asynchronously creates the directory in the application local data.</summary>
	        /// <param name="path" type="String">Defines the relative path of the directory in the application local data.</param>
	        /// <param name="success" type="function(result)">A callback function which is called in case of successful asynchronous result.</param>
	        /// <param name="failed" type="function(error)">A callback function for command failure. The <b>error</b> argument will carry the error message.</param>
	        /// <param name="scope" type="">A scope for calling the callbacks; set &quot;null&quot; to call the callbacks in global scope.</param>
	        MobileCRM.bridge.invokeStaticMethodAsync("MobileCrm.Data", "MobileCrm.Configuration", "Instance.CreateDirectory", [path], success, failed, scope);
	    };
	    MobileCRM.Application.createDirectoryAsync = function (path) {
	        /// <summary>Asynchronously creates the directory in the application local data.</summary>
	        /// <param name="path" type="String">Defines the relative path of the directory in the application local data.</param>
	        return MobileCRM.bridge.invokeStaticMethodPromise("MobileCrm.Data", "MobileCrm.Configuration", "Instance.CreateDirectory", [path]);
	    };

	    MobileCRM.Application.deleteDirectory = function (path, success, failed, scope) {
	        /// <summary>Asynchronously deletes the empty directory from the application local data.</summary>
	        /// <param name="path" type="String">Defines the relative path of the directory in the application local data.</param>
	        /// <param name="success" type="function(result)">A callback function which is called in case of successful asynchronous result.</param>
	        /// <param name="failed" type="function(error)">A callback function for command failure. The <b>error</b> argument will carry the error message.</param>
	        /// <param name="scope" type="">A scope for calling the callbacks; set &quot;null&quot; to call the callbacks in global scope.</param>
	        MobileCRM.bridge.invokeStaticMethodAsync("MobileCrm.Data", "MobileCrm.Configuration", "Instance.DeleteDirectory", [path], success, failed, scope);
	    };
	    MobileCRM.Application.deleteDirectoryAsync = function (path) {
	        /// <summary>Asynchronously deletes the empty directory from the application local data.</summary>
	        /// <param name="path" type="String">Defines the relative path of the directory in the application local data.</param>
	        return MobileCRM.bridge.invokeStaticMethodPromise("MobileCrm.Data", "MobileCrm.Configuration", "Instance.DeleteDirectory", [path]);
	    };

		MobileCRM.Application.getDirectories = function (path, success, failed, scope) {
	        /// <summary>Asynchronously gets the list of directories from the application local data.</summary>
	        /// <param name="path" type="String">Defines the relative path of the Directory in the application local data.</param>
	        /// <param name="success" type="function(result)">A callback function which carry the array of directories names.</param>
	        /// <param name="failed" type="function(error)">A callback function for command failure. The <b>error</b> argument will carry the error message.</param>
	        /// <param name="scope" type="">A scope for calling the callbacks; set &quot;null&quot; to call the callbacks in global scope.</param>

	        MobileCRM.bridge.invokeStaticMethodAsync("MobileCrm.Data", "MobileCrm.Configuration", "Instance.GetDirectories", [path], success, failed, scope);
	    };
		MobileCRM.Application.getDirectoriesAsync = function (path) {
	        /// <summary>Asynchronously gets the list of directories from the application local data.</summary>
	        /// <param name="path" type="String">Defines the relative path of the Directory in the application local data.</param>
	        return MobileCRM.bridge.invokeStaticMethodPromise("MobileCrm.Data", "MobileCrm.Configuration", "Instance.GetDirectories", [path]);
	    };

	    MobileCRM.Application.deleteFile = function (path, success, failed, scope) {
	        /// <summary>Asynchronously deletes the file from the application local data.</summary>
	        /// <param name="path" type="String">Defines the relative path of the file in the application local data.</param>
	        /// <param name="success" type="function(result)">A callback function which is called in case of successful asynchronous result.</param>
	        /// <param name="failed" type="function(error)">A callback function for command failure. The <b>error</b> argument will carry the error message.</param>
	        /// <param name="scope" type="">A scope for calling the callbacks; set &quot;null&quot; to call the callbacks in global scope.</param>

	        MobileCRM.bridge.invokeStaticMethodAsync("MobileCrm.Data", "MobileCrm.Configuration", "Instance.DeleteFile", [path], success, failed, scope);
	    };
	    MobileCRM.Application.deleteFileAsync = function (path) {
	        /// <summary>Asynchronously deletes the file from the application local data.</summary>
	        /// <param name="path" type="String">Defines the relative path of the file in the application local data.</param>
	        return MobileCRM.bridge.invokeStaticMethodPromise("MobileCrm.Data", "MobileCrm.Configuration", "Instance.DeleteFile", [path]);
	    };

	    MobileCRM.Application.getFiles = function (path, success, failed, scope) {
	        /// <summary>Asynchronously gets the list of files from the application local data.</summary>
	        /// <param name="path" type="String">Defines the relative path of the Directory in the application local data.</param>
	        /// <param name="success" type="function(result)">A callback function which carry the array of files names in the directory.</param>
	        /// <param name="failed" type="function(error)">A callback function for command failure. The <b>error</b> argument will carry the error message.</param>
	        /// <param name="scope" type="">A scope for calling the callbacks; set &quot;null&quot; to call the callbacks in global scope.</param>

	        MobileCRM.bridge.invokeStaticMethodAsync("MobileCrm.Data", "MobileCrm.Configuration", "Instance.GetFiles", [path], success, failed, scope);
	    };
	    MobileCRM.Application.getFilesAsync = function (path) {
	        /// <summary>Asynchronously gets the list of files from the application local data.</summary>
	        /// <param name="path" type="String">Defines the relative path of the Directory in the application local data.</param>
	        return MobileCRM.bridge.invokeStaticMethodPromise("MobileCrm.Data", "MobileCrm.Configuration", "Instance.GetFiles", [path]);
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
	    MobileCRM.Application.moveFileAsync = function (src, dst) {
	        /// <summary>Asynchronously moves the application local file to another location.</summary>
	        /// <param name="src" type="String">Defines the relative path of the source file in the application local data.</param>
	        /// <param name="dst" type="String">Defines the relative path of the destination file in the application local data.</param>
	        return MobileCRM.bridge.invokeStaticMethodPromise("MobileCrm.Data", "MobileCrm.Configuration", "Instance.MoveFile", [src, dst]);
	    };

	    MobileCRM.Application.readFile = function (path, success, failed, scope) {
	        /// <summary>Reads the file from the application local data and asynchronously gets its content.</summary>
	        /// <param name="path" type="String">Defines the relative path of the file in the application local data.</param>
	        /// <param name="success" type="function(result)">A callback function for successful asynchronous result. The <b>result</b> will carry a String object with the file content.</param>
	        /// <param name="failed" type="function(error)">A callback function for command failure. The <b>error</b> argument will carry the error message.</param>
	        /// <param name="scope" type="">A scope for calling the callbacks; set &quot;null&quot; to call the callbacks in global scope.</param>
	        if (MobileCRM.bridge.platform === "WebClient") {
	            // MR: we have to branch the code here :/ (its always better not to branch the code like this) 
	            // otherwise it throws 3 object not exposed and method not found errors on web client 
	            // we want to show one nicer message instead.
	            // in future: lets not go mad with all those exposings of C# objects and lets use the single method invocations or javascriptcallbacks
	        	var params = { path: path };
	        	MobileCRM.bridge.command("readFromLocalStorage", JSON.stringify(params), success, failed, scope);
	        }
	        else {
	            var reader = MobileCRM.bridge.exposeObjectAsync("MobileCrm.Data:MobileCrm.Configuration.Instance.OpenStorageReader", [path]);
	            reader.invokeMethodAsync("ReadToEnd", [], success, failed, scope);
	            reader.invokeMethodAsync("Dispose", [], undefined, failed, scope);
	            reader.release();
	        }
	    };
		MobileCRM.Application.readFileAsync = function(path, encoding) {
	        /// <summary>[v15.3] Reads the file from the application local data and asynchronously gets its content.</summary>
	        /// <param name="path" type="String">Defines the relative path of the file in the application local data.</param>
	        /// <param name="encoding" type="String">Defines the text encoding for file content (default is UTF8). Use base64 for binary files. Supported values: UTF8, UTF16 ASCII, BASE64.</param>
			return MobileCRM.bridge.invokeCommandPromise("readFromLocalStorage", JSON.stringify({path: path, encoding: encoding}));
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
	        if (MobileCRM.bridge.platform === "WebClient") {
	            // MR: see comment in readFile function
	        	var params = { path: path, text: text };
	        	MobileCRM.bridge.command("writeToLocalStorage", JSON.stringify(params), success, failed, scope);
	        }
	        else {
	            var reader = MobileCRM.bridge.exposeObjectAsync("MobileCrm.Data:MobileCrm.Configuration.Instance.OpenStorageWriter", [path, append]);	// MR: same comment as in function above
	            reader.invokeMethodAsync("Write", [text], success, failed, scope);
	            reader.invokeMethodAsync("Dispose", [], undefined, failed, scope);
	            reader.release();
	        }
	    };
		MobileCRM.Application.writeFileAsync = function(path, text, encoding) {
	        /// <summary>[v15.3] Asynchronously writes data into the file from the application local data.</summary>
	        /// <param name="path" type="String">Defines the relative path of the file in the application local data.</param>
	        /// <param name="text" type="String">Defines the file content (in corresponding text encoding) to be written.</param>
	        /// <param name="encoding" type="String">Defines the text encoding for file content data. Use base64 for binary files. Supported values: UTF8, ASCII, BASE64.</param>
			return MobileCRM.bridge.invokeCommandPromise("writeToLocalStorage", JSON.stringify({path: path, text: text, encoding: encoding}));
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
	        if (MobileCRM.bridge.platform === "WebClient") {
	            // MR: see comment in readFile function
	            if (failed) {
	                failed.call(scope || this, "You cannot write to a file on the Web Client");
	            }
	        }
	        else {
	            var reader = MobileCRM.bridge.exposeObjectAsync("MobileCrm.Data:MobileCrm.Configuration.Instance.OpenStorageWriterEnc", [path, append, (encoding || null)]);	// MR: same comment as in function above
	            reader.invokeMethodAsync("Write", [text], success, failed, scope);
	            reader.invokeMethodAsync("Dispose", [], undefined, failed, scope);
	            reader.release();
	        }
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

	    MobileCRM.Application.getAccessToken = function (resourceUrl, successCallback, failureCallback, scope) {
	    	/// <param name="resourceUrl" type="String">The resource.</param>
	    	/// <param name="successCallback" type="function(textAccessToken)">A callback function what is called asynchronously with serialized <b>access token</b> as argument.</param>
	    	/// <param name="failureCallback" type="function(error)">A callback function for command failure. The <b>error</b> argument will carry the error message.</param>
	    	/// <param name="scope" type="">A scope for calling the callbacks; set &quot;null&quot; to call the callbacks in global scope.</param>

	    	MobileCRM.bridge.command("GetAccessToken", JSON.stringify({ resource: resourceUrl }), successCallback, failureCallback, scope);
		};

		MobileCRM.Application.getLastSignificantTimeChange = function (success, failed, scope) {
			/// <summary>[v13.3.1] Gets the last detected time change.</summary>
	        /// <param name="success" type="function()">A callback function which is called in case of success. Callback will receive an object with &quot;lastChange&quot date and &quot;delta&quot; time in sceonds.</summary> </param>
	        /// <param name="failed" type="function(error)">A callback function for command failure. The <b>error</b> argument will carry the error message.</param>
	        /// <param name="scope" type="">A scope for calling the callbacks; set &quot;null&quot; to call the callbacks in global scope.</param>
			MobileCRM.bridge.command("getLastSignificantTimeChange", null, success, failed);
		};

		MobileCRM.Integration.getOAuthAccessToken = function (configurationName, oauthSettings, prompt, successCallback, failureCallback, scope) {
			/// <summary>[12.3]Asynchronously gets the token using passed OAuth settings and parameters. Configuration name is used to find already settings.</summary>
			/// <param name="configurationName" type="String">Define the name of oauth configuration, what is key for saved setting if any.</param>
			/// <param name="oauthSettings" type="MobileCRM.OAuthSettings">Defines the OAuth settings for authentication.</param>
			/// <param name="prompt" type="Boolean">Whether to force the user to enter credentials again.</param>
			/// <param name="success" type="function(result)">A callback function for successful asynchronous result. The <b>result</b> will carry a string with the access token.</param>
			/// <param name="failed" type="function(error)">A callback function for command failure. The <b>error</b> argument will carry the error message.</param>
			/// <param name="scope" type="">A scope for calling the callbacks; set &quot;null&quot; to call the callbacks in global scope.</param>

			if (!oauthSettings) {
				failureCallback("OAuthSettings are undefined");
				return;
			}

			oauthSettings.configName = configurationName;
			oauthSettings.prompt = prompt;
			MobileCRM.bridge.command("GetOAuthAccessToken", JSON.stringify(oauthSettings), successCallback, failureCallback, scope);
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

		_inherit(MobileCRM.UI.RoutePlan, MobileCRM.ObservableObject);       
		MobileCRM.UI.RoutePlan.requestObject = function (callback, errorCallback, scope) {
			/// <summary>Requests the managed RoutePlan object.</summary>
			/// <remarks>Method initiates an asynchronous request which either ends with calling the <b>errorCallback</b> or with calling the <b>callback</b> with Javascript version of RoutePlan object. See <see cref="MobileCRM.Bridge.requestObject">MobileCRM.Bridge.requestObject</see> for further details.</remarks>
			/// <param name="callback" type="function(platform)">The callback function that is called asynchronously with serialized RoutePlan object as argument.</param>
			/// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
			/// <param name="scope" type="Object">The scope for callbacks.</param>
			MobileCRM.bridge.requestObject("RoutePlan", function (obj) {
				return obj.runCallback(callback, scope);
			}, errorCallback, scope);
		};
		MobileCRM.UI.RoutePlan.onSave = function (handler, bind, scope) {
			/// <summary>Binds or unbinds the handler for route save validation.</summary>
			/// <remarks><p>Bound handler is called with the RoutePlan object as an argument.</p><p>The RoutePlan context object contains property &quot;errorMessage&quot; that can be used to cancel save with an error.</p><p>Use <see cref="MobileCRM.UI.RoutePlan.suspendSave">suspendSave</see> method to suspend the save process if an asynchronous operation is required.</p></remarks>
			/// <param name="handler" type="function(RoutePlan)">The handler function that has to be bound or unbound.</param>
			/// <param name="bind" type="Boolean">Determines whether to bind or unbind the handler.</param>
			/// <param name="scope" type="Object">The scope for handler calls.</param>
			_registerEventHandler("onSave", handler, MobileCRM.UI.RoutePlan._handlers.onSave, bind, scope);
		};
		MobileCRM.UI.RoutePlan.onPostSave = function (handler, bind, scope) {
			/// <summary>Binds or unbinds the handler for further actions on saved route.</summary>
			/// <remarks><p>Bound handler is called with the RoutePlan object as an argument.</p><p>Use <see cref="MobileCRM.UI.RoutePlan.suspendPostSave">suspendPostSave</see> method to suspend the post-save process if an asynchronous operation is required.</p></remarks>
			/// <param name="handler" type="function(RoutePlan)">The handler function that has to be bound or unbound.</param>
			/// <param name="bind" type="Boolean">Determines whether to bind or unbind the handler.</param>
			/// <param name="scope" type="Object">The scope for handler calls.</param>
			_registerEventHandler("onPostSave", handler, MobileCRM.UI.RoutePlan._handlers.onPostSave, bind, scope);
		};
		MobileCRM.UI.RoutePlan.onRouteReloaded = function (handler, bind, scope) {
			/// <summary>Binds or unbinds the handler called after route is reloaded.</summary>
			/// <remarks>Bound handler is called with the RoutePlan object as an argument on start or when day or filter field is changed.</remarks>
			/// <param name="handler" type="function(RoutePlan)">The handler function that has to be bound or unbound.</param>
			/// <param name="bind" type="Boolean">Determines whether to bind or unbind the handler.</param>
			/// <param name="scope" type="Object">The scope for handler calls.</param>
			_registerEventHandler("onRouteReloaded", handler, MobileCRM.UI.RoutePlan._handlers.onRouteReloaded, bind, scope);
		};
		MobileCRM.UI.RoutePlan.onItemAdded = function (handler, bind, scope) {
			/// <summary>Binds or unbinds the handler for &quot;Item Added&quot; event.</summary>
			/// <remarks><p>Bound handler is called with the RoutePlan object as an argument.</p><p>The RoutePlan context object contains property &quot;entity&quot; carrying DynamicEntity object of the new visit record.</p></remarks>
			/// <param name="handler" type="function(RoutePlan)">The handler function that has to be bound or unbound.</param>
			/// <param name="bind" type="Boolean">Determines whether to bind or unbind the handler.</param>
			/// <param name="scope" type="Object">The scope for handler calls.</param>
			_registerEventHandler("onItemAdded", handler, MobileCRM.UI.RoutePlan._handlers.onItemAdded, bind, scope);
		};
		MobileCRM.UI.RoutePlan.onItemRemoved = function (handler, bind, scope) {
			/// <summary>Binds or unbinds the handler for &quot;Item Removed&quot; event.</summary>
			/// <remarks><p>Bound handler is called with the RoutePlan object as an argument.</p><p>The RoutePlan context object contains property &quot;entity&quot; carrying DynamicEntity object of unsaved visit record being removed from route plan.</p></remarks>
			/// <param name="handler" type="function(RoutePlan)">The handler function that has to be bound or unbound.</param>
			/// <param name="bind" type="Boolean">Determines whether to bind or unbind the handler.</param>
			/// <param name="scope" type="Object">The scope for handler calls.</param>
			_registerEventHandler("onItemRemoved", handler, MobileCRM.UI.RoutePlan._handlers.onItemRemoved, bind, scope);
		};
		MobileCRM.UI.RoutePlan.onItemCompleted = function (handler, bind, scope) {
			/// <summary>Binds or unbinds the handler for &quot;Item Completed&quot; event.</summary>
			/// <remarks><p>Bound handler is called with the RoutePlan object as an argument.</p><p>The RoutePlan context object contains property &quot;entity&quot; carrying DynamicEntity object af completed visit record being removed from route plan.</p></remarks>
			/// <param name="handler" type="function(RoutePlan)">The handler function that has to be bound or unbound.</param>
			/// <param name="bind" type="Boolean">Determines whether to bind or unbind the handler.</param>
			/// <param name="scope" type="Object">The scope for handler calls.</param>
			_registerEventHandler("onItemCompleted", handler, MobileCRM.UI.RoutePlan._handlers.onItemCompleted, bind, scope);
		};
		MobileCRM.UI.RoutePlan.onItemSave = function (handler, bind, scope) {
			/// <summary>Binds or unbinds the handler for validating single visit entity save.</summary>
			/// <remarks><p>Bound handler is called with the RoutePlan object as an argument.</p><p>The RoutePlan context object contains property &quot;errorMessage&quot; that can be used to cancel save with an error and property &quot;entityToSave&quot; carrying visit DynamicEntity record.</p><p>Use <see cref="MobileCRM.UI.RoutePlan.suspendSave">suspendSave</see> method to suspend the save process if an asynchronous operation is required.</p></remarks>
			/// <param name="handler" type="function(RoutePlan)">The handler function that has to be bound or unbound.</param>
			/// <param name="bind" type="Boolean">Determines whether to bind or unbind the handler.</param>
			/// <param name="scope" type="Object">The scope for handler calls.</param>
			_registerEventHandler("onItemSave", handler, MobileCRM.UI.RoutePlan._handlers.onItemSave, bind, scope);
		};
		MobileCRM.UI.RoutePlan.onItemPostSave = function (handler, bind, scope) {
			/// <summary>Binds or unbinds the handler for further actions on saved visit entity.</summary>
			/// <remarks><p>Bound handler is called with the RoutePlan object as an argument.</p><p>The RoutePlan context object contains property &quot;errorMessage&quot; that can be used to cancel save with an error.</p><p>Use <see cref="MobileCRM.UI.RoutePlan.suspendSave">suspendSave</see> method to suspend the save process if an asynchronous operation is required and property &quot;savedEntity&quot; carrying saved DynamicEntity object.</p></remarks>
			/// <param name="handler" type="function(RoutePlan)">The handler function that has to be bound or unbound.</param>
			/// <param name="bind" type="Boolean">Determines whether to bind or unbind the handler.</param>
			/// <param name="scope" type="Object">The scope for handler calls.</param>
			_registerEventHandler("onItemPostSave", handler, MobileCRM.UI.RoutePlan._handlers.onItemPostSave, bind, scope);
		};
		var _pendingRoutePlanSaveId = 0;
		MobileCRM.UI.RoutePlan.prototype.suspendSave = function () {
			/// <summary>Suspends current &quot;onSave&quot; process and allows performing asynchronous tasks to save the data.</summary>
			/// <returns type="Object">A request object with single method &quot;resumeSave&quot; which has to be called with the result (either error message string or &quot;null&quot; in case of success). To cancel the validation without any message, pass "#NoMessage#" text to this method.</returns>
			var cmdId = "RoutePlanPendingValidation" + (++_pendingRoutePlanSaveId);
			var self = this;
			self.context.pendingSaveCommand = cmdId;
			return {
				resumeSave: function (result) {
					if (self._inCallback) {
						// still in "onSave" callback - do not send a command (handler not installed yet)
						self.context.errorMessage = result;
						self.context.pendingSaveCommand = null;
					}
					else
						MobileCRM.bridge.command(cmdId, result);
				}
			};
		}
		var _pendingRPPostSaveId = 0;
		MobileCRM.UI.RoutePlan.prototype.suspendPostSave = function () {
			/// <summary>Suspends current &quot;onPostSave&quot; operations and allows performing another asynchronous tasks before the form is closed.</summary>
			/// <returns type="Object">A request object with single method &quot;resumePostSave&quot; which has to be called to resume the post-save operations.</returns>
			var cmdId = "RoutePlanPendingPostSave" + (++_pendingRPPostSaveId);
			var _this = this;
			_this.context.pendingPostSaveCommand = cmdId;
			return {
				resumePostSave: function () {
					if (_this._inCallback) {
						// still in "onPostSave" callback - do not send a command (handler not installed yet)
						_this.context.pendingPostSaveCommand = null;
					}
					else
						MobileCRM.bridge.command(cmdId);
				}
			};
		};
		MobileCRM.UI.RoutePlan._callHandlers = function (event, data, context) {
			var handlers = MobileCRM.UI.RoutePlan._handlers[event];
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
		};
		MobileCRM.UI.RoutePlan._handlers = { onSave: [], onPostSave: [], onRouteReloaded: [], onItemAdded: [], onItemRemoved: [], onItemCompleted: [], onItemSave: [], onItemPostSave: [] };

		_inherit(MobileCRM.UI.TourplanForm, MobileCRM.ObservableObject);       
		MobileCRM.UI.TourplanForm.requestObject = function (callback, errorCallback, scope) {
			/// <summary>Requests the managed TourplanForm object.</summary>
			/// <remarks>Method initiates an asynchronous request which either ends with calling the <b>errorCallback</b> or with calling the <b>callback</b> with Javascript version of TourplanForm object. See <see cref="MobileCRM.Bridge.requestObject">MobileCRM.Bridge.requestObject</see> for further details.</remarks>
			/// <param name="callback" type="function(platform)">The callback function that is called asynchronously with serialized TourplanForm object as argument.</param>
			/// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
			/// <param name="scope" type="Object">The scope for callbacks.</param>
			MobileCRM.bridge.requestObject("Tourplan", callback, errorCallback, scope);
		};
		MobileCRM.UI.TourplanForm.setDate = function (date, callback, errorCallback) {
			/// <summary>Sets the current date in calendar view (Tourplan).</summary>
			/// <param> name="date" type="Date">A date to set.</param>
			/// <apram name="callback" type="Function">Optional callback called after successfull change.</param>
			/// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
			MobileCRM.bridge.command("setDate", JSON.stringify(date), callback, errorCallback);
		};
		MobileCRM.UI.TourplanForm.setMode = function (mode, callback, errorCallback) {
			/// <summary>Sets the calendar view (Tourplan) mode.</summary>
			/// <param> name="mode" type="MobileCRM.UI.TourplanViewMode">A mode to set.</param>
			/// <apram name="callback" type="Function">Optional callback called after successfull change.</param>
			/// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
			MobileCRM.bridge.command("setMode", JSON.stringify(mode), callback, errorCallback);
		};
		MobileCRM.UI.TourplanForm.onCreateNew = function (handler, bind, scope) {
			/// <summary>[v11.3] Binds or unbinds the handler for creating new appointment after long-pressing on calendar.</summary>
			/// <remarks>Bound handler is called with the TourplanForm object as an argument. The context object contains &quot;start&quot;, &quot;end&quot;, &quot;entityName&quot; properties and optionally &quot;subject&quot; property.</remarks>
			/// <param name="handler" type="function(tourplanForm)">The handler function that has to be bound or unbound.</param>
			/// <param name="bind" type="Boolean">Determines whether to bind or unbind the handler.</param>
			/// <param name="scope" type="Object">The scope for handler calls.</param>
			var handlers = MobileCRM.UI.TourplanForm._handlers.onCreateNew;
			var register = handlers.length == 0;
			_bindHandler(handler, handlers, bind, scope);
			if (register)
				MobileCRM.bridge.command("registerEvents", "onCreateNew");
		}
		MobileCRM.UI.TourplanForm._callHandlers = function (event, data, context) {
			var handlers = MobileCRM.UI.TourplanForm._handlers[event];
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
		};
		MobileCRM.UI.TourplanForm._handlers = { onCreateNew: [] };

		MobileCRM.UI._AppointmentView = function () {
		    /// <summary>Represents the Javascript equivalent view of tourplan form object.</summary>
		    /// <field name="name" type="String">Gets the name of view.</field>
		    /// <field name="isVisible" type="Boolean">Gets or sets whether the view is visible.</field>
		    /// <field name="mode" type="MobileCRM.UI.TourplanViewMode">Gets a view mode <see cref="MobileCRM.UI.TourplanViewMode">MobileCRM.UI.TourplanViewMode</see>.</field>
		    /// <field name="currentDate" type="Date">Gets the current date of displayed view.</field>
		};

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
		MobileCRM.UI._DetailView.prototype.addItemToGrid = function (gridName, item, column, row, colSpan, rowSpan) {
			/// <summary>[since 13.1] Add detail item to desired position in to grid.</summary>
			/// <param name="gridName" type="String"> name of grid item.</param>
			/// <param name="item" type="MobileCRM.UI.DetailViewItems.Item">Detail item <see cref="MobileCRM.UI.DetailViewItems.Item">MobileCRM.UI.DetailViewItems.Item</see>object.</param>
			/// <param name="column" type="Number">Optional Column x axis parameter, default is 0.</param>
			/// <param name="row" type="Number">Optional Row y axis parameter, default is 0.</param>
			/// <param name="colSpan" type="Number">Optional Column width x axis width , default is 1.</param>
			/// <param name="rowSpan" type="Number">Optional Row width y axis width, default is 1.</param>

			var grid = this.getItemByName(gridName);
			if (grid && grid.items) { // simple validation if item exists and is type of grid (only grid has items) | check for instance of is not working.
				var data = {};
				item.column = column || 0;
				item.row = row || 0;
				item.colSpan = colSpan || 1;
				item.rowSpan = rowSpan || 1;

				data.action = "addToGrid";
				data.viewName = this.name;
				data.index = this.getItemIndex(gridName);
				data.name = gridName;

				for (var prop in item) {
					data[prop] = item[prop];
				}

				MobileCRM.bridge.command("detailViewAction", JSON.stringify(data));
			}
		};
		MobileCRM.UI._DetailView.prototype.insertItem = function (item, index) {
			/// <summary>[v8.0] Inserts the <see cref="MobileCRM.UI.DetailViewItems.Item">MobileCRM.UI.DetailViewItems.Item</see> into this detailed view.</summary>
			/// <param name="item" type="MobileCRM.UI.DetailViewItems.Item">An item to be added.</param>
			/// <param name="index" type="Number">An index on which the item should be placed. Set to -1 to append the item at the end.</param>

			var data = {};
			data.GridItems = {};
			for (var prop in item) {
				if (prop === "items" && item._type === "Grid") {
					data.GridItems[item.name] = item.items;
					continue;
				}
				data[prop] = item[prop];
			}

			data.action = "insert";
			data.viewName = this.name;
			data.index = typeof (index) !== "undefined" ? index : -1;
			MobileCRM.bridge.command("detailViewAction", JSON.stringify(data));
		};
		MobileCRM.UI._DetailView.prototype.insertItems = function (items, index) {
			/// <summary>[v8.0] Inserts the <see cref="MobileCRM.UI.DetailViewItems.Item">MobileCRM.UI.DetailViewItems.Item</see> into this detailed view.</summary>
			/// <param name="items" type="Array(MobileCRM.UI.DetailViewItems.Item)">An array of items to be added.</param>
			/// <param name="index" type="Number">An index on which the items should be placed. Set to -1 to append the items at the end.</param>
			var data = {};
			data.items = [];
			data.GridItems = {};
			for (var item in items) {
				var tmpItem = {};
				for (var prop in items[item]) {
					if (prop === "items" && items[item]._type === "Grid") {
						data.GridItems[items[item].name] = items[item].items;
						continue;
					}
					tmpItem[prop] = items[item][prop];
				}
				data.items.push(tmpItem);
			}

			data.action = "insertMultiple";
			data.viewName = this.name;
			data.index = typeof (index) !== "undefined" ? index : -1;
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
	            MobileCRM.bridge.log("DetailView.startEditItem: Index must not be negative.");
	            return;
	        }
	        var data = {
	            action: "startEditItem",
	            viewName: this.name,
	            index: index
	        };
	        MobileCRM.bridge.command("detailViewAction", JSON.stringify(data));
	    };
	    MobileCRM.UI._DetailView.prototype.updateComboItemDataSource = function (index, listDataSource, valueType, defaultValue) {
			/// <summary>[v9.1] Changes the data source for CombobBoxitem <see cref="MobileCRM.UI.DetailViewItems.Item">MobileCRM.UI.DetailViewItems.ComboBoxItem</see>.</summary>
			/// <param name="index" type="Number">Item index on the view.</param>
			/// <param name="listDataSource" type="Object">The data source object (e.g. {&quot;label1&quot;:1, &quot;label2&quot;:2}).</param>
			/// <param name="valueType" type="String">Type of list data source element value. Default is string, allowed int, string.</param>
			/// <param name="defaultValue" type="String">New data source default value. If not defined, the first item from listDataSource will be used.</param>
			var data = {
				action: "updateDataSource",
				viewName: this.name,
				index: index,
				listDataSource: listDataSource,
				value: defaultValue || listDataSource[Object.keys(listDataSource)[0]],
				listDataSourceValueType: valueType
			};
			// Code used in version < 11.2
			//this.items[index].value = defaultValue !== undefined ? defaultValue : listDataSource[Object.keys(listDataSource)[0]];
			MobileCRM.bridge.command("detailViewAction", JSON.stringify(data));
		};
	    MobileCRM.UI._DetailView.prototype.updateLinkItemViews = function (index, dialogSetup, inlinePickSetup, dialogOnly) {
	        /// <summary>[v10.1] Changes the <see cref="MobileCRM.UI.DetailViewItems.ComboBoxItem">ComboBoxItem</see> views and/or filters.</summary>
	        /// <param name="index" type="Number">Item index on the view.</param>
	        /// <param name="dialogSetup" type="MobileCRM.UI.DetailViewItems.LookupSetup">Lookup setup for modal lookup dialog.</param>
	        /// <param name="inlinePickSetup" type="MobileCRM.UI.DetailViewItems.LookupSetup">Optional setup for inline lookup picker. Leave empty to use the same setup as modal dialog.</param>
	        /// <param name="dialogOnly" type="Boolean">Indicates whether to allow the inline picker. Set &quot;true&quot; to disable the inline picker and always use the modal dialog. Set &quot;false&quot; to allow the inline picker.<param>
	        var xml = "<lookup>";
	        xml += dialogSetup._serialize();
	        if (!dialogOnly && inlinePickSetup)
	            xml += inlinePickSetup._serialize();
	        xml += "<dialog>" + (dialogOnly ? 1 : 0) + "</dialog>";
	        xml += "</lookup>";

	        var data = {
	            action: "updateLookupFilter",
	            viewName: this.name,
	            index: index,
	            views: xml
	        };

	        MobileCRM.bridge.command("detailViewAction", JSON.stringify(data));
	    };
	    MobileCRM.UI.DetailViewItems.LookupSetup = function () {
	        /// <summary>Represents a configuration for lookup and inline lookup.</summary>
	        /// <remarks>Defines the lookup records filter for <see cref="MobileCRM.UI._DetailView.updateLinkItemViews">updateLinkItemViews</see></remarks>
	        this._views = [];
	        this._filters = null;
	        this.dialogOnly = false;
	    };
	    MobileCRM.UI.DetailViewItems.LookupSetup.prototype.addView = function (entityName, viewName, isDefault) {
	        /// <summary>Appends an entity view to the list of allowed views.</summary>
	        /// <param name="entityName" type="string">Entity logical name.</param>
	        /// <param name="viewName" type="string">A name of the view.</param>
	        /// <param name="isDefault" type="Boolean">true, if the view should be set as default.</param>
	        this._views.push({
	            entity: entityName, view: viewName, isDefault: isDefault
	        });
	    };
	    MobileCRM.UI.DetailViewItems.LookupSetup.prototype.addFilter = function (entityName, filterXml) {
	        /// <summary>Defines a fetch XML filter for entity records.</summary>
	        /// <param name="entityName" type="string">Entity logical name.</param>
	        /// <param name="filterXml" type="string">A string defining the fetch XML which has to be applied as filter for entity records.</param>
	        if (!this._filters)
	            this._filters = {};
	        this._filters[entityName] = filterXml;
	    };
	    MobileCRM.UI.DetailViewItems.LookupSetup.prototype._serialize = function () {
	        var _escape = function (st) {
	            var xml_special_to_escaped_one_map = { '<': '&lt;', '>': '&gt;' };
	            return st.replace(/([<>])/g, function (str, item) {
	                return xml_special_to_escaped_one_map[item];
	            });
	        };

	        var firstOne = true;
	        var xml = "<extra><views>";
	        if (this._views.length > 0) {
	            for (var i in this._views) {
	                var view = this._views[i];
	                var entityName = view.entity;

	                if (firstOne)
	                    firstOne = false;
	                else
	                    xml += ":";

	                xml += _escape(entityName + (view.isDefault ? ".@" : ".") + view.view);
	            }
	        }
	        xml += "</views>";

	        if (this._filters) {
	            for (var entity in this._filters) {
	                var filter = this._filters[entity];
	                xml += "<filter entity='" + entity + "'>" + _escape(filter) + "</filter>";
	            }
	        }

	        xml += "</extra>";
	        return xml;
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

			var itemIndex = this.getItemIndex(item.name);
			if (itemIndex > -1) { // execute command to register click handler for existing item only.
				var data = {
					action: "registerLinkItemClickHandler",
					viewName: this.name,
					index: itemIndex
				};
				MobileCRM.bridge.command("detailViewAction", JSON.stringify(data));
			}
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
		_inherit(MobileCRM.UI.DetailViewItems.ButtonItem, MobileCRM.UI.DetailViewItems.Item);
		_inherit(MobileCRM.UI.DetailViewItems.GridItem, MobileCRM.UI.DetailViewItems.Item);

		// MobileCRM.UI.DetailViewItems.GridItem
		MobileCRM.UI.DetailViewItems.GridItem.prototype.addItem = function (item, column, row, colSpan, rowSpan) {
			/// <summary>[since 13.1] Add detail item to desired position in to grid.</summary>
			/// <param name="item" type="MobileCRM.UI.DetailViewItems.Item">Detail item <see cref="MobileCRM.UI.DetailViewItems.Item">MobileCRM.UI.DetailViewItems.Item</see>object.</param>
			/// <param name="column" type="Number">Optional Column x axis parameter, default is 0.</param>
			/// <param name="row" type="Number">Optional Row y axis parameter, default is 0.</param>
			/// <param name="colSpan" type="Number">Optional Column width x axis width , default is 1.</param>
			/// <param name="rowSpan" type="Number">Optional Row width y axis width, default is 1.</param>

			item.column = column || 0;
			item.row = row || 0;
			item.colSpan = colSpan || 1;
			item.rowSpan = rowSpan || 1;
			this.items.push(item);
		};
		MobileCRM.UI.DetailViewItems.GridItem.prototype._setGrid = function (columns, rows) {
			this.columns = [];
			this.rows = [];
			for (var cl in columns) {
				var col = columns[cl];
				var objC = {};
				objC[col._value] = col._gridUnitType;
				this.columns.push(objC);
			}
			for (var rw in rows) {
				var row = rows[rw];
				var objR = {};
				objR[row._value] = row._gridUnitType;
				this.rows.push(objR);
			}
		};
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

		MobileCRM.UI.ProcessController.prototype.moveToPreviousStage = function (errorCallback, scope) {
			/// <summary>[15.0] Moves to the previous stage of the active process.</summary>
			/// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called asynchronously in case of error.</param>
			/// <param name="scope" type="Object">The scope for callback.</param>
			var controller = MobileCRM.bridge.exposeObjectAsync("EntityForm.GetController", [this.view.name]);
			controller.invokeMethodAsync("MoveToPreviousStage", [], function () { }, errorCallback, scope);
			controller.release();
		};

		MobileCRM.UI.ProcessController.prototype.moveToNextStage = function ( errorCallback, scope) {
			/// <summary>[15.0] Progresses to the next stage of the active process.</summary>
			/// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called asynchronously in case of error.</param>
			/// <param name="scope" type="Object">The scope for callback.</param>
			var controller = MobileCRM.bridge.exposeObjectAsync("EntityForm.GetController", [this.view.name]);
			controller.invokeMethodAsync("MoveToNextStage", [], function () { }, errorCallback, scope);
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
		MobileCRM.UI.MessageBox.prototype.showAsync = function () {
			/// <summary>Shows a popup window allowing user to choose one of actions.</summary>
			/// <returns type="Promise&lt;string&gt;">A Promise object which will be resolved with chosen item string.</returns>
			return MobileCRM.bridge.invokeCommandPromise("messageBox", JSON.stringify(this));
		};

	    MobileCRM.UI.MessageBox.sayText = function (text, success, failed, scope) {
	        /// <summary>Shows a simple popup window with a multi-line text.</summary>
	        /// <param name="text" type="String">A text to be shown.</param>
	        /// <param name="success" type="function">The callback function that is called after user closes the message box.</param>
	        /// <param name="failed" type="function(errorMsg)">The errorCallback which is called asynchronously in case of error.</param>
	        /// <param name="scope" type="Object">The scope for callbacks.</param>
	        var mb = new MobileCRM.UI.MessageBox(text);
	        mb.items = ["OK"];
	        mb.multiLine = true;
	        mb.show(success, failed, scope);
	    };
		MobileCRM.UI.MessageBox.sayTextAsync = function (text) {
			/// <summary>Shows a simple popup window with a multi-line text.</summary>
			/// <param name="text" type="String">A text to be shown.</param>
			/// <returns type="Promise&lt;void&gt;">A Promise object which will be resolved when user closes the message box.</returns>
			var mb = new MobileCRM.UI.MessageBox(text);
			mb.items = ["OK"];
			mb.multiLine = true;
			return mb.showAsync();
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
		MobileCRM.UI.LookupForm.prototype.showAsync = function () {
			/// <summary>Shows a dialog which allows the user to select an entity from a configurable list of entity types.</summary>
			/// <returns type="Promise&lt;MobileCRM.Reference&gt;">A Promise object which will be resolved with a Reference object representing chosen entity record.</returns>
			return MobileCRM.bridge.invokeCommandPromise("lookupForm", JSON.stringify(this._constructParams()));
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
	        return { entities: this.entities, source: this.source, prevSelection: this.prevSelection, allowedViews: xml, allowNull: this.allowNull, preventClose: this.preventClose };
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
			params.initialTab = this.initialTab;
			MobileCRM.bridge.command("multiLookupForm", JSON.stringify(params), success, failed, scope);
		};
		MobileCRM.UI.MultiLookupForm.prototype.showAsync = function () {
			/// <summary>Shows a dialog which allows the user to select a list of entities from a configurable list of entity types.</summary>
			/// <returns type="Promise&lt;MobileCRM.Reference[]&gt;">A Promise object which will be resolved with an array of Reference objects representing chosen entity records.</returns>
			var params = this._constructParams();
			params.dataSource = this.dataSource;
			params.initialTab = this.initialTab;
			return MobileCRM.bridge.invokeCommandPromise("multiLookupForm", JSON.stringify(params));
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
				return obj.runCallback(callback, scope);
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

		MobileCRM.UI.Form.showToast = function (message, icon) {
			/// <summary>Shows a toast window over the app window which is dismissed after a few seconds.</summary>
			/// <param name="message" type="String">A toast content message.</param>
			/// <param name="icon" type="String">Valid app image name (e.g. Home.Now.png).</param>
			MobileCRM.bridge.invokeStaticMethodAsync("Resco.UI", "Resco.UI.FormFactory", "ShowToastInfo.Invoke", [message, icon]);
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
				return obj.runCallback(callback, scope);
	        }, errorCallback, scope);
	    };

	    MobileCRM.UI.HomeForm.openHomeItemAsync = function (name, errorCallback, scope) {
	        /// <summary>[v8.0] Opens the specified HomeItem.</summary>
	        /// <param name="name" type="String">The name of the HomeItem to be opened. It can be either the entity logical name (e.g. &quot;contact&quot;) or one of following special forms names: &quot;@Dashboard&quot;, &quot;@Map&quot;, &quot;activity&quot;, &quot;@Tourplan&quot;,&quot;@CallImport&quot;,&quot;@Setup&quot;,&quot;@About&quot;.</param>
	        /// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
	        /// <param name="scope" type="Object">The scope for callbacks.</param>
	        MobileCRM.bridge.invokeStaticMethodAsync("MobileCrm", "MobileCrm.Controllers.HomeForm", "Instance.ShowHomeItemByName", [name], null, errorCallback, scope);
	    };
	    MobileCRM.UI.HomeForm.openHomeGroupItemAsync = function (items, errorCallback, scope) {
	        /// <summary>[v10.1.1] Opens the specified HomeItem in specific group.</summary>
	        /// <param name="items" type="Array">A list of group and subgroups representing the path to the home item.</param>
	        /// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
	        /// <param name="scope" type="Object">The scope for callbacks.</param>
	        var path = "";
	        for (var i in items)
	            path += "\\" + items[i];

	        MobileCRM.bridge.invokeStaticMethodAsync("MobileCrm", "MobileCrm.Controllers.HomeForm", "Instance.ShowHomeGroupItem", [path], null, errorCallback, scope);
	    };
	    MobileCRM.UI.HomeForm.updateHomeItemAsync = function (items, title, subTitle, badge, errorCallback, scope) {
	        /// <summary>[v10.2] Updates specified HomeItem in specific group.</summary>
	        /// <param name="items" type="Array">A list of group and subgroups representing the path to the home item.</param>
	        /// <param name="title" type="String">The title for the home item.</param>
	        /// <param name="subTitle" type="String">The title for the home item.</param>
	        /// <param name="badge" type="String">The title for the home item.</param>
	        /// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
	        /// <param name="scope" type="Object">The scope for callbacks.</param>
	        var path = "";
	        for (var i in items)
	            path += "\\" + items[i];

	        MobileCRM.bridge.invokeStaticMethodAsync("MobileCrm", "MobileCrm.Controllers.HomeForm", "Instance.UpdateHomeItem", [path, title, subTitle, badge], null, errorCallback, scope);
	    };
	    MobileCRM.UI.HomeForm.updateHomeItems = function (items) {
	        /// <summary>[v10.3] Updates specified home items.</summary>
	        /// <param name="items" type="Array">A list of home item that has to be changed. Each home item is an object with following properties: path, title, subTitle, badge, isVisible.</param>
	        MobileCRM.bridge.invokeStaticMethodAsync("MobileCrm", "MobileCrm.Controllers.HomeForm", "Instance.UpdateHomeItems", [JSON.stringify(items)]);
	    };
	    MobileCRM.UI.HomeForm.closeHomeItemAsync = function (name, errorCallback, scope) {
	        /// <summary>[v8.0] Close the specified HomeItem.</summary>
	        /// <param name="name" type="String">The name of the HomeItem to be opened. It can be either the entity logical name (e.g. &quot;contact&quot;), custom name as defined in Woodford or one of following special names: &quot;@Dashboard&quot;, &quot;@Map&quot;, &quot;@activity&quot;, &quot;@Tourplan&quot;,&quot;@CallImport&quot;,&quot;@Setup&quot;,&quot;@About&quot;.</param>
	        /// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
	        /// <param name="scope" type="Object">The scope for callbacks.</param>
	        MobileCRM.UI.HomeForm.requestObject(function (homeForm) {
	            for (var i in homeForm.items) {
	                var item = homeForm.items[i];
                    if (item.name == name || item.uniqueName === name) {
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
	        /// <param name="callback" type="function()">The callback function that is called asynchronously after forms were closed successfully.</param>
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
	    MobileCRM.UI.HomeForm.restoreUIReplacement = function () {
	    	/// <summary>[v11.0] Restores previously hidden UI replacement iframe and hides the classic home form.</summary>
	    	MobileCRM.bridge.invokeMethodAsync("HomeForm", "RestoreUIReplacement", []);
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
	    };
		MobileCRM.MobileReport.runReportAsync = function (fetch, reportXML, reportFormat, isExportOnly, isOnline, outputFile) {
			/// <summary>[v9.1] Executes the mobile reporting request which produces the mobile report document of given format.</summary>
			/// <param name="fetch" type="String">The fetch XML defining the entity (entities) query used as report input.</param>
			/// <param name="reportXML" type="String">The mobile report XML definition which can be loaded from the resco_mobilereport entity or constructed dynamically. Ignored if IsExportOnly parameter is true.</param>
			/// <param name="reportFormat" type="String">Report format: Pdf (default), Html, Excel, Text.</param>
			/// <param name="isExportOnly" type="Boolean">If true then ReportXml is optional. The default is false.</param>
			/// <param name="isOnline" type="Boolean">Indicates whether the report should be run against the online data or local database. The default is current application mode.</param>
			/// <param name="outputFile" type="String">The full path to the output file. If omitted a temp file is created.</param>
			/// <returns type="Promise&lt;string&gt;">A Promise object which will be resolved with the file path to successfully created report.</returns>
			return new Promise(function (resolve, reject) {
				MobileCRM.MobileReport.runReport(fetch, reportXML, reportFormat, isExportOnly, isOnline, outputFile, resolve, function (err) { reject(new Error(err)); });
			});
		};
	    MobileCRM.MobileReport.showForm = function (report, source, fetchXml, failed, scope) {
	        /// <summary>[v10.1] Shows new MobileReport form. Source for the report can be defined either as list of <see cref="MobileCRM.Reference">MobileCRM.Reference</see> objects or as FetchXML query.</summary>
			/// <remarks>If both types of source are passed, user can select which one to use.</remarks>
	        /// <param name="report" type="MobileCRM.Reference">Optional reference to the resco_mobilereport entity that will be pre-selected.</param>
	        /// <param name="source" type="MobileCRM.Reference[]">The list of entity references used as report input.</param>
	        /// <param name="fetchXML" type="String">The fetch XML defining the entity (entities) query used as report input.</param>
	        /// <param name="failed" type="function(errorMsg)">A callback which is called in case of error.</param>
	        /// <param name="scope" type="Object">The scope for callbacks.</param>
	        var params = { fetchXml: fetchXml, report: report, source: source };
	        MobileCRM.bridge.command("showMobileReportForm", JSON.stringify(params), null, failed, scope);
		};
		MobileCRM.MobileReport.showFormWithConfiguration = function (report, source, fetchXml, paramString, failed, scope) {
			/// <summary>[v16.0] Shows new MobileReport form. Source for the report can be defined either as list of <see cref="MobileCRM.Reference">MobileCRM.Reference</see> objects or as FetchXML query.</summary>
			/// <remarks>If both types of source are passed, user can select which one to use.</remarks>
			/// <param name="report" type="MobileCRM.Reference">Optional reference to the resco_mobilereport entity that will be pre-selected.</param>
			/// <param name="source" type="MobileCRM.Reference[]">The list of entity references used as report input.</param>
			/// <param name="fetchXML" type="String">The fetch XML defining the entity (entities) query used as report input.</param>
			/// <param name="paramString" type="String">Run report form <see cref="https://docs.resco.net/wiki/Configure_Run_Report_command#Configuration_string">Configuration string</see> in JSON format.</param>
			/// <param name="failed" type="function(errorMsg)">A callback which is called in case of error.</param>
			/// <param name="scope" type="Object">The scope for callbacks.</param>
			var params = { fetchXml: fetchXml, report: report, source: source, paramString: paramString };
			MobileCRM.bridge.command("showMobileReportForm", JSON.stringify(params), null, failed, scope);
		};
	    // MobileCRM.UI.Questionnaire
	    MobileCRM.Questionnaire.showForm = function(id, failed, scope, relationship) {
	        /// <summary>[v10.2] Shows the questionnaire form.</summary>
	        /// <param name="id" type="String">Id (guid) of the questionnaire.</param>
	        /// <param name="failed" type="function(errorMsg)">A callback which is called in case of error.</param>
	        /// <param name="scope" type="Object">The scope for callbacks.</param>
			/// <param name="relationship" type="MobileCRM.Relationship">Optional relationship with the parent record.</param>
			var params = { id: id, relationship: relationship };
	        MobileCRM.bridge.command("showQuestionnaire", JSON.stringify(params), null, failed, scope);
	    };
		function _padTo3digits(num) {
			var st = "" + num;
			while (st.length < 3)
				st = "0" + st;
			return st;
		}
		MobileCRM.Questionnaire.getQuestionName = function (name, repeatIndex) {
			/// <summary>Generates the real name of question from repeatable group.</summary>
			/// <param name="name" type="String">Base question name from questionnaire template.</param>
			/// <param name="repeatIndex" type="Number">Repeat index of the group containing the question.</param>
			return repeatIndex ? (name + "#" + _padTo3digits(repeatIndex)) : name;
		}
		MobileCRM.Questionnaire.getGroupName = function (name, repeatIndex) {
			/// <summary>Generates the real name of repeatable question group.</summary>
			/// <param name="name" type="String">Base question group name from questionnaire template.</param>
			/// <param name="repeatIndex" type="Number">Repeat index of the group.</param>
			return repeatIndex ? (name + "#" + _padTo3digits(repeatIndex)) : name;
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
				return obj.runCallback(callback, scope);
	        }, errorCallback, scope);
	    };

	    MobileCRM.UI.IFrameForm.setDirty = function (dirty) {
	        /// <summary>[v10.0] Sets the dirty flag which prevents the form being closed. App asks to save the form before saving and if user chooses to save it, it calls the save routine defined in <see cref="MobileCRM.UI.IFrameForm.saveCommand">IFrameForm.saveCommand</see>.</summary>
	        MobileCRM.bridge.invokeMethodAsync("IFrameForm", "set_IsDirty", [dirty === false ? false : true]);
	    };

	    MobileCRM.UI.IFrameForm.preventClose = function (message) {
	        /// <summary>[v10.0] Sets the warning message that should be shown when user tries to close the form.</summary>
	        /// <remarks>Set to &quot;null&quot; to allow the form close.</remarks>
	        MobileCRM.bridge.invokeMethodAsync("IFrameForm", "set_PreventCloseMessage", [message]);
	    };

	    MobileCRM.UI.IFrameForm._handlers = { onSave: [] };
	    MobileCRM.UI.IFrameForm.onSave = function (handler, bind, scope) {
	        /// <summary>[v10.0] Binds or unbinds the handler for saving content of this iFrame.</summary>
	        /// <remarks><p>Bound handler is called with the IFrameForm object as an argument.</p><p>The IFrameForm context object contains property &quot;errorMessage&quot; that can be used to cancel save with an error.</p><p>Use <see cref="MobileCRM.UI.IFrameForm.suspendSave">suspendSave</see> method to suspend the save process if an asynchronous operation is required.</p></remarks>
	        /// <param name="handler" type="function(IFrameForm)">The handler function that has to be bound or unbound.</param>
	        /// <param name="bind" type="Boolean">Determines whether to bind or unbind the handler.</param>
	        /// <param name="scope" type="Object">The scope for handler calls.</param>
	        var handlers = MobileCRM.UI.IFrameForm._handlers.onSave;
	        var register = handlers.length == 0;
	        _bindHandler(handler, handlers, bind, scope);
	        if (register)
	            MobileCRM.bridge.command("InstallSaveCommand");
	    };
	    var _pendingIFrameSaveId = 0;
	    MobileCRM.UI.IFrameForm.prototype.suspendSave = function () {
	        /// <summary>[v10.0] Suspends current &quot;onSave&quot; process and allows performing asynchronous tasks to save the data.</summary>
	        /// <returns type="Object">A request object with single method &quot;resumeSave&quot; which has to be called with the result (either error message string or &quot;null&quot; in case of success). To cancel the validation without any message, pass "#NoMessage#" text to this method.</returns>
	        var cmdId = "IFramePendingValidation" + (++_pendingIFrameSaveId);
	        var self = this;
	        self.context.pendingSaveCommand = cmdId;
	        return {
	            resumeSave: function (result) {
	                if (self._inCallback) {
	                    // still in "onSave" callback - do not send a command (handler not installed yet)
	                    self.context.errorMessage = result;
	                    self.context.pendingSaveCommand = null;
	                }
	                else
	                    MobileCRM.bridge.command(cmdId, result);
	            }
	        };
	    }

	    MobileCRM.UI.IFrameForm._callHandlers = function (event, data, context) {
	        var handlers = MobileCRM.UI.IFrameForm._handlers[event];
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
		};

		// MobileCRM.UI.EntityChart
		_inherit(MobileCRM.UI.EntityChart, MobileCRM.ObservableObject);
		MobileCRM.UI.EntityChart.setDataSource = function (dataSource) {
			/// <summary>Sets the chart data source replacement.</summary>
			/// <remarks><p>Data source must be set during the document load stage and must not be delayed.</p><p>It is used only if the entity view iFrame is marked as data source provider in Woodford.</p></remarks>
			/// <param name="dataSource" type="MobileCRM.UI.ChartDataSource">A data source object implementing the EntityChart loading routine.</param>
			MobileCRM.UI.EntityChart._dataSource = dataSource;
		};
		MobileCRM.UI.EntityChart._initDataSource = function (fetch) {
			var dataSource = MobileCRM.UI.EntityChart._dataSource;
			if (dataSource) {
				dataSource.fetch = fetch;
				if (typeof dataSource.loadCustomFetch != "undefined") {
					dataSource.loadCustomFetch();
				}
				if (dataSource.loadOfflineData != undefined) {

					var oData = dataSource.loadOfflineData;
					dataSource.type = oData.type;
					dataSource.data = oData.data;
					dataSource.isOfflineChart = true;
				}
			}
			return JSON.stringify(dataSource);
		};

		// MobileCRM.UI.ChartDataSource
		MobileCRM.UI.ChartDataSource = function () {
			/// <summary>The data source loading routine implementation.</summary>
			/// <remarks><p>An instance of this object can be used to supply the data source for <see cref="MobileCRM.UI.EntityChart.setDataSource">MobileCRM.UI.EntityChart.setDataSource</see> function.</p></remarks>
			/// <field name="type" type="string">Chart type in string</field>
			/// <field name="data" type="object">Object of chart dataset</field>
			this.type = null;
			this.data = null;
			this.fetch = null;
			this.isOfflineChart = false;
			this.loadOfflineData = null;
		};

	    // MobileCRM.UI.EntityList
	    _inherit(MobileCRM.UI.EntityList, MobileCRM.ObservableObject);
	    MobileCRM.UI.EntityList._handlers = { onCanExecute: [], onCommand: [], onSave: [], onChange: [], onClick: [] };
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
	    };
	    MobileCRM.UI.EntityList.requestObject = function (callback, errorCallback, scope) {
	        /// <summary>Requests the EntityList object.</summary>
	        /// <remarks>Method initiates an asynchronous request which either ends with calling the <b>errorCallback</b> or with calling the <b>callback</b> with Javascript version of EntityList object. See <see cref="MobileCRM.Bridge.requestObject">MobileCRM.Bridge.requestObject</see> for further details.</remarks>
	        /// <param name="callback" type="function(entityList)">The callback function that is called asynchronously with serialized EntityList object as argument See <see cref="MobileCRM.UI.EntityList">MobileCRM.UI.EntityList</see> for further details.</remarks>. Callback should return true to apply changed properties.</param>
	        /// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
	        /// <param name="scope" type="Object">The scope for callbacks.</param>
	        MobileCRM.bridge.requestObject("EntityList", function (obj) {
				return obj.runCallback(callback, scope);
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
	    MobileCRM.UI.EntityList.requestEditedEntities = function (callback, errorCallback, scope) {
	        /// <summary>[v10.0] Asynchronously gets the list of entities that were changed on the list.</summary>
	        /// <param name="callback" type="function(DynamicEntity[])">Callback obtaining an array of <see cref="MobileCRM.DynamicEntity">dynamic entities</see> that were changed on the list.</param>
	        /// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called asynchronously in case of error.</param>
	        /// <param name="scope" type="Object">The scope for callbacks.</param>
	        MobileCRM.bridge.requestObject("EditedEntities", function (entities) {
	            if (callback.call(scope, entities.items) != false) {
	                var changed = entities.getChanged();
	                return changed;
	            }
	            return '';
	        }, errorCallback);
	    };
	    MobileCRM.UI.EntityList.onCommand = function (command, handler, bind, scope) {
	        /// <summary>Binds or unbinds the handler for EntityList command.</summary>
	        /// <remarks>Bound handler is called with the EntityList object as an argument. The EntityList context object contains the &quot;cmdParam&quot; property and &quot;entities&quot; property with the list of currently selected entities.</remarks>
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
	        /// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called asynchronously in case of error.</param>
	        /// <param name="scope" type="Object">The scope for callback.</param>
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
	    MobileCRM.UI.EntityList.setEntityProperty = function (rowIndex, propertyName, editValue, saveImmediately, errorCallback, scope) {
	        /// <summary>[v10.1] Sets the value of the entity property.</summary>
	        /// <param name="rowIndex" type="Number">The index of the entity in the list.</param>
	        /// <param name="propertyName" type="String">The name of the property.</param>
	        /// <param name="editValue" type="any">the new property value.</param>
	        /// <param name="saveImmediately" type="Boolean">Indicates whether to save entity immediately or whether to just make it dirty.</param>
	        /// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called asynchronously in case of error.</param>
	        /// <param name="scope" type="Object">The scope for callback.</param>
			editValue = (typeof editValue) === "object" ? JSON.stringify(editValue) : editValue;

	        MobileCRM.bridge.invokeMethodAsync("EntityList", "FinishListEditByName", [rowIndex, propertyName, editValue, saveImmediately ? MobileCRM.UI.EntityListCellAction.DirectEdit : 0], null, errorCallback, scope);
	    };
	    MobileCRM.UI.EntityList.startEditCell = function (rowIndex, cellIndex, saveImmediately, binding, errorCallback, scope) {
	        /// <summary>[v10.1] Starts the editing of a list cell.<summary>
	        /// <param name="rowIndex" type="Number">The index of the row to edit.</param>
	        /// <param name="cellIndex" type="Number">The index of the cell.</param>
	        /// <param name="saveImmediately" type="Boolean">Indicates whether to save entity immediately after change or whether to just make it dirty.</param>
	        /// <param name="binding" type="Number">Optional, if null the binding from the cell index will be used.</param>
	        /// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called asynchronously in case of error.</param>
	        /// <param name="scope" type="Object">The scope for callback.</param>
	        var method = "StartListEdit";
	        var ps = [rowIndex, cellIndex, saveImmediately ? MobileCRM.UI.EntityListCellAction.DirectEdit : 0, binding];
	        if (isNaN(+cellIndex)) {
	            method = "StartListEditByName";
	            ps = ps.slice(0, 3);
	        }
	        MobileCRM.bridge.invokeMethodAsync("EntityList", method, ps, null, errorCallback, scope);
	    };
	    MobileCRM.UI.EntityList.clickCell = function (rowIndex, cellIndex, errorCallback, scope) {
	        /// <summary>[v10.1] Simulates click on a clickable list cell.<summary>
	        /// <remarks>Opens an entity form for lookup content record. Performs appropriate action for cells bound to the phone/email/web formatted fields.</remarks>
	        /// <param name="rowIndex" type="Number">The index of the row to click on.</param>
	        /// <param name="cellIndex" type="Number">The index of the cell.</param>
	        /// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called asynchronously in case of error.</param>
	        /// <param name="scope" type="Object">The scope for callback.</param>
	        MobileCRM.bridge.invokeMethodAsync("EntityList", "StartListEdit", [rowIndex, cellIndex, MobileCRM.UI.EntityListCellAction.Clickable, null], null, errorCallback, scope);
		};

	    MobileCRM.UI.EntityList.setDataSource = function (dataSource) {
	        /// <summary>Sets the entity list data source replacement.</summary>
	        /// <remarks><p>Data source must be set during the document load stage and must not be delayed.</p><p>It is used only if the entity view iFrame is marked as data source provider in Woodford.</p></remarks>
	        /// <param name="dataSource" type="MobileCRM.UI.ListDataSource">A data source object implementing the DynamicEntity list loading routine.</param>
	        MobileCRM.UI.EntityList._dataSource = dataSource;
	    };
		MobileCRM.UI.EntityList.setDataSourceFactory = function (dataSourceFactory) {
			/// <summary>[v11.0.2] Sets the entity list data source replacement factory.</summary>
			/// <remarks><p>Data source must be set during the document load stage and must not be delayed.</p><p>It is used only if the entity view iFrame is marked as data source provider in Woodford.</p></remarks>
			/// <param name="dataSourceFactory" type="Function">A function that returns an object implementing the <see cref="MobileCRM.UI.ListDataSource">DynamicEntity list loading routine</see>.</param>
			MobileCRM.UI.EntityList._dataSourceFactory = dataSourceFactory;
		};
	    MobileCRM.UI.EntityList._dataSourceMap = {};
	    MobileCRM.UI.EntityList._initDataSource = function (chunkReadyCmdId, fetch) {
	        var result = {};
	        var dataSource = MobileCRM.UI.EntityList._dataSource;

	        var factory = MobileCRM.UI.EntityList._dataSourceFactory;
	        if (!dataSource && factory)
	        	dataSource = factory();

	        if (dataSource) {
	            dataSource._chunkReadyCmdId = chunkReadyCmdId;
	            dataSource.fetch = fetch;
	            result = {
	                chunkSize: dataSource.chunkSize || 50
	            };
	            MobileCRM.UI.EntityList._dataSourceMap[chunkReadyCmdId] = dataSource;
	        }
	        return JSON.stringify(result);
	    };
	    MobileCRM.UI.EntityList._loadNextChunk = function (page, count, chunkReadyCmdId) {
	    	var ds;
	    	if (chunkReadyCmdId) {
	    		ds = MobileCRM.UI.EntityList._dataSourceMap[chunkReadyCmdId];
	    	}
	    	if (!ds)
	    		ds = MobileCRM.UI.EntityList._dataSource;

	        if (ds && typeof ds.loadNextChunk == "function") {
	            try {
	                var fetch = ds.fetch;
	                fetch.page = page;
	                fetch.count = count;
	                ds.loadNextChunk(page, count);
	                return "OK";
				} catch (e) {
					return _safeErrorMessage(e);
	            }
	        }
	        return "Invalid ListDataSource";
	    };

	    var _pendingListSaveId = 0;
	    MobileCRM.UI.EntityList.prototype.suspendSave = function () {
	        /// <summary>[v10.0] Suspends current &quot;onSave&quot; validation and allows performing another asynchronous tasks to determine the validation result</summary>
	        /// <returns type="Object">A request object with single method &quot;resumeSave&quot; which has to be called with the validation result (either error message string or &quot;null&quot; in case of success). To cancel the validation without any message, pass "#NoMessage#" text to this method.</returns>
	        var cmdId = "EntityListPendingValidation" + (++_pendingListSaveId);
	        var self = this;
	        self.context.pendingSaveCommand = cmdId;
	        return {
	            resumeSave: function (result) {
	                if (self._inCallback) {
	                    // still in "onSave" callback - do not send a command (handler not installed yet)
	                    self.context.errorMessage = result;
	                    self.context.pendingSaveCommand = null;
	                }
	                else
	                    MobileCRM.bridge.command(cmdId, result);
	            }
	        };
	    };
	    MobileCRM.UI.EntityList.onSave = function (handler, bind, scope) {
	        /// <summary>[v10.0] Binds or unbinds the handler for onSave event on EntityList.</summary>
	        /// <remarks>Bound handler is called with the EntityList object as an argument. The EntityList context object contains &quot;entities&quot; property with the list of all changed entities and property &quot;errorMessage&quot; that can be used to cancel save with an error.</remarks>
	        /// <param name="handler" type="function(entityList)">The handler function that has to be bound or unbound.</param>
	        /// <param name="bind" type="Boolean">Determines whether to bind or unbind the handler.</param>
	        /// <param name="scope" type="Object">The scope for handler calls.</param>
	        var handlers = MobileCRM.UI.EntityList._handlers.onSave;
	        var register = handlers.length == 0;
	        _bindHandler(handler, handlers, bind, scope);
	        if (register)
	            MobileCRM.bridge.command("registerEvents", "onSave");
	    }
	    MobileCRM.UI.EntityList.onChange = function (handler, bind, scope) {
	        /// <summary>[v10.0] Binds or unbinds the handler for onChange event on EntityList.</summary>
	        /// <remarks>Bound handler is called with the EntityList object as an argument. The EntityList context object contains &quot;entities&quot; property with the list of currently changed entities (typically just one entity) and property &quot;propertyName&quot; with the field name that was changed.</remarks>
	        /// <param name="handler" type="function(entityList)">The handler function that has to be bound or unbound.</param>
	        /// <param name="bind" type="Boolean">Determines whether to bind or unbind the handler.</param>
	        /// <param name="scope" type="Object">The scope for handler calls.</param>
	        var handlers = MobileCRM.UI.EntityList._handlers.onChange;
	        var register = handlers.length == 0;
	        _bindHandler(handler, handlers, bind, scope);
	        if (register)
	            MobileCRM.bridge.command("registerEvents", "onChange");
	    }
	    MobileCRM.UI.EntityList.onClick = function (handler, bind, scope) {
	        /// <summary>[v10.1] Binds or unbinds the handler for onClick event on EntityList.</summary>
	        /// <remarks>Bound handler is called with the EntityList object as an argument. The EntityList context property contains <see cref="MobileCRM.UI.EntityListClickContext">EntityListClickContext</see> object.</remarks>
	        /// <param name="handler" type="function(entityList)">The handler function that has to be bound or unbound.</param>
	        /// <param name="bind" type="Boolean">Determines whether to bind or unbind the handler.</param>
	        /// <param name="scope" type="Object">The scope for handler calls.</param>
	        var handlers = MobileCRM.UI.EntityList._handlers.onClick;
	        var register = handlers.length == 0;
	        _bindHandler(handler, handlers, bind, scope);
	        if (register)
	            MobileCRM.bridge.command("registerEvents", "onClick");
	    }
	    MobileCRM.UI.EntityListClickContext = function () {
	        /// <summary>Represents a context for the <see cref="MobileCRM.UI.EntityList.onClick">MobileCRM.UI.EntityList.onClick</see> handler.</summary>
	        /// <field name="entities" type="Array">Single item array containing the <see cref="MobileCRM.DynamicEntity">DynamicEntity</see> object representing clicked entity.</field>
	        /// <field name="propertyName" type="String">The field name that was clicked within the list item.</field>
	        /// <field name="event" type="MobileCRM.UI.EntityListClickEvent">Event details.</field>
	    }
	    MobileCRM.UI.EntityListClickEvent = function () {
	        /// <summary>Represents an event object for <see cref="MobileCRM.UI.EntityListClickContext">MobileCRM.UI.EntityListClickContext</see>.</summary>
	        /// <field name="cell" type="Number">An index of the cell in row template.</field>
	        /// <field name="row" type="Number">The row index.</field>
	        /// <field name="binding" type="Number">A binding value.</field>
	        /// <field name="action" type="Number">Click action flags. Use constant from <see cref="MobileCRM.UI.EntityListCellAction">MobileCRM.UI.EntityListCellAction</see> enumeration.</field>
	    };
	    MobileCRM.UI.EntityListCellAction = function () {
	        /// <summary>Enumeration class holding constants for <see cref="MobileCRM.UI.EntityListClickEvent">MobileCRM.UI.EntityListClickEvent</see>.</summary>
	        /// <field name="Text" type="Number">Cell displaying data bound or constant text.</field>
	        /// <field name="Image" type="Number"> Cell displaying data bound or constant image.</field>
	        /// <field name="Button" type="Number"> Clickable button cell.</field>
	        /// <field name="InlineButton" type="Number"> The inline button. iOS only.</field>
	        /// <field name="Editable" type="Number"> The cell is editable. Or together with Text kind.</field>
	        /// <field name="Clickable" type="Number"> The cell is clickable. Or together with Text kind.</field>
	        /// <field name="DirectEdit" type="Number"> The cell is editable and will be saved right after change. Or together with Text kind.</field>
	        /// <field name="ActionMask" type="Number"> The cell is editable or clickable.</field>
	    };
	    MobileCRM.UI.EntityListCellAction.Text = 0;
	    MobileCRM.UI.EntityListCellAction.Image = 1;
	    MobileCRM.UI.EntityListCellAction.Button = 2;
	    MobileCRM.UI.EntityListCellAction.InlineButton = 3;
	    MobileCRM.UI.EntityListCellAction.Editable = 0x1000;
	    MobileCRM.UI.EntityListCellAction.Clickable = 0x2000;
	    MobileCRM.UI.EntityListCellAction.DirectEdit = 0x4000 | MobileCRM.UI.EntityListCellAction.Editable;
	    MobileCRM.UI.EntityListCellAction.ActionMask = 0xF000;

        MobileCRM.UI.TourplanViewMode = function () {
        /// <summary>Enumeration class holding constants for <see cref="MobileCRM.UI.TourplanForm">MobileCRM.UI.TourplanForm</see>.</summary>
        /// <field name="Agenda" type="Number">Agenda view.</field>
        /// <field name="Day" type="Number"> Day view.</field>
        /// <field name="Week" type="Number"> Week view.</field>
        /// <field name="Month" type="Number"> Month view.</field>
        }
        MobileCRM.UI.TourplanViewMode.Agenda = 0;
        MobileCRM.UI.TourplanViewMode.Day = 1;
        MobileCRM.UI.TourplanViewMode.Week = 2;
		MobileCRM.UI.TourplanViewMode.Month = 3;

	    // MobileCRM.UI.ListDataSource
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

	    // MobileCRM.UI.QuestionnaireForm
	    _inherit(MobileCRM.UI.QuestionnaireForm, MobileCRM.ObservableObject);
	    MobileCRM.UI.QuestionnaireForm._handlers = { onChange: [], onSave: [], onPostSave: [], onRepeatGroup: [], onDeleteGroup: [] };

	    MobileCRM.UI.QuestionnaireForm.prototype.cancelValidation = function (errorMsg) {
	        /// <summary>Stops the onSave validation and optionally causes an error message to be displayed.</summary>
	        /// <param name="errorMsg" type="String">An error message to be displayed or &quot;null&quot; to cancel the validation without message.</param>
	        this.context.errorMessage = errorMsg || "";
	    };
	    var _pendingSaveId = 0;
	    MobileCRM.UI.QuestionnaireForm.prototype.suspendSave = function () {
	        /// <summary>Suspends current &quot;onSave&quot; validation and allows performing another asynchronous tasks to determine the validation result</summary>
	        /// <returns type="Object">A request object with single method &quot;resumeSave&quot; which has to be called with the validation result (either error message string or &quot;null&quot; in case of success). To cancel the validation without any message, pass "#NoMessage#" text to this method.</returns>
	        var cmdId = "QuestionnaireFormPendingValidation" + (++_pendingSaveId);
	        var _this = this;
	        _this.context.pendingSaveCommand = cmdId;
	        return {
	            resumeSave: function (result) {
	                if (_this._inCallback) {
	                    // still in "onSave" callback - do not send a command (handler not installed yet)
	                    _this.context.errorMessage = result;
	                    _this.context.pendingSaveCommand = null;
	                }
	                else
	                    MobileCRM.bridge.command(cmdId, result);
	            }
	        };
	    };
	    MobileCRM.UI.QuestionnaireForm.onSave = function (handler, bind, scope) {
	        /// <summary>Binds or unbinds the handler for onSave event on QuestionnaireForm.</summary>
	        /// <param name="handler" type="function(questionnaireForm)">The handler function that has to be bound or unbound.</param>
	        /// <param name="bind" type="Boolean">Determines whether to bind or unbind the handler.</param>
	        /// <param name="scope" type="Object">The scope for handler calls.</param>
	        var handlers = MobileCRM.UI.QuestionnaireForm._handlers.onSave;
	        var register = handlers.length == 0;
	        _bindHandler(handler, handlers, bind, scope);
	        if (register)
	            MobileCRM.bridge.command("registerEvents", "onSave");
	    }
	    MobileCRM.UI.QuestionnaireForm.onChange = function (handler, bind, scope) {
	        /// <summary>Binds or unbinds the handler for onChange event on QuestionnaireForm.</summary>
	        /// <param name="handler" type="function(questionnaireForm)">The handler function that has to be bound or unbound.</param>
	        /// <param name="bind" type="Boolean">Determines whether to bind or unbind the handler.</param>
	        /// <param name="scope" type="Object">The scope for handler calls.</param>
	        var handlers = MobileCRM.UI.QuestionnaireForm._handlers.onChange;
	        var register = handlers.length == 0;
	        _bindHandler(handler, handlers, bind, scope);
	        if (register)
	            MobileCRM.bridge.command("registerEvents", "onChange");
	    }
		MobileCRM.UI.QuestionnaireForm.onAnswerChanged = function (questionName, handler, bind, scope) {
			/// <summary>[v11.2] Binds or unbinds the handler for specific question change event on QuestionnaireForm.</summary>
			/// <param name="questionName" type="String">The name of desired question.</param>
			/// <param name="handler" type="function(questionnaireForm)">The handler function that has to be bound or unbound.</param>
			/// <param name="bind" type="Boolean">Determines whether to bind or unbind the handler.</param>
			/// <param name="scope" type="Object">The scope for handler calls.</param>
			var handlerName = "onChange:" + questionName;
			var handlers = MobileCRM.UI.QuestionnaireForm._handlers[handlerName];
			if (!handlers)
				MobileCRM.UI.QuestionnaireForm._handlers[handlerName] = handlers = [];
			var register = handlers.length == 0;
			_bindHandler(handler, handlers, bind, scope);
			if (register)
				MobileCRM.bridge.command("registerEvents", handlerName);
		}
	    MobileCRM.UI.QuestionnaireForm.onRepeatGroup = function (handler, bind, scope) {
	        /// <summary>Binds or unbinds the handler for onRepeatGroup event on QuestionnaireForm.</summary>
	        /// <param name="handler" type="function(questionnaireForm)">The handler function that has to be bound or unbound.</param>
	        /// <param name="bind" type="Boolean">Determines whether to bind or unbind the handler.</param>
	        /// <param name="scope" type="Object">The scope for handler calls.</param>
	        var handlers = MobileCRM.UI.QuestionnaireForm._handlers.onRepeatGroup;
	        var register = handlers.length == 0;
	        _bindHandler(handler, handlers, bind, scope);
	        if (register)
	            MobileCRM.bridge.command("registerEvents", "onRepeatGroup");
	    }
	    MobileCRM.UI.QuestionnaireForm.onDeleteGroup = function (handler, bind, scope) {
	        /// <summary>Binds or unbinds the handler for onDeleteGroup event on QuestionnaireForm.</summary>
	        /// <param name="handler" type="function(questionnaireForm)">The handler function that has to be bound or unbound.</param>
	        /// <param name="bind" type="Boolean">Determines whether to bind or unbind the handler.</param>
	        /// <param name="scope" type="Object">The scope for handler calls.</param>
	        var handlers = MobileCRM.UI.QuestionnaireForm._handlers.onDeleteGroup;
	        var register = handlers.length == 0;
	        _bindHandler(handler, handlers, bind, scope);
	        if (register)
	            MobileCRM.bridge.command("registerEvents", "onDeleteGroup");
	    }
	    MobileCRM.UI.QuestionnaireForm.onPostSave = function (handler, bind, scope) {
	        /// <summary>Binds or unbinds the handler for onPostSave event on QuestionnaireForm.</summary>
	        /// <param name="handler" type="function(questionnaireForm)">The handler function that has to be bound or unbound.</param>
	        /// <param name="bind" type="Boolean">Determines whether to bind or unbind the handler.</param>
	        /// <param name="scope" type="Object">The scope for handler calls.</param>
	        var handlers = MobileCRM.UI.QuestionnaireForm._handlers.onPostSave;
	        var register = handlers.length == 0;
	        _bindHandler(handler, handlers, bind, scope);
	        if (register)
	            MobileCRM.bridge.command("registerEvents", "onPostSave");
	    }
	    var _pendingQFPostSaveId = 0;
	    MobileCRM.UI.QuestionnaireForm.prototype.suspendPostSave = function () {
	        /// <summary>Suspends current &quot;onPostSave&quot; operations and allows performing another asynchronous tasks before the form is closed.</summary>
	        /// <returns type="Object">A request object with single method &quot;resumePostSave&quot; which has to be called to resume the post-save operations.</returns>
	        var cmdId = "QuestionnaireFormPendingPostSave" + (++_pendingQFPostSaveId);
	        var _this = this;
	        _this.context.pendingPostSaveCommand = cmdId;
	        return {
	            resumePostSave: function () {
	                if (_this._inCallback) {
	                    // still in "onPostSave" callback - do not send a command (handler not installed yet)
	                    _this.context.pendingPostSaveCommand = null;
	                }
	                else
	                    MobileCRM.bridge.command(cmdId);
	            }
	        };
	    };
	    MobileCRM.UI.QuestionnaireForm.requestObject = function (callback, errorCallback, scope) {
	        /// <summary>Requests the managed QuestionnaireForm object.</summary>
	        /// <remarks>Method initiates an asynchronous request which either ends with calling the <b>errorCallback</b> or with calling the <b>callback</b> with Javascript version of QuestionnaireForm object. See <see cref="MobileCRM.Bridge.requestObject">MobileCRM.Bridge.requestObject</see> for further details.</remarks>
	        /// <param name="callback" type="function(questionnaireForm)">The callback function that is called asynchronously with serialized QuestionnaireForm object as argument. Callback should return true to apply changed properties.</param>
	        /// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
	        /// <param name="scope" type="Object">The scope for callbacks.</param>
	        MobileCRM.bridge.requestObject("QuestionnaireForm", function (obj) {
				return obj.runCallback(callback, scope);
	        }, errorCallback, scope);
	    }
	    MobileCRM.UI.QuestionnaireForm._callHandlers = function (event, data, context) {
	        var handlers = MobileCRM.UI.QuestionnaireForm._handlers[event];
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
	    };

	    MobileCRM.UI.QuestionnaireForm.prototype.findGroupById = function (groupId) {
	        /// <summary>Returns the question group with given id.</summary>
	        /// <param name="name" type="String">An id of the question group.</param>
	        /// <returns type="MobileCRM.UI.QuestionnaireForm.Group"></returns>
	        return _findInArray(this.groups, "id", groupId);
	    };
	    MobileCRM.UI.QuestionnaireForm.prototype.findGroupByName = function (groupName) {
	        /// <summary>Returns the question group with given name.</summary>
	        /// <param name="name" type="String">A name of the question group.</param>
	        /// <returns type="MobileCRM.UI.QuestionnaireForm.Group"></returns>
	        return _findInArray(this.groups, "name", groupName);
	    };
	    MobileCRM.UI.QuestionnaireForm.prototype.findQuestionById = function (id) {
	        /// <summary>Returns the question item with given id.</summary>
	        /// <param name="id" type="String">An id of the question item.</param>
	        /// <returns type="MobileCRM.UI.QuestionnaireForm.Question"></returns>
	        return _findInArray(this.questions, "id", id);
	    };
	    MobileCRM.UI.QuestionnaireForm.prototype.findQuestionByName = function (name) {
	        /// <summary>Returns the question item with given name.</summary>
	        /// <param name="name" type="String">A name of the question item.</param>
	        /// <returns type="MobileCRM.UI.QuestionnaireForm.Question"></returns>
	        return _findInArray(this.questions, "name", name);
	    };

	    MobileCRM.UI.QuestionnaireForm.trySetAnswer = function (questionName, answer, errorCallback, scope) {
	        /// <summary>Asynchronously sets the answer value for given question.</summary>
	        /// <param name="questionName" type="String">A name of the question.</param>
	        /// <param name="answer" type="any">A value that has to be set as answer. It must correspond to the type of question.</param>
	        /// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
	        /// <param name="scope" type="Object">The scope for callbacks.</param>
	        var val = typeof (answer) == "object" ? JSON.stringify(answer) : answer;
	        MobileCRM.bridge.invokeMethodAsync("QuestionnaireForm", "TrySetAnswer", [questionName, val], null, errorCallback, scope);
		};
		MobileCRM.UI.QuestionnaireForm.trySetImageAnswer = function (imageQuestionName, base64Data, mimeType, errorCallback, scope) {
			/// <summary>Asynchronously sets the answer value for given image question.</summary>
			/// <param name="imageQuestionName" type="String">A name of the image question.</param>
			/// <param name="base64Data" type="string">A value that us used to create image answer. If null or empty image will be deleted.</param>
			/// <param name="mimeType" type="string">The valid mime type of corresponding base64Data.</param>
			/// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
			/// <param name="scope" type="Object">The scope for callbacks.</param>
			MobileCRM.bridge.invokeMethodAsync("QuestionnaireForm", "TrySetImageAnswer", [imageQuestionName, base64Data, mimeType], null, errorCallback, scope);
		};
	    MobileCRM.UI.QuestionnaireForm.focusQuestion = function (questionName, errorCallback, scope) {
	        /// <summary>Asynchronously sets the focus on given question.</summary>
	        /// <param name="questionName" type="String">A name of the question.</param>
	        /// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
	        /// <param name="scope" type="Object">The scope for callbacks.</param>
	        MobileCRM.bridge.invokeMethodAsync("QuestionnaireForm", "FocusQuestion", [questionName], null, errorCallback, scope);
	    };
	    MobileCRM.UI.QuestionnaireForm.overridePicklistOptions = function (questionName, allowNull, options, errorCallback, scope) {
	        /// <summary>Overrides the list of options for given picklist question.</summary>
	        /// <param name="questionName" type="String">A name of the picklist question.</param>
	        /// <param name="allowNull" type="Boolean">Indicates whether the empty answer is allowed.</param>
	        /// <param name="options" type="Object">An object with label-to-value mappings, e.g. {&quot;Option 1&quot;:1,&quot;Option 2&quot;:2}.</param>
	        /// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
	        /// <param name="scope" type="Object">The scope for callbacks.</param>
	        var optionsSt = "";
	        if (typeof options == "string")
	            optionsSt = options;
	        else {
	            for (var key in options) {
	                if (optionsSt)
	                    optionsSt += ";";
	                optionsSt += options[key] + ";" + key;
	            }
	        }
	        MobileCRM.bridge.invokeMethodAsync("QuestionnaireForm", "OverridePicklistOptions", [questionName, allowNull ? true : false, optionsSt], null, errorCallback, scope);
	    };
	    MobileCRM.UI.QuestionnaireForm.changeLookupQuestionSetup = function (questionName, dialogSetup, inlinePickSetup, dialogOnly, errorCallback, scope) {
	        /// <summary>Sets the views and filters for specified lookup question.</summary>
	        /// <param name="questionName" type="String">A name of the question.</param>
	        /// <param name="dialogSetup" type="MobileCRM.UI.DetailViewItems.LookupSetup">Lookup setup for modal lookup dialog.</param>
	        /// <param name="inlinePickSetup" type="MobileCRM.UI.DetailViewItems.LookupSetup">Optional setup for inline lookup picker. Leave empty to use the same setup as modal dialog.</param>
	        /// <param name="dialogOnly" type="Boolean">Indicates whether to allow the inline picker. Set &quot;true&quot; to disable the inline picker and always use the modal dialog. Set &quot;false&quot; to allow the inline picker.<param>
	        /// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
	        /// <param name="scope" type="Object">The scope for callbacks.</param>
	        var xml = "<lookup>";
	        xml += dialogSetup._serialize();
	        if (!dialogOnly && inlinePickSetup)
	            xml += inlinePickSetup._serialize();
	        xml += "<dialog>" + (dialogOnly ? 1 : 0) + "</dialog>";
	        xml += "</lookup>";
	        MobileCRM.bridge.invokeMethodAsync("QuestionnaireForm", "ChangeLookupViews", [questionName, xml], null, errorCallback, scope);
	    };
	    MobileCRM.UI.QuestionnaireForm.repeatGroup = function (groupId, copyValues, errorCallback, scope) {
	        ///<summary>Duplicates repeatable group with all its questions. The name of the group will contain the lowest available repeatIndex and suffix in form #00X.</summary>
	        /// <param name="id" type="String">Id of the source group.</param>
	        /// <param name="copyValues" type="Boolean">Optional paramater determining whether the group values should be copied to the new instance of this group.</param>
	        /// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
	        /// <param name="scope" type="Object">The scope for callbacks.</param>
	        MobileCRM.bridge.invokeMethodAsync("QuestionnaireForm", "RepeatGroup", [groupId, copyValues], null, errorCallback, scope);
	    };
	    MobileCRM.UI.QuestionnaireForm.deleteGroup = function (groupId, errorCallback, scope) {
	        ///<summary>Deletes an instance of repeatable group with all its questions and adjusts the repeatIndex for all instances of the same template group with higher index.</summary>
	        /// <param name="id" type="String">Id of the source group.</param>
	        /// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
	        /// <param name="scope" type="Object">The scope for callbacks.</param>
	        MobileCRM.bridge.invokeMethodAsync("QuestionnaireForm", "DeleteGroup", [groupId], null, errorCallback, scope);
	    };

		MobileCRM.UI.QuestionnaireForm.Group = function () {
			/// <field name="id" type="String">Gets the id of this question group.</field>
			/// <field name="name" type="String">Gets the name of the question group.</field>
			/// <field name="index" type="Number">Gets the index of the question group.</field>
			/// <field name="label" type="String">Gets the question group label.</field>
			/// <field name="description" type="String">Get the question group description.</field>
			/// <field name="templateGroup" type="String">Gets the id of parent group from questionnaire template.</field>
			/// <field name="repeatIndex" type="Number">Index of this instance of repeatable group. Zero for non-repeatable groups.</field>
			/// <field name="repeatEnabled" type="Boolean">Indicates whether the group is repeatable.</field>
			/// <field name="isVisible" type="Boolean">Gets or sets whether the group is visible.</field>
			/// <field name="isEnabled" type="Boolean">Gets or sets whether the group is enabled.</field>
			/// <field name="isExpanded" type="Boolean">Gets or sets whether the group is expanded (true) or collapsed (false).</field>
			MobileCRM.UI.QuestionnaireForm.Group.superproto.constructor.apply(this, arguments);
		};
	    _inherit(MobileCRM.UI.QuestionnaireForm.Group, MobileCRM.ObservableObject);
	    MobileCRM.UI.QuestionnaireForm.Group.prototype.repeatGroup = function (copyValues, errorCallback, scope) {
	        ///<summary>Duplicates repeatable group with all its questions. The name of the group will contain the lowest available repeatIndex and suffix in form #00X.</summary>
	        /// <param name="copyValues" type="Boolean">Optional parameter determining whether the group values should be copied to the new instance of this group.</param>
	        /// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
	        /// <param name="scope" type="Object">The scope for callbacks.</param>
	        MobileCRM.UI.QuestionnaireForm.repeatGroup(this.id, copyValues, errorCallback, scope);
	    };
	    MobileCRM.UI.QuestionnaireForm.Group.prototype.deleteGroup = function (errorCallback, scope) {
	        ///<summary>Deletes this instance of repeatable group with all its questions and adjusts the repeatIndex for all instances of the same template group with higher index.</summary>
	        /// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
	        /// <param name="scope" type="Object">The scope for callbacks.</param>
	        MobileCRM.UI.QuestionnaireForm.deleteGroup(this.id, errorCallback, scope);
	    };

	    MobileCRM.UI.QuestionnaireForm.Question = function () {
	        /// <field name="id" type="String">Gets the id of this question record.</field>
	        /// <field name="name" type="String">Gets the name of the question item.</field>
	        /// <field name="label" type="String">Gets or sets the question item label.</field>
	        /// <field name="index" type="Number">Gets the index of the question item.</field>
	        /// <field name="groupId" type="String">Gets the id of parent question group (may be empty).</field>
	        /// <field name="description" type="String">Get or sets the question item description.</field>
	        /// <field name="type" type="Number">Gets the value type of the question item.</field>
	        /// <field name="value" type="Any">Gets current answer value. To change it, use trySetAnswer method.</field>
	        /// <field name="style" type="String">Gets or sets the question item style name.</field>
	        /// <field name="isVisible" type="Boolean">Indicates whether the item is visible.</field>
	        /// <field name="isEnabled" type="Boolean">Indicates whether the item is enabled.</field>
	        /// <field name="focus" type="Boolean">Set to true to focus the question item.</field>
	        /// <field name="validate" type="Boolean">Indicates whether the item should be validated.</field>
	        /// <field name="errorMessage" type="String">Holds the error message text related to current value of the question item.</field>
	        MobileCRM.UI.QuestionnaireForm.Question.superproto.constructor.apply(this, arguments);
	    };
	    _inherit(MobileCRM.UI.QuestionnaireForm.Question, MobileCRM.ObservableObject);
	    MobileCRM.UI.QuestionnaireForm.Question.prototype.trySetAnswer = function (answer, errorCallback, scope) {
	        /// <summary>Asynchronously sets the answer value for this question.</summary>
	        /// <param name="answer" type="any">A value that has to be set as answer. It must correspond to the type of question (String/Number/Reference/Guid).</param>
	        /// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
	        /// <param name="scope" type="Object">The scope for callbacks.</param>
	        MobileCRM.UI.QuestionnaireForm.trySetAnswer(this.name, answer, errorCallback, scope);
	    };
	    MobileCRM.UI.QuestionnaireForm.Question.prototype.focus = function (errorCallback, scope) {
	        /// <summary>Asynchronously sets the focus on this question.</summary>
	        /// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
	        /// <param name="scope" type="Object">The scope for callbacks.</param>
	        MobileCRM.UI.QuestionnaireForm.focusQuestion(this.name, errorCallback, scope);
	    };
		MobileCRM.UI.QuestionnaireForm.getQuestionnaireEntity = function (callback, errorCallback, scope) {
			/// <summary>Requests the Questionnaire entity.</summary>
			/// <param name="callback" type="function(entity)">The callback function that is called asynchronously with a DynamicEntity object representing currently opened questionnaire. Callback should return true to apply changed properties.</param>
			/// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
			/// <param name="scope" type="Object">The scope for callbacks.</param>
			MobileCRM.bridge.invokeMethodAsync("QuestionnaireForm", "get_Questionnaire", [], callback, errorCallback, scope);
		};
		MobileCRM.UI.QuestionnaireForm.onCommand = function (command, handler, bind, scope) {
			/// <summary>Binds or unbinds the handler for QuestionnaireForm command.</summary>
			/// <param name="command" type="String">The name of the QuestionnaireForm command.</param>
			/// <param name="handler" type="function(questionnaireForm)">The handler function that has to be bound or unbound.</param>
			/// <param name="bind" type="Boolean">Determines whether to bind or unbind the handler.</param>
			/// <param name="scope" type="Object">The scope for handler calls.</param>
			var handlers = MobileCRM.UI.QuestionnaireForm._handlers[command];
			if (!handlers)
				handlers = MobileCRM.UI.QuestionnaireForm._handlers[command] = [];
			_bindHandler(handler, handlers, bind, scope);
			var action = ((bind == false && handlers.length == 0) ? "cmdDel" : "cmd");
			MobileCRM.bridge.command("registerEvents", action + ":" + command);
		}

	    // MobileCRM.UI.EntityForm
	    _inherit(MobileCRM.UI.EntityForm, MobileCRM.ObservableObject);
		MobileCRM.UI.EntityForm._handlers = { onChange: [], onSave: [], onPostSave: [], onDetailCollectionChange: [], onSelectedViewChanged: [], onProcessLoaded: [] };

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

		MobileCRM.UI.EntityForm.prototype.getEntityList = function (name) {
			/// <summary>Returns the entity list by its view name.</summary>
			/// <param name="name" type="String">A name of entity list view.</param>
			/// <returns type="MobileCRM.UI._EntityList">A <see cref="MobileCRM.UI._EntityList">MobileCRM.UI._EntityList</see> object with requested view name.</returns>
			var list = undefined;
			var controller = this.getController(name);
			if (controller)
				list = controller.list;
			else {
				for (var i = 0; i < this.associatedViews.length; i++) {
					var v = this.associatedViews[i];
					if (v.listView.name == name) {
						list = v;
						break;
					}
				}
			}
			return list;
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
	        MobileCRM.UI.EntityForm.selectTabEx(tabName, function () { }, errorCallback, scope);
	    };

	    MobileCRM.UI.EntityForm.selectTabEx = function (tabName, callback, errorCallback, scope) {
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
	                MobileCRM.bridge.invokeMethodAsync("EntityForm", "Form.set_SelectedViewIndex", [index], callback, errorCallback, scope);
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
	        /// <param name="visible" type="Boolean">Defines desired visibility state.</param>
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
	        /// <returns type="Object">A request object with single method &quot;resumeSave&quot; which has to be called with the validation result (either error message string or &quot;null&quot; in case of success). To cancel the validation without any message, pass "#NoMessage#" text to this method.</returns>
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
		MobileCRM.UI.EntityForm.onProcessLoaded = function (handler, bind, scope) {
			/// <summary>Binds or unbinds the handler for onProcessLoaded event on EntityForm.</summary>
			/// <param name="handler" type="function(entityForm)">The handler function that has to be bound or unbound.</param>
			/// <param name="bind" type="Boolean">Determines whether to bind or unbind the handler.</param>
			/// <param name="scope" type="Object">The scope for handler calls.</param>
			var handlers = MobileCRM.UI.EntityForm._handlers.onProcessLoaded;
			var register = handlers.length == 0;
			_bindHandler(handler, handlers, bind, scope);
			if (register)
				MobileCRM.bridge.command("registerEvents", "onProcessLoaded");
		}
		MobileCRM.UI.EntityForm.onItemChange = function (itemName, handler, bind, scope) {
			/// <summary>[v11.2] Binds or unbinds the handler for specific item change event on EntityForm.</summary>
			/// <param name="itemName" type="String">The name of desired detail item (mostly logical name of the field).</param>
			/// <param name="handler" type="function(entityForm)">The handler function that has to be bound or unbound.</param>
			/// <param name="bind" type="Boolean">Determines whether to bind or unbind the handler.</param>
			/// <param name="scope" type="Object">The scope for handler calls.</param>
			var handlerName = "onChange:" + itemName;
			var handlers = MobileCRM.UI.EntityForm._handlers[handlerName];
			if (!handlers)
				MobileCRM.UI.EntityForm._handlers[handlerName] = handlers = [];
			var register = handlers.length == 0;
			_bindHandler(handler, handlers, bind, scope);
			if (register)
				MobileCRM.bridge.command("registerEvents", handlerName);
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
	    MobileCRM.UI.EntityForm.loadTab = function (tabName, load, errorCallback, scope) {
	        /// <summary>[v10.1] (Re)loads the tab of the passed name.</summary>
	        /// <param name="tabName" type="String">The name of the tab.</param>
	        /// <param name="load" type="Boolean">Whether to (re)load or unload a view.</param>
	        /// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called asynchronously in case of error.</param>
	        /// <param name="scope" type="Object">The scope for callback.</param>
	        MobileCRM.bridge.invokeMethodAsync("EntityForm", "LoadView", [tabName, load], function (index) {}, errorCallback, scope);
	    };
	    MobileCRM.UI.EntityForm.requestObject = function (callback, errorCallback, scope) {
	        /// <summary>Requests the managed EntityForm object.</summary>
	        /// <remarks>Method initiates an asynchronous request which either ends with calling the <b>errorCallback</b> or with calling the <b>callback</b> with Javascript version of EntityForm object. See <see cref="MobileCRM.Bridge.requestObject">MobileCRM.Bridge.requestObject</see> for further details.</remarks>
	        /// <param name="callback" type="function(entityForm)">The callback function that is called asynchronously with serialized EntityForm object as argument. Callback should return true to apply changed properties.</param>
	        /// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
	        /// <param name="scope" type="Object">The scope for callbacks.</param>
	        MobileCRM.bridge.requestObject("EntityForm", function (obj) {
				return obj.runCallback(callback, scope);
	        }, errorCallback, scope);
	    }
	    MobileCRM.UI.EntityForm._callHandlers = function (event, data, context) {
	        var handlers = MobileCRM.UI.EntityForm._handlers[event];
	        if (handlers && handlers.length > 0) {
	            data.context = context;
	            data._inCallback = true;
	            var result = '';
	            if (_callHandlers(handlers, data) != false) {
					var changed = data.getChanged() || {};
					changed.context = context;
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
	            var res = _callHandlers(handlers, data);
	            return typeof (res) == "string" ? res : JSON.stringify(res);
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
		MobileCRM.UI.EntityForm.DetailCollection.getAllAsync = function () {
	        /// <summary>Asynchronously returns the collection of the sales entity details (e.g. Order details)</summary>
			/// <returns type="Promise&lt;MobileCRM.DynamicEntity[]&gt;">A Promise object which will be resolved with an array of DynamicEntity objects representing the sales entity detail records.</returns>
			return new Promise(function (resolve, reject) {
				MobileCRM.UI.EntityForm.DetailCollection.getAll(resolve, function (err) { reject(new Error(err)); });
			});
		}
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
		MobileCRM.UI.EntityForm.DetailCollection.getAsync = function (index) {
	        /// <summary>Asynchronously returns requested sales entity detail (e.g. Order detail)</summary>
	        /// <param name="index" type="Number">An index of requested item.</param>
			/// <returns type="Promise&lt;MobileCRM.DynamicEntity&gt;">A Promise object which will be resolved with the DynamicEntity object representing the sales entity detail record.</returns>
			return new Promise(function (resolve, reject) {
				MobileCRM.UI.EntityForm.DetailCollection.get(index, resolve, function (err) { reject(new Error(err)); });
			});
		}
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
	            if (typeof callback == "function")
	                callback.call(scope, detailEntity);
	        }, errorCallback, scope);
		};

	    MobileCRM.UI.EntityForm.DetailCollection.addProductWithQuantity = function (product, quantity, callback, errorCallback, scope) {
	        /// <summary>[v10.0] Appends the product into sales order collection.</summary>
	        /// <remarks>Resulting <see cref="MobileCRM.DynamicEntity">MobileCRM.DynamicEntity</see> object implements method &quot;update&quot; which can be used to update the entity properties in the sales detail collection.</remarks>
	        /// <param name="product" type="MobileCRM.Reference">A reference of the product to be appended.</param>
	        /// <param name="quantity" type="Number">Product quantity.</param>
	        /// <param name="callback" type="function(MobileCRM.DynamicEntity)">The callback function which is called asynchronously with <see cref="MobileCRM.DynamicEntity">MobileCRM.DynamicEntity</see> object as an argument.</param>
	        /// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
	        /// <param name="scope" type="Object">The scope for callbacks.</param>
	        MobileCRM.bridge.command("addSalesDetailProduct", "#" + quantity + ":" + JSON.stringify(product), function (detailEntity) {
	            detailEntity.update = MobileCRM.UI.EntityForm.DetailCollection._updateDetail;
	            if (typeof callback == "function")
	                callback.call(scope, detailEntity);
	        }, errorCallback, scope);
	    };
		MobileCRM.UI.EntityForm.DetailCollection.addAsync = function (product, quantity) {
	        /// <summary>[v10.0] Appends the product into sales order collection.</summary>
	        /// <remarks>Resulting <see cref="MobileCRM.DynamicEntity">MobileCRM.DynamicEntity</see> object implements method &quot;update&quot; which can be used to update the entity properties in the sales detail collection.</remarks>
	        /// <param name="product" type="MobileCRM.Reference">A reference of the product to be appended.</param>
	        /// <param name="quantity" type="Number">Product quantity.</param>
			/// <returns type="Promise&lt;MobileCRM.DynamicEntity&gt;">A Promise object which will be resolved with the DynamicEntity object representing new sales entity detail record.</returns>
			return new Promise(function (resolve, reject) {
				MobileCRM.UI.EntityForm.DetailCollection.addProductWithQuantity(product, quantity, resolve, function (err) { reject(new Error(err)); });
			});
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
				maxUploadImageSize: this.maxUploadImageSize,
	            recordQuality: this.recordQuality,
	            allowChooseVideo: this.allowChooseVideo,
				allowMultipleFiles: this.allowMultipleFiles,
				allowCancelHandler: this.allowCancelHandler
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
		MobileCRM.Services.DocumentService.prototype.selectMultiplePhotos = function (callback, errorCallback, scope) {
	        /// <summary>[v11.2.3] Asks the user to choose multiple photos and calls the async callback with linked list of file infos (see <see cref="MobileCRM.Services.FileInfo">FileInfo.nextInfo</see>).</summary>
			/// <param name="callback" type="function(MobileCRM.Services.FileInfo)">The callback function which is called asynchronously with <see cref="MobileCRM.Services.FileInfo">MobileCRM.Services.FileInfo</see> object as an argument.</param>
			/// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
			/// <param name="scope" type="Object">The scope for callbacks.</param>
			this._executeAction(0x1000000, callback, errorCallback, scope);
		};
		MobileCRM.Services.DocumentService.prototype.selectMultipleFiles = function (callback, errorCallback, scope) {
			/// <summary>[v14.2.0] Asks the user to choose multiple files and calls the async callback with linked list of file infos (see <see cref="MobileCRM.Services.FileInfo">FileInfo.nextInfo</see>).</summary>
			/// <param name="callback" type="function(MobileCRM.Services.FileInfo)">The callback function which is called asynchronously with <see cref="MobileCRM.Services.FileInfo">MobileCRM.Services.FileInfo</see> object as an argument.</param>
			/// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
			/// <param name="scope" type="Object">The scope for callbacks.</param>
			this.allowMultipleFiles = true;
			this._executeAction(0x10000000, callback, errorCallback, scope);
		};
		MobileCRM.Services.DocumentService.prototype.loadFrom = function (callback, errorCallback, scope) {
			/// <summary>[13.3.4]Asks the user to choose a file and calls the async callback with file info.</summary>
			/// <param name="callback" type="function(MobileCRM.Services.FileInfo)">The callback function which is called asynchronously with <see cref="MobileCRM.Services.FileInfo">MobileCRM.Services.FileInfo</see> object as an argument.</param>
			/// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
			/// <param name="scope" type="Object">The scope for callbacks.</param>
			this._executeAction(0x0080, callback, errorCallback, scope);
		};
		MobileCRM.Services.DocumentService.prototype.loadFromMultiple = function (callback, errorCallback, scope) {
			/// <summary>[13.3.4]Asks the user to choose a multiple files and calls the async callback with file info.</summary>
			/// <param name="callback" type="function(MobileCRM.Services.FileInfo)">The callback function which is called asynchronously with <see cref="MobileCRM.Services.FileInfo">MobileCRM.Services.FileInfo</see> object as an argument.</param>
			/// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
			/// <param name="scope" type="Object">The scope for callbacks.</param>
			this._executeAction(0x2000000, callback, errorCallback, scope);
		};
	    MobileCRM.Services.DocumentService.prototype.print = function (filePath, landscape, errorCallback, scope) {
	        /// <summary>[v9.1] Prints the document defined by file path.</summary>
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
	    MobileCRM.Services.DocumentService.prototype.resizeImage = function (filePath, maxWidth, maxHeight, callback, scope) {
	        /// <summary>[v11.1] Resize image defined by file path.</summary>
	        /// <param name="filePath" type="String">A file path.</param>
	        /// <param name="maxWidth" type="Number">Max width.</param>
	        /// <param name="maxHeight" type="Number">Max height.</param>
	        /// <param name="callback" type="function(result)">A callback function for asynchronous result. In case of success <b>result</b> argument will be <b>true</b> otherwise <b>false.</b></param>
	        /// <param name="scope" type="Object">The scope for callbacks.</param>
	        var params = {
	            filePath: filePath || "",
	            maxWidth: maxWidth,
	            maxHeight: maxHeight,
	            resizeImage:true
	        }
	        MobileCRM.bridge.command("documentService", JSON.stringify(params), callback, null, scope);
		};
		MobileCRM.Services.DocumentService.prototype.saveFileDialog = function (fileName, fileData, callback, scope) {
			/// <summary>[v11.2] Ask to user to choose a location and saves the passed data as a file at that location.</summary>
			/// <param name="fileName" type="String">A file name.</param>
			/// <param name="fileData" type="String">Base64 encoded file data.</param>
			/// <param name="callback" type="function(result)">A callback function for asynchronous result. In case of success <b>result</b> argument will be <b>true</b> otherwise <b>false.</b></param>
			/// <param name="scope" type="Object">The scope for callbacks.</param>
			var params = {
				fileName: fileName || "",
				fileData: fileData,
				saveFileDialog: true
			}
			MobileCRM.bridge.command("documentService", JSON.stringify(params), callback, null, scope);
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
	        MobileCRM.bridge.command("chatService", JSON.stringify({ method: "postMessage", entityName: regardingEntity.entityName, entityId: regardingEntity.id, primaryName: regardingEntity.primaryName, text: text }), callback, errorCallback, scope);
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
	        MobileCRM.bridge.command("chatService", JSON.stringify({ method: "subscribe", entityName: regardingEntity.entityName, entityId: regardingEntity.id, primaryName: regardingEntity.primaryName, subscribe: subscribe }), callback, errorCallback, scope);
		};
		MobileCRM.Services.CompanyInformation.getCompanyInfoFromVat = function (vat, callback, errorCallback, scope) {
			/// <summary>Return callback with CompanyInformation object with properties name and address</summary>
			/// <param name="vat" type="string">VAT number of company. e.g. "SK2020232390"</param>
			/// <param name="callback" type="function(CompanyInformation)">The callback function which is called asynchronously in case of success.</param>
			/// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
			/// <param name="scope" type="Object">The scope for callbacks.</param>
			if (!(typeof vat === "string")) {
				if (errorCallback)
					errorCallback('VAT is required and must be type of string.');
                return;
            }
			var content = "<SOAP-ENV:Envelope xmlns:ns1='urn:ec.europa.eu:taxud:vies:services:checkVat:types' xmlns:SOAP-ENV='http://schemas.xmlsoap.org/soap/envelope/'>" +
				"<SOAP-ENV:Body><ns1:checkVat><ns1:countryCode>" +
				vat.substring(0, 2) +
				"</ns1:countryCode><ns1:vatNumber>" +
				vat.substring(2) +
				"</ns1:vatNumber></ns1:checkVat></SOAP-ENV:Body></SOAP-ENV:Envelope>";
			var endpoint = "http://ec.europa.eu/taxation_customs/vies/services/checkVatService";
			var request = new MobileCRM.Services.HttpWebRequest();
			request.setBody(content);
			request.method = "POST";

			request.send(endpoint, function (response) {
				var textResponse = response.responseText;
				var codeResponse = response.responseCode;
				if (codeResponse == 200) {

					var parser = new DOMParser();
					var xmlDoc = parser.parseFromString(textResponse, "text/xml");

					try {
						var valid = xmlDoc.getElementsByTagName("valid")[0].childNodes[0].nodeValue;

						if (valid == "true") {
							var name = xmlDoc.getElementsByTagName("name")[0].childNodes[0].nodeValue;
							var address = xmlDoc.getElementsByTagName("address")[0].childNodes[0].nodeValue;
							var companyInfo = new MobileCRM.Services.CompanyInformation(name, address);
							if (typeof callback === 'function')
                                callback.call(scope, companyInfo);
						} else {
                            if (typeof errorCallback === 'function')
                                errorCallback("Invalid VAT number.");
						}
					}
                    catch (e) {
                        if (typeof errorCallback === 'function')
                            errorCallback("Not valid format of response.");
                    }
                } else {
                    if (typeof errorCallback === 'function')
                        errorCallback("Connection error.");
                }
			});
		};
	    MobileCRM.Services.AudioRecorder.startRecording = function (callback, errorCallback, scope) {
	        /// <summary>[v10.0] Starts recording audio from microphone</summary>
	        /// <param name="callback" type="function">The callback function which is called asynchronously in case of success.</param>
	        /// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
	        /// <param name="scope" type="Object">The scope for callbacks.</param>
	        MobileCRM.bridge.command("audioRecorder", "startRecording", callback, errorCallback, scope);
	        return new MobileCRM.Services.AudioRecorder();
	    };

	    MobileCRM.Services.AudioRecorder.prototype.stopRecording = function (callback, errorCallback, scope) {
	        /// <summary>[v10.0] Stops recording audio from microphone</summary>
	        /// <param name="callback" type="function">The callback function which is called asynchronously in case of success.</param>
	        /// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
	        /// <param name="scope" type="Object">The scope for callbacks.</param>
	        MobileCRM.bridge.command("audioRecorder", "stopRecording", callback, errorCallback, scope);
	    };

	    MobileCRM.Services.AudioRecorder.prototype.getRecordBase64 = function (callback, errorCallback, scope) {
	        /// <summary>[v10.0] Returns recorded audio from microphone as base64 string</summary>
	        /// <param name="callback" type="function(String)">The callback function that is called asynchronously with the base64-encoded recording data.</param>
	        /// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
	        /// <param name="scope" type="Object">The scope for callbacks.</param>
	        MobileCRM.bridge.command("audioRecorder", "getRecordBase64", callback, errorCallback, scope);
	    };

	    MobileCRM.Services.AudioRecorder.prototype.getRecordFilePath = function (callback, errorCallback, scope) {
	        /// <summary>[v10.0] Returns absolute path to the file containing the record</summary>
	        /// <param name="callback" type="function(String)">The callback function that is called asynchronously with the file path.</param>
	        /// <param name="errorCallback" type="function(errorMsg)">The errorCallback which is called in case of error.</param>
	        /// <param name="scope" type="Object">The scope for callbacks.</param>
	        MobileCRM.bridge.command("audioRecorder", "getRecordFilePath", callback, errorCallback, scope);
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

		//// --- AIVISION ---
		MobileCRM.Services.AIVision.create = function (settings) {
			/// <summary>[v12.3]Create AIVsion instance using <see cref="MobileCRM.Services.AIVisionSettings">MobileCRM.Services.AIVisionSettings</see> object.</summary>
			/// <param name="settings" type="MobileCRM.Services.AIVisionSettings">AIVision settings.</param>

			var aivison = new MobileCRM.Services.AIVision();
			aivison._settings = [];
			aivison._settings.push("{ \"name\":\"" + settings.modelName + "\", \"predictionKey\":\"" + settings.predictionKey + "\", \"url\":\"" + settings.url + "\", \"serviceType\":\"" + settings.serviceType + "\"}");
			return aivison;
		};

		MobileCRM.Services.AIVision.createFromEntity = function (entityName) {
			/// <summary>[v12.3]Create AIVsion instance using entity name. The name is used to get settings from Woodford AI Image Recognition configuration.</summary>
			/// <param name="entityName" type="String">The entity name of Woodford AI Image Recognition configuration.</param>
			var aivison = new MobileCRM.Services.AIVision();
			aivison._entityName = entityName;
			return aivison;
		};

		MobileCRM.Services.AIVision.prototype.recognizeCapturedPhoto = function (sucessCallback, failureCallback, scope) {
			/// <summary>[v12.3] Recognize captured photo using AIVison service.</summary>
			/// <param name="sucessCallback" type="function">A callback function that is called with the object having array of tags and its probability and file path properties. {tags:[{tag:"", probability:""}], filePath:""} </param>
			/// <param name="failureCallback" type="function(errorMsg)">A callback which is called in case of error.</param>
			/// <param name="scope" type="Object">The scope for callbacks.</param>
			this._executeAction(2, sucessCallback, failureCallback);
		};
		MobileCRM.Services.AIVision.prototype.recognizeSelectedPicture = function (sucessCallback, failureCallback, scope) {
			/// <summary>[v12.3] Select photo and recognize it with AIVison service.</summary>
			/// <param name="sucessCallback" type="function">A callback function that is called with the object having array of tags and its probability and file path properties. {tags:[{tag:"", probability:""}], filePath:""} </param>
			/// <param name="failureCallback" type="function(errorMsg)">A callback which is called in case of error.</param>
			/// <param name="scope" type="Object">The scope for callbacks.</param>
			this._executeAction(4, sucessCallback, failureCallback);
		};

		MobileCRM.Services.AIVision.prototype._executeAction = function (action, sucessCallback, failureCallback, scope) {
			if (!this._entityName && !this._settings) {
				failureCallback("Please define entity or settings to construct AIVision service.");
				return;
			}
			var data = {
				entityName: this._entityName,
				settings: this._settings,
				action: action,
				isNew: this._isNew
			};

			this._isNew = false;

			MobileCRM.bridge.command("startAIImageRecognition", JSON.stringify(data), function (classifiedResults) {
				sucessCallback.call(scope, classifiedResults);
			}, failureCallback, scope);
		};

	    MobileCRM.Services.DynamicsReport.prototype.download = function (fileName, format, success, failed, scope) {
	        /// <summary>Downloads the MS Dynamics report into a file.</summary>
	        /// <param name="fileName" type="String">A file name for resulting file. Leave &quot;null&quot; to let app to safely generate the file name and extension.</param>
	        /// <param name="format" type="String">One of following formats (must be supported in Dynamics): XML, CSV, PDF, MHTML, EXCELOPENXML, WORDOPENXML, IMAGE.</param>
	        /// <param name="success" type="function(location)">A callback function that is called with the full path to downloaded file.</param>
	        /// <param name="failed" type="function(errorMsg)">A callback which is called in case of error.</param>
	        /// <param name="scope" type="Object">The scope for callbacks.</param>
	        var params = JSON.stringify({
	            format: format || "PDF",
	            outputFileName: fileName,
	            outputFolder: this.outputFolder,
	            outputFilePath: this.outputFilePath, // for internal use only
	            reportId: this.reportId,
	            regardingEntity: this.regarding ? this.regarding.entityName: null,
	            regardingId: this.regarding ? this.regarding.id: null
	        });
	        MobileCRM.bridge.command("downloadReport", params, success, failed, scope);
	    };
		MobileCRM.Services.HttpWebRequest.prototype.send = function (url, callback, scope) {
		    /// <summary>[v11.0] Allow to send http web request against an HTTP server.</summary>
		    /// <param name="url" type="String">The Url of server where HTTP request will be sent.</param>
		    /// <param name="callback" type="function(response)">A callback function that is called with the web response having &quot;responseCode&quot; and &quot;responseText&quot; properties.</param>
		    /// <param name="scope" type="Object">The scope for callbacks.</param>

		    var data = {
		        url: url, method: this.method,
		        headers: JSON.stringify(this.headers),
		        credentials: this._credentials, body: this._body,
		        encoding: this._encoding, contentType: this.contentType,
		        allowRedirect: this.allowRedirect,
                responseEncoding: this.responseEncoding
		    };

		    if (this._encoding === "Binary") {
		        if (this._body && this._body.constructor == Blob) {
		            var reader = new FileReader();
		            reader.addEventListener("loadend", function (res) {
		                data.body = this.result.split(',')[1];
		                data.encoding = "Base64";
						MobileCRM.bridge.command("sendHttpRequest", JSON.stringify(data), callback, null, scope);
		            });
		            reader.readAsDataURL(this._body);
		        }
		    }
		    else
				MobileCRM.bridge.command("sendHttpRequest", JSON.stringify(data), callback, null, scope);
		};
		MobileCRM.Services.HttpWebRequest.prototype.sendAsync = function (url) {
			/// <summary>[v13.3] Allow to send http web request against an HTTP server.</summary>
			/// <param name="url" type="String">The Url of server where HTTP request will be sent.</param>
			/// <returns type="Promise&lt;IWebResponse&gt;">A Promise object which is asynchronously resolved with the web response object, or rejected with the web response object, where responseText contains error message.</returns>

			var _this = this;
			return new Promise(function (resolve, reject) {
				_this.send(url, function (response) {
					if (response["isFailure"])
						reject(response);
					else
						resolve(response);
				});
			});
		};
		MobileCRM.Services.HttpWebRequest.prototype.setBody = function (body, encoding) {
		    /// <summary>[v11.0] Set content body of http web request.</summary>
		    /// <param name="body" type="String">The body content.</param>
		    /// <param name="encoding" type="String">The encoding (e.g. UTF-8, ASCII, Base64, Binary)</param>

		    this._body = body;
		    if (encoding)
		        this._encoding = encoding;
		}
		MobileCRM.Services.HttpWebRequest.prototype.setResponseEncoding = function (encoding) {
			/// <summary>[v11.0] Set encoding for content type of http web response.</summary>
			/// <param name="encoding" type="String">The encoding (e.g. UTF-8, ASCII, Base64)</param>

			if (encoding || encoding !== "Base64")
				this.responseEncoding = encoding;
		};
		MobileCRM.Services.HttpWebRequest.prototype.setCredentials = function (userName, password) {
		    /// <summary>[v10.4] Set Network credentials information.</summary>
		    /// <param name="userName" type="String">The authentication user name.</param>
		    /// <param name="password" type="String">The authentication password.</param>
		    this.userName = userName;
		    this.password = password;

		    this._credentials = JSON.stringify({ "userName": this.userName, "password": this.password });
		}
		MobileCRM.Services.Workflow = {};
		MobileCRM.Services.Workflow.Action = function () {
			/// <summary>[v11.2] Represents custom workfow action.</summary>
		};
		MobileCRM.Services.Workflow.Action.execute = function (actionName, parameters, success, failed, scope) {
			/// <summary>[v11.2] Asynchronously executes custom workfow action on the server.</summary>
			/// <param name="actionName" type="String">The unique name of the custom action to execute.</param>
			/// <param name="parameters" type="Object">The object containing the parameters for the custom action.</param>
			/// <param name="success" type="function(string)">A callback function for successful asynchronous result. The <b>result</b> argument will carry the serialized response from the server.</param>
			/// <param name="failed" type="function(error)">A callback function for command failure. The <b>error</b> argument will carry the error message.</param>
			/// <param name="scope" type="">A scope for calling the callbacks; set &quot;null&quot; to call the callbacks in global scope.</param>
			window.MobileCRM.bridge.command('executeWorkflowAction', JSON.stringify({ actionName: actionName, actionParameters: JSON.stringify(parameters) }), success, failed, scope);
		};

		/**************************************/
		// Platform dependent implementation   /
		// MobileCRM.bridge singleton creation /
		/**************************************/
		if (typeof(window) != "undefined") {
			if (document.location.search.indexOf("wc_mcrm_bid|") >= 0) {	// when running on webclient, that client appends 'wc_mcrm_bid|' is part of the 'data' attribute
				var webClientBridgeId = getWCBridgeInstanceId();
	
				MobileCRM.Bridge.prototype.command = function (command, params, success, failed, scope) {
					if (!webClientBridgeId) {
						webClientBridgeId = getWCBridgeInstanceId();
					}
					var cmdId = this._createCmdObject(success, failed, scope);
					var cmdText = webClientBridgeId + ';' + cmdId + ';' + command + ';' + params;
					parent.window.postMessage(cmdText, "*");
				};
				MobileCRM.bridge = new MobileCRM.Bridge('WebClient');
	
				window.addEventListener("message", receiveMessageFromWebClient, false);
	
				function receiveMessageFromWebClient(event) {
					var data = (typeof event.data === 'string' ? event.data : null);
					//alert("JSB: " + data);
					try {
						// process invokescript method
						if (data && data.indexOf("eval") === 0) {
							var index = data.indexOf(":");
							if (index >= 0) {
								var evalCode = data.substr(index + 1);
								var evalId = data.substr(0, index).split('|')[1];
								var result = eval(evalCode);
								if (evalId) {
									if (!webClientBridgeId) {
										webClientBridgeId = getWCBridgeInstanceId();
									}
									parent.window.postMessage(webClientBridgeId + ";" + evalId + ";asyncResponse;" + result, "*");
								}
							}
						}
					}
					catch (ex) {
						MobileCRM.bridge.alert("JSBridge on Webclient exception: " + ex);
						console.log(ex);
					}
				}
	
				function getWCBridgeInstanceId() {
					var args = document.location.search;
					var index = args.indexOf("wc_mcrm_bid|");
					var id = null;
					if (index > 0) {
						id = args.substr(index + 12);
					}
					if (id === null) {
						throw "JSBridge not registered."
					}
					return id;
				}
			}
			else if (typeof CrmBridge !== "undefined") {
				if (typeof CrmBridge.processCommand !== "undefined") {
					MobileCRM.Bridge.prototype.command = function (command, params, success, failed, scope) {
						var cmdId = this._createCmdObject(success, failed, scope);
						CrmBridge.processCommand(cmdId, command, params);
					};
					MobileCRM.bridge = new MobileCRM.Bridge('Windows'); // Chromium Enbedded Framework on Win7 Desktop
				}
				else {
					// Android
					MobileCRM.Bridge.prototype.command = function (command, params, success, failed, scope) {
						var cmdId = this._createCmdObject(success, failed, scope);
						CrmBridge.println(cmdId + ';' + command + ':' + params);
					};
					MobileCRM.bridge = new MobileCRM.Bridge('Android');
				}
				if (typeof CrmBridge.invoke !== "undefined") {
					MobileCRM.Bridge.prototype.invoke = function (command, params) {
						var result = CrmBridge.invoke(command, params);
						if (result.length >= 4 && result.substr(0, 4) == 'ERR:')
							throw new MobileCrmException(result.substr(4));
						else
							return eval('(' + result + ')');
					};
				}
			}
			else {
				if ("chrome" in window && "webview" in window["chrome"]) {
					// Windows UWP with WebView2 (Edge)
					MobileCRM.Bridge.prototype.command = function (command, params, success, failed, scope) {
						var cmdId = this._createCmdObject(success, failed, scope);
						chrome.webview.postMessage(cmdId + ';' + command + ':' + params);
					};
					MobileCRM.bridge = new MobileCRM.Bridge('Windows');
				}
				else if ("external" in window && external) {
					var win10 = "win10version" in window;
					if ("notify" in external || win10) {
						// WindowsPhone || WindowsRT || Windows10 with legacy WebView
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
						if (!("alert" in window)) {
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
					else if ("ProcessCommand" in external) {
						// Windows Desktop
						MobileCRM.Bridge.prototype.command = function (command, params, success, failed, scope) {
							var cmdId = this._createCmdObject(success, failed, scope);
							external.ProcessCommand(cmdId, command, params);
						};
						if ("InvokeCommand" in external) {
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
				else if ("webkit" in window && "messageHandlers" in webkit && "JSBridge" in webkit.messageHandlers) {
					MobileCRM.Bridge.prototype.command = function (command, params, success, failed, scope) {
						var cmdId = this._createCmdObject(success, failed, scope);
						var cmdText = cmdId + ';' + command + ':' + params;
						webkit.messageHandlers.JSBridge.postMessage(cmdText);
					};
					MobileCRM.bridge = new MobileCRM.Bridge('iOS');
				}
				else if (navigator.userAgent.toLowerCase().match(/(iphone|ipod|ipad|applewebkit)/)) {
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
					};
	
				}
	
				//if (MobileCRM.bridge == null)
				//    throw new Error("MobileCRM bridge does not support this platform.");
			}
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
