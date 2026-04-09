/* global moondreamData, wp */
( function () {
	'use strict';

	var data = window.moondreamData || {};
	var strings = data.strings || {};

	// -------------------------------------------------------------------------
	// Grid view — filter toggle
	// -------------------------------------------------------------------------

	function injectGridFilterButton( toolbar ) {
		if ( toolbar.querySelector( '.moondream-filter-no-alt' ) ) {
			return;
		}

		var primary = toolbar.querySelector( '.media-toolbar-primary' );
		if ( ! primary ) {
			return;
		}

		var btn = document.createElement( 'button' );
		btn.type = 'button';
		btn.className = 'button media-button moondream-filter-no-alt';
		btn.textContent = strings.filter_no_alt || 'Missing alt text';

		btn.addEventListener( 'click', function () {
			var isActive = btn.classList.toggle( 'is-active' );

			if ( isActive ) {
				btn.textContent = strings.filter_show_all || 'Show all images';

				var formData = new FormData();
				formData.append( 'action', 'moondream_get_no_alt_ids' );
				formData.append( 'nonce', data.nonce );

				fetch( data.ajaxurl, { method: 'POST', body: formData } )
					.then( function ( r ) { return r.json(); } )
					.then( function ( json ) {
						if ( ! json.success ) {
							return;
						}
						// Use [0] when empty so post__in returns zero results.
						var ids = json.data.ids.length ? json.data.ids : [ 0 ];
						try {
							wp.media.frame.state().get( 'library' ).props.set( { post__in: ids } );
						} catch ( e ) {}
					} )
					.catch( function () {} );
			} else {
				btn.textContent = strings.filter_no_alt || 'Missing alt text';
				try {
					wp.media.frame.state().get( 'library' ).props.unset( 'post__in' );
				} catch ( e ) {}
			}
		} );

		primary.insertBefore( btn, primary.firstChild );
	}

	// -------------------------------------------------------------------------
	// List view — filter toggle
	// -------------------------------------------------------------------------

	function initListFilterButton() {
		var filterSubmit = document.getElementById( 'post-query-submit' );
		if ( ! filterSubmit ) {
			return;
		}

		var params = new URLSearchParams( window.location.search );
		var isActive = params.has( 'moondream_no_alt' );

		var btn = document.createElement( 'button' );
		btn.type = 'button';
		btn.className = 'button moondream-filter-no-alt' + ( isActive ? ' is-active' : '' );
		btn.textContent = isActive
			? ( strings.filter_show_all || 'Show all images' )
			: ( strings.filter_no_alt || 'Missing alt text' );

		btn.addEventListener( 'click', function () {
			var url = new URL( window.location.href );
			if ( url.searchParams.has( 'moondream_no_alt' ) ) {
				url.searchParams.delete( 'moondream_no_alt' );
			} else {
				url.searchParams.set( 'moondream_no_alt', '1' );
			}
			window.location.href = url.toString();
		} );

		filterSubmit.insertAdjacentElement( 'afterend', btn );
	}

	// -------------------------------------------------------------------------
	// Bootstrap
	// -------------------------------------------------------------------------

	document.addEventListener( 'DOMContentLoaded', function () {
		var toolbar = document.querySelector( '.media-toolbar' );
		if ( toolbar ) {
			injectGridFilterButton( toolbar );
		} else {
			var bodyObserver = new MutationObserver( function () {
				var t = document.querySelector( '.media-toolbar' );
				if ( t ) {
					bodyObserver.disconnect();
					injectGridFilterButton( t );
				}
			} );
			bodyObserver.observe( document.body, { childList: true, subtree: true } );
		}

		initListFilterButton();
	} );
} )();
