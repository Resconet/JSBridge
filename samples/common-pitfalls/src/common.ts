/*** Open Edge WebView2 inspector window in JSDev version of UWP (Windows Store) app. ***/
MobileCRM.bridge.command("openDevTools", null);

/** Simplified Metadata scheme with logical field names.*/
const Scheme = {
	Account: {
		city: "address1_city",
		country: "address1_country",
		postalCode: "address1_postalcode",
	}
}

const SampleConfiguration = {
	version: "1.0",
}

/** Displays a message box with error message text.
 * @param errorMsg Error message text
 */
function showError(errorMsg: string) {
	MobileCRM.UI.MessageBox.sayText(errorMsg);
}

function makeErrorMsg(error: any) {
	return error.message ?? error.toString();
}


/** Resolves city name using GeoNames webservice request.
 * It uses JSBridge HttpWebRequest API to prevent cross-domain access errors.
 * @param country Country code (in ISO format)
 * @param postalCode Postal code value
 * @returns A Promise resolving to a city name
 */
async function resolveCityName(country: string, postalCode: string): Promise<string> {
	const url = `http://api.geonames.org/postalCodeLookupJSON?postalcode=${postalCode}&country=${country}&username=resconexttest`;
	const request = new MobileCRM.Services.HttpWebRequest();
	request.method = "GET";
	const response = await request.sendAsync(url);
	const jsonResponse = JSON.parse(response.responseText);
	if (jsonResponse.postalcodes?.length > 0) {
		return jsonResponse.postalcodes[0].placeName;
	}
	throw new Error("No results found");
}

