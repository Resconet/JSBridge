
MobileCRM.UI.EntityForm.onChange(async (form: MobileCRM.UI.EntityForm) => {
	const formChangeContext = <MobileCRM.UI.IFormChangeContext>form.context;
	const entityProps = form.entity.properties;
	const country = entityProps[Scheme.Account.country];
	if (
		formChangeContext.changedItem == Scheme.Account.postalCode &&
		country &&
		!entityProps[Scheme.Account.city]
	) {
		const postalCode = entityProps[Scheme.Account.postalCode];
		try {
			const cityName = await resolveCityName(country, postalCode);
			if (cityName) {
				/*	A common pitfall is using following statement...
						form.entity.properties[cityFieldName] = cityName;
					... which sets the value on "zombie" form object which doesn't deliver changes back to native code anymore
					because its synchronous callback already finished (returning a Promise) when reaching await statement.

					Instead of that, we must request a "fresh" EntityForm object and set the city name on it.
				*/
				MobileCRM.UI.EntityForm.requestObject((freshForm: MobileCRM.UI.EntityForm) => {
					freshForm.entity.properties[Scheme.Account.city] = cityName;
				}, showError);
			}
		} catch (error) {
			showError(`Can't resolve postal code "${postalCode}": ${makeErrorMsg(error)}`);
		}
	}
	return false; // ignore changes
}, true);
