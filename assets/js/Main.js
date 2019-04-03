var SONG = {};
SONG.SORT = {
	songs   : {asc:  true, curr: 0, options: ['SONG', 'ARTIST', 'YEAR', 'STARS']},
	artists : {asc: false, curr: 0, options: ['# SONGS', 'NAME']},
	years   : {asc: false, curr: 0, options: ['# SONGS', 'YEAR']}
};

var LIMIT = {
	artists : 20,
	songs   : 50,
	years   : 20
};

function load_data( callback ){
	$.ajax({
		url: './assets/data/songs.json',
		dataType: 'json',
		success: function(data){
			var now = new Date();
			
			var doy = now.getDay();
			var mth = now.getMonth();
			
			var friday_condition    = ( doy ==  5 );
			var halloween_condition = ( mth ==  9 );
			var christmas_condition = ( mth >= 10 );
			var nfl_condition       = ( [0,1,4].indexOf( doy ) != -1 && [7,8,9,10,11,0,1].indexOf( mth ) != -1 );
			var ncaaf_condition     = ( [5,6].indexOf( doy ) != -1 && [7,8,9,10,11,0].indexOf( mth ) != -1 );
			
			data = data.filter(function(a){
				return a.artist ||
					(a.playlist == "Friday" && friday_condition) ||
					(a.playlist == "Christmas" && christmas_condition) ||
					(a.playlist == "Halloween" && halloween_condition) ||
					( ['Badgers'].indexOf( a.playlist ) != -1 && ncaaf_condition ) || 
					( ['Steelers', 'Packers'].indexOf( a.playlist ) != -1 && nfl_condition ); 
			});
			
			data.forEach(function(a){
				if(!a.artist && a.playlist) a.artist = a.playlist;
			});
			
			data.sort(function(a, b){
				var a_l = a.artist.toLowerCase();
				var b_l = b.artist.toLowerCase();
				return (a_l > b_l ? 1 : -1);
			});
			SONG.data = data;
			data.sort(function(a, b){
				return (a.songs.length < b.songs.length ? 1 : -1);
			});
			
			SONG.ALL_SONGS = SONG.data.map(function(a){ return a.songs.map(function(b){
				b.artist = a.artist;
				b.playlist = a.playlist;
				if(a.playlist){
					var song_parts = b.song.split(' - ');
					b.artist_only = song_parts[0];
					b.song_only = song_parts[1];
				}
				return b;
			}); });
			
			SONG.ALL_SONGS = [].concat.apply([], SONG.ALL_SONGS).sort(function(a, b){
				var c = a.song;
				var d = b.song;
				if(a.playlist) c = a.song.split(' - ')[1];
				if(b.playlist) d = b.song.split(' - ')[1];
				return (c > d ? 1 : -1);
			});
			
			SONG.ALL_YEARS = {};
			SONG.ALL_SONGS.forEach(function(song){
				if(!SONG.ALL_YEARS[song.year]) SONG.ALL_YEARS[song.year] = [];
				SONG.ALL_YEARS[song.year].push(song);
			});
			SONG.ALL_YEARS = Object.keys(SONG.ALL_YEARS).map(function(key){ return {year: key, songs: SONG.ALL_YEARS[key]}; }).sort(function(a,b){
				return a.songs.length < b.songs.length;
			});
			
			if( callback ) callback();
		}
	});
};