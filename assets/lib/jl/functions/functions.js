try{ JL = JL; } catch(e){ JL = {}; }

JL.functions = {
	constants : {
		to_degrees : 180/Math.PI,
		to_radians : Math.PI/180,
	},
};

// --------------
// | Arithmetic |
// --------------

JL.functions.average = function( arr ){
	return arr.reduce(function( sum, a, i, ar ){
		sum += a;
		return ( i == ar.length - 1 ? ( ar.length == 0 ? 0 : sum / ar.length ) : sum );
	}, 0);
};

JL.functions.clamp = function( val, min, max ){
	return Math.min( Math.max( min, val ), max );
};

JL.functions.distance = function( obj_1, obj_2 ){
	var sum = 0;
	[ 'x', 'y', 'z' ].forEach(function( x ){
		if( obj_1[ x ] !== undefined ){
			var val = obj_1[ x ] - obj_2[ x ];
			sum += val * val;
		}
	});
	return Math.sqrt( sum );
};

JL.functions.get_factors = function( num ){
        var factors = [];
        for( var i = 1; i <= num; i += ( num % 2 ? 2 : 1 ) ){
                if( !( num % i ) ) factors.push( [ i, num / i ] );
        }
        return factors;
};

JL.functions.greatest_common_divisor = function( num, den ){
	if( den < 0.0000001 ) return num;
	return this.greatest_common_divisor( den, Math.floor( num % den ) );
};

JL.functions.scalar_multiply = function( scalar, vector ){
        return vector.map( x => scalar * x );
};

JL.functions.interpolate = function( v1, v2, percent ){
	return (1 - percent) * v1 + percent * v2;
};

JL.functions.interpolate_vectors = function( v1, v2, percent, keys ){
	var keys = keys || [ 'x', 'y', 'z' ];

	var result = {};
	keys.forEach(function( k ){
		result[ k ] = this.interpolate( v1[ k ], v2[ k ], percent );
	}, this);
	return result;
};

JL.functions.calculate_triangle_normal = function( v1, v2, v3 ){
	var edge_1_x = v1[0] - v2[0];
	var edge_1_y = v1[1] - v2[1];
	var edge_1_z = v1[2] - v2[2];

	var edge_2_x = v3[0] - v2[0];
	var edge_2_y = v3[1] - v2[1];
	var edge_2_z = v3[2] - v2[2];

	return this.normalize([
		edge_1_y * edge_2_z - edge_1_z * edge_2_y,
		edge_1_z * edge_2_x - edge_1_x * edge_2_z,
		edge_1_x * edge_2_y - edge_1_y * edge_2_x,
	]);
};

JL.functions.cartesian_to_spherical = function( x, y, z ){
        var spherical = {};
        spherical.rad = Math.sqrt( x*x + y*y + z*z );
        spherical.lat = 90 - Math.acos( y / spherical.rad ) * this.constants.to_degrees;
        spherical.lon =      Math.atan2( x, z )             * this.constants.to_degrees;
        return spherical;
};

JL.functions.spherical_to_cartesian = function( lat, lon, rad ){
        var tmp_rot_x = lat * this.constants.to_radians;
        var tmp_rot_y = lon * this.constants.to_radians;
        var tmp_cos_x = Math.cos( tmp_rot_x );

        var cartesian = {};
        cartesian.x = rad * Math.sin( tmp_rot_y ) * tmp_cos_x;
        cartesian.y = rad * Math.sin( tmp_rot_x );
        cartesian.z = rad * Math.cos( tmp_rot_y ) * tmp_cos_x;

        return cartesian;
};

JL.functions.get_magnitude = function( v ){
	var sum = 0;
	v.forEach(function( x ){ sum += x * x; });
        return Math.sqrt( sum );
};

JL.functions.normalize = function( v ){
        var mag = this.get_magnitude( v );
	return v.map(function( x ){ return ( x / mag ); });
};

JL.functions.random_number = function( low, high ){
	return ( high - low ) * Math.random() + low;
};

JL.functions.random_integer = function( low, high ){
	return Math.floor( this.random_number( low, high + 1 ) );
};

JL.functions.random_element = function( arr ){
	try{ return arr[ Math.floor( Math.random() * arr.length ) ]; } catch(e){}
	return false;
};

JL.functions.random_hex_digit = function(){
	return this.random_element( [0,1,2,3,4,5,6,7,8,9,'a','b','c','d','e','f'] );
};

JL.functions.round = function( val, multiple, p ){
	var multiple = multiple || 1;
	var offset   = 0;
	var fn       = 'round';

	if( p ){
		offset = p.offset || 0;

		switch( p.dir ){
			case 'up'   : fn = 'ceil' ; break;
			case 'down' : fn = 'floor'; break;
		}
	}

	var output = ( Math[ fn ]( ( val - offset ) / multiple ) * multiple ) + offset;

	return output;
};

JL.functions.get_circle_points = function( p ){
	var p = p || {};

	var num_points = p.num_points || 8;
	var radius     = p.radius     || 1;
	var offset     = p.offset || { x : 0, z : 0 };

	var pi_2 = 2 * Math.PI;

	var points = [];

	for( var ang = 0; ang < pi_2; ang += pi_2 / num_points ){
		points.push({
			x : radius * Math.cos( ang ) + offset.x,
			z : radius * Math.sin( ang ) + offset.z,
		});
	}

	points.push( points[ 0 ] );

	return points;
};

JL.functions.get_curl_points = function( p ){
	var x     = p.start.x || 0;
	var z     = p.start.z || 0;
	var rad   = p.rad     || 0.5;
	var loops = p.loops   || 1;
	var steps = p.steps   || 6;

	var angle_start = ( p.angle_start || 0 );
	var angle_end   = ( p.angle_end   || 0 );

	var pts = [];
	var delta_y     = JL.functions.distance( p.start, p.end ) / steps;
	var delta_angle = ( ( 360 * loops + angle_end - angle_start ) / steps ) * this.constants.to_radians;

	var curr_y      = p.start.y;
	var curr_angle  = angle_start * this.constants.to_radians;

	for( var i = 0; i < steps; i++ ){
		pts.push({
			x : x + rad * Math.cos( curr_angle ),
			z : z + rad * Math.sin( curr_angle ),
			y : curr_y,
		});

		curr_y     += delta_y;
		curr_angle += delta_angle;
	}

	var rots = JL.functions.cartesian_to_spherical(
		p.end.x - p.start.x,
		p.end.y - p.start.y,
		p.end.z - p.start.z,
	);
	rots.lat -= 90;

	if( rots.lat ){
		var rad_lat = JL.functions.constants.to_radians * rots.lat;
		var cos_lat = Math.cos( rad_lat );
		var sin_lat = Math.sin( rad_lat );

		pts = pts.map(function( pt ){
			var val_y = pt.y - p.start.y;
			var val_z = pt.z - p.start.z;
			pt.y = ( cos_lat * val_y - sin_lat * val_z ) + p.start.y;
			pt.z = ( sin_lat * val_y + cos_lat * val_z ) + p.start.z;
			return pt;
		});
	}
	if( rots.lon ){
		var rad_lon = JL.functions.constants.to_radians * ( rots.lon + 180 );
		var cos_lon = Math.cos( rad_lon );
		var sin_lon = Math.sin( rad_lon );

		pts = pts.map(function( pt ){
			var val_x = pt.x - p.start.x;
			var val_z = pt.z - p.start.z;
			pt.x = ( cos_lon * val_x + sin_lon * val_z ) + p.start.x;
			pt.z = ( cos_lon * val_z - sin_lon * val_x ) + p.start.z;
			return pt;
		});
	}

	return pts;
};

JL.functions.get_triangle_points = function( point, middle_of_opposite_edge ){
	var vector_to_point = {
		x: point.x - middle_of_opposite_edge.x,
		z: point.z - middle_of_opposite_edge.z,
	};

	var distance_to_point = Math.sqrt( vector_to_point.x ** 2 + vector_to_point.z ** 2 );

	var normalized_vector = {
		x: vector_to_point.x / distance_to_point,
		z: vector_to_point.z / distance_to_point,
	};

	var distance_to_other_points = Math.sqrt(3) * JL.functions.distance( point, middle_of_opposite_edge ) / 2;

	var vector_to_other_points_clockwise = {
		x: middle_of_opposite_edge.x + distance_to_other_points * normalized_vector.z,
		z: middle_of_opposite_edge.z - distance_to_other_points * normalized_vector.x,
	};

	var vector_to_other_points_counterclockwise = {
		x: middle_of_opposite_edge.x - distance_to_other_points * normalized_vector.z,
		z: middle_of_opposite_edge.z + distance_to_other_points * normalized_vector.x,
	};

	return [ vector_to_other_points_clockwise, vector_to_other_points_counterclockwise ];
};

// ---------------------
// | Number Formatting |
// ---------------------

JL.functions.number_to_words = function(num){
	if( num == 0 ) return 'zero';

	var th = [ '','thousand','million', 'billion','trillion' ];
	var dg = [ 'zero','one','two','three','four','five','six','seven','eight','nine' ];
	var tn = [ 'ten','eleven','twelve','thirteen', 'fourteen','fifteen','sixteen','seventeen','eighteen','nineteen' ];
	var tw = [ 'twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety' ];

	var s = num.toString();
	s = s.replace( /[\, ]/g, '' );
	if( s != parseFloat(s) ) return 'not a number';
	var x = s.indexOf('.');
	if( x == -1 ) x = s.length;
	if( x >  15 ) return 'too big';
	var n = s.split('');
	var str = '';
	var sk = 0;
	var str_parts = [];
	for( var i=0; i < x; i++ ){
		if( (x-i) % 3 == 2 ){
			if( n[i] == '1' ){ str_parts.push( tn[Number(n[i+1])] ); i++; sk=1; }
			else if( n[i]!=0 ){ str_parts.push( tw[n[i]-2] ); sk=1; }
		}
		else if( n[i] != 0 ){
			str_parts.push( dg[n[i]] );
			if( (x-i) % 3 == 0 ) str_parts.push( 'hundred' );
			sk=1;
		}

		if( (x-i) % 3 == 1 ){
			if( sk ) str += str_parts.push( th[(x-i-1)/3] );
			sk=0;
		}
	}
	return str_parts.filter( s => s ).join(' ');
};

JL.functions.number_with_commas = function( n ){
	var parts = n.toString().split( '.' );
	parts[ 0 ] = parts[ 0 ].replace( /\B(?=(\d{3})+(?!\d))/g, ',' );
	return parts.join( '.' );
};

JL.functions.get_ordinal_number = function( num ){
        var num_string = String( num );
        var last       = +num_string.slice(-2);
        if( last > 3 && last < 21 ) return num + 'th';
        switch( last % 10 ){
                case 1 : return num + 'st';
                case 2 : return num + 'nd';
                case 3 : return num + 'rd';
                default: return num + 'th';
        }
};

JL.functions.decimal_to_fraction = function( val ){
	var len = val.toString().split('.')[1].length;

	var denom = Math.pow( 10, len );
	var numer = val * denom;

	var divisor = this.greatest_common_divisor( numer, denom );

	numer /= divisor;
	denom /= divisor;

	return { numer, denom };
};

JL.functions.pad = function( num, decimal_place, delimiter ){
	var delimiter = delimiter || '0';
	var num = num + '';
	if( num.length >= decimal_place ) return num;
	return new Array( decimal_place - num.length + 1 ).join( delimiter ) + num;
};

// -------------------------
// | Datetime Manipulation |
// -------------------------

JL.functions.strftime = function( format, dt, p ){
	var self = this;

	var vals = {};

	if( p ){
		if( p.utc ) dt = new Date( dt.getTime() + ( dt.getTimezoneOffset() * 60000 ) );
	}

	var getThursday = function(){
		var target = new Date( dt );
		target.setDate( get_val('date') - ( (get_val('day') + 6) % 7 ) + 3 );
		return target;
	};

	var get_val = function( key ){
		var val = vals[ key ];

		if( val !== undefined ) return val;

		switch( key ){
			case 'day'   : vals[ key ] = dt.getDay()     ; break;
			case 'date'  : vals[ key ] = dt.getDate()    ; break;
			case 'month' : vals[ key ] = dt.getMonth()   ; break;
			case 'year'  : vals[ key ] = dt.getFullYear(); break;
			case 'hour'  : vals[ key ] = dt.getHours()   ; break;
		};

		return vals[ key ];
	};

	var derive_var = function( key ){
		switch( key ){
			case '%a' : return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][get_val('day')];
			case '%A' : return ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][get_val('day')];
			case '%b' : return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][get_val('month')];
			case '%B' : return ['January','February','March','April','May','June','July','August','September','October','November','December'][get_val('month')];
			case '%c' : return dt.toUTCString().replace(',', '');
			case '%C' : return Math.floor(get_val('year') / 100);
			case '%d' : return self.pad(get_val('date'), 2);
			case '%-d':
			case '%e' : return get_val('date');
			case '%F' : return (new Date(dt.getTime() - (dt.getTimezoneOffset() * 60000))).toISOString().slice(0, 10);
			case '%G' : return getThursday().getFullYear();
			case '%g' : return (getThursday().getFullYear() + '').slice(2);
			case '%H' : return self.pad(get_val('hour'), 2);
			case '%-H': return get_val('hour');
			case '%I' : return self.pad((get_val('hour') + 11) % 12 + 1, 2);
			case '%j' : return self.pad([0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334][get_val('month')] + get_val('date') + ((get_val('month') > 1 && ( (get_val('year') % 4 === 0 && get_val('year') % 100 !== 0) || get_val('year') % 400 === 0 )) ? 1 : 0), 3);
			case '%k' : return get_val('hour');
			case '%l' : return (get_val('hour') + 11) % 12 + 1;
			case '%m' : return self.pad(get_val('month') + 1, 2);
			case '%-m':
			case '%n' : return get_val('month') + 1;
			case '%M' : return self.pad(dt.getMinutes(), 2);
			case '%-M': return dt.getMinutes();
			case '%p' : return (get_val('hour') < 12) ? 'AM' : 'PM';
			case '%P' : return (get_val('hour') < 12) ? 'am' : 'pm';
			case '%s' : return Math.round(dt.getTime() / 1000);
			case '%S' : return self.pad(dt.getSeconds(), 2);
			case '%u' : return get_val('day') || 7;
			case '%V' : return (() => {
				var target = getThursday();
				var n1stThu = target.valueOf();
				target.setMonth(0, 1);
				var nJan1 = target.getDay();

				if( nJan1 !== 4 ) target.setMonth(0, 1 + ((4 - nJan1) + 7) % 7);

				return self.pad( 1 + Math.ceil( (n1stThu - target) / 604800000 ), 2 );
			})();
			case '%w' : return get_val('day');
			case '%x' : return dt.toLocaleDateString();
			case '%X' : return dt.toLocaleTimeString();
			case '%y' : return (get_val('year') + '').slice(2);
			case '%Y' : return get_val('year');
			case '%z' : return dt.toTimeString().replace(/.+GMT([+-]\d+).+/, '$1');
			case '%Z' : return dt.toTimeString().replace(/.+\((.+?)\)$/, '$1');
			case '%Zs': return new Intl.DateTimeFormat('default', {
				timeZoneName: 'short',
			}).formatToParts(dt).find((oPart) => oPart.type === 'timeZoneName').value;
		};

		return '';
	};

	return format
		.replace( /%[a-z\-][a-z\-]/gi, function( m ){ return ( derive_var(m) || m ); })
		.replace( /%[a-z\-]/gi       , function( m ){ return ( derive_var(m) || m ); });
};

// ----------------------
// | Color Manipulation |
// ----------------------

JL.functions.random_color = function( p ){
	var p = p || {};

	var rgb = [ 'r', 'g', 'b' ];

	var color = {};
	rgb.forEach(function( x ){ color[ x ] = this.random_integer( 0, 255 ) / 255; }, this );

	if( p.type ){
		switch( p.type ){
			case 'hex': return this.rgb_to_hex( color );
		};
	}

	if( p.obj ) return color;

	if( p.factor !== undefined ) rgb.forEach(function( x ){ color[ x ] *= p.factor; });

	return 'rgb(' + rgb.map( x => color[ x ] ).join(',') + ')';
};

JL.functions.hex_to_rgb = function( hex, is_obj, p ){
	var p = p || {};

	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec( hex );

	if( !result ) return null;

	var r = parseInt( result[ 1 ], 16 ) / 255;
	var g = parseInt( result[ 2 ], 16 ) / 255;
	var b = parseInt( result[ 3 ], 16 ) / 255;

	if( p.factor ){
		r *= p.factor;
		g *= p.factor;
		b *= p.factor;
	}

	return ( is_obj ? { r, g, b } : [ r, g, b ] );
};

JL.functions.rgb_to_hex = function( color ){
	var to_hex = function( val ){
		var hex = val.toString( 16 );
		return ( hex.length == 1 ? "0" + hex : hex );
	}
	return "#" + to_hex( Math.round( 255 * color.r ) ) + to_hex( Math.round( 255 * color.g ) ) + to_hex( Math.round( 255 * color.b ) );
};

JL.functions.gradient_percent = function( raw_percent, colors ){
	var colors = colors || [
		[ 1.0, 0.0, 0.0 ],
		[ 1.0, 0.5, 0.0 ],
		[ 1.0, 1.0, 0.0 ],
		[ 0.0, 1.0, 0.0 ],
		[ 0.0, 0.0, 1.0 ],
	];

	var percent = raw_percent;
	if( percent != 1.0 ) percent %= 1.0;

	var percent_interval = 1.0 / ( colors.length - 1 );

	var curr_interval_min = 0.0;
	var curr_interval_max = percent_interval;

	var index_min = 0;
	var index_max = 1;

	while( !( curr_interval_min <= percent && percent <= curr_interval_max ) ){
		curr_interval_min += percent_interval;
		curr_interval_max += percent_interval;

		index_min++;
		index_max++;
	}

	var color_min = colors[ index_min ];
	var color_max = colors[ index_max ];

	var alpha = ( percent - curr_interval_min ) / ( curr_interval_max - curr_interval_min );

	return color_min.map(function( c, i ){ return JL.functions.interpolate( c, color_max[ i ], alpha ); });
};

JL.functions.rainbow_percent = function( raw_percent, colors ){
	var colors = colors || [
		[ 1.0, 0.0, 0.0 ],
		[ 1.0, 0.5, 0.0 ],
		[ 1.0, 1.0, 0.0 ],
		[ 0.0, 1.0, 0.0 ],
		[ 0.0, 0.0, 1.0 ],
	];

	var color_percentage = 1.0 / colors.length;
	var curr_percent     = raw_percent % 1.0;
	var curr_index       = 0;

	while( curr_percent > color_percentage ){
		curr_percent -= color_percentage;
		curr_index++;
	}

	curr_percent /= color_percentage;

	var curr_color = colors[ curr_index ];
	var next_color = colors[ ( curr_index + 1 ) % colors.length ];

	return curr_color.map(function( c, i ){ return JL.functions.interpolate( c, next_color[ i ], curr_percent ); });
};

// -----------------------
// | Object Manipulation |
// -----------------------

JL.functions.arrays_equal = function( a1, a2 ){
	if( a1.length != a2.length ) return false;
	return a1.every(function( a1_i, i ){ return a1_i == a2[i]; });
};

JL.functions.get_nested_object = function( nested_obj, path ){
	var output = nested_obj;
	path.forEach(function( key ){
		output = output[ key ];
	});
	return output;
};

JL.functions.get_object_with_max_val = function( objects, key ){
	var output = {};
	objects.forEach(function( obj ){
		if( output[ key ] === undefined || obj[ key ] > output[ key ] ){
			output = obj;
		}
	});
	return output;
};

JL.functions.get_object_with_min_val = function( objects, key ){
	var output = {};
	objects.forEach(function( obj ){
		if( output[ key ] === undefined || obj[ key ] < output[ key ] ){
			output = obj;
		}
	});
	return output;
};

JL.functions.get_range_array = function( min, max ){
	var arr = [];
	for( var i = min; i <= max; i++ ){ arr.push( i ); }
	return arr;
};

JL.functions.num_matches_in_array = function( arr, val ){
	return arr.filter(function( x ){ return ( x == val ); }).length;
};

JL.functions.recursive_assign = function( target, source ){
	var get_merged = function( t, s ){
		if( t !== undefined && typeof t === 'object' ){
			Object.keys( s ).forEach(function( s_key ){
				var s_val = s[ s_key ];
				t[ s_key ] = get_merged( t[ s_key ], s_val );
			});
			return t;
		}
		t = s;
		return t;
	};

	return get_merged( target, source );
};

JL.functions.recursive_findAll = function( obj, conditional ){
	var results = [];
	Object.keys( obj ).forEach(function( key ){
		var curr = obj[ key ];
		if( typeof curr === 'object' && curr ){
			if( conditional( curr ) ) results.push( curr );
			else                      results = results.concat( this.recursive_findAll( curr, conditional ) );
		}
	}, this);
	return results;
};

JL.functions.remove_nested_object = function( nested_obj, path ){
	var output = nested_obj;
	path.forEach(function( key, i ){
		if( i < path.length - 1 ) output = output[ key ];
		else                      delete output[   key ];
	});
};

JL.functions.set_nested_object = function( nested_obj, path, val ){
	var output = nested_obj;
	path.forEach(function( key, i ){
		if( i < path.length - 1 ) output = output[ key ];
		else                      output[ key ] = val;
	});
};

JL.functions.shuffle_array = function( arr ){
	var curr_idx = arr.length;
	var rand_idx;

	while( curr_idx > 0 ){
		rand_idx = Math.floor( Math.random() * curr_idx );
		curr_idx--;

		[
			arr[ curr_idx ],
			arr[ rand_idx ]
		] = [
			arr[ rand_idx ],
			arr[ curr_idx ]
		];
	}

	return arr;
};

JL.functions.modify_object_values = function( obj, fn, keys ){
	( keys || Object.keys( obj ) ).forEach(function( k ){
		obj[ k ] = fn( obj[ k ] );
	});
};

JL.functions.filter_duplicates = function( arr ){
	return arr.filter(function( x, i ){ return ( arr.indexOf( x ) == i ); });
};

// ---------------------
// | Loading Functions |
// ---------------------

JL.functions.load_scripts = function( p ){
	var urls = [];
	if( p.urls ) urls = p.urls.slice();
	if( p.url  ) urls.push( p.url );

	var load = function(){
		if( !urls.length ){
			if( p.callback ) p.callback();
			return;
		}

		p._load( urls.shift(), load );
	};
	load();
};

JL.functions.add_css = function( css ){
	$( 'head' ).append( '<style>' + css + '</style>' );
};

JL.functions.load_css = function( p ){
	var self = this;

	this.load_scripts(
		Object.assign({
			_load : function( url, next_step ){
				$.ajax({
					url,
					dataType : 'text',
					success  : function( data ){
						self.add_css( data );
						next_step();
					},
					error    : function( e ){
						console.log( 'Could not load CSS script: ' + url );
						console.log( e );
						if( p.callback ) p.callback();
					},
				});
			}
		}, p )
	);
};

JL.functions.load_font = function( p ){
	this.load_css({
		url      : p.url,
		callback : function(){
			document.fonts.load( '12px "' + p.name + '"' ).then(function(){
				if( p.callback ) p.callback();
			});
		}
	});
};

JL.functions.load_js = function( p ){
	this.load_scripts(
		Object.assign({
			_load : function( url, next_step ){
				$.ajax({
					url,
					dataType : 'script',
					async    : true,
					success  : next_step,
					error    : function( e ){
						console.log( 'Could not load JavaScript script (probably a syntax error): ' + p.url );
						console.log( e );
						if( p.callback ) p.callback();
					},
				});
			}
		}, p )
	);
};

// -----------------------
// | String Manipulation |
// -----------------------

JL.functions.format_string = function( str, p ){
	var output = str.slice();
	Object.keys( p ).forEach(function( key ){
		output = output.replace( new RegExp( '{' + key + '}', 'g' ), p[ key ] );
	});
	return output;
};

JL.functions.num_diff_chars = function( str_1, str_2 ){
	var num_diff = Math.abs( str_1.length - str_2.length );

	for( var i = 0; i < Math.min( str_1.length, str_2.length ); i++ ){
		if( str_1[ i ] != str_2[ i ] ) num_diff++;
	}

	return num_diff;
};

JL.functions.parse_csv_text = function( str, p ){
	var p = p || {};

	var lines = str.trim().split('\n');

	var num_headers = lines[ 0 ].split(',').length;

	var output = { entries : [] };

	if( !p.no_headers ) output.headers = lines.shift().split(',');

	for( var line of lines ){
		var entry         = [];
		var col_values    = [];
		var col_value     = '';
		var within_quotes = false;

		for( var char of line ){
			if( char === '"' ){
				within_quotes = !within_quotes;
			}
			else if( char === ',' && !within_quotes ){
				col_values.push( col_value.trim() );
				col_value = '';
			}
			else{
				col_value += char;
			}
		}

		col_values.push( col_value.trim() );

		for( var i = 0; i < num_headers; i++ ){
			if( !isNaN( col_values[i] ) ) col_values[i] = Number( col_values[i] );
			entry.push( col_values[i] );
		}

		output.entries.push( entry );
	}

	return output;
};

JL.functions.get_plain_text_table = function( p ){
	var self = this;

	var output = '';

	var padding = p.padding || 0;

	var columns = p.entries[ 0 ].map(function( c, i ){
		var width = ( p.headers ? p.headers[ i ].width : undefined );

		if( width === undefined ) width = Math.max( ...p.entries.map(function( entry ){ return Math.max( ...String( entry[ i ] ).split('\n').map( s => s.length ) ); }) );
		if( p.headers ){
			width = Math.max( width, String( p.headers[ i ].name ).length );
			if( p.headers[ i ].max_width ) width = Math.min( p.headers[ i ].max_width, width );
		}

		return { width };
	});

	var single_break = '+' + columns.map(function( c ){ return '-'.repeat( c.width + 2 * padding ); }).join('+') + '+';
	var double_break = '+' + columns.map(function( c ){ return '='.repeat( c.width + 2 * padding ); }).join('+') + '+\n';

	var entries = [];

	p.entries.forEach(function( entry, entry_idx ){
		var sub_entries = [];
		entry.forEach(function( original_val, col_idx ){
			var col = columns[ col_idx ];

			var val = String( original_val );

			var sub_entries_idx = 0;
			while( val.length ){
				if( !sub_entries[ sub_entries_idx ] ) sub_entries.push( Array( columns.length ).fill('') );

				var this_chunk = val.slice( 0, col.width );

				if( this_chunk.includes('\n') ){
					var newline_idx = this_chunk.indexOf('\n');
					sub_entries[ sub_entries_idx ][ col_idx ] = this_chunk.slice( 0, newline_idx );
					val = val.slice( newline_idx + 1 );
				}
				else{
					sub_entries[ sub_entries_idx ][ col_idx ] = this_chunk;
					val = val.slice( col.width );
				}

				sub_entries_idx++;
			}
		});

		entries = entries.concat( sub_entries );

		if( !p.no_line_breaks || entry_idx == p.entries.length - 1 ) entries.push( single_break );
	});

	var pad_val = function( val, col, header ){
		if( header.align == 'left' ) val = val.split('').reverse().join('');

		val = self.pad( val, col.width, ' ' );

		if( header.align == 'left' ) val = val.split('').reverse().join('');

		return val;
	};

	if( p.headers ){
		var header_line = '|' +
			p.headers.map(function( header, col_idx ){
				if( p.align && !header.align ) header.align = p.align;

				var col = columns[ col_idx ];

				return ' '.repeat( padding ) + pad_val( header.name, col, header ) + ' '.repeat( padding );
			}).join('|') +
		'|';

		output += double_break + header_line + '\n';
	}

	output += double_break + entries.map(function( entry ){
		if( typeof entry === 'string' || entry instanceof String ) return entry;
		return '|' + 
			entry.map(function( val, col_idx ){
				var col = columns[ col_idx ];

				return ' '.repeat( padding ) + pad_val( val, col, ( p.headers ? p.headers[ col_idx ] : { align : p.align } ) ) + ' '.repeat( padding );
			}).join('|') +
		'|';
	}).join('\n');

	return output;
};

JL.functions.remove_punctuation = function( str ){
	return String( str ).replace( /[.,\/#!$%\^&\*;:{}=\-_`~()\']/g, "" );
};

JL.functions.remove_whitespace = function( str ){
	return String( str ).replace( /\s+/g, "" );
};

JL.functions.lstrip = function( str, substr ){
	if( substr === undefined ) return str.trimStart();
	
	while( str.startsWith( substr ) ) str = str.slice( substr.length );

	return str;
};

JL.functions.rstrip = function( str, substr ){
	if( substr === undefined ) return str.trimEnd();
	
	while( str.endsWith( substr ) ) str = str.slice( 0, str.length - substr.length );

	return str;
};

JL.functions.str_to_id = function( str ){
	return this.remove_whitespace( this.remove_punctuation( str ).split(' ').join('_') ).toLowerCase();
};

JL.functions.strip = function( str, substr ){
	if( substr === undefined ) return str.trim();
	
	while( str.startsWith( substr ) ) str = str.slice( substr.length );
	while( str.endsWith(   substr ) ) str = str.slice( 0, str.length - substr.length );

	return str;
};

JL.functions.title_case = function( str ){
        return String( str ).toLowerCase().split(' ').map( x => x[0].toUpperCase() + x.slice(1) ).join(' ');
};

// ----------------------
// | Image Manipulation |
// ----------------------

JL.functions.get_image_pixels = function( img, p ){
	var p = p || {};

	var canvas = document.createElement( 'canvas' );

	canvas.width  = img.width;
	canvas.height = img.height;

	var ctx = canvas.getContext( '2d' );

	ctx.drawImage( img, 0, 0 );

	var output = ctx.getImageData( 0, 0, img.width, img.height ).data;

	canvas.remove();

	if( p.format ){
		switch( p.format ){
			case 'arr':
				var tmp_output = [];
				var pixel_size = p.pixel_size || 4;
				var height = pixel_size * img.height;
				var width  = pixel_size * img.width ;
				for        ( var j = 0; j < height; j += pixel_size ){
					var row = [];
					for( var i = 0; i < width ; i += pixel_size ){
						var entry = [];
						for( var o_i = 0; o_i < pixel_size; o_i++ ){
							entry.push( output[ j * img.width + i + o_i ] );
						}
						row.push( entry );
					}
					tmp_output.push( row );
				}
				output = tmp_output;
				break;
		}
	}

	return output;
};

// --------------------
// | Units Formatting |
// --------------------

JL.functions.hr_order_of_mag = function( b, params ){
	var bytes  = b;
	var units  = '';
	var orders = [ 'k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y' ];
	while( bytes >= 1000 && orders.length ){
		bytes /= ( params.size || 1000 );
		units = orders.shift();
	}

	if( params ){
		if( params.decimal_places ) bytes = bytes.toFixed( params.decimal_places );
		if( params.sig_figs       ) bytes = bytes.toPrecision( params.sig_figs );
		if( params.integer        ) bytes = parseInt( bytes );
	}

	return bytes + units;
};

JL.functions.hr_bytes = function( b, params ){
	return this.hr_order_of_mag( b, params ) + 'B';
};

JL.functions.time_abbr = function( b, params ){
	var units = 's';
	var sign  = ( b < 0 ? '-' : '' );
	var b     = Math.abs( b );

	var curr_val    = b;
	var curr_factor = 1;
	if( curr_val >= 60 ){
		curr_val /= 60, curr_factor /= 60, units = 'm';
		if( curr_val >= 60 ){
			curr_val /= 60, curr_factor /= 60, units = 'h';
			if( curr_val >= 24 ){
				curr_val /= 24, curr_factor /= 24, units = 'd';
				if( curr_val >= 365.25 ){
					curr_val /= 365, curr_factor /= 365, units = 'y';
				}
			}
		}
	}

	var result_val = parseInt( curr_val );

	var remainder_val = b - result_val / curr_factor;

	return sign + result_val + units + ( remainder_val > 0 ? ' ' + this.time_abbr( remainder_val, params ): '' );
};

// ------------------
// | User Interface |
// ------------------

JL.functions.copy_to_clipboard = function( text ){
	var tmp_ele = document.createElement( 'textarea' );
	tmp_ele.value = text;
	document.body.appendChild( tmp_ele );
	tmp_ele.select();
	document.execCommand( 'copy' );
	document.body.removeChild( tmp_ele );
};

JL.functions.init_fullscreen = function(){
	if( !this._fullscreen ){
		this._fullscreen = {};
		this._fullscreen.window   = window.document;
		this._fullscreen.document = this._fullscreen.window.documentElement;
		this._fullscreen.request  = this._fullscreen.document.requestFullscreen || this._fullscreen.document.mozRequestFullScreen || this._fullscreen.document.webkitRequestFullScreen || this._fullscreen.document.msRequestFullscreen;
		this._fullscreen.exit     = this._fullscreen.window.exitFullscreen || this._fullscreen.window.mozCancelFullScreen || this._fullscreen.window.webkitExitFullscreen || this._fullscreen.window.msExitFullscreen;
	}
};

JL.functions.enter_fullscreen = function( p ){
	this.init_fullscreen();
        this._fullscreen.request.call( this._fullscreen.document, p );
};

JL.functions.exit_fullscreen = function( p ){
	this.init_fullscreen();
        this._fullscreen.exit.call( this._fullscreen.window, p );
};

JL.functions.toggle_fullscreen = function(){
	this.init_fullscreen();
        ( !this._fullscreen.window.fullscreenElement && !this._fullscreen.window.mozFullScreenElement && !this._fullscreen.window.webkitFullscreenElement && !this._fullscreen.window.msFullscreenElement ?
                this.enter_fullscreen() :
                this.exit_fullscreen()
        );
};

// ---------------------------
// | Scientific Calculations |
// ---------------------------

JL.functions.convert_temperature = function( unit_s, unit_e, val, decimal_places ){
	var output;
	switch( unit_s.toUpperCase() ){
		case 'F':
			switch( unit_e.toUpperCase() ){
				case 'C' : output =          ( ( val - 32 ) * 5 / 9 ); break;
				case 'K' : output = 273.15 + ( ( val - 32 ) * 5 / 9 ); break;
			}
			break;
		case 'C':
			switch( unit_e.toUpperCase() ){
				case 'F' : output = ( 32 + ( val * 9 / 5 ) ); break;
				case 'K' : output = ( val + 273.15 ); break;
			}
			break;
		case 'K':
			switch( unit_e.toUpperCase() ){
				case 'F' : output = ( 32 + ( val - 273.15 ) * 9 / 5 ); break;
				case 'C' : output =        ( val - 273.15 ); break;
			}
			break;
	}
	if( decimal_places !== undefined ) output = output.toFixed( decimal_places );
        return output;
};

JL.functions.deg_to_cardinal_dir = function( deg ){
	var d = deg;
	while( d < 0 ) d += 360;
	d %= 360;
	if( d <   11.25 ) return 'N';
	if( d <   33.75 ) return 'NNE';
	if( d <   56.25 ) return 'NE';
	if( d <   78.75 ) return 'ENE';
	if( d <  101.25 ) return 'E';
	if( d <  123.75 ) return 'ESE';
	if( d <  146.25 ) return 'SE';
	if( d <  168.75 ) return 'SSE';
	if( d <  191.25 ) return 'S';
	if( d <  213.75 ) return 'SSW';
	if( d <  236.25 ) return 'SW';
	if( d <  258.75 ) return 'WSW';
	if( d <  281.25 ) return 'W';
	if( d <  303.75 ) return 'WNW';
	if( d <  326.25 ) return 'NW';
	if( d <  348.75 ) return 'NNW';
	if( d <= 360    ) return 'N';
	return '???';
};

// ---------------------------
// | Variable Identification |
// ---------------------------

JL.functions.is_str = function( v ){
	return ( typeof v === 'string' || v instanceof String );
};

JL.functions.is_array = function( v ){
	return ( v instanceof Array );
};

JL.functions.is_object = function( v ){
	return (
		typeof v === 'object' &&
		!this.is_array( v )   &&
		v !== null
	);
};

