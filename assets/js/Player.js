SONG.player = { playlist : [] };

SONG.player.open = function( filename, p ){
	var p = p || {};

	var path = './assets/data/content/' + filename + '.mp3';

	if( p.song ){
		$( '#music-player .info' ).html(
			p.song.artist + ' - ' + p.song.song + ' <span class="year">' + p.song.year + '</span>'
		);
		$( '#music-player .info' ).show();
	}
	else{ $( '#music-player .info' ).hide(); }

	[ 'next', 'prev' ].forEach(function( k ){	
		var key = k + '_song';
		if( p[ key ] ) $( '#music-player .' + k + '-song' ).show();
		else           $( '#music-player .' + k + '-song' ).hide();
	}, this);

	$( '#music-player .contents' ).html(
		'<audio controls ' + 
			( p.loop ? 'loop' : '' ) + ' ' + 
			( p.onended ? 'onended="' + p.onended + '"' : '' ) + 
			' autoplay src="' + path + '" />'
	);
	$( '#music-player' ).show();
};

SONG.player.close = function( path ){
	$( '#music-player .contents' ).html('');
	$( '#music-player' ).hide();
};

SONG.player.set_playlist = function( songs ){
	this.playlist = JL.functions.shuffle_array(
		songs.slice().filter(function( song ){ return song.local; })
	);
};

SONG.player.play_playlist = function(){
	this.playlist = JL.functions.shuffle_array( this.playlist );
	this.playlist_idx = 0;
	this.play_playlist_song();
};

SONG.player.play_playlist_song = function(){
	var song = this.playlist[ this.playlist_idx ];
	this.open( song.local, {
		song,
		no_loop : true,
		onended : 'SONG.player.next_playlist_song();',
		prev_song : function(){ SONG.player.next_playlist_song( -1 ); },
		next_song : function(){ SONG.player.next_playlist_song(  1 ); },
	} );
};

SONG.player.next_playlist_song = function( offset ){
	this.playlist_idx += ( offset || 1 );
	while( this.playlist_idx < 0 ) this.playlist_idx += this.playlist.length;
	this.playlist_idx %= this.playlist.length;
	this.play_playlist_song();
};