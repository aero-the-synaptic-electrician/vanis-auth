/**
 * @note 
 * The 'authentication' packet uses eight random values, 
 * followed by four seeded values (possibly bruteforced),
 * then the first encoded number in the result.
 * 
 * Ex. N1 N2 N3 N4 N5 N6 N7 N8 S1 S2 S3 S4 N1
 */

/** Array of numbers to be used as constant keys. */
const constants = [
	5, 0x68, 0xfd, 0x3e,
	0xaf, 0x74, 0xee, 0x29
];

export class XorKey {
	/** 
	 * Initializes a key encoder, see example below:
	 * ```js 
	 * const key = [1,2,3,4,5,6,7,8,9,11,12,13];
	 * send(new XorKey(key).build());
	 * ```
	 * @param {Buffer | Array<number>} data Key value to be encoded
	 * @returns {XorKey} The key encoder instance
	 **/
	constructor(data) {
		/** @type {Buffer | Array<number>} */
		this.data = data;
	}

	/**
	 * Writes an encoded version of the data at the given index to the output
	 * @param {Array<number>} output
	 * @param {number} index
	 * @private
	 */
	writeIndex(output, index) {
		const value = this.data[index];
		const mask = (value + 5) & 7;
		const p1 = ((value << mask) | (value >>> (8 - mask))) & 0xff;
		const p2 = output[index > 0 ? index-1 : 0] ^ constants.at(index);
		output.push((p1 ^ p2) ^ 0x3e);
	}

	/**
	 * Constructs an encoded version of the given data
	 * @returns {Array<number>}
	 */
	build() {
		/** @type {Array<number>} */
		const result = [];

		for (let i = 0; i < 8; i++) {
			this.writeIndex(result, i);
		}

		const seed = 1 + Math.floor((Math.pow(2, 32) - 1) * Math.random());
		result.push((result[0] ^ (seed >>> 24)) & 0xff);
		result.push((result[1] ^ (seed >>> 16)) & 0xff);
		result.push((result[2] ^ (seed >>> 8)) & 0xff);
		result.push((seed ^ result[3]) & 0xff);

		result.push(result[0]);

		return result;
	}
};
