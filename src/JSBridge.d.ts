// JSBridge.js TypeScript definition file
// (c) 2023 Resco

/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/prefer-namespace-keyword */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-explicit-any */

declare namespace MobileCRM {
	class Size {
		width: string;
		height: string;
	}
	class Location {
		latitude: string;
		longitude: string;
		timestamp: Date;
	}

	class Bridge {
		version: string;
		platform: string;

		command(command: string, params: any, success?: (data: any) => void, failed?: (error: string) => void, scope?: any);
		invokeCommandPromise(command: string, params: any): Promise<any>;
		getWindowSize(callback: (size: Size) => void, erroCallback?: (error: string) => void, scope?: any);
		invokeMethodAsync(
			objectName: string,
			method: string,
			params: any,
			callback?: (retVal: any) => void,
			errorCallback?: (error: string) => void,
			scope?: any
		);
		invokeMethodPromise(objectName: string, method: string, params: any): Promise<any>;
		invokeStaticMethodAsync(
			assembly: string,
			typeName: string,
			method: string,
			paramsList: any[],
			callback?: (retVal: any) => void,
			errorCallback?: (error: string) => void,
			scope?: any
		);
		invokeStaticMethodPromise(assembly: string, typeName: string, method: string, paramsList: any[]): Promise<any>;
		raiseGlobalEvent(eventName: string, args: any);
		onGlobalEvent(eventName: string, handler: (args: any) => void, bind: boolean, scope?: any);
		enableZoom(enable: boolean);
		enableDebug(callback?: () => void, errorCallback?: (err: string) => void, scope?: any);
		log(text: string);
		alert(msg: string);
		closeForm();
	}
	var bridge: MobileCRM.Bridge;

	class Configuration {
		applicationEdition: string;
		applicationPath: string;
		applicationVersion: string;
		customizationDirectory: string;
		externalConfiguration: string;
		isBackgroundSync: boolean;
		isOnline: boolean;
		legacyVersion: string;
		settings: MobileCRM.Settings;
		storageDirectory: string;
		licenseAlert: string;

		public static requestObject(callback: (config: Configuration) => void, erroCallback?: (error: string) => void, scope?: any);
	}

	class GlobalConstants {
		/**Gets the JSON object representing the GlobalConstants variables. */
		public static getAllAsync(): Promise<Object>;
		/**
		 *Gets the constant associated with specified key in the GlobalConstants variables.
		 * @param key The key of the constant to get.
		 */
		public static getAsync(key: String): Promise<Object>;
	}

	class Settings {
		/**Gets the absolute URL (including the CrmOrganization).*/
		absoluteUrl: string;
		/**Gets or sets the currently selected Application ID.*/
		activeAppID: string;
		/**Gets or sets the last active entity in the ActivityList.*/
		activityListInitialEntity: number;
		/**Gets or sets the application lock state (0=None, 1=Soft, 2=Permanent).*/
		applicationLock: number;
		/**Gets or sets the last active view mode in Calendar view.*/
		appointmentViewMode: number;
		/**Gets or sets the CRM server authentication method (0=ActiveDirectory, 1=CRM Online, 2=Internet facing., 3=CRM Online EMEA, 4=CRM Online APAC).*/
		authenticationType: number;
		/**Gets or sets when the application starts to sync on the background (0=Never, 1=OnStart, 2=OnChange, 3=OnStartAndChange).*/
		autoSync: number;
		/**Gets the number of seconds to wait before syncing after data change. Negative to disable.*/
		autoSyncAfterChange: number;
		/**Gets the number of seconds to wait before syncing after data change in online mode. 0 or negative to disable, default is 1.*/
		autoSyncAfterStart: number;
		/**Gets or sets the automatic sync delay in seconds.*/
		autoSyncDelay: number;
		/** Indicates whether the password can be used. All DB operations are forbidden until this flag is set.*/
		canUsePassword: boolean;
		/**Gets or sets whether entities can be disabled on the client.*/
		clientCustomize: boolean;
		/**Gets or sets whether to create the call entity after a call has been made from MobileCRM.*/
		createCallEntity: boolean;
		/**Gets or sets the discovered CRM service authentication server url.*/
		crm2011AuthUrl: string;
		/**Gets or sets the discovered CRM service authentication type.*/
		crm2011AuthType: string;
		/**Gets or sets the token (cookie) issued by LiveId services identifying this device.*/
		crmOnlineDeviceToken: Date;
		/**Gets or sets when the "CrmOnlineDeviceToken" expires (in UTC).*/
		crmOnlineDeviceTokenExpires: Date;
		/**Gets or sets the CRM organization (Absolute path in org url).*/
		crmOrganization: string;
		/**Gets or sets the discovered CRM service version (4 or 5).*/
		crmWebServiceVersion: number;
		/**Gets or sets the the discovered CRM service minor version (13 - for CRM 2011 Rollup 13 and up).*/
		crmWebServiceMinorVersion: number;
		/**Gets or sets the organization Pricing Decimal Precision configuration option (0..4).*/
		currencyDecimalPrecision: number;
		/**Gets or sets the currency field display option 0- Symbol ($), 1 - Code (USD).*/
		currencyDisplayOption: string;
		/**Gets or sets the customization directory.*/
		customizationDirectory: string;
		/**Gets or sets the database local language (for case-insensitive and language dependent compare). E.g. "en-US".*/
		databaseLocale: string;
		/**Gets the database schema hash.*/
		databaseSchemaHash: string;
		/**(Android only) Gets or sets the application Density (120=Low, 160=Medium, 240=High, 320=ExtraHigh, 480=ExtraExtraHigh).*/
		density: number;
		/**Gets or sets the device friendly name (Steve's iPhone).*/
		deviceFriendlyName: string;
		/**Gets or sets the hardware unique id.*/
		deviceIdentifier: string;
		/**Gets or sets the device system an hw information (OS, etc.)*/
		deviceInfo: string;
		/**Gets or sets the device name (Base64 encoded "InternalDeviceId").*/
		deviceName: string;
		/**Gets the names of the disabled entities. Use for limited runtime customization.*/
		disabledEntities: boolean;
		/**Gets or sets the user domain.*/
		domain: string;
		/**Gets or sets the email signature.*/
		emailSignature: string;
		/**(Android, WIndows Mobile)Enables the Call Import form (appears on the Home form)*/
		enableCallImport: boolean;
		/**Enables the Dashboard form (appears on the Home form).*/
		enableDashboard: boolean;
		enableListButtons: boolean;
		/**Enables the Map form (appears on the Home form).*/
		forcedFullSyncDate: Date;
		/**Prevents remembered password to be used for next login.*/
		forgetPassword: boolean;
		/**Gets or sets the option for generating the entity full name (contact, lead)
		e.g. how to combine the first, middle and last name (0="L,F", 1="F L", 2="L,F m", 3="F m L", 4="L,F M", 5="F M L", 6="L F", 7="LF").*/
		fullNameConventionCode: number;
		/**Gets whether there were any synchronization errors encountered.*/
		hasSyncErrors: boolean;
		/**Gets whether reminders should be scheduled for tasks.*/
		hasTaskReminder: boolean;
		/**Gets or sets the URL of the authentication server (ADFS) in case of multi domain deployment.*/
		homeRealm: string;
		/**Gets or sets whether to ignore HTTPS certificate errors. (Should be used for evaluation and DEBUG only!)*/
		ignoreCertificateErrors: boolean;
		/**Gets or sets the invalid login count.*/
		invalidLoginCount: number;
		/**Gets or sets the device id (GUID).*/
		internalDeviceId: string;
		/**(WP7 only)Gets or sets the UI theme (Dark or Light).*/
		isDarkTheme: boolean;
		/**Gets or sets whether the current database contains demo data and should not be synced.*/
		isDemoDatabase: boolean;
		/**Gets or sets whether the current user is demo user. */
		isDemoUser: boolean;
		/**Gets whether the login is for a CRM Online instance.*/
		isCrmOnline: boolean;
		/**Gets whether the login information is valid and complete.
		Indicates whether the user name and password are non-empty.
		Whether they are correct is up to the we service. Also checks whether the web service url is non-empty.*/
		isValid: boolean;
		/**Gets or sets the UI text language.*/
		language: string;
		/**Gets or sets the time of the last processed call history entry.(Android, WM)*/
		lastProcessedCallTime: Date;
		/**Gets or sets the time of the last server contact (either sync or security policy).*/
		lastServerContact: Date;
		/**Gets or sets the last synchronization end date.*/
		lastSyncDate: Date;
		/**Gets or sets the last user interaction time.*/
		lastUserInteraction: Date;
		/**Gets or sets the synchronization service password.*/
		legacyPassword: string;
		/**Gets or sets the reason of the application lock.*/
		lockReason: string;
		/**Gets or sets the time in seconds after which the password expires and application login is required.*/
		loginTimeout: number;
		/**Gets or sets the maximum attachment size to sync (in KB).*/
		maxAttachmentSize: number;
		/**Gets or sets the maximum number of records (per entity) to download.*/
		maxSyncCount: number;
		/**Gets or sets whether to use multi-threaded synchronization. Default true.*/
		multiThreadSync: boolean;
		/**Gets or sets when and how the application is switched to online mode (0=Always, 1=WifiOnly, 2=Manual, 3=Never).*/
		onlineMode: number;
		/**Gets or sets the organization name. Obsolete, only for compatibility.*/
		organization: string;
		/**	Gets or sets the current user's organization GUID (given by the server).*/
		organizationId: string;
		/**Gets or sets the synchronization service password.*/
		password: string;
		/**Gets or sets the password hash.*/
		passwordHash: string;
		/**Gets or sets the URL scheme of application used for making calls.*/
		phoneApplication: string;
		/**Gets or sets the push id used for push notification send to this device.(Android, iOS)*/
		pushId: string;
		/**Gets the list of read-only settings.*/
		readonlySettings: Array<string>;
		/**Gets or sets whether the user must login at sync start.*/
		requireSyncLogin: boolean;
		/**Gets or sets whether to store the encrypted password in the config file.*/
		savePassword: boolean;
		/**Gets or sets whether to store signature attachments as SVG (vector) or PNG (image).*/
		saveSignatureAsImage: boolean;
		/**Gets or sets the hash code of the last downloaded security policy (zero for no policy).*/
		secRulesHash: number;
		/**Gets the CRM server host name.*/
		serverHostName: string;
		/**Gets or sets the version of the settings file as send with the customization.*/
		serverSettingsVersion: string;
		/**Gets or sets the server version, either 4 for CRM 4.0 or 5 for CRM 2011.*/
		serverVersion: number;
		/**Gets or sets the number of incremental synchronizations performed so far.*/
		syncCount: number;
		/**Gets or sets the sync filter file hash code.*/
		syncFilterHash: string;
		/**Gets or sets the current user GUID (given by the server).*/
		systemUserId: string;
		/**Gets or sets the last active entity in the Tourplan (Calendar).*/
		tourplanInitialEntity: string;
		/**Gets or sets whether to update entity objectypecodes on first sync.*/
		updateObjectTypeCodes: boolean;
		/**Gets or sets whether to create a CRM email entity or use the platform email service.*/
		useCrmEmail: boolean;
		/**Gets or sets whether to store attachment blobs in database or in files. If you change this setting you must perform a full sync!*/
		useDatabaseBlobStore: boolean;
		/**Gets or sets whether the database is encrypted. Only used when the database is created (full sync). Default true.*/
		useDatabaseEncryption: boolean;
		/**Gets or sets the user's default currency GUID. If not set use the organization default.*/
		userDefaultCurrencyId: string;
		/**Gets or sets the full user name (domain slash name).*/
		userLogin: string;
		/**Gets or sets the user name.*/
		userName: string;
		/**Gets or sets whether to use RowVersion or ModifiedOn based sync. Default is true.*/
		useRowVersionChangeTracking: boolean;
		/**Gets or sets the web service URL used for synchronization.*/
		url: string;
		/**Gets or sets whether to verify server SSL certificate. Since 6.3, default false (don't verify SSL).*/
		verifyServerCertificate: boolean;
	}

	class Localization {
		public static stringTable: { [key: string]: string };
		public static initialized: boolean;

		static initialize(callback: (localization: Localization) => void, errorCallback?: (error: string) => void, scope?: any);
		static initializeEx(
			regularExpression: string,
			callback?: (localization: Localization) => void,
			errorCallback?: (error: string) => void,
			scope?: any
		);
		static initializeAsync(regularExpression: string): Promise<Localization>;
		static getLoadedLangId(callback: (langId: string) => void, errorCallback?: (error: string) => void, scope?: any);
		static getTextOrDefault: (id: string, defaultString: string) => string;
		static getComponentLabel: (entityName: string, componentType: string, viewName: string) => string;
		static get: (id: string) => string;
		static getPlural: (id: string) => string;
		static makeId: (section: string, id: string) => string;
	}

	class CultureInfo {
		/** Gets the culture name in the format languageCode/region (e.g. 'en-US'). languageCode is a lowercase two-letter code derived from ISO 639-1. regioncode is derived from ISO 3166 and usually consists of two uppercase letters.*/
		name: string;
		/** Gets the full localized culture name.*/
		displayName: string;
		/** Gets the culture name, consisting of the language, the country/region, and the optional script, that the culture is set to display.*/
		nativeName: string;
		/** Gets the ISO 639-1 two-letter code for the language of the current CultureInfo.*/
		ISOName: string;
		/** Gets selected localization language.*/
		localization: string;
		/** Gets a value indicating whether the current CultureInfo object represents a writing system where text flows from right to left.*/
		isRightToLeft: boolean;
		/** Gets a DateTimeFormat that defines the culturally appropriate format of displaying dates and times.*/
		dateTimeFormat: DateTimeFormat;
		/** Gets a NumberFormat that defines the culturally appropriate format of displaying numbers, currency, and percentage.*/
		numberFormat: NumberFormat;

		static initialize(callback: (cultureInfo: CultureInfo) => void, errorCallback?: (error: string) => void, scope?: any);
		static initializeAsync(): Promise<CultureInfo>;
		static load(culture: string, callback: (cultureInfo: CultureInfo) => void, errorCallback?: (error: string) => void, scope?: any);
		static loadAsync(culture: string): Promise<CultureInfo>;
		static shortDateString(date: Date): string;
		static longDateString(date: Date): string;
		static shortTimeString(date: Date): string;
		static longTimeString(date: Date): string;
		static fullDateTimeString(date: Date): string;
		static monthDayString(date: Date): string;
		static yearMonthString(date: Date): string;
		static formatDate(date: Date, format: string): string;
	}

	interface DateTimeFormat {
		abbreviatedDayNames: string[];
		abbreviatedMonthGenitiveNames: string[];
		abbreviatedMonthNames: string[];
		aMDesignator: string;
		calendarWeekRule: number;
		dayNames: string[];
		firstDayOfWeek: number;
		fullDateTimePattern: string;
		longDatePattern: string;
		longTimePattern: string;
		monthDayPattern: string;
		monthGenitiveNames: string[];
		monthNames: string[];
		pMDesignator: string;
		shortDatePattern: string;
		shortestDayNames: string[];
		shortTimePattern: string;
		sortableDateTimePattern: string;
		universalSortableDateTimePattern: string;
		yearMonthPattern: string;
	}

	interface NumberFormat {
		currencyDecimalDigits: number;
		currencyDecimalSeparator: string;
		currencyGroupSeparator: string;
		currencyGroupSizes: number[];
		currencyNegativePattern: number;
		currencyPositivePattern: number;
		currencySymbol: string;
		naNSymbol: string;
		negativeInfinitySymbol: string;
		negativeSign: string;
		numberDecimalDigits: number;
		numberDecimalSeparator: string;
		numberGroupSeparator: string;
		numberGroupSizes: number[];
		numberNegativePattern: number;
		percentDecimalDigits: number;
		percentDecimalSeparator: string;
		percentGroupSeparator: string;
		percentGroupSizes: number[];
		percentNegativePattern: number;
		percentPositivePattern: number;
		percentSymbol: string;
		perMilleSymbol: string;
		positiveInfinitySymbol: string;
		positiveSign: string;
	}

	class Reference {
		/**
		 * Constructs a Reference object.
		 * @param entityName The logical name of the entity, e.g. "account".
		 * @param id GUID of the existing entity or null for new one.
		 * @param primaryName The human readable name of the entity, e.g "Alexandro".
		 */
		constructor(entityName: string, id?: string, primaryName?: string);
		/** The logical name of the entity, e.g. "account".*/
		entityName: string;
		/** GUID of the existing entity or null for new one.*/
		id: string;
		/** Indicates whether the entity is newly created.*/
		isNew: boolean;
		/** The human readable name of the entity, e.g "Alexandro".*/
		primaryName: string;

		/**
		 * Asynchronously loads the CRM reference.
		 * @param entityName An entity name
		 * @param id ID of record to load
		 * @param success A callback function for successful asynchronous result
		 * @param failed A callback function for command failure
		 * @param scope Optional scope for calling the callbacks
		 */
		static loadById(entityName: string, id: string, success: (reference: Reference) => void, failed?: (err: string) => void, scope?: any);
		/**
		 * Asynchronously loads the CRM reference.
		 * @param entityName An entity name
		 * @param id ID of record to load
		 * @returns Reference object representing entity record
		 */
		static loadAsync(entityName: string, id: string): Promise<Reference>;
	}

	/**
	 * Person or group associated with an activity.
	 * An activity can have multiple activity parties.
	 */
	class ActivityParty extends Reference {
		/** Gets or sets whether the party is direct (email) or a pointer to an CRM record.*/
		isDirectParty: boolean;
		/** The actual email address used.*/
		addressUsed: string;
	}

	class Relationship {
		constructor(sourceProperty: string, target?: Reference, intersectEntity?: string, intersectProperty?: string);

		sourceProperty: string;
		target: Reference;
		intersectEntity: string;
		intersectProperty: string;
	}

	/**
	 *  Class for managing many to many relations.
	 */
	class ManyToManyReference {
		/**
		 * [Obsolete]Adds or removes an N-N relationship record between the two passed entities.
		 * @param entityName The relationship entity name.
		 * @param ref1 First entity instance.
		 * @param ref2 Second entity instance.
		 * @param create Whether to create or delete the relationship record.
		 * @param success A callback function for successful asynchronous result.
		 * @param failed A callback function for command failure. The <b>error</b> argument will carry the error message.
		 * @param scope A scope for calling the callbacks; set &quot;null&quot; to call the callbacks in global scope.
		 */
		private static addRecord(
			entityName: string,
			ref1: Reference,
			ref2: Reference,
			create: boolean,
			success?: () => void,
			failed?: (string) => void,
			scope?: any
		);
		/**
		 * Creates a new N-N relationship between the two passed entities.
		 * @param entityName The relationship entity name.
		 * @param ref1 First entity instance.
		 * @param ref2 Second entity instance.
		 * @param success A callback function for successful asynchronous result.
		 * @param failed A callback function for command failure. The <b>error</b> argument will carry the error message.
		 * @param scope A scope for calling the callbacks; set &quot;null&quot; to call the callbacks in global scope.
		 */
		static create(entityName: string, ref1: Reference, ref2: Reference, success?: () => void, failed?: (string) => void, scope?: any);
		/**
		 * Removes an existing N-N relationship between the two passed entities.
		 * @param entityName The relationship entity name.
		 * @param ref1 First entity instance.
		 * @param ref2 Second entity instance.
		 * @param success A callback function for successful asynchronous result.
		 * @param failed A callback function for command failure. The <b>error</b> argument will carry the error message.
		 * @param scope A scope for calling the callbacks; set &quot;null&quot; to call the callbacks in global scope.
		 */
		static remove(entityName: string, ref1: Reference, ref2: Reference, success?: () => void, failed?: (string) => void, scope?: any);
	}

	class DynamicEntity extends Reference {
		/** An object with entity properties, e.g. {firstname:"Alexandro", lastname:"Puccini"}.*/
		properties: any;
		/** Indicates whether the entity was created by online request or from local data.*/
		isOnline: boolean;
		/** Indicates whether to force save the provided properties even if not modified. Default behavior is to save only properties that were modified.*/
		forceDirty: boolean;

		constructor(entityName: string, id?: string, primaryName?: string, properties?: object, isOnline?: boolean);

		save(callback: (error: string) => void);
		saveAsync(forceMode?: boolean): Promise<DynamicEntity>;
		update(callback: (error: string) => void);
		static createNew: (entityName: string, id?: string, primaryName?: string, properties?: any) => MobileCRM.DynamicEntity;
		static deleteById(entityName: string, id: string, sucess?: () => void, failed?: (error: string) => void, scope?: any);
		static deleteAsync(entityName: string, id: string): Promise<void>;
		static loadById(
			entityName: string,
			id: string,
			sucess: (DynamicEntity: MobileCRM.DynamicEntity) => void,
			failed?: (error: string) => void,
			scope?: any
		);
		static loadAsync(entityName: string, id: string): Promise<MobileCRM.DynamicEntity>;
		static saveDocumentBody(
			entityId: string,
			entityName: string,
			relationship: MobileCRM.Relationship,
			filePath: string,
			mimeType: string,
			sucess?: (result: MobileCRM.Reference) => void,
			failed?: (error: string) => void,
			scope?: any
		);
		static saveDocumentBodyAsync(
			entityId: string,
			entityName: string,
			relationship: MobileCRM.Relationship,
			filePath: string,
			mimeType: string
		): Promise<MobileCRM.Reference>;
		static loadDocumentBody(entityName: string, id: string, sucess: (base64: string) => void, failed?: (error: string) => void, scope?: any);
		static loadDocumentBodyAsync(entityName: string, id: string): Promise<string>;
		static unzipDocumentBody(entityName: string, id: string, targetDir: string, sucess?: () => void, failed?: (error: string) => void, scope?: any);
		static downloadAttachment(entityName: string, id: string, sucess: (base64: string) => void, failed?: (error: string) => void, scope?: any);
		static downloadAttachmentAsync(entityName: string, id: string): Promise<string>;
		/**
		 * Saves an entities instances to storage.Where the entity is stored is determined by how it was loaded: online / offline.
		 * @param updatedEntities Array of MobileCRM.DynamicEntity what will be updated.
		 * @param online Whether to load and save online or offline. Null for default mode by current configuration.
		 * @param sucessCallback A callback function for successful asynchronous result
		 * @param failureCallback A callback function for command failure. The argument will carry the error message.
		 * @param scope A scope for calling the callbacks
		 */
		static saveMultiple(
			updatedEntities: Array<MobileCRM.DynamicEntity>,
			online?: boolean,
			sucessCallback?: () => void,
			failureCallback?: (error: string) => void,
			scope?: any
		);
		/**
		 * Delete an entities instances to storage.Where the entity is stored is determined by how it was loaded: online / offline.
		 * @param deletedEntities Array of MobileCRM.DynamicEntity or MobileCRM.Reference what will be deleted.
		 * @param online Whether to load and save online or offline. Null for default mode by current configuration.
		 * @param sucessCallback A callback function for successful asynchronous result
		 * @param failureCallback A callback function for command failure. The argument will carry the error message.
		 * @param scope A scope for calling the callbacks
		 */
		static deleteMultiple(
			deletedEntities: Array<MobileCRM.Reference>,
			online?: boolean,
			sucessCallback?: () => void,
			failureCallback?: (error: string) => void,
			scope?: any
		);
	}

	class Metadata {
		getEntity(name: string): MobileCRM.MetaEntity;
		/**
		 * Gets the MetaEntity object describing the entity attributes
		 * @requires required to request the Metadata object prior to using this object. See @see MobileCRM.Metadata.requestObject .
		 * @param name logical name of entity.
		 */
		static getEntity(name: string): MobileCRM.MetaEntity;
		static requestObject(sucess: (metadata: Metadata) => void, failed?: (err: string) => void, scope?: any);
		static getActivities(): Array<string>;
		static getEntityParent(childEntityName: string): string;
		static entityHasChildren(entityName: string): boolean;
		static getOptionSetValues(
			entityName: string,
			optionSetName: string,
			sucess: (optioneSets: any) => void,
			failed?: (error: string) => void,
			scope?: any
		);
		static getStringListOptions(entityName: string, propertyName: string): Array<string>;
	}

	/**
	 * Represents an entity metadata.
	 */
	class MetaEntity {
		attributes: EntityAttributes;

		canRead(): boolean;
		canWrite(): boolean;
		canCreate(): boolean;
		canAppendTo(): boolean;
		canDelete(): boolean;

		isEnabled: boolean;
		isExternal: boolean;
		name: string;
		objectTypeCode: number;
		primaryFieldName: string;
		primaryKeyName: string;
		relationshipName: string;
		statusFieldName: string;
		uploadOnly: boolean;

		properties: MetaProperty[];

		getDepth(permission: string): number;
		getProperty(name: string): MetaProperty;
		/**
		 * Gets the MetaEntity by its name.
		 * If you only need to know the attributes of a single entity, use this method to prevent requesting all Metadata information.
		 * @param name A logical name of requested entity.
		 * @param sucess The callback function that is called asynchronously.
		 * @param failed The errorCallback which is called in case of error.
		 * @param scope The scope for callbacks.
		 */
		public static loadByName(name: string, sucess: (MetaEntity: MetaEntity) => void, failed?: (error: string) => void, scope?: any);
	}

	class MetaProperty {
		name: string;
		required: number;
		type: number;
		format: number;
		isVirtual: boolean;
		isReference: boolean;
		isNullable: boolean;
		isPicklist: boolean;
		isStringList: boolean;
		isStringListWithInput: boolean;
		isSingleValueStringList: boolean;
		isMultiValueStringList: boolean;
		defaultValue: any;
		targets: Array<string>;
		minimum: number;
		maximum: number;
		options: Array<any>;
		precision: number;
		permission: number;
		activityPartyType: number;
		isMultiParty: boolean;
		isSingularParty: boolean;
	}

	enum EntityAttributes {
		/** No additional attributes. */
		None = 0,
		/** Entity is an activity. */
		IsActivity = 0x0001,
		/** Entity is a child. */
		IsChild = 0x0002,
		/** Custom entity. */
		IsCustom = 0x0004,
		/** Intersection entity (Many to Many). */
		IsIntersect = 0x0008,
		/** Entity is an regular activity. */
		IsRegularActivity = 0x0010,
		/** Entity is only available in online mode. */
		IsOnlineOnly = 0x0020,
		/** Disable read permission. */
		NoRead = 0x0040,
		/** Disable write permission. */
		NoWrite = 0x0080,
		/** Disable create permission. */
		NoCreate = 0x0100,
		/** Disable delete permission. */
		NoDelete = 0x0200,
		/** Disable append permission. */
		NoAppend = 0x0400,
		/** Disable appendTo permission. */
		NoAppendTo = 0x0800,
		/** Disable assign permission. */
		NoAssign = 0x1000,
		/** Disable share permission. */
		NoShare = 0x2000,
		/** Resolves conflict by letting the device win. */
		ConflictDeviceWins = 0x4000,
		/** Resolves conflict by taking no action. User must decide; only changed entity properties are uploaded to the server. */
		ConflictUserAction = 0x8000,
		/** Resolves conflict by letting the device win; all entity properties are uploaded to the server. */
		ConflictDeviceWinsFullUpload = 0x10000,
		/** Entity is a virtual entity, a custom entity that has fields containing data from an external data source. */
		IsVirtual = 0x20000,
		/** The database table has labels for lookup fields. */
		HasLookupLabels = 0x100000,
		/** Incremental sync uses linked entities. */
		SyncLinked = 0x200000,
		/** Incremental sync does not use linked entities. */
		NoSyncLinked = 0x400000,
		/** Always force full sync for this entity (Upload. */
		FullSync = 0x800000,
		/** Audit database operations. */
		DatabaseAudit = 0x1000000,
		/** Incremental sync filter uses normal sync filter. */
		IncrementalSyncFilter = 0x2000000,
		/** Salesforce only - Sync will perform additional scanning to ensure all linked ContentDocuments visible to users are download for offline usage. */
		DownloadAllLinkedSalesforceFiles = 0x4000000,
		/** Dynamics only - Server Entity does not have VersionNumber (RowVersion) field. This flag is set if AppSettings.CustomizationLevel>0. */
		NoVersionNumber = 0x8000000,
		/** Salesforce only - Feed items for this entity should be synced */
		SyncSalesforceEntityFeed = 0x10000000,
		/** Sync uploader does not leave status update for 2nd pass, but uploads it with the data. */
		UploadStatusWithData = 0x20000000,
		/** Salesforce only - Shared records for this entity should be synced */
		SyncSharedSalesforce = 0x40000000,
	}

	class _DeviceInfo {
		name: string;
		oSVersion: string;
		model: string;
		buildInfo: string;
	}

	class Platform {
		capabilities: number;
		deviceIdentifier: string;
		screenWidth: number;
		screenHeight: number;
		screenDensity: number;
		isMultiPanel: boolean;
		customImagePath: string;

		public static openUrl(url: string);
		public static getUrl(success: (url: string) => void, failed?: (error: string) => void, scope?: any);
		public static getDeviceInfo(success: (deviceInfo: _DeviceInfo) => void, failed?: (error: string) => void, scope?: any);
		public static navigateTo(latitude: string, longitude: string, failed?: (error: string) => void, scope?: any);
		/**
		 * Prevents application to close when HW back button is pressed and installs handler which is called instead.
		 * Pass &quot;null&quot; handler to allow the HW back button.
		 * Works only under OS having HW back button (Android, Windows 10).
		 * @param handler Handler function which will be called each time when user presses the Android HW back button.
		 * @param scope Handler scope
		 */
		public static preventBackButton(handler: () => void, scope?: any);
		public static scanBarCode(success: (barCode: string) => void, failed?: (error: string) => void, scope?: any);
		/**
		 * Gets current geo-location from platform-specific location service.
		 * If the current platform does not support the location service, the <b>failed</b> handler is called with error "Unsupported".
		 * @param success A callback function for successful asynchronous result. The <b>result</b> will carry an object with Location object.
		 * @param failed A callback function for command failure. The <b>error</b> argument will carry the error message.
		 * @param scope A scope for calling the callbacks; set &quot;null&quot; to call the callbacks in global scope.
		 * @param age Max age in seconds to accept GPS.
		 * @param precision Desired accuracy in meters.
		 * @param timeout Timeout in milliseconds (since v10.1).
		 */
		public static getLocation(
			success: (obj: Location) => void,
			failed?: (error: string) => void,
			scope?: any,
			age?: number,
			precision?: number,
			timeout?: number
		);
		/**
		 * Gets current geo-location from platform-specific location service.
		 * If the current platform does not support the location service, the <b>failed</b> handler is called with error "Unsupported".
		 * @param age Max age in seconds to accept GPS.
		 * @param precision Desired accuracy in meters.
		 * @param timeout Timeout in milliseconds (since v10.1).
		 * @returns Promise resolved with Location object.
		 */
		public static getLocationAsync(age?: number, precision?: number, timeout?: number): Promise<Location>;
		public static requestObject(callback: (platform: Platform) => void, errorCallback: () => void, scope?: any);
		/**
		 * @since 8.1
		 * Opens the platform-specific call application with specified phone number.
		 * @param phoneNumber Phone number.
		 * @param failed A callback function for command failure. The <b>error</b> argument will carry the error message.
		 * @param scope A scope for calling the callbacks; set &quot;null&quot; to call the callbacks in global scope.
		 */
		public static makeCall(phoneNumber: string, failed?: (error: string) => void, scope?: any);
		/**
		 * @since 11.2.3
		 * Opens the platform-specific sms application with specified phone number and pre-fill text.
		 * @param phoneNumber Phone number.
		 * @param text SMS text.
		 * @param failed A callback function for command failure. The <b>error</b> argument will carry the error message.
		 * @param scope A scope for calling the callbacks; set &quot;null&quot; to call the callbacks in global scope.
		 */
		public static sendSMS(phoneNumber: string, text: string, failed?: (error: string) => void, scope?: any);
		/**
		 * @since 8.1
		 * Opens the platform-specific e-mail message form with pre-filled data.
		 * @param address Recipients email address.
		 * @param subject An e-mail subject.
		 * @param body A string with email body.
		 * @param errorCallback The errorCallback which is called asynchronously in case of error.
		 * @param scope The scope for errorCallback.
		 */
		public static email(address: string, subject: string, body: string, errorCallback?: () => void, scope?: any);
		/**
		 * @since 15.0
		 * Opens the platform-specific e-mail message form with pre-filled data.
		 * @param address Recipients email address.
		 * @param subject An e-mail subject.
		 * @param body A string with email body.
		 * @param mimeType Body content MIME type.
		 * @param errorCallback The errorCallback which is called asynchronously in case of error.
		 * @param scope The scope for errorCallback.
		 */
		public static sendEmail(address: string, subject: string, body: string, mimeType: string, errorCallback?: () => void, scope?: any);
		/**
		 * @since 9.1
		 * Sends a list of files (full paths or IReferences to blobs) as email attachments.
		 * This method either open the CRM Email form or the native mail client (depending on application settings).
		 * @param address Recipients email address.
		 * @param subject An e-mail subject.
		 * @param body A string with email body.
		 * @param attachment Array of files to send. Element must be a full path or a IReference to a note, etc.
		 * @param entity The related entity reference.
		 * @param relationship The relationship to the created email entity. (optional).
		 * @param errorCallback The errorCallback which is called asynchronously in case of error.
		 * @param scope The scope for errorCallback.
		 */
		public static emailWithAttachments(
			address: string,
			subject: string,
			body: string,
			attachment: Array<any>,
			entity: MobileCRM.Reference,
			relationship: MobileCRM.Relationship,
			errorCallback: (err: any) => void,
			scope?: any
		);
		/**
		 * Gets network information.
		 * @since 11.2
		 * @param callback A callback function for successful asynchronous result.
		 * @param errorCallback The errorCallback which is called asynchronously in case of error.
		 * @param scope The scope for errorCallback.
		 */
		public static getNetworkInfo(callback: (info: INetworkInfo) => void, errorCallback: () => void, scope?: any);
	}

	interface INetworkInfo {
		connected: boolean;
		fastConnection?: boolean;
	}

	interface ITimeChange {
		/** Gets the time when time change occured. */
		lastChange: Date;
		/** Gets the delta time in seconds. */
		delta: number;
	}

	class Application {
		static synchronize(backgroundOnly: boolean, ifNotSyncedBefore: Date);
		static synchronizeOnForeground(forceLogin: boolean);
		static getAppColor(colName: string, success: (url: string) => void, failed?: (err: string) => void, scope?: any);
		static getAppImage(imageName: string, colorize: string, success: (url: string) => void, failed?: (err: string) => void, scope?: any);
		/** Display application login form. */
		static showAppLogin();
		/**
		 * Sets the application colors.
		 * @since 11.2.2
		 * @param colors Properties of the object define the colors to set. The values must be a number or string in the #AARRGGBB or #RRGGBB format.
		 * @param success A callback function for successful asynchronous result.
		 * @param failed The error callback which is called asynchronously in case of error.
		 * @param scope  The scope for callbacks.
		 */
		static setAppColors(colors: { [colorName: string]: number | string }, success?: () => void, failed?: (err: string) => void, scope?: any);
		/**
		 * Gets the last detected time change.
		 * @since 13.3.1
		 * @param success A callback function which is called in case of success.
		 * @param failed The error callback which is called asynchronously in case of error.
		 * @param scope Optional scope for callbacks.
		 */
		static getLastSignificantTimeChange(success: (timeChange: ITimeChange) => void, failed?: (err: string) => void, scope?: any);
		static fileExists(path: string, success: (exist: boolean) => void, failed?: (err: string) => void, scope?: any);
		static fileExistsAsync(path: string): Promise<boolean>;
		static directoryExists(path: string, success: (exist: boolean) => void, failed?: (err: string) => void, scope?: any);
		static directoryExistsAsync(path: string): Promise<boolean>;
		static createDirectory(path: string, success?: () => void, failed?: (err: string) => void, scope?: any);
		static createDirectoryAsync(path: string): Promise<void>;
		static deleteDirectory(path: string, success?: () => void, failed?: (err: string) => void, scope?: any);
		static deleteDirectoryAsync(path: string): Promise<void>;
		static getDirectories(path: string, success: (directoriesList: Array<string>) => void, failed?: (err: string) => void, scope?: any);
		static getDirectoriesAsync(path: string): Promise<string[]>;
		static deleteFile(path: string, success?: () => void, failed?: (error: string) => void, scope?: any);
		static deleteFileAsync(path: string): Promise<void>;
		static getFiles(path: string, success: (filesList: Array<string>) => void, failed?: (err: string) => void, scope?: any);
		static getFilesAsync(path: string): Promise<string[]>;
		static moveFile(src: string, dst: string, success?: () => void, failed?: (err: string) => void, scope?: any);
		static moveFileAsync(src: string, dst: string): Promise<void>;
		static readFile(path: string, success: (fileContent: string) => void, failed?: (err: string) => void, scope?: any);
		/**
		 * @since 15.3
		 * Reads the file from the application local data and asynchronously gets its content.
		 * @param path Defines the relative path of the file in the application local data.
		 * @param encoding Defines the text encoding for file content (default is UTF8). Use base64 for binary files. Supported values: UTF8, UTF16 ASCII, BASE64.
		 */
		static readFileAsync(path: string, encoding?: "UTF8" | "UTF16" | "ASCII" | "base64"): Promise<string>;
		static writeFile(path: string, text: string, append: boolean, success?: () => void, failed?: (err: string) => void, scope?: any);
		/**
		 * @since 15.3
		 * Asynchronously writes data into the file from the application local data.
		 * @param path Defines the relative path of the file in the application local data.
		 * @param text Defines the file content (in corresponding text encoding) to be written.
		 * @param encoding Defines the text encoding for file content (default is UTF8). Use base64 for binary files. Supported values: UTF8, UTF16 ASCII, BASE64.
		 */
		static writeFileAsync(path: string, text: string, encoding?: "UTF8" | "UTF16" | "ASCII" | "base64"): Promise<void>;
		static readFileAsBase64(path: string, success: (base64: string) => void, failed?: (err: string) => void, scope?: any);
		static writeFileFromBase64(path: string, base64: string, success?: () => void, failed?: (err: string) => void, scope?: any);
		/**
		 * @since 9.0.2
		 * Asynchronously writes the text into the file from the application local data.
		 * @param path Defines the relative path of the file in the application local data.
		 * @param text Defines the file content to be written.
		 * @param encoding Defines the text encoding for file content (default is UTF-8). Use ASCII for ANSI text or UTF-16 for multi-byte Unicode.
		 * @param append Determines whether to overwrite or append to an existing file.
		 * @param success A callback function which is called in case of successful asynchronous result.
		 * @param errorCallback The errorCallback which is called asynchronously in case of error.
		 * @param scope The scope for callback.
		 */
		static writeFileWithEncoding(
			path: string,
			text: string,
			encoding: string,
			append: boolean,
			success: () => void,
			failed?: (err: string) => void,
			scope?: any
		);
		/**
		 * @since 12.1
		 * Asynchronously refresh access token using saved token in protected settings and send serialized token to success callback
		 * @param resource The resource
		 * @param success A callback function what is called asynchronously with serialized access token argument.
		 * @param errorCallback The errorCallback which is called asynchronously in case of error.
		 * @param scope The scope for callback.
		 */
		static getAccessToken(resource, success: (textAccessToken: string) => void, failed?: (err: string) => void, scope?: any);
		/**
		 * Checks whether the current user is member of the passed roles. Role can be either the Guid (aeb33d0f-89b4-e111-9c9a-00155d0b710a) or the role Name.
		 * @param roles Defines the roles to check.
		 * @param success A callback function for successful asynchronous result. The result will carry a number with the count of matching roles.
		 * @param failed A callback function for command failure. The error argument will carry the error message.
		 * @param scope A scope for calling the callback.
		 */
		static checkUserRoles(roles: [string], success?: (roles: number) => void, failed?: (err: string) => void, scope?: any);
	}

	class AboutInfo {
		manufacturer: string;
		productTitle: string;
		productTitleAndVersion: string;
		productSubTitle: string;
		poweredBy: string;
		icon: string;
		website: string;
		supportEmail: string;

		static requestObject(callback: (aboutinfo: AboutInfo) => void, errorCallback: (err: any) => void, scope?: any);
	}

	/**
	 * @since 13.0
	 * Encapsulate methods and properties what can be used for integration.
	 */
	class Integration {
		/**
		 * @since 13.0
		 * Asynchronously gets the token using passed OAuth settings and parameters. Configuration name is used to find already settings.
		 * @param configurationName Define the name of oauth configuration, what is key for saved setting if any.
		 * @param oauthSettings Defines the OAuth settings for authentication.
		 * @param prompt Whether to force the user to enter credentials again.
		 * @param success A callback function for successful asynchronous result. The <b>result</b> will carry a string with the access token.
		 * @param failed A callback function for command failure. The <b>error</b> argument will carry the error message.
		 * @param scope A scope for calling the callbacks; set &quot;null&quot; to call the callbacks in global scope.
		 */
		public static getOAuthAccessToken(
			configurationName: string,
			oauthSettings: MobileCRM.OAuthSettings,
			prompt: boolean,
			success: (textAccessToken: string) => void,
			failed?: (err: string) => void,
			scope?: any
		);
	}

	/**
	 * @since 13.0
	 * Represents the settings what are used to authenticate using OAuth server account
	 */
	class OAuthSettings {
		/**
		 * Create instance of OAuth settings with passed configuration name.
		 * @param configName The Configuration name.
		 */
		constructor();
		/** Gets or sets the OAuth token url. */
		public authorityEndPoint: string;
		/** Gets or sets the authorization url to get authorization code. */
		public authorizationUrl: string;
		/** Gets or sets the authentication Client Id. */
		public clientId: string;
		/** Gets or sets the Authentication Client Secret. */
		public clientSecret: string;
		/** Gets or sets the authorization redirect url for service. */
		public redirectUrl: string;
		/** Gets or sets the App ID URI of the target web API (secured resource). */
		public resourceUrl: string;
		/** Gets or sets the scope to limit an application's access to a user's account. */
		public scopes: string;
		private _configName: string;
	}

	/**
	 * Provides a functionality of mobile reporting.
	 */
	class MobileReport {
		/**
		 * @since 9.1
		 * Executes the mobile reporting request which produces the mobile report document of given format.
		 * @param fetch The fetch XML defining the entity (entities) query used as report input.
		 * @param reportXML The mobile report XML definition which can be loaded from the resco_report entity or constructed dynamically. Ignored if IsExportOnly parameter is true.
		 * @param reportFormat Report format: Pdf (default), Html, Excel, Text.
		 * @param isExportOnly If true then ReportXml is optional. The default is false.
		 * @param isOnline Indicates whether the report should be run against the online data or local database. The default is current application mode.
		 * @param outputFile The full path to the output file. If omitted a temp file is created. The output path is always passed to the success callback.
		 * @param success A callback function that is called with the file path to successfully created report.
		 * @param errorCallback The errorCallback which is called asynchronously in case of error.
		 * @param scope The scope for errorCallback.
		 */
		static runReport(
			fetch: string,
			reportXML: string,
			reportFormat: string,
			isExportOnly: boolean,
			isOnline: boolean,
			outputFile: string,
			success: (filePath: string) => void,
			failed?: (err: string) => void,
			scope?: any
		);
		/**
		 * @since 9.1
		 * Executes the mobile reporting request which produces the mobile report document of given format.
		 * @param fetch The fetch XML defining the entity (entities) query used as report input.
		 * @param reportXML The mobile report XML definition which can be loaded from the resco_report entity or constructed dynamically. Ignored if IsExportOnly parameter is true.
		 * @param reportFormat Report format: Pdf (default), Html, Excel, Text.
		 * @param isExportOnly If true then ReportXml is optional. The default is false.
		 * @param isOnline Indicates whether the report should be run against the online data or local database. The default is current application mode.
		 * @param outputFile The full path to the output file. If omitted a temp file is created. The output path is always passed to the success callback.
		 * @returns The file path to successfully created report.
		 */
		static runReportAsync(
			fetch: string,
			reportXML: string,
			reportFormat: string,
			isExportOnly: boolean,
			isOnline: boolean,
			outputFile: string
		): Promise<string>;
		/**
		 * @since 10.1
		 * Shows new MobileReport form. Source for the report can be defined either as list of MobileCRM.Reference objects or as FetchXML query.
		 * @param report Optional reference to the resco_mobilereport entity that will be pre-selected.
		 * @param source The list of entity references used as report input.
		 * @param fetchXml The fetch XML defining the entity (entities) query used as report input.
		 * @param failed A callback which is called in case of error.
		 * @param scope The scope for callbacks.
		 */
		static showForm(report: MobileCRM.Reference, source: MobileCRM.Reference[], fetchXml: string, failed?: (err: string) => void, scope?: any);
		/**
		 * @since 16.0
		 * Shows new MobileReport form. Source for the report can be defined either as list of MobileCRM.Reference objects or as FetchXML query.
		 * @param report Optional reference to the resco_mobilereport entity that will be pre-selected.
		 * @param source The list of entity references used as report input.
		 * @param fetchXml The fetch XML defining the entity (entities) query used as report input.
		 * @param paramString Run report form Configuration string in JSON format.
		 * @param failed A callback which is called in case of error.
		 * @param scope The scope for callbacks.
		 */
		static showFormWithConfiguration(
			report: MobileCRM.Reference,
			source: MobileCRM.Reference[],
			fetchXml: string,
			paramString: string,
			failed?: (err: string) => void,
			scope?: any
		);
	}
	class Questionnaire {
		static getQuestionName(name: string, repeatIndex: number): string;
		static getGroupName(name: string, repeatIndex: number): string;
		static showForm(id: string, failed?: (err: string) => void, scope?: any, relationship?: MobileCRM.Relationship);
	}
}
/**
 * @namespace Represents a FetchXml.
 */
declare module MobileCRM.FetchXml {
	/**
	 * @class Represents a FetchXml
	 * @property entity {MobileCRM.FetchXml.Entity} An entity object.
	 * @property count {number} The maximum number of records to retrieve.
	 * @property page {number} 1-based index of the data page to retrieve.
	 * @property aggregate {boolean} Indicates whether the fetch is aggregated.
	 * @property distinct {boolean} Indicates whether to return only distinct (different) values.
	 */
	class Fetch {
		/** Constructs Fetch object
		 * @param entity {MobileCRM.FetchXml.Entity} An entity object.
		 * @param count {number} The maximum number of records to retrieve.
		 * @param page {number} 1-based index of the data page to retrieve.
		 * @param distinct {boolean} Indicates whether to return only distinct (different) values.
		 * @param aggregate {boolean} Indicates whether the fetch is aggregated.
		 */
		constructor(entity?: MobileCRM.FetchXml.Entity, count?: number, page?: number, distinct?: boolean, aggregate?: boolean);

		public entity: MobileCRM.FetchXml.Entity;
		count: number;
		page: number;
		aggregate: boolean;
		distinct: boolean;

		/**
		 * Performs the asynchronous CRM Fetch command.
		 * @param fetchXmlData CRM fetch in XML representation.
		 * @param success  callback function for successful asynchronous result. The result argument will carry the objects array of type specified by resultformat XML attribute (Array, JSON, XML or DynamicEntities).
		 * @param failed A callback function for command failure. The error argument will carry the error message.
		 * @param scope A scope for calling the callbacks. Set to call the callbacks in global scope.
		 */
		public static executeFromXML(fetchXmlData: string, success: (res: any[]) => void, failed?: (error: string) => void, scope?: any);
		/**
		 * @since 10.0
		 * Deserializes XML to the Fetch object.
		 * @param xml A string defining the fetch XML request.
		 * @param success A callback function for successful asynchronous result.The result argument will carry the Fetch object.
		 * @param failed A callback function for command failure.The error argument will carry the error message.
		 * @param scope A scope for calling the callbacks.Set to call the callbacks in global scope.
		 */
		public static deserializeFromXml(xml: string, success: (result: MobileCRM.FetchXml.Fetch) => void, failed?: (err: string) => void, scope?: any);
		/**
		 * @since 10.0
		 * Deserializes XML to the Fetch object.
		 * @param xml A string defining the fetch XML request.
		 * @returns A Promise resolved with corresponding Fetch object.
		 */
		public static deserializeFromXmlAsync(xml: string): Promise<MobileCRM.FetchXml.Fetch>;
		/**
		 * @since 10.0
		 * Serializes the Fetch object to XML.
		 * @param success A callback function for successful asynchronous result. The result argument will carry the XML representation of the Fetch object.
		 * @param failed A callback function for command failure. The error argument will carry the error message.
		 * @param scope A scope for calling the callbacks. Set to call the callbacks in global scope.
		 */
		public serializeToXml(success: (res: string) => void, failed?: (err: string) => void, scope?: any);
		/**
		 * @since 10.0
		 * Serializes the Fetch object to XML.
		 * @returns A Promise resolved the XML representation of the Fetch object.
		 */
		public serializeToXmlAsync(): Promise<string>;
		/**
		 * Performs the asynchronous CRM Fetch request.
		 * @param output A string defining the output format: Array, JSON, XML or DynamicEntities
		 * @param success A callback function for successful asynchronous result. The <b>result</b> argument will carry the objects array of type specified by output argument.
		 * @param failed A callback function for command failure. The error argument will carry the error message.
		 * @param scope A scope for calling the callbacks. Set to call the callbacks in global scope.
		 */
		public execute(output: string, success: (res: any[]) => void, failed?: (err: string) => void, scope?: any);
		/**
		 * @since 8.0
		 * Performs the online CRM Fetch request regardless of the app online/offline mode.
		 * @param output A string defining the output format: Array, JSON, XML or DynamicEntities.
		 * @param success  callback function for successful asynchronous result. The result argument will carry the objects array of type specified by resultformat XML attribute (Array, JSON, XML or DynamicEntities).
		 * @param failed A callback function for command failure. The error argument will carry the error message.
		 * @param scope A scope for calling the callbacks. Set to call the callbacks in global scope.
		 */
		public executeOnline(output: string, success: (res: any[]) => void, failed?: (error: string) => void, scope?: any);
		/**
		 * @since 8.0
		 * Performs the offline CRM Fetch request regardless of the app online/offline mode.
		 * @param output A string defining the output format: Array, JSON, XML or DynamicEntities.
		 * @param success  callback function for successful asynchronous result. The result argument will carry the objects array of type specified by resultformat XML attribute (Array, JSON, XML or DynamicEntities).
		 * @param failed A callback function for command failure. The error argument will carry the error message.
		 * @param scope A scope for calling the callbacks. Set to call the callbacks in global scope.
		 */
		public executeOffline(output: string, success: (res: any[]) => void, failed?: (error: string) => void, scope?: any);
		/**
		 * Performs the asynchronous CRM Fetch request.
		 * @param output A string defining the output format: Array, JSON, XML or DynamicEntities.
		 * @param online Optional parameter determining whether the fetch should be executed online or offline. If omitted, function respects current online/offline mode of the app.
		 * @returns A Promise object which is asynchronously resolved with the objects array of type specified by <b>output</b> argument.
		 */
		public executeAsync(output: string, online?: boolean): Promise<any[]>;
	}
	/**
	 * @class Represents a FetchXml query root entity.
	 * @param name {string} An entity logical name.
	 * @property attributes {Attribute[]}  An array of <see cref="MobileCRM.FetchXml.Attribute">MobileCRM.FetchXml.Attribute</see> objects.
	 * @property order {Order[]} An array of {MobileCRM.FetchXml.Order} objects
	 * @property filter {Filter} A query filter.
	 * @property linkentities {LinkEntity[]} An array of {MobileCRM.FetchXml.LinkEntity} objects.
	 */
	class Entity {
		/**
		 * Constructs Entity object
		 * @param name An entity logical name.
		 * @param attributes An array of Attribute objects or "*" for all attributes.
		 * @param order An array of Order objects.
		 * @param filter A query filter.
		 * @param linkentities An array of LinkEntity objects.
		 */
		constructor(name: string, attributes?: Attribute[] | "*", order?: Order[], filter?: Filter, linkentities?: LinkEntity[]);

		/** An entity logical name. */
		name: string;
		/** An array of Attribute objects. */
		attributes: Attribute[];
		/** An array of Order objects. */
		order: Order[];
		/** A query filter. */
		filter: Filter;
		/** An array of LinkEntity objects. */
		linkentities: LinkEntity[];

		/**
		 * Adds an order by statement to the fetch query.
		 * @param attribute
		 * @param descending
		 * @returns MobileCRM.FetchXml.Order
		 */
		orderBy(attribute: string, descending: boolean): MobileCRM.FetchXml.Order;
		/**
		 * Adds an entity attribute to the fetch query.
		 * @param name The attribute (CRM logical field name) to order by.
		 * @param alias Optional parameter defining an attribute alias.
		 * @param aggregate Optional parameter defining an aggregation function.
		 * @returns void
		 */
		addAttribute(name: string, alias?: string, aggregate?: string): Attribute;
		/**
		 * Adds all entity attributes to the fetch query.
		 * @returns void
		 */
		addAttributes();
		/**
		 * Adds an entity link (join) to the fetch query.
		 * @param target The target entity.
		 * @param from The "from" field (if parent then target entity primary key).
		 * @param to The "to" field.
		 * @param linktype The link (join) type ("inner" or "outer").
		 * @returns MobileCRM.FetchXml.LinkEntity
		 */
		addLink(target: string, from: string, to: string, linktype: string): MobileCRM.FetchXml.LinkEntity;
		removeLink(link: MobileCRM.FetchXml.LinkEntity): void;
		/**
		 * Adds a filter for this fetch entity.
		 * @returns MobileCRM.FetchXml.Filter
		 */
		addFilter(): MobileCRM.FetchXml.Filter;
		/**
		 * @since 10.0
		 * Serializes the Fetch object to XML.
		 * @param success A callback function for successful asynchronous result. The result argument will carry the XML representation of the Fetch object.
		 * @param failed A callback function for command failure. The error argument will carry the error message.
		 * @param scope A scope for calling the callbacks. Set to call the callbacks in global scope.
		 */
		serializeToXml(success: (res: string) => void, failed?: (err: string) => void, scope?: any);
		/**
		 * @since 10.0
		 * Deserialize XML to the Fetch object.
		 * @param xml A string defining the fetch XML request.
		 * @param success A callback function for successful asynchronous result. The result argument will carry the Fetch object.
		 * @param failed A callback function for command failure. The error argument will carry the error message.
		 * @param scope A scope for calling the callbacks. Set to call the callbacks in global scope.
		 */
		deserializeFromXml(xml: string, success: (result: MobileCRM.FetchXml.Fetch) => void, failed?: (err: string) => void, scope?: any);
	}
	/**
	 * @class Represents a FetchXml query linked entity.
	 * @param name {string} An entity name
	 * @property  from {number} The "from" field (if parent then target entity primary key).
	 * @property  to {number}
	 * @property  linktype {boolean} The link (join) type ("inner" or "outer").
	 * @property  alias {string} Defines an order alias.
	 */
	class LinkEntity extends Entity {
		/** Constructs LinkEntity object.
		 * @param name An entity logical name.
		 * @param attributes An array of Attribute objects or "*" for all attributes.
		 * @param order An array of Order objects.
		 * @param filter A query filter.
		 * @param linkentities An array of LinkEntity objects.
		 * @param  from {number} The "from" field (if parent then target entity primary key).
		 * @param  to {number}
		 * @param  alias {string} Defines an order alias.
		 * @param  linktype {boolean} The link (join) type ("inner" or "outer").
		 */
		constructor(
			name: string,
			attributes?: Attribute[] | "*",
			order?: Order[],
			filter?: Filter,
			linkentities?: LinkEntity[],
			from?: string,
			to?: string,
			alias?: string,
			linktype?: string
		);

		from: string;
		to: string;
		linktype: string;
		alias: string;
	}
	/**
	 * @class Represents a FetchXml select statement (CRM field).
	 * @param name {string} lower-case entity attribute name (CRM logical field name).
	 * @property  name {string} A lower-case entity attribute name (CRM logical field name).
	 * @property  aggregate {boolean} An aggregation function.
	 * @property  grouby {number} Indicates whether to group by this attribute.
	 * @property  alias {string} Defines an order alias.
	 * @property  dategrouping {string} A date group by modifier (year, quarter, month, week, day).
	 */
	class Attribute {
		/**
		 * Constructs Attribute object.
		 * @param name A lower-case entity attribute name (CRM logical field name).
		 * @param alias Defines an order alias.
		 * @param aggregate An aggregation function.
		 * @param groupBy Indicates whether to group by this attribute.
		 * @param dateGrouping A date group by modifier (year, quarter, month, week, day).
		 */
		constructor(name: string, alias?: string, aggregate?: boolean, groupBy?: boolean, dateGrouping?: string);

		name: string;
		aggregate: string;
		groupby: boolean;
		alias: string;
		dategrouping: string;
	}
	/**
	 * @class Represents a FetchXml order statement.
	 * @property  attribure {string} An attribute name (CRM logical field name).
	 * @property  alias {string} Defines an order alias.
	 * @property  descending {boolean} true, for descending order; false, for ascending order
	 */
	class Order {
		/**
		 * Constructs Order object
		 * @param attribute An attribute name (CRM logical field name).
		 * @param descending true, for descending order; false, for ascending order
		 * @param alias Defines an order alias.
		 */
		constructor(attribute?: string, descending?: boolean, alias?: string);
		attribute: string;
		alias: string;
		descending: boolean;
	}
	/**
	 * @class Represents a FetchXml filter statement. A logical combination of {Condition} and child-filters.
	 * @property  type {string} Defines the filter operator ("or" / "and").
	 * @property  conditions {Condition[]} An array of {Condition} objects.
	 * @property  filters {Filter[]} An array of {Filter} objects representing child-filters.
	 */
	class Filter {
		/**
		 * Constructs {Filter} object.
		 * @param type Defines the filter operator ("or" / "and").
		 * @param conditions  An array of {Condition} objects.
		 * @param filters  An array of {Filter} objects representing child-filters.
		 */
		constructor(type?: string, conditions?: Condition[], filters?: Filter[]);

		type: string;
		conditions: Condition[];
		filters: Filter[];
		/**
		 * Adds a attribute condition to the filter.
		 * @param attribute The attribute name (CRM logical field name).
		 * @param op The condition operator. "eq", "ne", "lt", "le", "gt", "ge", "like"
		 * @param value The values to compare to.
		 */
		where(attribute: string, op: string, value?: any): MobileCRM.FetchXml.Condition;
		/**
		 * Adds a attribute inclusion condition to the filter.
		 * @param attribute The attribute name (CRM logical field name).
		 * @param value An array of values.
		 * @returns MobileCRM.FetchXml.Condition
		 */
		isIn(attribute: string, values: Array<any>): MobileCRM.FetchXml.Condition;
		/**
		 * Adds a attribute inclusion condition to the filter.
		 * @param attribute The attribute name (CRM logical field name).
		 * @param value An array of values.
		 * @returns MobileCRM.FetchXml.Condition
		 */
		notIn(attribute: string, values: Array<any>): MobileCRM.FetchXml.Condition;
		/**
		 * Adds a condition that the passed attribute is between the passed bounds.
		 * @param attribute The attribute name (CRM logical field name).
		 * @param low The lower bound.
		 * @param high The higher bound.
		 * @returns MobileCRM.FetchXml.Condition
		 */
		between(attribute: string, low: any, high: any): MobileCRM.FetchXml.Condition;
		/**
		 * Adds a condition that the passed column starts with the passed string.
		 * @param attribute The attribute name (CRM logical field name).
		 * @param value The value to compare to.
		 * @returns MobileCRM.FetchXml.Condition
		 */
		startsWith(attribute: string, value: string): MobileCRM.FetchXml.Condition;
		/**
		 * Adds a condition that the passed column starts with the passed string.
		 * @param attribute The attribute name (CRM logical field name).
		 * @param value The value to compare to.
		 * @returns MobileCRM.FetchXml.Condition
		 */
		contains(attribute: string, value: string): MobileCRM.FetchXml.Condition;
	}
	/**
	 * @class Represents a FetchXml attribute condition statement.
	 * @property  attribute {string} The attribute name (CRM logical field name).
	 * @property  entityname {string} The link name or alias to which this condition is relative to.
	 * @property  operator {string} The condition operator. "eq", "ne", "in", "not-in", "between", "not-between", "lt", "le", "gt", "ge", "like", "not-like", "null", "not-null", "eq-userid", "eq-userteams", "today", "yesterday", "tomorrow", "this-year", "last-week", "last-x-hours", "next-x-years", "olderthan-x-months", ...
	 * @property  uitype {string} The lookup target entity display name.
	 * @property  uiname {string} The lookup target entity logical name.
	 * @property  value {any} The value to compare to.
	 * @property  values {any[]} The list of values to compare to.
	 */
	class Condition {
		/**
		 * Constructs {Condition} object.
		 * @param attribute The attribute name (CRM logical field name).
		 * @param operator The condition operator. "eq", "ne", "in", "not-in", "between", "not-between", "lt", "le", "gt", "ge", "like", "not-like", "null", "not-null", "eq-userid", "eq-userteams", "today", "yesterday", "tomorrow", "this-year", "last-week", "last-x-hours", "next-x-years", "olderthan-x-months", ...
		 * @param value The value (or values) to compare to.
		 * @param entityName The link name or alias to which this condition is relative to.
		 * @param refTarget The lookup target entity logical name.
		 * @param refLabel The lookup target entity display name.
		 */
		constructor(attribute?: string, operator?: string, value?: any | any[], entityName?: string, refTarget?: string, refLabel?: string);

		attribute: string;
		entityname: string;
		operator: string;
		uitype: string;
		uiname: string;
		value: any;
		values: any[];
	}
}
declare module MobileCRM.Services {
	class CompanyInformation {
		name: string;
		address: string;
		public static getCompanyInfoFromVat(
			vat: string | number,
			success: (result: MobileCRM.Services.CompanyInformation) => void,
			failed?: (err: string) => void,
			scope?: any
		);
	}
	class FileInfo {
		filePath: string;
		url: string;
		mimeType: string;
		nextInfo: FileInfo;
	}
	class ZebraScanner {
		static connect: (success: (result: string) => void, failed?: (err: string) => void, scope?: any) => void;
		static onScan: (handler: (questionnaireForm: QuestionnaireForm) => void, bind: boolean, scope?: any) => void;
	}
	class DocumentService {
		/**Gets or sets the maximum captured image size. If captured image size is greater, the image is resized to specified maximum size. [640x480,1024x768,1600x1200,2048x1536,2592x1936].*/
		maxImageSize: string;
		/**Gets or sets the maximum uploaded image size. If uploaded image size is greater then image is resized to specified maximum size [640x480,1024x768,1600x1200,2048x1536,2592x1936].*/
		maxUploadImageSize: string;
		/**Gets or sets the record quality for audio/video recordings.*/
		recordQuality: number;
		/**Indicates whether the video files should be included into the image picker when selecting the photos. The default is true.*/
		allowChooseVideo: boolean;
		/**Indicates whether to allow multiple files for DocumentActions SelectPhoto and SelectFile.[Not implemented on iOS.]*/
		allowMultipleFiles: boolean;
		/**Indicates whether to allow handling of cancel event. Callback will pass the null argument in this case.*/
		allowCancelHandler: boolean;

		capturePhoto(callback: (fileInfo: FileInfo) => void, errorCallback?: (error: string) => void, scope?: any);
		selectPhoto(callback: (fileInfo: FileInfo) => void, errorCallback?: (error: string) => void, scope?: any);
		selectMultiplePhotos(callback: (fileInfo: FileInfo) => void, errorCallback?: (error: string) => void, scope?: any);
		loadFrom(callback: (fileInfo: FileInfo) => void, errorCallback?: (error: string) => void, scope?: any);
		loadFromMultiple(callback: (fileInfo: FileInfo) => void, errorCallback?: (error: string) => void, scope?: any);
		selectFile(callback: (fileInfo: FileInfo) => void, errorCallback?: (error: string) => void, scope?: any);
		selectMultipleFiles(callback: (fileInfo: FileInfo) => void, errorCallback?: (error: string) => void, scope?: any);
		recordAudio(callback: (fileInfo: FileInfo) => void, errorCallback?: (error: string) => void, scope?: any);
		recordVideo(callback: (fileInfo: FileInfo) => void, errorCallback?: (error: string) => void, scope?: any);
		pasteFile(callback: (fileInfo: FileInfo) => void, errorCallback?: (error: string) => void, scope?: any);
		/**
		 * @since 9.1
		 * Prints the document defined by file path.
		 * @param filePath A file path.
		 * @param landscape True, to print the document in landscape. False, to print it in portrait
		 * @param errorCallback The error callback which is called in case of error.
		 * @param scope The scope for callbacks.
		 */
		print(filePath: string, landscape: boolean, callback: (result: boolean) => void, scope?: any);
		resizeImage(filePath: string, maxWidth: number, maxHeight: number, callback: (result: boolean) => void, scope?: any);
		/**
		 * @since 11.2
		 * Ask to user to choose a location and saves the passed data as a file at that location.
		 * @param fileName A file name.
		 * @param fileData Base64 encoded file data.
		 * @param success A callback function for asynchronous result. In case of success result argument will be true otherwise false.
		 * @param failed A callback function for command failure. The error argument will carry the error message.
		 * @param scope A scope for calling the callbacks. Set to call the callbacks in global scope.
		 */
		saveFileDialog(fileName: string, fileData: string, success: (result: boolean) => void, failed?: (err: string) => void, scope?: any);
	}
	/** Represents the synchronization result.
	 * @property newCustomizationReady {boolean} Indicates whether the new customization is ready.
	 * @property customizationDownloaded {boolean} Indicates whether the new customization was applied.
	 * @property dataErrorsEncountered {boolean} Indicates whether some data errors were encountered during sync (cannot upload, delete, change status, owner, etc.).
	 * @property appWasLocked {boolean} Application was locked.
	 * @property syncAborted {boolean}  Sync was aborted.
	 * @property adminFullSync {boolean} Full sync was requested so background sync was aborted.
	 * @property wasBackgroundSync {boolean} Indicates whether the last sync was background sync or foreground sync.
	 * @property connectFailed {boolean} Indicates whether sync could not start because of a connection failure.
	 * @property webError {boolean} Indicates whether sync failed due to a communication error (HttpException, for example).
	 * @property OAuthError {boolean} Sync failed because the OAuth access token can't be acquired or refreshed.
	 * @property syncDownloadRestartedOnBackground {boolean} New customization was downloaded. Sync is still downloading data on background.
	 * @property warning {boolean} Sync result contains some warnings that are not critical.
	 */
	class SynchronizationResult {
		constructor(synchronizationResult?: number);
		newCustomizationReady: boolean;
		customizationDownloaded: boolean;
		dataErrorsEncountered: boolean;
		appWasLocked: boolean;
		syncAborted: boolean;
		adminFullSync: boolean;
		wasBackgroundSync: boolean;
		connectFailed: boolean;
		webError: boolean;
		OAuthError: boolean;
		syncDownloadRestartedOnBackground: boolean;
		warning: boolean;
	}
	class AddressBookService {
		public static getService(errorCallback?: (error: string) => void, scope?: any): AddressBookService;
		getContact(
			id: string,
			callback: (addressBookRecord: MobileCRM.Services.AddressBookService.AddressBookRecord) => void,
			errorCallback?: (error: string) => void,
			scope?: any
		);
	}
	class ChatService {
		chatUser: MobileCRM.DynamicEntity;
		userEntity: string;
		userId: string;

		static getService(callback: (res: MobileCRM.Services.ChatService) => void, errorCallback?: (error: string) => void, scope?: any);
		postMessage(
			regardingEntity: MobileCRM.Reference,
			text: string,
			callback?: (res: MobileCRM.DynamicEntity) => void,
			errorCallback?: (error: string) => void,
			scope?: any
		);
		attachNoteToPost(
			postId: string,
			filePath: string,
			mimeType: string,
			subject: string,
			callback?: (res: MobileCRM.DynamicEntity) => void,
			errorCallback?: (error: string) => void,
			scope?: any
		);
		subscribeToEntityChannel(
			regardingEntity: MobileCRM.Reference,
			subscribe: boolean,
			callback?: (res: MobileCRM.DynamicEntity) => void,
			errorCallback?: (error: string) => void,
			scope?: any
		);
	}

	class GeoAddress {
		streetNumber: string;
		street: string;
		city: string;
		zip: string;
		stateOrProvince: string;
		country: string;
		isValid: string;

		public static fromLocation(
			latitude: number,
			longitude: number,
			success: (res: MobileCRM.Services.GeoAddress) => void,
			failed?: (error: string) => void,
			scope?: any
		);
		public toLocation(success: (res: Location) => void, failed?: (error: string) => void, scope?: any);
	}
	class HttpWebRequest {
		/**The HTTP method to use for the request (e.g. "POST", "GET", "PUT")*/
		public method: string;
		/**An object of additional header key/value pairs to send along with requests using the HttpWebRequest.*/
		public headers: any;
		/**The body content of HttpWebRequest.*/
		private body: string;
		/**ending data content type.*/
		public contentType: string;
		/**The encoding (default: UTF-8), e.g. UTF-8, ASCII, Base64*/
		private encoding: number;
		/**The HttpWebResponse content type.*/
		private responseType: string;
		/**
		 * Allow to send http web request against an HTTP server.
		 * @param url Url of server where HTTP request will be sent.
		 * @param callback A callback function which will obtain the web response. @see IWebResponse.
		 * @param scope The scope for callbacks.
		 */
		public send(url: string, callback: (res: IWebResponse) => void, scope?: any);
		/**
		 * Allow to send http web request against an HTTP server.
		 * @param url Url of server where HTTP request will be sent.
		 * @returns A Promise object which is asynchronously resolved with the web response object, or rejected with the web response object, where responseText contains error message. @see IWebResponse.
		 */
		public sendAsync(url: string): Promise<IWebResponse>;
		/**
		 * Set content body of http web request.
		 * @param body The body content.
		 * @param encoding The encoding (e.g. UTF-8, ASCII, Base64. Binary)
		 */
		public setBody(body: string, encoding: string);
		/**
		 * Set Network credentials information.
		 * @param userName The authentication user name.
		 * @param password The authentication password.
		 */
		public setCredentials(userName: string, password: string);
		/**
		 * Set encoding for content type of http web response
		 * @param encoding The encoding (e.g. UTF-8, ASCII, Base64)
		 */
		public setResponseEncoding(encoding: string);
	}
	class AIVision {
		/**
		 * Construct AIVision instance from passed setting parameter @see MobileCRM.Services.AIVisionSettings .
		 * @param AIVisionSettings settings @see MobileCRM.Services.AIVisionSettings.
		 */
		static create(settings: AIVisionSettings): AIVision;
		/**
		 * Construct AIVision instance using entity settings defined in woodford.
		 * @param entityName Name of the entity what contains AI Image Recognition settings.
		 */
		static createFromEntitySettings(entityName: string): AIVision;
		/**
		 * Recognize captured photo using AIVison service.
		 * @param success A callback function that is called with the result of recognition @see MobileCRM.Services.IAIVisionResult.
		 * @param failed A callback which is called in case of error.
		 * @param scope The scope for callbacks.
		 */
		recognizeCapturedPhoto(success: (tags: MobileCRM.Services.IAIVisionResult) => void, failed?: (error: string) => void, scope?: any);
		/**
		 * Recognize captured photo using selected pricture.
		 * @param success A callback function that is called with the result of recognition @see MobileCRM.Services.IAIVisionResult.
		 * @param failed A callback which is called in case of error.
		 * @param scope The scope for callbacks.
		 */
		recognizeSelectedPicture(success: (res: MobileCRM.Services.IAIVisionResult) => void, failed?: (error: string) => void, scope?: any);
	}
	/** Represents the settings for AI image recognition service. */
	class AIVisionSettings {
		/** Gets or sets the model name. */
		public modelName: string;
		/** Gets or sets the model prediction key. */
		public predictionKey: string;
		/** Gets or sets the url to train model. */
		public url: string;
		/** Gets or sets the service type. By default we use Azure. */
		public serviceType?: string;
	}

	interface IAIVisionResult {
		tags: Array<IAIVisionTags>;
		filePath: string;
	}
	interface IAIVisionTags {
		tag: string;
		probability: string;
	}

	interface IWebResponse {
		responseCode: number;
		responseText: string;
		responseType: string;
	}

	class GeoFencingService {
		/** Indicates whether the service is active. */
		isEnabled: boolean;
		/** Indicates whether the events should be delivered realtime using Resco forwarding service.*/
		realtimeFlushing: boolean;
		/** Defines logging verbosity (0=Normal, 1=Diagnostic, -1=None) */
		logLevel: number;
		/** Defines event mask for showing notifications (0=None, 1=WhenArrived, 2=WhenExited, 3=Always) */
		notificationMask: number;
		/** Business hours interval (default value is '9:00-17:00') */
		businessHours: string;
		/** Business days mask (the lowest bit is Sunday, the next Monday, ...) */
		businessDaysMask: number;

		updateGeoFences(records: GeoFenceRecord[]);
	}

	interface GeoFenceRecord {
		/** Defines numeric mask for geo fence events (Enter = 1, Exit = 2, Both = 3).*/
		eventTypeMask: number;
		/** Unique id of geo-fence record. If it is associated with some entity record, it must have form logicalname:id (e.g. appointment:4595AA3E-9873-4DC4-B723-C94DE27B82BE).*/
		id: string;
		/** Human-readable name of record used for notifications.*/
		name: string;
		/** Latitude of geo-fence center.*/
		latitude: number;
		/** Longitude of geo-fence center.*/
		longitude: number;
		/** Geo-fence radius in meters.*/
		radius: number;
		/** Geo-fence expiration in seconds.*/
		expiration: number;
	}
}
declare module MobileCRM.Services.AddressBookService {
	class AddressBookRecord {
		recordId: string;
		firstName: string;
		lastName: string;
		middleName: string;
		nickName: string;
		jobTitle: string;
		organization: string;
		prefix: string;
		suffix: string;
		geo: Array<string>;
		url: string;
	}
}

declare module MobileCRM.Services.Workflow {
	class Action {
		/**
		 * @since 11.2
		 * Asynchronously executes custom workflow action on the server.
		 * @param actionName The unique name of the custom action to execute.
		 * @param parameters The object containing the parameters for the custom action.
		 * @param success A callback function for successful asynchronous result.
		 * @param failed A callback function for command failure.
		 * @param scope Optional scope for calling the callbacks.
		 */
		static execute(actionName: string, parameters: object, success: (result: object) => void, failed?: (err: string) => void, scope?: any);
	}
}

declare module MobileCRM.UI {
	class FormManager {
		public static showEditDialog(entityName: string, id: string, relationship?: Relationship, options?: any);
		public static showDetailDialog(entityName: string, id: string, relationship?: Relationship);
		public static showNewDialog(entityName: string, relationship?: Relationship, options?: any);
	}
	interface _DetailItem {
		name: string;
		label: string;
		dataMember: string;
		errorMessage: string;
		supportingText: string;
		isEnabled: boolean;
		isVisible: boolean;
		value: any;
		isNullable: boolean;
		validate: boolean;
		style: string;
	}
	interface _DetailItemTextBox extends _DetailItem {
		isPassword: boolean;
		kind: number;
		maxLength: number;
		numberOfLines: number;
		value: string;
	}
	interface _DetailItemNumeric extends _DetailItem {
		decimalPlaces: number;
		displayFormat: string;
		increment: number;
		maximum: number;
		minimum: number;
		upDownVisible: boolean;
		value: number;
	}
	interface _DetailItemCheckBox extends _DetailItem {
		textChecked: string;
		textUnchecked: string;
		value: boolean;
	}
	interface _DetailItemDateTime extends _DetailItem {
		maximum: Date;
		minimum: Date;
		parts: Number;
		value: Date;
	}
	interface _DetailItemDuration extends _DetailItem {
		value: number;
	}

	interface _DetailItemComboBox extends _DetailItem {
		displayMember: string;
		valueMember: string;
		value: number;
	}

	interface _DetailItemLink extends _DetailItem {
		isMultiline: boolean;
		value: MobileCRM.Reference | string;
	}

	class _DetailView {
		items: Array<DetailViewItems.Item>;
		getItemByName(name: string): MobileCRM.UI._DetailItem;
		getItemIndex(name: string): number;
		insertItem(item: MobileCRM.UI._DetailItem, index: number);
		insertItems(items: Array<MobileCRM.UI._DetailItem>, index: number);
		removeItem(index: number);
		removeItems(indexes: Array<number>);
		isDirty: boolean;
		/**
		 * @since 8.0
		 * Installs the handler which has to be called when user clicks on the link item.
		 * @param item An item
		 * @param callback A callback which is called when user clicks on the link item. It obtains the link item name and the detail view name as arguments.
		 * @param scope A scope, in which the callback has to be called.
		 */
		registerClickHandler(item: MobileCRM.UI._DetailItemLink, callback: (itemName: string, detailViewName: string) => void, scope?: any);
		startEditItem(index: number);
		/**
		 * @since 9.1
		 * Changes the data source for ComboBoxItem {MobileCRM.UI.DetailViewItems.ComboBoxItem}.</see>.
		 * @param index Item index on the view.
		 * @param listDataSource The data source object (e.g. {label1 : 1, label2 : 2}).
		 * @param defaultValue New data source default value. If not defined, the first item from listDataSource will be used.
		 * @param valueType Type of list data source element value. Default is string, allowed int, string.
		 */
		updateComboItemDataSource(index: number, listDataSource: any, defaultValue?: string, valueType?: string);
		/**
		 * @since 10.1
		 * Changes the data source for MobileCRM.UI.DetailViewItems.ComboBoxItem.
		 * @param index Item index on the view.
		 * @param dialogSetup Lookup setup for modal lookup dialog.
		 * @param inlinePickSetup Optional setup for inline lookup picker. Leave empty to use the same setup as modal dialog.
		 * @param dialogOnly Indicates whether to allow the inline picker. Set "true" to disable the inline picker and always use the modal dialog. Set false to allow the inline picker.
		 */
		updateLinkItemViews(index: number, dialogSetup: DetailViewItems.LookupSetup, inlinePickSetup?: DetailViewItems.LookupSetup, dialogOnly?: boolean);
		/**
		 * @since 13.1
		 * Add detail item to desired position in to grid.
		 * @param gridName name of grid item.
		 * @param item Detail item @see MobileCRM.UI.DetailViewItems.Item
		 * @param column Optional Column x axis parameter, default is 0.
		 * @param row Optional Row y axis parameter, default is 0.
		 * @param colSpan Optional Column width x axis width , default is 0.
		 * @param rowSpan Optional Row width y axis width, default is 0.
		 */
		addItemToGrid(gridName: string, item: MobileCRM.UI.DetailViewItems.Item, column?: number, row?: number, colSpan?: number, rowSpan?: number);
	}
	/** Represents bulk update item status. */
	enum BulkUpdateItemStatus {
		Registered = 0,
		LoadFailed = 1,
		Loaded = 2,
		ValidateFailed = 3,
		Validated = 4,
		SaveFailed = 5,
		Saved = 6,
	}
	/** Represents bulk update item.*/
	interface BulkUpdateItem {
		/** Record id.*/
		id: string;
		/** Holds record. Can be null for records that aren't loaded yet (status Registered or LoadFailed).*/
		record: DynamicEntity;
		/** Gets bulk update item status.*/
		status: BulkUpdateItemStatus;
		/** Gets human-readable error or warning description.*/
		statusMessage: string;
		/** Indicates whether there was an error loading or saving item. */
		hasError: boolean;
		/** Indicates whether there item was saved with a warning. */
		hasWarning: boolean;
	}
	/**
	 * Represents the Javascript equivalent of native entity form object.
	 */
	class EntityForm {
		/** Gets the associated views as an array of MobileCRM.UI.IEntityList objects.*/
		associatedViews: Array<IEntityList>;
		/** A list of entity records editted on this bulk update form.*/
		bulkUpdateItems: Array<BulkUpdateItem>;
		/** Gets whether the form can be edited.*/
		canEdit: boolean;
		/** Determines if form can be closed, i.e. there are no unsaved data being edited.*/
		canClose: boolean;
		/** Gets the specific context object for onChange and onSave handlers. The onChange context contains single property 'changedItem' with the name of the changed detail item and the onSave context contains property 'errorMessage' which can be used to break the save process with certain error message.*/
		context?: IFormSaveContext | IFormChangeContext | IFormDetailCollectionChangeContext;
		/** Gets the current view of entity list.*/
		currentView: string;
		/** Gets the form controllers (map, web) as an array of { MobileCRM.UI._Controller } objects.*/
		controllers: Array<_Controller>;
		/** Gets the detailView controls  as an array of { MobileCRM.UI._DetailView } objects.*/
		detailViews: Array<MobileCRM.UI._DetailView>;
		/** Gets or sets the entity instance the form is showing. */
		entity: MobileCRM.DynamicEntity;
		/** Gets the top level form. */
		form: Form;
		/** Carries the custom parameters that can be specified when opening the form using { MobileCRM.UI.FormManager } */
		iFrameOptions: any;
		/** Indicates whether the form is bulk update form.*/
		isBulkUpdateForm: boolean;
		/** Indicates whether the form  has unsaved data. */
		isDirty: boolean;
		/** Defines relationship with parent entity. */
		relationship: MobileCRM.Relationship;
		/** Gets whether the underlying form is visible. */
		visible: boolean;
		/** NoteForm only. Gets the view containing the note attachment. */
		documentView?: _DocumentView;
		/**
		 * Returns the DetailView by its name.
		 * @param name A name of DetailView.
		 * @returns MobileCRM.UI._DetailView
		 */
		getDetailView(name: string): MobileCRM.UI._DetailView;
		/**
		 * Returns the tab controller by its view name.
		 * @param name A name of 'controllers' view.
		 * @returns MobileCRM.UI._Controller
		 */
		getController(name: string): _Controller;
		/**
		 * Returns the entity list by its view name.
		 * This method looks for plain associated views but also for controllers that can be flipped into a list (in addition to map or chart).
		 * @param name A name of associated view.
		 * @returns IEntityList
		 */
		getEntityList(name: string): IEntityList;
		/**
		 * Sets the address fields according to the current geo-location from platform-specific location service.
		 * @param latitude The latitude from geo-location from platform-specific location service
		 * @param longitude longitude from geo-location from platform-specific location service
		 */
		updateAddressFields(latitude: number, longitude: number);
		/**
		 * Stops the onSave validation and optionally causes an error message to be displayed.
		 * @param errorMsg An error message to be displayed or &quot;null&quot; to cancel the validation without message.
		 */
		cancelValidation(errorMsg: string);
		/**
		 * @since 8.0
		 * Selects the form tab by its name.
		 * @param tabName The name of the tab.
		 * @param errorCallback The errorCallback which is called asynchronously in case of error.
		 * @param scope The scope for callback.
		 */
		selectTab(tabName: string, errorCallback?: (err: string) => void, scope?: any);
		/**
		 * @since 8.0
		 * Selects the form tab by its name using static method.
		 * @param tabName The name of the tab.
		 * @param errorCallback The errorCallback which is called asynchronously in case of error.
		 * @param scope The scope for callback.
		 */
		public static selectTabEx(tabName: string, errorCallback?: (err: string) => void, scope?: any);
		/**
		 * The name of the associated entity list tab.
		 * @param tabName The name of the associated entity list tab.
		 * @param viewName The view name.
		 */
		selectView(tabName: string, viewName: string);
		/**
		 * Sets the visibility of the form tab defined by its name.
		 * @param tabName The name of the tab.
		 * @param visible Defines desired visibility state.
		 */
		setTabVisibility(tabName: string, visible: boolean);
		/**
		 * Gets the MediaTab object representing the media tab with given name.
		 * @param name The name of the tab
		 * @returns MobileCRM.UI.MediaTab
		 */
		getMediaTab(name: string): MediaTab;

		/**
		 * Suspends current 'onSave' validation and allows performing another asynchronous tasks to determine the validation result.
		 * A request object with single function 'resumeSave'; which has to be called with the validation result (either error message string or 'null' in case of success).
		 */
		suspendSave(): IFormSaveHandler;
		/**
		 * Suspends current 'onPostSave' process and allows performing another asynchronous tasks before closing the form.
		 * A request object with single function 'resumePostSave'; which has to be called after all necessary operations completed.
		 */
		suspendPostSave(): IFormPostSaveHandler;
		/**
		 * @since 9.1
		 * Reactivates inactive entity and reloads the form.
		 * @param statuscode Activation status code.
		 */
		reactivateEntity(statuscode: number);

		/**
		 * Requests the managed EntityForm object.
		 * @description Method initiates an asynchronous request which either ends with calling the errorCallback or with calling the callback with Javascript version of EntityForm object. See { MobileCRM.Bridge.requestObject } for further details.
		 * @param callback The callback function that is called asynchronously with serialized EntityForm object as argument. Callback should return true to apply changed properties.
		 * @param errorCallback The errorCallback which is called in case of error.
		 * @param scope The scope for callbacks.
		 */
		public static requestObject(callback: (entityForm: EntityForm) => void, errorCallback: (err?: string) => void, scope?: any);
		/**
		 * Reloads the form edit state.
		 */
		public static refreshForm();
		/**
		 * Binds or unbinds the handler for onSave event on EntityForm.
		 * @param handler The handler function that has to be bound or unbound.
		 * @param bind Determines whether to bind or unbind the handler.
		 * @param scope The scope for callbacks.
		 */
		public static onSave(handler: (entityForm: EntityForm) => void, bind: boolean, scope?: any);
		/**
		 * Binds or unbinds the handler for onChange event on EntityForm.
		 * @param handler The handler function that has to be bound or unbound.
		 * @param bind Determines whether to bind or unbind the handler.
		 * @param scope The scope for callbacks.
		 */
		public static onChange(handler: (entityForm: EntityForm) => void, bind: boolean, scope?: any);
		/**
		 * @since 15.1
		 * Binds or unbinds the handler for onProcessLoaded event on EntityForm.
		 * @param handler The handler function that has to be bound or unbound.
		 * @param bind Determines whether to bind or unbind the handler.
		 * @param scope The scope for callbacks.
		 */
		public static onProcessLoaded(handler: (entityForm: EntityForm) => void, bind: boolean, scope?: any);
		/**
		 * @since 11.2
		 * Binds or unbinds the handler for specific item change event on EntityForm.
		 * @param itemName The name of desired detail item (mostly logical name of the field).
		 * @param handler The handler function that has to be bound or unbound.
		 * @param bind Determines whether to bind or unbind the handler.
		 * @param scope The scope for callbacks.
		 */
		public static onItemChange(itemName: string, handler: (entityForm: EntityForm) => void, bind: boolean, scope?: any);
		/**
		 *
		 * @param handler The handler function that has to be bound or unbound.
		 * @param bind Determines whether to bind or unbind the handler.
		 * @param scope The scope for callbacks.
		 */
		public static onPostSave(handler: (entityForm: EntityForm) => void, bind: boolean, scope?: any);
		/**
		 * @since 9.1
		 * Saves the form entity and its children and refreshes the form.
		 */
		public static save();
		/**
		 * Saves edited entity and closes the form.
		 */
		public static saveAndClose();
		/**
		 * Closes the form ignoring all changes that have been made on it.
		 */
		public static closeWithoutSaving();
		/**
		 * @since 8.1
		 * Execute the command with the passed name. The command must exist and must be enabled.
		 * @param command
		 * @param callback The callback function that is called asynchronously in case of success.
		 * @param errorCallback The errorCallback which is called in case of error.
		 * @param scope The scope for callbacks.
		 */
		public static executeCommandByName(
			command: string,
			callback: (entityForm: EntityForm) => void,
			errorCallback?: (err: string) => void,
			scope?: any
		);
		/**
		 * Binds or unbinds the handler for EntityForm command.
		 * @param command The name of the EntityForm command.
		 * @param handler The handler function that has to be bound or unbound.
		 * @param bind Determines whether to bind or unbind the handler.
		 * @param scope The scope for callbacks.
		 */
		public static onCommand(command: string, handler: (entityForm: EntityForm) => void, bind: boolean, scope?: any);
		/**
		 * Binds or unbinds the handler called when the EntityForm needs to find out whether the command can be executed (is enabled).
		 * @param command The name of the EntityForm command. Optionally can contain the param value separated by slash (e.g. ChangeStatus/5).
		 * @param handler The handler function that has to be bound or unbound. Handler return value indicates whether the command is enabled (true/false).
		 * @param bind Determines whether to bind or unbind the handler.
		 * @param scope The scope for callbacks.
		 */
		public static onCanExecuteCommand(command: string, handler: (entityForm: EntityForm) => void, bind: boolean, scope?: any);
		/**
		 * Enables or disables the form command.
		 * @param command The name of the command.
		 * @param enable Determines whether to enable or disable the command.
		 * @param iParam @since 9.1 Optional parameter defining the additional command parameter (like status code value for 'ChangeStatus'; command).
		 */
		public static enableCommand(command: string, enable: boolean, iParam?: number);
		/**
		 * Shows a please wait message, disabling the form except for the close command.
		 * @param caption Wait message.
		 * @returns An object representing the UI component with single method 'close';.
		 */
		public static showPleaseWait: (caption: string) => any;
		/**
		 * @since 8.1
		 * Makes the passed view maximized/restored.
		 * @param viewName The name of the view which has to be maximized/restored.
		 * @param maximize true, to maximize the view; false, to restore it.
		 */
		public static maximizeView(viewName: string, maximize: boolean);
		/**
		 * @since 8.1
		 * Makes the passed view maximized/restored.
		 * @param viewName The name of the view which has to be maximized/restored.
		 * @param callback Asynchronous callback which is called with Boolean result: true, if the view is maximized; false, if it is restored.
		 * @param errorCallback The errorCallback which is called in case of error.
		 * @param scope The scope for callbacks.
		 */
		public static isViewMaximized(viewName: string, callback: (isMaximized: boolean) => void, errorCallback?: (err?: string) => void, scope?: any);
		/**
		 * @since 8.2
		 * Shows an entity edit dialog.
		 * @param detail Detail entity {MobileCRM.DynamicEntity}.
		 * @param errorCallback The errorCallback which is called in case of error.
		 */
		public static openSalesEntityDetail(detail: MobileCRM.DynamicEntity, errorCallback: (err?: string) => void);
		/**
		 * @since 18.0
		 * The clearance must be dutifully released using leaveUiTransaction() when manipulation is finished.
		 * The clearance will not be obtained if background sync is running and form sync behavior is configured to 'Block save during sync'
		 * or 'Block save during sync and prevent sync while form is open'".
		 * If form sync behavior is configured as 'No action', the clearance is always obtained.
		 * @returns true if form can give the clearance, false if it is not possible at this time.
		 */
		public static tryEnterUiTransaction(): Promise<boolean>;
		/**
		 * @since 18.0
		 * Notifies UI form that clearance obtained using successful call to tryEnterUiTransaction() is no longer needed, because data manipulation is complete.
		 */
		public static leaveUiTransaction(): Promise;
		/**
		 * @since 9.3
		 * Binds or unbinds the handler for onSelectedViewChanged event on EntityForm.
		 * @description Bound handler is called with the EntityForm object as an argument. The EntityForm context object contains 'selectedView' property with the name of currently selected view.
		 * @param handler The handler function that has to be bound or unbound.
		 * @param bind Determines whether to bind or unbind the handler.
		 * @param scope The scope for callbacks.
		 */
		public static onSelectedViewChanged(handler: (entityForm: EntityForm) => void, bind: boolean, scope?: any);
	}
	interface IFormSaveHandler {
		resumeSave(error?: string);
	}
	interface IFormPostSaveHandler {
		resumePostSave();
	}
	interface IFormSaveContext {
		errorMessage: string;
	}
	interface IFormChangeContext {
		changedItem: string;
		selectedView: string;
	}
	/** Represents context of change on entity form detail collection. */
	interface IFormDetailCollectionChangeContext {
		newIndex: number;
		oldIndex: number;
		type: number;
	}

	/**
	 * Represents the iFrame Javascript datasource chart object.
	 */
	class EntityChart {
		public static setDataSource(dataSource: ChartDataSource);
	}

	/**
	 * @since 9.2
	 * Represents the Javascript equivalent of native entity list object.
	 */
	class EntityList implements IEntityList {
		/** Gets or sets whether adding an existing entity is allowed.*/
		allowAddExisting: boolean;
		/** Gets or sets whether create a new entity (or managing the N:N entities in the case of N:N list) is allowed.*/
		allowCreateNew: boolean;
		/** Gets or sets a mask of document actions (for Note and SharePoint document lists).*/
		allowedDocActions: boolean;
		/** Gets or sets whether to show the search bar.*/
		allowSearch: boolean;
		/** Gets the view auto width pixel size.*/
		autoWideWidth: string;
		/** Gets the name of the entities in this list.*/
		entityName: string;
		/** Gets or sets the flip configuration (which views to show and which one is the initial).*/
		flipMode: number;
		/** Gets or sets whether there is a view with CalendarFields.*/
		hasCalendarViews: boolean;
		/** Gets whether the list needs a more button.*/
		hasMoreButton: boolean;
		/** Gets whether the list has a view that can be displayed on map.*/
		hasMapViews: boolean;
		/** Gets whether multi selection is active.*/
		isMultiSelect: boolean;
		/** Gets the internal list name. Used for localization and image lookup.*/
		internalName: string;
		/** Gets the lookup source. If the list is used for lookup this is the entity whose property is being looked.*/
		lookupSource: MobileCRM.Relationship;
		/** Gets the kinds of views available on the list.<*/
		options: number;
		/** Gets the relation source and related entity. &quot;null&quot;, if there is no relationship (if it is not an associated list).*/
		relationship: MobileCRM.Relationship;
		/** Gets currently selected entity. &quot;null&quot;, if there&apos;s no selection.*/
		selectedEntity: MobileCRM.DynamicEntity;
		/** Gets the current list mode.*/
		listMode: number;
		/** Gets or sets whether the list is dirty.*/
		isDirty: boolean;
		/** Gets or sets whether the list is loaded.*/
		isLoaded: boolean;
		/** Gets the read-only array of strings defining the list buttons.*/
		listButtons: Array<string>;
		/** Gets the controlled listView control.*/
		listView: _ListView;
		/** Gets or sets the unique name of the list. Used to save/load list specific settings.*/
		uniqueName: number;
		allowedViews: string;
		/** Gets the current entity list view */
		currentView: string;
		/** Gets the specific context object for event handlers.*/
		context?: IEntityListChangeContext | IEntityListSaveContext | IEntityListClickContext;

		/**
		 * Requests the EntityList object.
		 * Method initiates an asynchronous request which either ends with calling the errorCallback or with calling the callback with Javascript version of EntityList object. See{MobileCRM.Bridge.requestObject} for further details.
		 * @param callback he callback function that is called asynchronously with serialized EntityList object as argument See {MobileCRM.UI.EntityList} for further details. Callback should return true to apply changed properties.
		 * @param errorCallback The errorCallback which is called in case of error.
		 * @param scope The scope for callbacks.
		 */
		public static requestObject(callback: (entityList: EntityList) => void, errorCallback?: (err: string) => void, scope?: any);
		/**
		 * Sets the entity list data source replacement.
		 * @see Data source must be set during the document load stage and must not be delayed. It is used only if the entity view iFrame is marked as data source provider in Woodford.
		 * @param dataSource A data source object implementing the DynamicEntity list loading routine.
		 */
		public static setDataSource(dataSource: ListDataSource);
		/**
		 * @since 11.0.2
		 * Sets the entity list data source replacement factory.
		 * Data source must be set during the document load stage and must not be delayed.
		 * It is used only if the entity view iFrame is marked as data source provider in Woodford.
		 * @param factory A function that returns an object implementing the DynamicEntity list loading routine.
		 */
		public static setDataSourceFactory(factory: () => ListDataSource);
		/**
		 * Selects specified EntityList view.
		 * @see Selecting different entity view causes loading the iFrame related to that view (if the view has one). Currently loaded EntityList iFrame will be unloaded and it should not perform any further asynchronous actions.
		 * @param viewName The name of the entity view which has to be selected.
		 */
		public static selectView(viewName: string);
		/**
		 * Binds or unbinds the handler for EntityList command.
		 * @param command The name of the EntityList command.
		 * @param handler The handler function that has to be bound or unbound.
		 * @param bind Determines whether to bind or unbind the handler.
		 * @param scope The scope for handler calls.
		 */
		public static onCommand(command: string, handler: (entityList: EntityList) => void, bind: boolean, scope?: any);
		/**
		 * Executes the list/button command attached to this entity list.
		 * @param commandName A name of the command. It can be either custom command or one of following predefined commands:
		 * @param parameter A command parameter (e.g. the status code value for ChangeStatus command).
		 * @param errorCallback The errorCallback which is called in case of error.
		 * @param scope The scope for callbacks.
		 */
		public static runCommand(commandName: string, parameter: number, errorCallback?: (err: string) => void, scope?: any);
		/**
		 * Overrides the entity list&apos;s primary command button.
		 * @param labels An array of labels or single label (e.g. 'New').
		 * @param callback A callback which is called when command is launched.
		 * @param scope The scope for handler calls.
		 */
		public static setPrimaryCommand(labels: Array<string>, callback: (entitylist: EntityList) => void, scope?: any);
		/**
		 * @since 10.1
		 * Sets the value of the entity property.
		 * @param rowIndex The index of the entity in the list.
		 * @param propertyName The name of the property.
		 * @param editValue The new property value.
		 * @param saveImmediately Indicates whether to save immediately.
		 * @param errorCallback The errorCallback which is called in case of error.
		 * @param scope The scope for callback calls.
		 */
		public static setEntityProperty(
			rowIndex: number,
			propertyName: string,
			editValue: any,
			saveImmediately: boolean,
			errorCallback?: (errorCallback: string) => void,
			scope?: any
		);
		/**
		 * @since 10.1
		 * Starts the editing of a list cell.
		 * @param rowIndex The index of the row to edit.
		 * @param cellIndex The index of the cell.
		 * @param saveImmediately Indicates whether to save entity immediately after change or whether to just make it dirty.
		 * @param binding Optional, if null the binding from the cell index will be used.
		 * @param errorCallback The errorCallback which is called in case of error.
		 * @param scope The scope for callback calls.
		 */
		public static startEditCell(
			rowIndex: number,
			cellIndex: number,
			saveImmediately: boolean,
			binding?: number,
			errorCallback?: (errorCallback: string) => void,
			scope?: any
		);
		/**
		 * @since 10.1
		 * Simulates click on a clickable list cell.
		 * Opens an entity form for lookup content record. Performs appropriate action for cells bound to the phone/email/web formatted fields.
		 * @param rowIndex The index of the row to edit.
		 * @param cellIndex The index of the cell.
		 * @param errorCallback The errorCallback which is called in case of error.
		 * @param scope The scope for callback calls.
		 */
		public static clickCell(rowIndex: number, cellIndex: number, errorCallback?: (errorCallback: string) => void, scope?: any);
		/*Initiates asynchronous entity list reload.*/
		public static reload();
		/**
		 * @since 10.0
		 * Suspends current 'onSave'; validation and allows performing another asynchronous tasks to determine the validation result.
		 * A request object with single function 'resumeSave'; which has to be called with the validation result (either error message string or 'null' in case of success).
		 */
		public suspendSave(): IFormSaveHandler;
		/**
		 * @since 10.0
		 * Binds or unbinds the handler for onChange event on EntityList.
		 * Bound handler is called with the EntityList object as an argument. The EntityList context object contains 'entities' property with the list of currently changed entities (typically just one entity) and property 'propertyName' with the field name that was changed.
		 * @param handler The handler function that has to be bound or unbound.
		 * @param bind Determines whether to bind or unbind the handler.
		 * @param scope The scope for handler calls.
		 */
		public static onChange(handler: (entityList: EntityList) => void, bind: boolean, scope?: any);
		/**
		 * @since 10.0
		 * Binds or unbinds the handler for onSave event on EntityList.
		 * @param handler The handler function that has to be bound or unbound.
		 * @param bind Determines whether to bind or unbind the handler.
		 * @param scope The scope for handler calls.
		 */
		public static onSave(handler: (entityList: EntityList) => void, bind: boolean, scope?: any);
		/**
		 * @since 10.1
		 * Binds or unbinds the handler for onClick event on EntityList.
		 * Bound handler is called with the EntityList object as an argument. The EntityList context object contains &quot;entities&quot; property with the list of clicked entities (just one entity), property &quot;propertyName&quot; with the field name that was clicked within the list item and property &quot;event&quot; with event details.
		 * @param handler The handler function that has to be bound or unbound.
		 * @param bind Determines whether to bind or unbind the handler.
		 * @param scope The scope for handler calls.
		 */
		public static onClick(handler: (entityList: EntityList) => void, bind: boolean, scope?: any);
		/**
		 * @since 10.0
		 * Asynchronously gets the list of entities that were changed on the list.
		 * Bound handler is called with the EntityList object as an argument. The EntityList context object contains 'entities' property with the list of all changed entities and property 'errorMessage' that can be used to cancel save with an error.
		 * @param callback Callback obtaining an array of See { MobileCRM.DynamicEntity } that were changed on the list.
		 * @param errorCallback The errorCallback which is called asynchronously in case of error.
		 * @param scope The scope for callbacks.
		 */
		public static requestEditedEntities(callback: (editedEntities: Array<DynamicEntity>) => void, errorCallback?: (err: string) => void, scope?: any);
	}

	interface IEntityList {
		allowAddExisting: boolean;
		allowedViews: any;
		entityName: string;
		hasMapViews: boolean;
		internalName: string;
		isDirty: boolean;
		isLoaded: boolean;
		listButtons: Array<string>;
		listView: _ListView;
	}

	interface IEntityListContext {
		entities: Array<DynamicEntity>;
	}
	interface IEntityListChangeContext extends IEntityListContext {
		propertyName: string;
	}
	interface IEntityListSaveContext extends IEntityListContext {
		errorMessage: string;
	}
	interface IEntityListClickContext extends IEntityListContext {
		propertyName: string;
		event: IEntityListClickEvent;
	}
	interface IEntityListClickEvent {
		cell: number;
		row: number;
		binding: number;
		action: EntityListClickAction;
	}
	/**
	 * @constant Text Cell displaying data bound or constant text.
	 * @constant Image Cell displaying data bound or constant image.
	 * @constant Button Clickable button cell.
	 * @constant InlineButton The inline button. iOS only.
	 * @constant Editable The cell is editable. Or together with Text kind.
	 * @constant Clickable The cell is clickable. Or together with Text kind.
	 * @constant DirectEdit The cell is editable and will be saved right after change. Or together with Text kind.
	 * @constant ActionMask The cell is editable or clickable.
	 */
	enum EntityListClickAction {
		Text = 0,
		Image = 1,
		Button = 2,
		InlineButton = 3,
		Editable = 0x1000,
		Clickable = 0x2000,
		DirectEdit = 0x4000 | Editable,
		ActionMask = 0xf000,
	}

	class ListDataSource {
		public chunkSize: number;
		public fetch: MobileCRM.FetchXml.Fetch;
		public loadNextChunk(page: number, count: number): void;

		public static chunkReady(entities: Array<MobileCRM.DynamicEntity>);
	}

	/**
	 * Represents the Javascript dataset of chart object.
	 */

	class ChartDataSource {
		public type: string;
		public data: ChartDataSet;
		public isOfflineChart: boolean;
		public fetch: MobileCRM.FetchXml.Fetch;
		public loadOfflineData(): void;
		public loadCustomFetch(): void;
	}

	class ChartDataSet {
		labels: string[];
		datasets: Dataset;
	}

	class Dataset {
		label: string;
		data: Array<number>;
		backgroundColor: string;
	}

	/**
	 * @since 10.3
	 * Represents the Javascript equivalent of native questionnaire form object.
	 */
	class QuestionnaireForm {
		/** An instance of the form hosting the questionnaire.*/
		form: Form;
		/** An array of question groups contained in questionnaire.*/
		groups: QuestionnaireForm.Group[];
		/** An array of question items contained in questionnaire.*/
		questions: QuestionnaireForm.Question[];
		/** Relationship with other entity.*/
		relationship: Relationship;
		/** Root questionnaire entity */
		questionnaire: DynamicEntity;
		/** Custom event context */
		context: any;

		/**
		 * Stops the onSave validation and optionally causes an error message to be displayed.
		 * @param errorMsg An error message to be displayed or &quot;null&quot; to cancel the validation without message.
		 */
		cancelValidation(errorMsg: string);
		/**
		 * Returns the question item with given name.
		 * @param name A name of the question item.
		 */
		findQuestionByName(name: string): QuestionnaireForm.Question;
		/**
		 * Returns the question item with given id.
		 * @param id An id of the question item.
		 */
		findQuestionById(id: string): QuestionnaireForm.Question;
		/**
		 * Returns the question group with given name.
		 * @param name A name of the question group.
		 */
		findGroupByName(name: string): QuestionnaireForm.Group;
		/**
		 * Returns the question group with given id.
		 * @param id An id of the question group.
		 */
		findGroupById(id: string): QuestionnaireForm.Group;
		/**
		 * Suspends current 'onSave' validation and allows performing another asynchronous tasks to determine the validation result.
		 * A request object with single function 'resumeSave'; which has to be called with the validation result (either error message string or 'null' in case of success).
		 * To cancel the validation without any message, pass '#NoMessage#' text to this method.
		 */
		suspendSave(): IFormSaveHandler;
		/**
		 * Suspends current 'onPostSave' process and allows performing another asynchronous tasks before closing the form.
		 * A request object with single function 'resumePostSave'; which has to be called after all necessary operations completed.
		 */
		suspendPostSave(): IFormPostSaveHandler;

		public static requestObject(callback: (questionnaireForm: QuestionnaireForm) => void, errorCallback?: (err: string) => void, scope?: any);
		/**
		 * Asynchronously sets the answer value for this question.
		 * @param questionName The name of the question that has to be answered.
		 * @param value A value that has to be set as answer. It must correspond to the type of that question.
		 * @param errorCallback A callback which is called in case of error.
		 * @param scope A scope for calling the callbacks.
		 */
		public static trySetAnswer(questionName: string, answer: any, errorCallback?: (err: string) => void, scope?: any);
		/**
		 * Asynchronously sets the image as answer value for this question
		 * @param imageQuestionName
		 * @param base64Data A value that us used to create image answer.
		 * @param mimeType The valid mime type of corresponding base64Data.
		 * @param errorCallback A callback which is called in case of error.
		 * @param scope A scope for calling the callbacks.
		 */
		public static trySetImageAnswer(
			imageQuestionName: string,
			base64Data: string,
			mimeType: string,
			errorCallback?: (err: string) => void,
			scope?: any
		);
		/**
		 * Asynchronously sets the the focus on given question.
		 * @param questionName A name of the question.
		 * @param errorCallback A callback which is called in case of error.
		 * @param scope A scope for calling the callbacks.
		 */
		public static focusQuestion(questionName: string, errorCallback?: (err: string) => void, scope?: any);
		/**
		 * Overrides the list of options for given picklist question.
		 * @param questionName The name of the picklist question.
		 * @param allowNull Indicates whether the empty answer is allowed.
		 * @param options An object with label-to-value mappings, e.g. {'Option 1':1,'Option 2':2}.
		 * @param errorCallback A callback which is called in case of error.
		 * @param scope A scope for calling the callbacks.
		 */
		public static overridePicklistOptions(
			questionName: string,
			allowNull: boolean,
			options: QuestionnaireForm.IPicklistDataSource,
			errorCallback?: (err: string) => void,
			scope?: any
		);
		/**
		 * Sets the views and filters for specified lookup question.
		 * @param questionName The name of the lookup question.
		 * @param dialogSetup Lookup setup for modal lookup dialog.
		 * @param inlinePickSetup Optional setup for inline lookup picker. Leave empty to use the same setup as modal dialog.
		 * @param dialogOnly Indicates whether to allow the inline picker. Set &quot;true&quot; to disable the inline picker and always use the modal dialog. Set &quot;false&quot; to allow the inline picker.
		 * @param errorCallback A callback which is called in case of error.
		 * @param scope A scope for calling the callbacks.
		 */
		public static changeLookupQuestionSetup(
			questionName: string,
			dialogSetup: DetailViewItems.LookupSetup,
			inlinePickSetup: DetailViewItems.LookupSetup,
			dialogOnly: boolean,
			errorCallback?: (err: string) => void,
			scope?: any
		);
		/**
		 * Duplicates repeatable group with all its questions. The name of the group will contain the lowest available repeatIndex and suffix in form #00X.
		 * @param id Id of the source group
		 * @param copyValues Optional parameter determining whether the source group values should be copied to the new instance of the group.
		 * @param errorCallback A callback which is called in case of error.
		 * @param scope A scope for calling the callbacks.
		 */
		public static repeatGroup(id: string, copyValues?: boolean, errorCallback?: (err: string) => void, scope?: any);
		/**
		 * Deletes an instance of repeatable group with all its questions and adjusts the repeatIndex for all instances of the same template group with higher index.
		 * @param id Id of the source group
		 * @param errorCallback A callback which is called in case of error.
		 * @param scope A scope for calling the callbacks.
		 */
		public static deleteGroup(id: string, errorCallback?: (err: string) => void, scope?: any);

		/**
		 * Binds or unbinds the handler for onSave event on QuestionnaireForm.
		 * @param handler The handler function that has to be bound or unbound.
		 * @param bind Determines whether to bind or unbind the handler.
		 * @param scope The scope for callbacks.
		 */
		public static onSave(handler: (questionnaireForm: QuestionnaireForm) => void, bind: boolean, scope?: any);
		/**
		 * Binds or unbinds the handler for onChange event on QuestionnaireForm.
		 * @param handler The handler function that has to be bound or unbound.
		 * @param bind Determines whether to bind or unbind the handler.
		 * @param scope The scope for callbacks.
		 */
		public static onChange(handler: (questionnaireForm: QuestionnaireForm) => void, bind: boolean, scope?: any);
		/**
		 * @since 11.2
		 * Binds or unbinds the handler for specific question change event on QuestionnaireForm.
		 * @param questionName The name of desired question.
		 * @param handler The handler function that has to be bound or unbound.
		 * @param bind Determines whether to bind or unbind the handler.
		 * @param scope The scope for callbacks.
		 */
		public static onAnswerChanged(questionName: string, handler: (questionnaireForm: QuestionnaireForm) => void, bind: boolean, scope?: any);
		/**
		 * Binds or unbinds the handler for onPostSave event on QuestionnaireForm.
		 * @param handler The handler function that has to be bound or unbound.
		 * @param bind Determines whether to bind or unbind the handler.
		 * @param scope The scope for callbacks.
		 */
		public static onPostSave(handler: (questionnaireForm: QuestionnaireForm) => void, bind: boolean, scope?: any);
		/**
		 * Binds or unbinds the handler for onRepeatGroup event on QuestionnaireForm.
		 * @param handler The handler function that has to be bound or unbound.
		 * @param bind Determines whether to bind or unbind the handler.
		 * @param scope The scope for callbacks.
		 */
		public static onRepeatGroup(handler: (questionnaireForm: QuestionnaireForm) => void, bind: boolean, scope?: any);
		/**
		 * Binds or unbinds the handler for onDeleteGroup event on QuestionnaireForm.
		 * @param handler The handler function that has to be bound or unbound.
		 * @param bind Determines whether to bind or unbind the handler.
		 * @param scope The scope for callbacks.
		 */
		public static onDeleteGroup(handler: (questionnaireForm: QuestionnaireForm) => void, bind: boolean, scope?: any);
		/**
		 * Requests the Questionnaire entity.
		 * @param handler The callback function that is called asynchronously with a DynamicEntity object representing currently opened questionnaire. Callback should return true to apply changed properties.
		 * @param errorCallback The errorCallback which is called in case of error.
		 * @param scope The scope for callbacks.
		 */
		public static getQuestionnaireEntity(handler: (entity: DynamicEntity) => boolean, errorCallback?: (err: string) => void, scope?: any);
		/**
		 * Saves the form entity and its children and refreshes the form.
		 */
		public static save();
		/**
		 * Saves edited entity and closes the form.
		 */
		public static saveAndClose();
		/**
		 * Closes the form ignoring all changes that have been made on it.
		 */
		public static closeWithoutSaving();
		/**
		 * Binds or unbinds the handler for QuestionnaireForm command.
		 * @param command The name of the QuestionnaireForm command.
		 * @param handler The handler function that has to be bound or unbound.
		 * @param bind Determines whether to bind or unbind the handler.
		 * @param scope The scope for callbacks.
		 */
		public static onCommand(command: string, handler: (entityForm: QuestionnaireForm) => void, bind: boolean, scope?: any);
	}

	namespace QuestionnaireForm {
		interface Question {
			/** Gets the id of this question record.*/
			id: string;
			/** Gets the name of the question item.*/
			name: string;
			/** Gets or sets the question item label.*/
			label: string;
			/** Gets the index of the question item.*/
			index: number;
			/** Gets the id of parent question group (may be empty).*/
			groupId: string;
			/** Get or sets the question item description.*/
			description: string;
			/** Gets the value type of the question item.*/
			type: number;
			/** Gets current answer value. To change it, use trySetAnswer method.*/
			value: any;
			/** Gets or sets the question item style name.*/
			style: string;
			/** Indicates whether the item is answered.*/
			isAnswered: boolean;
			/** Indicates whether the item is visible.*/
			isVisible: boolean;
			/** Indicates whether the item is enabled.*/
			isEnabled: boolean;
			/** Indicates whether the item should be validated.*/
			validate: boolean;
			/** Set to true to focus the question item.*/
			focus: boolean;
			/** Holds the error message text related to current value of the question item.*/
			errorMessage: string;

			/**
			 * Asynchronously sets the answer value for this question.
			 * @param value A value that has to be set as answer. It must correspond to the type of this question.
			 * @param errorCallback A callback which is called in case of error.
			 * @param scope A scope for calling the callbacks.
			 */
			trySetAnswer(value: any, errorCallback?: (err: string) => void, scope?: any);
		}

		interface Group {
			/** Gets the id of the question group.*/
			id: string;
			/** Gets the name of the question group.*/
			name: string;
			/** Gets the index of the question group.*/
			index: number;
			/** Gets or sets the question group label.*/
			label: string;
			/** Get the question group description.*/
			description: string;
			/** Gets the id of parent group from questionnaire template.*/
			templateGroup: string;
			/** Index of this instance of repeatable group. Zero for non-repeatable groups*/
			repeatIndex: number;
			/** Indicates whether the group is repeatable.*/
			repeatEnabled: boolean;
			/** Indicates whether the group is visible.*/
			isVisible: boolean;
			/** Indicates whether the group is enabled.*/
			isEnabled: boolean;
			/** Indicates whether the group is expanded or collapsed.*/
			isExpanded: boolean;

			/**
			 * Duplicates repeatable group with all its questions. The name of the group will contain the lowest available repeatIndex and suffix in form #00X.
			 * @param copyValues Optional paramater determining whether the group values should be copied to the new instance of this group.
			 * @param errorCallback A callback which is called in case of error.
			 * @param scope A scope for calling the callbacks.
			 */
			repeatGroup(copyValues?: boolean, errorCallback?: (err: string) => void, scope?: any);
			/**
			 * Deletes this instance of repeatable group with all its questions and adjusts the repeatIndex for all instances of the same template group with higher index.
			 * @param errorCallback A callback which is called in case of error.
			 * @param scope A scope for calling the callbacks.
			 */
			deleteGroup(errorCallback?: (err: string) => void, scope?: any);
		}

		interface IPicklistDataSource {
			[key: string]: number;
		}
	}

	class HomeForm {
		form: Form;
		items: HomeItem[];
		listView: _ListView;
		lastSyncResult: MobileCRM.Services.SynchronizationResult;
		syncResultText: string;
		syncProgress: any;

		static requestObject(callback: (homeForm: HomeForm) => void, errorCallback?: (err: string) => void, scope?: any);
		static openHomeItemAsync(name: string, errorCallback?: (err: string) => void, scope?: any);
		static closeHomeItemAsync(name: string, errorCallback?: (err: string) => void, scope?: any);
		static closeForms(callback: () => void, errorCallback?: (err: string) => void, scope?: any);
		static hideUIReplacement();
		static onSyncFinished(handler: (homeForm: HomeForm) => void, scope?: any);

		static updateHomeItemAsync(
			items: string[],
			title?: string,
			subTitle?: string,
			badge?: string,
			errorCallback?: (err: string) => void,
			scope?: any
		);
		static updateHomeItems(items: IHomeItem[]);
	}

	interface IHomeItem {
		path: string;
		title?: string;
		subTitle?: string;
		badge?: string;
		isVisible?: boolean;
	}

	class HomeItem {
		name: string;
		path: string;
		title: string;
		subTitle: string;
		badge: string;
		icon: string;
		isVisible: boolean;

		isEnabled: boolean;
		isInitial: boolean;
		isLevelUp: boolean;
		isNavigationItem: boolean;
		url: string;
		uniqueName: string;
		itemConfiguration: string;

		children: HomeItem[];
	}

	class ReportForm {
		allowedReportIds: Array<any>;
		allowedLanguages: Array<any>;
		defaultReport: string;

		show(success: (obj: any) => void, failed?: (err: string) => void, scope?: any);
		runReport(
			fetch: string,
			reportXML: string,
			reportFormat: string,
			isExportOnly: boolean,
			isOnline: boolean,
			outputFile: string,
			success: (filePath: string) => void,
			failed?: (err: string) => void,
			scope?: any
		);
	}

	class Form {
		canMaximize: boolean;
		isMaximized: boolean;
		caption: string;
		selectedViewIndex: number;
		showTitle: boolean;
		viewCount: number;
		visible: boolean;

		public static requestObject(callback: (form: Form) => void, errorCallback?: (err: string) => void, scope?: any);
		public static showPleaseWait(caption: string): any;
		/**
		 * Shows a toast window over the app window which is dismissed after a few seconds.
		 * @param message A toast content message.
		 * @param icon Valid app image name (e.g. Home.Now.png).
		 */
		public static showToast(message: string, icon: string);
	}

	class ViewController {
		public static createCommand(primary: boolean, labels: Array<string>, callback: (command: string) => void, scope?: any);
	}

	class ProcessController {
		currentStateInfo: any;
		/**
		 * @since 8.2
		 * Changes (or clears) the business process flow for the current entity.
		 * @param callback A reference to the workflow entity defining the process to use, or null to disable BusinessProcessFlow.
		 * @param errorCallback The errorCallback which is called asynchronously in case of error
		 * @param scope The scope for callback.
		 */
		changeProccess(callback: (processReference: MobileCRM.Reference) => void, errorCallback?: (err: string) => void, scope?: any);
		/**
		 * @since 15.0
		 * Progresses to the next stage of the active process.
		 * @param errorCallback The errorCallback which is called asynchronously in case of error
		 * @param scope The scope for callback.
		 */
		MoveToPreviousStage(errorCallback?: (err: string) => void, scope?: any);
		/**
		 * @since 15.0
		 * Moves to the previous stage of the active process.
		 * @param errorCallback The errorCallback which is called asynchronously in case of error
		 * @param scope The scope for callback.
		 */
		MoveToNextStage(errorCallback?: (err: string) => void, scope?: any);
	}

	class ViewDefinition {
		entityName: string;
		name: string;
		fetch: string;
		kind: number;
		version: number;
		buttons: Array<string>;
		selector: string;
		templates: Array<any>;
		entityLabel: string;

		public static loadEntityViews(
			entityName: string,
			callback: (viewDefinitions: Array<ViewDefinition>) => void,
			errorCallback?: (err: string) => void,
			scope?: any
		);
	}

	class MessageBox {
		constructor(title: string, defaultText?: string);
		title: string;
		items: Array<string>;
		defaultText: string;
		multiLine: boolean;

		show(success: (button: string) => void, failed?: (err: string) => void, scope?: any);
		showAsync(): Promise<string>;
		static sayText(text: string, success?: () => void, failed?: (Error: string) => void, scope?: any);
		static sayTextAsync(text: string): Promise<void>;
	}

	class LookupForm {
		entities: Array<string>;
		allowedViews: string;
		source: MobileCRM.Relationship;
		prevSelection: MobileCRM.Reference;
		preventClose: boolean;
		allowNull: boolean;

		addView(entityName: string, viewName: string, isDefault?: boolean);
		addEntityFilter(entityName: string, filterXML: string);
		addEntityFilter(entityName: string, filterXml);
		show(success: (obj?: MobileCRM.Reference) => void, failed?: (err: string) => void, scope?: any);
		showAsync(): Promise<Reference>;
	}

	class MultiLookupForm {
		entities: Array<string>;
		source: MobileCRM.Relationship;
		dataSource: Array<MobileCRM.Reference>;
		allowNull: boolean;
		initialTab: number;

		show(success: (obj?: MobileCRM.Reference) => void, failed?: (err: string) => void, scope?: any);
		showAsync(): Promise<Reference>;
	}

	class MediaTab {
		constructor(index?: number, name?: string);
		index: number;
		name: string;

		capturePhoto(errorCallback?: (error: string) => void);
		selectPhoto(errorCallback?: (error: string) => void);
		selectFile(errorCallback?: (error: string) => void);
		recordAudio(errorCallback?: (error: string) => void);
		recordVideo(errorCallback?: (error: string) => void);
		clear(errorCallback?: (error: string) => void);
		getDocumentInfo(callback: (documentInfo: _DocumentInfo) => void, errorCallback?: (error: string) => void, scope?: any);
		getData(callback: (data: string) => void, errorCallback?: (error: string) => void, scope?: any);
		/**
		 * Gets the media tab document in form of base64 string.
		 * @returns A Promise object which will be resolved with the base64-encoded document data.
		 */
		getDataAsync(): Promise<string>;
		static getData(viewName: string, callback: (data: string) => void, errorCallback?: (error: string) => void, scope?: any);
		/**
		 * Gets the media tab document in form of base64 string.
		 * @returns A Promise object which will be resolved with the base64-encoded document data.
		 * @param viewName The name of the media tab.
		 */
		static getDataAsync(viewName: string): Promise<string>;
		isEmpty(callback: (isEmpty: boolean) => void, errorCallback?: (error: string) => void, scope?: any);
		/**
		 * Saves to file to disk.
		 * @param errorCallback Optional callback which is called in case of error.
		 */
		export(errorCallback: (error: string) => void);
		/**
		 * Opens the loaded document in a external application. Which application is platform specific.
		 * @param errorCallback
		 */
		open(errorCallback: (error: string) => void);
		/**
		 * Prints the document
		 * @param errorCallback Optional callback which is called in case of error.
		 */
		print(errorCallback: (error: string) => void);
		/**
		 * @since 11.1
		 *  Marks the MediaTab as editable.
		 * @param editable Indicates whether to mark MediaTab as editable.
		 * @param errorCallback Optional callback which is called in case of error.
		 */
		setEditable(editable: boolean, errorCallback: (error: string) => void);
		/**
		 * @since 11.1
		 * Sets the mask of allowed document actions.
		 * @param mask Specifies the mask of allowed commands.
		 * @param errorCallback
		 */
		setCommandsMask(mask: DocumentAction, errorCallback: (error: string) => void);
	}

	enum DocumentAction {
		/** No action.*/
		None = 0x0000,
		/** Configures the view for ink input.*/
		CaptureInk = 0x0001,
		/** Asks the user to capture a photo and loads the chosen media into the view.*/
		CapturePhoto = 0x0002,
		/** Asks the user to choose a media (image, video, depending on what the platform supports) and loads the chosen media into the view.*/
		SelectPhoto = 0x0004,
		/** Asks the user to choose a file and loads it into the view.*/
		SelectFile = 0x0008,
		/** Asks the user to record an audio note and loads it into the view.*/
		RecordAudio = 0x0010,
		/** Asks the user to record a video and loads it into the view.*/
		RecordVideo = 0x0020,
		/** Gets last photo taken and loads it into the view.*/
		UseLastPhotoTaken = 0x0040,
		/** Asks the user to choose file from either online or offline location and loads it into the view.*/
		LoadFrom = 0x0080,

		/** Clears the view and marks it as empty.*/
		Clear = 0x1000,
		/** Shows a preview of the loaded document (fullscreen, etc.).*/
		View = 0x2000,
		/** Opens the loaded document in a external application. Which application is platform specific.*/
		OpenExternal = 0x4000,
		/** Sends the document to another application. This command is implemented only on Android.*/
		SendTo = 0x8000,
		/** Virtual action handled in common code.*/
		Download = 0x10000,
		/** Copy image to clipboard.*/
		Copy = 0x20000,
		/** Paste image from clipboard.*/
		Paste = 0x40000,
		/** Prints the document.*/
		Print = 0x80000,
		/** Let user to choose smaller image resolution.*/
		ResizeImage = 0x100000,
		/** Let user import VCard attachment (handled in common code).*/
		Import = 0x200000,
		/** Pass document to edit in external app (Microsoft office so far[15.6.2015]).*/
		Edit = 0x400000,
		/** Send document as attachment.*/
		Email = 0x800000,
		/** Ask the user to choose multiple images.*/
		SelectMultiplePhotos = 0x1000000,
		/** Asks the user to choose multiple files from either online or offline location and loads it into the view.*/
		LoadFromMultiple = 0x2000000,
		/** Opens image in the image editor.*/
		EditImage = 0x4000000,
		/** Saves to file to disk.*/
		Export = 0x8000000,
		/** Actions that are non-destructive.*/
		ReadOnlyMask = SendTo | View | OpenExternal | Print | Email | Copy | Export,
	}

	interface _Controller {
		isDirty: boolean;
		isLoaded: boolean;
		view: _View;
	}
	/** Represents Media tab controller containing specific kind of document. */
	interface _DocumentController extends _Controller {
		/** Indicated whether the Media tab is empty. */
		isEmpty: boolean;
		/** Gets Media tab note subject used for identifying right instance of related attachment. */
		noteSubject: string;
		/** _Document view presenting attached document. */
		view: _DocumentView;
	}
	interface _View {
		isVisible: boolean;
		name: string;
	}
	interface _ListView extends _View {
		selectedIndex: number;
		templateIndex: number;
		selectedTemplateIndex: number;
		isScrollEnabled: boolean;
	}
	enum DocumentKind {
		/** No file content. */
		None,
		/** SVG signature. */
		Signature,
		/** HTML file or web page URL. */
		WebPage,
		/** Image file or image data. */
		Image,
		/** Generic document or another file type. */
		File,
	}
	/** Represents information about attached document. */
	interface _DocumentInfo {
		/** A kind of attachment included in _DocumentView. */
		documentKind: DocumentKind;
		/** Attachment file size. */
		fileSize: number;
		/** Image attachment height. */
		imageHeight: number;
		/** Image attachment width. */
		imageWidth: number;
	}
	/**  Defines an action to take when image is included into ImageView (captured or selected from gallery). */
	enum ImageViewMode {
		/** Size/crop values are taken just like suggestion (e.g. for CaptureImage action). */
		NoEnforcement = 0,
		/** Image is automatically cropped to DesiredRatio as it arrives. */
		AutoCrop = 1,
		/** Image is automatically resized as it arrives. */
		AutoResize = 2,
		/** Image editor is opened to resolve crop/resize actions. */
		OpenEditor = 0x8000,
	}

	interface _DocumentView extends _View {
		/** Contains information about attached document. */
		documentInfo: _DocumentInfo;
		/** Attached document file name. */
		fileName: string;
		/** Indicates whether the view is empty or whether user has already provided a document. */
		isEmpty: boolean;
		/** Indicates whether the view is read-only. */
		isReadOnly: boolean;
		/** Attached document file MIME type.*/
		mimeType: string;
		/** Signature title. */
		inkTitle: string;
		/** Signature save mode: image or SVG. */
		saveSignatureAsImage: boolean;
		/** Signature stroke width. */
		strokeWidth: number;
		/** Maximum allowed image width. Zero or negative numbers stand for no preference. */
		maxImageWidth: number;
		/** Maximum allowed image height. Zero or negative numbers stand for no preference. */
		maxImageHeight: number;
		/** Desired width/height ratio. Zero values stand for no preference. Negative ratio means that reverse ratio is also allowed (accepts both 4:3 and 3:4). */
		desiredRatio: number;
		/** Defines an action to take when image is included into ImageView (captured or selected from gallery). */
		enforcementMode: ImageViewMode;
	}
	class IFrameForm {
		form: Form;
		options: any;
		preventCloseMessage: string;
		context?: any;

		static showModal(caption: string, url: string, options?: any);
		static show(caption: string, url: string, maximized: boolean, options?: any);
		static requestObject(success: (form: IFrameForm) => void, failed?: (err: string) => void, scope?: any);
		static setDirty(dirty: boolean);
		static preventClose(message: string);
		static onSave(handler: (form: IFrameForm) => boolean, bind: boolean, scope?: any);
		/**
		 * Suspends current 'onSave' validation and allows performing another asynchronous tasks to determine the validation result.
		 * A request object with single function 'resumeSave'; which has to be called with the validation result (either error message string or 'null' in case of success).
		 */
		suspendSave(): IFormSaveHandler;
	}
	interface IRoutePlanItemSaveContext {
		errorMessage: string;
		entityToSave: DynamicEntity;
	}
	interface IRoutePlanItemPostSaveContext {
		savedEntity: DynamicEntity;
	}
	interface IRoutePlanItemContext {
		entity: DynamicEntity;
	}
	/** Represents the Javascript equivalent view of RoutePlan form object. */
	class RoutePlan {
		/** A list of route entities. */
		myRoute: DynamicEntity[];
		/** A list of completed entities that are about to be removed from route plan. */
		completedEntities: DynamicEntity[];
		/** Logical name of the route visit entity. */
		routeEntityName: string;
		/** Currently selected route day. */
		routeDay: Date;
		/** Controls whether the form is dirty and requires save, or whether it can be closed.*/
		isDirty: boolean;
		/** Event-specific context. */
		public context?: IFormSaveContext | IRoutePlanItemSaveContext | IRoutePlanItemPostSaveContext | IRoutePlanItemContext;
		/**
		 * @since 11.2
		 * Requests the managed RoutePlan object.
		 * Method initiates an asynchronous request which either ends with calling the <b>errorCallback</b> or with calling the <b>callback</b> with Javascript version of RoutePlan object.
		 * @param callback The callback function that is called asynchronously with serialized RoutePlan object as argument.
		 * @param errorCallback The errorCallback which is called in case of error.
		 * @param scope The scope for callbacks.
		 */
		static requestObject(callback: (routePlan: RoutePlan) => boolean, errorCallback?: (err: string) => void, scope?: any);
		/**
		 * Binds or unbinds the handler for route save validation.
		 * The RoutePlan context object contains IFormSaveContext object.
		 * Use suspendSave method to suspend the save process if an asynchronous operation is required.
		 * @param handler The handler function that has to be bound or unbound.
		 * @param bind Determines whether to bind or unbind the handler.
		 * @param scope The scope for handler calls.
		 */
		static onSave(handler: (routePlan: RoutePlan) => boolean, bind: boolean, scope?: any);
		/**
		 * Binds or unbinds the handler for validating single visit entity save.
		 * The RoutePlan context object contains IRoutePlanItemSaveContext object.
		 * Use suspendSave method to suspend the save process if an asynchronous operation is required.
		 * @param handler The handler function that has to be bound or unbound.
		 * @param bind Determines whether to bind or unbind the handler.
		 * @param scope The scope for handler calls.
		 */
		static onItemSave(handler: (routePlan: RoutePlan) => boolean, bind: boolean, scope?: any);
		/**
		 * Suspends current 'onSave' validation and allows performing another asynchronous tasks to determine the validation result.
		 * A request object with single function 'resumeSave'; which has to be called with the validation result (either error message string or 'null' in case of success).
		 */
		suspendSave(): IFormSaveHandler;

		/**
		 * Binds or unbinds the handler for further actions on saved route.
		 * Use suspendPostSave method to suspend the save process if an asynchronous operation is required.
		 * @param handler The handler function that has to be bound or unbound.
		 * @param bind Determines whether to bind or unbind the handler.
		 * @param scope The scope for handler calls.
		 */
		static onPostSave(handler: (routePlan: RoutePlan) => boolean, bind: boolean, scope?: any);
		/**
		 * Binds or unbinds the handler for further actions on saved visit entity.
		 * The RoutePlan context object contains IRoutePlanItemPostSaveContext object.
		 * Use suspendPostSave method to suspend the save process if an asynchronous operation is required.
		 * @param handler The handler function that has to be bound or unbound.
		 * @param bind Determines whether to bind or unbind the handler.
		 * @param scope The scope for handler calls.
		 */
		static onItemPostSave(handler: (routePlan: RoutePlan) => boolean, bind: boolean, scope?: any);
		/**
		 * Suspends current 'onPostSave' action and allows performing another asynchronous tasks.
		 * A request object with single function 'resumePostSave';
		 */
		suspendPostSave(): IFormPostSaveHandler;

		/**
		 * Binds or unbinds the handler called after route is reloaded.
		 * Bound handler is called with the RoutePlan object as an argument on start or when day or filter field is changed.
		 * @param handler The handler function that has to be bound or unbound.
		 * @param bind Determines whether to bind or unbind the handler.
		 * @param scope The scope for handler calls.
		 */
		static onRouteReloaded(handler: (routePlan: RoutePlan) => boolean, bind: boolean, scope?: any);
		/**
		 * Binds or unbinds the handler for for &quot;Item Added&quot; event.
		 * The RoutePlan context object contains IRoutePlanItemContext object.
		 * @param handler The handler function that has to be bound or unbound.
		 * @param bind Determines whether to bind or unbind the handler.
		 * @param scope The scope for handler calls.
		 */
		static onItemAdded(handler: (routePlan: RoutePlan) => boolean, bind: boolean, scope?: any);
		/**
		 * Binds or unbinds the handler for for &quot;Item Completed&quot; event triggered when user completes already-saved visit record.
		 * The RoutePlan context object contains IRoutePlanItemContext object.
		 * @param handler The handler function that has to be bound or unbound.
		 * @param bind Determines whether to bind or unbind the handler.
		 * @param scope The scope for handler calls.
		 */
		static onItemCompleted(handler: (routePlan: RoutePlan) => boolean, bind: boolean, scope?: any);
		/**
		 * Binds or unbinds the handler for for &quot;Item Removed&quot; event triggered when user removes a visit which hasn't been saved yet.
		 * The RoutePlan context object contains IRoutePlanItemContext object.
		 * @param handler The handler function that has to be bound or unbound.
		 * @param bind Determines whether to bind or unbind the handler.
		 * @param scope The scope for handler calls.
		 */
		static onItemRemoved(handler: (routePlan: RoutePlan) => boolean, bind: boolean, scope?: any);
	}
	/** Represents the Javascript equivalent view of tourplan form object. */
	class TourplanForm {
		public isDirty: boolean;
		public isLoaded: boolean;
		public view: AppointmentView;
		public context?: ITourplanCreateNewContext;
		/**
		 * @since 11.2
		 * Requests the managed TourplanForm object.
		 * Method initiates an asynchronous request which either ends with calling the <b>errorCallback</b> or with calling the <b>callback</b> with Javascript version of TourplanForm object.
		 * @param callback The callback function that is called asynchronously with serialized TourplanForm object as argument.
		 * @param errorCallback The errorCallback which is called in case of error.
		 * @param scope The scope for callbacks.
		 */
		static requestObject(callback: (form: TourplanForm) => boolean, errorCallback?: (err: string) => void, scope?: any);
		/**
		 * @since 11.3
		 * Binds or unbinds the handler for creating new appointment after long-pressing on calendar.
		 * Bound handler is called with the TourplanForm object as an argument. The context property contains ITourplanCreateNewContext object.
		 * @param handler The handler function that has to be bound or unbound.
		 * @param bind Determines whether to bind or unbind the handler.
		 * @param scope The scope for handler calls.
		 */
		static onCreateNew(handler: (form: TourplanForm) => boolean, bind: boolean, scope?: any);
		/**
		 * @since 11.2
		 * Sets the current date in calendar view (Tourplan).
		 * @param date A date to set.
		 * @param callback Optional callback called after successful change.
		 * @param errorCallback The errorCallback which is called in case of error.
		 */
		static setDate(date: Date, callback?: () => void, errorCallback?: (err: string) => void);
		static setMode(mode, callback, errorCallback);
	}
	/** Represents the UI component hosting the calendar. */
	interface AppointmentView {
		/** Gets or sets whether the view is visible. */
		isVisible: boolean;
		/** Gets the name of view. */
		name: string;
		/** Gets a view mode @see TourplanForm.TourplanViewMode */
		mode: TourplanViewMode;
		/** Gets the current date of displayed view. */
		currentDate: Date;
	}
	/** TourplanForm.onCreateNew context interface. */
	interface ITourplanCreateNewContext {
		entityName: string;
		start: Date;
		end: Date;
		subject?: string;
	}
	/**
	 * Enumeration holding constants for MobileCRM.UI.TourplanForm.
	 * @constant Agenda Agenda view.
	 * @constant Day Day view.
	 * @constant Week Week view.
	 * @constant Month Month view.
	 */
	enum TourplanViewMode {
		Agenda = 0,
		Day = 1,
		Week = 2,
		Month = 3,
	}
}

declare module MobileCRM.UI.EntityForm {
	class DetailCollection {
		static getAll(callback: (details: Array<MobileCRM.DynamicEntity>) => void, errorCallback?: (error: string) => void, scope?: any);
		static getAllAsync(): Promise<MobileCRM.DynamicEntity[]>;
		static get(index: number, callback: (details: MobileCRM.DynamicEntity) => void, errorCallback?: (error: string) => void, scope?: any);
		static getAsync(index: number): Promise<MobileCRM.DynamicEntity>;
		static deleteByIndex(index: number, callback: () => void, errorCallback?: (error: string) => void, scope?: any);
		static deleteById(orderDetailId: string, callback: () => void, errorCallback?: (error: string) => void, scope?: any);
		static add(
			product: MobileCRM.Reference,
			callback: (details: MobileCRM.DynamicEntity) => void,
			errorCallback?: (error: string) => void,
			scope?: any
		);
		static addProductWithQuantity(
			product: MobileCRM.Reference,
			quantity: number,
			callback: (details: MobileCRM.DynamicEntity) => void,
			errorCallback?: (error: string) => void,
			scope?: any
		);
		static onChange(handler: (entityForm: MobileCRM.UI.EntityForm) => void, bind: boolean, scope?: any);
		static onSelectedViewChanged(handler: (entityForm: MobileCRM.UI.EntityForm) => void, bind: boolean, scope?: any);
	}
}

declare module MobileCRM.UI.DetailViewItems {
	abstract class Item {
		constructor(name?: string, label?: string);
		name: string;
		label: string;
		dataMember: string;
		errorMessage: string;
		isEnabled: boolean;
		isVisible: boolean;
		value: any;
		isNullable: boolean;
		validate: boolean;
		style: string;
	}
	class SeparatorItem extends Item {}
	class TextBoxItem extends Item {
		isPassword: boolean;
		kind: number;
		maxLength: number;
		numberOfLines: number;
	}
	class NumericItem extends Item {
		decimalPlaces: number;
		displayFormat: string;
		increment: number;
		maximum: number;
		minimum: number;
		upDownVisible: boolean;
	}
	class CheckBoxItem extends Item {
		textChecked: string;
		textUnchecked: string;
	}
	class DateTimeItem extends Item {
		maximum: Date;
		minimum: Date;
		parts: Number;
		value: Date;
	}
	class DurationItem extends Item {}
	class ComboBoxItem extends Item {
		listDataSource: any;
	}
	class LinkItem extends Item {
		/**
		 * Instance of link detail item.
		 * @param name Gets or sets the name of item.
		 * @param label Gets or sets the label of item.
		 * @param listDropDownFormat Gets or sets the drop down format @see MobileCRM.UI.DetailViewItems.DropDownFormat
		 */
		constructor(name: string, label: string, listDropDownFormat?: DropDownFormat);
		isMultiline: boolean;
		value: MobileCRM.Reference | string;
		listDropDownFormat: DropDownFormat;
	}
	class ButtonItem extends Item {
		/**
		 * Instance of button item.
		 * @param name Gets or sets the name of item.
		 * @param text Gets or sets the click text of item.
		 */
		constructor(name: string, text: string);
		/**Gets or sets the click text.*/
		clickText: string;
	}
	class LookupSetup {
		/**
		 * Appends an entity view to the list of allowed views.
		 * @param entityName Entity logical name.
		 * @param viewName A name of the view.
		 * @param isDefault true, if the view should be set as default.
		 */
		addView(entityName: string, viewName: string, isDefault: boolean);
		/**
		 * Defines a fetch XML filter for entity records.
		 * @param entityName Entity logical name.
		 * @param filterXml A string defining the fetch XML which has to be applied as filter for entity records.
		 */
		addFilter(entityName: string, filterXml: string);
	}
	/**Drop down format for link item. */
	enum DropDownFormat {
		/**String list format. */
		StringList = 17,
		/**String list with input option format.*/
		StringListInput = 18,
		/**Multi string list format.*/
		MultiStringList = 19,
		/**Multi string list with input format */
		MultiStringListInput = 20,
	}
	class GridItem extends MobileCRM.UI.DetailViewItems.Item {
		/**
		 * @since 13.1 Represents the detail grid item.
		 * @param name Defines the item name.
		 * @param label Defines the item label.
		 * @param gridStyleDefintion Gets or sets the style definition for grid item.
		 */
		constructor(name: string, label: string, gridStyleDefintion: GridStyleDefintion);
		Items: Item[];
		count: number;
		/**
		 * @since 13.1
		 * Add detail item to desired position in to grid.
		 * @param item Detail item @see MobileCRM.UI.DetailViewItems.Item
		 * @param column Optional Column x axis parameter, default is 0.
		 * @param row Optional Row y axis parameter, default is 0.
		 * @param colSpan Optional Column width x axis width , default is 0.
		 * @param rowSpan Optional Row width y axis width, default is 0.
		 */
		addItem(item: DetailViewItems.Item, column?: number, row?: number, colSpan?: number, rowSpan?: number);
	}
	class GridStyleDefintion {
		/**
		 * @since 13.1 Represents the columns and rows style definition for grid item.
		 * @param columns Defines the columns style.
		 * @param rows Defines the rows style.
		 */
		constructor(columns: Array<DetailGridLength>, rows: Array<DetailGridLength>);
		columns: Array<DetailGridLength>;
		rows: Array<DetailGridLength>;
	}
	class DetailGridLength {
		/**
		 * @since 13.1 Represents the grid length in grid unit type.
		 * @param value Grid length value.
		 * @param gridUnitType Defines the grid @see MobileCRM.UI.DetailViewItems.DetailGridUnitType" unit type.
		 */
		constructor(value: number, gridUnitType: DetailGridUnitType);
	}
	/**@since 13.1 Grid unit type. */
	enum DetailGridUnitType {
		/**Gets automatic unit type.*/
		auto = 0,
		/**Gets absolute pixel unit type.*/
		pixel = 1,
		/**Gets relative unit type.*/
		star = 2,
	}
}
