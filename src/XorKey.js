/**
 * @note 
 * The 'authentication' packet uses eight random values, 
 * followed by four seeded values (possibly bruteforced),
 * then the first encoded number in the result.
 * 
 * Ex. N1 N2 N3 N4 N5 N6 N7 N8 S1 S2 S3 S4 N1
 */

/** Array of numbers to be used as constant keys. */
const constants = new [	
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
	 * Writes an encoded version of the given index to the output
	 * @param {Array<number>} output
	 * @param {number} index
	 * @private
	 */
	writeIndex(output, index) {
		const value = this.data[index],
			mask = (value + 4) & 7;

		const temp = ((value << mask) | (value >>> (8 - mask))) & 0xff;

		if (index > 0) {
			const key = output[index - 1] ^ constants.at(index);

			output.push(temp ^ key);
		} else {
			output.push(constants.at(0) ^ temp);
		}
	}

	/**
	 * Constructs an encoded version of the current key
	 * @returns {Array<number>}
	 */
	build() {
		/** @type {Array<number>} */
		const result = [];

		for (let i = 0; i < 8; i++)
			this.writeIndex(result, i);

		const seed = 1 + Math.floor((Math.pow(2, 32) - 1) * Math.random());
		result.push((result[0] ^ (seed >>> 24)) & 0xff);
		result.push((result[1] ^ (seed >>> 16)) & 0xff);
		result.push((result[2] ^ (seed >>> 8)) & 0xff);
		result.push((seed ^ result[3]) & 0xff);
		
		result.push(result[0]);

		return result;
	}
};
