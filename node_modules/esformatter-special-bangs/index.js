var rocamboleToken = require( 'rocambole-token' );

module.exports = {

	nodeAfter: function ( node ) {
		if ( ! ( node.type === "UnaryExpression" && node.operator === "!" ) ) {
			return;
		}

		var current = node.startToken,
			end = node.endToken,
			sawBang = false,
			sawLast = false;
		while( current && ! sawLast ) {
			// is this a bang?
			if ( current.value === "!" ) {
				sawBang = true;
			} else {
				if ( sawBang ) {
					// this should be whitespace...
					if( rocamboleToken.isWs( current ) ) {
						current.value = ' '; // should be 1 space
					} else {
						rocamboleToken.before( current, { type: 'WhiteSpace', value: ' ' } );
					}
					sawBang = false;
				}
			}
			sawLast = current === end;
			current = current.next;

		}
	}

};