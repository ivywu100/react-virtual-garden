export class environmentTest {
	static testKey = process.env.TEST_ENV_KEY || 'key not found';
}