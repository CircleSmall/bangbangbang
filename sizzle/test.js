function test() {
	var startTime = new Date().getTime();
	console.log(Sizzle('div > p + div.aaron input[type="checkbox"]'));
	var endTime = new Date().getTime();
	console.log(endTime - startTime)
}
test();