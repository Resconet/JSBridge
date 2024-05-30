
MobileCRM.UI.EntityForm.onSave(async (form: MobileCRM.UI.EntityForm) => {
	const formChangeContext = <MobileCRM.UI.IFormSaveContext>form.context;
	const entityProps = form.entity.properties;
	const country = entityProps[Scheme.Account.country];
	const postalCode = entityProps[Scheme.Account.postalCode];
	if (postalCode && country && !entityProps[Scheme.Account.city]) {
		const handler = form.suspendSave(); // Suspend save validation as we need to perform asynchronous operation
		try {
			const cityName = await resolveCityName(country, postalCode);
			if (cityName) {
				MobileCRM.UI.EntityForm.requestObject((freshForm: MobileCRM.UI.EntityForm) => {
					freshForm.entity.properties[Scheme.Account.city] = cityName;
					handler.resumeSave(); // We can resume the save validation
				}, error => {
					handler.resumeSave(error); // Call resumeSave if any asynchronous operation fails.
				});
			} else {
				handler.resumeSave("City field can't be empty."); // Call resumeSave if async result wasn't found.
			}
		} catch (error) {
			// Bind whole async code with try/catch and call resumeSave even for unexpected error.
			handler.resumeSave(`Can't resolve postal code "${postalCode}": ${makeErrorMsg(error)}`);
		}
	}
	return false; // ignore changes
}, true);
