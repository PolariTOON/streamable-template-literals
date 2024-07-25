function isObject(value) {
	return typeof value === "object" && value != null || typeof value === "function";
}
function isLikelyCallableObject(value) {
	return isObject(value) && "apply" in value;
}
async function* flat(value) {
	value = await value;
	while (isLikelyCallableObject(value)) {
		value = await value.apply();
	}
	if (!isObject(value)) {
		yield `${value}`;
		return;
	}
	for await (const values of value) {
		yield* flat(values);
	}
}
async function* stream(strings, ...values) {
	yield strings[0];
	for (let k = 0, l = values.length; k < l; ++k) {
			yield* flat(values[k]);
			yield strings[k + 1];
	}
}
export {stream};
